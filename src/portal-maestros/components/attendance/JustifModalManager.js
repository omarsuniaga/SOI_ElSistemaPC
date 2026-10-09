import { createJustificacionModal } from '../JustificacionModal.js'
import { deleteEvidencia } from '../../services/justificacionService.js'

/**
 * createJustifModalManager
 * Wrapper para JustificacionModal con ciclo de vida.
 * Delega mutaciones de estado al parent via callbacks.
 */
export function createJustifModalManager(container, {
  sesionId,
  getSesionId,
  claseId,
  fechaHoy,
  maestroId,
  guardarJustificacion,
  actualizarJustificacion,
  eliminarJustificacion,
  onJustifDeleted,
  onJustifSaved,
  onJustifCancelled,
  onRenderLista,
  onUpdateProgress,
  onAutoSave,
  onAnnounce,
}) {
  let destroyed = false

  const resolveSesionId = () => (typeof getSesionId === 'function' ? getSesionId() : sesionId)

  const modal = createJustificacionModal(document.body, {
    onDelete: async ({ alumnoId, justificacionId, existingUrl }) => {
      if (destroyed) return
      if (existingUrl) {
        deleteEvidencia(existingUrl).catch(() => {})
      }
      if (justificacionId) eliminarJustificacion(justificacionId).catch(console.warn)
      if (onJustifDeleted) onJustifDeleted(alumnoId)
      onRenderLista(alumnoId)
      onUpdateProgress()
      try { await onAutoSave(true) } catch (_e) { console.warn('[justif] autoSave error:', _e) }
      if (onAnnounce) onAnnounce('Justificación eliminada.')
    },

    onSave: async ({ alumnoId, motivo, evidenciaFile, evidenciaRemoved, justificacionId, existingUrl, isEdit }) => {
      if (destroyed) return
      const saveBtn = document.getElementById('pm-justif-save')
      if (saveBtn) saveBtn.disabled = true
      try {
        let savedRecord = null
        if (isEdit && justificacionId) {
          const { data, error } = await actualizarJustificacion({
            justificacionId,
            motivo,
            evidenciaFile,
            evidenciaRemoved,
            existingUrl,
          })
          if (error) throw error
          savedRecord = data
        } else {
          let currentSesionId = resolveSesionId()
          if (!currentSesionId) {
            await onAutoSave(true, false)
            currentSesionId = resolveSesionId()
          }
          const result = await guardarJustificacion(
            { sesionId: currentSesionId, alumnoId, claseId, fecha: fechaHoy, motivo, creadoPor: maestroId },
            evidenciaFile,
          )
          if (result.error) throw result.error
          savedRecord = result.data
        }
        if (savedRecord && onJustifSaved) onJustifSaved(alumnoId, savedRecord)
        if (!destroyed) modal.close(false)
        onRenderLista(alumnoId)
        onUpdateProgress()
        try { await onAutoSave(true) } catch (_e) { console.warn('[justif] autoSave error:', _e) }
        if (onAnnounce) onAnnounce('Justificación guardada.')
      } catch (err) {
        console.error('[justificacion] Error guardando:', err)
        alert('Error al guardar la justificación: ' + err.message)
      } finally {
        if (saveBtn) saveBtn.disabled = false
      }
    },

    onCancel: (alumnoId, prevEstado) => {
      if (destroyed) return
      if (onJustifCancelled) onJustifCancelled(alumnoId, prevEstado)
      onRenderLista(alumnoId)
      onUpdateProgress()
    },
  })

  return {
    open(alumno, justifExistente, prevEstado) {
      if (!destroyed) modal.open(alumno, justifExistente, prevEstado)
    },
    close() {
      if (!destroyed) { try { modal.close() } catch { /* ignore */ } }
    },
    destroy() {
      destroyed = true
      try { modal.close() } catch { /* ignore */ }
    },
  }
}
