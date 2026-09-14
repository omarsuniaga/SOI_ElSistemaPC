# SPEC: Clasificación de Asistencia (Fix: No Marcar "Sin Asistencia" si Hay Emergente)

## Código interno del cambio
`asistencia-classification`

## Estado: PROPUESTA (Aprobación Requerida)

---

# 1. Descripción de Capacidad

**Problema**: Cuando una sesión tiene `emergente_id IS NOT NULL` (está justificada por una actividad institucional), pero la tabla `asistencias` tiene 0 filas, el pipeline `getSesionesPorRango()` y la vista `vw_asistencias_consolidada` marcan erróneamente la sesión como "sin asistencias".

**Solución**: Modificar la lógica de clasificación para:
1. Detectar `emergente_id IS NOT NULL` ANTES de contar asistencias.
2. Si emergente_id existe, marcar sesión como "justificada" sin requerir registros en tabla `asistencias`.
3. Respetar `periodo_excepciones` (rango de fechas con reglas especiales de asistencia).

---

# 2. Cambios en Lógica de Consulta

### Cambio A: `getSesionesPorRango()` en `asistenciasSupabase.js`

**Antes** (líneas 54-142):
```javascript
// Query obtiene sesiones + asistencias, pero ignora emergente_id
const { data: sesiones, error } = await supabase
  .from('sesiones_clase')
  .select(`
    id, clase_id, maestro_id, fecha, estado,
    asistencias (id, estado)
  `)
  .eq('maestro_id', maestroId)
  .gte('fecha', fechaInicio)
  .lte('fecha', fechaFin);

// Conteo que falla si emergente_id IS NOT NULL pero asistencias es []
totalRegistros: ayudas.length  // 0 → marca como "sin asistencia"
```

**Después** (delta):
```javascript
// Query expande para incluir emergente_id y chequea confirmaciones
const { data: sesiones, error } = await supabase
  .from('sesiones_clase')
  .select(`
    id, clase_id, maestro_id, fecha, estado, emergente_id,
    asistencias (id, estado),
    confirmaciones_emergentes (respuesta, estado_validacion)
  `)
  .eq('maestro_id', maestroId)
  .gte('fecha', fechaInicio)
  .lte('fecha', fechaFin);

// En transformación de datos:
// Si emergente_id IS NOT NULL, marcar como "justificada_por_emergente" 
// sin contar tabla asistencias
sesiones.forEach((s) => {
  if (s.emergente_id) {
    s.es_justificada_por_emergente = true;
    s.totalRegistros = s.asistencias.length; // Puede ser 0, pero se ignora
    s.totalJustificados = s.asistencias.filter(a => a.estado === 'justificado').length;
    s.estado_clasificacion = 'justificada_por_actividad_institucional';
  } else {
    // Lógica estándar: contar asistencias
    s.totalRegistros = s.asistencias.length;
    s.totalJustificados = s.asistencias.filter(a => a.estado === 'justificado').length;
    if (s.totalRegistros === 0) {
      s.estado_clasificacion = 'sin_asistencias_registradas';
    }
    // ... demás lógica
  }
});
```

### Cambio B: Vista `vw_asistencias_consolidada`

**Antes** (schema_reference.sql, líneas 7332-7369):
```sql
CREATE OR REPLACE VIEW vw_asistencias_consolidada AS
SELECT
  sc.id,
  sc.maestro_id,
  sc.fecha,
  sc.estado,
  COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as total_presentes,
  COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as total_ausentes,
  COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as total_justificados,
  COUNT(a.id) as total_registros,
  -- FALTA: si total_registros = 0 pero emergente_id IS NOT NULL, se reporta "sin asistencias"
  ...
```

**Después** (delta):
```sql
CREATE OR REPLACE VIEW vw_asistencias_consolidada AS
SELECT
  sc.id,
  sc.maestro_id,
  sc.fecha,
  sc.estado,
  sc.emergente_id,
  COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as total_presentes,
  COUNT(CASE WHEN a.estado = 'ausente' THEN 1 END) as total_ausentes,
  COUNT(CASE WHEN a.estado = 'justificado' THEN 1 END) as total_justificados,
  COUNT(a.id) as total_registros,
  CASE 
    WHEN sc.emergente_id IS NOT NULL THEN true
    ELSE false
  END as es_justificada_por_emergente,
  -- Computar si tiene confirmación "sí"
  CASE 
    WHEN sc.emergente_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM confirmaciones_emergentes ce
        WHERE ce.actividad_id = sc.emergente_id
          AND ce.maestro_id = sc.maestro_id
          AND ce.respuesta = 'si'
          AND ce.estado_validacion = 'validado'
      )
    THEN true
    ELSE false
  END as tiene_confirmacion_si,
  ...
FROM sesiones_clase sc
LEFT JOIN asistencias a ON sc.id = a.sesion_clase_id
...
GROUP BY sc.id, sc.maestro_id, sc.fecha, sc.estado, sc.emergente_id
```

