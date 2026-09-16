# Diagnóstico: Justificación de Actividades Emergentes (Institucionales)

> **CORRECCIÓN (revisión manual del orquestador, verificada contra código real)**:
> El diagnóstico automático inicial (sub-agente Haiku) confundió dos mecanismos
> DISTINTOS que coexisten en el código y comparten palabra "emergente":
>
> 1. **`clases_emergentes` + `asistencias_emergentes`** (migración 20260606) — feature de
>    "clases de refuerzo" (`tipo DEFAULT 'refuerzo'`), NO relacionado con actividades
>    institucionales tipo concierto. No es el mecanismo que usa el caso del usuario.
> 2. **`sesiones_clase.emergente_id`** (migración 20260530, auto-referencial a
>    `sesiones_clase(id)`, NO a `clases_emergentes`) — este SÍ es el mecanismo real
>    del "Concierto Institucional". Ver `docs/superpowers/specs/2026-05-30-emergente-auto-justificacion-design.md`
>    (diseño aprobado y vigente) y `src/portal-maestros/services/emergenteJustificacionService.js`.
>
> La "actividad emergente" (el concierto) se registra vía `claseEmergenteModal.js`
> (`src/modules/planificacion/components/claseEmergenteModal.js`) como una fila
> RAÍZ en `sesiones_clase` con `clase_id = null`, `maestro_id`, `fecha`,
> `hora_inicio/fin`, `actividad`, `tema_principal`, `contenido`, `motivo`,
> `estado: 'pendiente'`, `asistencia: [{alumno_id, estado: null}, ...]`.
> Esa fila **NO tiene campos `lugar` ni `alcance`** — no existen hoy.
> `autoJustificarClasesProgramadas()` luego hace UPSERT de las clases programadas
> del maestro ese día con `emergente_id = <id de la fila raíz>`, `estado:'registrada'`,
> `asistencia` con todos los alumnos en `'justificado'`.
>
> Confirmado en código (no solo migraciones): `src/modules/asistencias/api/asistenciasSupabase.js`,
> `src/modules/asistencias/services/asistenciaDataService.js` y
> `src/modules/asistencias/views/asistenciaReporteView.js` — el pipeline de
> reportes de asistencia — **no referencian `emergente_id` en ningún punto**,
> confirmando la causa raíz del sub-agente.
>
> Implicación para el diseño: la tabla de confirmaciones debe referenciar
> **`sesiones_clase(id)` (la fila raíz del emergente)**, no `clases_emergentes(id)`.
> El campo `lugar` y el `alcance` deben agregarse a `sesiones_clase` (o a una
> tabla de metadatos 1:1 con la fila raíz) — no a `clases_emergentes`, que es
> una feature no relacionada. La sección "Propuesta de Implementación Mínima"
> más abajo describe el diseño ORIGINAL (incorrecto en la tabla objetivo); la
> fase de propuesta (`sdd-propose`) debe usar esta corrección, no esa sección.
>
> El "BLOQUEADOR" planteado al final de este documento ya está resuelto:
> `emergente_id IS NULL` en una sesión normal simplemente significa "sesión no
> relacionada con ninguna actividad institucional" (el caso general — la enorme
> mayoría de filas). Sólo es no-NULL en sesiones auto-justificadas por el UPSERT
> de `autoJustificarClasesProgramadas`. No bloquea la implementación.

## Flujo Actual Encontrado

### Creación de Actividades Emergentes
- **Tabla**: `clases_emergentes` (portal-maestros-tables.sql:55–67)
  - maestro_id, fecha, clase_id (nullable), nombre_clase, motivo, observaciones
  - Índice: `idx_clases_emergentes_maestro_fecha`

### Auto-justificación de Sesiones
- **Servicio**: `emergenteJustificacionService.js` (líneas 14–93)
  - `autoJustificarClasesProgramadas(emergente, maestroId)` 
  - Ejecuta 4 pasos:
    1. Busca clases del maestro para el día (cualquier rol: principal, suplente, maestro_id)
    2. Obtiene horarios de `clase_horarios` filtrando por día de semana
    3. Carga alumnos inscritos via `alumnos_clases`
    4. **UPSERT en sesiones_clase** con `emergente_id = emergente.id` (línea 66–80)
  - Marca asistencia como 'justificado' para todos los alumnos (línea 58)
  - Unique constraint: `(clase_id, fecha, maestro_id)` (migration 20260530)

