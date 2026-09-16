# SPEC: Clasificación de Estados del Día (9 Estados Pedagógicos)

## Código interno del cambio
`day-state-classification`

## Estado: PROPUESTA (Aprobación Requerida)

---

# 1. Descripción de Capacidad

Para cada tupla `(maestro_id, fecha)`, el sistema debe computar un **estado pedagógico único** que resume si el maestro ha registrado/justificado todas sus sesiones de clase ese día.

El estado se usa para:
- **Dashboard pedagógico**: Mostrar vista de semáforo (verde=completo, amarillo=pendiente, rojo=crítico).
- **Alertas ACM**: Detectar maestros rezagados o situaciones excepcionales.
- **Reportes DIR**: Estado global de registro de asistencias.

Se definen **9 estados** con **precedencia clara** cuando múltiples condiciones aplican.

---

# 2. Los 9 Estados del Día

| Estado | Descripción | Condición | Color Sugerido |
|--------|------------|-----------|----------------|
| `completo` | Todas las sesiones del maestro ese día tienen asistencias registradas (presentes/ausentes). | `COUNT(sesiones) > 0` AND `COUNT(sesiones_sin_asistencias) = 0` | Verde |
| `sin_sesion` | El maestro NO tiene clases programadas ese día. | `COUNT(sesiones) = 0` | Gris (N/A) |
| `borrador` | Al menos una sesión está en estado `'borrador'`. | EXISTS sesion.estado='borrador' | Azul (En Progreso) |
| `sesion_sin_asistencias` | Hay sesiones con `emergente_id IS NULL` y 0 filas en `asistencias`. | EXISTS sesion WHERE emergente_id IS NULL AND COUNT(asistencias)=0 | Rojo |
| `justificado_por_actividad` | Todas las sesiones están justificadas: emergente_id IS NOT NULL O confirmacion='si'. | COUNT(sesiones_justificadas) = COUNT(sesiones) | Verde |
| `pendiente_de_confirmar_actividad` | Existe al menos una actividad emergente sin confirmación del maestro. | EXISTS confirmacion.respuesta IS NULL Y emergente_id IS NOT NULL | Amarillo |
| `actividad_no_aplicable` | El maestro confirmó 'no_aplica' para todas sus sesiones del día. | EXISTS confirmacion.respuesta='no_aplica' AND COUNT(sesiones)=COUNT(no_aplica) | Gris (Exento) |
| `pendiente_validacion_academica` | El maestro respondió 'no_sé' y espera validación ACM. | EXISTS confirmacion.respuesta='no_se' AND estado_validacion='pendiente' | Naranja (ACM Decide) |
| `excepcion_periodo` | La fecha cae en `periodo_excepciones` con regla especial (ej. cierre académico). | fecha BETWEEN periodo_excepciones.fecha_inicio AND fecha_fin | Gris (Excepción) |

---

# 3. Requisitos Funcionales

### R1: Computación de Estado Único por (maestro_id, fecha)
- **Qué**: Para cada maestro y cada fecha, retorna UN SOLO estado (no múltiples).
- **Cómo**: Aplicar reglas de precedencia (ver sección 4).
- **RPC**: `fn_estado_dia_maestro(p_maestro_id, p_fecha)` 
  - Retorna: `{estado: text, detalles: jsonb}`.

### R2: Precedencia Clara
- Si aplican múltiples condiciones, seguir tabla de precedencia (sección 4).
- **Ejemplo**: Si hay 1 sesión 'borrador' y 1 sesión 'sin asistencias', el estado es `borrador` (más urgente).

### R3: Detalles Auditables
- Incluir en respuesta: contar de sesiones, contar de sesiones justificadas, confirmaciones pendientes, etc.
- **Formato**:
  ```json
  {
    "estado": "borrador",
    "total_sesiones": 3,
    "sesiones_justificadas": 1,
    "sesiones_borrador": 1,
    "sesiones_sin_asistencias": 1,
    "confirmaciones_pendientes": 1,
    "observacion": "1 sesión en borrador, 1 sin asistencias, espera confirmación para 1 emergente"
  }
  ```

