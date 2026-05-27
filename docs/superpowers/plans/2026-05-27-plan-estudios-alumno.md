# Plan de Estudios por Alumno — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar una bitácora de dominio individual por alumno: el maestro registra un diagnóstico inicial y luego agrega entradas acumulativas de logros, dificultades y objetivos, que se muestran en la sección "Plan de Estudios" del perfil del alumno.

**Architecture:** API service (`planEstudiosApi.js`) + panel UI component (`PlanEstudiosPanel.js`) + estilos CSS locales. La tabla `alumno_plan_entradas` ya existe en Supabase con RLS. El componente reemplaza el contenido del `#pm-alumno-progreso-root` existente en `alumnoPerfilView.js`. Todas las mutations son optimistas: se actualiza la UI antes de confirmar con Supabase.

**Tech Stack:** Vanilla JS ES Modules, Supabase JS v2, Vitest, CSS variables `--pm-*`

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `src/portal-maestros/api/planEstudiosApi.js` | **Create** | CRUD sobre `alumno_plan_entradas` |
| `src/portal-maestros/api/__tests__/planEstudiosApi.test.js` | **Create** | Tests unitarios del API |
| `src/portal-maestros/components/PlanEstudiosPanel.js` | **Create** | Componente UI completo (lista + formulario) |
| `src/portal-maestros/components/__tests__/PlanEstudiosPanel.test.js` | **Create** | Tests del componente |
| `src/portal-maestros/views/alumnoPerfilView.js` | **Modify** | Importar y montar PlanEstudiosPanel en `#pm-alumno-progreso-root` |

---

## Task 1: API — planEstudiosApi.js

**Files:**
- Create: `src/portal-maestros/api/planEstudiosApi.js`
- Test: `src/portal-maestros/api/__tests__/planEstudiosApi.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/portal-maestros/api/__tests__/planEstudiosApi.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing api
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  fetchPlanEntradas,
  insertPlanEntrada,
  updatePlanEntrada,
  deletePlanEntrada,
} from '../planEstudiosApi.js'

function mockChain(returnValue) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(returnValue),
  }
  // Make the chain itself resolve (for non-single queries)
  chain.then = (resolve) => Promise.resolve(returnValue).then(resolve)
  return chain
}

describe('planEstudiosApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('fetchPlanEntradas(alumnoId)', () => {
    it('returns ordered entries for the alumno', async () => {
      const mockData = [
        { id: 'e1', alumno_id: 'a1', tipo: 'diagnostico', titulo: 'Nivel inicial', created_at: '2026-05-01T00:00:00Z' },
        { id: 'e2', alumno_id: 'a1', tipo: 'logro',        titulo: 'Do mayor',      created_at: '2026-05-10T00:00:00Z' },
      ]
      const chain = mockChain({ data: mockData, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await fetchPlanEntradas('a1')
      expect(supabase.from).toHaveBeenCalledWith('alumno_plan_entradas')
      expect(result).toHaveLength(2)
      expect(result[0].tipo).toBe('diagnostico')
    })

    it('throws when supabase returns an error', async () => {
      const chain = mockChain({ data: null, error: { message: 'DB error' } })
      supabase.from.mockReturnValue(chain)

      await expect(fetchPlanEntradas('a1')).rejects.toThrow('DB error')
    })
  })

  describe('insertPlanEntrada(entrada)', () => {
    it('inserts and returns the new entry', async () => {
      const newEntry = { id: 'e3', alumno_id: 'a1', maestro_id: 'm1', tipo: 'logro', titulo: 'Escala Re mayor' }
      const chain = mockChain({ data: newEntry, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo: 'logro', titulo: 'Escala Re mayor' })
      expect(result.titulo).toBe('Escala Re mayor')
    })

    it('throws when titulo is empty', async () => {
      await expect(insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo: 'logro', titulo: '' }))
        .rejects.toThrow('titulo requerido')
    })
  })

  describe('updatePlanEntrada(id, changes)', () => {
    it('updates the entry and returns updated data', async () => {
      const updated = { id: 'e1', titulo: 'Nivel inicial actualizado' }
      const chain = mockChain({ data: updated, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await updatePlanEntrada('e1', { titulo: 'Nivel inicial actualizado' })
      expect(result.titulo).toBe('Nivel inicial actualizado')
    })
  })

  describe('deletePlanEntrada(id)', () => {
    it('calls delete with the correct id', async () => {
      const chain = mockChain({ error: null })
      supabase.from.mockReturnValue(chain)

      await expect(deletePlanEntrada('e1')).resolves.toBeUndefined()
      expect(supabase.from).toHaveBeenCalledWith('alumno_plan_entradas')
    })
  })
})
```

