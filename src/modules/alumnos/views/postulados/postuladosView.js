import {
  listarPostulantesPorMes,
  sincronizarPostulantes,
  eliminarPostulante,
} from '../../api/postulantesApi.js'
import {
  ESTADO_LABELS,
  ESTADO_COLOR,
} from '../../domain/postuladoStateMachine.js'
import { router } from '../../../../core/router/router.js'

// Estado interno de la vista con paginación
const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-12
  postulantes: [],
  filtroEstado: 'todos',
  cargando: false,
  page: 1,
  limit: 50,
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * Determina el mejor nombre disponible para mostrar un postulante.
 * El campo nombre_completo a veces contiene valores incorrectos del Google Form
 * (respuestas de otras preguntas concatenadas). Esta función detecta esos casos
 * y cae al mejor fallback disponible.
 */
// Palabras que indican que el campo contiene algo que NO es un nombre de persona
const PALABRAS_NO_NOMBRE = /\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|extracu|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i

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
  const candidatos = [
    p.nombre_completo,
    p.madre_nombre,
    p.padre_nombre,
    p.representante_nombre,
  ]
  const valido = candidatos
    .map(v => (v ?? '').trim())
    .find(v => esNombrePersona(v))

  return valido ?? 'Sin nombre registrado'
}

function resolverIniciales(nombre) {
  return nombre
    .split(' ')
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
    || '?'
}

/**
 * Recolecta todos los números de WhatsApp disponibles de un postulante,
 * en orden de preferencia, con su etiqueta de origen.
 * @returns {{ label: string, numero: string }[]}
 */
