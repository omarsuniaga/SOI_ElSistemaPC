# Spec: Módulo Postulados — El Sistema Punta Cana

**Agente:** Antigravity  
**Revisor:** Claude (Gentleman AI)  
**Estado:** PENDIENTE DE IMPLEMENTACIÓN  
**Fecha de emisión:** 2026-05-30  
**Stack:** Vanilla JS · Bootstrap 5.3 · Supabase · Vite · Vitest

---

## 1. Contexto del sistema

El proyecto es una PWA administrativa para El Sistema Punta Cana. No usa frameworks de componentes (sin React, sin Vue). El patrón es:

- Módulos en `src/modules/<nombre>/`
- Cada módulo tiene: `api/`, `views/`, `domain/`, `models/`, `styles/`
- El router es un SPA custom: `src/core/router/router.js`
- Rutas se registran con `router.register('nombre-ruta', handlerFn)`
- El nav se define en `src/main.js` en el array `NAV_GROUPS`
- Supabase client: `src/lib/supabaseClient.js`
- Tests: Vitest, en `tests/unit/<modulo>/`

### Archivos existentes relevantes

```
src/modules/alumnos/api/postulantesApi.js        ← dispatcher mock/real
src/modules/alumnos/api/postulantesSupabase.js   ← implementación Supabase
src/modules/alumnos/api/postulantesMock.js       ← implementación mock
tests/unit/alumnos/api/postulantesMock.test.js   ← tests existentes
```

### API existente (NO modificar firmas)

```js
buscarPostulante(query)          // busca por nombre o teléfono
obtenerPostulante(id)            // fetch por id
listarPostulantes()              // lista completa
sincronizarPostulantes()         // invoca edge function sync-postulantes
backfillDesdePostulantes(dryRun) // rpc backfill_alumnos_desde_postulantes
```

---

## 2. Máquina de estados del postulante

```
postulado
    │
    ▼ (admin inicia contacto)
contactado
    │
    ├── descartado  (representante no responde / desiste)
    │
    ▼ (se agenda cita)
cita_agendada
    │
    ├── no_show     (no llegó → puede pasar a reprogramado)
    ├── reprogramado → cita_agendada
    │
    ▼ (llega el día, documentos revisados)
documentos_ok
    │
    ├── en_espera   (no hay cupo en instrumento → espera turno)
    │
    ▼ (admin completa wizard de inscripción)
inscrito
```

**Campos de estado en la tabla `postulantes`:**

```sql
estado TEXT DEFAULT 'postulado'
  CHECK (estado IN (
    'postulado','contactado','cita_agendada','documentos_ok',
    'inscrito','no_show','reprogramado','en_espera','descartado'
  ))
fecha_contacto        TIMESTAMPTZ
fecha_cita            TIMESTAMPTZ
notas_seguimiento     TEXT
alumno_id             UUID REFERENCES alumnos(id)
```

> **IMPORTANTE:** Antes de implementar, verificar si estas columnas ya existen en la tabla. Si no existen, crear la migración SQL correspondiente y documentarla en `src/modules/alumnos/api/postulantesSupabase.js` como comentario al inicio del archivo.

---

## 3. Estructura de archivos a crear

```
src/modules/alumnos/
  views/
    postulados/
      postuladosView.js          ← listado principal
      postuladoPerfilView.js     ← perfil individual + pipeline
      postuladoCalendarioView.js ← vista de citas del mes
  domain/
    postuladoStateMachine.js     ← reducer puro de transiciones de estado
  api/
    postuladosSupabase.js        ← operaciones de estado + citas
    postuladosMock.js            ← mock para tests

tests/unit/alumnos/
  domain/
    postuladoStateMachine.test.js
  api/
    postuladosMock.test.js
```

---

## 4. Fase 1 — Estado machine (dominio puro)

### `src/modules/alumnos/domain/postuladoStateMachine.js`

Reducer puro, sin I/O, sin DOM. Exportar:

