import {
  buscarPostulante,
  sincronizarPostulantes,
  backfillDesdePostulantes,
} from '../../../modules/alumnos/api/postulantesApi.js'

function fmtDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function badgeHtml(r) {
  if (r.estado === 'inscrito') {
    return '<span class="badge bg-success-subtle text-success-emphasis"><i class="bi bi-check-circle-fill me-1"></i>Inscrito</span>'
  }
  return '<span class="badge bg-warning-subtle text-warning-emphasis"><i class="bi bi-clock me-1"></i>Pendiente</span>'
}

export function mountPreloadSearch(container) {
  return new Promise((resolve) => {
    let filtro = 'pendiente'

    container.innerHTML = `
      <div class="preload-search card shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-2">
          <i class="bi bi-cloud-download text-primary fs-5"></i>
          <div class="flex-grow-1">
            <h5 class="mb-0">Buscar postulante</h5>
            <small class="text-muted">Busca por nombre o teléfono para precargar los datos del formulario de postulación</small>
          </div>
          <button id="preload-btn-sync" class="btn btn-outline-secondary btn-sm" title="Sincronizar postulantes desde Google">
            <i class="bi bi-arrow-repeat"></i>
          </button>
          <button id="preload-btn-backfill" class="btn btn-outline-secondary btn-sm" title="Llenar datos de alumnos desde postulantes">
            <i class="bi bi-database-fill-up"></i>
          </button>
        </div>
        <div class="card-body">
          <div id="preload-sync-panel" class="d-none mb-3">
            <div class="alert alert-info py-2 mb-0 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-cloud-arrow-up me-1"></i> Sincronizar postulantes desde Google</span>
              <button id="preload-btn-sync-confirm" class="btn btn-primary btn-sm">
                <i class="bi bi-check2-circle me-1"></i>Sincronizar ahora
              </button>
            </div>
            <div id="preload-sync-result" class="mt-2"></div>
          </div>

          <div id="preload-backfill-panel" class="d-none mb-3">
            <div class="alert alert-info py-2 mb-0">
              <div class="d-flex align-items-center justify-content-between">
                <span><i class="bi bi-database-fill-up me-1"></i> <strong>Backfill:</strong> llena campos vacíos de alumnos inscritos con datos de postulantes</span>
                <button id="preload-btn-backfill-run" class="btn btn-primary btn-sm">
                  <i class="bi bi-play-fill me-1"></i>Ejecutar backfill
                </button>
              </div>
              <div class="d-flex align-items-center gap-2 mt-2">
                <button id="preload-btn-backfill-preview" class="btn btn-outline-info btn-sm">
                  <i class="bi bi-eye me-1"></i>Previsualizar
                </button>
                <span class="small text-muted">Muestra qué registros se llenarían sin escribir nada</span>
              </div>
              <div id="preload-backfill-result" class="mt-2"></div>
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-sm-8">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input id="preload-query" type="text" class="form-control" placeholder="Nombre del alumno o número de teléfono..." autocomplete="off" />
                <button id="preload-btn-search" class="btn btn-primary" type="button">Buscar</button>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="preload-filtro" id="filtro-pendiente" value="pendiente" checked>
                <label class="btn btn-outline-secondary btn-sm" for="filtro-pendiente"><i class="bi bi-clock me-1"></i>Pendientes</label>
                <input type="radio" class="btn-check" name="preload-filtro" id="filtro-todos" value="todos">
                <label class="btn btn-outline-secondary btn-sm" for="filtro-todos"><i class="bi bi-list me-1"></i>Todos</label>
              </div>
            </div>
          </div>

          <div id="preload-results"></div>
        </div>
        <div class="card-footer d-flex justify-content-end">
          <button id="preload-btn-skip" class="btn btn-link text-muted btn-sm">
            <i class="bi bi-skip-forward me-1"></i>Continuar sin buscar
          </button>
        </div>
      </div>`

    const input = container.querySelector('#preload-query')
    const searchBtn = container.querySelector('#preload-btn-search')
    const skipBtn = container.querySelector('#preload-btn-skip')
    const resultsDiv = container.querySelector('#preload-results')

    function getFiltro() {
      const sel = container.querySelector('[name="preload-filtro"]:checked')
      return sel?.value ?? 'pendiente'
    }

    container.querySelectorAll('[name="preload-filtro"]').forEach((rb) => {
      rb.addEventListener('change', () => {
        filtro = getFiltro()
        const q = input.value.trim()
        if (q.length >= 2) doSearch(q)
      })
    })

    async function doSearch(q) {
      q = q ?? input.value.trim()
      if (q.length < 2) {
        resultsDiv.innerHTML = '<div class="text-muted small">Ingresa al menos 2 caracteres.</div>'
        return
      }

      resultsDiv.innerHTML = `
        <div class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span class="ms-2 text-muted small">Buscando...</span>
        </div>`

      try {
        let results = await buscarPostulante(q)

        if (filtro === 'pendiente') {
          results = results.filter((r) => r.estado !== 'inscrito')
        }

        if (!results.length) {
          resultsDiv.innerHTML = `
            <div class="alert alert-warning py-2 mb-0">
              <i class="bi bi-exclamation-circle me-1"></i>
              No se encontró ningún postulante con este nombre o teléfono.
            </div>`
          return
        }

        const items = results
          .map((r, i) => {
            const yaInscrito = r.estado === 'inscrito'
            const fechaPost = r.fecha_postulacion || r.created_at || r.sincronizado_en
            return `
          <div class="list-group-item list-group-item-action py-3 ${yaInscrito ? 'opacity-75' : ''}"
               data-idx="${i}" role="button" style="cursor:pointer">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <span class="fw-semibold">${r.nombre_completo || '(sin nombre)'}</span>
                  ${badgeHtml(r)}
                </div>

                <div class="small text-muted d-flex flex-wrap gap-3">
                  ${fechaPost ? `<span><i class="bi bi-calendar3 me-1"></i>${fmtDate(fechaPost)}</span>` : ''}
                  ${r.telefono_alumno ? `<span><i class="bi bi-telephone me-1"></i>${r.telefono_alumno}</span>` : ''}
                  ${r.correo ? `<span><i class="bi bi-envelope me-1"></i>${r.correo}</span>` : ''}
                  ${r.madre_tlf_whatsapp ? `<span><i class="bi bi-person me-1"></i>Madre: ${r.madre_tlf_whatsapp}</span>` : ''}
                </div>
              </div>
              <button class="btn btn-sm ${yaInscrito ? 'btn-outline-secondary' : 'btn-outline-primary'} ms-2 flex-shrink-0" data-pick="${i}" ${yaInscrito ? 'disabled' : ''}>
                <i class="bi bi-check2-circle me-1"></i>Usar datos
              </button>
            </div>
          </div>`
          })
          .join('')

        resultsDiv.innerHTML = `
          <div class="list-group">${items}</div>
          <p class="text-muted small mt-2 mb-0">
            <i class="bi bi-info-circle me-1"></i>
            Se precargarán los campos disponibles. Podés editarlos antes de guardar.
          </p>`

        function pickPostulante(idx) {
          const p = results[idx]
          if (p.estado === 'inscrito') return
          resolve({ ...p, _postulante_id: p.id })
        }

        resultsDiv.querySelectorAll('[data-pick]:not([disabled])').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            pickPostulante(parseInt(btn.getAttribute('data-pick'), 10))
          })
        })

        resultsDiv.querySelectorAll('[data-idx]').forEach((row) => {
          row.addEventListener('click', () => {
            const idx = parseInt(row.getAttribute('data-idx'), 10)
            const p = results[idx]
            if (p.estado !== 'inscrito') pickPostulante(idx)
          })
        })
      } catch (err) {
        console.error('Error buscando postulante:', err)
        resultsDiv.innerHTML = `
          <div class="alert alert-danger py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i>
            Error al conectar. Continuá sin búsqueda.
          </div>`
      }
    }

    searchBtn.addEventListener('click', () => doSearch())
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch()
    })
    skipBtn.addEventListener('click', () => resolve(null))

    const syncBtn = container.querySelector('#preload-btn-sync')
    const syncPanel = container.querySelector('#preload-sync-panel')
    const syncConfirm = container.querySelector('#preload-btn-sync-confirm')
    const syncResult = container.querySelector('#preload-sync-result')

    syncBtn.addEventListener('click', () => {
      syncPanel.classList.toggle('d-none')
      syncResult.innerHTML = ''
    })

    // ── Backfill ──────────────────────────────────────────────────
    const backfillBtn = container.querySelector('#preload-btn-backfill')
    const backfillPanel = container.querySelector('#preload-backfill-panel')
    const backfillRun = container.querySelector('#preload-btn-backfill-run')
    const backfillPreview = container.querySelector('#preload-btn-backfill-preview')
    const backfillResult = container.querySelector('#preload-backfill-result')

    backfillBtn.addEventListener('click', () => {
      backfillPanel.classList.toggle('d-none')
      backfillResult.innerHTML = ''
    })

    async function runBackfill(dryRun) {
      backfillRun.disabled = true
      backfillPreview.disabled = true
      const label = dryRun ? 'Previsualizando' : 'Ejecutando'
      backfillResult.innerHTML = `
        <div class="text-center py-2">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span class="ms-2 small">${label}...</span>
        </div>`

      try {
        const result = await backfillDesdePostulantes(dryRun)

        const total = result.data.length
        const withFields = result.data.filter((r) => r.campos_llenados > 0).length
        const totalFields = result.data.reduce((s, r) => s + r.campos_llenados, 0)

        if (dryRun) {
          backfillResult.innerHTML = `
            <div class="alert alert-info py-2 mb-0 small">
              <i class="bi bi-eye me-1"></i>
              <strong>Previsualización:</strong> ${total} alumnos coinciden con postulantes.
              ${withFields} tendrían campos por llenar (${totalFields} campos en total).
              ${total > 0 ? '<br><button id="preload-btn-backfill-confirm" class="btn btn-primary btn-sm mt-2"><i class="bi bi-play-fill me-1"></i>Confirmar y ejecutar</button>' : ''}
            </div>
            ${renderBackfillTable(result.data)}`

          const confirmBtn = backfillResult.querySelector('#preload-btn-backfill-confirm')
          if (confirmBtn) {
            confirmBtn.addEventListener('click', () => runBackfill(false))
          }
        } else {
          const updated = result.data.filter((r) => r.accion === 'updated').length
          backfillResult.innerHTML = `
            <div class="alert alert-success py-2 mb-0 small">
              <i class="bi bi-check-circle me-1"></i>
              <strong>Backfill completado:</strong> ${updated} alumnos actualizados
              (${totalFields} campos llenados de ${total} coincidencias).
            </div>
            ${renderBackfillTable(result.data)}`

          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: {
                message: `Backfill: ${updated} alumnos actualizados, ${totalFields} campos llenados`,
                type: 'success',
              },
            }),
          )
        }
      } catch (err) {
        backfillResult.innerHTML = `
          <div class="alert alert-danger py-2 mb-0 small">
            <i class="bi bi-exclamation-triangle me-1"></i>
            ${err.message || 'Error al ejecutar backfill'}
          </div>`
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              message: 'Error en backfill: ' + (err.message || 'desconocido'),
              type: 'danger',
            },
          }),
        )
      } finally {
        backfillRun.disabled = false
        backfillPreview.disabled = false
      }
    }

    function renderBackfillTable(data) {
      if (!data.length) return ''
      const rows = data
        .map(
          (r) => `
        <tr>
          <td class="text-truncate" title="${escHtml(r.alumno_nombre)}">${escHtml(r.alumno_nombre)}</td>
          <td class="text-truncate" title="${escHtml(r.postulante_nombre)}">${escHtml(r.postulante_nombre)}</td>
          <td><span class="badge bg-${r.match_tipo === 'email' ? 'primary' : 'secondary'}">${r.match_tipo}</span></td>
          <td class="text-center">${r.campos_llenados}</td>
          <td>${r.accion === 'preview' ? '<span class="text-info">Previo</span>' : '<span class="text-success">Actualizado</span>'}</td>
        </tr>`,
        )
        .join('')
      return `
        <div class="table-responsive mt-2" style="max-height:250px;overflow-y:auto">
          <table class="table table-sm table-striped mb-0 small">
            <thead class="table-light"><tr>
              <th>Alumno</th><th>Postulante</th><th>Match</th><th class="text-center">Campos</th><th>Acción</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`
    }

    function escHtml(str) {
      if (!str) return '—'
      const d = document.createElement('div')
      d.textContent = str
      return d.innerHTML
    }

    backfillRun.addEventListener('click', () => runBackfill(false))
    backfillPreview.addEventListener('click', () => runBackfill(true))

    // ── Sync ──────────────────────────────────────────────────────
    syncConfirm.addEventListener('click', async () => {
      syncConfirm.disabled = true
      syncConfirm.innerHTML =
        '<span class="spinner-border spinner-border-sm me-1"></span>Sincronizando...'

      try {
        const result = await sincronizarPostulantes()
        syncResult.innerHTML = `
          <div class="alert alert-success py-2 mb-0">
            <i class="bi bi-check-circle me-1"></i>
            ${result.upserted} registros sincronizados (${result.total_rows} total). 0 errores.
          </div>`
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              message: `Postulantes sincronizados: ${result.upserted} registros`,
              type: 'success',
            },
          }),
        )
      } catch (err) {
        const msg =
          err.status === 401
            ? 'No tenés permisos de administrador para sincronizar.'
            : err.message || 'Error al sincronizar'

        syncResult.innerHTML = `
          <div class="alert alert-danger py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i>${msg}
          </div>`
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: msg, type: 'danger' },
          }),
        )
      } finally {
        syncConfirm.disabled = false
        syncConfirm.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Sincronizar ahora'
      }
    })
  })
}
