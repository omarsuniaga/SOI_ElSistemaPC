/**
 * Componente: JustificacionModal
 * Modal para capturar/el motivo de una inasistencia justificada con evidencia opcional.
 * Soporta crear nueva justificación y editar una existente.
 * 
 * @param {HTMLElement} parentContainer 
 * @param {{ onSave: Function }} options 
 * @returns {Object} API del componente
 */
export function createJustificacionModal(parentContainer, { onSave, onCancel }) {
  let modalEl = document.getElementById('pm-justif-modal');

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'pm-justif-modal';
    modalEl.className = 'pm-justif-modal-overlay';
    modalEl.innerHTML = `
      <div class="pm-justif-backdrop"></div>
      <div class="pm-justif-modal">
        <div class="pm-justif-header">
          <div class="pm-justif-header-content">
            <div class="pm-justif-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h2 class="pm-justif-title" id="pm-justif-title">Justificar Inasistencia</h2>
              <p class="pm-justif-subtitle" id="pm-justif-subtitle">Registra el motivo de la ausencia</p>
            </div>
          </div>
          <button class="pm-justif-close" id="pm-justif-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="pm-justif-body">
          <p id="pm-justif-alumno-nombre" class="pm-justif-alumno"></p>
          
          <div class="pm-justif-field">
            <label for="pm-justif-motivo">Motivo de la ausencia *</label>
            <textarea id="pm-justif-motivo" rows="3" 
              placeholder="Ej: Certificado médico, cita médica, viaje familiar, motivo personal..."></textarea>
            <span class="pm-justif-hint">Describe el motivo de la inasistencia</span>
          </div>
          
          <div class="pm-justif-field">
            <label>Evidencia (Opcional)</label>
            <div class="pm-justif-file-area" id="pm-justif-file-area">
              <input type="file" id="pm-justif-file" class="pm-justif-file-input" accept="image/*" capture="environment" />
              <div class="pm-justif-file-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Adjuntar foto del justificante</span>
              </div>
              <div class="pm-justif-file-preview" id="pm-justif-file-preview" style="display:none;">
                <img id="pm-justif-preview-img" src="" alt="Vista previa" />
                <button class="pm-justif-remove-file" id="pm-justif-remove-file" type="button">×</button>
              </div>
            </div>
            <span class="pm-justif-hint">Ej: foto del certificado médico</span>
          </div>
        </div>
        
        <div class="pm-justif-footer">
          <button class="pm-justif-cancel" id="pm-justif-cancel">Cancelar</button>
          <button class="pm-justif-save" id="pm-justif-save">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span id="pm-justif-btn-text">Guardar Justificación</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    // Estilos del modal
    if (!document.getElementById('pm-justif-styles')) {
      const style = document.createElement('style');
      style.id = 'pm-justif-styles';
      style.textContent = `
        .pm-justif-modal-overlay {
          position: fixed;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .pm-justif-modal-overlay.open {
          display: flex;
          opacity: 1;
        }
        .pm-justif-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        }
        .pm-justif-modal {
          position: relative;
          background: var(--pm-surface);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95) translateY(10px);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .pm-justif-modal-overlay.open .pm-justif-modal {
          transform: scale(1) translateY(0);
        }
        .pm-justif-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.25rem 1.25rem 0.75rem;
          background: var(--pm-surface-2);
          border-bottom: 1px solid var(--pm-border);
        }
        .pm-justif-header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .pm-justif-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .pm-justif-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--pm-text);
          margin: 0;
        }
        .pm-justif-subtitle {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.2rem 0 0;
        }
        .pm-justif-close {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--pm-surface-2);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pm-text-muted);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .pm-justif-close:hover {
          background: var(--pm-border);
          color: var(--pm-text);
        }
        .pm-justif-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
        }
        .pm-justif-alumno {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--pm-primary);
          margin: 0 0 1rem;
          padding: 0.5rem 0.75rem;
          background: rgba(59, 130, 246, 0.08);
          border-radius: 8px;
          border-left: 3px solid var(--pm-primary);
        }
        .pm-justif-field {
          margin-bottom: 1rem;
        }
        .pm-justif-field:last-child {
          margin-bottom: 0;
        }
        .pm-justif-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.35rem;
        }
        .pm-justif-field textarea {
          width: 100%;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--pm-text);
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          min-height: 70px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pm-justif-field textarea:focus {
          outline: none;
          border-color: var(--pm-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .pm-justif-hint {
          display: block;
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          margin-top: 0.25rem;
        }
        .pm-justif-file-area {
          position: relative;
          border: 2px dashed var(--pm-border);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pm-justif-file-area:hover {
          border-color: var(--pm-primary);
          background: rgba(59, 130, 246, 0.05);
        }
        .pm-justif-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .pm-justif-file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--pm-text-muted);
        }
        .pm-justif-file-placeholder svg {
          opacity: 0.5;
        }
        .pm-justif-file-placeholder span {
          font-size: 0.8rem;
        }
        .pm-justif-file-preview {
          position: relative;
        }
        .pm-justif-file-preview img {
          max-width: 100%;
          max-height: 120px;
          border-radius: 8px;
          object-fit: cover;
        }
        .pm-justif-remove-file {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: var(--pm-danger);
          color: white;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-justif-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
        }
        .pm-justif-cancel {
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--pm-text);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pm-justif-cancel:hover {
          background: var(--pm-border);
        }
        .pm-justif-save {
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pm-justif-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
        }
        @media (max-width: 480px) {
          .pm-justif-modal {
            max-width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Estado interno
  let _currentAlumno = null;
  let _currentJustificacion = null;
  let _currentFile = null;         // File object para Storage
  let _previewUrl = null;          // URL temporal para preview
  let _isEditing = false;
  let _prevEstado = null;          // Estado anterior para rollback en cancel

  // Referencias DOM
  const titleEl = modalEl.querySelector('#pm-justif-title');
  const subtitleEl = modalEl.querySelector('#pm-justif-subtitle');
  const btnTextEl = modalEl.querySelector('#pm-justif-btn-text');
  const nombreLabel = modalEl.querySelector('#pm-justif-alumno-nombre');
  const motivoInput = modalEl.querySelector('#pm-justif-motivo');
  const fileInput = modalEl.querySelector('#pm-justif-file');
  const filePlaceholder = modalEl.querySelector('.pm-justif-file-placeholder');
  const filePreview = modalEl.querySelector('.pm-justif-file-preview');
  const previewImg = modalEl.querySelector('#pm-justif-preview-img');
  const removeBtn = modalEl.querySelector('#pm-justif-remove-file');

  /**
   * Abre el modal para crear o editar una justificación
   * @param {Object} alumno - Datos del alumno { id, nombre_completo }
   * @param {Object|null} justificacionExistente - Datos existentes (null = crear nuevo)
   */
  function open(alumno, justificacionExistente = null, prevEstado = null) {
    _currentAlumno = alumno;
    _currentJustificacion = justificacionExistente;
    _currentFile = null;
    _previewUrl = null;
    _isEditing = !!justificacionExistente;
    _prevEstado = prevEstado;  // null = crear, 'J' = editar

    // Actualizar título según modo
    if (_isEditing) {
      titleEl.textContent = 'Editar Justificación';
      subtitleEl.textContent = 'Modifica el motivo de la inasistencia';
      btnTextEl.textContent = 'Actualizar';
    } else {
      titleEl.textContent = 'Justificar Inasistencia';
      subtitleEl.textContent = 'Registra el motivo de la ausencia';
      btnTextEl.textContent = 'Guardar Justificación';
    }

    // Pre-llenar datos
    nombreLabel.textContent = alumno.nombre_completo;
    motivoInput.value = justificacionExistente?.motivo || '';
    
    // Manejar evidencia existente (Storage URL o base64 legacy)
    const existingUrl = justificacionExistente?.evidencia_url || justificacionExistente?.evidencia_base64;
    if (existingUrl) {
      _previewUrl = existingUrl;
      previewImg.src = existingUrl;
      filePlaceholder.style.display = 'none';
      filePreview.style.display = 'block';
    } else {
      _previewUrl = null;
      filePlaceholder.style.display = 'flex';
      filePreview.style.display = 'none';
    }
    
    fileInput.value = '';
    
    modalEl.classList.add('open');
    motivoInput.focus();
  }

  function close(cancelled = false) {
    if (cancelled && onCancel && _currentAlumno && _prevEstado !== null) {
      onCancel(_currentAlumno.id, _prevEstado);
    }
    modalEl.classList.remove('open');
    _currentAlumno = null;
    _currentJustificacion = null;
    _currentFile = null;
    _previewUrl = null;
    _prevEstado = null;
  }

  // Eventos
  modalEl.querySelector('#pm-justif-close').onclick = () => close(true);
  modalEl.querySelector('#pm-justif-cancel').onclick = () => close(true);
  
  // Click en backdrop cierra (se considera cancelar)
  modalEl.querySelector('.pm-justif-backdrop').onclick = () => close(true);

  // Preview de imagen (File para Storage + URL temporal para preview)
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      _currentFile = file;
      _previewUrl = URL.createObjectURL(file);
      previewImg.src = _previewUrl;
      filePlaceholder.style.display = 'none';
      filePreview.style.display = 'block';
    }
  };

  // Eliminar archivo
  removeBtn.onclick = () => {
    if (_previewUrl && !(_currentJustificacion?.evidencia_url || _currentJustificacion?.evidencia_base64)) {
      URL.revokeObjectURL(_previewUrl);
    }
    _currentFile = null;
    _previewUrl = null;
    fileInput.value = '';
    filePlaceholder.style.display = 'flex';
    filePreview.style.display = 'none';
  };

  // Guardar — pasa el File object en vez de base64
  modalEl.querySelector('#pm-justif-save').onclick = () => {
    const motivo = motivoInput.value.trim();
    
    if (!motivo) {
      motivoInput.focus();
      motivoInput.style.borderColor = 'var(--pm-danger)';
      setTimeout(() => {
        motivoInput.style.borderColor = '';
      }, 2000);
      return;
    }

    if (onSave && _currentAlumno) {
      onSave({
        alumnoId: _currentAlumno.id,
        motivo,
        evidenciaFile: _currentFile,          // File object para Storage
        evidenciaPreview: _previewUrl,        // URL temporal para mostrar
        justificacionId: _currentJustificacion?.id || null,
        existingUrl: _currentJustificacion?.evidencia_url || _currentJustificacion?.evidencia_base64 || null,
        isEdit: _isEditing,
      });
    }
  };

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return { open, close };
}