```js
/**
 * Mapa de transiciones válidas.
 * estado_actual → [estados_permitidos]
 */
export const TRANSICIONES = {
  postulado:      ['contactado', 'descartado'],
  contactado:     ['cita_agendada', 'descartado'],
  cita_agendada:  ['documentos_ok', 'no_show', 'descartado'],
  no_show:        ['reprogramado', 'descartado'],
  reprogramado:   ['cita_agendada', 'descartado'],
  documentos_ok:  ['inscrito', 'en_espera'],
  en_espera:      ['cita_agendada', 'descartado'],
  inscrito:       [],
  descartado:     [],
}

/**
 * Etiquetas legibles por estado.
 */
export const ESTADO_LABELS = {
  postulado:     'Postulado',
  contactado:    'Contactado',
  cita_agendada: 'Cita agendada',
  documentos_ok: 'Documentos OK',
  inscrito:      'Inscrito',
  no_show:       'No show',
  reprogramado:  'Reprogramado',
  en_espera:     'En espera',
  descartado:    'Descartado',
}

/**
 * Colores Bootstrap por estado.
 */
export const ESTADO_COLOR = {
  postulado:     'secondary',
  contactado:    'info',
  cita_agendada: 'primary',
  documentos_ok: 'warning',
  inscrito:      'success',
  no_show:       'danger',
  reprogramado:  'warning',
  en_espera:     'secondary',
  descartado:    'dark',
}

/**
 * Verifica si una transición es válida.
 * @param {string} estadoActual
 * @param {string} estadoNuevo
 * @returns {boolean}
 */
export function puedeTransicionar(estadoActual, estadoNuevo) { ... }

/**
 * Devuelve las acciones disponibles para un estado dado.
 * @param {string} estado
 * @returns {string[]}
 */
export function accionesDisponibles(estado) { ... }

/**
 * Aplica una transición. Retorna el nuevo estado completo del postulante.
 * Lanza Error si la transición no es válida.
 * @param {object} postulante
 * @param {string} nuevoEstado
 * @param {object} [meta] - datos adicionales (fecha_cita, notas, alumno_id)
 * @returns {object} postulante actualizado (sin mutación)
 */
export function aplicarTransicion(postulante, nuevoEstado, meta = {}) { ... }
```

---

## 5. Fase 2 — API Supabase

### `src/modules/alumnos/api/postuladosSupabase.js`

```js
/**
 * Cambia el estado de un postulante y actualiza campos relacionados.
 * @param {string} id
 * @param {string} nuevoEstado
 * @param {object} meta - { fecha_cita?, notas_seguimiento?, alumno_id? }
 */
export async function actualizarEstadoPostulante(id, nuevoEstado, meta = {}) { ... }

/**
 * Lista postulantes filtrados por mes de creación.
 * @param {number} year
 * @param {number} month  (1-12)
 * @returns {Promise<object[]>}
 */
export async function listarPostulantesPorMes(year, month) { ... }

/**
 * Lista citas agendadas en un rango de fechas.
 * @param {string} desde  ISO date string
 * @param {string} hasta  ISO date string
 * @returns {Promise<object[]>}
 */
export async function listarCitas(desde, hasta) { ... }

/**
 * Verifica si hay conflicto de cita en un slot dado (±30 min).
 * @param {string} fechaHora ISO datetime
 * @param {string} [excludeId] id a excluir de la verificación
 * @returns {Promise<boolean>}
 */
export async function hayConflictoCita(fechaHora, excludeId = null) { ... }

/**
 * Agrega una nota de seguimiento al postulante.
 */
export async function agregarNota(id, nota) { ... }
```

### Actualizar `postulantesApi.js`

Agregar los nuevos exports al dispatcher sin romper los existentes:

```js
export const actualizarEstadoPostulante = (...args) => getApi().actualizarEstadoPostulante(...args)
export const listarPostulantesPorMes    = (...args) => getApi().listarPostulantesPorMes(...args)
export const listarCitas                = (...args) => getApi().listarCitas(...args)
export const hayConflictoCita           = (...args) => getApi().hayConflictoCita(...args)
export const agregarNota                = (...args) => getApi().agregarNota(...args)
```

### Actualizar `postulantesMock.js`

Implementar las mismas funciones con datos en memoria. El estado mock debe:
- Mantener estado en `let data = [...]` mutable durante el test
- `actualizarEstadoPostulante` debe validar la transición usando `postuladoStateMachine.puedeTransicionar`
- `listarPostulantesPorMes` filtra por `created_at`
- `hayConflictoCita` compara `fecha_cita` de los otros postulantes en el array

