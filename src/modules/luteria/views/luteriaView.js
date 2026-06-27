/**
 * luteriaView.js — Vista de Diagnósticos del Taller de Lutería.
 * Lista instrumentos en estado 'danado' o 'en_reparacion' y permite
 * cambiar su estado a: en_reparacion | disponible | fuera_de_uso.
 *
 * Ruta registrada: luteria-diagnosticos
 * Portal: Lutería (LUT)
 */

import * as instrumentosApi from '../../instrumentos/api/instrumentosApi.js'

const ESTADOS_ACCION = {
  en_reparacion: { label: 'En reparación', color: '#d97706', bg: '#fef3c7' },
  disponible: { label: 'Disponible', color: '#059669', bg: '#d1fae5' },
  fuera_de_uso: { label: 'Fuera de uso', color: '#6b7280', bg: '#f3f4f6' },
}

const ESTADOS_ORIGEN = ['danado', 'en_reparacion']

function estadoBadge(estado) {
  const map = {
    danado: { label: 'Dañado', color: '#dc2626', bg: '#fee2e2' },
    en_reparacion: { label: 'En reparación', color: '#d97706', bg: '#fef3c7' },
    disponible: { label: 'Disponible', color: '#059669', bg: '#d1fae5' },
    fuera_de_uso: { label: 'Fuera de uso', color: '#6b7280', bg: '#f3f4f6' },
    asignado: { label: 'Asignado', color: '#2563eb', bg: '#dbeafe' },
  }
  const cfg = map[estado] || { label: estado, color: '#374151', bg: '#f9fafb' }
  return `<span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:9999px;
    font-size:0.75rem;font-weight:600;background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>`
}

function renderCard(inst, onCambiarEstado) {
  const card = document.createElement('div')
  card.className = 'luteria-card'
  card.style.cssText = `background:#fff;border:1px solid #e2e8f0;border-radius:12px;
    padding:1rem 1.25rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.06)`

  card.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
          <span style="font-weight:700;font-size:0.9rem;color:#111">${inst.nombre}</span>
          ${estadoBadge(inst.estado)}
        </div>
        <div style="font-size:0.8125rem;color:#6b7280;margin-bottom:0.25rem">
          <span class="me-2"><i class="bi bi-tag me-1"></i>${inst.codigo}</span>
          ${inst.marca ? `<span class="me-2"><i class="bi bi-award me-1"></i>${inst.marca}</span>` : ''}
          ${inst.tipo ? `<span><i class="bi bi-music-note me-1"></i>${inst.tipo}</span>` : ''}
        </div>
        ${inst.notas ? `<div style="font-size:0.8125rem;color:#374151;margin-top:0.25rem;
          padding:0.375rem 0.625rem;background:#f8fafc;border-radius:6px;border-left:3px solid #cbd5e1">
          ${inst.notas}</div>` : ''}
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;flex-shrink:0" data-inst-id="${inst.id}">
        ${Object.entries(ESTADOS_ACCION)
          .filter(([estado]) => estado !== inst.estado)
          .map(([estado, cfg]) =>
            `<button class="btn-estado-action" data-id="${inst.id}" data-estado="${estado}"
              style="border:none;border-radius:8px;padding:0.3rem 0.75rem;font-size:0.8rem;
              font-weight:600;cursor:pointer;background:${cfg.bg};color:${cfg.color}">
              ${cfg.label}
            </button>`,
          ).join('')}
      </div>
    </div>
  `

  card.querySelectorAll('.btn-estado-action').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const nuevoEstado = btn.dataset.estado
      btn.disabled = true
      btn.textContent = 'Guardando...'
      try {
        await onCambiarEstado(inst.id, nuevoEstado)
      } catch (err) {
        btn.disabled = false
        btn.textContent = ESTADOS_ACCION[nuevoEstado]?.label || nuevoEstado
        console.error('[luteriaView] cambiarEstado error:', err)
      }
    })
  })

  return card
}

export async function renderLuteriaView(container) {
  const ac = new AbortController()

  container.innerHTML = `
    <div style="padding:1.5rem;max-width:900px;margin:0 auto">
      <div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <h5 style="margin:0;font-weight:700;color:#111">Taller de Lutería — Diagnósticos</h5>
          <p style="margin:0.25rem 0 0;font-size:0.875rem;color:#6b7280">
            Instrumentos dañados o en reparación
          </p>
        </div>
        <button id="btn-refresh-luteria" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>
      <div id="luteria-list">
        <div class="d-flex justify-content-center align-items-center" style="min-height:200px">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  `

  const listEl = container.querySelector('#luteria-list')

  async function load() {
    listEl.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:200px">
      <div class="spinner-border text-warning" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`

    try {
      // Fetch both damaged states in parallel
      const [danados, enReparacion] = await Promise.all([
        instrumentosApi.listarInstrumentos({ estado: 'danado' }),
        instrumentosApi.listarInstrumentos({ estado: 'en_reparacion' }),
      ])
      const todos = [...danados, ...enReparacion].sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      )

      if (todos.length === 0) {
        listEl.innerHTML = `
          <div style="text-align:center;padding:3rem 1rem;color:#6b7280">
            <i class="bi bi-check-circle" style="font-size:2.5rem;color:#059669;display:block;margin-bottom:0.75rem"></i>
            <p style="font-weight:600;margin:0">Sin instrumentos dañados o en reparación</p>
            <p style="margin:0.25rem 0 0;font-size:0.875rem">El taller está al día.</p>
          </div>`
        return
      }

      listEl.innerHTML = ''
      const frag = document.createDocumentFragment()

      todos.forEach((inst) => {
        const card = renderCard(inst, async (id, nuevoEstado) => {
          await instrumentosApi.cambiarEstadoInstrumento(id, nuevoEstado)
          await load()
        })
        frag.appendChild(card)
      })

      listEl.appendChild(frag)
    } catch (err) {
      listEl.innerHTML = `<div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar instrumentos: ${err.message}
      </div>`
    }
  }

  container.querySelector('#btn-refresh-luteria')?.addEventListener('click', load, { signal: ac.signal })

  await load()

  return {
    teardown() {
      ac.abort()
    },
  }
}
