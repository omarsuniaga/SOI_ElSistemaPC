import { AppToast } from '../../../shared/components/AppToast.js'
import { processarEvaluacion, saveEvaluaciones } from '../../services/evaluationService.js'
import { saveObservation } from '../../services/autoDraftService.js'
import { parseDSL } from '../../utils/dslParser.js'
import { saveProgressFromDSL, saveProgressFromEvaluaciones } from '../../services/progressAggregatorService.js'
import { showProgressFeedback } from '../../utils/asistenciaHelpers.js'
import { promocionarObservacionesAlumnos } from '../../services/observationPromotionService.js'
import { updateClassEventStatus } from '../../services/classEventService.js'
import { RouteConfigAdapter } from '../../services/routeConfigAdapter.js'

export function createObservationSaveButton(container, opts) {
  const btn = container.querySelector('#btn-guardar-obs')
  if (!btn) return { destroy() {} }

  if (opts.rutaId) btn.style.display = ''

  btn.onclick = async () => {
    const raw = opts.getEditorValue()
    if (!raw || !raw.trim()) {
      AppToast.warning('El editor está vacío. Escribe observaciones antes de guardar.')
      return
    }

    if (!opts.sesionId) {
      AppToast.warning('Primero guarda la sesión (asistencia) para poder registrar observaciones.')
      return
    }

    let indicadorActivo = null
    const textoIndicador = await _resolveActiveIndicador(raw, opts)
    const treeIndicador = opts.planificationCard?.getActiveIndicador()
    indicadorActivo = textoIndicador || treeIndicador

    if (!indicadorActivo) {
      AppToast.warning('Seleccione un indicador en la ruta antes de guardar la observación o escríbalo entre corchetes [Ejemplo].')
      return
    }

    const temaBadge = container.querySelector('#pm-active-tema-badge')
    if (temaBadge && indicadorActivo.nombre) {
      temaBadge.textContent = indicadorActivo.nombre
      temaBadge.style.display = 'inline-block'
    }

    btn.disabled = true
    btn.textContent = 'Procesando...'

    try {
      const presentes = opts.alumnos.filter((a) => opts.estado[a.id] === 'P')

      const resultado = await processarEvaluacion(
        raw,
        indicadorActivo.id,
        presentes,
        indicadorActivo.nombre,
      )

      if (resultado.error) throw new Error(resultado.error)

      if (resultado.modo === 'natural' && resultado.dslGenerado) {
        const confirmar = confirm(
          '📝 Texto convertido a formato estructurado:\n\n' +
            resultado.dslGenerado + '\n\n¿Guardar la evaluación?',
        )
        if (!confirmar) {
          btn.disabled = false
          btn.textContent = 'Guardar observación'
          return
        }
      }

      if (resultado.missing.length > 0) {
        const proceed = confirm(
          `Faltan ${resultado.missing.length} alumno(s) sin evaluar:\n${resultado.missing.join(', ')}\n\n¿Guardar de todas formas?`,
        )
        if (!proceed) {
          btn.disabled = false
          btn.textContent = 'Guardar observación'
          return
        }
      }

      if (resultado.evaluaciones.length > 0) {
        const { error } = await saveEvaluaciones(
          opts.sesionId,
          indicadorActivo.id,
          resultado.evaluaciones,
          opts.maestro.id,
          presentes,
        )
        if (error) throw error
      }

      const parsed = { indicador_id: indicadorActivo.id, evaluaciones: resultado.evaluaciones }
      await saveObservation(
        opts.sesionId,
        opts.maestro.id,
        raw,
        parsed,
        resultado.dslGenerado || null,
        resultado.textoMejorado || null,
      )

      const _parsedForProgress = parseDSL(raw)
      if (_parsedForProgress.estados && _parsedForProgress.estados.length > 0) {
        const _alumnosConId = opts.alumnos.map((a) => ({
          id: a.id,
          nombre: a.nombre_completo || a.nombre || '',
          nombreCorto: (a.nombre_completo || a.nombre || '').split(' ')[0],
        }))
        saveProgressFromDSL({
          sesionId: opts.sesionId,
          claseId: opts.claseId,
          maestroId: opts.maestro.id,
          fechaHoy: opts.fechaHoy,
          dslText: raw,
          alumnos: _alumnosConId,
        }).then(({ saved, errors }) => {
          if (errors.length) console.warn('[Progress DSL] Errores:', errors)
          if (saved.length) showProgressFeedback(saved, opts.editorContainer)
        }).catch((err) => console.warn('[Progress DSL] Error:', err.message))
      }

      const promo = await promocionarObservacionesAlumnos(
        opts.sesionId,
        opts.claseId,
        opts.maestro.id,
        resultado.evaluaciones,
        opts.claseNombre || 'Clase',
        presentes,
      )
      if (!promo.success) console.warn('[Fase C] Fallo parcial en promoción:', promo.error)

      if (opts.planificationCard) await opts.planificationCard.refreshTree()

      opts.setEditorValue('')
      if (opts.onDslContentClear) opts.onDslContentClear()

      _showSuccessToast(resultado.evaluaciones.length, indicadorActivo.nombre)

      if (opts.activeClassEventId) {
        try {
          await updateClassEventStatus(opts.activeClassEventId, 'completed')
        } catch (ceErr) {
          console.warn('[asistencia] Error updating class event status:', ceErr)
        }
        if (opts.activeLevel) {
          try {
            const { academicService } = await import('../../../modules/academic-routes/services/academicService.js')
            for (const student of presentes) {
              const levelResult = await academicService.checkLevelCompletion(student.id, opts.activeLevel)
              if (levelResult && levelResult.status === 'approved') {
                const { createLevelCompletionModal } = await import('../LevelCompletionModal.js')
                const modal = createLevelCompletionModal({
                  studentId: student.id,
                  levelId: opts.activeLevel,
                })
                opts.onAppendModal?.(modal.el || modal)
              }
            }
          } catch (lcErr) {
            console.warn('[asistencia] Error checking level completion:', lcErr)
          }
        }
      }

      if (resultado.evaluaciones.length > 0 && opts.claseId && indicadorActivo?.nombre) {
        const { error } = await saveProgressFromEvaluaciones({
          sesionId: opts.sesionId,
          claseId: opts.claseId,
          maestroId: opts.maestro.id,
          fechaHoy: opts.fechaHoy,
          contenido: indicadorActivo.nombre,
          evaluaciones: resultado.evaluaciones,
        })
        if (error) console.warn('[asistencia] Error al sincronizar progresos:', error)
      }

      if (opts.sesionId) {
        const { academicService } = await import('../../../modules/academic-routes/services/academicService.js')
        const achievements = await academicService.processSessionClosure(opts.sesionId)
        if (achievements && achievements.length > 0) {
          const { createAchievementsSummaryModal } = await import('../AchievementsSummaryModal.js')
          await createAchievementsSummaryModal(container, achievements)
        }
      }

      btn.textContent = '¡Guardado!'
      setTimeout(() => {
        btn.textContent = 'Guardar observación'
        btn.disabled = false
      }, 2000)
    } catch (err) {
      console.error('[asistencia] Error saving observation:', err)
      AppToast.error('Error al guardar: ' + (err.message || err))
      btn.disabled = false
      btn.textContent = 'Guardar observación'
    }
  }

  return { destroy() {} }
}

