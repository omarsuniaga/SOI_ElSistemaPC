# Diseño — Períodos + Segmentación de Campañas (subsistema 1)

**Fecha:** 2026-06-26
**Portal:** ADM · grupo de menú "Operación"
**Estado:** aprobado para implementación

## Contexto

Primer subsistema de un sistema mayor de campañas autónomas de captación/retención por
WhatsApp. Este subsistema **solo** modela los períodos de campaña y la segmentación de la
audiencia. NO envía mensajes: deja la audiencia materializada y trazable para que el
subsistema anti-ban (futuro) la despache con ritmo seguro.

### Pipeline de dominio (El Sistema Punta Cana)
```
Postulado → INICIACIÓN MUSICAL (clase introductoria: teoría/solfeo, ~3-6 meses)
          → audiciones → Coro y/o Iniciación Instrumental
```
La puerta de entrada es **Iniciación Musical** (no "Iniciación Instrumental", que es fase posterior).

## Decisiones clave

1. **Tabla `campanias_periodo` separada del `periodos` académico** (este último lo usan
   `asistencias` y `progresos` — no se sobrecarga).
2. **Reinscripción = actualizar al alumno existente** (no hay matrícula por ciclo).
3. **Cupos = en vivo desde `clases`** marcadas con flag `es_clase_iniciacion`
   (`Σ capacidad_maxima − Σ ocupación`). No se duplica capacidad en la campaña.
4. **Segmentación por intención** (no un blob): primer contacto vs recuperación.
5. **La activación NO escribe en `hermes_whatsapp_queue`** — materializa `campania_envios`.
   El puente a la cola real es del subsistema anti-ban. Evita envíos accidentales a menores.
6. **Seguridad primero**: RLS `authenticated` + `es_admin()`, sin `{public}`, revoke anon,
   vistas `security_invoker` (lecciones de la auditoría RLS del 2026-06-26).

## Modelo de datos

### `campanias_periodo`
| col | tipo | nota |
|---|---|---|
| id | uuid pk | |
| nombre | text not null | "Inscripción A 2026" |
| tipo | text | 'A' \| 'B' |
| accion | text | 'inscripcion' \| 'reinscripcion' |
| fecha_inicio / fecha_fin | date | |
| activo | bool default false | |
| periodo_academico_id | uuid null fk → periodos(id) | |
| created_at / updated_at / created_by | | |

Índice parcial único: una sola campaña activa por `(tipo, accion)`.

### `clases.es_clase_iniciacion` (columna nueva, bool default false)
Marca qué grupos son puerta de entrada. Configurable desde gestión de clases.

### `campania_envios`
| col | tipo | nota |
|---|---|---|
| id | uuid pk | |
| campania_id | uuid fk → campanias_periodo | |
| fuente | text | 'postulante' \| 'alumno' |
| persona_id | uuid | id en postulantes/alumnos |
| nombre | text | |
| telefono / jid | text | normalizado |
| segmento | text | 'primer_contacto' \| 'recuperacion' \| 'reinscripcion' |
| mensaje | text | render de la plantilla |
| estado | text default 'pendiente_envio' | pendiente_envio\|encolado\|enviado\|fallido\|opt_out |
| created_at / updated_at | | |

Único `(campania_id, jid)` → dedup por teléfono.

### `vw_cupos_iniciacion` (security_invoker)
Grupos de iniciación con capacidad, ocupación y disponible.

## Segmentación (server-side, SECURITY DEFINER, admin-gated)

**Inscripción (postulantes):**
- primer_contacto: `estado IN ('postulado','contactado','en_espera')`
- recuperacion: `estado IN ('no_show','reprogramado')`
- excluidos: `cita_agendada, documentos_ok, inscrito, descartado`
- filtro tipo: A → `month(fecha_postulacion) BETWEEN 1 AND 6`; B → `7..12`
- teléfono: `coalesce(normalize_phone(madre_tlf_whatsapp), padre_tlf_whatsapp, telefono_alumno)`

**Reinscripción (alumnos):**
- `activo = true` (todos los programas), segmento 'reinscripcion'
- teléfono: `coalesce(madre, padre, representante_tlf, tlf_alumno)` normalizado

Común: dedup por jid, `sin_telefono` se reporta aparte.

## Funciones (RPC)
- `fn_preview_campania(p_id uuid) → json` — conteos por segmento + cupo. Solo lectura.
- `fn_activar_campania(p_id uuid) → json` — materializa `campania_envios` (dedup), activa
  la campaña, devuelve conteos. NO toca la cola viva.

Ambas: `EXECUTE` solo a `authenticated`, revoke anon, chequean `es_admin()`.

## UI — vista `campanias` (menú Operación)
- Lista de campañas (activar/desactivar, cupo en vivo para inscripción).
- Crear/editar campaña (mínimo).
- Panel de ejecución: **Previsualizar audiencia** (obligatorio) → **Activar y materializar**
  (con confirmación; warning si audiencia > cupo).
- Theme-aware + responsive.

## Dependencia explícita
El envío real está **bloqueado** hasta el subsistema anti-ban (delays/warm-up/opt-out).
Hoy `process-whatsapp-queue.js` envía sin pausa: NO activar campañas contra la cola real
hasta tener ese hardening. Este subsistema solo materializa `campania_envios`.