### Vinculación en Base de Datos
- **Columna**: `sesiones_clase.emergente_id` (migration 20260530_emergente_id_sesiones.sql)
  - Tipo: UUID REFERENCES sesiones_clase(id)
  - ON DELETE SET NULL (si actividad emergente se borra, sesión justificada se queda)
  - Permite sesiones "raíz" con emergente_id NULL

---

## Causa Raíz del Falso Positivo

**Archivo**: `src/modules/asistencias/api/asistenciasSupabase.js`, líneas 54–142 (`getSesionesPorRango`)

**Query problemática** (líneas 83–86):
```sql
asistencias (
  id,
  estado
)
```

**Lógica de conteo** (líneas 127–130):
```javascript
totalPresentes: ayudas.filter((a) => a.estado === ESTADOS.PRESENTE).length,
totalAusentes: ayudas.filter((a) => a.estado === ESTADOS.AUSENTE).length,
totalJustificados: ayudas.filter((a) => a.estado === ESTADOS.JUSTIFICADO).length,
totalRegistros: ayudas.length,
```

**El problema**:
- Si `emergente_id IS NOT NULL` pero `asistencias` tiene 0 filas → `totalRegistros = 0`
- La sesión se reporta como "sin asistencia" en:
  - `vw_asistencias_consolidada` (schema_reference.sql:7332–7369)
  - Reportes ACM/ADM/DIR que consultan esta vista
  - Dashboard pedagógico

**Caso concreto**: Concierto Institucional 10-sep-2026
- Maestro registra emergente en portal
- Sistema auto-justifica sesión de cada clase del maestro para ese día
- `emergente_id` apunta a la actividad institucional
- **Pero**: no hay filas en `asistencias` (porque se justificó globalmente vía contenido)
- Sistema marca: "0 registros de asistencia → sesión pendiente"
- Otros maestros nunca se enteran de la actividad

---

## Componentes Reutilizables

| Componente | Ubicación | Reutilizable | Por Qué |
|---|---|---|---|
| **Auto-justificación por fecha/rol** | `emergenteJustificacionService.autoJustificarClasesProgramadas()` | Sí | Lógica limpia de búsqueda diaria por maestro + UPSERT idempotente |
| **Tabla clases_emergentes** | `portal-maestros-tables.sql:55–67` | Parcialmente | Estructura simple pero sin campos de alcance/confirmación |
| **Vínculos emergente_id → sesión** | migration 20260530 | Sí | Relación 1:N bien modelada, ON DELETE SET NULL preserva data |
| **Notificaciones escalación** | `registros_pendientes` + `notificaciones` | Sí | Tabla + policies + triggers para workflow VERDE→AMARILLO→NARANJA→ROJO |
| **Seguimiento de ausentes** | `src/modules/pedagogico/` | Parcialmente | Ya hay UI para confirmaciones maestro+alumno; podría extenderse a maestro+actividad |

---

## Vacíos del Modelo de Datos

### 1. Sin chequeo de `emergente_id` en reportes
- `vw_asistencias_consolidada` no consulta emergente_id
- `getSesionesPorRango()` nunca verifica si sesión está justificada
- **Riesgo**: Sesión jamás se marca como "justificada por emergente" → reportes incorrectos

### 2. Sin tabla de confirmaciones por maestro
- Actividad institucional se registra, pero otros maestros no la confirman
- No hay campo para: "¿aplica a mi clase?", "¿sí asiste mi grupo?"
- **Riesgo**: Cada maestro lo interpreta diferente; ausencias fantasma en unos, no en otros

### 3. Sin normalización de alcance
- Actividades institucionales viven en `clases_emergentes` (hoy sin alcance)
- "Concierto" aplica a: ¿Todos? ¿Orquesta? ¿Grupos específicos?
- **Riesgo**: Datos redundantes si se usan JSON; complejo si se normaliza tarde

### 4. Sin gestión de propagación
- Solo el maestro registrador lo sabe
- No hay difusión a maestros de otros grupos
- No hay coordinador/ACM que valide o confirme
- **Riesgo**: Conflictos si maestros reportan ausencias antes de enterarse del evento

### 5. Sin tabla de auditoría clara
- `registros_pendientes` + `notificaciones` tracean alertas, no la lógica de decisión
- Si se resuelve una sesión, ¿quién lo hizo y por qué?
- **Riesgo**: Imposible auditar si la resolución fue correcta

---

## Esquema Real Relevante (DDL Resumido)

