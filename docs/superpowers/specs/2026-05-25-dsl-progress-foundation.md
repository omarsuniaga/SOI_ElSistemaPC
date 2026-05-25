# DSL Progress Foundation — Design Spec (v2)
**Date:** 2026-05-25  
**Project:** SOI Sistema Académico PWA — Portal Maestros  
**Phase:** Fase 1 — Observación inteligente con extracción de progreso

---

## Problema raíz

El DSL actual (`#Nombre [contenido] (sugerencia) {tarea} 4/5`) requiere que el maestro aprenda y use una sintaxis específica mientras registra su clase. Esto genera fricción, errores de formato y abandono del sistema.

**El DSL no debe ser el formato de entrada — debe ser el formato de salida.**

El maestro escribe como piensa. La IA, con contexto real de la clase, convierte ese texto en estructura. Los tokens DSL son un atajo opcional para maestros avanzados, no el flujo principal.

---

## Goal

Permitir que el maestro escriba observaciones en lenguaje natural libre. Una función de IA con contexto completo de la clase analiza el texto, extrae registros de progreso por alumno, y presenta una vista previa para confirmar antes de guardar. El resultado se almacena en `progresos` como historial queryable.

---

## Arquitectura general

```
[Maestro escribe texto libre]
           ↓
[Botón "Analizar con IA"]
           ↓
analyzeObservation(texto, contextoClase) → Groq
  Contexto inyectado:
  - Lista de alumnos con nombres completos
  - Repertorio/plan activo (si existe)
  - Resumen de las últimas 2 sesiones (si existe)
           ↓
Groq devuelve JSON estructurado:
  { dsl, progreso[], resumen }
           ↓
[Panel de preview] — maestro ve las tarjetas de progreso
  → puede editar o eliminar cada registro
  → confirma con un clic
           ↓
progressAggregatorService.save(progreso[])
  → upsert en tabla progresos
           ↓
[Badge de feedback] — "✓ 3 registros de progreso guardados"
```

Los tokens `!LOGRADO` / `!EN_PROGRESO` / `!INICIADO` en el DSL son un **atajo opcional** para maestros avanzados. El parser los detecta y los envía directamente al aggregator sin necesitar el paso de IA. Ambos caminos desembocan en el mismo aggregator.

---

## Sección 1: Nueva función Groq — `analyzeObservation`

**Archivo:** `src/portal-maestros/services/groqService.js`

**Función nueva a agregar:**
```js
export async function analyzeObservation(text, context = {})
// Returns: { dsl: string, progreso: ProgressRecord[], resumen: string }
```

### Estructura del contexto inyectado

```js
context = {
  alumnos: [
    { id: 'uuid', nombre: 'Yereni Michel', nombreCorto: 'Yereni' },
    { id: 'uuid', nombre: 'Santa Isaura Castillo Díaz', nombreCorto: 'Santa' },
    // ...todos los alumnos de la clase
  ],
  repertorio: [
    { titulo: 'Danzón No. 2', tipo: 'obra' },
    { titulo: 'Escala en 3 octavas', tipo: 'ejercicio' },
  ],                                      // del plan si existe, sino vacío
  sesionesRecientes: [
    'Sesión anterior: Se trabajó cambio de posición 1ª a 2ª...',
    'Sesión previa: Introducción al Danzón compases 1-100...',
  ],                                      // últimas 2 sesiones como texto plano
  indicadorActivo: 'cambio de posiciones', // del plan activo si existe
}
```

### System prompt para `analyzeObservation`

