import { createJustificacionModal } from '../JustificacionModal.js'

/**
 * createJustifModalManager
 * Wrapper para JustificacionModal con ciclo de vida.
 * Delega mutaciones de estado al parent via callbacks.
 */
export function createJustifModalManager(container, {
  sesionId,
  claseId,
  fechaHoy,
  maestroId,
  supabase,
  guardarJustificacion,
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

  const modal = createJustificacionModal(document.body, {
    onDelete: async ({ alumnoId, justificacionId, existingUrl }) => {
      if (destroyed) return
      if (existingUrl) {
        const match = existingUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
        if (match) {
          supabase.storage.from('documentos').remove([match[1]]).catch(() => {})
        }
      }
      if (justificacionId) eliminarJustificacion(justificacionId).catch(console.warn)
      if (onJustifDeleted) onJustifDeleted(alumnoId)
      onRenderLista(alumnoId)
      onUpdateProgress()
      try { await onAutoSave(true) } catch (_e) { console.warn('[justif] autoSave error:', _e) }
      if (onAnnounce) onAnnounce('Justificación eliminada.')
    },

    onSave: async ({ alumnoId, motivo, evidenciaFile, justificacionId, existingUrl, isEdit }) => {
      if (destroyed) return
      const saveBtn = document.getElementById('pm-justif-save')
      if (saveBtn) saveBtn.disabled = true
      try {
        let savedRecord = null
        if (isEdit && justificacionId) {
          let urlToSave = existingUrl
          if (evidenciaFile) {
            if (existingUrl) {
              const match = existingUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
              if (match) {
                await supabase.storage.from('documentos').remove([match[1]]).catch(() => {})
              }
            }
            const ext = evidenciaFile.name.split('.').pop()
            const path = `justificaciones/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const { data: uploadData } = await supabase.storage
              .from('documentos')
              .upload(path, evidenciaFile)
              .catch(() => ({ data: null }))
            if (uploadData) {
              const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(uploadData.path)
              urlToSave = urlData.publicUrl
            }
          }
          const { data, error } = await supabase
            .from('justificaciones')
            .update({ motivo, evidencia_url: urlToSave })
            .eq('id', justificacionId)
            .select()
            .single()
          if (error) throw error
          savedRecord = data
        } else {
          if (!sesionId) await onAutoSave(true, false)
          const result = await guardarJustificacion(
            { sesionId, alumnoId, claseId, fecha: fechaHoy, motivo, creadoPor: maestroId },
            evidenciaFile,
          )
          if (result.error) throw result.error
          savedRecord = result.data
        }
        if (savedRecord && onJustifSaved) onJustifSaved(alumnoId, savedRecord)
        if (!destroyed) modal.close()
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