---

## 6. Fase 3 — Vistas

### 6.1 `postuladosView.js` — Listado principal

**Ruta:** `postulados`

**Layout:**

```
[Header] Postulados   [Selector mes: ← Mayo 2026 →]   [Sincronizar]

[Filtros: Todos | Postulado | Contactado | Cita agendada | ... ]

[Tabla / Lista]:
  Nombre          Instrumento  Teléfono   Estado           Fecha post.   Acción
  ─────────────────────────────────────────────────────────────────────────────
  María García    Violín       829-xxx    🔵 Contactado    15 may        [Ver →]
  Luis Pérez      Piano        809-xxx    🟡 Cita agendada  18 may       [Ver →]
```

**Requisitos:**
- Al cargar: `listarPostulantesPorMes(year, mes_actual)`
- Selector de mes: flechas ← → cambian el mes y recargan
- Filtro por estado: pills clicables, `activo` resalta en azul
- Click en fila → `router.navigate('postulado', { id })`
- Botón "Sincronizar": invoca `sincronizarPostulantes()` con spinner
- Badge de color por estado usando `ESTADO_COLOR`
- Si lista vacía → mensaje "No hay postulantes este mes"
- Mostrar conteo por estado en los filtros: `Contactado (3)`

### 6.2 `postuladoPerfilView.js` — Perfil individual

**Ruta:** `postulado` (params: `{ id }`)

**Layout:**

```
← Volver a Postulados

[Header card]
  Avatar  Nombre completo
          Estado actual (badge)  ·  Postulado: 15 may 2026
          Instrumento interés  ·  Edad
          [WhatsApp madre] [WhatsApp padre] [Iniciar inscripción]

[Pipeline visual]
  ● postulado → ● contactado → ○ cita_agendada → ○ documentos_ok → ○ inscrito

[Tabs: Datos | Seguimiento | Acciones]

Tab Datos:
  Datos del postulante (solo lectura), todos los campos del Google Form

Tab Seguimiento:
  Timeline de cambios de estado con fecha y nota
  [+ Agregar nota]

Tab Acciones:
  Botones para transicionar al siguiente estado
  (solo los estados válidos según TRANSICIONES)
```

**Botones de acción por estado:**

| Estado actual | Botones disponibles |
|---------------|---------------------|
| `postulado` | "Iniciar contacto" (genera WA link) · "Descartar" |
| `contactado` | "Agendar cita" (abre date/time picker) · "Descartar" |
| `cita_agendada` | "Confirmar documentos" · "No show" · "Descartar" |
| `no_show` | "Reprogramar cita" · "Descartar" |
| `reprogramado` | "Agendar nueva cita" · "Descartar" |
| `documentos_ok` | **"Iniciar inscripción"** · "Poner en espera" |
| `en_espera` | "Agendar cita" · "Descartar" |
| `inscrito` | (solo lectura) Link al perfil del alumno |
| `descartado` | (solo lectura) |

**"Iniciar inscripción"** debe:
1. Navegar a `alumnos-inscribir`
2. El wizard debe detectar `_postulante_id` en el draft y precargar datos del postulante
3. Al finalizar, marcar postulante como `inscrito` y guardar `alumno_id`

> El mecanismo de precarga ya existe en `WizardShell.js` vía `mountPreloadSearch`. Usar `PreloadSearch.js` o el draft storage para pasar los datos.

**"Iniciar contacto"** genera este link:

