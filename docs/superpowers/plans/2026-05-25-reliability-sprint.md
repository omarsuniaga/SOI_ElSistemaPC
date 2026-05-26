# Reliability Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar el proyecto de 7.5 → 8.5/9 agregando cobertura de tests críticos en el observation parser, aplicando la migración DB pendiente para integridad de datos, y consolidando la capa de robustez operacional (paginación, CHANNEL_ERROR, error handling consistente).

**Architecture:** Tres tareas en orden secuencial (Tests → Migración → Reliability). Cada tarea es independiente y produce un commit propio. Los tests se escriben primero para validar el parser antes de que más datos entren a la DB.

**Tech Stack:** Vitest 4 + jsdom, Supabase CLI, Vanilla JS ES Modules (sin bundler, sin TypeScript).

---

## Contexto del proyecto

- **Repo:** `C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa`
- **Test runner:** `npx vitest run` (configurado en `package.json`)
- **Supabase CLI:** disponible en el entorno
- **Framework:** ninguno — Vanilla JS ES Modules puros

---

## Archivos que se modifican

| Archivo | Acción |
|---------|--------|
| `src/portal-maestros/utils/__tests__/observationParser.test.js` | Modificar — agregar 8 nuevos `it()` |
| `src/portal-maestros/views/alumnoPerfilView.js` | Modificar — paginación en `_renderProgresos` |
| `src/main-maestros.js` | Modificar — cleanup de canal Realtime antes de re-suscribir |
| `src/portal-maestros/views/asistenciaView.js` | Modificar — `safeAsync` wrapper |
| `supabase/migrations/20260525_progresos_unique_constraint.sql` | Aplicar vía CLI (no modificar el archivo) |

---

## Task 1: Tests — Expandir cobertura del observation parser

**Files:**
- Modify: `src/portal-maestros/utils/__tests__/observationParser.test.js`

### Contexto crítico para el agente

El archivo `observationParser.js` exporta estas funciones públicas relevantes:
```js
export function segmentObservation(text, context)
// context = { alumnos: [{ id, nombre, nombreCorto }], presentes: [...misma estructura] }
// Retorna: Array de grupos con { alumnos, estado, fragment, scope, alerta, alertDetails, requires_confirmation, excludeIds, esColectivo }
```

Las funciones privadas (`_isMetaCommentary`, `_attachImplicitSubject`, `_splitDualAlerts`) **NO están exportadas**. Se testean indirectamente mediante `segmentObservation`.

El archivo de tests **ya existe** con 5 `it()` pasando. Solo se agregan nuevos bloques `describe` al final del archivo, **dentro** del `describe('Hardened Observation Parser (v2) Tests', () => { ... })` externo.

---

- [ ] **Step 1: Leer el archivo de tests actual para ver el estado exacto**

```bash
cat "src/portal-maestros/utils/__tests__/observationParser.test.js"
```

Expected: ver los 5 `it()` existentes en los bloques `normalizeText`, `detectState`, `segmentSentences`, `buildRosterLookup & findMentionedStudents`, `segmentObservation`.

---

- [ ] **Step 2: Verificar que los tests existentes pasan antes de modificar**

```bash
npx vitest run src/portal-maestros/utils/__tests__/observationParser.test.js
```

Expected: `5 tests passed`. Si falla alguno, NO continuar — reportar el error.

---

- [ ] **Step 3: Agregar los 8 nuevos tests al archivo**

Agregar estos bloques **dentro** del `describe('Hardened Observation Parser (v2) Tests', ...)` existente, justo antes del `})` de cierre del describe externo (al final del archivo antes de la última `}`):