### Cambio C: Trigger `registros_pendientes`

**Antes** (lógica no documentada aquí, pero implícita):
- Si `COUNT(asistencias) = 0` → marcar sesión como "sin asistencias" → crear registro pendiente tipo 'asistencia_pendiente'.

**Después** (delta):
```sql
-- En trigger o función que decide si una sesión es "pendiente":
IF sesion.emergente_id IS NOT NULL THEN
  -- Check si hay confirmación 'si'
  SELECT COUNT(*) INTO conf_si_count 
  FROM confirmaciones_emergentes
  WHERE actividad_id = sesion.emergente_id
    AND maestro_id = sesion.maestro_id
    AND respuesta = 'si'
    AND estado_validacion IN ('validado', 'pendiente');
  
  IF conf_si_count > 0 THEN
    -- Hay confirmación: sesión está justificada
    -- NO crear registro 'asistencia_pendiente'
  ELSE
    -- Sin confirmación: esperar respuesta del maestro
    -- Crear registro tipo 'confirmacion_actividad_requerida' (si no existe)
  END IF;
ELSE
  -- Lógica estándar: si COUNT(asistencias) = 0, marcar pendiente
  INSERT INTO registros_pendientes (tipo, maestro_id, sesion_clase_id, ...)
  VALUES ('asistencia_pendiente', ...) ON CONFLICT DO NOTHING;
END IF;
```

---

# 3. Requisitos Funcionales

### R1: No Marcar "Sin Asistencia" si `emergente_id IS NOT NULL`
- **Qué**: Una sesión con `emergente_id IS NOT NULL` nunca se reporta como "sin asistencias", independientemente de si `asistencias` tiene filas.
- **Efecto**: El reporte ACM/DIR muestra sesión como "Justificada por Actividad Institucional" en lugar de "Sin Asistencia".

### R2: Clasificación Respeta Confirmación del Maestro
- **Si confirmación='si'**: Sesión se reporta como "justificada" sin requerir asistencias.
- **Si confirmación='no'**: Sesión se revierte a `emergente_id=NULL` y se marca como "sin asistencias" (requiere registro).
- **Si confirmación='no_aplica'**: Sesión se reporta como "no aplica" (exenta, no es pendiente).
- **Si confirmación='no_se'**: Sesión se marca como "en validación ACM".
- **Si sin confirmación**: Sesión se marca como "pendiente confirmación".

### R3: Respetar `periodo_excepciones`
- **Qué**: Si la fecha cae en rango `periodo_excepciones` con regla especial, la clasificación se ajusta.
- **Ejemplo**: Si hay "Cierre Académico" del 1-10 de septiembre, sesiones en ese rango pueden ignorar emergente_id y usar una lógica diferente.
- **Implementación**: Consultar tabla `periodo_excepciones` (si existe) y aplicar regla en lógica de clasificación.

### R4: Idempotencia de Clasificación
- **Qué**: Re-calcular `getSesionesPorRango()` para el mismo rango y maestro produce el mismo resultado.
- **Efecto**: No hay fluctuaciones de estado por re-ejecuciones.

---

# 4. Escenarios de Aceptación

### ESCENARIO 1: Sesión Justificada no se Marca "Sin Asistencia"
```gherkin
Given una sesión:
  - maestro_id = M1, clase_id = Orquesta, fecha = 2026-09-15, estado = 'registrada'
  - emergente_id = <id Concierto>
  - asistencias = [] (0 filas porque se auto-justificó globalmente)
When se ejecuta getSesionesPorRango(M1, 2026-09-15, 2026-09-15)
Then resultado incluye sesión con:
  - es_justificada_por_emergente = true
  - totalRegistros = 0 (pero se ignora)
  - total_justificados = 0 (pero se ignora porque es emergente)
  - estado_clasificacion = 'justificada_por_actividad_institucional'
  - NO aparece como "sin_asistencias_registradas"
And en reporte ACM, sesión se lista bajo "Justificadas por Actividad", no bajo "Pendientes"
```

### ESCENARIO 2: Sesión Justificada Pero Maestro Confirma "No" → Se Revierte a Pendiente
```gherkin
Given sesión con emergente_id = <Concierto> y asistencias = []
When M1 confirma "No, no aplica la actividad a mi grupo"
  And fn_confirmar_actividad_emergente(..., respuesta='no')
Then sesión se actualiza:
  - emergente_id = NULL (o SET NULL según política)
  - estado = 'borrador'
  - Se crea registro en registros_pendientes tipo 'asistencia_pendiente'
And reporte ACM ahora muestra: "Sesión sin asistencias - requiere registro de M1"
And M1 debe registrar asistencias manualmente para la clase
```

### ESCENARIO 3: Sesión Justificada Pero Maestro Confirma "No Sé" → Espera Validación ACM
```gherkin
Given sesión con emergente_id = <Actividad>
When M1 confirma "No sé si aplica"
  And fn_confirmar_actividad_emergente(..., respuesta='no_se')
Then confirmación_emergente registra:
  - respuesta = 'no_se'
  - estado_validacion = 'pendiente'
And sesión mantiene emergente_id (no se revierte)
And en getSesionesPorRango:
  - estado_clasificacion = 'pendiente_validacion_acm'
And reporte ACM muestra: "Sesión en validación - requiere decisión de coordinador"
```