```
Sos un asistente pedagógico musical especializado en análisis de clases de instrumento.

Recibís una observación libre de un maestro de música y un contexto de la clase.
Tu tarea es analizar el texto y devolver un JSON con tres campos.

FORMATO DE RESPUESTA (JSON estricto, sin texto extra):
{
  "dsl": "texto en formato DSL para display en el editor",
  "progreso": [
    {
      "alumnos": ["nombre completo del alumno según lista"],  // o ["todos"]
      "contenido": "qué se trabajó o evaluó (conciso, máx 60 chars)",
      "tipo": "tecnica | repertorio | teoria | interpretacion | otro",
      "estado": "LOGRADO | EN_PROGRESO | INICIADO",
      "nota": null o número 1-5,
      "tarea": null o "descripción de la tarea asignada",
      "observacion": "frase descriptiva del nivel actual (máx 100 chars)",
      "es_colectivo": true si aplica a todos o a un grupo, false si es individual
    }
  ],
  "resumen": "Una frase que resume el foco pedagógico de la sesión (máx 120 chars)"
}

REGLAS DE INFERENCIA:
- "lograron", "alcanzaron", "dominaron" → estado: LOGRADO
- "avanzando", "mejorando", "progresando", "casi" → estado: EN_PROGRESO
- "empezaron", "conocieron", "introdujeron", "vieron por primera vez" → estado: INICIADO
- Sin indicador claro → estado: EN_PROGRESO (default)
- Obras musicales (Danzón, Minueto, etc.) → tipo: repertorio
- Escalas, posiciones, arco → tipo: tecnica
- Ritmo, compás, armonía → tipo: teoria

CONTEXTO DE TIPO DE CLASE (inferir desde tipoClase del contexto):
- tipoClase: "instrumento" (ej: violín, piano, flauta) →
    El progreso es ejecución del instrumento. tipo preferido: "tecnica" o "repertorio".
    Los avances individuales reflejan desarrollo del intérprete.
- tipoClase: "ensayo_general" (orquesta, ensamble, coro) →
    El progreso es principalmente "repertorio" (obra colectiva).
    Pero SI el maestro menciona un alumno específico → también registrar progreso individual tipo "interpretacion".
    Inferir que el trabajo colectivo impacta el desarrollo individual de cada presente.
- tipoClase: "teoria" → tipo preferido: "teoria"
- tipoClase desconocido → inferir desde el instrumento/nombre de la clase

RESOLUCIÓN DE "TODOS":
- "todos" en el texto del maestro = SOLO los alumnos presentes en esta sesión.
- La lista de presentes se pasa en el contexto como `presentes[]` (subset de `alumnos[]`).
- Nunca expandir "todos" a alumnos ausentes.
- Si `presentes` está vacío en el contexto → usar `alumnos[]` completo como fallback.

NOMBRES DE ALUMNOS:
- Resolvé nombres parciales usando la lista de alumnos del contexto
- "Yereni" → resolvé a "Yereni Michel" si está en la lista
- Si no podés resolver un nombre → usá el nombre tal como está escrito
- Si el maestro dice "todos" o no especifica → usá ["todos"]

PASAJES ESPECÍFICOS:
- "compases 333 al 348" → incluílo en el campo contenido: "Danzón c.333-348"
- Detalles técnicos del pasaje van en observacion

CAMPO DSL:
- Construí el DSL usando los tokens estándar
- Usá !LOGRADO / !EN_PROGRESO / !INICIADO para los estados
- El DSL debe representar fielmente lo que el maestro describió
```

### Ejemplo de entrada/salida

**Entrada (texto del maestro):**
```
Yereni y Santa van mejorando mucho el cambio de 1era a 3era posición, 
se nota un avance muy significativo, les puse 4/5. Si practican en casa 
lo van a lograr rápido. También trabajamos el Danzón en los compases 333 
al 348 donde hay una escala en 3 octavas muy difícil. Todos lo pudieron 
hacer lento, que ya es un avance.
```

**Salida esperada:**
```json
{
  "dsl": "#Yereni Michel #Santa Isaura [cambio 1ª-3ª posición] !EN_PROGRESO (avance muy significativo) {practicar en casa} 4/5\n#todos [Danzón c.333-348 — escala 3 octavas] !EN_PROGRESO (lo ejecutaron lento por primera vez)",
  "progreso": [
    {
      "alumnos": ["Yereni Michel", "Santa Isaura Castillo Díaz"],
      "contenido": "Cambio 1ª a 3ª posición",
      "tipo": "tecnica",
      "estado": "EN_PROGRESO",
      "nota": 4,
      "tarea": "Practicar cambio de posición en casa",
      "observacion": "Avance muy significativo, cerca de lograr el objetivo",
      "es_colectivo": false
    },
    {
      "alumnos": ["todos"],
      "contenido": "Danzón — pasaje c.333-348 (escala 3 octavas)",
      "tipo": "repertorio",
      "estado": "EN_PROGRESO",
      "nota": null,
      "tarea": null,
      "observacion": "Primer intento exitoso a tempo lento",
      "es_colectivo": true
    }
  ],
  "resumen": "Trabajo técnico de posiciones e introducción al pasaje central del Danzón"
}
```

---

## Sección 2: Schema DB

Sin cambios respecto al diseño anterior. Dos columnas nuevas en `progresos`:

**Archivo:** `supabase/migrations/20260525_progresos_dsl_columns.sql`

```sql
ALTER TABLE public.progresos
  ADD COLUMN IF NOT EXISTS contenido_dsl  text,
  ADD COLUMN IF NOT EXISTS objetivo_id    uuid
    REFERENCES public.plan_objetivos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.progresos.contenido_dsl IS
  'Contenido libre extraído por IA o por token DSL manual. Diseñado para linkear retroactivamente a objetivo_id cuando exista un plan curricular.';
COMMENT ON COLUMN public.progresos.objetivo_id IS
  'FK opcional a plan_objetivos. NULL cuando el progreso fue estado libre (sin plan). Se puede poblar retroactivamente al final del semestre.';
```

