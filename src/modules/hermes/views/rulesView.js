/**
 * rulesView.js — Gestión de Reglas Reactivas Hermes (HERMES Rules Management UI)
 *
 * Interfaz para que los directores (DIR) visualicen y togleen las reglas reactivas
 * (R1-R5: ausencia acumulada, tarea vencida, período cerrado, etc.).
 *
 * RLS automático: solo ver/editar reglas del departamento del usuario (o todas si DIR).
 *
 * @param {HTMLElement} container
 * @param {object} [opciones]
 * @param {object} [opciones.supabase] — instancia de Supabase (si no, se importa)
 */

import '../styles/rules.css'
import { supabase } from '../../../lib/supabaseClient.js'
import { getRules, updateRule } from '../api/tareasApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const RULE_LABELS = {
  R1: { nombre: 'R1 - Ausencia Acumulada', icono: 'exclamation-circle', color: '#EF4444' },
  R2: { nombre: 'R2 - Tarea Vencida', icono: 'calendar-x', color: '#F59E0B' },
  R3: { nombre: 'R3 - Período Cerrado', icono: 'lock', color: '#6B7280' },
  R4: { nombre: 'R4 - Sesión sin Asistencia', icono: 'people', color: '#3B82F6' },
  R5: { nombre: 'R5 - Justificación Rechazada', icono: 'x-circle', color: '#8B5CF6' },
}

const DEPARTAMENTOS = {
  DIR: 'Dirección',
  ACM: 'Académico',
  ADM: 'Administración',
  FIN: 'Finanzas',
  LOG: 'Logística',
  COM: 'Comunicaciones',
  TECNICO: 'Técnico',
  LUT: 'Lutería',
}

const state = {
  rules: [],
  cargando: false,
  guardando: {},
}

let _abortController = null

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadRules() {
  state.cargando = true
  try {
    // RLS automático filtra por departamento del usuario
    const rules = await getRules()
    state.rules = rules.sort((a, b) => {
      // Ordenar por rule_type (R1, R2, etc.) y luego por departamento
      return a.rule_type.localeCompare(b.rule_type) || a.departamento.localeCompare(b.departamento)
    })
  } catch (err) {
    console.error('[Rules] Error loading rules:', err)
    AppToast.error(`Error cargando reglas: ${err.message}`)
  } finally {
    state.cargando = false
  }
}

async function toggleRuleEnabled(ruleId, currentEnabled, container) {
  const newEnabled = !currentEnabled
  state.guardando[ruleId] = true
  renderRulesTable(container)

  try {
    await updateRule(ruleId, { enabled: newEnabled })
    const rule = state.rules.find(r => r.id === ruleId)
    if (rule) rule.enabled = newEnabled
    AppToast.success(`Regla ${newEnabled ? 'habilitada' : 'deshabilitada'} exitosamente`)
    renderRulesTable(container)
  } catch (err) {
    console.error('[Rules] Error toggling rule:', err)
    AppToast.error(`Error actualizando regla: ${err.message}`)
    renderRulesTable(container)
  } finally {
    delete state.guardando[ruleId]
  }
}

async function updateRuleDescription(ruleId, newDescription, container) {
  state.guardando[ruleId] = true
  renderRulesTable(container)

  try {
    await updateRule(ruleId, { descripcion: newDescription })
    const rule = state.rules.find(r => r.id === ruleId)
    if (rule) rule.descripcion = newDescription
    AppToast.success('Descripción actualizada exitosamente')
    renderRulesTable(container)
  } catch (err) {
    console.error('[Rules] Error updating description:', err)
    AppToast.error(`Error actualizando descripción: ${err.message}`)
    renderRulesTable(container)
  } finally {
    delete state.guardando[ruleId]
  }
}