### R4: Agregación para Dashboard
- **Qué**: Dado un rango de fechas (ej. semana), agregar estados de todos los maestros.
- **Cómo**: Vista o RPC que retorna matriz [maestro_id, fecha, estado] ordenada por fecha DESC.
- **RPC**: `fn_estados_dia_semana(p_fecha_inicio, p_fecha_fin)` 
  - Retorna: array de {maestro_id, fecha, estado, detalles}.

---

# 4. Reglas de Precedencia

Se aplican en orden descendente (la primera que match gana):

```
1. IF (fecha IN periodo_excepciones) THEN estado = 'excepcion_periodo'
2. ELSE IF (COUNT(sesiones) = 0) THEN estado = 'sin_sesion'
3. ELSE IF (EXISTS sesion.estado = 'borrador') THEN estado = 'borrador'
4. ELSE IF (EXISTS sesion WHERE emergente_id IS NULL AND COUNT(asistencias)=0) 
     THEN estado = 'sesion_sin_asistencias'
5. ELSE IF (EXISTS confirmacion.respuesta = 'no_se' AND estado_validacion = 'pendiente') 
     THEN estado = 'pendiente_validacion_academica'
6. ELSE IF (EXISTS confirmacion.respuesta = 'no' AND emergente_id IS NOT NULL) 
     THEN estado = 'sesion_sin_asistencias' (revertida)
7. ELSE IF (COUNT(sesiones_con_confirmacion_si_o_emergente_si) = COUNT(sesiones)) 
     THEN estado = 'justificado_por_actividad'
8. ELSE IF (EXISTS confirmacion.respuesta = 'no_aplica' AND COUNT(sesiones_aplicables) = 0) 
     THEN estado = 'actividad_no_aplicable'
9. ELSE IF (EXISTS emergente_id IS NOT NULL AND confirmacion IS NULL) 
     THEN estado = 'pendiente_de_confirmar_actividad'
10. ELSE IF (COUNT(sesiones_con_asistencias_registradas) = COUNT(sesiones)) 
     THEN estado = 'completo'
11. ELSE estado = 'sin_sesion' (fallback)
```

---

# 5. Escenarios de Aceptación

### ESCENARIO 1: Día Completo → "Completo"
```gherkin
Given maestro M1 con 3 clases el 2026-09-15:
  - Orquesta (09:00-10:00): 2 asistencias registradas (presentes)
  - Coro (10:30-11:30): 3 asistencias registradas (presentes)
  - Ensambles (14:00-15:00): 1 asistencia registrada (ausente)
When se ejecuta fn_estado_dia_maestro(M1, 2026-09-15)
Then estado = 'completo'
And detalles incluyen:
  - total_sesiones = 3
  - sesiones_justificadas = 0
  - sesiones_borrador = 0
  - sesiones_sin_asistencias = 0
And dashboard muestra: M1 / 2026-09-15 → VERDE
```

### ESCENARIO 2: Día sin Sesiones → "Sin Sesión"
```gherkin
Given maestro M2 sin clases programadas el 2026-09-16
When se ejecuta fn_estado_dia_maestro(M2, 2026-09-16)
Then estado = 'sin_sesion'
And detalles:
  - total_sesiones = 0
And dashboard muestra: M2 / 2026-09-16 → GRIS (N/A)
```

### ESCENARIO 3: Sesión en Borrador Tiene Prioridad → "Borrador"
```gherkin
Given maestro M3 con sesiones el 2026-09-15:
  - Orquesta (09:00-10:00): estado='borrador'
  - Coro (10:30-11:30): 2 asistencias registradas
When se ejecuta fn_estado_dia_maestro(M3, 2026-09-15)
Then estado = 'borrador' (no 'completo', aunque una sesión está completa)
And detalles:
  - sesiones_borrador = 1
  - sesiones_con_asistencias = 1
And dashboard muestra: M3 / 2026-09-15 → AZUL (En Progreso)
```