```js
  // 6. Meta-commentary filter
  describe('_isMetaCommentary (via segmentObservation)', () => {
    const roster = [
      { id: '1', nombre: 'Matias Carmen Paredes', nombreCorto: 'Matias Carmen' }
    ]

    it('should NOT generate a group for institutional meta-commentary sentences', () => {
      const txt = 'Es fundamental que continuemos trabajando en la práctica para asegurarnos de que todos progresen.'
      const groups = segmentObservation(txt, { alumnos: roster, presentes: roster })
      expect(groups).toHaveLength(0)
    })

    it('should generate a group when "continuó trabajando" refers to a specific student, not meta-commentary', () => {
      const txt = 'Matias continuó trabajando en la escala de Sol y mostró mejoras.'
      const groups = segmentObservation(txt, { alumnos: roster, presentes: roster })
      expect(groups).toHaveLength(1)
      expect(groups[0].alumnos[0].id).toBe('1')
    })
  })

  // 7. Implicit subject inheritance
  describe('_attachImplicitSubject (via segmentObservation)', () => {
    const roster = [
      { id: '1', nombre: 'Evans Rodriguez Leonardo', nombreCorto: 'Evans Rodriguez' },
      { id: '2', nombre: 'Matias Carmen Paredes', nombreCorto: 'Matias Carmen' }
    ]

    it('should inherit last individual student when "el alumno" pronoun appears', () => {
      const txt = 'Evans logró ubicar el primer dedo correctamente. El alumno además demostró buena postura.'
      const groups = segmentObservation(txt, { alumnos: roster, presentes: roster })
      expect(groups).toHaveLength(2)
      expect(groups[0].alumnos[0].id).toBe('1')
      expect(groups[1].alumnos[0].id).toBe('1') // hereda Evans
    })

    it('should NOT inherit when the previous subject is a collective group', () => {
      const txt = 'Toda la clase trabajó con entusiasmo hoy. El alumno mostró avances generales.'
      const groups = segmentObservation(txt, { alumnos: roster, presentes: roster })
      // El segundo grupo no debe heredar ningún alumno individual
      const inheritedGroup = groups.find(g => g.fragment.includes('El alumno'))
      if (inheritedGroup) {
        // Si existe, su scope debe ser colectivo o sin alumno individual específico
        expect(inheritedGroup.alumnos.length).not.toBe(1)
      }
    })
  })

  // 8. Implicit collective (paragraphs with no named students → grupo)
  describe('isImplicitColectivo (via segmentObservation)', () => {
    const roster = [
      { id: '1', nombre: 'Evans Rodriguez Leonardo', nombreCorto: 'Evans Rodriguez' },
      { id: '2', nombre: 'Matias Carmen Paredes', nombreCorto: 'Matias Carmen' }
    ]

    it('should assign scope "grupo" and fill alumnos with presentes when no student is named', () => {
      const txt = 'Hoy revisamos la lección 11 de CrickBoom y practicamos los compases 33 al 40.'
      const groups = segmentObservation(txt, { alumnos: roster, presentes: roster })
      expect(groups).toHaveLength(1)
      expect(groups[0].scope).toBe('grupo')
      expect(groups[0].alumnos.length).toBe(2)
    })
  })

  // 9. Integration — full CrickBoom observation text
  describe('Integration: full CrickBoom observation', () => {
    const roster = [
      { id: '1', nombre: 'Evans Rodriguez Leonardo', nombreCorto: 'Evans Rodriguez' },
      { id: '2', nombre: 'Matias Carmen Paredes', nombreCorto: 'Matias Carmen' },
      { id: '3', nombre: 'Alfred Smith Jones', nombreCorto: 'Alfred Smith' }
    ]

    it('should produce exactly 4 groups and filter the meta-commentary sentence', () => {
      const txt = [
        'Hoy en clase, revisamos la lección n° 11 de CrickBoom y practicamos los compases 33 al 40.',
        'Matias dominó muy bien la pieza y tocó con seguridad todos los compases.',
        'Evans sigue mostrando dificultad para colocar correctamente la mano izquierda.',
        'Algunos alumnos ya están tocando Estrellita con ambas manos.',
        'Es fundamental que continuemos trabajando en la práctica y la repetición para asegurarnos de que todos los alumnos estén progresando de manera equilibrada.'
      ].join(' ')

      const groups = segmentObservation(txt, { alumnos: roster, presentes: roster })

      // La oración meta-commentary debe ser filtrada → 4 grupos, no 5
      expect(groups).toHaveLength(4)

      // Grupo 0: lección colectiva (sin alumnos nombrados → isImplicitColectivo)
      expect(groups[0].scope).toBe('grupo')

      // Grupo 1: Matias con LOGRADO
      expect(groups[1].alumnos[0].id).toBe('2')
      expect(groups[1].estado.value).toBe('LOGRADO')

      // Grupo 2: Evans con alerta RIESGO_PEDAGOGICO
      expect(groups[2].alumnos[0].id).toBe('1')
      expect(groups[2].alerta).toBe(true)
      expect(groups[2].alertDetails.type).toBe('RIESGO_PEDAGOGICO')

      // Grupo 3: "Algunos alumnos" → subgrupo indeterminado
      expect(groups[3].scope).toBe('subgrupo_indeterminado')
      expect(groups[3].requires_confirmation).toBe(true)
    })
  })
```

