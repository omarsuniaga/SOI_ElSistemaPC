import { createAutoDraft, saveDraft, loadDraft, discardDraft } from '../../services/autoDraftService.js'

/**
 * createAutoDraftManager
 * Maneja auto-draft del editor con recovery de borradores.
 */
export function createAutoDraftManager(container, {
  sesionId,
  maestroId,
  editor,
  sesionExistenteData,
  onDraftRecovered,
}) {
  if (!sesionId) return { destroy() {} }

  let autoDraft = null
  let destroyed = false

  const draftIndicator = container.querySelector('#pm-draft-indicator')

  autoDraft = createAutoDraft({
    saveFn: async (content) => {
      if (!sesionId || destroyed) return
      await saveDraft(sesionId, maestroId, content)
    },
    debounceMs: 30000,
  })

  autoDraft.onSaved(() => {
    if (destroyed || !draftIndicator) return
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    draftIndicator.textContent = `Borrador guardado ${hh}:${mm}`
    draftIndicator.style.display = ''
  })

  const editorEditable = container.querySelector('#pm-dsl-editable')
  if (editorEditable) {
    const origHandler = editorEditable.oninput
    editorEditable.oninput = function (e) {
      if (origHandler) origHandler.call(this, e)
      if (autoDraft && !destroyed) autoDraft.onInput(editor.getValue())
    }
  }

  if (sesionExistenteData?.borrador === true) {
    loadDraft(sesionId, maestroId)
      .then((draft) => {
        if (destroyed) return
        if (draft && draft.contenido_raw && draft.contenido_raw.trim()) {
          const ts = draft.updated_at
            ? new Date(draft.updated_at).toLocaleString('es-AR')
            : ''
          const recover = confirm(
            `Hay un borrador guardado${ts ? ` (${ts})` : ''}.\n\n¿Deseas recuperarlo?`,
          )
          if (recover) {
            if (onDraftRecovered) onDraftRecovered(draft.contenido_raw)
          } else {
            discardDraft(draft.id).catch((err) =>
              console.warn('[autoDraft] Error discarding:', err),
            )
          }
        }
      })
      .catch((err) => console.warn('[autoDraft] Error loading draft:', err))
  }

  return {
    destroy() {
      destroyed = true
      if (autoDraft) autoDraft.destroy()
    },
  }
}