### ESCENARIO 4: Sesión Justificada con Confirmación "No Aplica" → No es Pendiente
```gherkin
Given sesión con emergente_id = <Actividad> y asistencias = []
When M1 confirma "No aplica"
  And fn_confirmar_actividad_emergente(..., respuesta='no_aplica')
Then confirmación_emergente registra:
  - respuesta = 'no_aplica'
  - estado_validacion = 'validado'
And sesión mantiene emergente_id (auditoría)
And en getSesionesPorRango:
  - estado_clasificacion = 'actividad_no_aplicable'
  - totalRegistros = 0 (pero se ignora)
And reporte ACM muestra: "Sesión exenta (actividad no aplicó)"
And NO se crea registro en registros_pendientes
```

### ESCENARIO 5: Período de Excepción Invalida Emergente
```gherkin
Given una sesión con emergente_id = <Concierto> en fecha 2026-09-05
  And existe rango en periodo_excepciones del 2026-09-01 al 2026-09-10 con regla='cierre_academico'
When se ejecuta getSesionesPorRango(..., incluir_periodo_excepciones=true)
Then aunque emergente_id IS NOT NULL:
  - Se aplica regla del período de excepción (ej. todas las sesiones se ignoran)
  - estado_clasificacion = 'excepcion_periodo'
  - Se reporta como "Fuera de período evaluable" no como "Justificada"
```

### ESCENARIO 6: Query Repetida Produce Mismo Resultado (Idempotencia)
```gherkin
Given una sesión M1 + 2026-09-15 con emergente_id
When se ejecuta getSesionesPorRango(M1, 2026-09-15, 2026-09-15) en tiempo T1
  And se ejecuta nuevamente en tiempo T2 (sin cambios en datos)
Then ambas ejecuciones retornan:
  - idéntico estado_clasificacion
  - idénticos totales
  - idénticos flags es_justificada_por_emergente
And reporte no fluctúa entre "sin asistencias" y "justificada"
```

---

# 5. Reglas de Clasificación

### Precedencia de Estados (si aplican múltiples condiciones)

1. **Excepción de Período** (más específico): Si fecha cae en `periodo_excepciones`, aplica regla del período.
2. **Emergente + Confirmación "No"**: Sesión se revierte; se marca como "sin asistencias".
3. **Emergente + Confirmación "No Aplica"**: Se marca como "actividad no aplicable" (exenta).
4. **Emergente + Confirmación "No Sé"**: Se marca como "pendiente validación ACM".
5. **Emergente + Confirmación "Sí"**: Se marca como "justificada por actividad institucional".
6. **Emergente + Sin Confirmación**: Se marca como "pendiente confirmación de maestro".
7. **Emergente_id IS NULL + Asistencias Registradas**: Lógica estándar (presentes/ausentes/justificados).
8. **Emergente_id IS NULL + Asistencias = 0**: Se marca como "sin asistencias".

### Estados Finales Posibles
- `justificada_por_actividad_institucional`
- `pendiente_confirmacion_actividad`
- `pendiente_validacion_acm`
- `actividad_no_aplicable`
- `sin_asistencias_registradas`
- `presentes_registrados` / `ausentes_registrados` / etc. (estándar)
- `excepcion_periodo`

---

# 6. Validación de Datos

### V1: `emergente_id` Válido
- Si `sesion.emergente_id` existe, debe referencia a fila válida en `sesiones_clase` (misma sesión raíz) con `clase_id IS NULL`.
- Si referencia está rota, lógica de clasificación trata como si fuera NULL.

### V2: Confirmaciones Válidas
- Si se consulta confirmación_emergente, debe estar en estado ('pendiente', 'validado', 'rechazado').
- Solo confirmaciones 'validado' cuentan para clasificación final.

### V3: Período de Excepción Válido
- Si aplica período, sus fechas y reglas deben ser coherentes con lógica de negocio.

---

# 7. No Alcances

- Modificación retroactiva de asistencias pasadas (data archaeological).
- Cambio del algoritmo de cálculo de "presentes/ausentes" (fuera del scope).
- Lógica de "tarde" o "salida temprana" en asistencias (mantenido como está).

---

# 8. Dependencias

- Tabla `sesiones_clase` (ya existe; se necesita `emergente_id`).
- Tabla `confirmaciones_emergentes` (SPEC-01; proporciona respuestas del maestro).
- Tabla `periodo_excepciones` (ya existe; usado para regla de excepción).
- Función `getSesionesPorRango()` (en `asistenciasSupabase.js`; se modifica).
- Vista `vw_asistencias_consolidada` (en schema; se modifica).
- Trigger en `registros_pendientes` (se modifica lógica de insert).
