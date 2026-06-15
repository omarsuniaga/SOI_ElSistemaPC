import { createDslEditor } from '../dslEditor.js'
import { createDslToolbar } from '../dslToolbar.js'

export function createDslSection(container, opts) {
  const toolbarContainer = container.querySelector('#pm-dsl-toolbar-container')
  const editorContainer = container.querySelector('#pm-dsl-editor-container')

  let toolbar = null

  const editor = createDslEditor(editorContainer, {
    initialContent: opts.initialContent || '',
    onChange: (value) => {
      opts.onEditorChange?.(value)
    },
  })

  editor.setContext({ claseId: opts.claseId })

  function initToolbar(toolbarCallbacks) {
    toolbar = createDslToolbar(toolbarContainer, {
      onInsert: (text, cursorOffset, triggerAC) => editor.insertText(text, cursorOffset, triggerAC),
      getEditorContent: () => editor.getValue(),
      onLoading: () => {},
      onIaProposal: (proposal) => toolbarCallbacks.onIaProposal?.(proposal),
      onImproveClick: (text) => toolbarCallbacks.onImproveClick?.(text),
      onStructureClick: (text) => toolbarCallbacks.onStructureClick?.(text),
      onAnalyzeClick: (text) => toolbarCallbacks.onAnalyzeClick?.(text),
    })
  }

  function destroy() {
    if (toolbar) toolbar.destroy()
    editor.destroy()
  }

  return {
    getEditor: () => editor,
    getToolbar: () => toolbar,
    getValue: () => editor.getValue(),
    setValue: (text) => editor.setValue(text),
    setContext: (ctx) => editor.setContext(ctx),
    initToolbar,
    destroy,
  }
}
