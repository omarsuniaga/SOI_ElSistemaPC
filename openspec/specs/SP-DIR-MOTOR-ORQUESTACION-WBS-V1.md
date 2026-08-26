# SP-DIR-MOTOR-ORQUESTACION-WBS-V1
# Motor de Orquestación Institucional — WBS Engine, DAG de Dependencias y Project Manager Admin

**Estado:** APROBADO — LISTO PARA IMPLEMENTACIÓN  
**Stack:** Vanilla JS ES Modules · Vite · Supabase PostgreSQL · Vitest  
**Test command:** `npm run test:run`  
**Proyecto:** `sistema-academico-pwa`

---

## PROTOCOLO DE LECTURA OBLIGATORIO

1. Lee este documento completo antes de tocar un archivo.
2. Ejecuta `npm run test:run` — debe estar en verde. Si no, para y reporta.
3. Implementa en el orden exacto de la Sección 8. Cada paso tiene una verificación. No avances si la verificación falla.
4. Lee la Sección 2 (Lo que ya existe) antes de crear cualquier archivo. Está prohibido recrear lo que ya existe.
5. Lee la Sección 3 (Bugs) antes de cualquier feature. Los bugs son prerequisito bloqueante.

---

## LISTA DE PROHIBICIONES

- NO crear `eventProjectManagerEngine.js` — ya existe.
- NO crear el modal `eventProjectManagerModal.js` desde cero — ya existe, solo se modifica.
- NO crear `tareasSupabase.js` — ya existe.
- NO crear `calendarioUnificadoApi.js` — ya existe.
- NO usar `alert()` en código nuevo ni dejarlo en código modificado.
- NO hacer `SELECT *` en consultas nuevas — seleccionar columnas explícitas.
- NO crear una tabla `protocolos_wbs` — se extiende `hermes_protocolos` existente.
- NO usar TypeScript — todo es `.js` Vanilla ES Modules.
- NO crear archivos de documentación `.md` adicionales.

---

## 1. Árbol de Archivos de Este Cambio

```
NUEVOS (crear desde cero):
  src/modules/calendario/domain/dagResolutionEngine.js
  src/modules/calendario/domain/__tests__/dagResolutionEngine.test.js
  src/modules/calendario/api/wbsApi.js
  src/modules/admin-dashboard/views/proyectoManagerView.js
  supabase/migrations/20260814100000_pm_estado_bloqueada_por_dependencia.sql
  supabase/migrations/20260814100001_pm_motor_orquestacion_wbs.sql

MODIFICAR (cambios quirúrgicos, no reescribir):
  src/modules/calendario/domain/eventProjectManagerEngine.js
  src/modules/calendario/views/eventProjectManagerModal.js
  src/modules/admin-dashboard/admin-dashboard.router.js
  src/core/moduleCatalog.js
```

---

## 2. Lo que Ya Existe — No Recrear

### 2.1 `src/modules/calendario/domain/eventProjectManagerEngine.js`
Contiene: `PUNTA_CANA_VENUES` (5 recintos con capacidad, acústica, requisitos), `PROTOCOLOS_ORQUESTACION.aniversario` (12 hitos WBS con departamento, prioridad, checklist), `analizarSaludEvento()`, `calcularProgresoDepartamental()`.

Solo se modifica agregando `dependeDeTMinusDias` a cada hito (ver Sección 5).

### 2.2 `src/modules/calendario/views/eventProjectManagerModal.js`
Contiene: modal completo con radar departamental, semáforo de salud, venue scouting con asignación, listado de tareas, botón "Activar Plan WBS".

Solo se corrigen 4 bugs (ver Sección 3) y se reemplaza el handler `#btn-activar-orquestacion`.

### 2.3 Supabase — Tablas y Migraciones Ya Aplicadas
- `tareas_institucionales`: `id UUID`, `event_id UUID`, `titulo TEXT`, `departamento soi_departamento`, `estado tarea_institucional_estado`, `prioridad tarea_institucional_prioridad`, `fecha_vencimiento DATE`, `checklist JSONB`, `correlation_id UUID`, `entidad_tipo TEXT`, `entidad_id UUID`, `entidad_label TEXT`, `updated_by UUID`, `created_at`, `updated_at`.
- `calendario_institucional`: `id UUID`, `titulo TEXT`, `categoria event_categoria`, `fecha_inicio TIMESTAMPTZ`, `fecha_fin TIMESTAMPTZ`, `ubicacion TEXT`, `departamento_responsable soi_departamento`, `metadata JSONB`, `estado TEXT`.
- `hermes_protocolos`: `id UUID`, `categoria_evento event_categoria`, `nombre_protocolo TEXT`, `tareas_plantilla JSONB`, `activo BOOLEAN`.
- ENUM `soi_departamento`: `'DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT'` (LUT ya agregado en `20260626_sp2_departamento_luteria.sql`).
- ENUM `tarea_institucional_estado`: `'pendiente', 'en_progreso', 'completada', 'bloqueada', 'cancelada', 'observada'`.

---

## 3. Bugs Críticos — Resolver en Este Orden

### Bug #1 — `correlation_id` tipo TEXT vs UUID (línea 223 del modal)

**Archivo:** `src/modules/calendario/views/eventProjectManagerModal.js`

**Problema:** La columna `correlation_id` en `tareas_institucionales` es `UUID`. Se está enviando un `TEXT` con prefijo, lo que causa error de tipo en PostgreSQL. Todas las inserciones WBS fallan.

```
ANTES (línea 223):
    const correlationId = `corr-inst-${eventRawId}`

DESPUÉS:
    const correlationId = eventRawId
```

### Bug #2 — Query de carga usa formato incorrecto de `correlation_id` (línea 26 del modal)

**Archivo:** `src/modules/calendario/views/eventProjectManagerModal.js`

**Problema:** La query de carga inicial busca `correlation_id` con los prefijos texto del Bug #1. Después del fix, `correlation_id = eventRawId` (UUID puro), así que la query debe simplificarse.

