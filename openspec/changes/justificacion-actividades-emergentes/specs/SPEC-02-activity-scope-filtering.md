# SPEC: Filtrado de Alcance de Actividades (Qué Maestros Ven/Confirman)

## Código interno del cambio
`activity-scope-filtering`

## Estado: PROPUESTA (Aprobación Requerida)

---

# 1. Descripción de Capacidad

Cuando una actividad institucional se registra con un **alcance** específico (institución, orquesta, coro, programa, grupo, maestros_especificos), el sistema debe filtrar automáticamente qué maestros reciben notificación de confirmación y ven el modal en el portal.

El alcance debe evaluarse en tiempo de:
1. **Creación de confirmaciones**: Al registrar la actividad, crea registros en `registros_pendientes` solo para maestros que aplican.
2. **Propagación de difusión**: Notificaciones se envían solo a maestros en el alcance.
3. **Consulta en Portal**: Bandeja de confirmaciones pendientes muestra solo actividades cuyo alcance aplica al maestro.

---

# 2. Estructura de Alcances

### Alcance Tipos y Configuración

| Tipo | `alcance_config` | Significado |
|------|-----------------|------------|
| `institucion` | `{}` | Aplica a TODOS los maestros con clases ese día. |
| `orquesta` | `{programa_id: <uuid>}` | Aplica solo a maestros de ese programa/ensamble. |
| `coro` | `{programa_id: <uuid>}` | Aplica solo a maestros de coro/voz. |
| `programa` | `{programa_id: <uuid>}` | Aplica a maestros del programa especificado. |
| `grupo` | `{grupo_id: <uuid>}` | Aplica a maestros de ese grupo (clase). |
| `maestros_especificos` | `{maestro_ids: [<uuid>, <uuid>, ...]}` | Aplica solo a maestros enumerados. |

---

# 3. Requisitos Funcionales

### R1: Difusión de Actividad por Alcance
- **Qué**: Al crear `sesiones_clase` (raíz) con alcance, el sistema identifica maestros afectados y crea registros de notificación/confirmación.
- **Cómo**: 
  1. Evaluar `alcance_tipo` y `alcance_config`.
  2. Buscar maestros en el alcance que tienen clases en `sesiones_clase` para esa fecha.
  3. Crear una fila en `registros_pendientes` por maestro afectado con tipo='confirmacion_actividad_requerida'.
- **RPC**: `fn_difundir_actividad_por_alcance(p_actividad_id, p_alcance_tipo, p_alcance_config, p_fecha)` 
  - Ejecuta la lógica de expansión de alcance.
  - Retorna array de maestro_ids notificados.

### R2: Evaluación de Alcance en Tiempo de Consulta
- **Qué**: Cuando maestro consulta bandeja de confirmaciones pendientes, mostrar solo actividades cuyo alcance lo incluye.
- **Cómo**: Vista SQL o RPC que aplica filtro por alcance + maestro_id actual.
- **RPC**: `fn_confirmaciones_pendientes_para_maestro(p_maestro_id)` 
  - Retorna actividades (sesiones_clase raíz) donde el alcance incluye p_maestro_id Y no existe confirmación_emergente para (actividad, p_maestro_id, fecha).

### R3: Propagación Multi-Maestro (Actividad Registrada por Uno, Difundida a Todos en Alcance)
- **Escenario**: Maestro M1 (de Orquesta) registra "Concierto Institucional" con alcance_tipo='institucion'.
- **Efecto**: Todos los maestros con clases esa fecha reciben notificación, independientemente de si M1 los notificó manualmente.
- **Garantía**: No hay maestros "olvidados"; la evaluación de alcance es exhaustiva.

### R4: Alcance "Maestros Específicos" — Asignación Directa
- **Uso**: ACM crea actividad con alcance_tipo='maestros_especificos' y lista explícita de maestro_ids.
- **Efecto**: Solo esos maestros reciben confirmación.
- **Formato**: `alcance_config = {maestro_ids: ["uuid1", "uuid2", "uuid3"]}`.

---

# 4. Escenarios de Aceptación