### ESCENARIO 4: Sesión sin Asistencias (No Emergente) → "Sesión sin Asistencias"
```gherkin
Given maestro M4 con sesiones el 2026-09-15:
  - Orquesta (09:00-10:00): emergente_id=NULL, asistencias=[]
  - Coro (10:30-11:30): 3 asistencias registradas
When se ejecuta fn_estado_dia_maestro(M4, 2026-09-15)
Then estado = 'sesion_sin_asistencias'
And detalles:
  - sesiones_sin_asistencias = 1
  - sesiones_con_asistencias = 1
And dashboard muestra: M4 / 2026-09-15 → ROJO (Crítico)
```

### ESCENARIO 5: Actividad Justificada (Emergente + Confirmación Sí) → "Justificado por Actividad"
```gherkin
Given maestro M5 con sesiones el 2026-09-15:
  - Orquesta (09:00-10:00): emergente_id=<Concierto>, confirmacion='si'
  - Coro (10:30-11:30): 2 asistencias registradas
  - Ensambles (14:00-15:00): emergente_id=<Concierto>, confirmacion='si'
When se ejecuta fn_estado_dia_maestro(M5, 2026-09-15)
Then estado = 'justificado_por_actividad'
And detalles:
  - sesiones_justificadas = 2 (por emergente+confirmacion='si')
  - sesiones_con_asistencias = 1
  - total_sesiones = 3
And dashboard muestra: M5 / 2026-09-15 → VERDE (Justificado)
```

### ESCENARIO 6: Confirmación "No Sé" Pendiente ACM → "Pendiente Validación Académica"
```gherkin
Given maestro M6 con sesión el 2026-09-15:
  - Orquesta (09:00-10:00): emergente_id=<Concierto>, confirmacion='no_se', estado_validacion='pendiente'
  - Coro (10:30-11:30): 2 asistencias registradas
When se ejecuta fn_estado_dia_maestro(M6, 2026-09-15)
Then estado = 'pendiente_validacion_academica' (prioritario sobre 'completo')
And detalles:
  - confirmaciones_pendiente_acm = 1
  - observacion = "Requiere decisión de ACM en 1 confirmación"
And dashboard muestra: M6 / 2026-09-15 → NARANJA (ACM Decide)
And se notifica ACM: "M6 requiere validación en actividad"
```

### ESCENARIO 7: Confirmación "No Aplica" → "Actividad no Aplicable"
```gherkin
Given maestro M7 con sesión el 2026-09-15:
  - Orquesta (09:00-10:00): emergente_id=<Concierto>, confirmacion='no_aplica'
When se ejecuta fn_estado_dia_maestro(M7, 2026-09-15)
Then estado = 'actividad_no_aplicable'
And detalles:
  - observacion = "Actividad no aplica; maestro está exento"
And dashboard muestra: M7 / 2026-09-15 → GRIS (Exento)
And NO se marca como pendiente en ACM
```

### ESCENARIO 8: Confirmación "No" → Sesión Revierte a Pendiente
```gherkin
Given maestro M8 con sesión el 2026-09-15:
  - Orquesta (09:00-10:00): emergente_id=<Concierto>, confirmacion='no'
When se ejecuta fn_estado_dia_maestro(M8, 2026-09-15)
Then emergente_id se revierte a NULL
And estado = 'sesion_sin_asistencias' (aunque había emergente, fue negada)
And detalles:
  - sesiones_sin_asistencias = 1
And dashboard muestra: M8 / 2026-09-15 → ROJO (Requiere Asistencias)
```

### ESCENARIO 9: Período de Excepción (Cierre Académico) → "Excepción Período"
```gherkin
Given maestro M9 con sesión el 2026-09-05
  And existe rango periodo_excepciones desde 2026-09-01 hasta 2026-09-10 con tipo='cierre_academico'
When se ejecuta fn_estado_dia_maestro(M9, 2026-09-05)
Then estado = 'excepcion_periodo' (prioritario sobre todo excepto sin_sesion)
And detalles:
  - periodo_excepciones_aplicable = {tipo: 'cierre_academico', fecha_inicio: '2026-09-01', fecha_fin: '2026-09-10'}
And dashboard muestra: M9 / 2026-09-05 → GRIS (Excepción - No Evaluable)
```

