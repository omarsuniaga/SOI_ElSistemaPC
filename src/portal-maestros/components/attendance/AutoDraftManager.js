import { createAutoDraft, saveDraft, loadDraft, discardDraft } from '../../services/autoDraftService.js'

/**
 * createAutoDraftManager
 * Maneja auto-draft del editor con recovery de borradores.
 */
export function createAutoDraftManager(container, {
  sesionId,
  getSesionId,
  maestroId,
  editor,
  sesionExistenteData,
  onDraftRecovered,
}) {
  // El id se consulta en cada guardado, no se captura al montar: el caso normal
  // es que el maestro abra una fecha nueva (todavía sin sesión) y escriba antes
  // de marcar asistencia. La sesión nace recién con el primer autosave de la
  // vista, y el borrador tiene que engancharse a ese id.
  const resolveSesionId = () =>
    typeof getSesionId === 'function' ? getSesionId() : sesionId

  let autoDraft = null
  let destroyed = false

  const draftIndicator = container.querySelector('#pm-draft-indicator')

  autoDraft = createAutoDraft({
    saveFn: async (content) => {
      const id = resolveSesionId()
      if (!id || destroyed) return
      await saveDraft(id, maestroId, content)
    },
    debounceMs: 30000,
  })

  autoDraft.onSaved(() => {
    if (destroyed || !draftIndicator || !resolveSesionId()) return
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

  if (sesionExistenteData?.borrador === true && resolveSesionId()) {
    loadDraft(resolveSesionId(), maestroId)
      .then((draft) => {
        if (destroyed) return
        if (draft && draft.contenido_raw && draft.contenido_raw.trim()) {
          const ts = draft.updated_at
            ? new Date(draft.updated_at).toLocaleString('es-DO')
            : ''
          const recover = confirm(
            `Hay un borrador guardado${ts ? ` (${ts})` : ''}.\n\n¿Desea recuperarlo?`,
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