**Valores que escribe el aggregator por registro:**

| Column | Valor |
|--------|-------|
| `alumno_id` | resuelto desde nombre en lista de alumnos |
| `clase_id` | contexto de sesión |
| `sesion_clase_id` | contexto de sesión |
| `maestro_id` | contexto de sesión |
| `fecha_evaluacion` | fecha de la sesión |
| `evaluacion_tipo` | `'observacion'` |
| `estado_cualitativo` | `'LOGRADO'` / `'EN_PROGRESO'` / `'INICIADO'` |
| `calificacion` | nota del registro (1-5) o null |
| `contenido_dsl` | campo `contenido` del registro |
| `observaciones` | campo `observacion` del registro |
| `indicadores` | `{ tipo, es_colectivo, tarea }` como jsonb |
| `objetivo_id` | `null` (free state, linkeable después) |

**Clave de upsert:** `(alumno_id, clase_id, sesion_clase_id, contenido_dsl)`

---

## Sección 3: Progress Aggregator Service

**Archivo:** `src/portal-maestros/services/progressAggregatorService.js`

Dos caminos de entrada, mismo output:

```js
// Camino A — desde respuesta IA (flujo principal)
export async function saveProgressFromAI({
  sesionId, claseId, maestroId, fechaHoy,
  progressRecords,  // array validado/editado del preview
  alumnos           // para resolver "todos" y nombres parciales
})

// Camino B — desde tokens DSL manuales (atajo poder-usuario)
export async function saveProgressFromDSL({
  sesionId, claseId, maestroId, fechaHoy,
  dslText,
  alumnos
})
// Camino B parsea dslText buscando triplas #Nombre + [contenido] + !ESTADO
// y llama internamente a saveProgressFromAI con los records extraídos

// Ambos retornan:
// { saved: [{alumnoNombre, contenido, estado}], errors: [] }
```

**Resolución de nombres:**
- Normalizar: lowercase, sin acentos, trim
- Buscar coincidencia en `alumnos[].nombre` o `alumnos[].nombreCorto`
- `"todos"` → expandir a todo el array `alumnos`
- Sin coincidencia → error en `errors[]`, continuar con el resto

**Error handling:** Nunca lanza. Falla parcial = guarda lo que puede + reporta errores.

---

## Sección 4: Panel de Preview

**Cuándo aparece:** Al presionar "Analizar con IA", mientras Groq procesa se muestra un spinner en el botón. Al recibir respuesta, el panel aparece debajo del editor.

**Estructura visual:**

```
┌─────────────────────────────────────────────────┐
│ 🤖 La IA detectó estos avances                  │
│ "Trabajo técnico de posiciones e intro al Danzón"│
├─────────────────────────────────────────────────┤
│ ● Yereni Michel · Santa Isaura                  │
│   Cambio 1ª-3ª posición    [EN PROGRESO]  4/5   │
│   "Avance muy significativo, cerca del objetivo" │
│   Tarea: Practicar en casa             [✕ quitar]│
├─────────────────────────────────────────────────┤
│ ● Todos (12 alumnos)                            │
│   Danzón c.333-348         [EN PROGRESO]        │
│   "Primer intento exitoso a tempo lento"         │
│                                        [✕ quitar]│
├─────────────────────────────────────────────────┤
│ [Editar DSL]          [✓ Confirmar y guardar]   │
└─────────────────────────────────────────────────┘
```

**Comportamiento:**
- Cada tarjeta tiene `[✕ quitar]` para eliminar ese registro antes de guardar
- Estado (`EN PROGRESO`, `LOGRADO`, `INICIADO`) es clickeable para cambiar
- `[Editar DSL]` abre el editor con el DSL generado para edición manual
- `[Confirmar y guardar]` llama `saveProgressFromAI()` con los records que quedaron

**Colores de estado:**
- `LOGRADO` → verde (`var(--pm-success)`)
- `EN_PROGRESO` → azul (`var(--pm-primary)`)
- `INICIADO` → gris (`var(--pm-muted)`)

---

## Sección 5: Feedback Badge

Aparece debajo del editor durante 4 segundos después de confirmar:

```
✓ 3 registros de progreso guardados — Yereni, Santa: Cambio posición · Todos: Danzón
```

CSS en `05-views.css` (igual al diseño anterior):
```css
.pm-progress-feedback { /* verde, border-left, fade-in/out animation */ }
```

---

