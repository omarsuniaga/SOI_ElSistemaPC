/**
 * procedimientosHelpModal.js — Guía Interactiva y Centro de Ayuda para Procedimientos SOI
 */

import { AppModal } from '../../../shared/components/AppModal.js'

export function openProcedimientosHelpModal() {
  const body = `
    <div class="vstack gap-4">
      <!-- 1. Propósito Central -->
      <div class="p-3 rounded-3 bg-primary-subtle border border-primary-subtle">
        <div class="d-flex gap-2 align-items-start">
          <i class="bi bi-lightbulb-fill text-primary fs-4 mt-1"></i>
          <div>
            <h6 class="fw-bold mb-1 text-primary">¿Para qué sirve esta pantalla?</h6>
            <p class="small mb-0 text-body">
              Esta es la <strong>Torre de Control Institucional</strong>. Aquí no gestionas notas aisladas; transformas los reglamentos y procesos del Sistema en <strong>Expedientes Digitales</strong> que asignan tareas automáticas a los 8 departamentos (Académica, Finanzas, Lutería, Administración, etc.).
            </p>
          </div>
        </div>
      </div>

      <!-- 2. Los 4 Pasos del Flujo -->
      <div>
        <h6 class="fw-bold mb-3"><i class="bi bi-123 text-primary me-2"></i>Cómo usar esta herramienta en 4 pasos simples:</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="border rounded-3 p-3 h-100 bg-body shadow-sm">
              <div class="fw-bold text-primary mb-1">
                <span class="badge bg-primary me-1">1</span> Elegir un Contrato SOI
              </div>
              <p class="small text-muted mb-0">
                En la sección <em>"Contratos SOI Ejecutables"</em>, elige qué procedimiento quieres iniciar (ej. <strong>Asistencia y contenido</strong>, <strong>Inscripción</strong> o <strong>Lutería</strong>).
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="border rounded-3 p-3 h-100 bg-body shadow-sm">
              <div class="fw-bold text-primary mb-1">
                <span class="badge bg-primary me-1">2</span> Abrir el Expediente
              </div>
              <p class="small text-muted mb-0">
                Pulsa <strong>"Abrir Caso"</strong>. El sistema auditará la base de datos viva y repartirá las tareas automáticas a cada departamento responsable.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="border rounded-3 p-3 h-100 bg-body shadow-sm">
              <div class="fw-bold text-primary mb-1">
                <span class="badge bg-primary me-1">3</span> Monitorear el Avance
              </div>
              <p class="small text-muted mb-0">
                Observa las tarjetas de casos: la barra de progreso te muestra el porcentaje completado y el semáforo rojo te avisa si hay tareas bloqueadas.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="border rounded-3 p-3 h-100 bg-body shadow-sm">
              <div class="fw-bold text-primary mb-1">
                <span class="badge bg-primary me-1">4</span> Revisar y Concluir
              </div>
              <p class="small text-muted mb-0">
                Pulsa <strong>"Ver Expediente"</strong> para ver los documentos adjuntos. Cuando todo esté al 100%, pulsa <strong>"Concluir Caso"</strong> para archivar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Glosario Rápido -->
      <div>
        <h6 class="fw-bold mb-2"><i class="bi bi-book text-primary me-2"></i>Glosario Rápido de Conceptos</h6>
        <ul class="list-group list-group-flush small">
          <li class="list-group-item bg-transparent px-0 py-2">
            <strong>Contrato SOI:</strong> Es la plantilla oficial o reglamento que describe qué tareas deben cumplirse y quién es el responsable.
          </li>
          <li class="list-group-item bg-transparent px-0 py-2">
            <strong>Expediente (Caso):</strong> Es una ejecución real de un contrato (ej. la inscripción de este mes). Tiene fecha, responsable y código único.
          </li>
          <li class="list-group-item bg-transparent px-0 py-2">
            <strong>Alumno en Riesgo:</strong> Botón de emergencia para cuando un estudiante falta mucho o tiene problemas graves; dispara alertas a Académica, Comunicaciones y Dirección al mismo tiempo.
          </li>
        </ul>
      </div>
    </div>
  `

  AppModal.open({
    title: '<i class="bi bi-question-circle-fill text-primary me-2"></i>Guía Rápida: Procedimientos Institucionales',
    body,
    saveText: '¡Entendido!',
    hideSave: false,
    size: 'lg',
    onSave: () => true,
  })
}