```
ANTES (línea 26):
    .or(`event_id.eq.${eventRawId},correlation_id.eq.corr-inst-${eventRawId},correlation_id.eq.corr-${eventRawId}`)

DESPUÉS:
    .or(`event_id.eq.${eventRawId},correlation_id.eq.${eventRawId}`)
```

### Bug #3 — `t_minus_dias` no se persiste al insertar tareas (línea 234 del modal)

**Archivo:** `src/modules/calendario/views/eventProjectManagerModal.js`

**Problema:** El objeto de inserción no incluye `t_minus_dias`. Sin este campo en la BD, `fn_desplazar_cronograma_evento` no puede recalcular fechas al mover el evento.

Este bug se resuelve como parte del reemplazo del handler `#btn-activar-orquestacion` en la Sección 6.2. El nuevo handler usa `wbsApi.activarPlanWBS` que sí persiste `t_minus_dias`.

### Bug #4 — Todas las tareas WBS se crean como `pendiente` ignorando el DAG (línea 231 del modal)

**Archivo:** `src/modules/calendario/views/eventProjectManagerModal.js`

**Problema:** `estado: 'pendiente'` para todos los hitos. Las tareas con prerequisitos deben nacer como `bloqueada_por_dependencia`.

Este bug se resuelve como parte del reemplazo del handler en la Sección 6.2.

### Bug #5 — `alert()` en handlers del modal (líneas 204, 246, 250)

**Archivo:** `src/modules/calendario/views/eventProjectManagerModal.js`

```
ANTES (línea 204):
    alert(`✅ Recinto "${venueNombre}" asignado exitosamente al evento.`)

DESPUÉS:
    // mostrar feedback inline — ver Sección 6.2 para implementación completa
```

Los `alert()` de las líneas 246 y 250 se eliminan con el reemplazo del handler completo en Sección 6.2.

---

## 4. Migraciones SQL

### Regla crítica de PostgreSQL
`ALTER TYPE ... ADD VALUE` no puede ejecutarse en la misma transacción que el uso de ese valor. Son dos archivos separados que se aplican en orden.

---

### Migración 1 de 2 — ENUM nuevo estado

**Archivo:** `supabase/migrations/20260814100000_pm_estado_bloqueada_por_dependencia.sql`

```sql
-- Migración aislada: ADD VALUE no es transaccional con uso posterior.
-- DEBE aplicarse antes de 20260814100001.
ALTER TYPE public.tarea_institucional_estado
  ADD VALUE IF NOT EXISTS 'bloqueada_por_dependencia';
```

---

### Migración 2 de 2 — Columnas, extensiones, trigger y RPC

**Archivo:** `supabase/migrations/20260814100001_pm_motor_orquestacion_wbs.sql`

```sql
-- ================================================================
-- SP-DIR-MOTOR-ORQUESTACION-WBS-V1
-- Motor WBS, DAG de dependencias y extensiones de calendario.
-- Ejecutar DESPUÉS de 20260814100000.
-- ================================================================

-- 1. Columna DAG: arco de dependencia entre tareas
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS depende_de_tarea_id UUID
    REFERENCES public.tareas_institucionales(id) ON DELETE SET NULL;

-- 2. Columna T-Minus: offset en días desde la fecha del evento
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS t_minus_dias INT;

-- Índice parcial: solo filas con dependencia (mayoría NULL)
CREATE INDEX IF NOT EXISTS idx_tareas_dag
  ON public.tareas_institucionales(depende_de_tarea_id)
  WHERE depende_de_tarea_id IS NOT NULL;

-- 3. Extensión de calendario para macro-eventos WBS
ALTER TABLE public.calendario_institucional
  ADD COLUMN IF NOT EXISTS es_macro_evento  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS salud_proyecto   TEXT    DEFAULT 'en_orden'
    CHECK (salud_proyecto IN ('en_orden', 'en_riesgo', 'critico', 'completado')),
  ADD COLUMN IF NOT EXISTS venue_id         TEXT,
  ADD COLUMN IF NOT EXISTS aforo_proyectado INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata_pm      JSONB   DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_calendario_macro
  ON public.calendario_institucional(es_macro_evento)
  WHERE es_macro_evento = true;

-- 4. Función RPC: desplazamiento temporal Δt
-- Recibe el event_id y la cantidad de días a desplazar (positivo = futuro).
-- Actualiza SOLO tareas en estado pendiente, en_progreso o bloqueada_por_dependencia.
-- Preserva intactas las tareas completadas y canceladas.
-- Retorna el número de tareas actualizadas.
CREATE OR REPLACE FUNCTION public.fn_desplazar_cronograma_evento(
  p_event_id   UUID,
  p_delta_dias INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_rows INT;
BEGIN
  UPDATE public.tareas_institucionales
  SET
    fecha_vencimiento = fecha_vencimiento + p_delta_dias,
    updated_at        = now()
  WHERE
    event_id = p_event_id
    AND estado NOT IN ('completada', 'cancelada');

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

-- 5. Trigger: desbloqueo automático de dependientes al completar un prerequisito
CREATE OR REPLACE FUNCTION public.fn_trigger_desbloqueo_tareas_dependientes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado = 'completada' AND (OLD.estado IS DISTINCT FROM 'completada') THEN
    UPDATE public.tareas_institucionales
    SET
      estado     = 'pendiente',
      updated_at = now()
    WHERE
      depende_de_tarea_id = NEW.id
      AND estado = 'bloqueada_por_dependencia';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_desbloqueo_tareas ON public.tareas_institucionales;
CREATE TRIGGER trg_desbloqueo_tareas
  AFTER UPDATE ON public.tareas_institucionales
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_desbloqueo_tareas_dependientes();
```

---

## 5. Modificación de `eventProjectManagerEngine.js`

**Archivo:** `src/modules/calendario/domain/eventProjectManagerEngine.js`

