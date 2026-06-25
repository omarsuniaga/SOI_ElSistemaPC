/**
 * departamentosView.js — Gestión de correos de departamentos (portal ADM).
 * Permite registrar/editar el correo de cada departamento. Esos correos los usa
 * Hermes para despachar correos por departamento desde Telegram (vía la edge
 * function send-email + fn_email_departamento).
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
    <div class="page-container" style="max-width:920px;margin:0 auto;padding:1.25rem">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(124,58,237,0.1);color:#7c3aed">
          <i class="bi bi-envelope-at fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Correos de Departamentos</h1>
          <p class="text-muted small mb-0">Hermes usa estos correos para despachar mensajes por departamento</p>
        </div>
      </div>

      ${
        sinCorreo > 0
          ? `<div class="alert alert-warning small py-2"><i class="bi bi-exclamation-triangle me-1"></i>
              ${sinCorreo} departamento${sinCorreo === 1 ? '' : 's'} sin correo definido. Hermes no podrá enviarles hasta cargarlo.</div>`
          : `<div class="alert alert-success small py-2"><i class="bi bi-check-circle me-1"></i>
              Todos los departamentos tienen correo configurado.</div>`
      }

      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width:90px">Código</th>
                <th style="width:180px">Nombre</th>
                <th>Correo institucional</th>
                <th style="width:90px" class="text-center">Activo</th>
                <th style="width:110px"></th>
              </tr>
            </thead>
            <tbody>
              ${departamentos.map(fila).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
  attach(container, departamentos)
}

function fila(d) {
  return `
    <tr data-id="${d.id}">
      <td><span class="badge bg-secondary">${escapeHTML(d.codigo)}</span></td>
      <td><input type="text" class="form-control form-control-sm dep-nombre" value="${escapeHTML(d.nombre || '')}"></td>
      <td>
        <input type="email" class="form-control form-control-sm dep-email"
          placeholder="ej. finanzas@funeyca.org" value="${escapeHTML(d.email || '')}">
      </td>
      <td class="text-center">
        <div class="form-check form-switch d-inline-block">
          <input class="form-check-input dep-activo" type="checkbox" ${d.activo ? 'checked' : ''}>
        </div>
      </td>
      <td>
        <button class="btn btn-sm btn-primary dep-save" data-id="${d.id}">
          <i class="bi bi-check-lg me-1"></i>Guardar
        </button>
      </td>
    </tr>
  `
}

function attach(container, departamentos) {
  const signal = _abort.signal
  container.querySelectorAll('.dep-save').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const tr = btn.closest('tr')
      const nombre = tr.querySelector('.dep-nombre').value.trim()
      const email = tr.querySelector('.dep-email').value.trim()
      const activo = tr.querySelector('.dep-activo').checked

      if (email && !EMAIL_RE.test(email)) {
        AppToast.show('El correo no tiene un formato válido', 'error')
        return
      }
      if (!nombre) {
        AppToast.show('El nombre es obligatorio', 'error')
        return
      }

      const original = btn.innerHTML
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
      try {
        const actualizado = await api.actualizarDepartamento(btn.dataset.id, { nombre, email, activo })
        const idx = departamentos.findIndex((x) => x.id === actualizado.id)
        if (idx >= 0) departamentos[idx] = actualizado
        AppToast.show(`${actualizado.codigo} actualizado`, 'success')
        renderContent(container, departamentos)
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
        btn.disabled = false
        btn.innerHTML = original
      }
    }, { signal }),
  )
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