---

- [ ] **Step 4: Ejecutar todos los tests para verificar que los 8 nuevos pasan**

```bash
npx vitest run src/portal-maestros/utils/__tests__/observationParser.test.js
```

Expected: `13 tests passed, 0 failed` (5 existentes + 8 nuevos).

Si alguno falla, leer el mensaje de error completo e investigar `observationParser.js` antes de intentar un fix. **No modificar el test para que pase — modificar la implementación si hay un bug real.**

---

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/utils/__tests__/observationParser.test.js
git commit -m "test(parser): add 8 tests covering meta-commentary, implicit subject, collective scope, integration"
```

---

## Task 2: Migración DB — Aplicar índice UNIQUE parcial en progresos

**Files:**
- Apply: `supabase/migrations/20260525_progresos_unique_constraint.sql` (no modificar)

### Contexto crítico para el agente

La migración ya existe en el repo. Crea un índice UNIQUE parcial `progresos_upsert_idx` en la tabla `progresos` que evita duplicados cuando `contenido_dsl IS NOT NULL`. Sin este índice, el upsert puede generar registros duplicados en producción.

**IMPORTANTE:** El comando `supabase db push` aplica **todas** las migraciones pendientes, no solo esta. Si hay otras migraciones pendientes en el repo que no están en producción, también se aplicarán. Verificar primero con `supabase migration list`.

---

- [ ] **Step 1: Verificar estado de migraciones pendientes**

```bash
supabase migration list
```

Expected: listar migraciones aplicadas (✓) y pendientes (✗). La migración `20260525_progresos_unique_constraint` debe aparecer como pendiente (✗).

Si otras migraciones también están pendientes, revisar su contenido antes de continuar para asegurarse de que son seguras de aplicar.

---

- [ ] **Step 2: Aplicar la migración**

```bash
supabase db push
```

Expected output incluye: `Applying migration 20260525_progresos_unique_constraint...` sin errores.

Si hay error `already exists`, la migración ya fue aplicada manualmente — continuar al Step 3 de verificación.

---

- [ ] **Step 3: Verificar que el índice existe en producción**

```bash
supabase db execute --sql "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'progresos' AND indexname = 'progresos_upsert_idx';"
```

Expected: 1 fila con:
```
indexname             | progresos_upsert_idx
indexdef              | CREATE UNIQUE INDEX progresos_upsert_idx ON public.progresos USING btree (alumno_id, clase_id, sesion_clase_id, contenido_dsl) WHERE (contenido_dsl IS NOT NULL)
```

Si devuelve 0 filas, la migración no se aplicó — revisar el output del Step 2.

---

- [ ] **Step 4: Commit (solo el estado del repo, la migración ya estaba commiteada)**

No hay archivos nuevos que commitear — la migración ya está en el repo. Si `supabase db push` generó algún archivo de estado local, commitearlo:

```bash
git status
# Si hay cambios en supabase/.temp/ o similar:
git add supabase/
git commit -m "chore(db): apply progresos_upsert_idx unique partial index"
```

Si `git status` no muestra cambios, esta tarea ya está completa.

---

## Task 3: Reliability Layer — CHANNEL_ERROR, paginación, safeAsync

**Files:**
- Modify: `src/main-maestros.js` (línea ~717 — canal `permisos-maestro`)
- Modify: `src/portal-maestros/views/alumnoPerfilView.js` (función `_renderProgresos`, línea ~79)
- Modify: `src/portal-maestros/views/asistenciaView.js` (agregar `safeAsync` helper)

### Fix A: CHANNEL_ERROR — cleanup del canal Realtime en main-maestros.js

---

- [ ] **Step 1: Leer el bloque del canal en main-maestros.js**

```bash
grep -n "permisos-maestro\|permisosChannel\|_permisosChannel" src/main-maestros.js
```

Identificar la línea exacta donde se crea `permisosChannel` (debería ser ~717).

---

- [ ] **Step 2: Agregar variable de módulo y cleanup antes de re-suscribir**

Buscar el bloque actual (aproximadamente líneas 715-740) que luce así:
```js
const maestroLocal = _maestro
if (maestroLocal?.id) {
  const permisosChannel = supabase
    .channel(`permisos-maestro:${maestroLocal.id}`)
    .on( ...
```

Reemplazarlo por:

```js
// Cleanup canal anterior antes de re-suscribir (evita CHANNEL_ERROR por canales huérfanos)
if (typeof _permisosChannel !== 'undefined' && _permisosChannel) {
  supabase.removeChannel(_permisosChannel)
  _permisosChannel = null
}

const maestroLocal = _maestro
if (maestroLocal?.id) {
  _permisosChannel = supabase
    .channel(`permisos-maestro:${maestroLocal.id}`)
    .on( ...
```

Y agregar la declaración de la variable al inicio del módulo (buscar la zona de variables de módulo, típicamente al inicio del archivo después de los imports):

```js
let _permisosChannel = null
```

---

- [ ] **Step 3: Verificar que el archivo no tiene errores de sintaxis**

```bash
node --input-type=module < src/main-maestros.js 2>&1 | head -20
```

Expected: sin errores de `SyntaxError`. Si hay errores, leer el mensaje y corregir.

---

### Fix B: Paginación en `_renderProgresos`

---

- [ ] **Step 4: Leer la función _renderProgresos completa**

```bash
grep -n "_renderProgresos\|\.limit(60\|\.range(" src/portal-maestros/views/alumnoPerfilView.js | head -20
```

La función comienza en línea ~79 y usa `.limit(60)` en la query de `progresos`.

---

- [ ] **Step 5: Modificar la firma y query de _renderProgresos**

Cambiar la firma de:
```js
async function _renderProgresos(container, alumnoId) {
```

A:
```js
async function _renderProgresos(container, alumnoId, offset = 0) {
```

Cambiar la query (buscar el bloque `.from('progresos')` dentro de `_renderProgresos`):

**Antes:**
```js
.order('fecha_evaluacion', { ascending: false })
.limit(60)
```

**Después:**
```js
.order('fecha_evaluacion', { ascending: false })
.range(offset, offset + 19)
```

---

- [ ] **Step 6: Agregar botón "Cargar más" al renderizado**

Al final de la función `_renderProgresos`, antes del bloque `catch`, localizar donde se asigna `root.innerHTML`. Después de renderizar las cards, agregar el botón condicionalmente:

```js
// Después de root.innerHTML = ... (al final del bloque try, antes del catch)
if (data && data.length === 20) {
  const loadMoreBtn = document.createElement('button')
  loadMoreBtn.className = 'pm-btn pm-btn-outline'
  loadMoreBtn.style.cssText = 'display:block;margin:0.75rem auto 0;font-size:0.82rem;'
  loadMoreBtn.textContent = 'Cargar más'
  loadMoreBtn.onclick = () => {
    loadMoreBtn.remove()
    _renderProgresos(container, alumnoId, offset + 20)
  }
  root.appendChild(loadMoreBtn)
}
```

**Nota:** El botón se agrega al `root` (no reemplaza el contenido), y al hacer click llama `_renderProgresos` con el nuevo offset. La función al ser llamada de nuevo con offset > 0 debe **appendear** en lugar de reemplazar. Para esto, cambiar el comportamiento del render inicial:

Al inicio de `_renderProgresos`, después de `if (!root) return`, agregar:
```js
const isFirstPage = offset === 0
if (isFirstPage) {
  root.innerHTML = '<div class="pm-loading-zen"><div class="pm-pulse"></div></div>'
}
```

Y al final donde se construye el HTML, en lugar de `root.innerHTML = contenidoHTML`, usar:
```js
if (isFirstPage) {
  root.innerHTML = contenidoHTML
} else {
  // append sin reemplazar el contenido existente
  const tmp = document.createElement('div')
  tmp.innerHTML = contenidoHTML
  root.append(...tmp.children)
}
```

**IMPORTANTE:** Leer la función completa antes de editar para entender cómo construye el HTML actualmente. El patrón de construcción puede variar.

---

### Fix C: safeAsync wrapper en asistenciaView.js

---

- [ ] **Step 7: Agregar la función safeAsync al archivo**

En `src/portal-maestros/views/asistenciaView.js`, después de la línea de imports (buscar el último `import` del archivo), agregar:

```js
/**
 * Wraps an async function with consistent error handling.
 * Logs to console and shows AppToast on failure.
 * Returns null on error instead of throwing.
 */
async function safeAsync(fn, { onError, silent = false } = {}) {
  try {
    return await fn()
  } catch (err) {
    console.error('[safeAsync]', err)
    if (onError) {
      onError(err)
    } else if (!silent) {
      AppToast.error('Error inesperado: ' + (err.message || err))
    }
    return null
  }
}
```

---

- [ ] **Step 8: Reemplazar el try/catch del bloque onAnalyzeClick**

Buscar el bloque (aproximadamente línea 753):
```js
onAnalyzeClick: async (text) => {
  try {
    // Build class context ...
    ...
    progressPanel.open({ progreso: result.progreso, resumen: result.resumen })
  } catch (err) {
    AppToast.error('Error al analizar con IA: ' + err.message)
  }
},
```

Reemplazarlo por:
```js
onAnalyzeClick: async (text) => {
  await safeAsync(async () => {
    // Build class context — present students exclude absent (estado !== 'A')
    const alumnosPresentes = alumnos.filter(a => estado[a.id] && estado[a.id] !== 'A')
    const context = {
      claseNombre: clase?.nombre || '',
      tipoClase: clase?.tipo || '',
      instrumento: clase?.instrumento || '',
      presentes: alumnosPresentes.map(a => a.nombre_completo || a.nombre),
      alumnos: alumnosPresentes
    }

    container.querySelector('#btn-guardar')?.style.setProperty('display', 'none')
    const result = await analyzeObservation(text, context)

    if (!result?.progreso?.length) {
      container.querySelector('#btn-guardar')?.style.removeProperty('display')
      AppToast.warning('La IA no detectó registros de progreso en este texto.')
      return
    }

    progressPanel.open({ progreso: result.progreso, resumen: result.resumen })
  }, {
    onError: (err) => {
      container.querySelector('#btn-guardar')?.style.removeProperty('display')
      AppToast.error('Error al analizar con IA: ' + err.message)
    }
  })
},
```

**IMPORTANTE:** Leer el bloque original completo antes de reemplazarlo para no perder lógica existente. Copiar el contenido del `try` exactamente como está, solo envolver con `safeAsync`.

---

- [ ] **Step 9: Verificar que no hay errores de sintaxis**

```bash
node --input-type=module < src/portal-maestros/views/asistenciaView.js 2>&1 | head -20
```

Expected: sin `SyntaxError`. Si hay errores, leer y corregir antes de commitear.

---

- [ ] **Step 10: Ejecutar todos los tests para asegurarse de que nada se rompió**

```bash
npx vitest run
```

Expected: todos los tests pasan. Si hay failures, NO commitear — investigar primero.

---

- [ ] **Step 11: Commit**

```bash
git add src/main-maestros.js src/portal-maestros/views/alumnoPerfilView.js src/portal-maestros/views/asistenciaView.js
git commit -m "fix(reliability): channel cleanup, _renderProgresos pagination, safeAsync wrapper"
```

---

- [ ] **Step 12: Push a GitHub**

```bash
git push origin master
```

---

## Criterios de éxito

| Criterio | Cómo verificar |
|----------|---------------|
| 13 tests pasan en observationParser | `npx vitest run` → `13 passed, 0 failed` |
| Índice DB aplicado | `supabase db execute --sql "SELECT indexname FROM pg_indexes WHERE indexname = 'progresos_upsert_idx';"` → 1 fila |
| Sin CHANNEL_ERROR por canales huérfanos | Navegar entre vistas 3 veces → consola sin `CHANNEL_ERROR` repetido |
| Paginación activa | Alumno con >20 registros en `progresos` → botón "Cargar más" visible |
| safeAsync consistente | Error de red simulado → AppToast con mensaje claro, sin crash |