**Qué hacer:** Agregar el campo `dependeDeTMinusDias` a cada objeto hito dentro de `PROTOCOLOS_ORQUESTACION.aniversario.hitos`. No tocar nada más en el archivo.

El campo indica el `tMinusDias` del hito prerequisito. `null` = sin prerequisito = arranca como `pendiente`.

**Reemplazar el array `hitos` completo** (líneas 75-222) con este:

```js
    hitos: [
      // FASE 1: Concepción y Scouting (T-90 a T-60 días)
      {
        tMinusDias: 90,
        dependeDeTMinusDias: null,
        departamento: 'DIR',
        prioridad: 'critica',
        titulo: '🎯 DIR: Definición de Lema, Objetivos y Comisión del Aniversario',
        checklist: [
          'Aprobar lema y concepto oficial del 5to Aniversario',
          'Definir lista de personalidades, autoridades y patrocinadores de honor',
          'Designar director musical y directores invitados',
        ],
      },
      {
        tMinusDias: 75,
        dependeDeTMinusDias: 90,
        departamento: 'ADM',
        prioridad: 'critica',
        titulo: '🏛️ ADM: Scouting, Cotización y Reserva del Recinto Oficial',
        checklist: [
          'Inspeccionar opciones de recintos (Puntacana Club, Barceló, Cap Cana)',
          'Formalizar carta de solicitud de espacio con fecha del 22 de Noviembre',
          'Confirmar aforo, disponibilidad de camerinos y tarima',
          'Asegurar contrato o carta de cortesía del recinto',
        ],
      },
      {
        tMinusDias: 70,
        dependeDeTMinusDias: 90,
        departamento: 'ACM',
        prioridad: 'alta',
        titulo: '🎼 ACM: Selección de Repertorio Oficial del Aniversario',
        checklist: [
          'Seleccionar obras para Orquesta Sinfónica, Coro y Ensamble de Iniciación',
          'Verificar niveles técnicos de los alumnos matriculados',
          'Auditar existencia y edición de partituras (score y particellas)',
          'Establecer cronograma de ensayos intensivos',
        ],
      },
      {
        tMinusDias: 60,
        dependeDeTMinusDias: 75,
        departamento: 'FIN',
        prioridad: 'alta',
        titulo: '💰 FIN: Presupuesto Maestro y Asignación de Recursos',
        checklist: [
          'Elaborar presupuesto de sonido, luces, transporte, hidratación y programas',
          'Gestionar aportes de patrocinadores con departamento de Comunicaciones',
          'Aprobar flujo de caja y desembolsos escalonados',
        ],
      },

      // FASE 2: Producción, Difusión y Montaje (T-45 a T-15 días)
      {
        tMinusDias: 45,
        dependeDeTMinusDias: 70,
        departamento: 'COM',
        prioridad: 'alta',
        titulo: '📢 COM: Campaña de Medios, Identidad Visual e Invitaciones',
        checklist: [
          'Diseñar afiche oficial del 5to Aniversario, programas de mano y banners',
          'Redactar nota de prensa y pauta en medios locales/nacionales',
          'Enviar invitaciones protocolares y habilitar registro de asistentes',
          'Coordinar equipo de fotografía y video documental',
        ],
      },
      {
        tMinusDias: 30,
        dependeDeTMinusDias: 70,
        departamento: 'LUT',
        prioridad: 'alta',
        titulo: '🎻 LUT: Mantenimiento Preventivo y Puesta a Punto de Instrumentos',
        checklist: [
          'Revisión general de cuerdas, puentes y almas de violines, violas y cellos',
          'Calibración de vientos (zapatillas, corchos y llaves)',
          'Alinear inventario de arcos con cerdas en óptimo estado',
          'Kit de emergencia de cuerdas y accesorios para el día del concierto',
        ],
      },
      {
        tMinusDias: 20,
        dependeDeTMinusDias: 70,
        departamento: 'ACM',
        prioridad: 'critica',
        titulo: '🎼 ACM: Ensayos Tutti y Evaluación de Madurez de Obras',
        checklist: [
          'Ensayo Tutti Orquesta + Coro',
          'Revisión de dinámica, balance acústico y afinación general',
          'Fijar orden exacto del programa musical y tiempos de cambio de escena',
          'Pase de lista estricto de los 100+ alumnos participantes',
        ],
      },
      {
        tMinusDias: 15,
        dependeDeTMinusDias: 20,
        departamento: 'ADM',
        prioridad: 'critica',
        titulo: '🚌 ADM: Plan Logístico de Transporte, Seguridad e Hidratación',
        checklist: [
          'Contratar flota de autobuses para traslado seguro de alumnos e instrumentos',
          'Recopilar permisos firmados de representantes legales',
          'Coordinar menú de refrigerios e hidratación para el ensayo general y concierto',
          'Plan de seguridad y primeros auxilios en el recinto',
        ],
      },

      // FASE 3: Recta Final y Concierto (T-7 a T+0 días)
      {
        tMinusDias: 7,
        dependeDeTMinusDias: 15,
        departamento: 'DIR',
        prioridad: 'critica',
        titulo: '🎯 DIR: Ensayo General en Sala y Cierre de Protocolo',
        checklist: [
          'Ensayo General acústico en el recinto oficial',
          'Confirmación final de asistencia de autoridades y diplomáticos',
          'Revisión del guión de presentación y discursos institucionales',
        ],
      },
      {
        tMinusDias: 1,
        dependeDeTMinusDias: 7,
        departamento: 'ADM',
        prioridad: 'critica',
        titulo: '📦 ADM & TEC: Montaje Técnico, Sillas, Atriles e Iluminación',
        checklist: [
          'Montaje de sillas, atriles y tarima de dirección en sala',
          'Prueba técnica de sonido, micrófonos de solistas e iluminación',
          'Habilitar mesas de acreditación y entrega de programas de mano',
        ],
      },
      {
        tMinusDias: 0,
        dependeDeTMinusDias: 1,
        departamento: 'DIR',
        prioridad: 'critica',
        titulo: '🎉 CELEBRACIÓN: Ejecución del Concierto de 5to Aniversario',
        checklist: [
          'Llegada y afinación de alumnos en camerinos',
          'Recepción de invitados especiales y público general',
          'Apertura institucional y ejecución del concierto',
          'Palabras de clausura y brindis conmemorativo',
        ],
      },

      // FASE 4: Post-Evento (T+7 días)
      {
        tMinusDias: -7,
        dependeDeTMinusDias: 0,
        departamento: 'FIN',
        prioridad: 'media',
        titulo: '📊 FIN & COM: Balance Financiero, Memoria y Agradecimientos',
        checklist: [
          'Finiquito de pagos a proveedores de sonido, transporte y catering',
          'Publicación de galería oficial y video resumen del aniversario',
          'Envío de cartas de agradecimiento a patrocinadores y recintos',
        ],
      },
    ],
```