### ESCENARIO 1: Actividad Dirigida a Institución, Todos Ven
```gherkin
Given una actividad "Jornada Institucional de Entonación" registrada con:
  - alcance_tipo = 'institucion'
  - alcance_config = {}
  - fecha = 2026-09-15
  And maestros M1, M2, M3, M4, M5 tienen clases el 2026-09-15
When el coordinador crea la actividad
Then se ejecuta fn_difundir_actividad_por_alcance(actividad_id, 'institucion', {}, 2026-09-15)
And se retorna [M1, M2, M3, M4, M5]
And se crean 5 registros en registros_pendientes (uno por maestro)
And cada uno recibe notificación: "Jornada Institucional de Entonación aplicó ayer/hoy. ¿Aplica a tus clases?"
And al abrir portal, cada maestro ve "Confirmación pendiente: Jornada Institucional"
And si M1 ya confirmó, M2 aún ve el modal; M3 ve el modal; etc.
```

### ESCENARIO 2: Actividad Dirigida Solo a Orquesta, Maestros Fuera No Ven
```gherkin
Given una actividad "Concierto Semestral de Orquesta" registrada con:
  - alcance_tipo = 'orquesta'
  - alcance_config = {programa_id: <id programa Orquesta>}
  - fecha = 2026-09-15
  And maestros:
    - M_Orq1, M_Orq2 → enseñan en programa "Orquesta"
    - M_Coro → enseña en programa "Coro"
    - M_Ref → enseña "Refuerzo" (no es programa dirigido)
When coordinador crea la actividad con alcance_tipo='orquesta'
Then se ejecuta fn_difundir_actividad_por_alcance(actividad_id, 'orquesta', {programa_id: <id Orquesta>}, 2026-09-15)
And se retorna [M_Orq1, M_Orq2]
And registros_pendientes se crean solo para M_Orq1 y M_Orq2
And M_Coro y M_Ref NO reciben notificación
And cuando M_Coro consulta bandeja, la actividad "Concierto Semestral" NO aparece (no está en su alcance)
```

### ESCENARIO 3: Actividad Registrada por Maestro, Propagación a Otros Aplicables
```gherkin
Given un maestro "M_Orq1" registra actividad "Masterclass de Técnica de Arco" con:
  - alcance_tipo = 'programa'
  - alcance_config = {programa_id: <id Orquesta>}
  - fecha = 2026-09-15
  And otros maestros de Orquesta (M_Orq2, M_Orq3) tienen clases esa fecha
When la actividad se registra
Then sistema ejecuta difusión automática:
  - M_Orq1 (registrador) recibe confirmación de difusión: "Actividad creada y propagada a X maestros"
  - M_Orq2 y M_Orq3 reciben notificación: "M_Orq1 registró 'Masterclass de Técnica de Arco'. ¿Aplica a tu grupo?"
  - Bandeja de M_Orq2 muestra "Confirmación pendiente: Masterclass de Técnica de Arco"
  - Bandeja de M_Orq3 muestra "Confirmación pendiente: Masterclass de Técnica de Arco"
  - M_Coro NO ve la actividad (fuera del alcance 'programa')
```

### ESCENARIO 4: Alcance "Grupo Específico", Solo Ese Maestro la Ve
```gherkin
Given una actividad "Ensayo Especial de Ensambles Intermedios" registrada con:
  - alcance_tipo = 'grupo'
  - alcance_config = {grupo_id: <id Ensambles Intermedios>}
  - fecha = 2026-09-15
  And maestro "M_Ens" es maestro de "Ensambles Intermedios"
  And maestro "M_Orq" es maestro de "Orquesta Principal" (grupo diferente)
When coordinador crea la actividad
Then se retorna [M_Ens] (solo maestro de ese grupo)
And M_Ens recibe notificación y ve en bandeja
And M_Orq NO recibe notificación
And cuando M_Orq consulta bandeja, la actividad NO aparece
```

### ESCENARIO 5: Alcance "Maestros Específicos", Solo Ellos Ven
```gherkin
Given coordinador ACM crea actividad "Validación Especial de Asistencia" con:
  - alcance_tipo = 'maestros_especificos'
  - alcance_config = {maestro_ids: ["id_M1", "id_M3", "id_M7"]}
  - fecha = 2026-09-15
When se crea la actividad
Then se retorna ["id_M1", "id_M3", "id_M7"]
And solo esos 3 maestros reciben notificación
And M2, M4, M5, etc. NO ven la actividad (no están en la lista)
And si M1 consulta bandeja, ve actividad
And si M2 consulta bandeja, NO ve actividad (fuera de alcance)
```