```js
const msg = encodeURIComponent(
  `Hola ${nombreRepresentante}, le contactamos de El Sistema Punta Cana. ` +
  `Hemos recibido la postulación de ${nombreAlumno} y queremos iniciar el proceso de inscripción. ` +
  `¿Cuándo podría venir a nuestra sede para la entrevista?`
)
const waUrl = `https://wa.me/${telefono}?text=${msg}`
```

**Agendar cita:**
1. Mostrar datetime-local input
2. Llamar `hayConflictoCita(fechaHora)` antes de confirmar
3. Si hay conflicto → mostrar error con la cita existente
4. Si libre → `actualizarEstadoPostulante(id, 'cita_agendada', { fecha_cita })`

### 6.3 `postuladoCalendarioView.js` — Calendario de citas

**Ruta:** `postulados-calendario`

**Layout:** Grid semanal simple del mes actual.
- Cada celda = 1 día
- Los postulantes con `fecha_cita` aparecen en su día con nombre + hora
- Click en tarjeta → navega al perfil del postulante
- Selector mes ← →

---

## 7. Registro de rutas y nav

### `src/modules/alumnos/alumnos.router.js`

Agregar:

```js
import { renderPostuladosView }       from './views/postulados/postuladosView.js'
import { renderPostuladoPerfilView }  from './views/postulados/postuladoPerfilView.js'
import { renderPostuladoCalendarioView } from './views/postulados/postuladoCalendarioView.js'

router.register('postulados',            renderPostuladosView)
router.register('postulado',             renderPostuladoPerfilView)
router.register('postulados-calendario', renderPostuladoCalendarioView)
```

### `src/main.js` — NAV_GROUPS

En el grupo `personas`, agregar:

```js
{ id: 'postulados',            label: 'Postulados',         icon: 'bi-person-plus-fill' },
{ id: 'postulados-calendario', label: 'Calendario Citas',   icon: 'bi-calendar-event' },
```

---

## 8. Tests requeridos

Todos los tests deben pasar con `npx vitest run`. No se acepta ningún test en `.skip` o `todo` sin justificación.

### 8.1 `tests/unit/alumnos/domain/postuladoStateMachine.test.js`

```js
describe('puedeTransicionar', () => {
  it('permite postulado → contactado')
  it('permite contactado → cita_agendada')
  it('permite cita_agendada → no_show')
  it('permite no_show → reprogramado')
  it('permite documentos_ok → inscrito')
  it('permite documentos_ok → en_espera')
  it('NO permite postulado → inscrito (salto de estado)')
  it('NO permite inscrito → cualquier estado (estado terminal)')
  it('NO permite descartado → cualquier estado (estado terminal)')
  it('NO permite transición a estado inexistente')
})

describe('aplicarTransicion', () => {
  it('retorna nuevo objeto con estado actualizado (sin mutación)')
  it('lanza Error cuando la transición no es válida')
  it('incluye fecha_cita en el resultado cuando se pasa en meta')
  it('incluye notas_seguimiento en el resultado cuando se pasa en meta')
  it('incluye alumno_id cuando se transiciona a inscrito')
})

describe('accionesDisponibles', () => {
  it('devuelve acciones correctas para estado postulado')
  it('devuelve array vacío para inscrito')
  it('devuelve array vacío para descartado')
})
```

### 8.2 `tests/unit/alumnos/api/postuladosMock.test.js`

```js
describe('listarPostulantesPorMes', () => {
  it('filtra correctamente por año y mes')
  it('devuelve array vacío si no hay postulantes ese mes')
  it('no mezcla postulantes de meses distintos')
})

describe('actualizarEstadoPostulante', () => {
  it('actualiza estado correctamente en transición válida')
  it('lanza Error en transición inválida (usa puedeTransicionar)')
  it('guarda fecha_cita cuando se transiciona a cita_agendada')
  it('retorna el postulante actualizado')
})

describe('hayConflictoCita', () => {
  it('devuelve true si ya hay cita en el mismo slot ±30min')
  it('devuelve false si el slot está libre')
  it('excluye el propio id al verificar conflicto (reprogramación)')
})