- [ ] **Step 2: Run tests — verificar que fallan**

```bash
cd "C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa"
npx vitest run src/portal-maestros/api/__tests__/planEstudiosApi.test.js
```

Expected: FAIL — "Cannot find module '../planEstudiosApi.js'"

- [ ] **Step 3: Implementar planEstudiosApi.js**

```js
// src/portal-maestros/api/planEstudiosApi.js
import { supabase } from '../../lib/supabaseClient.js'

const TABLE = 'alumno_plan_entradas'

/**
 * Fetch all plan entries for a student, ordered newest first.
 * @param {string} alumnoId
 * @returns {Promise<Array>}
 */
export async function fetchPlanEntradas(alumnoId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, tipo, titulo, descripcion, nivel_referencia, objetivo_id, sesion_id, created_at, maestro_id')
    .eq('alumno_id', alumnoId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Insert a new plan entry.
 * @param {{ alumno_id, maestro_id, tipo, titulo, descripcion?, nivel_referencia?, objetivo_id?, sesion_id? }} entrada
 * @returns {Promise<Object>} The inserted row
 */
export async function insertPlanEntrada(entrada) {
  if (!entrada.titulo?.trim()) throw new Error('titulo requerido')

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      alumno_id:        entrada.alumno_id,
      maestro_id:       entrada.maestro_id,
      tipo:             entrada.tipo,
      titulo:           entrada.titulo.trim(),
      descripcion:      entrada.descripcion?.trim() || null,
      nivel_referencia: entrada.nivel_referencia || null,
      objetivo_id:      entrada.objetivo_id || null,
      sesion_id:        entrada.sesion_id || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Update an existing entry (only titulo, descripcion, nivel_referencia allowed).
 * @param {string} id
 * @param {{ titulo?, descripcion?, nivel_referencia? }} changes
 * @returns {Promise<Object>}
 */
export async function updatePlanEntrada(id, changes) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Delete a plan entry by id.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deletePlanEntrada(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
```

- [ ] **Step 4: Run tests — verificar que pasan**

```bash
npx vitest run src/portal-maestros/api/__tests__/planEstudiosApi.test.js
```

Expected: PASS — 6 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/api/planEstudiosApi.js src/portal-maestros/api/__tests__/planEstudiosApi.test.js
git commit -m "feat(plan-estudios): add planEstudiosApi CRUD + tests"
```

---

## Task 2: Componente PlanEstudiosPanel.js

**Files:**
- Create: `src/portal-maestros/components/PlanEstudiosPanel.js`
- Test: `src/portal-maestros/components/__tests__/PlanEstudiosPanel.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/portal-maestros/components/__tests__/PlanEstudiosPanel.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

vi.mock('../../api/planEstudiosApi.js', () => ({
  fetchPlanEntradas: vi.fn(),
  insertPlanEntrada: vi.fn(),
  updatePlanEntrada: vi.fn(),
  deletePlanEntrada: vi.fn(),
}))

import * as api from '../../api/planEstudiosApi.js'
import { PlanEstudiosPanel } from '../PlanEstudiosPanel.js'

function setupDOM() {
  const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>')
  global.document = dom.window.document
  global.window = dom.window
  return dom.window.document.getElementById('root')
}

