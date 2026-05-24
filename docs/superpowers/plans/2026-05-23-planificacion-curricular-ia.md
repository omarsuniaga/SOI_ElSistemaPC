# Planificación Curricular con Asistente IA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add curriculum management for admins, AI-powered coverage extraction when teachers execute plans, and a dedicated AI assistant panel with gap analysis, draft generation, and qualitative feedback.

**Architecture:** New DB tables (curriculos → pilares → objetivos → cobertura_alumno_objetivo) feed three new UI surfaces: (1) admin curriculum editor tab, (2) teacher coverage confirmation modal triggered on plan execution, (3) AI assistant tab with three blocks. GROQ handles all AI work via three new functions added to the existing groqService.js.

**Tech Stack:** Vanilla JS ES Modules, Bootstrap 5, Supabase JS v2, GROQ API (llama3-70b), existing patterns: AppModal, AppToast, HelpPanel, module-level state, standalone modals appended to body.

**Spec:** `docs/superpowers/specs/2026-05-23-planificacion-curricular-ia.md`

---

## File Map

### Create (new)
| File | Responsibility |
|------|---------------|
| `src/modules/planificacion/api/curriculoApi.js` | CRUD: curriculos, pilares, objetivos |
| `src/modules/planificacion/api/coberturaApi.js` | Upsert/query cobertura_alumno_objetivo |
| `src/modules/planificacion/components/curriculoModal.js` | Admin: create/edit curriculum with pillars and objectives |
| `src/modules/planificacion/components/coberturaModal.js` | Teacher: confirm AI-extracted coverage when executing plan |
| `src/modules/planificacion/components/asistentePedagogicoPanel.js` | AI panel: 3 blocks (gap analysis, draft, feedback) |
| `supabase/migrations/20260523_curriculos.sql` | 4 new tables + RLS |

### Modify (existing)
| File | What changes |
|------|-------------|
| `src/modules/planificacion/api/groqService.js` | Add `extraerCobertura()`, `sugerirPlan()`, `analizarEnfoque()` |
| `src/modules/planificacion/views/planificacionView.js` | Add "Asistente IA" + "Currículo" tabs; add "Ejecutar" button; intercept estado→ejecutado to trigger coberturaModal |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260523_curriculos.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- curriculos: one per instrumento + nivel
CREATE TABLE IF NOT EXISTS curriculos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrumento text NOT NULL,
  nivel       text NOT NULL,
  descripcion text,
  activo      boolean DEFAULT true,
  created_by  uuid REFERENCES maestros(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (instrumento, nivel)
);

-- pillars inside a curriculum
CREATE TABLE IF NOT EXISTS curriculo_pilares (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id uuid REFERENCES curriculos(id) ON DELETE CASCADE,
  nombre       text NOT NULL,
  orden        int  NOT NULL DEFAULT 0
);

-- objectives inside a pillar
CREATE TABLE IF NOT EXISTS curriculo_objetivos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilar_id    uuid REFERENCES curriculo_pilares(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  orden       int  NOT NULL DEFAULT 0
);

-- per-student, per-objective coverage log
CREATE TABLE IF NOT EXISTS cobertura_alumno_objetivo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id   uuid REFERENCES alumnos(id) ON DELETE CASCADE,
  objetivo_id uuid REFERENCES curriculo_objetivos(id) ON DELETE CASCADE,
  plan_id     uuid REFERENCES planificaciones(id) ON DELETE SET NULL,
  maestro_id  uuid REFERENCES maestros(id),
  fecha       date NOT NULL DEFAULT CURRENT_DATE,
  confirmado  boolean DEFAULT false,
  nivel       text DEFAULT 'en_proceso',
  created_at  timestamptz DEFAULT now(),
  UNIQUE (alumno_id, objetivo_id)
);

-- RLS
ALTER TABLE curriculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculo_pilares ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculo_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobertura_alumno_objetivo ENABLE ROW LEVEL SECURITY;

-- curriculos: everyone reads, only admin writes
CREATE POLICY curriculos_select ON curriculos FOR SELECT TO authenticated USING (true);
CREATE POLICY curriculos_insert ON curriculos FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY curriculos_update ON curriculos FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY curriculos_delete ON curriculos FOR DELETE TO authenticated USING (es_admin());

-- pilares: inherit same
CREATE POLICY pilares_select ON curriculo_pilares FOR SELECT TO authenticated USING (true);
CREATE POLICY pilares_insert ON curriculo_pilares FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY pilares_update ON curriculo_pilares FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY pilares_delete ON curriculo_pilares FOR DELETE TO authenticated USING (es_admin());

-- objetivos: inherit same
CREATE POLICY objetivos_select ON curriculo_objetivos FOR SELECT TO authenticated USING (true);
CREATE POLICY objetivos_insert ON curriculo_objetivos FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY objetivos_update ON curriculo_objetivos FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY objetivos_delete ON curriculo_objetivos FOR DELETE TO authenticated USING (es_admin());

-- cobertura: maestro owns their rows; admin can read all
CREATE POLICY cobertura_select_maestro ON cobertura_alumno_objetivo FOR SELECT TO authenticated
  USING (maestro_id = maestro_actual() OR es_admin());
CREATE POLICY cobertura_insert ON cobertura_alumno_objetivo FOR INSERT TO authenticated
  WITH CHECK (maestro_id = maestro_actual());
CREATE POLICY cobertura_update ON cobertura_alumno_objetivo FOR UPDATE TO authenticated
  USING (maestro_id = maestro_actual());
```

- [ ] **Step 2: Apply via Supabase MCP**

Use the `mcp__c014a43e-d076-4c5b-b0f9-3d63cebd2fd8__apply_migration` tool with the SQL above. Migration name: `20260523_curriculos`.

- [ ] **Step 3: Verify tables exist**

Use `mcp__c014a43e-d076-4c5b-b0f9-3d63cebd2fd8__execute_sql` with:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('curriculos','curriculo_pilares','curriculo_objetivos','cobertura_alumno_objetivo');
```
Expected: 4 rows returned.

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/20260523_curriculos.sql
git commit -m "feat(db): add curriculos, pilares, objetivos, cobertura tables with RLS"
```

---

## Task 2: curriculoApi.js

**Files:**
- Create: `src/modules/planificacion/api/curriculoApi.js`

- [ ] **Step 1: Create the file**

```js
import { supabase } from '../../../core/supabase/supabaseClient.js'

/**
 * Get the active curriculum for a given instrumento + nivel pair.
 * Returns null if none found.
 */
export async function obtenerCurriculo(instrumento, nivel) {
  const { data, error } = await supabase
    .from('curriculos')
    .select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `)
    .eq('instrumento', instrumento)
    .eq('nivel', nivel)
    .eq('activo', true)
    .order('orden', { referencedTable: 'curriculo_pilares' })
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || null
}

/**
 * List all curricula (for admin table view).
 */
export async function listarCurriculos() {
  const { data, error } = await supabase
    .from('curriculos')
    .select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `)
    .order('instrumento')
  if (error) throw error
  // flatten objective count
  return (data || []).map(c => ({
    ...c,
    total_objetivos: c.curriculo_pilares?.reduce(
      (sum, p) => sum + (p.curriculo_objetivos?.length || 0), 0
    ) ?? 0
  }))
}