**Verificación:** El array resultante tiene 12 elementos. Solo `tMinusDias: 90` tiene `dependeDeTMinusDias: null`. Todos los demás tienen un valor numérico que referencia otro `tMinusDias` existente en el array.

---

## 6. Archivos Nuevos a Crear

### 6.1 `dagResolutionEngine.js`

**Ruta:** `src/modules/calendario/domain/dagResolutionEngine.js`

```js
/**
 * dagResolutionEngine.js — Resolución del Grafo de Precedencia WBS.
 * Módulo puro: sin imports externos, sin side effects.
 * Todas las funciones son deterministas y testeables en aislamiento.
 */

/**
 * Dado un array de hitos con su campo dependeDeTMinusDias,
 * calcula qué estado inicial debe tener cada uno.
 *
 * Regla: si un hito tiene dependeDeTMinusDias !== null,
 * arranca como 'bloqueada_por_dependencia'.
 * Si dependeDeTMinusDias === null, arranca como 'pendiente'.
 *
 * @param {Array<{tMinusDias: number, dependeDeTMinusDias: number|null}>} hitos
 * @returns {Array<{...hito, estadoInicial: 'pendiente'|'bloqueada_por_dependencia'}>}
 */
export function resolverEstadosIniciales(hitos) {
  return hitos.map(hito => ({
    ...hito,
    estadoInicial: hito.dependeDeTMinusDias == null ? 'pendiente' : 'bloqueada_por_dependencia',
  }))
}

/**
 * Dado el array de hitos (con dependeDeTMinusDias) y el array de tareas
 * ya insertadas en BD (con sus IDs reales y t_minus_dias),
 * construye la lista de actualizaciones necesarias para enlazar el DAG.
 *
 * El matching se hace por tMinusDias (valor único dentro de un protocolo).
 *
 * @param {Array<{tMinusDias: number, dependeDeTMinusDias: number|null}>} hitos
 * @param {Array<{id: string, t_minus_dias: number}>} tareasInsertadas
 * @returns {Array<{tareaId: string, dependeDeTareaId: string}>}
 */
export function construirArcosDag(hitos, tareasInsertadas) {
  const tMinusAId = new Map(tareasInsertadas.map(t => [t.t_minus_dias, t.id]))

  return hitos
    .filter(h => h.dependeDeTMinusDias != null)
    .map(h => ({
      tareaId:          tMinusAId.get(h.tMinusDias) ?? null,
      dependeDeTareaId: tMinusAId.get(h.dependeDeTMinusDias) ?? null,
    }))
    .filter(arco => arco.tareaId !== null && arco.dependeDeTareaId !== null)
}

/**
 * Valida que el grafo de dependencias no tiene ciclos.
 * Usa detección de ciclos por seguimiento de ruta (path tracking).
 * Lanza Error si encuentra un ciclo, con el tMinusDias donde ocurre.
 *
 * @param {Array<{tMinusDias: number, dependeDeTMinusDias: number|null}>} hitos
 * @throws {Error} si hay dependencia circular o auto-referencia
 */
export function validarSinCiclos(hitos) {
  const mapa = new Map(hitos.map(h => [h.tMinusDias, h.dependeDeTMinusDias ?? null]))

  for (const [inicio] of mapa) {
    const visitados = new Set()
    let cursor = inicio

    while (cursor !== null) {
      if (visitados.has(cursor)) {
        throw new Error(
          `Ciclo detectado en el grafo DAG del protocolo WBS: tMinusDias=${cursor}`
        )
      }
      visitados.add(cursor)
      cursor = mapa.get(cursor) ?? null
    }
  }
}
```

---

### 6.2 `wbsApi.js`

**Ruta:** `src/modules/calendario/api/wbsApi.js`

