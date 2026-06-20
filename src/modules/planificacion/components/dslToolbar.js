import { createDslEditor } from './dslEditor.js'

export function createDslToolbar(options = {}) {
  const {
    onAlumnoClick = null,
    onGrabarClick = null,
    onEnriquecerClick = null,
    editor = null,
  } = options

  const toolbar = document.createElement('div')
  toolbar.className = 'dsl-toolbar btn-group btn-group-sm me-2'

  const buttons = [
    {
      id: 'alumno',
      icon: '#',
      label: 'Alumno',
      title: 'Insertar mention de alumno',
      className: 'btn btn-outline-primary',
      action: () => {
        if (onAlumnoClick) {
          onAlumnoClick(editor)
        } else if (editor) {
          editor.insertAtCursor('#', '')
        }
      },
    },
    {
      id: 'contenido',
      icon: '[]',
      label: 'Contenido',
      title: 'Insertar contenido',
      className: 'btn btn-outline-success',
      action: () => {
        if (editor) {
          editor.insertAtCursor('[', ']')
        }
      },
    },
    {
      id: 'sugerencia',
      icon: '()',
      label: 'Sugerencia',
      title: 'Insertar sugerencia',
      className: 'btn btn-outline-warning',
      action: () => {
        if (editor) {
          editor.insertAtCursor('(', ')')
        }
      },
    },
    {
      id: 'tarea',
      icon: '{}',
      label: 'Tarea',
      title: 'Insertar tarea',
      className: 'btn btn-outline-purple',
      action: () => {
        if (editor) {
          editor.insertAtCursor('{', '}')
        }
      },
    },
    {
      id: 'medida',
      icon: '$',
      label: 'Medida',
      title: 'Insertar medida técnica',
      className: 'btn btn-outline-info',
      action: () => {
        if (editor) {
          editor.insertAtCursor('$', '')
        }
      },
    },
    {
      id: 'calificacion',
      icon: '4/5',
      label: 'Calificación',
      title: 'Insertar calificación',
      className: 'btn btn-outline-danger',
      action: () => {
        if (editor) {
          editor.insertText('4/5')
        }
      },
    },
    {
      id: 'objetivo',
      icon: '>',
      label: 'Objetivo',
      title: 'Insertar referencia a objetivo',
      className: 'btn btn-outline-secondary',
      action: () => {
        if (editor) {
          editor.insertAtCursor('>', '')
        }
      },
    },
    {
      id: 'grabar',
      icon: '🎤',
      label: 'Grabar',
      title: 'Grabar audio (placeholder)',
      className: 'btn btn-outline-dark',
      action: () => {
        if (onGrabarClick) {
          onGrabarClick(editor)
        }
      },
    },
    {
      id: 'enriquecer',
      icon: '✨',
      label: 'IA',
      title: 'Enriquecer con IA (placeholder)',
      className: 'btn btn-outline-dark',
      action: () => {
        if (onEnriquecerClick) {
          onEnriquecerClick(editor)
        }
      },
    },
  ]

  buttons.forEach(btn => {
    const button = document.createElement('button')
    button.className = btn.className
    button.type = 'button'
    button.title = btn.title
    button.innerHTML = `<span class="dsl-toolbar-btn">${btn.icon}</span>`
    button.addEventListener('click', e => {
      e.preventDefault()
      btn.action()
    })
    toolbar.appendChild(button)
  })

  setupToolbarStyles()

  return toolbar
}

function setupToolbarStyles() {
  if (document.getElementById('dsl-toolbar-styles')) return

  const style = document.createElement('style')
  style.id = 'dsl-toolbar-styles'
  style.textContent = `
    .dsl-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .dsl-toolbar .btn {
      font-size: 14px;
      padding: 0.25rem 0.5rem;
      min-width: 36px;
    }

    .dsl-toolbar-btn {
      font-weight: 600;
    }

    .btn-outline-purple {
      color: #9333ea;
      border-color: #9333ea;
      background-color: transparent;
    }

    .btn-outline-purple:hover {
      color: #fff;
      background-color: #9333ea;
    }

    .btn-outline-info {
      color: #6dd5ed;
      border-color: #6dd5ed;
      background-color: transparent;
    }

    .btn-outline-info:hover {
      color: #fff;
      background-color: #0aa3c4;
      border-color: #0aa3c4;
    }
  `
  document.head.appendChild(style)
}

export function createDslEditorWithToolbar(options = {}) {
  const {
    initialContent = '',
    onChange = null,
    onAlumnoClick = null,
    onGrabarClick = null,
    onEnriquecerClick = null,
  } = options

  const wrapper = document.createElement('div')
  wrapper.className = 'dsl-editor-with-toolbar'

  const editor = createDslEditor(initialContent, onChange)

  const toolbar = createDslToolbar({
    onAlumnoClick,
    onGrabarClick,
    onEnriquecerClick,
    editor: editor,
  })

  wrapper.appendChild(toolbar)
  wrapper.appendChild(editor)
  wrapper.container = wrapper

  return wrapper
}