function renderRulesTable(container) {
  const table = container.querySelector('#rules-table')
  if (!table) return

  if (state.rules.length === 0) {
    table.innerHTML = `
      <div class="alert alert-info m-3">
        <i class="bi bi-info-circle me-2"></i>
        No hay reglas disponibles para gestionar.
      </div>
    `
    return
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr>
            <th style="width: 15%;">Regla</th>
            <th style="width: 15%;">Departamento</th>
            <th style="width: 25%;">Nombre</th>
            <th style="width: 25%;">Descripción</th>
            <th style="width: 10%;">Habilitada</th>
            <th style="width: 10%;">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `

  for (const rule of state.rules) {
    const label = RULE_LABELS[rule.rule_type] || { nombre: rule.rule_type, icono: 'gear', color: '#9CA3AF' }
    const depto = DEPARTAMENTOS[rule.departamento] || rule.departamento
    const isSaving = state.guardando[rule.id]

    html += `
      <tr class="rules-row" data-rule-id="${escapeHtml(rule.id)}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-${label.icono}" style="color: ${label.color}; font-size: 1.1rem;"></i>
            <small class="text-muted" style="font-weight: 600;">${escapeHtml(label.nombre)}</small>
          </div>
        </td>
        <td>
          <small class="text-muted">${escapeHtml(depto)}</small>
        </td>
        <td>
          <input type="text" class="form-control form-control-sm rule-nombre"
                 value="${escapeHtml(rule.nombre || '')}"
                 disabled
                 placeholder="(sin nombre)" />
        </td>
        <td>
          <div class="rule-descripcion-cell">
            <textarea class="form-control form-control-sm rule-descripcion"
                      placeholder="Ingrese descripción..."
                      style="min-height: 2.5rem; resize: vertical;"
                      ${isSaving ? 'disabled' : ''}>${escapeHtml(rule.descripcion || '')}</textarea>
            <small class="text-muted d-block mt-1">Actualizado: ${formatDate(rule.updated_at)}</small>
          </div>
        </td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input rule-enabled-toggle" type="checkbox"
                   ${rule.enabled ? 'checked' : ''}
                   ${isSaving ? 'disabled' : ''}
                   data-rule-id="${escapeHtml(rule.id)}" />
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary rule-save-btn"
                  data-rule-id="${escapeHtml(rule.id)}"
                  ${isSaving ? 'disabled' : ''}>
            <i class="bi bi-check-circle"></i>
            <span class="d-none d-md-inline ms-1">Guardar</span>
          </button>
        </td>
      </tr>
    `
  }

  html += `
        </tbody>
      </table>
    </div>
  `

  table.innerHTML = html

  // Attach event handlers
  attachTableEvents(container)
}

function attachTableEvents(container) {
  const table = container.querySelector('#rules-table')
  if (!table) return

  // Toggle enabled checkbox
  table.querySelectorAll('.rule-enabled-toggle').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const ruleId = e.target.dataset.ruleId
      const currentEnabled = state.rules.find(r => r.id === ruleId)?.enabled
      await toggleRuleEnabled(ruleId, currentEnabled, container)
    })
  })

  // Save description button
  table.querySelectorAll('.rule-save-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const ruleId = btn.dataset.ruleId
      const row = table.querySelector(`[data-rule-id="${ruleId}"]`)
      const textarea = row?.querySelector('.rule-descripcion')
      if (textarea) {
        await updateRuleDescription(ruleId, textarea.value, container)
      }
    })
  })

  // Enter key to save description
  table.querySelectorAll('.rule-descripcion').forEach(textarea => {
    textarea.addEventListener('keydown', async (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        const row = textarea.closest('.rules-row')
        const ruleId = row.dataset.ruleId
        await updateRuleDescription(ruleId, textarea.value, container)
      }
    })
  })
}

function _renderUI(container) {
  container.innerHTML = `
    <div class="rules-container">
      <!-- Header -->
      <div class="rules-header card mb-4">
        <div class="card-body">
          <h2 class="card-title mb-0">
            <i class="bi bi-sliders me-2" style="color: #667eea;"></i>
            Gestión de Reglas Reactivas
          </h2>
          <small class="text-muted">Habilita o deshabilita las reglas HERMES por departamento sin redeploying</small>
        </div>
      </div>

      <!-- Loading State -->
      <div id="rules-loading" class="text-center text-muted py-5" style="display: none;">
        <i class="bi bi-hourglass-split me-2"></i>
        Cargando reglas...
      </div>

      <!-- Rules Table -->
      <div id="rules-table" class="rules-table card">
      </div>
    </div>
  `

  const loading = container.querySelector('#rules-loading')
  if (loading) {
    loading.style.display = state.cargando ? 'block' : 'none'
  }
}

export async function renderRulesView(container) {
  _abortController = new AbortController()

  _renderUI(container)
  state.cargando = true

  // Initial load
  await loadRules()
  renderRulesTable(container)

  return {
    teardown: () => {
      _abortController.abort()
      state.rules = []
    },
  }
}
