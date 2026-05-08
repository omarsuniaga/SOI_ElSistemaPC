/**
 * Componente: JustificacionModal
 * Modal para capturar el motivo de una inasistencia justificada y una imagen opcional.
 * 
 * @param {HTMLElement} parentContainer 
 * @param {{ onSave: Function }} options 
 * @returns {Object} API del componente
 */
export function createJustificacionModal(parentContainer, { onSave }) {
  let modalEl = document.getElementById('pm-justif-modal');

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'pm-justif-modal';
    modalEl.className = 'pm-modal-overlay';
    modalEl.innerHTML = `
      <div class="pm-modal-content">
        <div class="pm-modal-header">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Justificar Inasistencia</h3>
          <button class="pm-modal-close" id="pm-justif-close">&times;</button>
        </div>
        <div class="pm-modal-body">
          <p id="pm-justif-alumno-nombre" style="font-weight: 600; margin-bottom: 1rem; color: var(--pm-primary);"></p>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--pm-text-muted); margin-bottom: 0.35rem;">Motivo</label>
            <textarea id="pm-justif-motivo" class="pm-input" rows="3" placeholder="Ej: Certificado médico, viaje familiar..."></textarea>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--pm-text-muted); margin-bottom: 0.35rem;">Evidencia (Opcional)</label>
            <input type="file" id="pm-justif-file" class="pm-input" accept="image/*" capture="environment" />
            <small style="display: block; margin-top: 0.25rem; color: var(--pm-text-muted); font-size: 0.7rem;">Puedes tomar una foto del certificado.</small>
          </div>

          <button class="pm-btn pm-btn-primary" id="pm-justif-save">Guardar Justificación</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    // Estilos del modal
    if (!document.getElementById('pm-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'pm-modal-styles';
      style.textContent = `
        .pm-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
          backdrop-filter: blur(4px);
        }
        .pm-modal-overlay.open { display: flex; }
        
        .pm-modal-content {
          background: var(--pm-surface);
          width: 100%;
          max-width: 400px;
          border-radius: var(--pm-radius);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          overflow: hidden;
          animation: pm-modal-in 0.2s ease-out;
        }
        
        @keyframes pm-modal-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .pm-modal-header {
          padding: 1rem;
          border-bottom: 1px solid var(--pm-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .pm-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--pm-text-muted);
        }
        
        .pm-modal-body {
          padding: 1rem;
        }
      `;
      document.head.appendChild(style);
    }
  }

  let _currentAlumno = null;
  let _currentFileBase64 = null;

  const motivoInput = modalEl.querySelector('#pm-justif-motivo');
  const fileInput   = modalEl.querySelector('#pm-justif-file');
  const nombreLabel = modalEl.querySelector('#pm-justif-alumno-nombre');

  function open(alumno) {
    _currentAlumno = alumno;
    _currentFileBase64 = null;
    nombreLabel.textContent = alumno.nombre_completo;
    motivoInput.value = '';
    fileInput.value = '';
    modalEl.classList.add('open');
  }

  function close() {
    modalEl.classList.remove('open');
  }

  // Eventos
  modalEl.querySelector('#pm-justif-close').onclick = close;

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        _currentFileBase64 = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  modalEl.querySelector('#pm-justif-save').onclick = () => {
    if (onSave && _currentAlumno) {
      onSave({
        alumnoId: _currentAlumno.id,
        motivo: motivoInput.value.trim(),
        evidencia: _currentFileBase64
      });
    }
    close();
  };

  return { open, close };
}
