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
    this._container.innerHTML = '<div class="pm-loading-zen"><div class="pm-pulse"></div></div>'
    await this._load()
    this._render()
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
    const hasDiag    = this._entries.some(e => e.tipo === 'diagnostico')

    return `
      <div class="pe-panel">
        ${this._buildToolbar(hasDiag)}
        ${hasEntries ? this._buildTimeline() : this._buildEmpty()}
        ${this._formOpen ? this._buildForm(hasDiag) : ''}
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

  _buildForm(hasDiag) {
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
        .pe-timeline::before { content:''; position:absolute; left:9px; top:14px; bottom:14px;
          width:2px; background:var(--pm-border); border-radius:1px; }
        .pe-entry { display:flex; gap:0.75rem; padding:0.45rem 0; position:relative; }
        .pe-entry__dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:8px;
          border:2px solid var(--pm-surface, #fff); position:relative; z-index:1; }
        .pe-entry__body { flex:1; min-width:0; background:var(--pm-surface-2);
          border:1px solid var(--pm-border); border-radius:10px; padding:0.6rem 0.75rem; }
        .pe-entry__header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;
          flex-wrap:wrap; }
        .pe-badge { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px;
          flex-shrink:0; }
        .pe-entry__date { font-size:0.68rem; color:var(--pm-text-muted); margin-left:auto; }
        .pe-entry__titulo { font-size:0.85rem; font-weight:600; margin:0; color:var(--pm-text); }
        .pe-entry__desc { font-size:0.78rem; color:var(--pm-text-muted); margin:0.25rem 0 0;
          line-height:1.45; font-style:italic; }
        .pe-nivel { display:inline-block; font-size:0.65rem; font-weight:600;
          text-transform:uppercase; letter-spacing:0.04em; color:var(--pm-primary);
          background:rgba(99,102,241,0.12); padding:1px 6px; border-radius:4px; margin-top:0.3rem; }
        .pe-form-overlay { position:relative; }
        .pe-form { background:var(--pm-surface-2); border:1px solid var(--pm-border);
          border-radius:14px; padding:1rem; display:flex; flex-direction:column; gap:0.6rem; }
        .pe-form__header { display:flex; justify-content:space-between; align-items:center;
          margin-bottom:0.1rem; }
        .pe-form__header strong { font-size:0.9rem; }
        .pe-label { font-size:0.72rem; font-weight:600; color:var(--pm-text-muted);
          text-transform:uppercase; letter-spacing:0.04em; margin-bottom:-0.25rem; }
        .pe-input, .pe-select, .pe-textarea {
          width:100%; border:1px solid var(--pm-border); border-radius:8px;
          padding:0.5rem 0.65rem; font-size:0.85rem; background:var(--pm-surface);
          color:var(--pm-text); font-family:inherit; box-sizing:border-box;
          outline:none; transition:border-color 0.15s; }
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
   * Public API — used by tests and external callers.
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
    this._entries = [saved, ...this._entries]
    this._render()
  }

  /**
   * Public API — used by tests and external callers.
   * @param {string} id
   */
  async deleteEntry(id) {
    this._entries = this._entries.filter(e => e.id !== id)
    this._render()
    await deletePlanEntrada(id)
  }
}
