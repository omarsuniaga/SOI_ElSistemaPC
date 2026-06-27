/**
 * instrumentosGestionView.js — Gestión completa de instrumentos.
 * Lista, crea, asigna y cambia estado vía instrumentosApi.
 * Usada en el portal Inventario (pestaña "Instrumentos").
 */

import * as instrumentosApi from '../api/instrumentosApi.js'

const ESTADOS = {
  disponible: { label: 'Disponible', color: '#059669', bg: '#d1fae5' },
  asignado: { label: 'Asignado', color: '#2563eb', bg: '#dbeafe' },
  danado: { label: 'Dañado', color: '#dc2626', bg: '#fee2e2' },
  en_reparacion: { label: 'En reparación', color: '#d97706', bg: '#fef3c7' },
  fuera_de_uso: { label: 'Fuera de uso', color: '#6b7280', bg: '#f3f4f6' },
}

function estadoBadge(estado) {
  const cfg = ESTADOS[estado] || { label: estado, color: '#374151', bg: '#f9fafb' }
  return `<span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:9999px;
    font-size:0.75rem;font-weight:600;background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>`
}

function renderFormCrear(onCrear) {
  const form = document.createElement('form')
  form.id = 'form-crear-instrumento'
  form.style.cssText = `background:#fff;border:1px solid #e2e8f0;border-radius:12px;
    padding:1.25rem;margin-bottom:1.5rem`
  form.innerHTML = `
    <h6 style="font-weight:700;margin:0 0 1rem;color:#111">Registrar nuevo instrumento</h6>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin-bottom:1rem">
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Código *</label>
        <input name="codigo" class="form-control form-control-sm" placeholder="VIO-001" required />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Nombre *</label>
        <input name="nombre" class="form-control form-control-sm" placeholder="Violín 4/4" required />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Tipo</label>
        <input name="tipo" class="form-control form-control-sm" placeholder="cuerda, viento..." />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Marca</label>
        <input name="marca" class="form-control form-control-sm" placeholder="Yamaha" />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Serie</label>
        <input name="serie" class="form-control form-control-sm" placeholder="SN-12345" />
      </div>
    </div>
    <div style="margin-bottom:1rem">
      <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Notas</label>
      <textarea name="notas" class="form-control form-control-sm" rows="2" placeholder="Observaciones opcionales..."></textarea>
    </div>
    <div id="crear-error" class="alert alert-danger d-none small py-2"></div>
    <button type="submit" class="btn btn-sm btn-primary">
      <i class="bi bi-plus-circle me-1"></i>Registrar instrumento
    </button>
  `

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = form.querySelector('[type=submit]')
    const errEl = form.querySelector('#crear-error')
    const data = Object.fromEntries(new FormData(form))

    btn.disabled = true
    btn.textContent = 'Guardando...'
    errEl.classList.add('d-none')

    try {
      await onCrear(data)
      form.reset()
    } catch (err) {
      errEl.textContent = `Error: ${err.message}`
      errEl.classList.remove('d-none')
    } finally {
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Registrar instrumento'
    }
  })

  return form
}

function renderRow(inst, onCambiarEstado, onAsignar) {
  const tr = document.createElement('tr')
  tr.innerHTML = `
    <td style="font-size:0.8125rem;font-weight:600">${inst.codigo}</td>
    <td style="font-size:0.8125rem">${inst.nombre}</td>
    <td style="font-size:0.8125rem">${inst.tipo || '—'}</td>
    <td style="font-size:0.8125rem">${inst.marca || '—'}</td>
    <td>${estadoBadge(inst.estado)}</td>
    <td style="font-size:0.8125rem">${inst.alumno_nombre || '—'}</td>
    <td>
      <div style="display:flex;gap:0.375rem;flex-wrap:wrap">
        <select class="form-select form-select-sm select-estado" style="width:auto;font-size:0.75rem" data-id="${inst.id}" data-current="${inst.estado}">
          ${Object.entries(ESTADOS)
            .map(([v, { label }]) => `<option value="${v}" ${v === inst.estado ? 'selected' : ''}>${label}</option>`)
            .join('')}
        </select>
        <button class="btn btn-sm btn-outline-secondary btn-asignar" data-id="${inst.id}" style="font-size:0.75rem">
          <i class="bi bi-person-check"></i>
        </button>
      </div>
    </td>
  `

  tr.querySelector('.select-estado').addEventListener('change', async (e) => {
    const nuevoEstado = e.target.value
    if (nuevoEstado === inst.estado) return
    e.target.disabled = true
    try {
      await onCambiarEstado(inst.id, nuevoEstado)
    } catch (err) {
      e.target.value = inst.estado
      alert(`Error: ${err.message}`)
    } finally {
      e.target.disabled = false
    }
  })

  tr.querySelector('.btn-asignar').addEventListener('click', () => {
    const alumnoNombre = window.prompt(`Nombre del alumno para asignar "${inst.nombre}":`)
    if (!alumnoNombre?.trim()) return
    const alumnoId = `alu-${Date.now()}`
    onAsignar(inst.id, alumnoId, alumnoNombre.trim())
  })

  return tr
}