function _showSuccessToast(evalCount, indicadorNombre) {
  const toast = document.createElement('div')
  toast.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
      <span>✅ Observación guardada exitosamente (${evalCount} eval.)</span>
      <span style="font-size:0.85em; opacity:0.9;">Tema detectado: <b>${indicadorNombre}</b></span>
    </div>`
  toast.style.cssText =
    'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--pm-surface, #1e1e1e);color:#fff;padding:12px 24px;border-radius:12px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.3); border: 1px solid var(--apple-success, #22c55e);'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4500)
}

async function _resolveActiveIndicador(text, opts) {
  const pid = opts.planificationCard?.getActivePlanificacionId()
  if (!text || !pid) return null

  const match = text.match(/\[(.*?)\]/)
  if (!match || !match[1]) return null

  const rawTema = match[1].trim().toLowerCase()
  const getKeywords = (str) => {
    const stopWords = ['se','hizo','la','el','los','las','un','una','de','del','en','con','por','para','y','o','tema','indicador']
    return str.toLowerCase().replace(/[^\w\sáéíóúñ]/g, '').split(/\s+/).filter((w) => w.length > 2 && !stopWords.includes(w))
  }

  const targetKeywords = getKeywords(rawTema)
  if (targetKeywords.length === 0) return null

  try {
    const hierarchy = await RouteConfigAdapter.getRouteHierarchy(pid)
    let bestMatch = null
    let maxScore = 0
    for (const nivel of hierarchy) {
      for (const tema of nivel.plan_temas || []) {
        for (const obj of tema.plan_objetivos || []) {
          const objKeywords = getKeywords(obj.nombre)
          const score = targetKeywords.filter((kw) => objKeywords.includes(kw)).length
          if (score > maxScore) { maxScore = score; bestMatch = obj }
        }
      }
    }
    return bestMatch
  } catch (err) {
    console.warn('[asistencia] Error resolving indicador:', err)
    return null
  }
}