```sql
-- Actividades institucionales
CREATE TABLE clases_emergentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL REFERENCES maestros(id),
  fecha DATE NOT NULL,
  clase_id UUID,  -- NULLABLE
  nombre_clase TEXT,
  motivo TEXT,
  observaciones TEXT,
  -- FALTA: alcance, confirmación, propagación
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_clases_emergentes_maestro_fecha ON clases_emergentes(maestro_id, fecha);

-- Sesiones de clase (vinculadas a emergentes)
CREATE TABLE sesiones_clase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID REFERENCES clases(id),
  maestro_id UUID NOT NULL,
  fecha DATE NOT NULL,
  emergente_id UUID REFERENCES sesiones_clase(id) ON DELETE SET NULL,  -- LINKAGE
  estado TEXT DEFAULT 'borrador',
  asistencia JSONB DEFAULT '[]',
  -- ... otros campos
  UNIQUE (clase_id, fecha, maestro_id)
);

-- Asistencia detallada (tabla normalizada)
CREATE TABLE asistencias (
  id UUID PRIMARY KEY,
  sesion_clase_id UUID REFERENCES sesiones_clase(id),
  alumno_id UUID REFERENCES alumnos(id),
  estado TEXT CHECK (estado IN ('presente','ausente','justificado','tarde')),
  -- ... otros campos
);

-- Justificaciones de faltas (por alumno, no por sesión)
CREATE TABLE justificaciones (
  id UUID PRIMARY KEY,
  alumno_id UUID REFERENCES alumnos(id),
  sesion_id UUID REFERENCES sesiones_clase(id),
  motivo TEXT,
  created_at TIMESTAMPTZ
);

-- PROBLEMA: registros_pendientes marca sesión como "sin asistencia"
-- si total_registros = 0, ignorando emergente_id
CREATE TABLE registros_pendientes (
  id UUID PRIMARY KEY,
  maestro_id UUID NOT NULL REFERENCES maestros(id),
  sesion_clase_id UUID REFERENCES sesiones_clase(id),
  tipo TEXT CHECK (tipo IN ('asistencia_pendiente', ...)),
  estado TEXT DEFAULT 'pendiente',
  notification_state TEXT DEFAULT 'VERDE'
);
```

### RLS Policies en sesiones_clase
- Maestros ven/editan solo sus propias sesiones
- Admin tiene acceso total
- No hay políticas específicas para emergentes

---

## Archivos y Tablas que Deberían Modificarse

### Por Cambiar
1. **`getSesionesPorRango()` en asistenciasSupabase.js** → Agregar check de `emergente_id` en query
2. **`vw_asistencias_consolidada`** → Incluir `emergente_id` y flag `es_justificada_por_emergente`
3. **`clases_emergentes` schema** → Agregar columnas de alcance + confirmación
4. **`registros_pendientes` trigger** → No marcar como "sin asistencia" si `emergente_id IS NOT NULL`

### Nuevos (Probablemente)
1. **Tabla `confirmaciones_emergentes`** → maestro_id, emergente_id, confirmacion ('sí', 'no', 'no_aplica'), timestamp
2. **RPC `fn_confirmar_actividad_emergente()`** → Idemterpotente, marca confirmación, triggerea notificación a otros maestros
3. **Vista `vw_emergentes_por_alcance`** → Filtra qué maestros deben ver/confirmar cada actividad

---

## Propuesta de Implementación Mínima

### Decisión Arquitectónica: Reutilizar vs. Nueva Entidad

**RECOMENDACIÓN**: Reutilizar `clases_emergentes` como table base, pero con extensión clara de alcance + confirmaciones.

**Por qué no crear tabla nueva**:
- Ya existe flujo auto-justificación probado
- Cambio mínimo a emergente_id en sesiones_clase
- Evita duplicación de dato si coexisten emergentes y actividades institucionales

**Estructura propuesta**:

```sql
-- Extender clases_emergentes (migración delta)
ALTER TABLE clases_emergentes
  ADD COLUMN alcance TEXT DEFAULT 'institucion'  -- 'institucion','orquesta','coro','programa','grupo','maestros_especificos'
  ADD COLUMN alcance_config JSONB DEFAULT '{}';  -- {'grupo_ids': [...]} si alcance='grupo', etc.

-- Nueva tabla de confirmaciones
CREATE TABLE confirmaciones_emergentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL REFERENCES maestros(id),
  emergente_id UUID NOT NULL REFERENCES clases_emergentes(id) ON DELETE CASCADE,
  confirmacion TEXT NOT NULL CHECK (confirmacion IN ('sí','no','no_aplica','no_sé')),
  observacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (maestro_id, emergente_id)  -- Una confirmación por maestro por emergente
);

-- Trigger: cuando emergente se crea → notificar maestros según alcance
-- Trigger: cuando maestro confirma → actualizar estado de sesión justificada
```

