/**
 * Componente: toolbarHelpModal
 * Muestra ayuda interactiva sobre cada botón de la toolbar DSL.
 *
 * @param {HTMLElement} parentContainer
 * @param {{ }} options (currently empty)
 */
export function createToolbarHelpModal(parentContainer, options = {}) {
  let modalEl = document.getElementById('pm-toolbar-help-modal')

  // Definición de herramientas con ayuda detallada
  const TOOLBAR_HELP = [
    {
      icon: '👤',
      label: '#',
      title: 'Alumno',
      description: 'Etiqueta a un alumno individual para mencionar anotaciones específicas.\nEjemplo: #María, #Pedro'
    },
    {
      icon: '📚',
      label: '[ ]',
      title: 'Contenido',
      description: 'Marca el contenido o tema abordado en la clase.\nEjemplo: [Escala Do Mayor], [Ritmo de negra]'
    },
    {
      icon: '💡',
      label: '( )',
      title: 'Sugerencia',
      description: 'Anotación de mejora o sugerencia pedagógica para un alumno.\nEjemplo: (Mejorar postura), (Practicar digitación)'
    },
    {
      icon: '📝',
      label: '{ }',
      title: 'Tarea',
      description: 'Tarea o asignación para completar fuera de clase.\nEjemplo: {Practicar 20 minutos}, {Estudiar técnica respiratoria}'
    },
    {
      icon: '🎯',
      label: '$',
      title: 'Medida',
      description: 'Término técnico o medida relacionada con la clase.\nEjemplo: $vibrato, $legato, $tempo'
    },
    {
      icon: '🎓',
      label: '>',
      title: 'Objetivo',
      description: 'Objetivo curricular o meta alcanzada en la sesión.\nEjemplo: >Reconocer acordes mayores'
    },
    {
      icon: '/',
      label: '/',
      title: 'Snippets',
      description: 'Plantillas rápidas de texto común. Presiona "/" para ver opciones disponibles.\nEjemplo: /audición, /técnica'
    },
    {
      icon: '✨',
      label: '✨',
      title: 'Mejorar',
      description: 'Usa IA para mejorar gramática, claridad y perspectiva pedagógica del texto.\nEjemplo: "María no entiende" → "María requiere más práctica en acordes"'
    },
    {
      icon: '🚀',
      label: '🚀',
      title: 'Estructurar',
      description: 'Convierte texto libre a estructura DSL automáticamente usando IA.\nEjemplo: "María no entendió los acordes" → "#María [acordes] (Requiere práctica)"'
    }
  ]

  if (!modalEl) {
    modalEl = document.createElement('div')
    modalEl.id = 'pm-toolbar-help-modal'
    modalEl.className = 'pm-modal-overlay'
    modalEl.innerHTML = `
      <div class="pm-modal-content pm-help-content">
        <div class="pm-modal-header" style="background: rgba(59, 130, 246, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">❓ Ayuda - Toolbar DSL</h3>
          <button class="pm-modal-close" id="pm-help-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-help-body">
          <div class="pm-help-grid">
            ${TOOLBAR_HELP.map((tool, idx) => `
              <div class="pm-help-card" data-index="${idx}">
                <div class="pm-help-icon">${tool.icon}</div>
                <div class="pm-help-content-inner">
                  <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 700;">${tool.title}</h4>
                  <p style="margin: 0; font-size: 0.85rem; color: var(--pm-text-muted); line-height: 1.4; white-space: pre-wrap;">${tool.description}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem; justify-content: flex-end;">
            <button class="pm-btn pm-btn-primary" id="pm-help-close-btn" style="flex: auto;">Entendido</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modalEl)

    // Add styles if not present
    if (!document.getElementById('pm-help-modal-styles')) {
      const style = document.createElement('style')
      style.id = 'pm-help-modal-styles'
      style.textContent = `
        .pm-help-content {
          max-width: 800px;
          width: 90vw;
        }

        .pm-help-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pm-help-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .pm-help-card {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--pm-surface-2);
          border: 1px solid var(--pm-border);
          border-radius: var(--pm-radius-sm);
          transition: all 0.2s ease;
          cursor: default;
        }

        .pm-help-card:hover {
          border-color: var(--pm-primary);
          background: var(--pm-surface);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
        }

        .pm-help-icon {
          font-size: 2rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .pm-help-content-inner {
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 600px) {
          .pm-help-grid {
            grid-template-columns: 1fr;
          }
        }
      `
      document.head.appendChild(style)
    }
  }

  function open() {
    modalEl.classList.add('open')
  }

  function close() {
    modalEl.classList.remove('open')
  }

  modalEl.querySelector('#pm-help-close').onclick = close
  modalEl.querySelector('#pm-help-close-btn').onclick = close

  return { open, close }
}
