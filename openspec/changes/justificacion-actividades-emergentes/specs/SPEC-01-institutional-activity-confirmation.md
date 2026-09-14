# SPEC: Confirmación de Actividades Institucionales por Maestro

## Código interno del cambio
`institutional-activity-confirmation`

## Estado: PROPUESTA (Aprobación Requerida)

---

# 1. Descripción de Capacidad

Cuando un maestro registra una actividad institucional (concierto, masterclass), otros maestros afectados por esa actividad en la misma fecha deben confirmar si la actividad aplicó a sus clases.

Un maestro registra una **confirmación** una sola vez por cada `actividad + maestro + fecha` (constraint único). El sistema registra automáticamente:
- **Respuesta**: Sí / No / No aplica / No sé
- **Timestamp y usuario**: Quién confirmó y cuándo
- **Metadatos auditables**: Clases afectadas (count + lista), observaciones

La respuesta es **idempotente**: reintentar la creación de la misma confirmación no duplica registros.

---

# 2. Modelo de Datos (DDL Delta)

### Extensión de `sesiones_clase`
Agregar a la tabla raíz (clase_id IS NULL):

```sql
ALTER TABLE sesiones_clase
  ADD COLUMN lugar VARCHAR(255) DEFAULT NULL,
  ADD COLUMN alcance_tipo TEXT DEFAULT 'institucion',
      CHECK (alcance_tipo IN ('institucion','orquesta','coro','programa','grupo','maestros_especificos')),
  ADD COLUMN alcance_config JSONB DEFAULT '{}';
```

### Nueva tabla `confirmaciones_emergentes`

```sql
CREATE TABLE confirmaciones_emergentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  respuesta TEXT NOT NULL 
    CHECK (respuesta IN ('si','no','no_aplica','no_se')),
  estado_validacion TEXT DEFAULT 'pendiente'
    CHECK (estado_validacion IN ('pendiente','validado','rechazado')),
  respondido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  respondido_at TIMESTAMPTZ DEFAULT NOW(),
  clases_afectadas JSONB DEFAULT '[]',
    -- [{clase_id: <uuid>, clase_nombre: <text>, hora_inicio: <time>, hora_fin: <time>, alumnos_count: <int>}, ...]
  observaciones TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (actividad_id, maestro_id, fecha)
);

CREATE INDEX idx_confirmaciones_actividad_maestro 
  ON confirmaciones_emergentes(actividad_id, maestro_id);
CREATE INDEX idx_confirmaciones_maestro_fecha 
  ON confirmaciones_emergentes(maestro_id, fecha);
CREATE INDEX idx_confirmaciones_estado 
  ON confirmaciones_emergentes(estado_validacion);
```

---

# 3. Requisitos Funcionales

### R1: Registro Idempotente de Confirmación
- **Qué**: UPSERT en `confirmaciones_emergentes` por (actividad_id, maestro_id, fecha).
- **Efecto**: No duplica confirmaciones si el maestro retiene su elección.
- **RPC**: `fn_confirmar_actividad_emergente(p_actividad_id, p_maestro_id, p_fecha, p_respuesta, p_observaciones)`
- **Postcondición**: Una sola fila por (actividad_id, maestro_id, fecha) con `respondido_at` actualizado.

### R2: Efecto de Cada Respuesta sobre Clases del Maestro para Esa Fecha

| Respuesta | Efecto | Cambio en `sesiones_clase` | Cambio en `registros_pendientes` |
|-----------|--------|--------------------------|--------------------------------|
| **Sí** | Maestro confirma que la actividad justificó sus clases ese día. | Sesiones con `emergente_id IS NOT NULL` se mantienen con `estado='registrada'` | Se resuelve: marcas como 'resuelta' si existía flag 'asistencia_pendiente' |
| **No** | Maestro confirma que la actividad NO aplicó a sus clases. | Sesiones con `emergente_id = <actividad_id>` revertidas a `emergente_id = NULL`, `estado='borrador'` | Se reactiva flag 'asistencia_pendiente' para que maestro registre manualmente |
| **No aplica** | Maestro declara que la actividad no es relevante para su grupo. | Sesiones NO se alteran; confirmación actúa como "exención". | No se marca como pendiente; se cierra sin justificación. |
| **No sé** | Maestro no puede determinar si aplica. Requiere validación ACM. | Sesiones se mantienen con `emergente_id IS NOT NULL` temporalmente. | Se escala a `registros_pendientes` con tipo='validacion_acm_requerida' para coordinador. |

