/**
 * createRouteTopicAutoInjector
 * Inyecta un tema de ruta en el editor DSL y muestra un banner.
 */
export function createRouteTopicAutoInjector(container, { editor, toolbar }) {
  // consumeRutaTema se importa inline para evitar dependencia circular
  let destroyed = false

  return {
    inject(rutaTema, claseId) {
      if (destroyed || !rutaTema || rutaTema.claseId !== claseId) return

      const temaText = `[${rutaTema.nombre}] `
      editor.insertText(temaText)
      toolbar.setContext({ indicadorActivo: rutaTema.nombre })

      const obsBtn = container.querySelector('#btn-guardar-obs')
      if (obsBtn) obsBtn.style.display = ''

      const editorContainer = container.querySelector('#pm-dsl-editor-container')
      if (editorContainer) {
        const existing = editorContainer.parentElement.querySelector('.pm-ruta-tema-banner')
        if (existing) existing.remove()

        const banner = document.createElement('div')
        banner.className = 'pm-ruta-tema-banner'
        banner.style.cssText = `
          background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;
          padding:8px 12px;margin-bottom:8px;font-size:12px;color:#1d4ed8;
          display:flex;align-items:center;gap:8px;
        `
        banner.innerHTML = `
          <i class="bi bi-diagram-3"></i>
          Tema cargado desde Ruta: <strong>${rutaTema.nombre.replace(/</g, '&lt;')}</strong>
          <button onclick="this.parentElement.remove()" style="
            margin-left:auto;background:none;border:none;cursor:pointer;
            font-size:12px;color:#1d4ed8;
          ">✕</button>
        `
        editorContainer.parentElement.insertBefore(banner, editorContainer)
      }
    },
    destroy() {
      destroyed = true
    },
  }
}