export async function renderInstrumentosGestionView(container) {
  const ac = new AbortController()

  container.innerHTML = `
    <div style="padding:1.5rem;max-width:1100px;margin:0 auto">
      <div style="margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <h5 style="margin:0;font-weight:700;color:#111">Gestión de Instrumentos</h5>
          <p style="margin:0.25rem 0 0;font-size:0.875rem;color:#6b7280">Registro, asignación y cambio de estado</p>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <select id="filtro-estado" class="form-select form-select-sm" style="width:auto">
            <option value="">Todos los estados</option>
            ${Object.entries(ESTADOS).map(([v, { label }]) => `<option value="${v}">${label}</option>`).join('')}
          </select>
          <button id="btn-refresh-inst" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
      <div id="form-crear-container"></div>
      <div id="inst-table-container">
        <div class="d-flex justify-content-center align-items-center" style="min-height:200px">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  `

  const tableContainer = container.querySelector('#inst-table-container')
  const formContainer = container.querySelector('#form-crear-container')
  const filtroEstado = container.querySelector('#filtro-estado')

  let _instrumentos = []

  async function load() {
    const filtros = {}
    if (filtroEstado.value) filtros.estado = filtroEstado.value

    tableContainer.innerHTML = `<div class="d-flex justify-content-center align-items:center" style="min-height:150px">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`

    try {
      _instrumentos = await instrumentosApi.listarInstrumentos(filtros)
      renderTable()
    } catch (err) {
      tableContainer.innerHTML = `<div class="alert alert-danger">Error al cargar: ${err.message}</div>`
    }
  }

  function renderTable() {
    if (_instrumentos.length === 0) {
      tableContainer.innerHTML = `<div style="text-align:center;padding:2rem;color:#6b7280">
        <i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:0.5rem"></i>
        <p style="margin:0">Sin instrumentos registrados para este filtro.</p>
      </div>`
      return
    }

    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'overflow-x:auto'
    wrapper.innerHTML = `
      <table class="table table-sm table-hover" style="font-size:0.875rem;min-width:700px">
        <thead style="background:#f8fafc">
          <tr>
            <th>Código</th><th>Nombre</th><th>Tipo</th><th>Marca</th>
            <th>Estado</th><th>Alumno</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody id="inst-tbody"></tbody>
      </table>
    `

    const tbody = wrapper.querySelector('#inst-tbody')
    _instrumentos.forEach((inst) => {
      const row = renderRow(
        inst,
        async (id, nuevoEstado) => {
          await instrumentosApi.cambiarEstadoInstrumento(id, nuevoEstado)
          await load()
        },
        async (id, alumnoId, alumnoNombre) => {
          await instrumentosApi.asignarInstrumento(id, alumnoId, alumnoNombre)
          await load()
        },
      )
      tbody.appendChild(row)
    })

    tableContainer.innerHTML = ''
    tableContainer.appendChild(wrapper)
  }

  // Render the create form
  const form = renderFormCrear(async (payload) => {
    await instrumentosApi.crearInstrumento(payload)
    await load()
  })
  formContainer.appendChild(form)

  // Events
  filtroEstado.addEventListener('change', load, { signal: ac.signal })
  container.querySelector('#btn-refresh-inst').addEventListener('click', load, { signal: ac.signal })

  await load()

  return {
    teardown() {
      ac.abort()
    },
  }
}
