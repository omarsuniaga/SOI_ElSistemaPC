import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderPublishWizard } from '../components/PublishWizard.js';

function makeContainer() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

function cleanup(container) {
  document.body.removeChild(container);
}

describe('PublishWizard', () => {
  let container;

  beforeEach(() => {
    container = makeContainer();
  });

  afterEach(() => {
    cleanup(container);
  });

  // Test 1: Stage indicators — correct active/done classes
  it('renders stage indicators with correct active/done classes for each estado', () => {
    // borrador: first stage active, none done
    renderPublishWizard(container, {
      estadoActual: 'borrador', isAdmin: false, feedback: [],
      onEstadoChange: vi.fn(), onFeedbackAdd: vi.fn(),
    });
    const stages = container.querySelectorAll('.pw-stage');
    expect(stages[0].classList.contains('pw-stage--active')).toBe(true);
    expect(stages[1].classList.contains('pw-stage--active')).toBe(false);
    expect(stages[1].classList.contains('pw-stage--done')).toBe(false);

    // revision: first done, second active
    renderPublishWizard(container, {
      estadoActual: 'revision', isAdmin: false, feedback: [],
      onEstadoChange: vi.fn(), onFeedbackAdd: vi.fn(),
    });
    const stages2 = container.querySelectorAll('.pw-stage');
    expect(stages2[0].classList.contains('pw-stage--done')).toBe(true);
    expect(stages2[1].classList.contains('pw-stage--active')).toBe(true);

    // publicado: first two done, third active
    renderPublishWizard(container, {
      estadoActual: 'publicado', isAdmin: false, feedback: [],
      onEstadoChange: vi.fn(), onFeedbackAdd: vi.fn(),
    });
    const stages3 = container.querySelectorAll('.pw-stage');
    expect(stages3[0].classList.contains('pw-stage--done')).toBe(true);
    expect(stages3[1].classList.contains('pw-stage--done')).toBe(true);
    expect(stages3[2].classList.contains('pw-stage--active')).toBe(true);
  });

  // Test 2: Only the correct panel is visible
  it('only shows the panel matching estadoActual', () => {
    for (const estado of ['borrador', 'revision', 'publicado']) {
      renderPublishWizard(container, {
        estadoActual: estado, isAdmin: true, feedback: [],
        onEstadoChange: vi.fn(), onFeedbackAdd: vi.fn(),
      });
      const panels = container.querySelectorAll('.pw-panel');
      panels.forEach(panel => {
        if (panel.dataset.panel === estado) {
          expect(panel.hasAttribute('hidden')).toBe(false);
        } else {
          expect(panel.hasAttribute('hidden')).toBe(true);
        }
      });
    }
  });

  // Test 3: "Enviar a revisión" calls onEstadoChange('revision')
  it('calls onEstadoChange("revision") when "Enviar a revisión" is clicked', () => {
    const onEstadoChange = vi.fn();
    renderPublishWizard(container, {
      estadoActual: 'borrador', isAdmin: false, feedback: [],
      onEstadoChange, onFeedbackAdd: vi.fn(),
    });
    container.querySelector('.pw-send-revision-btn').click();
    expect(onEstadoChange).toHaveBeenCalledWith('revision');
  });

  // Test 4: Approve button only renders when isAdmin is true
  it('does not render approve button when isAdmin is false', () => {
    renderPublishWizard(container, {
      estadoActual: 'revision', isAdmin: false, feedback: [],
      onEstadoChange: vi.fn(), onFeedbackAdd: vi.fn(),
    });
    expect(container.querySelector('.pw-approve-btn')).toBeNull();
  });

  it('renders approve button when isAdmin is true', () => {
    renderPublishWizard(container, {
      estadoActual: 'revision', isAdmin: true, feedback: [],
      onEstadoChange: vi.fn(), onFeedbackAdd: vi.fn(),
    });
    expect(container.querySelector('.pw-approve-btn')).not.toBeNull();
  });

  // Test 5: Approve button calls onEstadoChange('publicado')
  it('calls onEstadoChange("publicado") when approve button is clicked', () => {
    const onEstadoChange = vi.fn();
    renderPublishWizard(container, {
      estadoActual: 'revision', isAdmin: true, feedback: [],
      onEstadoChange, onFeedbackAdd: vi.fn(),
    });
    container.querySelector('.pw-approve-btn').click();
    expect(onEstadoChange).toHaveBeenCalledWith('publicado');
  });

  // Test 6: Adding feedback calls onFeedbackAdd with correct object
  it('calls onFeedbackAdd with { comentario, tipo: "observacion" } and clears input', () => {
    const onFeedbackAdd = vi.fn();
    renderPublishWizard(container, {
      estadoActual: 'revision', isAdmin: false, feedback: [],
      onEstadoChange: vi.fn(), onFeedbackAdd,
    });
    const input = container.querySelector('.pw-feedback-input');
    input.value = 'Revisar el horario del lunes';
    container.querySelector('.pw-add-feedback-btn').click();
    expect(onFeedbackAdd).toHaveBeenCalledWith({
      comentario: 'Revisar el horario del lunes',
      tipo: 'observacion',
    });
    expect(input.value).toBe('');
  });

  it('does not call onFeedbackAdd when input is empty', () => {
    const onFeedbackAdd = vi.fn();
    renderPublishWizard(container, {
      estadoActual: 'revision', isAdmin: false, feedback: [],
      onEstadoChange: vi.fn(), onFeedbackAdd,
    });
    container.querySelector('.pw-feedback-input').value = '   ';
    container.querySelector('.pw-add-feedback-btn').click();
    expect(onFeedbackAdd).not.toHaveBeenCalled();
  });

  // Test XSS: malicious feedback is escaped, not executed
  it('does not render script tags from malicious feedback as HTML', () => {
    const container = document.createElement('div');
    renderPublishWizard(container, {
      runId: 'r1',
      estadoActual: 'revision',
      isAdmin: false,
      feedback: [{ tipo: 'observacion', comentario: '<script>window.__xss=1</script>' }],
      onEstadoChange: vi.fn(),
      onFeedbackAdd: vi.fn()
    });
    expect(window.__xss).toBeUndefined();
    expect(container.querySelector('.pw-feedback-list').innerHTML).not.toContain('<script>');
  });

  // Test 7: Feedback list renders all passed feedback items
  it('renders all feedback items in the list', () => {
    const feedback = [
      { tipo: 'observacion', comentario: 'Falta completar viernes' },
      { tipo: 'aprobacion', comentario: 'Todo correcto' },
    ];
    renderPublishWizard(container, {
      estadoActual: 'revision', isAdmin: false, feedback,
      onEstadoChange: vi.fn(), onFeedbackAdd: vi.fn(),
    });
    const items = container.querySelectorAll('.pw-feedback-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('observacion');
    expect(items[0].textContent).toContain('Falta completar viernes');
    expect(items[1].textContent).toContain('aprobacion');
    expect(items[1].textContent).toContain('Todo correcto');
  });
});
