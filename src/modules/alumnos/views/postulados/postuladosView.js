import {
  listarPostulantesPorMes,
  listarPostulantesPorRango,
  sincronizarPostulantes,
  eliminarPostulante,
} from '../../api/postulantesApi.js'
import { ESTADO_LABELS, ESTADO_COLOR } from '../../domain/postuladoStateMachine.js'
import { descargarPdfPostulados } from '../../domain/generarPdfPostulados.js'
import { router } from '../../../../core/router/router.js'

/**
 * Helper: primer día del mes como string YYYY-MM-DD
 */
function primerDiaMes() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * Helper: último día del mes como string YYYY-MM-DD
 */
function ultimoDiaMes() {
  const now = new Date()
  const ultimo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return `${ultimo.getFullYear()}-${String(ultimo.getMonth() + 1).padStart(2, '0')}-${String(ultimo.getDate()).padStart(2, '0')}`
}

// Estado interno de la vista con paginación
const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-12
  postulantes: [],
  filtroEstado: 'todos',
  cargando: false,
  page: 1,
  limit: 50,
  pdfDesde: primerDiaMes(),
  pdfHasta: ultimoDiaMes(),
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

/**
 * Determina el mejor nombre disponible para mostrar un postulante.
 * El campo nombre_completo a veces contiene valores incorrectos del Google Form
 * (respuestas de otras preguntas concatenadas). Esta función detecta esos casos
 * y cae al mejor fallback disponible.
 */
// Palabras que indican que el campo contiene algo que NO es un nombre de persona
const PALABRAS_NO_NOMBRE =
  /\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|extracu|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i

function esNombrePersona(texto) {
  if (!texto || texto.length === 0) return false
  const t = texto.trim()
  // Demasiado largo para ser un nombre
  if (t.length > 70) return false
  // Contiene comas (múltiples valores CSV pegados)
  if (t.includes(',')) return false
  // Más de 5 palabras → probablemente una frase o dirección
  if (t.split(/\s+/).length > 5) return false
  // Contiene palabras que claramente no son de un nombre
  if (PALABRAS_NO_NOMBRE.test(t)) return false
  // Debe tener al menos una letra mayúscula (nombres propios)
  if (!/[A-ZÁÉÍÓÚÑ]/.test(t)) return false
  // Debe tener al menos 2 palabras O ser al menos 4 chars (nombres cortos como "Ana")
  if (t.length < 4) return false
  return true
}

function resolverNombre(p) {
  // Candidatos en orden de confianza
  const candidatos = [p.nombre_completo, p.madre_nombre, p.padre_nombre, p.representante_nombre]
  const valido = candidatos.map((v) => (v ?? '').trim()).find((v) => esNombrePersona(v))

  return valido ?? 'Sin nombre registrado'
}

function resolverIniciales(nombre) {
  return (
    nombre
      .split(' ')
      .filter((w) => w.length > 0)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || '?'
  )
}

/**
 * Recolecta todos los números de WhatsApp disponibles de un postulante,
 * en orden de preferencia, con su etiqueta de origen.
 * @returns {{ label: string, numero: string }[]}
 */
function resolverTelefonos(p) {
  return [
    { persona: p.madre_nombre, numero: p.madre_tlf_whatsapp, rol: 'Madre' },
    { persona: p.padre_nombre, numero: p.padre_tlf_whatsapp, rol: 'Padre' },
    {
      persona: p.representante_nombre,
      numero: p.representante_tlf || p.telefono_representante,
      rol: 'Representante',
    },
    { persona: null, numero: p.telefono_alumno, rol: 'Alumno' },
  ]
    .filter(({ numero }) => {
      const n = (numero ?? '').trim()
      return n.length >= 7 && !/^(sin definir|no tiene|n\/a)$/i.test(n)
    })
    .map(({ persona, numero, rol }) => ({
      rol,
      nombre: esNombrePersona(persona ?? '') ? persona.trim() : null,
      numero: numero.trim(),
    }))
}

/**
 * Devuelve el primer número disponible, o null si no hay ninguno.
 */
function resolverTelefonoPrincipal(p) {
  return resolverTelefonos(p)[0]?.numero ?? null
}

function formatearNumero(n) {
  const d = n.replace(/\D/g, '')
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  return n
}