### ESCENARIO 10: Pendiente Confirmación de Actividad → "Pendiente de Confirmar Actividad"
```gherkin
Given maestro M10 con sesión el 2026-09-15:
  - Orquesta (09:00-10:00): emergente_id=<Concierto>, confirmacion=NULL (no respondió aún)
When se ejecuta fn_estado_dia_maestro(M10, 2026-09-15)
Then estado = 'pendiente_de_confirmar_actividad'
And detalles:
  - confirmaciones_pendientes_maestro = 1
  - observacion = "Requiere confirmación del maestro en 1 actividad"
And dashboard muestra: M10 / 2026-09-15 → AMARILLO (Pendiente)
And se notifica M10: "Confirma si 'Concierto' aplicó a tu grupo"
```

---

# 6. Lógica de Computación Detallada

### Pseudocódigo SQL

```sql
CREATE OR REPLACE FUNCTION fn_estado_dia_maestro(p_maestro_id UUID, p_fecha DATE)
RETURNS TABLE (
  estado TEXT,
  total_sesiones INT,
  sesiones_justificadas INT,
  sesiones_borrador INT,
  sesiones_sin_asistencias INT,
  confirmaciones_pendientes INT,
  detalles JSONB
) AS $$
DECLARE
  v_estado TEXT;
  v_count_sesiones INT;
  v_count_borrador INT;
  v_count_sin_asistencias INT;
  v_count_justificadas INT;
  v_count_pendientes_conf INT;
  v_count_no_se INT;
  v_in_excepcion BOOLEAN;
BEGIN
  
  -- Paso 1: Check excepción de período
  SELECT EXISTS (
    SELECT 1 FROM periodo_excepciones
    WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
  ) INTO v_in_excepcion;
  IF v_in_excepcion THEN
    RETURN QUERY SELECT 'excepcion_periodo'::TEXT, 0, 0, 0, 0, 0, '{}'::JSONB;
    RETURN;
  END IF;

  -- Paso 2: Contar sesiones
  SELECT COUNT(*) INTO v_count_sesiones
  FROM sesiones_clase
  WHERE maestro_id = p_maestro_id
    AND fecha = p_fecha
    AND clase_id IS NOT NULL;
  
  IF v_count_sesiones = 0 THEN
    RETURN QUERY SELECT 'sin_sesion'::TEXT, 0, 0, 0, 0, 0, '{}'::JSONB;
    RETURN;
  END IF;

  -- Paso 3: Contar sesiones en borrador
  SELECT COUNT(*) INTO v_count_borrador
  FROM sesiones_clase
  WHERE maestro_id = p_maestro_id
    AND fecha = p_fecha
    AND estado = 'borrador';
  
  IF v_count_borrador > 0 THEN
    RETURN QUERY SELECT 'borrador'::TEXT, v_count_sesiones, 0, v_count_borrador, 0, 0, 
      ('{"observacion":"Al menos una sesión en borrador"}'::JSONB || jsonb_build_object('sesiones_borrador', v_count_borrador));
    RETURN;
  END IF;

  -- Paso 4: Contar sesiones sin asistencias (emergente_id IS NULL)
  SELECT COUNT(*) INTO v_count_sin_asistencias
  FROM sesiones_clase sc
  WHERE sc.maestro_id = p_maestro_id
    AND sc.fecha = p_fecha
    AND sc.emergente_id IS NULL
    AND (SELECT COUNT(*) FROM asistencias WHERE sesion_clase_id = sc.id) = 0;
  
  IF v_count_sin_asistencias > 0 THEN
    RETURN QUERY SELECT 'sesion_sin_asistencias'::TEXT, v_count_sesiones, 0, 0, v_count_sin_asistencias, 0,
      ('{"observacion":"Sesiones sin asistencias"}'::JSONB || jsonb_build_object('sesiones_sin_asistencias', v_count_sin_asistencias));
    RETURN;
  END IF;

  -- Paso 5: Contar confirmaciones "no_se" pendientes
  SELECT COUNT(*) INTO v_count_no_se
  FROM confirmaciones_emergentes ce
  WHERE ce.maestro_id = p_maestro_id
    AND ce.fecha = p_fecha
    AND ce.respuesta = 'no_se'
    AND ce.estado_validacion = 'pendiente';
  
  IF v_count_no_se > 0 THEN
    RETURN QUERY SELECT 'pendiente_validacion_academica'::TEXT, v_count_sesiones, 0, 0, 0, v_count_no_se,
      ('{"observacion":"Requiere validación ACM"}'::JSONB || jsonb_build_object('confirmaciones_no_se', v_count_no_se));
    RETURN;
  END IF;

  -- Paso 6: Contar sesiones justificadas (emergente_id + confirmacion='si')
  SELECT COUNT(*) INTO v_count_justificadas
  FROM sesiones_clase sc
  WHERE sc.maestro_id = p_maestro_id
    AND sc.fecha = p_fecha
    AND (
      sc.emergente_id IS NOT NULL
      OR EXISTS (
        SELECT 1 FROM confirmaciones_emergentes ce
        WHERE ce.actividad_id = sc.emergente_id
          AND ce.maestro_id = p_maestro_id
          AND ce.respuesta = 'si'
      )
    );
  
  IF v_count_justificadas = v_count_sesiones THEN
    RETURN QUERY SELECT 'justificado_por_actividad'::TEXT, v_count_sesiones, v_count_justificadas, 0, 0, 0,
      ('{"observacion":"Todas las sesiones justificadas por actividades institucionales"}'::JSONB);
    RETURN;
  END IF;

  -- Paso 7: Contar confirmaciones pendientes de maestro
  SELECT COUNT(*) INTO v_count_pendientes_conf
  FROM sesiones_clase sc
  WHERE sc.maestro_id = p_maestro_id
    AND sc.fecha = p_fecha
    AND sc.emergente_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM confirmaciones_emergentes ce
      WHERE ce.actividad_id = sc.emergente_id
        AND ce.maestro_id = p_maestro_id
    );
  
  IF v_count_pendientes_conf > 0 THEN
    RETURN QUERY SELECT 'pendiente_de_confirmar_actividad'::TEXT, v_count_sesiones, v_count_justificadas, 0, 0, v_count_pendientes_conf,
      ('{"observacion":"Requiere confirmación de maestro"}'::JSONB || jsonb_build_object('confirmaciones_pendientes', v_count_pendientes_conf));
    RETURN;
  END IF;

  -- Paso 8: Fallback a "completo"
  RETURN QUERY SELECT 'completo'::TEXT, v_count_sesiones, v_count_justificadas, 0, 0, 0,
    ('{"observacion":"Todas las sesiones registradas"}'::JSONB);

END;
$$ LANGUAGE plpgsql;
```

---

# 7. Validación de Estados

### V1: Estado Válido
- Estado retornado debe estar en lista de 9 permitidos.
- Si lógica retorna estado no reconocido, log WARN y fallback a 'sin_sesion'.

### V2: Detalles Coherentes
- Suma de sesiones categorías (borrador + sin_asistencias + justificadas + completas) ≤ total_sesiones.
- Confirmaciones pendientes ≥ 0.

---

# 8. No Alcances

- Cambio de reglas de precedencia por usuario/institución (se define centralmente).
- Estados históricamente retenidos (solo estado actual).
- Triggers automáticos de cambio de estado (se compute bajo demanda).

---

# 9. Dependencias

- Tabla `sesiones_clase` (ya existe).
- Tabla `confirmaciones_emergentes` (SPEC-01, SPEC-02).
- Tabla `periodo_excepciones` (ya existe).
- Tabla `asistencias` (ya existe).
- Función `fn_estado_dia_maestro()` (nuevo RPC).
- Vista agregadora `fn_estados_dia_semana()` (nuevo RPC, usa `fn_estado_dia_maestro()`).