export async function crearCurriculo({ instrumento, nivel, descripcion }) {
  const { data, error } = await supabase
    .from('curriculos')
    .insert({ instrumento, nivel, descripcion })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarCurriculo(id, fields) {
  const { data, error } = await supabase
    .from('curriculos')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleActivoCurriculo(id, activo) {
  return actualizarCurriculo(id, { activo })
}

// ── Pillars ──────────────────────────────────────────────────────────────────

export async function crearPilar(curriculo_id, nombre, orden = 0) {
  const { data, error } = await supabase
    .from('curriculo_pilares')
    .insert({ curriculo_id, nombre, orden })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarPilar(id, fields) {
  const { data, error } = await supabase
    .from('curriculo_pilares')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarPilar(id) {
  const { error } = await supabase.from('curriculo_pilares').delete().eq('id', id)
  if (error) throw error
}

// ── Objectives ───────────────────────────────────────────────────────────────

export async function crearObjetivo(pilar_id, descripcion, orden = 0) {
  const { data, error } = await supabase
    .from('curriculo_objetivos')
    .insert({ pilar_id, descripcion, orden })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarObjetivo(id, fields) {
  const { data, error } = await supabase
    .from('curriculo_objetivos')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarObjetivo(id) {
  const { error } = await supabase.from('curriculo_objetivos').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/planificacion/api/curriculoApi.js
git commit -m "feat(planificacion): add curriculoApi — CRUD for curriculos, pilares, objetivos"
```

---

## Task 3: coberturaApi.js

**Files:**
- Create: `src/modules/planificacion/api/coberturaApi.js`

- [ ] **Step 1: Create the file**

```js
import { supabase } from '../../../core/supabase/supabaseClient.js'

/**
 * Upsert coverage records (one per alumno+objetivo).
 * AI-suggested entries use confirmado=false; teacher-confirmed use confirmado=true.
 *
 * @param {Array<{alumno_id, objetivo_id, plan_id, maestro_id, nivel, confirmado}>} registros
 */
export async function upsertCobertura(registros) {
  const { data, error } = await supabase
    .from('cobertura_alumno_objetivo')
    .upsert(registros, { onConflict: 'alumno_id,objetivo_id' })
    .select()
  if (error) throw error
  return data
}

/**
 * Get all coverage rows for a specific student,
 * with objective descriptions joined for display.
 */
export async function obtenerCoberturaPorAlumno(alumno_id) {
  const { data, error } = await supabase
    .from('cobertura_alumno_objetivo')
    .select(`
      id, nivel, confirmado, fecha, plan_id,
      curriculo_objetivos ( id, descripcion, pilar_id,
        curriculo_pilares ( id, nombre )
      )
    `)
    .eq('alumno_id', alumno_id)
  if (error) throw error
  return data || []
}

/**
 * Get all coverage rows for a specific plan (to pre-populate coberturaModal).
 */
export async function obtenerCoberturaPorPlan(plan_id) {
  const { data, error } = await supabase
    .from('cobertura_alumno_objetivo')
    .select('alumno_id, objetivo_id, nivel, confirmado')
    .eq('plan_id', plan_id)
  if (error) throw error
  return data || []
}

/**
 * Mark a list of cobertura rows as confirmed (confirmado=true).
 */
export async function confirmarCobertura(ids) {
  const { error } = await supabase
    .from('cobertura_alumno_objetivo')
    .update({ confirmado: true })
    .in('id', ids)
  if (error) throw error
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/planificacion/api/coberturaApi.js
git commit -m "feat(planificacion): add coberturaApi — upsert/query cobertura_alumno_objetivo"
```

---

## Task 4: groqService.js — three new AI functions

**Files:**
- Modify: `src/modules/planificacion/api/groqService.js`

- [ ] **Step 1: Read current file end to find insertion point**

The file currently ends at line ~173 with `export async function enrichFromText(texto)`. Append after that function.

- [ ] **Step 2: Add three new exports at end of file**

```js
// ── Curriculum AI Functions ──────────────────────────────────────────────────

/**
 * Ask GROQ which curriculum objectives were likely covered by a plan.
 * Returns array of { alumno, objetivo_id, nivel, razon }.
 *
 * @param {{ tema, objetivos, contenido, notas_dsl }} plan
 * @param {string[]} alumnos  — list of student names parsed from DSL
 * @param {Array<{id, descripcion}>} objetivos_curriculo
 */
export async function extraerCobertura(plan, alumnos, objetivos_curriculo) {
  const prompt = `Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

Plan de clase:
- Tema: ${plan.tema}
- Objetivos escritos por el maestro: ${plan.objetivos || '(ninguno)'}
- Contenido: ${plan.contenido || '(ninguno)'}
- Notas DSL: ${plan.notas_dsl || '(ninguno)'}

Alumnos mencionados: ${alumnos.join(', ') || '(ninguno)'}

Objetivos curriculares a evaluar:
${objetivos_curriculo.map(o => `- id:${o.id} → ${o.descripcion}`).join('\n')}

Responde SOLO en JSON válido con este formato exacto:
{
  "coberturas": [
    { "alumno": "nombre", "objetivo_id": "uuid", "nivel": "iniciando|en_proceso|logrado", "razon": "breve justificación" }
  ]
}
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas. Si no hay evidencia clara, devuelve coberturas vacías.`

  if (config.isDemoMode || !config.groq.apiKey) {
    // Demo: return first objective for first student as "en_proceso"
    const mockCoberturas = alumnos.slice(0, 2).flatMap(alumno =>
      objetivos_curriculo.slice(0, 2).map(o => ({
        alumno,
        objetivo_id: o.id,
        nivel: 'en_proceso',
        razon: 'Demo: objetivo relacionado con el tema'
      }))
    )
    return { success: true, coberturas: mockCoberturas, isMock: true }
  }

  try {
    const response = await fetch(`${config.groq.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error GROQ extraerCobertura')
    }
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{"coberturas":[]}')
    return { success: true, coberturas: parsed.coberturas || [], isMock: false }
  } catch (error) {
    console.error('extraerCobertura error:', error)
    return { success: false, coberturas: [], error: error.message }
  }
}

/**
 * Generate a draft plan for a student based on pending objectives and recent themes.
 *
 * @param {{ nombre, instrumento, nivel }} alumno
 * @param {Array<{descripcion}>} objetivos_pendientes
 * @param {string[]} ultimos_temas  — last 3 executed plan themes
 */
export async function sugerirPlan(alumno, objetivos_pendientes, ultimos_temas) {
  const prompt = `Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

Alumno: ${alumno.nombre}, instrumento: ${alumno.instrumento}, nivel: ${alumno.nivel}

Objetivos pendientes del currículo (priorizar estos):
${objetivos_pendientes.map(o => `- ${o.descripcion}`).join('\n') || '(sin objetivos pendientes registrados)'}

Últimas clases trabajadas (no repetir):
${ultimos_temas.join(', ') || '(ninguna)'}

Responde SOLO en JSON válido con este formato exacto:
{
  "tema": "...",
  "objetivos": "...",
  "contenido": "...",
  "recursos": ["..."]
}
Sé específico y pedagógicamente relevante para el instrumento y nivel.`

  if (config.isDemoMode || !config.groq.apiKey) {
    return {
      success: true,
      plan: {
        tema: `Clase de ${alumno.instrumento} — Nivel ${alumno.nivel}`,
        objetivos: objetivos_pendientes[0]?.descripcion || 'Repaso general',
        contenido: 'Ejercicios de calentamiento, escala mayor, pieza del repertorio.',
        recursos: ['Partitura del repertorio', 'Metrónomo']
      },
      isMock: true
    }
  }

  try {
    const response = await fetch(`${config.groq.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error GROQ sugerirPlan')
    }
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{}')
    return { success: true, plan: parsed, isMock: false }
  } catch (error) {
    console.error('sugerirPlan error:', error)
    return { success: false, plan: null, error: error.message }
  }
}

/**
 * Generate qualitative pedagogical feedback for a teacher based on their
 * executed plans and curriculum coverage.
 *
 * @param {string} instrumento
 * @param {Array<{tema, contenido, objetivos}>} planes_ejecutados  — last 8 weeks
 * @param {object} curriculo  — full curriculum object from obtenerCurriculo()
 * @param {string} resumen_cobertura  — human-readable summary of objective coverage
 */
export async function analizarEnfoque(instrumento, planes_ejecutados, curriculo, resumen_cobertura) {
  const pilares_texto = curriculo?.curriculo_pilares?.map(p =>
    `Pilar "${p.nombre}": ${p.curriculo_objetivos?.map(o => o.descripcion).join('; ')}`
  ).join('\n') || '(sin currículo definido)'

  const planes_texto = planes_ejecutados.map((p, i) =>
    `Clase ${i + 1}: ${p.tema} — ${p.contenido || p.objetivos || ''}`
  ).join('\n')

  const prompt = `Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

Instrumento principal: ${instrumento}

Currículo de referencia:
${pilares_texto}

Planes ejecutados (últimas 8 semanas):
${planes_texto || '(ninguno)'}

Cobertura de objetivos actual:
${resumen_cobertura || '(sin datos)'}

Escribe 2-3 párrafos:
1. Fortalezas del enfoque actual
2. Áreas del currículo que podrían reforzarse
3. Sugerencias concretas para próximas semanas

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios. Responde en español.`

  if (config.isDemoMode || !config.groq.apiKey) {
    return {
      success: true,
      feedback: `Tu enfoque en las últimas semanas muestra consistencia y dedicación. Se nota claridad en la presentación de contenidos técnicos.\n\nHay oportunidad de ampliar el trabajo en repertorio variado y lectura a primera vista, áreas que aparecen menos frecuentes en los planes recientes.\n\nPara las próximas semanas, te sugiero incorporar al menos una pieza nueva por mes y dedicar 5-10 minutos de cada clase a ejercicios de lectura rítmica.`,
      isMock: true
    }
  }

  try {
    const response = await fetch(`${config.groq.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.8,
      }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error GROQ analizarEnfoque')
    }
    const data = await response.json()
    const feedback = data.choices[0]?.message?.content?.trim() || ''
    return { success: true, feedback, isMock: false }
  } catch (error) {
    console.error('analizarEnfoque error:', error)
    return { success: false, feedback: '', error: error.message }
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/planificacion/api/groqService.js
git commit -m "feat(planificacion): add extraerCobertura, sugerirPlan, analizarEnfoque to groqService"
```

---

## Task 5: curriculoModal.js — Admin curriculum editor

**Files:**
- Create: `src/modules/planificacion/components/curriculoModal.js`

- [ ] **Step 1: Create the file**

```js
/**
 * curriculoModal.js — Admin UI for creating/editing curricula with pillars + objectives.
 * Opens as a large standalone modal appended to document.body.
 * Pattern: same as planificacionModal.js (self-contained with injected <style>)
 */
import {
  listarCurriculos,
  crearCurriculo,
  actualizarCurriculo,
  toggleActivoCurriculo,
  crearPilar,
  actualizarPilar,
  eliminarPilar,
  crearObjetivo,
  actualizarObjetivo,
  eliminarObjetivo,
  obtenerCurriculo,
} from '../api/curriculoApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const STYLE = `
<style id="curriculo-modal-style">
.cm-pilar { border: 1px solid var(--bs-border-color); border-radius: 8px; margin-bottom: .75rem; }
.cm-pilar-header { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; background:var(--bs-tertiary-bg); border-radius:7px 7px 0 0; }
.cm-pilar-body { padding:.5rem .75rem; }
.cm-obj-row { display:flex; align-items:center; gap:.5rem; padding:.25rem 0; border-bottom: 1px solid var(--bs-border-color-translucent); }
.cm-obj-row:last-child { border-bottom: none; }
.cm-obj-text { flex:1; font-size:.875rem; }
.cm-obj-input { flex:1; }
</style>`

// ── List modal (admin entry point) ───────────────────────────────────────────

export function openCurriculoListModal(onClose) {
  const existing = document.getElementById('curriculo-list-modal')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'curriculo-list-modal'
  el.innerHTML = `${STYLE}
    <div class="modal fade" id="curriculo-list-modal-dialog" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-journal-bookmark me-2"></i>Gestión de Currículos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="cl-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm text-muted"></div></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-sm" id="cl-btn-nuevo">
              <i class="bi bi-plus me-1"></i>Nuevo Currículo
            </button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)

  const modalEl = el.querySelector('#curriculo-list-modal-dialog')
  const modal = new bootstrap.Modal(modalEl)

  async function _render() {
    const body = document.getElementById('cl-body')
    try {
      const lista = await listarCurriculos()
      if (lista.length === 0) {
        body.innerHTML = `<p class="text-muted text-center py-4">No hay currículos creados aún.</p>`
        return
      }
      body.innerHTML = `
        <table class="table table-sm table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Instrumento</th><th>Nivel</th><th>Objetivos</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(c => `
              <tr>
                <td class="fw-semibold">${c.instrumento}</td>
                <td>${c.nivel}</td>
                <td><span class="badge bg-secondary bg-opacity-15 text-secondary">${c.total_objetivos}</span></td>
                <td>
                  <div class="form-check form-switch mb-0">
                    <input class="form-check-input cl-toggle" type="checkbox" data-id="${c.id}" ${c.activo ? 'checked' : ''}>
                  </div>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-secondary btn-icon-compact cl-btn-edit" data-id="${c.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`

      body.querySelectorAll('.cl-toggle').forEach(tog => {
        tog.addEventListener('change', async () => {
          await toggleActivoCurriculo(tog.dataset.id, tog.checked)
          AppToast.success(tog.checked ? 'Currículo activado' : 'Currículo desactivado')
        })
      })
      body.querySelectorAll('.cl-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openCurriculoEditModal(btn.dataset.id, _render))
      })
    } catch (err) {
      body.innerHTML = `<p class="text-danger">${err.message}</p>`
    }
  }

  el.querySelector('#cl-btn-nuevo').addEventListener('click', () => {
    openCurriculoCreateModal(_render)
  })

  modalEl.addEventListener('hidden.bs.modal', () => {
    el.remove()
    onClose?.()
  })

  modal.show()
  _render()
}

// ── Create modal ─────────────────────────────────────────────────────────────

function openCurriculoCreateModal(onSaved) {
  const el = document.createElement('div')
  el.innerHTML = `
    <div class="modal fade" id="cc-modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Currículo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Instrumento *</label>
              <input type="text" class="form-control" id="cc-instrumento" placeholder="ej. Guitarra">
            </div>
            <div class="mb-3">
              <label class="form-label">Nivel *</label>
              <input type="text" class="form-control" id="cc-nivel" placeholder="ej. inicial, intermedio, 1, 2...">
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" id="cc-desc" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary btn-sm" id="cc-btn-save">Crear</button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)
  const modalEl = el.querySelector('#cc-modal')
  const modal = new bootstrap.Modal(modalEl)

  el.querySelector('#cc-btn-save').addEventListener('click', async () => {
    const instrumento = el.querySelector('#cc-instrumento').value.trim()
    const nivel = el.querySelector('#cc-nivel').value.trim()
    if (!instrumento || !nivel) { AppToast.error('Instrumento y nivel son obligatorios'); return }
    try {
      await crearCurriculo({ instrumento, nivel, descripcion: el.querySelector('#cc-desc').value.trim() })
      AppToast.success('Currículo creado')
      modal.hide()
      onSaved?.()
    } catch (err) {
      AppToast.error(err.message)
    }
  })
  modalEl.addEventListener('hidden.bs.modal', () => el.remove())
  modal.show()
}

// ── Edit modal (pillars + objectives) ────────────────────────────────────────

export async function openCurriculoEditModal(curriculoId, onSaved) {
  // fetch full data including pilares + objetivos
  const { data: cur, error } = await (async () => {
    const { data, error } = await import('../../../core/supabase/supabaseClient.js').then(m => m.supabase
      .from('curriculos')
      .select(`id, instrumento, nivel, descripcion, curriculo_pilares(id, nombre, orden, curriculo_objetivos(id, descripcion, orden))`)
      .eq('id', curriculoId)
      .single())
    return { data, error }
  })()

  if (error) { AppToast.error(error.message); return }

  const el = document.createElement('div')
  el.innerHTML = `
    <div class="modal fade" id="ce-modal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Editar: ${cur.instrumento} — ${cur.nivel}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ce-body"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)
  const modalEl = el.querySelector('#ce-modal')
  const modal = new bootstrap.Modal(modalEl)

  function _renderBody() {
    const body = document.getElementById('ce-body')
    const pilares = cur.curriculo_pilares || []
    body.innerHTML = `
      <div class="mb-3">
        <label class="form-label fw-semibold">Pilares</label>
        <div id="ce-pilares">
          ${pilares.map(p => `
            <div class="cm-pilar" data-pilar-id="${p.id}">
              <div class="cm-pilar-header">
                <input class="form-control form-control-sm flex-grow-1 pilar-nombre" value="${p.nombre}">
                <button class="btn btn-sm btn-outline-danger btn-icon-compact pilar-del" title="Eliminar pilar"><i class="bi bi-trash"></i></button>
              </div>
              <div class="cm-pilar-body">
                ${p.curriculo_objetivos.map(o => `
                  <div class="cm-obj-row" data-obj-id="${o.id}">
                    <input class="form-control form-control-sm cm-obj-input obj-desc" value="${o.descripcion}">
                    <button class="btn btn-sm btn-outline-danger btn-icon-compact obj-del" title="Eliminar"><i class="bi bi-x"></i></button>
                  </div>`).join('')}
                <div class="mt-2 d-flex gap-2">
                  <input class="form-control form-control-sm new-obj-input" placeholder="Nuevo objetivo...">
                  <button class="btn btn-sm btn-outline-primary btn-icon-compact new-obj-btn" title="Agregar"><i class="bi bi-plus"></i></button>
                </div>
              </div>
            </div>`).join('')}
        </div>
        <button class="btn btn-outline-secondary btn-sm mt-2" id="ce-add-pilar">
          <i class="bi bi-plus me-1"></i>Agregar pilar
        </button>
      </div>`

    // save pilar name on blur
    body.querySelectorAll('.pilar-nombre').forEach(inp => {
      inp.addEventListener('blur', async () => {
        const pilarEl = inp.closest('[data-pilar-id]')
        const id = pilarEl.dataset.pilarId
        await actualizarPilar(id, { nombre: inp.value.trim() })
      })
    })

    // delete pilar
    body.querySelectorAll('.pilar-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pilarEl = btn.closest('[data-pilar-id]')
        const id = pilarEl.dataset.pilarId
        if (!confirm('¿Eliminar este pilar y todos sus objetivos?')) return
        await eliminarPilar(id)
        cur.curriculo_pilares = cur.curriculo_pilares.filter(p => p.id !== id)
        _renderBody()
      })
    })

    // save objective on blur
    body.querySelectorAll('.obj-desc').forEach(inp => {
      inp.addEventListener('blur', async () => {
        const objEl = inp.closest('[data-obj-id]')
        await actualizarObjetivo(objEl.dataset.objId, { descripcion: inp.value.trim() })
      })
    })

    // delete objective
    body.querySelectorAll('.obj-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const objEl = btn.closest('[data-obj-id]')
        const id = objEl.dataset.objId
        await eliminarObjetivo(id)
        const pilarId = objEl.closest('[data-pilar-id]').dataset.pilarId
        const pilar = cur.curriculo_pilares.find(p => p.id === pilarId)
        pilar.curriculo_objetivos = pilar.curriculo_objetivos.filter(o => o.id !== id)
        _renderBody()
      })
    })

    // add objective
    body.querySelectorAll('.new-obj-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pilarEl = btn.closest('[data-pilar-id]')
        const pilarId = pilarEl.dataset.pilarId
        const inp = pilarEl.querySelector('.new-obj-input')
        const desc = inp.value.trim()
        if (!desc) return
        const pilar = cur.curriculo_pilares.find(p => p.id === pilarId)
        const orden = pilar.curriculo_objetivos.length
        const obj = await crearObjetivo(pilarId, desc, orden)
        pilar.curriculo_objetivos.push({ ...obj, curriculo_objetivos: [] })
        inp.value = ''
        _renderBody()
      })
    })

    // add pilar
    document.getElementById('ce-add-pilar')?.addEventListener('click', async () => {
      const nombre = prompt('Nombre del nuevo pilar:')
      if (!nombre?.trim()) return
      const orden = cur.curriculo_pilares.length
      const pilar = await crearPilar(cur.id, nombre.trim(), orden)
      cur.curriculo_pilares.push({ ...pilar, curriculo_objetivos: [] })
      _renderBody()
    })
  }

  modalEl.addEventListener('hidden.bs.modal', () => {
    el.remove()
    onSaved?.()
  })
  modal.show()
  _renderBody()
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/planificacion/components/curriculoModal.js
git commit -m "feat(planificacion): add curriculoModal — admin curriculum editor with pillars and objectives"
```

---

## Task 6: coberturaModal.js — Teacher confirms AI coverage

**Files:**
- Create: `src/modules/planificacion/components/coberturaModal.js`

- [ ] **Step 1: Create the file**

```js
/**
 * coberturaModal.js — When a teacher marks a plan as "ejecutado",
 * this modal shows AI-extracted coverage per student for confirmation.
 *
 * Usage:
 *   openCoberturaModal({ plan, claseId, instrumento, nivel, onConfirm, onSkip })
 *
 * onConfirm() is called after teacher saves coverage.
 * onSkip() is called if teacher clicks "Saltar".
 */
import { obtenerCurriculo } from '../api/curriculoApi.js'
import { upsertCobertura } from '../api/coberturaApi.js'
import { extraerCobertura } from '../api/groqService.js'
import { parseDsl } from '../utils/dslParser.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { supabase } from '../../../core/supabase/supabaseClient.js'

const STYLE = `
<style id="cobertura-modal-style">
.cob-alumno-block { border: 1px solid var(--bs-border-color); border-radius:8px; padding:.75rem; margin-bottom:.75rem; }
.cob-alumno-name { font-weight:600; margin-bottom:.5rem; }
.cob-obj-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.25rem; font-size:.875rem; }
.cob-nivel-sel { width: auto; font-size:.8rem; }
.cob-ai-badge { font-size:.7rem; color: var(--bs-warning-text-emphasis); }
</style>`

export async function openCoberturaModal({ plan, claseId, instrumento, nivel, maestroId, onConfirm, onSkip }) {
  const el = document.createElement('div')
  el.innerHTML = `${STYLE}
    <div class="modal fade" id="cob-modal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-check2-circle me-2 text-success"></i>Cobertura Curricular</h5>
          </div>
          <div class="modal-body" id="cob-body">
            <div class="text-center py-5">
              <div class="spinner-border text-primary mb-3"></div>
              <div class="text-muted small">Analizando el plan con IA...</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary btn-sm" id="cob-btn-skip">Saltar</button>
            <button class="btn btn-success btn-sm" id="cob-btn-confirm" disabled>
              <i class="bi bi-check2 me-1"></i>Confirmar y ejecutar
            </button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)
  const modalEl = el.querySelector('#cob-modal')
  const modal = new bootstrap.Modal(modalEl)

  // State for confirmed coverage
  let coverageState = [] // { alumno_id, alumno_nombre, objetivo_id, nivel, checked }

  // skip button
  el.querySelector('#cob-btn-skip').addEventListener('click', () => {
    modal.hide()
    onSkip?.()
  })

  // confirm button
  el.querySelector('#cob-btn-confirm').addEventListener('click', async () => {
    const toSave = coverageState
      .filter(r => r.checked)
      .map(r => ({
        alumno_id: r.alumno_id,
        objetivo_id: r.objetivo_id,
        plan_id: plan.id,
        maestro_id: maestroId,
        nivel: r.nivel,
        confirmado: true,
        fecha: plan.fecha_inicio || new Date().toISOString().slice(0, 10)
      }))

    try {
      if (toSave.length > 0) await upsertCobertura(toSave)
      AppToast.success('Cobertura registrada')
      modal.hide()
      onConfirm?.()
    } catch (err) {
      AppToast.error(err.message)
    }
  })

  modalEl.addEventListener('hidden.bs.modal', () => el.remove())
  modal.show()

  // ── Load data and run AI ─────────────────────────────────────────────────
  try {
    // 1. Get curriculum
    const curriculo = instrumento && nivel ? await obtenerCurriculo(instrumento, nivel) : null

    // 2. Parse students from DSL
    const dslText = plan.notas_dsl || plan.contenido || ''
    const parsed = parseDsl(dslText)
    const alumnosEnDsl = parsed.alumnos || []

    // 3. Get alumno records for mentioned names (case-insensitive partial match)
    let alumnosConId = []
    if (alumnosEnDsl.length > 0) {
      const { data } = await supabase
        .from('alumnos')
        .select('id, nombre_completo')
        .ilike('nombre_completo', `%${alumnosEnDsl[0]}%`) // best-effort first
      alumnosConId = data || []

      // try all names
      const { data: todos } = await supabase.from('alumnos').select('id, nombre_completo')
      alumnosConId = (todos || []).filter(a =>
        alumnosEnDsl.some(n => a.nombre_completo.toLowerCase().includes(n.toLowerCase()))
      )
    }

    // If no students in DSL but we have clase, use enrolled students
    if (alumnosConId.length === 0 && claseId) {
      const { data } = await supabase
        .from('alumnos_clases')
        .select('alumnos(id, nombre_completo)')
        .eq('clase_id', claseId)
      alumnosConId = (data || []).map(r => r.alumnos).filter(Boolean)
    }

    // 4. Flatten all objectives from curriculum
    const todosObjetivos = curriculo
      ? curriculo.curriculo_pilares.flatMap(p =>
          p.curriculo_objetivos.map(o => ({ ...o, pilar_nombre: p.nombre }))
        )
      : []

    // 5. Call AI
    let aiCoberturas = []
    if (curriculo && todosObjetivos.length > 0) {
      const result = await extraerCobertura(
        { tema: plan.tema, objetivos: plan.objetivos, contenido: plan.contenido, notas_dsl: plan.notas_dsl },
        alumnosEnDsl,
        todosObjetivos.map(o => ({ id: o.id, descripcion: o.descripcion }))
      )
      aiCoberturas = result.coberturas || []
    }

    // 6. Build coverageState
    coverageState = []
    alumnosConId.forEach(alumno => {
      todosObjetivos.forEach(obj => {
        const aiMatch = aiCoberturas.find(
          c => c.objetivo_id === obj.id &&
               alumno.nombre_completo.toLowerCase().includes(c.alumno?.toLowerCase() || '')
        )
        coverageState.push({
          alumno_id: alumno.id,
          alumno_nombre: alumno.nombre_completo,
          objetivo_id: obj.id,
          obj_descripcion: obj.descripcion,
          pilar_nombre: obj.pilar_nombre,
          nivel: aiMatch?.nivel || 'en_proceso',
          checked: !!aiMatch,
          ai_suggested: !!aiMatch,
          razon: aiMatch?.razon || ''
        })
      })
    })

    _renderBody()
    el.querySelector('#cob-btn-confirm').disabled = false

  } catch (err) {
    document.getElementById('cob-body').innerHTML = `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudo analizar automáticamente: ${err.message}
        <br><small>Podés saltar este paso o confirmar sin cobertura.</small>
      </div>`
    el.querySelector('#cob-btn-confirm').disabled = false
  }

  function _renderBody() {
    const body = document.getElementById('cob-body')

    if (!coverageState.length) {
      body.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No hay currículo activo para este instrumento/nivel, o no se encontraron alumnos.
          Podés saltar este paso.
        </div>`
      return
    }

    // Group by student
    const byAlumno = {}
    coverageState.forEach(r => {
      if (!byAlumno[r.alumno_id]) byAlumno[r.alumno_id] = { nombre: r.alumno_nombre, rows: [] }
      byAlumno[r.alumno_id].rows.push(r)
    })

    body.innerHTML = `
      <p class="text-muted small mb-3">
        <i class="bi bi-robot me-1"></i>
        La IA pre-marcó los objetivos que probablemente se cubrieron. Revisá y ajustá según corresponda.
      </p>
      ${Object.entries(byAlumno).map(([alumnoId, { nombre, rows }]) => `
        <div class="cob-alumno-block">
          <div class="cob-alumno-name"><i class="bi bi-person me-1"></i>${nombre}</div>
          ${rows.map((r, idx) => `
            <div class="cob-obj-row" data-alumno="${alumnoId}" data-obj="${r.objetivo_id}">
              <input type="checkbox" class="form-check-input cob-check" data-idx="${coverageState.indexOf(r)}" ${r.checked ? 'checked' : ''}>
              <span class="cob-obj-text">
                <span class="text-muted small">${r.pilar_nombre} /</span> ${r.obj_descripcion}
                ${r.ai_suggested ? `<span class="cob-ai-badge ms-1"><i class="bi bi-stars"></i> IA</span>` : ''}
              </span>
              <select class="form-select form-select-sm cob-nivel-sel" data-idx="${coverageState.indexOf(r)}" ${!r.checked ? 'disabled' : ''}>
                <option value="iniciando" ${r.nivel === 'iniciando' ? 'selected' : ''}>Iniciando</option>
                <option value="en_proceso" ${r.nivel === 'en_proceso' ? 'selected' : ''}>En proceso</option>
                <option value="logrado" ${r.nivel === 'logrado' ? 'selected' : ''}>Logrado</option>
              </select>
            </div>`).join('')}
        </div>`).join('')}`

    // checkbox events
    body.querySelectorAll('.cob-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const idx = +chk.dataset.idx
        coverageState[idx].checked = chk.checked
        const sel = body.querySelector(`.cob-nivel-sel[data-idx="${idx}"]`)
        if (sel) sel.disabled = !chk.checked
      })
    })

    // nivel select events
    body.querySelectorAll('.cob-nivel-sel').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = +sel.dataset.idx
        coverageState[idx].nivel = sel.value
      })
    })
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/planificacion/components/coberturaModal.js
git commit -m "feat(planificacion): add coberturaModal — AI coverage confirmation on plan execution"
```

---

## Task 7: planificacionView.js — "Ejecutar" button + coberturaModal intercept

**Files:**
- Modify: `src/modules/planificacion/views/planificacionView.js`

The view currently has no "Ejecutar" button. Teachers change estado only through the edit modal. We need to:
1. Add an "Ejecutar" button to each `planificado` row
2. When clicked, instead of directly changing estado to 'ejecutado', open coberturaModal
3. onConfirm → change estado to 'ejecutado' via API, refresh view
4. onSkip → change estado to 'ejecutado' directly, refresh view

- [ ] **Step 1: Add imports at top of planificacionView.js**

After the existing imports (find line with last `import` statement), add:
```js
import { openCoberturaModal } from '../components/coberturaModal.js'
import { actualizarPlanificacion } from '../api/planificacionApi.js'
```

Note: `actualizarPlanificacion` is likely already imported. Check and skip if duplicate.

- [ ] **Step 2: Add "Ejecutar" button to table row**

In `_renderTableRows()`, inside the `quick-actions` div, after the edit button block, add:
```js
${!isAdmin && p.estado === 'planificado' ? `
  <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="ejecutar" data-id="${p.id}" title="Marcar como ejecutado">
    <i class="bi bi-play-fill"></i>
  </button>
` : ''}
```

Place it between the edit button and the view (eye) button.

- [ ] **Step 3: Add handler in _attachEvents() for action="ejecutar"**

Find the `switch(action)` or `if/else` block that handles `data-action` in `_attachEvents()`. Add a new case:
```js
case 'ejecutar': _ejecutarPlan(id); break;
```

- [ ] **Step 4: Add the `_ejecutarPlan` function**

Add after the existing `_approveOne` function (~line 685):
```js
async function _ejecutarPlan(id) {
  const plan = state.planesOriginales.find(p => p.id === id)
  if (!plan) return

  // Resolve instrumento + nivel from clase
  let instrumento = plan.instrumento
  let nivel = null
  let claseId = plan.clase_id

  if (claseId) {
    const { data: clase } = await supabase
      .from('clases')
      .select('instrumento, plan_estudio')
      .eq('id', claseId)
      .single()
    if (clase) {
      instrumento = instrumento || clase.instrumento
      nivel = clase.plan_estudio
    }
  }

  // Get current maestro id
  const { data: { user } } = await supabase.auth.getUser()
  const { data: maestro } = await supabase
    .from('maestros')
    .select('id')
    .eq('user_id', user.id)
    .single()
  const maestroId = maestro?.id

  openCoberturaModal({
    plan,
    claseId,
    instrumento,
    nivel,
    maestroId,
    onConfirm: async () => {
      try {
        await actualizarPlanificacion(id, { estado: 'ejecutado' })
        AppToast.success('Plan marcado como ejecutado')
        renderPlanificacionView(state.container, { viewMode: state.viewMode })
      } catch (err) {
        AppToast.error(err.message)
      }
    },
    onSkip: async () => {
      try {
        await actualizarPlanificacion(id, { estado: 'ejecutado' })
        AppToast.success('Plan ejecutado (sin cobertura)')
        renderPlanificacionView(state.container, { viewMode: state.viewMode })
      } catch (err) {
        AppToast.error(err.message)
      }
    }
  })
}
```

- [ ] **Step 5: Commit**
```bash
git add src/modules/planificacion/views/planificacionView.js
git commit -m "feat(planificacion): add ejecutar button + coberturaModal intercept in planificacionView"
```

---

## Task 8: asistentePedagogicoPanel.js — AI assistant panel

**Files:**
- Create: `src/modules/planificacion/components/asistentePedagogicoPanel.js`

- [ ] **Step 1: Create the file**

```js
/**
 * asistentePedagogicoPanel.js — Three-block AI assistant panel for teachers.
 *
 * Block 1: Gap analysis per student (which curriculum objectives are pending)
 * Block 2: Draft for next class (AI generates plan based on pending objectives)
 * Block 3: Qualitative feedback on teacher's pedagogical approach
 *
 * Usage: renderAsistentePedagogicoPanel(container)
 */
import { supabase } from '../../../core/supabase/supabaseClient.js'
import { obtenerCurriculo } from '../api/curriculoApi.js'
import { obtenerCoberturaPorAlumno } from '../api/coberturaApi.js'
import { sugerirPlan, analizarEnfoque } from '../api/groqService.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const escapeHTML = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))

export async function renderAsistentePedagogicoPanel(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-robot fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Asistente IA</h1>
          <p class="text-muted small mb-0">Análisis curricular personalizado para tus alumnos</p>
        </div>
      </div>

      <!-- Block 1: Gap analysis -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-bar-chart-line text-primary"></i>
          <span class="fw-semibold">Análisis de brechas por alumno</span>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label-compact">Seleccionar alumno</label>
            <select class="form-select form-select-sm" id="ap-alumno-sel" style="max-width:300px">
              <option value="">Cargando alumnos...</option>
            </select>
          </div>
          <div id="ap-brechas-content">
            <p class="text-muted small">Seleccioná un alumno para ver su cobertura curricular.</p>
          </div>
        </div>
      </div>

      <!-- Block 2: Draft next class -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-magic text-success"></i>
          <span class="fw-semibold">Borrador para próxima clase</span>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-3">Generá un borrador de plan basado en los objetivos pendientes del alumno seleccionado.</p>
          <button class="btn btn-outline-success btn-sm" id="ap-btn-draft" disabled>
            <i class="bi bi-stars me-1"></i>Generar borrador
          </button>
          <div id="ap-draft-content" class="mt-3"></div>
        </div>
      </div>

      <!-- Block 3: Qualitative feedback -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-lightbulb text-warning"></i>
          <span class="fw-semibold">Retroalimentación pedagógica</span>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-3">Análisis de tu enfoque pedagógico basado en los últimos 2 meses de clases.</p>
          <button class="btn btn-outline-warning btn-sm" id="ap-btn-feedback">
            <i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque
          </button>
          <div id="ap-feedback-content" class="mt-3"></div>
        </div>
      </div>
    </div>`

  // Load state
  const state = {
    alumnos: [],
    selectedAlumnoId: null,
    selectedAlumno: null,
    cobertura: [],
    curriculo: null,
    maestroId: null,
    instrumento: null,
  }

  // Get maestro context
  const { data: { user } } = await supabase.auth.getUser()
  const { data: maestro } = await supabase.from('maestros').select('id, instrumento').eq('user_id', user.id).single()
  state.maestroId = maestro?.id
  state.instrumento = maestro?.instrumento

  // Load alumnos del maestro
  const { data: inscripciones } = await supabase
    .from('alumnos_clases')
    .select('alumnos(id, nombre_completo), clases(instrumento, plan_estudio)')
    .eq('clases.maestro_principal_id', state.maestroId)

  const alumnosMap = {}
  ;(inscripciones || []).forEach(i => {
    if (i.alumnos) {
      alumnosMap[i.alumnos.id] = {
        ...i.alumnos,
        instrumento: i.clases?.instrumento,
        nivel: i.clases?.plan_estudio
      }
    }
  })
  state.alumnos = Object.values(alumnosMap)

  const sel = container.querySelector('#ap-alumno-sel')
  sel.innerHTML = `<option value="">Seleccionar alumno...</option>` +
    state.alumnos.map(a => `<option value="${a.id}">${escapeHTML(a.nombre_completo)}</option>`).join('')

  sel.addEventListener('change', async () => {
    const id = sel.value
    if (!id) {
      container.querySelector('#ap-brechas-content').innerHTML = '<p class="text-muted small">Seleccioná un alumno.</p>'
      container.querySelector('#ap-btn-draft').disabled = true
      state.selectedAlumnoId = null
      return
    }
    state.selectedAlumnoId = id
    state.selectedAlumno = state.alumnos.find(a => a.id === id)
    container.querySelector('#ap-btn-draft').disabled = false
    await _renderBrechas()
  })

  async function _renderBrechas() {
    const content = container.querySelector('#ap-brechas-content')
    content.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-muted"></div></div>`

    try {
      const alumno = state.selectedAlumno
      state.curriculo = alumno.instrumento && alumno.nivel
        ? await obtenerCurriculo(alumno.instrumento, alumno.nivel)
        : null

      if (!state.curriculo) {
        content.innerHTML = `<div class="alert alert-secondary py-2 small">Sin guía curricular definida para ${escapeHTML(alumno.instrumento || 'este instrumento')} — ${escapeHTML(alumno.nivel || 'este nivel')}.</div>`
        return
      }

      state.cobertura = await obtenerCoberturaPorAlumno(state.selectedAlumnoId)
      const cobMap = {}
      state.cobertura.forEach(c => { cobMap[c.curriculo_objetivos?.id || c.objetivo_id] = c })

      const todosObjs = state.curriculo.curriculo_pilares.flatMap(p =>
        p.curriculo_objetivos.map(o => ({ ...o, pilar_nombre: p.nombre }))
      )
      const logrados = todosObjs.filter(o => cobMap[o.id]?.nivel === 'logrado').length
      const enProceso = todosObjs.filter(o => cobMap[o.id] && cobMap[o.id].nivel !== 'logrado').length
      const noIniciados = todosObjs.length - logrados - enProceso

      content.innerHTML = `
        <div class="mb-3">
          <span class="badge bg-success me-1">${logrados} logrados</span>
          <span class="badge bg-warning text-dark me-1">${enProceso} en proceso</span>
          <span class="badge bg-secondary me-1">${noIniciados} no iniciados</span>
          <span class="text-muted small">de ${todosObjs.length} objetivos totales</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle small">
            <thead class="table-light">
              <tr><th>Pilar</th><th>Objetivo</th><th>Estado</th><th>Confirmado</th></tr>
            </thead>
            <tbody>
              ${todosObjs.map(o => {
                const cob = cobMap[o.id]
                const nivel = cob?.nivel || 'no_iniciado'
                const badge = nivel === 'logrado'
                  ? '<span class="badge bg-success">✓ Logrado</span>'
                  : nivel === 'en_proceso'
                    ? '<span class="badge bg-warning text-dark">⟳ En proceso</span>'
                    : nivel === 'iniciando'
                      ? '<span class="badge bg-info">Iniciando</span>'
                      : '<span class="badge bg-secondary">○ No iniciado</span>'
                const confirmBadge = cob
                  ? (cob.confirmado
                    ? '<i class="bi bi-check-circle text-success" title="Confirmado por maestro"></i>'
                    : '<i class="bi bi-stars text-warning" title="Sugerido por IA"></i>')
                  : '—'
                return `<tr>
                  <td class="text-muted">${escapeHTML(o.pilar_nombre)}</td>
                  <td>${escapeHTML(o.descripcion)}</td>
                  <td>${badge}</td>
                  <td class="text-center">${confirmBadge}</td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
        </div>`
    } catch (err) {
      content.innerHTML = `<div class="alert alert-danger small">${err.message}</div>`
    }
  }

  // Block 2: Draft
  container.querySelector('#ap-btn-draft').addEventListener('click', async () => {
    if (!state.selectedAlumno) return
    const btn = container.querySelector('#ap-btn-draft')
    const draftContent = container.querySelector('#ap-draft-content')

    btn.disabled = true
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Generando...`
    draftContent.innerHTML = ''

    try {
      const alumno = state.selectedAlumno
      const todosObjs = state.curriculo?.curriculo_pilares?.flatMap(p =>
        p.curriculo_objetivos.map(o => ({ ...o, pilar_nombre: p.nombre }))
      ) || []
      const cobMap = {}
      state.cobertura.forEach(c => { cobMap[c.curriculo_objetivos?.id || c.objetivo_id] = c })
      const pendientes = todosObjs.filter(o => !cobMap[o.id] || cobMap[o.id].nivel !== 'logrado')

      // Last 3 executed plans
      const { data: planesRecientes } = await supabase
        .from('planificaciones')
        .select('tema')
        .eq('maestro_id', state.maestroId)
        .eq('estado', 'ejecutado')
        .order('created_at', { ascending: false })
        .limit(3)
      const ultimosTemas = (planesRecientes || []).map(p => p.tema)

      const result = await sugerirPlan(
        { nombre: alumno.nombre_completo, instrumento: alumno.instrumento || '(sin instrumento)', nivel: alumno.nivel || '(sin nivel)' },
        pendientes,
        ultimosTemas
      )

      if (!result.success || !result.plan) throw new Error(result.error || 'Sin respuesta')

      const plan = result.plan
      draftContent.innerHTML = `
        <div class="card border-success border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-success bg-opacity-15 text-success">Borrador generado por IA</span>
              <button class="btn btn-sm btn-success" id="ap-btn-save-draft">
                <i class="bi bi-floppy me-1"></i>Guardar como plan
              </button>
            </div>
            <div class="mb-2"><span class="fw-semibold">Tema:</span> <span id="draft-tema">${escapeHTML(plan.tema || '')}</span></div>
            <div class="mb-2"><span class="fw-semibold">Objetivos:</span> <span id="draft-objetivos">${escapeHTML(plan.objetivos || '')}</span></div>
            <div class="mb-2"><span class="fw-semibold">Contenido:</span> <span id="draft-contenido">${escapeHTML(plan.contenido || '')}</span></div>
            ${plan.recursos?.length ? `<div><span class="fw-semibold">Recursos:</span> ${plan.recursos.map(r => `<span class="badge bg-light text-dark border me-1">${escapeHTML(r)}</span>`).join('')}</div>` : ''}
          </div>
        </div>`

      container.querySelector('#ap-btn-save-draft')?.addEventListener('click', () => {
        // Dispatch event to open planificacion modal pre-filled
        document.dispatchEvent(new CustomEvent('planificacion:nuevoPlan', {
          detail: {
            tema: plan.tema,
            objetivos: plan.objetivos,
            contenido: plan.contenido,
          }
        }))
        AppToast.success('Borrador listo — completá los detalles en el modal')
      })
    } catch (err) {
      draftContent.innerHTML = `<div class="alert alert-danger small">${err.message}</div>`
    } finally {
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-stars me-1"></i>Generar borrador`
    }
  })

  // Block 3: Feedback
  container.querySelector('#ap-btn-feedback').addEventListener('click', async () => {
    const btn = container.querySelector('#ap-btn-feedback')
    const feedbackContent = container.querySelector('#ap-feedback-content')

    btn.disabled = true
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Analizando...`
    feedbackContent.innerHTML = ''

    try {
      // Last 8 weeks of executed plans
      const since = new Date()
      since.setDate(since.getDate() - 56)
      const { data: planes } = await supabase
        .from('planificaciones')
        .select('tema, contenido, objetivos, instrumento, clase_id')
        .eq('maestro_id', state.maestroId)
        .eq('estado', 'ejecutado')
        .gte('created_at', since.toISOString())

      const instrumento = state.instrumento || planes?.[0]?.instrumento || 'Instrumento'
      const curriculo = instrumento ? await obtenerCurriculo(instrumento, null).catch(() => null) : null

      // Build coverage summary text
      const cobResumen = state.selectedAlumnoId
        ? `Alumno seleccionado: ${state.selectedAlumno?.nombre_completo}. ${state.cobertura.length} objetivos trabajados.`
        : 'No hay alumno seleccionado para cobertura específica.'

      const result = await analizarEnfoque(instrumento, planes || [], curriculo, cobResumen)
      if (!result.success) throw new Error(result.error || 'Sin respuesta')

      feedbackContent.innerHTML = `
        <div class="card border-warning border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge bg-warning bg-opacity-15 text-warning-emphasis">Análisis pedagógico</span>
              <button class="btn btn-sm btn-outline-secondary" id="ap-btn-regenerate">
                <i class="bi bi-arrow-clockwise me-1"></i>Regenerar
              </button>
            </div>
            <div class="text-body" style="line-height:1.7; white-space:pre-line">${escapeHTML(result.feedback)}</div>
          </div>
        </div>`

      container.querySelector('#ap-btn-regenerate')?.addEventListener('click', () => {
        container.querySelector('#ap-btn-feedback').click()
      })
    } catch (err) {
      feedbackContent.innerHTML = `<div class="alert alert-danger small">${err.message}</div>`
    } finally {
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque`
    }
  })
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/planificacion/components/asistentePedagogicoPanel.js
git commit -m "feat(planificacion): add asistentePedagogicoPanel — 3-block AI assistant (gaps, draft, feedback)"
```

---

## Task 9: planificacionView.js — Add "Asistente IA" and "Currículo" tabs

**Files:**
- Modify: `src/modules/planificacion/views/planificacionView.js`

The view already has a tab system ("Mis planes" / "Plantillas"). We need to add two more tabs with role-based visibility.

- [ ] **Step 1: Add imports at top of file**

```js
import { renderAsistentePedagogicoPanel } from '../components/asistentePedagogicoPanel.js'
import { openCurriculoListModal } from '../components/curriculoModal.js'
```

- [ ] **Step 2: Locate and extend the tab nav HTML**

Find the HTML that renders the tab nav (look for `#planificacion-tabs` or similar). It currently has tabs for "Mis planes" and "Plantillas". Extend to include:

```html
<!-- Add after "Plantillas" tab -->
<li class="nav-item">
  <a class="nav-link" href="#" data-tab="asistente">
    <i class="bi bi-robot me-1"></i>Asistente IA
  </a>
</li>
${state.viewMode === 'admin' ? `
<li class="nav-item">
  <a class="nav-link" href="#" data-tab="curriculo">
    <i class="bi bi-journal-bookmark me-1"></i>Currículo
  </a>
</li>` : ''}
```

- [ ] **Step 3: Add tab content containers**

In the main content area HTML, after the existing tab content divs, add:
```html
<div id="tab-content-asistente" class="tab-pane" style="display:none"></div>
<div id="tab-content-curriculo" class="tab-pane" style="display:none"></div>
```

- [ ] **Step 4: Extend tab click handler**

Find the tab click handler (where `activeTab` is set) and add cases for the new tabs:
```js
case 'asistente':
  document.getElementById('tab-content-asistente').style.display = ''
  // Only render once; panel manages its own state
  if (!state.asistenteRendered) {
    renderAsistentePedagogicoPanel(document.getElementById('tab-content-asistente'))
    state.asistenteRendered = true
  }
  break
case 'curriculo':
  // Admin only: open curriculum management modal
  openCurriculoListModal()
  // Switch back to previous tab (modal handles its own UI)
  // Set tab indicator back
  break
```

- [ ] **Step 5: Add `asistenteRendered: false` to initial state**

In the `const state = {}` declaration at top, add `asistenteRendered: false`.

Reset it on view re-render: in `renderPlanificacionView()`, before rendering, set `state.asistenteRendered = false`.

- [ ] **Step 6: Listen for planificacion:nuevoPlan event (from AI draft "Guardar como plan")**

In `_attachEvents()`, add:
```js
document.addEventListener('planificacion:nuevoPlan', (e) => {
  const { tema, objetivos, contenido } = e.detail
  // Pre-fill and open create modal
  _openEditModal(null, { tema, objetivos, contenido })
}, { once: true })
```

- [ ] **Step 7: Commit**
```bash
git add src/modules/planificacion/views/planificacionView.js
git commit -m "feat(planificacion): add Asistente IA and Currículo tabs; wire AI draft save event"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered in task |
|-----------------|----------------|
| Admin: crear currículo con pilares y objetivos | Task 5 (curriculoModal) |
| Admin: activar/desactivar | Task 5 (toggleActivoCurriculo) |
| Maestro: ver guía curricular al crear plan | NOT YET — should show read-only panel in planificacionModal |
| Maestro: al ejecutar, modal de cobertura | Task 6 + 7 |
| Maestro: botón Saltar disponible | Task 6 (onSkip) |
| IA pre-checkea objetivos probables | Task 6 (extraerCobertura) |
| confirmado=false → AI suggested | Task 6 (upsertCobertura default) |
| Asistente IA: análisis de brechas | Task 8 |
| Asistente IA: borrador próxima clase | Task 8 |
| Asistente IA: retroalimentación cualitativa | Task 8 |
| Panel "Guía curricular" en modal de planificación | MISSING — add as Task 10 |

### Missing task detected: Guía curricular en planificacionModal

The spec says: "En el modal de planificación aparece un panel colapsado en el lateral derecho: 'Guía curricular'". This wasn't planned.

---

## Task 10: planificacionModal.js — Read-only curriculum guide panel

**Files:**
- Modify: `src/modules/planificacion/components/planificacionModal.js`

- [ ] **Step 1: Add import**

At top of planificacionModal.js add:
```js
import { obtenerCurriculo } from '../api/curriculoApi.js'
```

- [ ] **Step 2: Add curriculum panel to modal body**

Find where the modal body HTML is built (the large template string). Wrap existing form content in a flex container and add a collapsible side panel:

```html
<div class="d-flex gap-3">
  <!-- existing form -->
  <div class="flex-grow-1" id="pl-form-main">
    <!-- all existing form fields here -->
  </div>
  <!-- curriculum guide sidebar -->
  <div style="width:260px;flex-shrink:0" id="pl-curriculo-side">
    <div class="card border-0 bg-body-secondary h-100">
      <div class="card-header bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
        <span class="small fw-semibold"><i class="bi bi-journal-bookmark me-1 text-primary"></i>Guía curricular</span>
        <button class="btn btn-link btn-sm p-0 text-muted" id="pl-curriculo-toggle" title="Colapsar">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
      <div class="card-body p-2 small" id="pl-curriculo-body">
        <div class="text-muted text-center py-3">Seleccioná una clase para ver la guía</div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Load curriculum when clase changes**

In the onOpen callback (where clase select options are loaded), after populating the select:
```js
sel.addEventListener('change', async () => {
  const claseId = sel.value
  if (!claseId) return
  const { data: clase } = await supabase.from('clases')
    .select('instrumento, plan_estudio').eq('id', claseId).single()
  if (clase?.instrumento && clase?.plan_estudio) {
    _loadCurriculoGuide(clase.instrumento, clase.plan_estudio, modalBody)
  }
})
// Also load for existing plan
if (plan?.clase_id) {
  const { data: clase } = await supabase.from('clases')
    .select('instrumento, plan_estudio').eq('id', plan.clase_id).single()
  if (clase?.instrumento && clase?.plan_estudio) {
    _loadCurriculoGuide(clase.instrumento, clase.plan_estudio, modalBody)
  }
}
```

- [ ] **Step 4: Add `_loadCurriculoGuide` helper**

Outside the open function, add:
```js
async function _loadCurriculoGuide(instrumento, nivel, modalBody) {
  const body = modalBody.querySelector('#pl-curriculo-body')
  if (!body) return
  body.innerHTML = `<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-muted"></div></div>`
  try {
    const curriculo = await obtenerCurriculo(instrumento, nivel)
    if (!curriculo) {
      body.innerHTML = `<p class="text-muted small text-center">Sin guía curricular para ${instrumento} — ${nivel}</p>`
      return
    }
    body.innerHTML = curriculo.curriculo_pilares.map(p => `
      <div class="mb-2">
        <div class="fw-semibold text-uppercase small text-muted mb-1" style="font-size:.7rem">${p.nombre}</div>
        ${p.curriculo_objetivos.map(o => `
          <div class="d-flex align-items-start gap-1 mb-1">
            <i class="bi bi-circle text-muted" style="font-size:.65rem;margin-top:3px"></i>
            <span style="font-size:.78rem">${o.descripcion}</span>
          </div>`).join('')}
      </div>`).join('')
  } catch (err) {
    body.innerHTML = `<p class="text-danger small">${err.message}</p>`
  }
}
```

- [ ] **Step 5: Commit**
```bash
git add src/modules/planificacion/components/planificacionModal.js
git commit -m "feat(planificacion): add read-only curriculum guide side panel in planificacionModal"
```

---

## Success Criteria Verification

After all tasks are complete, verify manually:

1. ✅ Admin can create "Guitarra — Inicial" curriculum with 2 pillars and 5 objectives in under 5 min (Task 5)
2. ✅ Executing a plan opens coberturaModal with AI pre-checked objectives (Tasks 6+7)
3. ✅ Gap analysis for any student loads in under 3 seconds (Task 8, Block 1)
4. ✅ AI draft is editable and saveable directly as plan (Task 8 Block 2 → event → Task 9)
5. ✅ Qualitative feedback names the instrument and level specifically (Task 8, Block 3)
6. ✅ "Saltar" button exists and is styled as secondary (Task 6)
7. ✅ Curriculum guide shows in planificación modal as read-only reference (Task 10)