### R3: Auditoría de Confirmaciones
- Cada confirmación registra: `respondido_por` (auth.users.id), `respondido_at`, `clases_afectadas` (JSONB snapshot), `observaciones`.
- Cambios posteriores (ACM validando "no_sé") se auditan en `registros_pendientes` o tabla de cambios (fuera del alcance de este spec).

### R4: Unicidad y No Duplicación
- Constraint único: `UNIQUE (actividad_id, maestro_id, fecha)`.
- Reintento de la misma confirmación (mismo maestro, misma actividad, misma fecha) actualiza la fila sin crear duplicado.

---

# 4. Escenarios de Aceptación

### ESCENARIO 1: Maestro con una clase y actividad aplicable → Justificada tras "Sí"
```gherkin
Given un maestro "M1" con una clase "Orquesta A" a las 09:00-10:00 el 2026-09-15
  And una actividad institucional "Concierto General" registrada para 2026-09-15
  And M1 es maestro de "Orquesta A"
When M1 abre el portal y ve la confirmación pendiente
  And M1 hace clic en "Sí, aplicaba a mi grupo"
Then se crea una fila en confirmaciones_emergentes con:
  - respuesta = 'si'
  - respondido_at = <timestamp actual>
  - respondido_por = <user_id de M1>
  - clases_afectadas = [{clase_id: <id Orquesta A>, clase_nombre: 'Orquesta A', alumnos_count: 15}]
  - estado_validacion = 'pendiente' (pendiente ACM review si es necesario, o 'validado' si es auto-resolvible)
And la sesión de M1 para Orquesta A el 2026-09-15 mantiene emergente_id <actividad> y estado='registrada'
And el registro pendiente (si lo hay) se resuelve
```

### ESCENARIO 2: Maestro con tres clases el mismo día → Una sola confirmación cubre las tres
```gherkin
Given un maestro "M2" con tres clases el 2026-09-15:
  - Orquesta (09:00-10:00)
  - Coro (10:30-11:30)
  - Ensambles (14:00-15:00)
  And una actividad "Concierto General" registrada para 2026-09-15 con alcance_tipo='institucion'
When M2 confirma "Sí" para la actividad
Then se crea UNA fila en confirmaciones_emergentes:
  - actividad_id = <id concierto>
  - maestro_id = <id M2>
  - fecha = 2026-09-15
  - respuesta = 'si'
  - clases_afectadas = [
      {clase_id: <id Orquesta>, clase_nombre: 'Orquesta', alumnos_count: 15},
      {clase_id: <id Coro>, clase_nombre: 'Coro', alumnos_count: 20},
      {clase_id: <id Ensambles>, clase_nombre: 'Ensambles', alumnos_count: 12}
    ]
And todas las tres sesiones de M2 mantienen emergente_id y estado='registrada'
And un reintento de confirmación por M2 (misma actividad, misma fecha) actualiza la fila existente sin crear duplicado
```

### ESCENARIO 3: "No aplica" → Modal desaparece, no justifica, no reaparece
```gherkin
Given un maestro "M3" con clase "Orquesta Avanzada" el 2026-09-15
  And una actividad "Concierto Inicial (solo Orquesta Básica)" registrada con alcance_tipo='grupo' y alcance_config={'grupo_id': <id Orquesta Básica>}
When M3 ve la confirmación (porque la difusión fue amplia inicialmente)
  And M3 confirma "No aplica"
Then se crea confirmación_emergente con:
  - respuesta = 'no_aplica'
  - clases_afectadas = [{clase_id: <id Orquesta Avanzada>, ...}]
  - estado_validacion = 'validado' (no requiere revisión ACM)
And el modal desaparece para M3
And el estado de registros_pendientes para M3+actividad+fecha se marca como 'resuelta'
And si M3 intenta re-abrir el portal, la confirmación ya resuelta no reaparece (no vuelve a notificarse)
```

