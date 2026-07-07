/**
 * luteriaView.js — Vista de Diagnósticos del Taller de Lutería.
 *
 * Loop 18 Sesión 7: refactor para leer de inventario_activos
 * (fuente de verdad) en vez de la tabla instrumentos.
 *
 * Filtra por estado_uso IN ('en_mantenimiento', 'en_reparacion').
 * Mapeo: estado_uso del inventario → estado legacy del wizard LUT.
 *
 * Ruta registrada: luteria-diagnosticos
 * Portal: Lutería (LUT)
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { updateActivoEstado } from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { openLuteriaOrdenWizard } from '../components/luteriaOrdenWizard.js'

// Mapeo de estado_uso (inventario) → estado visible en la card.
const ESTADO_USO_A_LABEL = {
  disponible:       { label: 'Disponible',      color: '#059669', bg: '#d1fae5' },
  en_mantenimiento: { label: 'En mantenimiento', color: '#d97706', bg: '#fef3c7' },
  en_reparacion:   { label: 'En reparación',   color: '#d97706', bg: '#fef3c7' },
  prestado:         { label: 'Asignado',       color: '#2563eb', bg: '#dbeafe' },
  de_baja:          { label: 'Fuera de uso',    color: '#6b7280', bg: '#f3f4f6' },
}

// Mapeo inverso: estado visible (botón) → estado_uso (DB).
const ESTADO_LABEL_A_USO = {
  'En mantenimiento': 'en_mantenimiento',
  'En reparación':   'en_reparacion',
  'Disponible':      'disponible',
  'Fuera de uso':    'de_baja',
}

function estadoBadge(estadoUso) {
  const cfg = ESTADO_USO_A_LABEL[estadoUso] || { label: estadoUso, color: '#374151', bg: '#f9fafb' }
  return `<span class="lut-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>`
}

function renderCard(activo, onCambiarEstado, onCrearOrden) {
  const card = document.createElement('div')
  card.className = 'lut-card'

  card.innerHTML = `
    <div class="lut-card-row" style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <div style="flex:1;min-width:0">
        <div class="lut-card-meta" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
          <span class="lut-card-title">${activo.modelo || activo.tipo_instrumento || 'Sin nombre'}</span>
          ${estadoBadge(activo.estado_uso)}
        </div>
        <div class="lut-card-meta">
          <span class="me-2"><i class="bi bi-tag me-1"></i>${activo.codigo_inventario}</span>
          ${activo.marca ? `<span class="me-2"><i class="bi bi-award me-1"></i>${activo.marca}</span>` : ''}
          ${activo.tipo_instrumento ? `<span><i class="bi bi-music-note me-1"></i>${activo.tipo_instrumento}</span>` : ''}
        </div>
        ${activo.numero_serie ? `<div class="lut-card-meta"><i class="bi bi-upc me-1"></i>Serie: ${activo.numero_serie}</div>` : ''}
        ${activo.notas ? `<div class="lut-card-notes">${activo.notas}</div>` : ''}
        ${activo.foto_url ? `<div style="margin-top:0.5rem"><img src="${activo.foto_url}" style="max-width:120px;max-height:120px;border-radius:6px"></div>` : ''}
      </div>
      <div class="lut-card-actions" data-activo-id="${activo.id}">
        ${Object.entries(ESTADO_USO_A_LABEL)
          .filter(([uso]) => uso !== activo.estado_uso && uso !== 'prestado')
          .map(([uso, cfg]) =>
            `<button class="lut-btn" data-id="${activo.id}" data-estado="${uso}"
              style="background:${cfg.bg};color:${cfg.color}">
              ${cfg.label}
            </button>`,
          ).join('')}
        <button class="lut-btn lut-btn-primary" data-id="${activo.id}"
          data-crear-orden="1">
          <i class="bi bi-clipboard-plus me-1"></i>Crear orden
        </button>
      </div>
    </div>
  `

  card.querySelectorAll('.lut-btn:not([data-crear-orden])').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const nuevoUso = btn.dataset.estado
      btn.disabled = true
      btn.textContent = 'Guardando...'
      try {
        await onCambiarEstado(activo.id, nuevoUso)
      } catch (err) {
        btn.disabled = false
        const cfg = ESTADO_USO_A_LABEL[nuevoUso]
        btn.textContent = cfg?.label || nuevoUso
        console.error('[luteriaView] cambiarEstado error:', err)
      }
    })
  })

  card.querySelector('[data-crear-orden]')?.addEventListener('click', async () => {
    await onCrearOrden(activo.id, activo.numero_serie)
  })

  return card
}

export async function renderLuteriaView(container) {
  const ac = new AbortController()

  container.innerHTML = `
    <div class="lut-container">
      <div class="lut-header">
        <div>
          <h5 class="lut-section-title">Taller de Lutería — Diagnósticos</h5>
          <p class="lut-section-subtitle">
            Instrumentos en mantenimiento o reparación
          </p>
        </div>
        <div class="lut-header-actions">
          <button id="btn-nueva-orden" class="btn btn-warning btn-sm" style="font-weight:600">
            <i class="bi bi-plus-circle me-1"></i>Nueva orden
          </button>
          <button id="btn-refresh-luteria" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>
        </div>
      </div>
      <div id="luteria-list">
        <div class="lut-loader">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  `

  const listEl = container.querySelector('#luteria-list')

  async function load() {
    listEl.innerHTML = `<div class="lut-loader">
      <div class="spinner-border text-warning" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`

    try {
      // Lee directamente de inventario_activos filtrando por estado_uso.
      // Fuente de verdad desde Loop 18.
      const { data, error } = await supabase
        .from('inventario_activos')
        .select('id, codigo_inventario, tipo_instrumento, marca, modelo, numero_serie, estado_uso, estado_conservacion, notas, foto_url, activo')
        .in('estado_uso', ['en_mantenimiento', 'en_reparacion'])
        .eq('activo', true)
        .order('modelo', { ascending: true })

      if (error) throw error
      const todos = data || []

      if (todos.length === 0) {
        listEl.innerHTML = `
          <div class="lut-empty">
            <i class="bi bi-check-circle lut-empty-success" style="font-size:2.5rem;display:block;margin-bottom:0.75rem"></i>
            <p style="font-weight:600;margin:0">Sin instrumentos en mantenimiento</p>
            <p style="margin:0.25rem 0 0;font-size:0.875rem">El taller está al día.</p>
          </div>`
        return
      }

      listEl.innerHTML = ''
      const frag = document.createDocumentFragment()

      todos.forEach((activo) => {
        const card = renderCard(
          activo,
          async (id, nuevoUso) => {
            await updateActivoEstado(id, { estado_uso: nuevoUso })
            await load()
          },
          async (activoId, numeroSerie) => {
            await openLuteriaOrdenWizard({
              instrumentoId: numeroSerie,
              onSuccess: () => load(),
            })
          },
        )
        frag.appendChild(card)
      })

      listEl.appendChild(frag)
    } catch (err) {
      listEl.innerHTML = `<div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar instrumentos: ${err.message}
      </div>`
    }
  }

  container.querySelector('#btn-nueva-orden')?.addEventListener('click', async () => {
    await openLuteriaOrdenWizard({ onSuccess: () => load() })
  }, { signal: ac.signal })

  container.querySelector('#btn-refresh-luteria')?.addEventListener('click', load, { signal: ac.signal })

  await load()

  return {
    teardown() {
      ac.abort()
    },
  }
}