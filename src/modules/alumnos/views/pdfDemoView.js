import { descargarFichaDemo, descargarConstanciaDemo, ALUMNO_DEMO } from '../domain/generarPdfInscripcion.js'

export async function renderPdfDemoView(container) {
  container.innerHTML = `
    <div class="container py-4" style="max-width:720px">
      <div class="mb-4">
        <h4 class="mb-1"><i class="bi bi-file-earmark-pdf text-danger me-2"></i>Vista previa de documentos PDF</h4>
        <p class="text-muted small mb-0">Generá los PDFs de inscripción con datos de ejemplo para revisar el diseño antes de usarlos en producción.</p>
      </div>

      <div class="row g-3">

        <!-- Ficha técnica -->
        <div class="col-md-6">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="mb-3">
                <span class="badge bg-primary mb-2">Uso interno</span>
                <h5 class="card-title mb-1">Ficha Técnica del Alumno</h5>
                <p class="card-text text-muted small">
                  Documento completo para carpeta física y Google Drive.
                  Incluye todos los datos del alumno: personales, familia, salud, perfil musical, compromisos y firmas.
                </p>
              </div>
              <ul class="list-unstyled small text-muted mb-4">
                <li><i class="bi bi-check2 text-success me-1"></i>Datos personales y de contacto</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Madre, padre y representante</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Situación social y salud</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Perfil y motivación musical</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Compromisos y firmas</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Watermark "USO INTERNO"</li>
              </ul>
              <button id="btn-demo-ficha" class="btn btn-primary mt-auto">
                <i class="bi bi-download me-2"></i>Descargar ficha demo
              </button>
            </div>
          </div>
        </div>

        <!-- Constancia -->
        <div class="col-md-6">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="mb-3">
                <span class="badge bg-success mb-2">Para el representante</span>
                <h5 class="card-title mb-1">Constancia de Inscripción</h5>
                <p class="card-text text-muted small">
                  Carta formal que recibe el representante al inscribir al alumno.
                  Incluye horario, lista de útiles, pago y links institucionales.
                </p>
              </div>
              <ul class="list-unstyled small text-muted mb-4">
                <li><i class="bi bi-check2 text-success me-1"></i>Carta formal con serial único</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Lista de materiales a retirar</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Pago RD$600 destacado</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Links: horario, reglamento, bienvenida</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Firmas director y representante</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Sello ORIGINAL</li>
              </ul>
              <button id="btn-demo-constancia" class="btn btn-success mt-auto">
                <i class="bi bi-download me-2"></i>Descargar constancia demo
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Datos del alumno demo -->
      <div class="card mt-4 border-0 bg-body-secondary">
        <div class="card-body">
          <h6 class="mb-3 text-muted"><i class="bi bi-person-badge me-2"></i>Datos del alumno de ejemplo</h6>
          <div class="row row-cols-2 row-cols-md-3 g-2 small">
            <div><span class="text-muted">Nombre:</span><br><strong>${ALUMNO_DEMO.nombre_completo}</strong></div>
            <div><span class="text-muted">Nacimiento:</span><br><strong>${ALUMNO_DEMO.fecha_nacimiento}</strong></div>
            <div><span class="text-muted">Instrumento:</span><br><strong>${ALUMNO_DEMO.instrumento_principal}</strong></div>
            <div><span class="text-muted">Representante:</span><br><strong>${ALUMNO_DEMO.representante_nombre}</strong></div>
            <div><span class="text-muted">Municipio:</span><br><strong>${ALUMNO_DEMO.municipio_residencia}</strong></div>
            <div><span class="text-muted">Centro estudios:</span><br><strong>${ALUMNO_DEMO.centro_estudios}</strong></div>
          </div>
          <p class="text-muted small mb-0 mt-3">
            <i class="bi bi-info-circle me-1"></i>
            Los PDFs reales se generan con los datos del alumno inscripto. Estos son sólo para previsualizar el diseño.
          </p>
        </div>
      </div>
    </div>`

  container.querySelector('#btn-demo-ficha').addEventListener('click', async (e) => {
    const btn = e.currentTarget
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...'
    try {
      await descargarFichaDemo()
    } finally {
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-download me-2"></i>Descargar ficha demo'
    }
  })

  container.querySelector('#btn-demo-constancia').addEventListener('click', async (e) => {
    const btn = e.currentTarget
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...'
    try {
      await descargarConstanciaDemo()
    } finally {
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-download me-2"></i>Descargar constancia demo'
    }
  })
}