function resolverTelefonos(p) {
  return [
    { persona: p.madre_nombre,         numero: p.madre_tlf_whatsapp,                          rol: 'Madre' },
    { persona: p.padre_nombre,         numero: p.padre_tlf_whatsapp,                          rol: 'Padre' },
    { persona: p.representante_nombre, numero: p.representante_tlf || p.telefono_representante, rol: 'Representante' },
    { persona: null,                   numero: p.telefono_alumno,                              rol: 'Alumno' },
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
  if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`
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
    state.postulantes = todos.filter(p => resolverTelefonoPrincipal(p) !== null)
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
  
  document.getElementById('btn-error-retry')?.addEventListener('click', () => renderPostuladosView(container))
}

function renderContent(container) {
  // 1. Filtrar los postulantes
  let list = getFilteredPostulantes()

  // 2. ORDENAR por fecha_postulacion o created_at Descendiente
  list.sort((a, b) => {
    const dateA = new Date(a.fecha_postulacion || a.created_at)
    const dateB = new Date(b.fecha_postulacion || b.created_at)
    return dateB - dateA
  })

  // 3. PAGINAR (50 registros)
  const totalRecords = list.length
  const totalPages = Math.ceil(totalRecords / state.limit) || 1
  
  // Ajustar página actual si excede el rango
  if (state.page > totalPages) state.page = totalPages
  if (state.page < 1) state.page = 1

  const startIndex = (state.page - 1) * state.limit
  const endIndex = Math.min(startIndex + state.limit, totalRecords)
  const paginatedList = list.slice(startIndex, endIndex)

  const counts = getCountsByStatus()

  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4">
      
      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Módulo de Postulados</h1>
          <p class="text-body-secondary mb-0">Gestión de admisiones y pipeline de postulaciones</p>
        </div>
        
        <!-- MES SELECTOR & SYNC -->
        <div class="d-flex align-items-center gap-2">
          <div class="input-group input-group-sm shadow-sm" style="max-width: 250px;">
            <button class="btn btn-outline-secondary" id="btn-month-prev" type="button">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="form-control text-center fw-semibold bg-body-secondary d-flex align-items-center justify-content-center" style="min-width: 140px; color: var(--bs-body-color);">
              ${MESES[state.month - 1]} ${state.year}
            </span>
            <button class="btn btn-outline-secondary" id="btn-month-next" type="button">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          
          <button class="btn btn-sm btn-primary shadow-sm" id="btn-sync" type="button">
            <span class="spinner-border spinner-border-sm d-none me-1" id="sync-spinner" role="status" aria-hidden="true"></span>
            <i class="bi bi-arrow-repeat me-1" id="sync-icon"></i> Sincronizar
          </button>
        </div>
      </div>

      <!-- FILTER PILLS -->
      <div class="d-flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hidden" style="white-space: nowrap;">
        <button class="btn btn-sm rounded-pill px-3 ${state.filtroEstado === 'todos' ? 'btn-primary' : 'btn-outline-secondary'}" data-filter="todos">
          Todos <span class="badge ${state.filtroEstado === 'todos' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-1">${state.postulantes.length}</span>
        </button>
        ${Object.entries(ESTADO_LABELS).map(([key, label]) => {
          const count = counts[key] || 0
          const activeClass = state.filtroEstado === key ? 'btn-primary' : 'btn-outline-secondary'
          const badgeClass = state.filtroEstado === key ? 'bg-white text-primary' : 'bg-secondary text-white'
          return `
            <button class="btn btn-sm rounded-pill px-3 ${activeClass}" data-filter="${key}">
              ${label} <span class="badge ${badgeClass} ms-1">${count}</span>
            </button>
          `
        }).join('')}
      </div>

      <!-- TABLE CARD (Compatible con Light/Dark Theme) -->
      <div class="card border border-secondary-subtle shadow-sm rounded-3 overflow-hidden">
        <div class="card-body p-0">
          ${paginatedList.length === 0 ? renderEmptyState() : renderTable(paginatedList)}
        </div>
        
        <!-- CONTROLES DE PAGINACIÓN -->
        ${totalRecords > 0 ? `
          <div class="card-footer bg-body-tertiary border-top border-secondary-subtle px-4 py-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
            <span class="text-body-secondary small">
              Mostrando <strong class="text-body">${startIndex + 1}-${endIndex}</strong> de <strong class="text-body">${totalRecords}</strong> postulantes
            </span>
            
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-page-prev" ${state.page === 1 ? 'disabled' : ''}>
                <i class="bi bi-arrow-left me-1"></i> Más recientes
              </button>
              <span class="text-body-secondary small px-2">Pág. ${state.page} de ${totalPages}</span>
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-page-next" ${state.page === totalPages ? 'disabled' : ''}>
                Más antiguos <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
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
  Object.keys(ESTADO_LABELS).forEach(k => counts[k] = 0)
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
    <div class="text-center py-5">
      <i class="bi bi-people text-body-secondary display-4"></i>
      <h5 class="mt-3 fw-bold text-body">No hay postulantes</h5>
      <p class="text-body-secondary px-4 mb-0">No se encontraron postulantes registrados para el mes seleccionado o bajo este filtro de estado.</p>
    </div>
  `
}

function renderTable(list) {
  return `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="border-bottom border-secondary-subtle ps-4">Nombre Completo</th>
            <th class="border-bottom border-secondary-subtle">Contacto</th>
            <th class="border-bottom border-secondary-subtle">Fecha Postulación</th>
            <th class="border-bottom border-secondary-subtle text-end pe-4">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((p) => {
            const telefonos = resolverTelefonos(p)
            const phonesHTML = telefonos.map(({ rol, nombre, numero }) => {
              const digits = numero.replace(/\D/g, '')
              const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent('Hola, le contactamos de El Sistema Punta Cana.')}`
              const etiqueta = nombre ? `${nombre} (${rol})` : rol
              return `<a href="${waUrl}" target="_blank" rel="noopener"
                class="d-flex align-items-center gap-1 text-decoration-none text-success mb-1 btn-wa-link"
                title="Abrir WhatsApp con ${etiqueta}">
                <i class="bi bi-whatsapp fs-6"></i>
                <span class="small">${formatearNumero(numero)}</span>
                <span class="text-muted small">· ${etiqueta}</span>
              </a>`
            }).join('')

            // formatear fecha de postulación
            const rawDate = p.fecha_postulacion || p.created_at
            const dateStr = rawDate 
              ? new Date(rawDate).toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                }) 
              : '-'
            
            return `
              <tr class="cursor-pointer hover-table-row" data-id="${p.id}">
                <!-- Columna 1: Nombre completo -->
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3 bg-primary bg-opacity-10 text-primary fw-bold d-none d-sm-flex">
                      ${resolverIniciales(resolverNombre(p))}
                    </div>
                    <div>
                      <span class="fw-semibold text-body block-link">${resolverNombre(p)}</span>
                      <div class="d-flex flex-wrap d-sm-none mt-1">${phonesHTML}</div>
                    </div>
                  </div>
                </td>

                <!-- Columna 2: Teléfonos con botones WhatsApp por contacto -->
                <td class="d-none d-sm-table-cell py-2">
                  <div class="d-flex flex-wrap gap-1">${phonesHTML}</div>
                </td>
                
                <!-- Columna 3: Fecha de postulación -->
                <td class="text-body-secondary">${dateStr}</td>
                
                <!-- Columna 4: Botón eliminar -->
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-link text-danger p-1 rounded-circle hover-bg-danger-subtle btn-delete-postulante" 
                          data-id="${p.id}" 
                          data-name="${resolverNombre(p)}" 
                          title="Eliminar postulación">
                    <i class="bi bi-trash-fill fs-6"></i>
                  </button>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
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

  // Selector de mes ←
  document.getElementById('btn-month-prev')?.addEventListener('click', () => {
    state.month--
    if (state.month < 1) {
      state.month = 12
      state.year--
    }
    state.page = 1 // Reset de página al cambiar de mes
    cargarDatos(container)
  })

  // Selector de mes →
  document.getElementById('btn-month-next')?.addEventListener('click', () => {
    state.month++
    if (state.month > 12) {
      state.month = 1
      state.year++
    }
    state.page = 1 // Reset de página al cambiar de mes
    cargarDatos(container)
  })

  // Botón Sincronizar
  document.getElementById('btn-sync')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-sync')
    const spinner = document.getElementById('sync-spinner')
    const icon = document.getElementById('sync-icon')
    
    try {
      btn.disabled = true
      spinner.classList.remove('d-none')
      icon.classList.add('d-none')

      const result = await sincronizarPostulantes()
      
      alert(`Sincronización exitosa. Registros procesados: ${result.total_rows || result.upserted || 0}`)
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
      
      if (confirm(`¿Estás seguro de que deseas eliminar permanentemente la postulación de "${name}"?\n\nEsta acción eliminará el registro de la base de datos de forma irreversible.`)) {
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

  // Paginación: Anteriores (Más recientes)
  document.getElementById('btn-page-prev')?.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--
      renderContent(container)
    }
  })

  // Paginación: Siguientes (Más antiguos)
  document.getElementById('btn-page-next')?.addEventListener('click', () => {
    state.page++
    renderContent(container)
  })
}