## Sección 6: Integración en `asistenciaView.js`

### Botón "Analizar con IA"

El botón ya existe en la toolbar del editor (función `createDslToolbar`). Se extiende para llamar a `analyzeObservation` en lugar de `structureTextToDSL` cuando el texto es lenguaje natural.

Detección de modo:
- `detectInputMode(text) === 'natural'` → llamar `analyzeObservation` → mostrar preview panel
- `detectInputMode(text) === 'dsl'` y tiene tokens `!STATE` → llamar `saveProgressFromDSL` directamente

### Variables disponibles en scope (para armar el contexto):
```js
// Ya disponibles en _renderVista:
alumnos          // array con id + nombre
clase            // nombre, instrumento
sesionId         // id de la sesión
fechaHoy
snapshots        // sesiones anteriores — usar para sesionesRecientes
horario
```

### Construcción del contexto Groq:
```js
// Presentes = alumnos cuyo estado en el objeto `estado` NO es null/undefined
const alumnosPresentes = alumnos.filter(a => estado[a.id] && estado[a.id] !== 'A')

const contextoGroq = {
  alumnos: alumnos.map(a => ({
    id: a.id,
    nombre: a.nombre,
    nombreCorto: a.nombre.split(' ')[0]
  })),
  presentes: alumnosPresentes.map(a => ({
    id: a.id,
    nombre: a.nombre,
    nombreCorto: a.nombre.split(' ')[0]
  })),
  // tipoClase se infiere desde clase.instrumento o clase.tipo si existe
  // "Violín", "Piano", "Flauta" → "instrumento"
  // "Orquesta", "Ensamble", "Coro", "Ensayo" → "ensayo_general"
  // "Teoría", "Solfeo" → "teoria"
  tipoClase: _inferirTipoClase(clase),
  instrumento: clase.instrumento || '',
  repertorio: [],  // TODO Fase 2: cargar desde plan_objetivos si existe
  sesionesRecientes: (snapshots || [])
    .slice(-2)
    .map(s => s.contenido || '')
    .filter(Boolean),
  indicadorActivo: '',  // TODO Fase 2: del plan activo
}

// Helper (definir en asistenciaView.js):
function _inferirTipoClase(clase) {
  const nombre = (clase.nombre || '').toLowerCase()
  const instrumento = (clase.instrumento || '').toLowerCase()
  if (/orquesta|ensamble|ensemble|coro|ensayo/.test(nombre)) return 'ensayo_general'
  if (/teor[ií]a|solfeo|lenguaje/.test(nombre)) return 'teoria'
  if (instrumento) return 'instrumento'
  return 'instrumento' // default
}
```

---

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/portal-maestros/services/groqService.js` | Agregar `analyzeObservation()` con nuevo system prompt |
| `src/portal-maestros/services/progressAggregatorService.js` | **Nuevo** — `saveProgressFromAI()` + `saveProgressFromDSL()` |
| `src/portal-maestros/utils/dslParser.js` | Agregar token `!STATE` (pattern, colors, extracción, highlight) |
| `src/portal-maestros/components/ProgressPreviewPanel.js` | **Nuevo** — panel de preview/confirmación |
| `src/portal-maestros/styles/05-views.css` | `.pm-progress-feedback` + `.pm-progress-preview` |
| `src/portal-maestros/views/asistenciaView.js` | Integrar panel, llamar aggregator, mostrar badge |
| `supabase/migrations/20260525_progresos_dsl_columns.sql` | **Nuevo** — 2 columnas en `progresos` |

---

## Fuera de alcance (Fase 2+)

- Autocomplete de nombres de alumnos mientras se escribe `#`
- Cargar repertorio real desde `plan_objetivos` al contexto Groq
- Linkear `objetivo_id` retroactivamente al aceptar un plan curricular
- AI propone plan curricular desde progreso acumulado al fin del semestre
- PDF mensual consumiendo `progresos` como fuente de datos

---

## Criterios de éxito

1. Maestro escribe texto libre → presiona "Analizar" → ve tarjetas de progreso con nombres reales resueltos, estados inferidos y notas extraídas.
2. Al confirmar → `progresos` tiene filas con `evaluacion_tipo='observacion'`, `estado_cualitativo`, `contenido_dsl`.
3. Re-analizar y confirmar la misma sesión → actualiza filas, no duplica.
4. `#todos [Danzón] !LOGRADO` escrito manualmente → funciona sin pasar por IA.
5. Fallo de Groq → muestra error descriptivo, no bloquea el guardado de la sesión.
6. Observaciones sin información de progreso (e.g. "la clase estuvo bien") → preview vacío, se informa al maestro que no se detectaron avances.