export async function renderPostuladosView(container) {
  state.filtroEstado = 'todos'
  state.page = 1 // Reset de página al recargar
  await cargarDatos(container)
}

async function cargarDatos(container) {
  try {
    state.cargando = true
    renderSkeleton(container)

    const todos = await listarPostulantesPorMes(state.year, state.month)
    // Solo postulantes con al menos un número de WhatsApp contactable
    state.postulantes = todos.filter((p) => resolverTelefonoPrincipal(p) !== null)
    state.cargando = false

    renderContent(container)
  } catch (error) {
    state.cargando = false
    renderError(container, error.message)
  }
}

function renderSkeleton(container) {
  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Módulo de Postulados</h1>
          <p class="text-secondary mb-0">Gestión de admisiones y pipeline de postulaciones</p>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted mt-2">Cargando postulados...</p>
        </div>
      </div>
    </div>
  `
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="container py-5">
      <div class="alert alert-danger shadow-sm border-0 d-flex flex-column align-items-center p-4 rounded-3 text-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3"></i>
        <h4 class="alert-heading fw-bold">Hubo un problema al cargar los datos</h4>
        <p class="mb-4">${message}</p>
        <button class="btn btn-primary" id="btn-error-retry">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>
  `

  document
    .getElementById('btn-error-retry')
    ?.addEventListener('click', () => renderPostuladosView(container))
}

function renderPipelineGraphic(counts, total) {
  if (total === 0) return ''

  const steps = [
    { key: 'postulado', label: 'Postulados' },
    { key: 'contactado', label: 'Contactados' },
    { key: 'cita_agendada', label: 'Con Cita' },
    { key: 'documentos_ok', label: 'Docs OK' },
    { key: 'inscrito', label: 'Inscritos' },
  ]

  const textSummary = steps
    .map((step) => {
      const val = counts[step.key] || 0
      return val > 0
        ? `<span class="text-body-secondary fw-medium">${val}</span> <span class="text-muted">${step.label}</span>`
        : null
    })
    .filter(Boolean)
    .join('<span class="text-muted mx-2">/</span>')

  return `
    <div class="mb-4 mt-2 px-1 small tracking-wide">
      ${textSummary}
    </div>
  `
}