```js
/**
 * wbsApi.js — Operaciones WBS del Motor de Orquestación contra Supabase.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { construirArcosDag } from '../domain/dagResolutionEngine.js'

/**
 * Activa el Plan WBS de un evento:
 *   1. Inserta los hitos como tareas_institucionales (con estado resuelto por DAG).
 *   2. Enlaza las dependencias (depende_de_tarea_id) entre las tareas insertadas.
 *   3. Marca el evento como es_macro_evento = true en calendario_institucional.
 *
 * @param {string} eventId         UUID del evento en calendario_institucional
 * @param {string} eventoTitulo    Título del evento (para descripción de tareas)
 * @param {Date}   fechaEvento     Fecha del evento (para calcular fecha_vencimiento)
 * @param {Array}  hitos           Array de hitos con estadoInicial ya resuelto
 * @returns {{ count: number }}
 */
export async function activarPlanWBS(eventId, eventoTitulo, fechaEvento, hitos) {
  const filas = hitos.map(hito => {
    const fechaVenc = new Date(fechaEvento.getTime() - hito.tMinusDias * 86_400_000)
    return {
      titulo:            hito.titulo,
      descripcion:       `Plan WBS «${eventoTitulo}» — Motor de Orquestación Institucional.`,
      departamento:      hito.departamento,
      estado:            hito.estadoInicial,
      prioridad:         hito.prioridad,
      fecha_vencimiento: fechaVenc.toISOString().split('T')[0],
      t_minus_dias:      hito.tMinusDias,
      checklist:         hito.checklist.map(item => ({ item, completado: false })),
      event_id:          eventId,
      entidad_tipo:      'evento',
      entidad_id:        eventId,
      entidad_label:     eventoTitulo,
      correlation_id:    eventId,
    }
  })

  const { data: insertadas, error: errInsert } = await supabase
    .from('tareas_institucionales')
    .insert(filas)
    .select('id, t_minus_dias')

  if (errInsert) throw errInsert

  const arcos = construirArcosDag(hitos, insertadas)
  for (const arco of arcos) {
    const { error: errArco } = await supabase
      .from('tareas_institucionales')
      .update({ depende_de_tarea_id: arco.dependeDeTareaId })
      .eq('id', arco.tareaId)

    if (errArco) throw errArco
  }

  const { error: errEvento } = await supabase
    .from('calendario_institucional')
    .update({ es_macro_evento: true })
    .eq('id', eventId)

  if (errEvento) throw errEvento

  return { count: insertadas.length }
}

/**
 * Desplaza el cronograma de un evento delta_dias días hacia el futuro (positivo)
 * o hacia el pasado (negativo). No afecta tareas completadas ni canceladas.
 *
 * @param {string} eventId    UUID del evento
 * @param {number} deltaDias  Días a desplazar
 * @returns {{ updatedCount: number }}
 */
export async function desplazarCronograma(eventId, deltaDias) {
  const { data, error } = await supabase.rpc('fn_desplazar_cronograma_evento', {
    p_event_id:   eventId,
    p_delta_dias: deltaDias,
  })
  if (error) throw error
  return { updatedCount: data }
}

/**
 * Persiste el estado de salud del proyecto en el evento del calendario.
 *
 * @param {string} eventId
 * @param {'en_orden'|'en_riesgo'|'critico'|'completado'} saludEstado
 */
export async function persistirSaludEvento(eventId, saludEstado) {
  const { error } = await supabase
    .from('calendario_institucional')
    .update({ salud_proyecto: saludEstado })
    .eq('id', eventId)
  if (error) throw error
}
```

---

### 6.3 Tests de `dagResolutionEngine`

**Ruta:** `src/modules/calendario/domain/__tests__/dagResolutionEngine.test.js`

```js
import { describe, it, expect } from 'vitest'
import {
  resolverEstadosIniciales,
  construirArcosDag,
  validarSinCiclos,
} from '../dagResolutionEngine.js'

// ─── resolverEstadosIniciales ────────────────────────────────────────────────

describe('resolverEstadosIniciales', () => {
  it('raíz (dependeDeTMinusDias null) arranca como pendiente', () => {
    const hitos = [{ tMinusDias: 90, dependeDeTMinusDias: null }]
    const result = resolverEstadosIniciales(hitos)
    expect(result[0].estadoInicial).toBe('pendiente')
  })

  it('hito con prerequisito arranca como bloqueada_por_dependencia', () => {
    const hitos = [
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
    ]
    const result = resolverEstadosIniciales(hitos)
    expect(result[0].estadoInicial).toBe('pendiente')
    expect(result[1].estadoInicial).toBe('bloqueada_por_dependencia')
  })

  it('cadena de 3: solo la raíz es pendiente', () => {
    const hitos = [
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
      { tMinusDias: 60, dependeDeTMinusDias: 75 },
    ]
    const result = resolverEstadosIniciales(hitos)
    expect(result.map(h => h.estadoInicial)).toEqual([
      'pendiente',
      'bloqueada_por_dependencia',
      'bloqueada_por_dependencia',
    ])
  })

  it('preserva todos los campos originales del hito', () => {
    const hito = { tMinusDias: 90, dependeDeTMinusDias: null, titulo: 'T-90', departamento: 'DIR' }
    const result = resolverEstadosIniciales([hito])
    expect(result[0].titulo).toBe('T-90')
    expect(result[0].departamento).toBe('DIR')
    expect(result[0].tMinusDias).toBe(90)
  })
})

// ─── construirArcosDag ───────────────────────────────────────────────────────

describe('construirArcosDag', () => {
  const hitos = [
    { tMinusDias: 90, dependeDeTMinusDias: null },
    { tMinusDias: 75, dependeDeTMinusDias: 90 },
    { tMinusDias: 70, dependeDeTMinusDias: 90 },
  ]
  const insertadas = [
    { id: 'uuid-90', t_minus_dias: 90 },
    { id: 'uuid-75', t_minus_dias: 75 },
    { id: 'uuid-70', t_minus_dias: 70 },
  ]

  it('genera arcos solo para hitos con prerequisito', () => {
    const arcos = construirArcosDag(hitos, insertadas)
    expect(arcos).toHaveLength(2)
  })

  it('mapea correctamente tMinusDias a IDs reales de BD', () => {
    const arcos = construirArcosDag(hitos, insertadas)
    expect(arcos).toContainEqual({ tareaId: 'uuid-75', dependeDeTareaId: 'uuid-90' })
    expect(arcos).toContainEqual({ tareaId: 'uuid-70', dependeDeTareaId: 'uuid-90' })
  })

  it('omite arcos con IDs no encontrados en las insertadas', () => {
    const hitosConHuerfano = [
      ...hitos,
      { tMinusDias: 50, dependeDeTMinusDias: 999 }, // 999 no existe en insertadas
    ]
    const arcos = construirArcosDag(hitosConHuerfano, insertadas)
    expect(arcos.some(a => a.tareaId === null || a.dependeDeTareaId === null)).toBe(false)
  })

  it('raíz (dependeDeTMinusDias null) no genera arco', () => {
    const soloRaiz = [{ tMinusDias: 90, dependeDeTMinusDias: null }]
    const arcos = construirArcosDag(soloRaiz, [{ id: 'uuid-90', t_minus_dias: 90 }])
    expect(arcos).toHaveLength(0)
  })
})

// ─── validarSinCiclos ────────────────────────────────────────────────────────

describe('validarSinCiclos', () => {
  it('protocolo válido no lanza error', () => {
    const hitos = [
      { tMinusDias: 90, dependeDeTMinusDias: null },
      { tMinusDias: 75, dependeDeTMinusDias: 90 },
      { tMinusDias: 70, dependeDeTMinusDias: 90 },
    ]
    expect(() => validarSinCiclos(hitos)).not.toThrow()
  })

  it('auto-referencia lanza Error', () => {
    const hitos = [{ tMinusDias: 90, dependeDeTMinusDias: 90 }]
    expect(() => validarSinCiclos(hitos)).toThrow(/ciclo/i)
  })

  it('ciclo A→B→C→A lanza Error', () => {
    const hitos = [
      { tMinusDias: 10, dependeDeTMinusDias: 30 },
      { tMinusDias: 20, dependeDeTMinusDias: 10 },
      { tMinusDias: 30, dependeDeTMinusDias: 20 },
    ]
    expect(() => validarSinCiclos(hitos)).toThrow(/ciclo/i)
  })

  it('cadena lineal larga sin ciclos no lanza error', () => {
    const hitos = Array.from({ length: 10 }, (_, i) => ({
      tMinusDias: (10 - i) * 10,
      dependeDeTMinusDias: i === 0 ? null : (10 - i + 1) * 10,
    }))
    expect(() => validarSinCiclos(hitos)).not.toThrow()
  })
})
```

