import { supabase } from '../../../lib/supabaseClient.js'
import { escHTML } from '../../utils/portalUtils.js'
import { createRouteTreeBar } from '../routeTreeBar.js'
import { RouteConfigAdapter } from '../../services/routeConfigAdapter.js'
import { openPlanificacionModal } from '../../../modules/planificacion/components/planificacionModal.js'
import { crearPlanificacion } from '../../../modules/planificacion/api/planificacionAdapter.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { getMisClases } from '../../services/maestroDataService.js'
import { renderRouteConfigurator } from '../../views/components/routeConfigurator.js'

export function createPlanificationCard(container, opts) {
  let activePlanificacionId = null
  let routeTreeBar = null
  const cleanups = []

  const planificacionCard = container.querySelector('#pm-planificacion-card')
  const planDropdown = container.querySelector('#pm-planificacion-dropdown')
  const planNombreEl = container.querySelector('#pm-planificacion-nombre')
  const planListRutas = container.querySelector('#pm-plan-list-rutas')
  const planListPlanes = container.querySelector('#pm-plan-list-planificaciones')
  const planHeader = container.querySelector('#pm-planificacion-header')
  const copyPlanBtn = container.querySelector('#btn-copy-as-plan')

  if (planHeader) {
    planHeader.addEventListener('click', () => {
      const isOpen = planificacionCard.classList.toggle('open')
      planDropdown.style.display = isOpen ? 'block' : 'none'
    })
  }

  container.querySelectorAll('.pm-plan-tab-pill').forEach((tab) => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.pm-plan-tab-pill').forEach((t) => t.classList.remove('active'))
      tab.classList.add('active')
      const tabName = tab.dataset.tab
      planListRutas.style.display = tabName === 'rutas' ? '' : 'none'
      planListPlanes.style.display = tabName === 'planificaciones' ? '' : 'none'
    })
  })

  function selectPlanificacion(plan) {
    activePlanificacionId = plan.id

    localStorage.setItem(`pm_default_plan_${opts.claseId}`, plan.id)

    if (planNombreEl) planNombreEl.textContent = plan.nombre || plan.name || 'Sin nombre'

    planListPlanes.querySelectorAll('.pm-plan-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.planId === plan.id)
    })

    destroyTreeBar()
    const treeContainer = container.querySelector('#pm-route-tree-container')
    const temaBadge = container.querySelector('#pm-active-tema-badge')

    if (activePlanificacionId && treeContainer) {
      treeContainer.innerHTML = ''
      getCompletedTopics(opts.claseId).then((completedTopics) => {
        routeTreeBar = createRouteTreeBar(treeContainer, {
          claseId: opts.claseId,
          rutaId: activePlanificacionId,
          completedTopics,
          onIndicadorSelect: (ind) => {
            opts.onIndicadorSelect?.(ind)
            if (temaBadge) {
              temaBadge.textContent = ind.nombre
              temaBadge.style.display = 'inline-block'
            }
            planificacionCard.classList.remove('open')
            planDropdown.style.display = 'none'
          },
        })
        cleanups.push(() => routeTreeBar.destroy())
      })
    }
  }

  const manageBtn = container.querySelector('#btn-manage-planning')
  if (manageBtn) {
    manageBtn.onclick = (e) => {
      e.stopPropagation()
      if (!activePlanificacionId) {
        AppModal.open({
          title: 'Atención',
          body: '<p>Seleccioná una planificación primero para poder gestionarla.</p>',
          confirmText: 'Entendido',
          hideCancel: true,
        })
        return
      }
      AppModal.open({
        title: `Gestionar Estructura: ${planNombreEl.textContent}`,
        size: 'xl',
        body: '<div id="modal-route-config-root"></div>',
        saveText: 'Cerrar y Actualizar',
        onSave: async () => {
          if (routeTreeBar) routeTreeBar.refresh()
          return true
        },
      })
      const modalRoot = document.getElementById('modal-route-config-root')
      if (modalRoot) {
        renderRouteConfigurator(modalRoot, activePlanificacionId)
      }
    }
  }

  if (planificacionCard) {
    ;(async () => {
      try {
        const planningClasses = await RouteConfigAdapter.getClasses(opts.maestro ? opts.maestro.id : null)

        const savedPlanId = localStorage.getItem(`pm_default_plan_${opts.claseId}`)
        const claseInstrumentos = (opts.clase.instrumento || '')
          .toLowerCase()
          .split(',')
          .map((i) => i.trim())

        const misRutas = planningClasses.filter((p) => {
          if (p.id === savedPlanId) return true
          const planInst = (p.nombre || '').toLowerCase()
          return claseInstrumentos.some((ci) => planInst.includes(ci))
        })

        if (planListRutas) {
          planListRutas.innerHTML = misRutas.length
            ? misRutas
                .map(
                  (r) => `
              <div class="pm-plan-item ${r.id === savedPlanId ? 'active' : ''}" data-plan-id="${r.id}">
                <span class="pm-plan-item-icon">📍</span>
                <span class="pm-plan-item-name">${escHTML(r.nombre || 'Ruta sin nombre')}</span>
                ${r.id === savedPlanId ? '<span class="pm-tree-badge">ACTIVA</span>' : ''}
              </div>`,
                )
                .join('')
            : '<div style="padding:0.5rem;font-size:0.8rem;color:var(--pm-text-muted)">No hay planes sugeridos para este instrumento</div>'

          planListRutas.querySelectorAll('.pm-plan-item').forEach((item) => {
            item.addEventListener('click', () => {
              const r = misRutas.find((x) => x.id === item.dataset.planId)
              if (r) selectPlanificacion(r)
            })
          })
        }

        if (planListPlanes) {
          planListPlanes.innerHTML = planningClasses
            .map(
              (p) => `
            <div class="pm-plan-item" data-plan-id="${p.id}">
              <span class="pm-plan-item-icon">📚</span>
              <span class="pm-plan-item-name">${escHTML(p.nombre || p.name)}</span>
            </div>`,
            )
            .join('')

          planListPlanes.querySelectorAll('.pm-plan-item').forEach((item) => {
            item.addEventListener('click', () => {
              const p = planningClasses.find((x) => x.id === item.dataset.planId)
              if (p) selectPlanificacion(p)
            })
          })
        }

        planificacionCard.style.display = ''

        const savedMatch = planningClasses.find((c) => c.id === savedPlanId)
        const initialMatch =
          savedMatch || misRutas[0] || (await RouteConfigAdapter.resolveSmartPlan(opts.clase))
        if (initialMatch) selectPlanificacion(initialMatch)
      } catch (err) {
        console.warn('[asistencia] Error cargando planificación unificada:', err)
      }
    })()
  }

  if (copyPlanBtn) {
    copyPlanBtn.addEventListener('click', async () => {
      const dslContent = opts.getDslContent()
      const clases = await getMisClases()
      const initialData = {
        clase_id: opts.claseId,
        maestro_id: opts.maestro?.id || null,
        maestro_nombre: opts.maestro?.nombre_completo || null,
        contenido: dslContent || '',
        fecha_inicio: opts.fechaHoy,
      }
      openPlanificacionModal('create', null, clases, [], initialData, async (datos) => {
        try {
          await crearPlanificacion({
            ...datos,
            estado: 'planificado',
          })
          const toast = document.createElement('div')
          toast.className = 'pm-toast-success'
          toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Planificación creada exitosamente
          `
          document.body.appendChild(toast)
          setTimeout(() => toast.remove(), 3000)
        } catch (err) {
          console.error('[asistencia] Error guardando planificación:', err)
          AppToast.error('Error al guardar la planificación: ' + (err.message || err))
        }
      })
    })
  }

  if (opts.rutaId) {
    const treeContainer = container.querySelector('#pm-route-tree-container')
    routeTreeBar = createRouteTreeBar(treeContainer, {
      claseId: opts.claseId,
      rutaId: opts.rutaId,
      onIndicadorSelect: (ind) => {
        opts.onIndicadorSelect?.(ind)
      },
    })
    cleanups.push(() => routeTreeBar.destroy())
  }

  function destroyTreeBar() {
    if (routeTreeBar) {
      routeTreeBar.destroy()
      routeTreeBar = null
    }
  }

  function destroy() {
    destroyTreeBar()
    cleanups.forEach((fn) => { try { fn() } catch {} })
    cleanups.length = 0
  }

  return {
    destroy,
    getActiveIndicador: () => routeTreeBar?.getActiveIndicador() || null,
    refreshTree: async () => { if (routeTreeBar) await routeTreeBar.refresh() },
    getActivePlanificacionId: () => activePlanificacionId,
  }
}

async function getCompletedTopics(claseId) {
  try {
    const { data: sesiones } = await supabase
      .from('sesiones_clase')
      .select('contenido')
      .eq('clase_id', claseId)
      .not('contenido', 'is', null)

    if (!sesiones) return []

    const topics = new Set()
    const regex = /\[(.*?)\]/g
    sesiones.forEach((s) => {
      if (!s.contenido) return
      let match
      while ((match = regex.exec(s.contenido)) !== null) {
        if (match[1]) topics.add(match[1].trim())
      }
    })

    return Array.from(topics)
  } catch (err) {
    console.warn('[asistencia] Error calculando progreso histórico:', err)
    return []
  }
}