describe('agregarNota', () => {
  it('añade la nota al campo notas_seguimiento del postulante')
  it('concatena con notas anteriores si ya había texto')
})
```

### 8.3 Tests existentes — NO romper

Correr antes de entregar:

```bash
npx vitest run tests/unit/alumnos/api/postulantesMock.test.js
npx vitest run tests/unit/alumnos/wizard/
npx vitest run tests/unit/alumnos/domain/
```

Todos deben seguir en verde. Si alguno rompe por los cambios, corregirlo.

---

## 9. Restricciones y reglas

1. **Sin frameworks**: solo Vanilla JS. Sin React, Vue, Svelte.
2. **Bootstrap 5.3** para estilos. Las clases deben ser BS5 nativas.
3. **Sin comentarios obvios**: solo comentar WHY, nunca WHAT.
4. **Imports relativos**: usar rutas relativas, no aliases.
5. **No tocar** `postulantesApi.js` más allá de agregar exports.
6. **No tocar** `postulantesMock.js` existente — crear `postuladosMock.js` nuevo.
7. **No tocar** `postulantesMock.test.js` — agregar `postuladosMock.test.js` nuevo.
8. **El wizard existente no se modifica** en su lógica central. Solo se agrega el mecanismo de precarga desde postulante vía draft storage.
9. **Cada función async debe tener try/catch** con feedback visible al usuario (no console.error silencioso).
10. **Mobile-first**: todas las vistas deben funcionar en pantalla de 375px.

---

## 10. Checklist de aceptación (para revisión del revisor)

El revisor (Claude) validará punto por punto antes de aprobar:

### Funcionalidad core
- [ ] Ruta `postulados` carga y muestra lista filtrada por mes actual
- [ ] Selector de mes ← → funciona y recarga datos
- [ ] Filtros por estado funcionan y muestran conteo
- [ ] Click en postulante navega al perfil
- [ ] Perfil muestra todos los datos del Google Form
- [ ] Pipeline visual refleja el estado actual correctamente
- [ ] Botones de acción corresponden exactamente a `TRANSICIONES[estadoActual]`
- [ ] "Iniciar contacto" genera link WhatsApp con mensaje correcto
- [ ] "Agendar cita" valida conflicto antes de guardar
- [ ] "Iniciar inscripción" abre wizard con datos precargados del postulante
- [ ] Al finalizar wizard, postulante queda en estado `inscrito` con `alumno_id`
- [ ] Calendario muestra citas del mes en grid por día
- [ ] Ruta `postulados-calendario` accesible desde nav

### Máquina de estados
- [ ] `puedeTransicionar` rechaza saltos de estado inválidos
- [ ] `aplicarTransicion` no muta el objeto original
- [ ] Estados terminales (`inscrito`, `descartado`) no permiten transición

### Tests
- [ ] `npx vitest run` pasa en verde (0 failures)
- [ ] `postuladoStateMachine.test.js` cubre todos los casos del checklist §8.1
- [ ] `postuladosMock.test.js` cubre todos los casos del checklist §8.2
- [ ] Tests existentes no rotos

### Calidad
- [ ] Sin `console.error` sin feedback al usuario
- [ ] Vista funcional en 375px (mobile)
- [ ] No hay imports rotos (sin `module not found` en consola)
- [ ] Estados con badge de color correcto (ESTADO_COLOR)
- [ ] Lista vacía muestra mensaje, no pantalla en blanco

---

## 11. Entregables esperados

```
src/modules/alumnos/domain/postuladoStateMachine.js
src/modules/alumnos/api/postuladosSupabase.js
src/modules/alumnos/api/postuladosMock.js
src/modules/alumnos/views/postulados/postuladosView.js
src/modules/alumnos/views/postulados/postuladoPerfilView.js
src/modules/alumnos/views/postulados/postuladoCalendarioView.js
tests/unit/alumnos/domain/postuladoStateMachine.test.js
tests/unit/alumnos/api/postuladosMock.test.js
```

Archivos modificados:

```
src/modules/alumnos/alumnos.router.js   (agregar 3 rutas)
src/modules/alumnos/api/postulantesApi.js (agregar 5 exports)
src/modules/alumnos/api/postulantesMock.js (agregar 5 funciones nuevas)
src/main.js (agregar 2 items al nav grupo personas)
```

---

## 12. Notas para el agente

- Trabajar directamente en `master` — el dev server corre desde `C:\Users\omare\...\sistema-academico-pwa\` (NO desde un worktree).
- Probar cada vista navegando manualmente en `localhost:5173/admin`.
- Ante cualquier duda sobre estructura de la tabla `postulantes`, revisar `postulantesSupabase.js` y `postulantesMock.js` existentes — ahí están los campos reales.
- El campo `estado` puede no existir aún en la tabla Supabase. Documentar la migración SQL necesaria como comentario en `postuladosSupabase.js`.
- Si un campo de la tabla no existe, no fallar silenciosamente — mostrar mensaje claro en la UI.
