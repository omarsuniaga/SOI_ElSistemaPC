/**
 * departamentosView.js — Gestión de correos y responsables de departamentos (portal ADM).
 * Permite registrar/editar, por departamento: correo institucional, responsable
 * (nombre + correo) y estado. Esos correos los usa Hermes para despachar mensajes
 * por departamento desde Telegram (edge function send-email + fn_email_departamento).
 *
 * Patrón: retorna { teardown() } (AbortController).
 */

import * as api from '../api/departamentosApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

let _abort = null

export async function renderDepartamentosView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`
  try {
    const departamentos = await api.getDepartamentos()
    renderContent(container, departamentos)
  } catch (err) {
    console.error('[Departamentos] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar departamentos</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }
  return { teardown: () => _abort?.abort() }
}

function renderContent(container, departamentos) {
  const sinCorreo = departamentos.filter((d) => !d.email).length

  container.innerHTML = `
    <div class="page-container" style="max-width:960px;margin:0 auto;padding:1.25rem">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(124,58,237,0.1);color:#7c3aed">
          <i class="bi bi-envelope-at fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Correos de Departamentos</h1>
          <p class="text-muted small mb-0">Correo institucional y responsable de cada departamento. Hermes los usa para despachar mensajes.</p>
        </div>
      </div>

      ${
        sinCorreo > 0
          ? `<div class="alert alert-warning small py-2"><i class="bi bi-exclamation-triangle me-1"></i>
              ${sinCorreo} departamento${sinCorreo === 1 ? '' : 's'} sin correo definido. Hermes no podrá enviarles hasta cargarlo.</div>`
          : `<div class="alert alert-success small py-2"><i class="bi bi-check-circle me-1"></i>
              Todos los departamentos tienen correo configurado.</div>`
      }

      <div class="row g-3">
        ${departamentos.map(tarjeta).join('')}
      </div>
    </div>
  `
  attach(container, departamentos)
}

function tarjeta(d) {
  return `
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100 dep-card" data-id="${d.id}">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary">${escapeHTML(d.codigo)}</span>
              <input type="text" class="form-control form-control-sm dep-nombre" style="max-width:200px"
                value="${escapeHTML(d.nombre || '')}">
            </div>
            <div class="form-check form-switch m-0" title="Activo">
              <input class="form-check-input dep-activo" type="checkbox" ${d.activo ? 'checked' : ''}>
            </div>
          </div>

          <label class="form-label small fw-semibold mb-1">Correo institucional</label>
          <input type="email" class="form-control form-control-sm mb-2 dep-email"
            placeholder="ej. finanzas@funeyca.org" value="${escapeHTML(d.email || '')}">

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Responsable</label>
              <input type="text" class="form-control form-control-sm dep-resp-nombre"
                placeholder="Nombre" value="${escapeHTML(d.responsable_nombre || '')}">
            </div>
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Correo responsable</label>
              <input type="email" class="form-control form-control-sm dep-resp-email"
                placeholder="opcional" value="${escapeHTML(d.responsable_email || '')}">
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-primary dep-save" data-id="${d.id}">
              <i class="bi bi-check-lg me-1"></i>Guardar
            </button>
            <button class="btn btn-sm btn-outline-secondary dep-test" data-id="${d.id}" data-codigo="${escapeHTML(d.codigo)}"
              ${d.email ? '' : 'disabled'} title="${d.email ? 'Enviar correo de prueba' : 'Cargá un correo primero'}">
              <i class="bi bi-send me-1"></i>Probar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

function attach(container, departamentos) {
  const signal = _abort.signal

  container.querySelectorAll('.dep-save').forEach((btn) =>
    btn.addEventListener('click', () => guardar(container, departamentos, btn), { signal }),
  )

  container.querySelectorAll('.dep-test').forEach((btn) =>
    btn.addEventListener('click', () => probar(container, btn), { signal }),
  )
}

async function guardar(container, departamentos, btn) {
  const card = btn.closest('.dep-card')
  const nombre = card.querySelector('.dep-nombre').value.trim()
  const email = card.querySelector('.dep-email').value.trim()
  const respNombre = card.querySelector('.dep-resp-nombre').value.trim()
  const respEmail = card.querySelector('.dep-resp-email').value.trim()
  const activo = card.querySelector('.dep-activo').checked

  if (!nombre) { AppToast.show('El nombre es obligatorio', 'error'); return }
  if (email && !EMAIL_RE.test(email)) { AppToast.show('El correo institucional no es válido', 'error'); return }
  if (respEmail && !EMAIL_RE.test(respEmail)) { AppToast.show('El correo del responsable no es válido', 'error'); return }

  const original = btn.innerHTML
  btn.disabled = true
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
  try {
    const actualizado = await api.actualizarDepartamento(btn.dataset.id, {
      nombre, email, activo,
      responsable_nombre: respNombre,
      responsable_email: respEmail,
    })
    const idx = departamentos.findIndex((x) => x.id === actualizado.id)
    if (idx >= 0) departamentos[idx] = actualizado
    AppToast.show(`${actualizado.codigo} actualizado`, 'success')
    renderContent(container, departamentos)
  } catch (err) {
    AppToast.show(`Error: ${err.message}`, 'error')
    btn.disabled = false
    btn.innerHTML = original
  }
}

async function probar(container, btn) {
  const card = btn.closest('.dep-card')
  const email = card.querySelector('.dep-email').value.trim()
  if (!email || !EMAIL_RE.test(email)) {
    AppToast.show('Cargá un correo válido antes de probar', 'error')
    return
  }
  const original = btn.innerHTML
  btn.disabled = true
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
  try {
    await api.enviarCorreoPrueba(email, btn.dataset.codigo)
    AppToast.show(`Correo de prueba enviado a ${email}`, 'success')
  } catch (err) {
    AppToast.show(`No se pudo enviar: ${err.message}`, 'error')
  } finally {
    btn.disabled = false
    btn.innerHTML = original
  }
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