### ESCENARIO 6: Cambio de Alcance Después de Crear Actividad (Futura)
```gherkin
Given una actividad ya creada con alcance_tipo='institucion' y difusión realizada a 10 maestros
When coordinador actualiza alcance_tipo a 'orquesta' (restringe el alcance)
Then sistema NO retira notificaciones previas (no es alcance del spec actual)
  -- Esta operación es de "modificación de actividad", topic futuro
And nuevas maestros que confirmen/se entere serán filtradas por el nuevo alcance
  -- Esto es implementado en fase design/apply
```

---

# 5. Reglas de Evaluación de Alcance

### Lógica de Filtrado por Tipo

#### `alcance_tipo='institucion'`
- Condición: Maestro tiene al menos una sesión en `sesiones_clase` con `fecha = <actividad_fecha>` Y `clase_id IS NOT NULL`.
- Expansión SQL:
  ```sql
  SELECT DISTINCT maestro_id FROM sesiones_clase 
  WHERE fecha = p_fecha 
    AND clase_id IS NOT NULL
    AND estado != 'cancelada';
  ```

#### `alcance_tipo='orquesta'` / `'coro'` / `'programa'`
- Condición: `alcance_config.programa_id` coincide con el programa del maestro.
- Expansión SQL:
  ```sql
  SELECT DISTINCT m.id 
  FROM maestros m
  JOIN maestros_programas mp ON m.id = mp.maestro_id
  WHERE mp.programa_id = p_alcance_config->>'programa_id'
    AND EXISTS (
      SELECT 1 FROM sesiones_clase sc
      WHERE sc.maestro_id = m.id 
        AND sc.fecha = p_fecha
        AND sc.clase_id IS NOT NULL
        AND sc.estado != 'cancelada'
    );
  ```

#### `alcance_tipo='grupo'`
- Condición: El maestro enseña en ese grupo (clase).
- Expansión SQL:
  ```sql
  SELECT DISTINCT m.id 
  FROM maestros m
  WHERE EXISTS (
    SELECT 1 FROM sesiones_clase sc
    WHERE sc.maestro_id = m.id
      AND sc.clase_id = p_alcance_config->>'grupo_id'
      AND sc.fecha = p_fecha
      AND sc.estado != 'cancelada'
  );
  ```

#### `alcance_tipo='maestros_especificos'`
- Condición: Maestro_id está en lista `alcance_config.maestro_ids`.
- Expansión SQL:
  ```sql
  SELECT DISTINCT maestro_id 
  FROM jsonb_array_elements_text(p_alcance_config->'maestro_ids') 
  WHERE maestro_id::uuid IN (
    SELECT sc.maestro_id FROM sesiones_clase sc
    WHERE sc.fecha = p_fecha
      AND sc.clase_id IS NOT NULL
      AND sc.estado != 'cancelada'
  );
  ```

---

# 6. Validación de Alcance

### V1: Configuración Válida
- Si `alcance_tipo='institucion'`, se acepta `alcance_config = {}`.
- Si `alcance_tipo='programa'|'orquesta'|'coro'`, `alcance_config` DEBE tener clave `programa_id` con UUID válido.
- Si `alcance_tipo='grupo'`, `alcance_config` DEBE tener clave `grupo_id` con UUID válido.
- Si `alcance_tipo='maestros_especificos'`, `alcance_config` DEBE tener clave `maestro_ids` con array de UUIDs válidos.
- Si no cumple, RPC rechaza con código 400.

### V2: Maestros Expandidos No Duplicados
- El resultado de fn_difundir_actividad_por_alcance retorna maestro_ids DISTINCT.
- Se crea máximo UNA fila en registros_pendientes por maestro por actividad.

---

# 7. No Alcances

- Cambios de alcance después de crear actividad (se maneja en fase de modificación futura).
- Invalidación de confirmaciones previas si alcance se restringe (decisión de diseño: mantener historial o invalidar).
- Alcances dinámicos o condicionales (ej. "maestros con alumnos que cumplen criterio X").

---

# 8. Dependencias

- Tabla `maestros` (ya existe; propiedades: id, programa_id si existe, o relación maestros_programas).
- Tabla `sesiones_clase` (ya existe; filtrará por maestro_id, fecha, clase_id, estado).
- Tabla `registros_pendientes` (ya existe; se usa para crear notificaciones).
- RLS policies: Deben permitir que coordinador ACM lea maestros + sesiones para calcular alcance.