### Workflow Mínimo

1. **Maestro registra**: "Concierto Institucional 10-sep, grupo: orquesta"
   - `clases_emergentes` se crea con alcance='orquesta', alcance_config={'programa_id': '...'}
   
2. **Sistema auto-justifica**: Sesiones del maestro registrador para ese día
   - `sesiones_clase.emergente_id` = id de la actividad
   
3. **Sistema notifica**: A maestros de la orquesta que tenían clase ese día
   - Envía notificación + deep-link a confirmación
   
4. **Maestros confirman**: Sí/No/No-aplica
   - Registro en `confirmaciones_emergentes`
   - Estado de `registros_pendientes` cambia si confirmación es "sí"
   
5. **Reporte corregido**:
   - Query chequea: `emergente_id IS NOT NULL OR confirmacion='sí'` → no es "sin asistencia"

### Idempotencia + RLS
- Upsert en confirmaciones por `(maestro_id, emergente_id)`
- RLS: maestro ve sus propias confirmaciones + emergentes que le aplican (por alcance)
- RLS: admin ve todo
- No se usa service_role en frontend

### Riesgos Mitigados
- ✅ No CASCADE (ON DELETE SET NULL en sesiones_clase; confirmaciones se borran pero sesión queda)
- ✅ RLS intacta (policies existentes en sesiones_clase + nuevas en confirmaciones)
- ✅ Idempotente (unique constraints)
- ✅ Sin duplicados (constraint único por maestro+emergente)

---

## Riesgos / Incompatibilidades Grave

### 1. **Migraciones Futuras con asistencias**
- Si alguien cambia cómo se registran asistencias (ej. pasa de tabla a agregado), rompe el chequeo `COUNT(asistencias) = 0`
- **ACCIÓN PREVENTIVA**: Documentar en codigo que `getSesionesPorRango()` DEBE chequear `emergente_id` ANTES de decidir "sin asistencia"

### 2. **Confirmaciones de maestro: quién las revisa?**
- Si maestro no confirma nada, ¿la sesión queda como "pendiente" o "auto-resuelta"?
- Sin regla clara, puede generar alertas fantasma en ACM/ADM
- **ACCIÓN**: Definir timeout (ej. 24h → auto-resolver como "confirmado")

### 3. **Alcance JSONB vs. normalizado**
- JSONB es rápido para lectura pero lento para consultas complejas ("maestros de grupo X")
- Normalizar a tablas es lento en insert pero rápido en reports
- **RECOMENDACIÓN ACTUAL**: Empezar con JSONB simple (`programa_id`, `grupo_id`), migrar a tabla si crece

### 4. **Retroactividad: eventos pasados sin confirmaciones**
- Si se backfill clases_emergentes para eventos que ya ocurrieron, nadie confirmará
- Sesiones antiguas quedarán en "pendiente indefinido"
- **ACCIÓN**: En backfill, marcar confirmaciones como 'no_aplica' automáticamente

### 5. **Cascada de notificaciones**
- Si se registran 50 emergentes el mismo día, ¿se envían 50×20 maestros = 1000 notificaciones?
- Podría saturar push/WhatsApp
- **ACCIÓN**: Rate-limit en trigger o batch en RPC

---

## Conclusión

El falso positivo existe porque:
1. **`getSesionesPorRango()` no verifica `emergente_id`** → sesión con 0 asistencias pero justificada se reporta como "sin asistencia"
2. **No hay confirmación por maestro** → otros maestros del día nunca saben que hubo actividad institucional
3. **Alcance no normalizado** → imposible filtrar "aplica a mi grupo" automáticamente

La solución mínima es:
- ✅ Chequear `emergente_id` en `getSesionesPorRango()`
- ✅ Extender `clases_emergentes` con alcance simple (JSONB)
- ✅ Crear tabla `confirmaciones_emergentes` para maestros
- ✅ Trigger para notificar según alcance
- ✅ No cambiar RLS, no usar service_role en frontend

**BLOQUEADOR ANTES DE IMPLEMENTAR**: ¿Qué es "emergente_id NULL" con sesión registrada? ¿Es auto-creada sin justificación o es sesión normal? Necesita claridad para no romper lógica existente.