function renderContent(container) {
  let list = getFilteredPostulantes()

  list.sort((a, b) => {
    const dateA = new Date(a.fecha_postulacion || a.created_at)
    const dateB = new Date(b.fecha_postulacion || b.created_at)
    return dateB - dateA
  })

  const totalRecords = list.length
  const totalPages = Math.ceil(totalRecords / state.limit) || 1

  if (state.page > totalPages) state.page = totalPages
  if (state.page < 1) state.page = 1

  const startIndex = (state.page - 1) * state.limit
  const endIndex = Math.min(startIndex + state.limit, totalRecords)
  const paginatedList = list.slice(startIndex, endIndex)

  const counts = getCountsByStatus()

  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4 max-w-7xl mx-auto">
      
      <!-- MINIMALIST HEADER -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-1 gap-3">
        <div>
          <h1 class="h2 fw-bold text-body tracking-tight mb-0">Postulados</h1>
        </div>
        
        <div class="d-flex align-items-center gap-4">
          <div class="d-flex align-items-center">
            <button class="btn btn-link text-body-secondary p-1 text-decoration-none" id="btn-month-prev">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="fw-semibold text-body mx-3 fs-6">
              ${MESES[state.month - 1]} ${state.year}
            </span>
            <button class="btn btn-link text-body-secondary p-1 text-decoration-none" id="btn-month-next">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          
          <button class="btn btn-link text-decoration-none text-primary fw-medium p-0" id="btn-sync">
            <span class="spinner-border spinner-border-sm d-none me-1" id="sync-spinner"></span>
            <i class="bi bi-arrow-repeat me-1" id="sync-icon"></i> Sincronizar
          </button>
        </div>
      </div>

      <!-- DATE RANGE + PDF DOWNLOAD -->
      <div class="d-flex flex-wrap align-items-center gap-3 mb-2">
        <div class="d-flex align-items-center gap-2">
          <label for="pdf-desde" class="form-label small text-body-secondary mb-0">Desde</label>
          <input type="date" class="form-control form-control-sm" id="pdf-desde" value="${state.pdfDesde}">
        </div>
        <div class="d-flex align-items-center gap-2">
          <label for="pdf-hasta" class="form-label small text-body-secondary mb-0">Hasta</label>
          <input type="date" class="form-control form-control-sm" id="pdf-hasta" value="${state.pdfHasta}">
        </div>
        <button class="btn btn-outline-primary btn-sm" id="btn-descargar-pdf">
          <span class="spinner-border spinner-border-sm d-none me-1" id="pdf-spinner"></span>
          <i class="bi bi-file-earmark-pdf me-1" id="pdf-icon"></i> Descargar PDF
        </button>
      </div>

      <!-- PIPELINE SUMMARY -->
      ${renderPipelineGraphic(counts, state.postulantes.length)}

      <!-- MINIMALIST TABS -->
      <div class="d-flex gap-4 overflow-x-auto border-bottom border-secondary-subtle mb-4 scrollbar-hidden" style="white-space: nowrap;">
        <button class="btn btn-link px-1 pb-2 text-decoration-none rounded-0 border-0 ${state.filtroEstado === 'todos' ? 'text-body fw-bold border-bottom border-primary border-2' : 'text-body-secondary'}" data-filter="todos">
          Todos <span class="ms-1 small text-body-secondary">${state.postulantes.length}</span>
        </button>
        ${Object.entries(ESTADO_LABELS)
          .map(([key, label]) => {
            const count = counts[key] || 0
            if (count === 0 && state.filtroEstado !== key) return '' // Ocultar estados vacíos para no saturar
            const active = state.filtroEstado === key
            return `
            <button class="btn btn-link px-1 pb-2 text-decoration-none rounded-0 border-0 ${active ? 'text-body fw-bold border-bottom border-primary border-2' : 'text-body-secondary'}" data-filter="${key}">
              ${label} <span class="ms-1 small text-body-secondary">${count}</span>
            </button>
          `
          })
          .join('')}
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="bg-transparent">
        ${paginatedList.length === 0 ? renderEmptyState() : renderTable(paginatedList)}
        
        <!-- MINIMALIST PAGINATION -->
        ${
          totalRecords > 0
            ? `
          <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary-subtle">
            <span class="text-body-secondary small">
              ${startIndex + 1}-${endIndex} de ${totalRecords}
            </span>
            <div class="d-flex gap-3">
              <button class="btn btn-link text-decoration-none text-body p-0 ${state.page === 1 ? 'opacity-25' : ''}" id="btn-page-prev" ${state.page === 1 ? 'disabled' : ''}>
                <i class="bi bi-arrow-left"></i> Anterior
              </button>
              <button class="btn btn-link text-decoration-none text-body p-0 ${state.page === totalPages ? 'opacity-25' : ''}" id="btn-page-next" ${state.page === totalPages ? 'disabled' : ''}>
                Siguiente <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        `
            : ''
        }
      </div>
  `

  attachEvents(container)
}

function getFilteredPostulantes() {
  if (state.filtroEstado === 'todos') {
    return [...state.postulantes]
  }
  return state.postulantes.filter((p) => p.estado === state.filtroEstado)
}

function getCountsByStatus() {
  const counts = {}
  Object.keys(ESTADO_LABELS).forEach((k) => (counts[k] = 0))
  state.postulantes.forEach((p) => {
    const est = p.estado || 'postulado'
    if (counts[est] !== undefined) {
      counts[est]++
    }
  })
  return counts
}

function renderEmptyState() {
  return `
    <div class="text-center py-5 my-5">
      <h5 class="text-body-secondary fw-normal">No hay postulantes</h5>
    </div>
  `
}

function renderTable(list) {
  // Generador de filas HTML para Escritorio
  const desktopRows = list
    .map((p) => {
      const telefonos = resolverTelefonos(p)
      const phonesHTML = telefonos
        .map(({ rol, nombre, numero }) => {
          const digits = numero.replace(/\D/g, '')
          const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent('Hola, le contactamos de El Sistema Punta Cana.')}`
          const etiqueta = nombre ? `${nombre} (${rol})` : rol
          return `<a href="${waUrl}" target="_blank" rel="noopener" class="d-flex align-items-center gap-2 text-decoration-none text-body mb-1" title="${etiqueta}">
        <i class="bi bi-whatsapp text-success small"></i>
        <span class="small">${formatearNumero(numero)}</span>
        <span class="text-body-secondary small fw-light">· ${etiqueta}</span>
      </a>`
        })
        .join('')

      const rawDate = p.fecha_postulacion || p.created_at
      const dateStr = rawDate
        ? new Date(rawDate).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '-'
      const estadoColor = ESTADO_COLOR[p.estado || 'postulado']
      const estadoLabel = ESTADO_LABELS[p.estado || 'postulado']

      return `
      <tr class="cursor-pointer" data-id="${p.id}">
        <td class="py-3">
          <div class="fw-medium text-body">${resolverNombre(p)}</div>
          ${
            estadoLabel
              ? `
          <div class="d-flex align-items-center gap-1 mt-1">
            <i class="bi bi-circle-fill text-${estadoColor}" style="font-size: 8px;"></i>
            <span class="text-body-secondary small">${estadoLabel}</span>
          </div>
          `
              : ''
          }
        </td>
        <td class="py-3 align-middle">
          <div class="d-flex flex-column justify-content-center">${phonesHTML}</div>
        </td>
        <td class="text-body-secondary small py-3 align-middle">${dateStr}</td>
        <td class="text-end pe-2 py-3 align-middle">
          <button class="btn btn-link text-body-secondary p-0 hover-danger btn-delete-postulante" data-id="${p.id}" data-name="${resolverNombre(p)}" title="Eliminar">
            <i class="bi bi-x-lg"></i>
          </button>
        </td>
      </tr>
    `
    })
    .join('')

  // Generador de lista limpia para Móvil (en vez de tarjetas pesadas)
  const mobileList = list
    .map((p) => {
      const telefonos = resolverTelefonos(p)
      const phonesHTML = telefonos
        .map(({ rol, nombre, numero }) => {
          const digits = numero.replace(/\D/g, '')
          const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent('Hola, le contactamos de El Sistema Punta Cana.')}`
          return `<a href="${waUrl}" target="_blank" rel="noopener" class="text-decoration-none text-body me-3 mb-2 d-inline-flex align-items-center gap-1">
        <i class="bi bi-whatsapp text-success"></i> <span class="small fw-medium">${formatearNumero(numero)}</span>
      </a>`
        })
        .join('')

      const rawDate = p.fecha_postulacion || p.created_at
      const dateStr = rawDate
        ? new Date(rawDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        : '-'
      const estadoColor = ESTADO_COLOR[p.estado || 'postulado']
      const estadoLabel = ESTADO_LABELS[p.estado || 'postulado']

      return `
      <div class="border-bottom border-secondary-subtle py-3 cursor-pointer" data-id="${p.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-semibold text-body fs-6">${resolverNombre(p)}</div>
            ${
              estadoLabel
                ? `
            <div class="d-flex align-items-center gap-1 mt-1">
              <i class="bi bi-circle-fill text-${estadoColor}" style="font-size: 8px;"></i>
              <span class="text-body-secondary small">${estadoLabel}</span>
            </div>
            `
                : ''
            }
          </div>
          <div class="text-end">
            <span class="text-body-secondary small d-block mb-1">${dateStr}</span>
          </div>
        </div>
        <div class="mt-2">
          ${phonesHTML}
        </div>
      </div>
    `
    })
    .join('')

  return `
    <div class="w-100">
      <!-- VISTA ESCRITORIO -->
      <div class="d-none d-md-block table-responsive">
        <table class="table align-middle mb-0 border-transparent">
          <thead>
            <tr>
              <th class="border-bottom border-secondary-subtle text-body-secondary fw-normal small pb-3">Postulante</th>
              <th class="border-bottom border-secondary-subtle text-body-secondary fw-normal small pb-3">Contacto</th>
              <th class="border-bottom border-secondary-subtle text-body-secondary fw-normal small pb-3">Fecha</th>
              <th class="border-bottom border-secondary-subtle text-end pe-2 fw-normal small pb-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${desktopRows}
          </tbody>
        </table>
      </div>

      <!-- VISTA MÓVIL (Lista limpia) -->
      <div class="d-block d-md-none">
        ${mobileList}
      </div>
    </div>
  `
}

function attachEvents(container) {
  // Prevenir propagación de eventos en los links de WhatsApp para no gatillar la navegación al perfil
  container.querySelectorAll('.btn-wa-link').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation()
    })
  })

  // Selector de mes ← — scoped to container
  container.querySelector('#btn-month-prev')?.addEventListener('click', () => {
    state.month--
    if (state.month < 1) {
      state.month = 12
      state.year--
    }
    state.page = 1 // Reset de página al cambiar de mes
    cargarDatos(container)
  })

  // Selector de mes → — scoped to container
  container.querySelector('#btn-month-next')?.addEventListener('click', () => {
    state.month++
    if (state.month > 12) {
      state.month = 1
      state.year++
    }
    state.page = 1 // Reset de página al cambiar de mes
    cargarDatos(container)
  })

  // Botón Sincronizar — scoped to container
  container.querySelector('#btn-sync')?.addEventListener('click', async () => {
    const btn = container.querySelector('#btn-sync')
    const spinner = container.querySelector('#sync-spinner')
    const icon = container.querySelector('#sync-icon')

    try {
      btn.disabled = true
      spinner.classList.remove('d-none')
      icon.classList.add('d-none')

      const result = await sincronizarPostulantes()

      alert(
        `Sincronización exitosa. Registros procesados: ${result.total_rows || result.upserted || 0}`,
      )
      state.page = 1
      cargarDatos(container)
    } catch (error) {
      alert(`Error al sincronizar: ${error.message}`)
      btn.disabled = false
      spinner.classList.add('d-none')
      icon.classList.remove('d-none')
    }
  })

  // Clicks en las pills de filtros
  container.querySelectorAll('[data-filter]').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      const filter = e.currentTarget.getAttribute('data-filter')
      state.filtroEstado = filter
      state.page = 1 // Reset de página al filtrar
      renderContent(container)
    })
  })

  // Clicks en las filas de la tabla para navegar al perfil del postulado
  container.querySelectorAll('.hover-table-row').forEach((element) => {
    element.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id')
      router.navigate('postulado', { id })
    })
  })

  // Escuchar clicks de eliminar postulación (con confirmación previa y parada de propagación)
  container.querySelectorAll('.btn-delete-postulante').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation() // Previene que se navegue al perfil al hacer clic en eliminar

      const button = e.currentTarget
      const id = button.getAttribute('data-id')
      const name = button.getAttribute('data-name')

      if (
        confirm(
          `¿Estás seguro de que deseas eliminar permanentemente la postulación de "${name}"?\n\nEsta acción eliminará el registro de la base de datos de forma irreversible.`,
        )
      ) {
        try {
          button.disabled = true
          await eliminarPostulante(id)
          alert('Postulación eliminada con éxito')
          cargarDatos(container) // Recargar el listado
        } catch (error) {
          alert(`Error al eliminar: ${error.message}`)
          button.disabled = false
        }
      }
    })
  })

  // Botón Descargar PDF por rango de fechas — scoped to container
  container.querySelector('#btn-descargar-pdf')?.addEventListener('click', async () => {
    const desde = container.querySelector('#pdf-desde')?.value
    const hasta = container.querySelector('#pdf-hasta')?.value
    const btn = container.querySelector('#btn-descargar-pdf')
    const spinner = container.querySelector('#pdf-spinner')
    const icon = container.querySelector('#pdf-icon')

    if (!desde || !hasta) {
      alert('Debe seleccionar una fecha de inicio y una fecha de fin.')
      return
    }

    if (desde > hasta) {
      alert('La fecha "Desde" no puede ser posterior a la fecha "Hasta".')
      return
    }

    try {
      btn.disabled = true
      spinner.classList.remove('d-none')
      icon.classList.add('d-none')

      const postulantes = await listarPostulantesPorRango(desde, hasta)

      if (!postulantes || postulantes.length === 0) {
        alert('No hay postulados registrados en el rango de fechas seleccionado.')
        return
      }

      descargarPdfPostulados(postulantes, desde, hasta)
    } catch (error) {
      alert(`Error al generar el PDF: ${error.message}`)
    } finally {
      btn.disabled = false
      spinner.classList.add('d-none')
      icon.classList.remove('d-none')
    }
  })

  // Paginación: Anteriores (Más recientes) — scoped to container
  container.querySelector('#btn-page-prev')?.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--
      renderContent(container)
    }
  })

  // Paginación: Siguientes (Más antiguos) — scoped to container
  container.querySelector('#btn-page-next')?.addEventListener('click', () => {
    state.page++
    renderContent(container)
  })
}