describe('PlanEstudiosPanel', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = setupDOM()
  })

  it('renders empty state when no entries exist', async () => {
    api.fetchPlanEntradas.mockResolvedValue([])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    expect(container.querySelector('[data-testid="pe-empty"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="pe-btn-add"]')).not.toBeNull()
  })

  it('renders entries when data exists', async () => {
    api.fetchPlanEntradas.mockResolvedValue([
      { id: 'e1', tipo: 'diagnostico', titulo: 'Nivel inicial', descripcion: 'Conoce posición 1', created_at: '2026-05-01T00:00:00Z' },
      { id: 'e2', tipo: 'logro',       titulo: 'Do mayor',      descripcion: null,                  created_at: '2026-05-10T00:00:00Z' },
    ])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    const cards = container.querySelectorAll('[data-testid="pe-entry"]')
    expect(cards).toHaveLength(2)
    expect(cards[0].querySelector('[data-testid="pe-entry-titulo"]').textContent).toBe('Nivel inicial')
  })

  it('shows diagnostico badge for first entry of tipo diagnostico', async () => {
    api.fetchPlanEntradas.mockResolvedValue([
      { id: 'e1', tipo: 'diagnostico', titulo: 'Diagnóstico', descripcion: null, created_at: '2026-05-01T00:00:00Z' },
    ])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    const badge = container.querySelector('[data-testid="pe-tipo-badge"]')
    expect(badge).not.toBeNull()
    expect(badge.textContent).toContain('Diagnóstico')
  })

  it('addEntry() calls insertPlanEntrada and refreshes list', async () => {
    api.fetchPlanEntradas.mockResolvedValue([])
    const newEntry = { id: 'e3', tipo: 'logro', titulo: 'Arco', descripcion: null, created_at: '2026-05-20T00:00:00Z' }
    api.insertPlanEntrada.mockResolvedValue(newEntry)
    api.fetchPlanEntradas.mockResolvedValueOnce([]).mockResolvedValue([newEntry])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    await panel.addEntry({ tipo: 'logro', titulo: 'Arco', descripcion: null })

    expect(api.insertPlanEntrada).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'logro', titulo: 'Arco', alumno_id: 'a1', maestro_id: 'm1' })
    )
    const cards = container.querySelectorAll('[data-testid="pe-entry"]')
    expect(cards).toHaveLength(1)
  })

  it('deleteEntry() calls deletePlanEntrada and removes from list', async () => {
    const entries = [{ id: 'e1', tipo: 'logro', titulo: 'Do mayor', descripcion: null, created_at: '2026-05-10T00:00:00Z' }]
    api.fetchPlanEntradas.mockResolvedValue(entries)
    api.deletePlanEntrada.mockResolvedValue(undefined)
    api.fetchPlanEntradas.mockResolvedValueOnce(entries).mockResolvedValue([])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()
    await panel.deleteEntry('e1')

    expect(api.deletePlanEntrada).toHaveBeenCalledWith('e1')
    expect(container.querySelectorAll('[data-testid="pe-entry"]')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests — verificar que fallan**

```bash
npx vitest run src/portal-maestros/components/__tests__/PlanEstudiosPanel.test.js
```

Expected: FAIL — "Cannot find module '../PlanEstudiosPanel.js'"

- [ ] **Step 3: Implementar PlanEstudiosPanel.js**

```js
// src/portal-maestros/components/PlanEstudiosPanel.js
import { fetchPlanEntradas, insertPlanEntrada, deletePlanEntrada } from '../api/planEstudiosApi.js'
import { escHTML } from '../utils/portalUtils.js'

const TIPO_CFG = {
  diagnostico: { label: 'Diagnóstico', icon: '🔍', color: '#6366f1', bg: '#6366f115' },
  logro:       { label: 'Logro',       icon: '✅', color: '#16a34a', bg: '#16a34a15' },
  en_progreso: { label: 'En progreso', icon: '📈', color: '#2563eb', bg: '#2563eb15' },
  dificultad:  { label: 'Dificultad',  icon: '⚠️', color: '#dc2626', bg: '#dc262615' },
  objetivo:    { label: 'Objetivo',    icon: '🎯', color: '#d97706', bg: '#d9770615' },
}

const TIPOS_ORDEN = ['diagnostico', 'logro', 'en_progreso', 'dificultad', 'objetivo']

export class PlanEstudiosPanel {
  /** @param {{ container: HTMLElement, alumnoId: string, maestroId: string }} opts */
  constructor({ container, alumnoId, maestroId }) {
    this._container = container
    this._alumnoId  = alumnoId
    this._maestroId = maestroId
    this._entries   = []
    this._formOpen  = false
  }

  async init() {
    await this._load()
    this._render()
    this._attachEvents()
  }

  async _load() {
    this._entries = await fetchPlanEntradas(this._alumnoId)
  }

  _render() {
    this._container.innerHTML = this._buildHTML()
    this._attachEvents()
  }

  _buildHTML() {
    const hasEntries = this._entries.length > 0
    const hasDiag = this._entries.some(e => e.tipo === 'diagnostico')

    return `
      <div class="pe-panel">
        ${this._buildToolbar(hasDiag)}
        ${hasEntries ? this._buildTimeline() : this._buildEmpty()}
        ${this._formOpen ? this._buildForm() : ''}
      </div>
      ${this._buildStyles()}
    `
  }

  _buildToolbar(hasDiag) {
    return `
      <div class="pe-toolbar">
        <span class="pe-toolbar__count">${this._entries.length} entrada${this._entries.length !== 1 ? 's' : ''}</span>
        <button class="pe-btn pe-btn-primary" data-testid="pe-btn-add" data-action="open-form">
          <span>+</span>
          ${hasDiag ? 'Nueva entrada' : 'Registrar diagnóstico'}
        </button>
      </div>
    `
  }

  _buildEmpty() {
    return `
      <div class="pe-empty" data-testid="pe-empty">
        <span style="font-size:2rem;">📋</span>
        <p>Sin entradas registradas.</p>
        <p style="font-size:0.78rem;color:var(--pm-text-muted);">
          Comenzá con un <strong>diagnóstico inicial</strong> para documentar el nivel actual del alumno.
        </p>
      </div>
    `
  }

  _buildTimeline() {
    return `
      <div class="pe-timeline">
        ${this._entries.map(e => this._buildEntry(e)).join('')}
      </div>
    `
  }

  _buildEntry(e) {
    const cfg  = TIPO_CFG[e.tipo] || TIPO_CFG.logro
    const date = new Date(e.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    return `
      <div class="pe-entry" data-testid="pe-entry" data-id="${e.id}">
        <div class="pe-entry__dot" style="background:${cfg.color}"></div>
        <div class="pe-entry__body">
          <div class="pe-entry__header">
            <span class="pe-badge" data-testid="pe-tipo-badge" style="color:${cfg.color};background:${cfg.bg}">
              ${cfg.icon} ${cfg.label}
            </span>
            <span class="pe-entry__date">${date}</span>
            <button class="pe-btn-icon pe-btn-delete" data-action="delete" data-id="${e.id}" title="Eliminar">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          <p class="pe-entry__titulo" data-testid="pe-entry-titulo">${escHTML(e.titulo)}</p>
          ${e.descripcion ? `<p class="pe-entry__desc">${escHTML(e.descripcion)}</p>` : ''}
          ${e.nivel_referencia ? `<span class="pe-nivel">${e.nivel_referencia}</span>` : ''}
        </div>
      </div>
    `
  }

  _buildForm() {
    const hasDiag = this._entries.some(e => e.tipo === 'diagnostico')
    const defaultTipo = hasDiag ? 'logro' : 'diagnostico'
    return `
      <div class="pe-form-overlay">
        <div class="pe-form">
          <div class="pe-form__header">
            <strong>${hasDiag ? 'Nueva entrada' : 'Diagnóstico inicial'}</strong>
            <button class="pe-btn-icon" data-action="close-form"><i class="bi bi-x-lg"></i></button>
          </div>

          <label class="pe-label">Tipo</label>
          <select class="pe-select" id="pe-tipo">
            ${TIPOS_ORDEN.map(t => `
              <option value="${t}" ${t === defaultTipo ? 'selected' : ''}>${TIPO_CFG[t].icon} ${TIPO_CFG[t].label}</option>
            `).join('')}
          </select>

          <label class="pe-label">Título <span style="color:var(--pm-danger)">*</span></label>
          <input class="pe-input" id="pe-titulo" type="text" maxlength="200"
            placeholder="${hasDiag ? 'Ej: Dominó escala de Do mayor' : 'Ej: Conoce posición 1 en violín'}" />

          <label class="pe-label">Descripción (opcional)</label>
          <textarea class="pe-textarea" id="pe-descripcion" rows="3"
            placeholder="Detalles, contexto, observaciones del maestro..."></textarea>

          <label class="pe-label">Nivel de referencia</label>
          <select class="pe-select" id="pe-nivel">
            <option value="">— Sin especificar —</option>
            <option value="inicial">Inicial</option>
            <option value="basico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <div class="pe-form__actions">
            <button class="pe-btn pe-btn-ghost" data-action="close-form">Cancelar</button>
            <button class="pe-btn pe-btn-primary" data-action="save-entry" id="pe-save-btn">
              Guardar
            </button>
          </div>
        </div>
      </div>
    `
  }

  _buildStyles() {
    return `
      <style>
        .pe-panel { display:flex; flex-direction:column; gap:0.75rem; }
        .pe-toolbar { display:flex; align-items:center; justify-content:space-between; }
        .pe-toolbar__count { font-size:0.75rem; color:var(--pm-text-muted); }
        .pe-btn { display:inline-flex; align-items:center; gap:0.35rem; padding:0.4rem 0.85rem;
          border-radius:8px; border:none; font-size:0.82rem; font-weight:600; cursor:pointer;
          transition:opacity 0.15s; }
        .pe-btn:active { opacity:0.7; }
        .pe-btn-primary { background:var(--pm-primary); color:#fff; }
        .pe-btn-ghost { background:var(--pm-surface-2); color:var(--pm-text-muted);
          border:1px solid var(--pm-border); }
        .pe-btn-icon { background:none; border:none; cursor:pointer; color:var(--pm-text-muted);
          padding:0.2rem 0.4rem; border-radius:6px; font-size:0.8rem; transition:color 0.15s; }
        .pe-btn-delete:hover { color:var(--pm-danger); }
        .pe-empty { text-align:center; padding:1.25rem 0.5rem; color:var(--pm-text-muted); }
        .pe-empty p { margin:0.25rem 0; font-size:0.85rem; }
        .pe-timeline { display:flex; flex-direction:column; gap:0; position:relative; }
        .pe-timeline::before { content:''; position:absolute; left:9px; top:12px; bottom:12px;
          width:2px; background:var(--pm-border); border-radius:1px; }
        .pe-entry { display:flex; gap:0.75rem; padding:0.5rem 0; position:relative; }
        .pe-entry__dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:6px;
          border:2px solid var(--pm-surface); position:relative; z-index:1; }
        .pe-entry__body { flex:1; min-width:0; background:var(--pm-surface-2);
          border:1px solid var(--pm-border); border-radius:10px; padding:0.6rem 0.75rem; }
        .pe-entry__header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;
          flex-wrap:wrap; }
        .pe-badge { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px;
          flex-shrink:0; }
        .pe-entry__date { font-size:0.68rem; color:var(--pm-text-muted); margin-left:auto; }
        .pe-entry__titulo { font-size:0.85rem; font-weight:600; margin:0; color:var(--pm-text); }
        .pe-entry__desc { font-size:0.78rem; color:var(--pm-text-muted); margin:0.25rem 0 0;
          line-height:1.45; font-style:italic; }
        .pe-nivel { display:inline-block; font-size:0.65rem; font-weight:600; text-transform:uppercase;
          letter-spacing:0.04em; color:var(--pm-primary); background:var(--pm-primary);
          background:color-mix(in srgb,var(--pm-primary) 15%,transparent);
          padding:1px 6px; border-radius:4px; margin-top:0.3rem; }
        .pe-form-overlay { position:relative; }
        .pe-form { background:var(--pm-surface-2); border:1px solid var(--pm-border);
          border-radius:14px; padding:1rem; display:flex; flex-direction:column; gap:0.6rem; }
        .pe-form__header { display:flex; justify-content:space-between; align-items:center;
          margin-bottom:0.25rem; }
        .pe-form__header strong { font-size:0.9rem; }
        .pe-label { font-size:0.72rem; font-weight:600; color:var(--pm-text-muted);
          text-transform:uppercase; letter-spacing:0.04em; margin-bottom:-0.3rem; }
        .pe-input, .pe-select, .pe-textarea { width:100%; border:1px solid var(--pm-border);
          border-radius:8px; padding:0.5rem 0.65rem; font-size:0.85rem;
          background:var(--pm-surface); color:var(--pm-text); font-family:inherit;
          box-sizing:border-box; outline:none; transition:border-color 0.15s; }
        .pe-input:focus, .pe-select:focus, .pe-textarea:focus { border-color:var(--pm-primary); }
        .pe-textarea { resize:vertical; min-height:70px; line-height:1.45; }
        .pe-form__actions { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.25rem; }
      </style>
    `
  }

  _attachEvents() {
    this._container.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation()
        const action = el.dataset.action
        if (action === 'open-form')  this._openForm()
        if (action === 'close-form') this._closeForm()
        if (action === 'save-entry') this._handleSave()
        if (action === 'delete')     this.deleteEntry(el.dataset.id)
      })
    })
  }

  _openForm() {
    this._formOpen = true
    this._render()
    // Focus the title input after render
    setTimeout(() => this._container.querySelector('#pe-titulo')?.focus(), 50)
  }

  _closeForm() {
    this._formOpen = false
    this._render()
  }

  async _handleSave() {
    const tipo        = this._container.querySelector('#pe-tipo')?.value
    const titulo      = this._container.querySelector('#pe-titulo')?.value?.trim()
    const descripcion = this._container.querySelector('#pe-descripcion')?.value?.trim()
    const nivel       = this._container.querySelector('#pe-nivel')?.value

    if (!titulo) {
      this._container.querySelector('#pe-titulo')?.focus()
      return
    }

    const saveBtn = this._container.querySelector('#pe-save-btn')
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando...' }

    try {
      await this.addEntry({ tipo, titulo, descripcion: descripcion || null, nivel_referencia: nivel || null })
      this._formOpen = false
    } catch (err) {
      console.error('[PlanEstudiosPanel] save error:', err)
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar' }
    }
  }

  /**
   * Public API used by tests and parent view.
   * @param {{ tipo, titulo, descripcion?, nivel_referencia? }} entry
   */
  async addEntry(entry) {
    const saved = await insertPlanEntrada({
      alumno_id:        this._alumnoId,
      maestro_id:       this._maestroId,
      tipo:             entry.tipo,
      titulo:           entry.titulo,
      descripcion:      entry.descripcion || null,
      nivel_referencia: entry.nivel_referencia || null,
    })
    // Optimistic: prepend to local list then re-render
    this._entries = [saved, ...this._entries]
    this._render()
  }

  /**
   * Public API used by tests.
   * @param {string} id
   */
  async deleteEntry(id) {
    // Optimistic removal
    this._entries = this._entries.filter(e => e.id !== id)
    this._render()
    await deletePlanEntrada(id)
  }
}
```

- [ ] **Step 4: Run tests — verificar que pasan**

```bash
npx vitest run src/portal-maestros/components/__tests__/PlanEstudiosPanel.test.js
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/components/PlanEstudiosPanel.js src/portal-maestros/components/__tests__/PlanEstudiosPanel.test.js
git commit -m "feat(plan-estudios): add PlanEstudiosPanel component + tests"
```

---

## Task 3: Wire PlanEstudiosPanel en alumnoPerfilView.js

**Files:**
- Modify: `src/portal-maestros/views/alumnoPerfilView.js` (línea ~1067, sección `#pm-alumno-progreso-root`)

- [ ] **Step 1: Agregar import al inicio del archivo**

En `alumnoPerfilView.js`, después de las importaciones existentes (línea ~4), agregar:

```js
import { PlanEstudiosPanel } from '../components/PlanEstudiosPanel.js'
```

- [ ] **Step 2: Reemplazar la inicialización de `#pm-alumno-progreso-root`**

Buscar la llamada a `_renderEvaluaciones(container, alumnoId)` (cerca del final de `renderAlumnoPerfilView`) y reemplazarla:

```js
// ANTES:
_renderEvaluaciones(container, alumnoId)

// DESPUÉS:
const planRoot = container.querySelector('#pm-alumno-progreso-root')
if (planRoot) {
  const panel = new PlanEstudiosPanel({
    container: planRoot,
    alumnoId,
    maestroId: maestro.id,
  })
  panel.init().catch(err => {
    console.error('[AlumnoPerfil] PlanEstudiosPanel error:', err)
    planRoot.innerHTML = `<p style="color:var(--pm-danger);font-size:0.82rem;">Error al cargar plan de estudios: ${escHTML(err.message)}</p>`
  })
}
```

- [ ] **Step 3: Verificar en browser**

1. Abrir `localhost:5173`
2. Navegar a un alumno: click en "Ver Ficha" desde el panel de actividad
3. Scroll hasta "📚 Plan de Estudios"
4. Verificar que aparece el botón "Registrar diagnóstico"
5. Click → se abre el formulario inline
6. Llenar título → "Guardar" → aparece en la línea de tiempo
7. Click en el ícono de basura → desaparece de la lista

- [ ] **Step 4: Commit**

```bash
git add src/portal-maestros/views/alumnoPerfilView.js
git commit -m "feat(plan-estudios): wire PlanEstudiosPanel into alumnoPerfilView"
```

---

## Task 4: Migration file local + test de integración

**Files:**
- Create: `supabase/migrations/20260527_create_alumno_plan_entradas.sql`
- Create: `src/portal-maestros/api/__tests__/planEstudiosApi.integration.test.js`

- [ ] **Step 1: Crear archivo de migración local** (ya aplicada en DB, pero documenta el schema)

```sql
-- supabase/migrations/20260527_create_alumno_plan_entradas.sql
-- Bitácora de dominio por alumno: diagnóstico inicial + entradas acumulativas.
-- Aplicada en DB el 2026-05-27 via MCP.

CREATE TABLE IF NOT EXISTS public.alumno_plan_entradas (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id       uuid        NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  maestro_id      uuid        NOT NULL REFERENCES public.maestros(id) ON DELETE CASCADE,
  tipo            text        NOT NULL
                              CHECK (tipo IN ('diagnostico','logro','en_progreso','dificultad','objetivo')),
  titulo          text        NOT NULL CHECK (char_length(titulo) BETWEEN 2 AND 200),
  descripcion     text        CHECK (char_length(descripcion) <= 2000),
  objetivo_id     uuid        REFERENCES public.curriculo_objetivos(id) ON DELETE SET NULL,
  nivel_referencia text       CHECK (nivel_referencia IN ('inicial','basico','intermedio','avanzado')),
  sesion_id       uuid        REFERENCES public.sesiones_clase(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ape_alumno   ON public.alumno_plan_entradas (alumno_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ape_maestro  ON public.alumno_plan_entradas (maestro_id);
CREATE INDEX IF NOT EXISTS idx_ape_objetivo ON public.alumno_plan_entradas (objetivo_id) WHERE objetivo_id IS NOT NULL;

ALTER TABLE public.alumno_plan_entradas ENABLE ROW LEVEL SECURITY;

-- [Policies ya aplicadas — ver MCP migration log 2026-05-27]
```

- [ ] **Step 2: Test de integración (smoke test con mock de Supabase)**

```js
// src/portal-maestros/api/__tests__/planEstudiosApi.integration.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { fetchPlanEntradas, insertPlanEntrada, deletePlanEntrada } from '../planEstudiosApi.js'

function buildChain(result) {
  const c = { select:vi.fn().mockReturnThis(), insert:vi.fn().mockReturnThis(),
    delete:vi.fn().mockReturnThis(), eq:vi.fn().mockReturnThis(),
    order:vi.fn().mockReturnThis(), single:vi.fn().mockResolvedValue(result) }
  c.then = (res) => Promise.resolve(result).then(res)
  return c
}

describe('planEstudiosApi — integration smoke tests', () => {
  beforeEach(() => vi.clearAllMocks())

  it('full create → fetch → delete cycle completes without throwing', async () => {
    const entry = { id: 'e1', alumno_id: 'a1', maestro_id: 'm1',
      tipo: 'diagnostico', titulo: 'Nivel base', created_at: new Date().toISOString() }

    // insertPlanEntrada
    supabase.from.mockReturnValueOnce(buildChain({ data: entry, error: null }))
    const saved = await insertPlanEntrada({ alumno_id:'a1', maestro_id:'m1', tipo:'diagnostico', titulo:'Nivel base' })
    expect(saved.id).toBe('e1')

    // fetchPlanEntradas
    supabase.from.mockReturnValueOnce(buildChain({ data: [entry], error: null }))
    const list = await fetchPlanEntradas('a1')
    expect(list).toHaveLength(1)
    expect(list[0].titulo).toBe('Nivel base')

    // deletePlanEntrada
    supabase.from.mockReturnValueOnce(buildChain({ error: null }))
    await expect(deletePlanEntrada('e1')).resolves.toBeUndefined()
  })

  it('tipo must be one of the valid values — validated client-side implicitly', async () => {
    // Insertamos un tipo válido — el CHECK constraint lo valida en DB
    // En el cliente solo validamos el título vacío
    supabase.from.mockReturnValueOnce(buildChain({ data: null, error: { message: 'violates check constraint' } }))
    await expect(insertPlanEntrada({ alumno_id:'a1', maestro_id:'m1', tipo:'invalido', titulo:'X' }))
      .rejects.toThrow('violates check constraint')
  })
})
```

- [ ] **Step 3: Run todos los tests del módulo**

```bash
npx vitest run src/portal-maestros/api/__tests__/planEstudiosApi.test.js
npx vitest run src/portal-maestros/api/__tests__/planEstudiosApi.integration.test.js
npx vitest run src/portal-maestros/components/__tests__/PlanEstudiosPanel.test.js
```

Expected: todos PASS

- [ ] **Step 4: Commit final**

```bash
git add supabase/migrations/20260527_create_alumno_plan_entradas.sql
git add src/portal-maestros/api/__tests__/planEstudiosApi.integration.test.js
git commit -m "feat(plan-estudios): add migration file + integration smoke tests"
```

---

## Checklist de verificación final

- [ ] `npx vitest run --reporter=verbose` — 0 tests failing en los 4 archivos nuevos
- [ ] En browser: el panel "📚 Plan de Estudios" aparece en el perfil del alumno
- [ ] Se puede agregar un diagnóstico inicial (tipo "diagnostico")
- [ ] Las entradas siguientes ofrecen todos los tipos (logro, en_progreso, dificultad, objetivo)
- [ ] El formulario se cierra y actualiza la lista sin reload
- [ ] Eliminar una entrada la remueve optimísticamente de la UI
- [ ] La línea de tiempo vertical se ve correcta en mobile y desktop
- [ ] Si el alumno no tiene entradas, se muestra el empty state con CTA