### ESCENARIO 4: "No sé" → Aparece en cola de validación ACM
```gherkin
Given un maestro "M4" con clase "Grupo de Refuerzo" el 2026-09-15
  And una actividad "Jornada de Entonación" registrada con alcance_tipo='institucion'
When M4 no está seguro si la actividad aplica a su grupo
  And M4 confirma "No sé"
Then se crea confirmación_emergente con:
  - respuesta = 'no_se'
  - estado_validacion = 'pendiente'
And un registro en registros_pendientes se crea con:
  - tipo = 'validacion_acm_requerida'
  - maestro_id = M4
  - sesion_clase_id = <sesión de M4 para 2026-09-15>
  - notification_state = 'AMARILLO' (requiere atención)
And se notifica al ACM: "M4 no está seguro de si 'Jornada de Entonación' aplicó. Revisa confirmación [id]"
And M4 vuelve a ver el modal como "En validación" (no puede cambiar su respuesta hasta ACM valide)
```

### ESCENARIO 5: Reintento del flujo de creación de actividad no duplica confirmaciones
```gherkin
Given una actividad "Concierto" creada y difundida a M1, M2, M3
  And M1 confirmó "Sí"
  And M2 confirmó "No aplica"
When el coordinador, por error, intenta re-registrar la misma actividad (mismo date, mismo nombre, mismo alcance)
  And el sistema rechaza por UNIQUE constraint en sesiones_clase (actividad raíz)
Then ninguna confirmación se duplica
  And M1 sigue mostrando "Confirmada: Sí"
  And M2 sigue mostrando "Confirmada: No aplica"
  And si por alguna razón se actualiza la actividad existente (ej. ajuste de hora), las confirmaciones previas siguen siendo válidas
```

### ESCENARIO 6: Confirmación idempotente ante reintento
```gherkin
Given M1 confirmó "Sí" a una actividad el 2026-09-15 a las 10:00
When M1 (o un agente de soporte) re-abre el formulario y confirma "Sí" nuevamente a las 10:05
Then se ejecuta UPSERT:
  - La fila existente se actualiza (respondido_at = 10:05, respondido_por = <mismo u otro user si ACM asiste>)
  - No se crea una segunda fila
And el audit trail muestra ambos timestamps (original 10:00 y actualización 10:05)
```

---

# 5. Reglas de Validación

### V1: Clases Afectadas
- `clases_afectadas` se calcula como snapshot al momento de la confirmación.
- Incluye solo clases donde `maestro_id = <confirmador>` Y `fecha = <fecha actividad>`.
- Cada clase incluye: `clase_id`, `clase_nombre`, `hora_inicio`, `hora_fin`, `alumnos_count`.

### V2: Respondido Por
- `respondido_por` es `auth.users.id`, nunca NULL (el maestro debe estar autenticado).
- Si la confirmación es revisada/validada por un ACM, un registro de auditoría separado (fuera de este spec) lo registra.

### V3: Validación de Respuesta
- Solo valores permitidos: 'si', 'no', 'no_aplica', 'no_se'.
- Si se envía otro valor, la RPC rechaza con código 400.

---

# 6. No Alcances

- Retroactividad: No se backfill actividades pasadas.
- Timeout automático: Si maestro no confirma en 24h, no se resuelve automáticamente; ACM debe escalar o resolver manualmente (diseño futuro).
- SMS/WhatsApp: Sistema de notificación implementado por `registros_pendientes` + `notificaciones`; rate-limiting es responsabilidad de la capa de notificación.

---

# 7. Dependencias

- Tabla `sesiones_clase` (ya existe con `emergente_id`).
- Tabla `maestros` (ya existe).
- Tabla `auth.users` (Supabase auth).
- Tabla `registros_pendientes` (ya existe; se vincula para flagging "validacion_acm_requerida").
- RLS policies en `sesiones_clase` (ya existen; se extienden si es necesario para nuevas columnas).