---

### 6.4 `proyectoManagerView.js`

**Ruta:** `src/modules/admin-dashboard/views/proyectoManagerView.js`

```js
/**
 * proyectoManagerView.js — Dashboard de macro-eventos WBS para el Portal Admin.
 * Lista todos los proyectos con is_macro_evento = true y su semáforo de salud.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { analizarSaludEvento } from '../../calendario/domain/eventProjectManagerEngine.js'
import { abrirEventProjectManagerModal } from '../../calendario/views/eventProjectManagerModal.js'

const SEMAFORO = {
  en_orden:   { clase: 'success', icono: 'bi-check-circle-fill',     label: 'En Orden' },
  en_riesgo:  { clase: 'warning', icono: 'bi-exclamation-triangle-fill', label: 'En Riesgo' },
  critico:    { clase: 'danger',  icono: 'bi-x-octagon-fill',         label: 'Crítico' },
  completado: { clase: 'secondary', icono: 'bi-archive-fill',         label: 'Completado' },
  desconocido:{ clase: 'secondary', icono: 'bi-question-circle',      label: '—' },
}

export function renderProyectoManagerView(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = `
    <div class="pm-header d-flex align-items-center justify-content-between mb-4">
      <div>
        <h4 class="fw-bold mb-1"><i class="bi bi-kanban-fill text-primary me-2"></i>Project Manager Institucional</h4>
        <p class="text-muted small mb-0">Macro-eventos con plan WBS activo en Hermes</p>
      </div>
      <div class="d-flex gap-2">
        <select id="pm-filtro-salud" class="form-select form-select-sm" style="width: auto;">
          <option value="todos">Todos los estados</option>
          <option value="en_orden">En Orden</option>
          <option value="en_riesgo">En Riesgo</option>
          <option value="critico">Crítico</option>
          <option value="completado">Completado</option>
        </select>
      </div>
    </div>
    <div id="pm-lista" class="row g-3">
      <div class="col-12 text-center py-5 text-muted">
        <div class="spinner-border spinner-border-sm me-2"></div>Cargando proyectos...
      </div>
    </div>
    <div id="pm-modal-zone"></div>
  `

  let todosMacroEventos = []

  async function cargarProyectos() {
    const { data: eventos, error: errEvt } = await supabase
      .from('calendario_institucional')
      .select('id, titulo, fecha_inicio, ubicacion, salud_proyecto, aforo_proyectado, metadata')
      .eq('es_macro_evento', true)
      .order('fecha_inicio', { ascending: true })

    if (errEvt) {
      document.getElementById('pm-lista').innerHTML =
        `<div class="col-12"><div class="alert alert-danger small">Error al cargar proyectos: ${errEvt.message}</div></div>`
      return
    }

    if (!eventos || eventos.length === 0) {
      document.getElementById('pm-lista').innerHTML =
        `<div class="col-12 text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay macro-eventos activos.</div>`
      return
    }

    const { data: todasTareas } = await supabase
      .from('tareas_institucionales')
      .select('id, event_id, estado, prioridad, departamento, titulo, fecha_vencimiento')
      .in('event_id', eventos.map(e => e.id))

    todosMacroEventos = eventos.map(evento => {
      const tareas = (todasTareas || []).filter(t => t.event_id === evento.id)
      const salud = analizarSaludEvento(
        { fecha_inicio: evento.fecha_inicio, start: evento.fecha_inicio, title: evento.titulo, ubicacion: evento.ubicacion },
        tareas
      )
      return { evento, tareas, salud }
    })

    renderLista(todosMacroEventos)
  }

  function renderLista(proyectos) {
    const filtro = document.getElementById('pm-filtro-salud')?.value || 'todos'
    const filtrados = filtro === 'todos'
      ? proyectos
      : proyectos.filter(p => p.salud.estado === filtro)

    const lista = document.getElementById('pm-lista')
    if (!lista) return

    if (filtrados.length === 0) {
      lista.innerHTML = `<div class="col-12 text-center py-4 text-muted">Sin proyectos en estado «${filtro}».</div>`
      return
    }

    lista.innerHTML = filtrados.map(({ evento, salud }) => {
      const sem = SEMAFORO[salud.estado] || SEMAFORO.desconocido
      const diasLabel = salud.diasRestantes >= 0
        ? `T - ${salud.diasRestantes} días`
        : `T + ${Math.abs(salud.diasRestantes)} días`
      const fechaFmt = new Date(evento.fecha_inicio).toLocaleDateString('es-DO', { dateStyle: 'medium' })

      return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-${sem.clase} border-opacity-50">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-${sem.clase} d-flex align-items-center gap-1">
                  <i class="bi ${sem.icono}"></i> ${sem.label}
                </span>
                <span class="badge bg-body-secondary text-body-secondary border small">${diasLabel}</span>
              </div>
              <h6 class="fw-bold mb-1">${evento.titulo}</h6>
              <p class="text-muted small mb-3"><i class="bi bi-calendar3 me-1"></i>${fechaFmt}</p>
              <div class="progress mb-2" style="height:6px;">
                <div class="progress-bar bg-${sem.clase}" style="width:${salud.porcentaje}%"></div>
              </div>
              <div class="d-flex justify-content-between small text-muted mb-3">
                <span>${salud.completadas}/${salud.totalTareas} tareas</span>
                <span>${salud.porcentaje}% completado</span>
              </div>
              <button class="btn btn-outline-primary btn-sm w-100 btn-ver-proyecto"
                data-event-id="${evento.id}">
                <i class="bi bi-kanban me-1"></i> Ver Proyecto
              </button>
            </div>
          </div>
        </div>
      `
    }).join('')

    lista.querySelectorAll('.btn-ver-proyecto').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventId = btn.dataset.eventId
        const proyectoData = proyectos.find(p => p.evento.id === eventId)
        if (!proyectoData) return

        const eventoFc = {
          id:    `inst-${proyectoData.evento.id}`,
          title: proyectoData.evento.titulo,
          start: proyectoData.evento.fecha_inicio,
          extendedProps: {
            rawId:     proyectoData.evento.id,
            ubicacion: proyectoData.evento.ubicacion,
          },
        }
        const modalZone = document.getElementById('pm-modal-zone')
        abrirEventProjectManagerModal(eventoFc, modalZone, {
          onUpdate: cargarProyectos,
        })
      })
    })
  }

  document.getElementById('pm-filtro-salud')?.addEventListener('change', () => {
    renderLista(todosMacroEventos)
  })

  cargarProyectos()
}
```

---

## 7. Modificaciones Finales al Modal

**Archivo:** `src/modules/calendario/views/eventProjectManagerModal.js`

### 7.1 Agregar imports al principio del archivo

Después de la línea 13 (`import { actualizarEventoInstitucional } ...`), agregar:

```js
import { resolverEstadosIniciales, validarSinCiclos } from '../domain/dagResolutionEngine.js'
import { activarPlanWBS } from '../api/wbsApi.js'
```

### 7.2 Aplicar Bug #1 y Bug #2

Reemplazar **línea 26**:
```
// ANTES:
    .or(`event_id.eq.${eventRawId},correlation_id.eq.corr-inst-${eventRawId},correlation_id.eq.corr-${eventRawId}`)
// DESPUÉS:
    .or(`event_id.eq.${eventRawId},correlation_id.eq.${eventRawId}`)
```

### 7.3 Agregar zona de alertas en el HTML del modal

Dentro del template HTML, inmediatamente antes del cierre `</div>` del `cal-modal-body` (línea 177), agregar:

```html
          <div id="pm-alert-zone" class="mt-3"></div>
```

### 7.4 Reemplazar handler de venue (eliminar `alert()`)

**Reemplazar líneas 204** (el `alert` del venue):
```
// ANTES:
        alert(`✅ Recinto "${venueNombre}" asignado exitosamente al evento.`)
// DESPUÉS:
        const az = mountEl.querySelector('#pm-alert-zone')
        if (az) az.innerHTML = `<div class="alert alert-success py-2 small mb-0"><i class="bi bi-check-circle-fill me-1"></i>Recinto <strong>${venueNombre}</strong> asignado al evento.</div>`
```

**Reemplazar líneas 208-210** (el `alert` de error del venue):
```
// ANTES:
        alert('Error al asignar recinto: ' + err.message)
        btn.disabled = false
// DESPUÉS:
        const az = mountEl.querySelector('#pm-alert-zone')
        if (az) az.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Error al asignar recinto: ${err.message}</div>`
        btn.disabled = false
```

### 7.5 Reemplazar handler completo de "Activar Plan WBS"

**Reemplazar líneas 214-254 completas** con:

```js
  mountEl.querySelector('#btn-activar-orquestacion')?.addEventListener('click', async () => {
    const btn = mountEl.querySelector('#btn-activar-orquestacion')
    const az  = mountEl.querySelector('#pm-alert-zone')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Desplegando Plan...'

    try {
      const protocolo = PROTOCOLOS_ORQUESTACION.aniversario
      validarSinCiclos(protocolo.hitos)
      const hitosConEstado = resolverEstadosIniciales(protocolo.hitos)
      const fechaBase = new Date(evento.start)
      const { count } = await activarPlanWBS(eventRawId, evento.title, fechaBase, hitosConEstado)

      if (az) az.innerHTML = `<div class="alert alert-success py-2 small mb-0">
        <i class="bi bi-check-circle-fill me-1"></i>
        Plan Maestro activado — <strong>${count} tareas</strong> desplegadas en ACM, ADM, COM, FIN, DIR y LUT.
      </div>`

      setTimeout(() => { cerrarModal(); onUpdate?.() }, 1800)
    } catch (err) {
      console.error('[eventProjectManagerModal] Error al activar WBS:', err)
      if (az) az.innerHTML = `<div class="alert alert-danger py-2 small mb-0">
        <i class="bi bi-exclamation-triangle-fill me-1"></i>${err.message}
      </div>`
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-play-circle-fill me-1"></i> Activar Plan WBS'
    }
  })
```

---

## 8. Modificaciones al Admin Router y Catálogo

### 8.1 `admin-dashboard.router.js`

**Archivo:** `src/modules/admin-dashboard/admin-dashboard.router.js`

Agregar al final de la función `registerRoutesAdminDashboard()`, antes del cierre `}`:

```js
  router.register('proyecto-manager', async (container) => {
    try {
      container.innerHTML = `<div id="proyecto-manager-container" class="p-3"></div>`
      const { renderProyectoManagerView } = await import('./views/proyectoManagerView.js')
      renderProyectoManagerView('proyecto-manager-container')
    } catch (error) {
      console.error('[proyecto-manager] Error:', error)
      container.innerHTML = `<div class="pm-placeholder p-4 text-center text-muted">
        <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
        <p>Error al cargar el Project Manager: ${error.message}</p>
      </div>`
    }
  })
```

### 8.2 `moduleCatalog.js`

**Archivo:** `src/core/moduleCatalog.js`

Agregar dentro del array `moduleCatalog`, junto a los módulos de `DIR`:

```js
  module('proyecto-manager', 'src/modules/admin-dashboard/admin-dashboard.router.js', 'DIR', [
    ['proyecto-manager'],
  ]),
```

---

## 9. Plan de Ejecución — Orden Implacable

Cada paso tiene una verificación de salida. No avanzar al siguiente si la verificación falla.

```
PASO 1 — Confirmar estado inicial
  Ejecutar: npm run test:run
  Verificación: suite en verde (0 failures).
  Si falla: STOP. No continuar.

PASO 2 — Aplicar Migración 1
  Aplicar: supabase/migrations/20260814100000_pm_estado_bloqueada_por_dependencia.sql
  Verificación: SELECT unnest(enum_range(NULL::public.tarea_institucional_estado));
  Debe incluir 'bloqueada_por_dependencia' en el resultado.

PASO 3 — Aplicar Migración 2
  Aplicar: supabase/migrations/20260814100001_pm_motor_orquestacion_wbs.sql
  Verificación:
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'tareas_institucionales'
    AND column_name IN ('depende_de_tarea_id', 't_minus_dias');
    → debe retornar 2 filas.

    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'calendario_institucional'
    AND column_name IN ('es_macro_evento', 'salud_proyecto', 'venue_id', 'aforo_proyectado', 'metadata_pm');
    → debe retornar 5 filas.

PASO 4 — Crear dagResolutionEngine.js
  Crear: src/modules/calendario/domain/dagResolutionEngine.js
  (contenido completo en Sección 6.1)

PASO 5 — Crear tests del DAG
  Crear: src/modules/calendario/domain/__tests__/dagResolutionEngine.test.js
  (contenido completo en Sección 6.3)
  Ejecutar: npm run test:run
  Verificación: todos los tests de dagResolutionEngine pasan. Ningún test previo rompió.

PASO 6 — Modificar eventProjectManagerEngine.js
  Modificar: src/modules/calendario/domain/eventProjectManagerEngine.js
  Reemplazar el array hitos (Sección 5).
  Verificación: el array tiene exactamente 12 elementos.
  Solo tMinusDias: 90 tiene dependeDeTMinusDias: null.
  Ejecutar: npm run test:run → verde.

PASO 7 — Crear wbsApi.js
  Crear: src/modules/calendario/api/wbsApi.js
  (contenido completo en Sección 6.2)

PASO 8 — Modificar eventProjectManagerModal.js
  Aplicar en orden:
    8a. Agregar imports (Sección 7.1)
    8b. Fix Bug #2 línea 26 (Sección 7.2)
    8c. Agregar #pm-alert-zone en HTML (Sección 7.3)
    8d. Reemplazar alert venue (Sección 7.4)
    8e. Reemplazar handler WBS (Sección 7.5)
  Verificación: el archivo no contiene ninguna llamada a alert().
  Ejecutar: npm run test:run → verde.

PASO 9 — Crear proyectoManagerView.js
  Crear: src/modules/admin-dashboard/views/proyectoManagerView.js
  (contenido completo en Sección 6.4)

PASO 10 — Registrar ruta y catálogo
  Modificar: src/modules/admin-dashboard/admin-dashboard.router.js (Sección 8.1)
  Modificar: src/core/moduleCatalog.js (Sección 8.2)
  Ejecutar: npm run test:run → verde.

PASO 11 — Build final
  Ejecutar: npm run build
  Verificación: 0 errores. El build completa con éxito.
```

---

## 10. Criterios de Aceptación

| ID | Criterio | Cómo Verificar |
|---|---|---|
| AC-1 | "Activar Plan WBS" crea exactamente 12 tareas vinculadas al evento | `SELECT COUNT(*) FROM tareas_institucionales WHERE event_id = '<id>'` → 12 |
| AC-2 | Solo T-90 (DIR) arranca como `pendiente`. Las 11 restantes como `bloqueada_por_dependencia` | `SELECT titulo, estado FROM tareas_institucionales WHERE event_id = '<id>' ORDER BY t_minus_dias DESC` |
| AC-3 | `correlation_id` de las 12 tareas es igual al `event_id` (UUID, no texto) | `SELECT id FROM tareas_institucionales WHERE correlation_id::text != event_id::text AND event_id = '<id>'` → 0 filas |
| AC-4 | Al completar T-90, T-75 y T-70 cambian automáticamente a `pendiente` por el trigger | `UPDATE tareas_institucionales SET estado='completada' WHERE t_minus_dias=90 AND event_id='<id>'` → verificar T-75 y T-70 |
| AC-5 | `fn_desplazar_cronograma_evento('<id>', 14)` actualiza pendientes, no toca completadas | Verificar fechas antes/después. Completadas intactas. |
| AC-6 | `validarSinCiclos` lanza Error ante un ciclo, sin llegar a Supabase | Test TC-3 pasa |
| AC-7 | El archivo modal no tiene ninguna llamada a `alert()` | `grep -n "alert(" src/modules/calendario/views/eventProjectManagerModal.js` → 0 resultados |
| AC-8 | La ruta `proyecto-manager` es accesible desde el Portal Admin | Navegar a `/admin` → menú → `proyecto-manager` → carga la lista |
| AC-9 | `npm run test:run` pasa completamente verde | CI |
| AC-10 | `npm run build` completa sin errores | Terminal |
