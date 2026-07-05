import { 
  getImportEntities, 
  parseCSV, 
  parseJSON,
  previewImport,
  importData 
} from '../components/importData.js'

let selectedEntity = null

export async function renderImportView(container) {
  const entities = getImportEntities()
  
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-10 mx-auto">
          
          <!-- Header -->
          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-cloud-upload fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Importar Datos</h2>
              <small class="text-muted">Pega tu JSON o CSV para importar al sistema</small>
            </div>
          </div>

          <!-- Paso 1: Seleccionar entidad -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0"><span class="badge bg-primary me-2">1</span>Selecciona el tipo de datos</h5>
            </div>
            <div class="card-body">
              <select class="form-select form-select-lg" id="import-entity-select">
                <option value="">-- Selecciona qué vas a importar --</option>
                ${Object.entries(entities).map(([key, entity]) => `
                  <option value="${key}">${entity.label}</option>
                `).join('')}
              </select>
              <div id="entity-description" class="mt-2 text-muted"></div>
            </div>
          </div>

          <!-- Paso 2: Estructura -->
          <div class="card shadow-sm mb-4" id="structure-card" style="display: none;">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0"><span class="badge bg-info me-2">2</span>Estructura requerida</h5>
            </div>
            <div class="card-body">
              <div id="structure-info" class="mb-3"></div>
              <button class="btn btn-primary btn-lg w-100" id="btn-open-editor">
                <i class="bi bi-pencil-square me-2"></i>Abrir Editor de Datos
              </button>
            </div>
          </div>

          <!-- Paso 3: Editor de datos -->
          <div class="card shadow-sm mb-4" id="editor-card" style="display: none;">
            <div class="card-header bg-success bg-opacity-10">
              <h5 class="mb-0"><span class="badge bg-success me-2">3</span>Pega aquí tu JSON o CSV</h5>
            </div>
            <div class="card-body">
              <div class="alert alert-secondary d-flex align-items-center">
                <i class="bi bi-info-circle me-2"></i>
                <small>Pega el contenido de tu archivo JSON o CSV directamente en el área de texto.</small>
              </div>
              
              <div class="mb-3">
                <textarea class="form-control font-monospace" id="import-data" rows="12" 
                  placeholder='[
  {
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  {
    "name": "Ana García",
    "email": "ana@email.com"
  }
]'></textarea>
              </div>
              
              <div class="d-flex justify-content-between align-items-center">
                <div id="parse-status" class="text-muted"></div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary" id="preview-btn">
                    <i class="bi bi-eye me-1"></i> Previsualizar
                  </button>
                  <button class="btn btn-success btn-lg" id="execute-import-btn" disabled>
                    <i class="bi bi-cloud-upload me-1"></i> Importar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="card shadow-sm mb-4" id="preview-card" style="display: none;">
            <div class="card-header bg-warning bg-opacity-10">
              <h5 class="mb-0"><i class="bi bi-table me-2"></i>Previsualización (5 primeros)</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm table-bordered table-striped" id="preview-table">
                  <thead class="table-light" id="preview-thead"></thead>
                  <tbody id="preview-tbody"></tbody>
                </table>
              </div>
              <div id="preview-issues" class="mt-2"></div>
            </div>
          </div>

          <!-- Results -->
          <div class="card shadow-sm" id="results-card" style="display: none;">
            <div class="card-header" id="results-header">
              <h5 class="mb-0"><i class="bi bi-check-circle me-2"></i>Resultados de Importación</h5>
            </div>
            <div class="card-body" id="results-content"></div>
          </div>

        </div>
      </div>
    </div>
  `

  const entitySelect = document.getElementById('import-entity-select')
  const entityDesc = document.getElementById('entity-description')
  const structureCard = document.getElementById('structure-card')
  const structureInfo = document.getElementById('structure-info')
  const editorCard = document.getElementById('editor-card')
  const previewCard = document.getElementById('preview-card')
  const resultsCard = document.getElementById('results-card')
  const dataTextarea = document.getElementById('import-data')
  const parseStatus = document.getElementById('parse-status')
  const previewBtn = document.getElementById('preview-btn')
  const executeImportBtn = document.getElementById('execute-import-btn')

  let parsedData = null
  let previewData = null

  // Función para generar ejemplos completos
  function generateExample(entity) {
    const EXAMPLES = {
      students: [
        {
          "nombre_completo": "Juan Pérez González",
          "tlf_alumno": "+1 809 555 1234",
          "direccion": "Av. principal 123, Santo Domingo",
          "fecha_nacimiento": "2010-05-15",
          "instrumento_principal": "Guitarra",
          "nivel": "básico",
          "fecha_ingreso": "2024-01-15",
          "padre_nombre": "María Pérez",
          "madre_nombre": "Carlos Pérez",
          "representante_nombre": "María Pérez",
          "representante_cedula": "12345678",
          "representante_tlf": "+1 809 555 5678",
          "correo_representante": "maria.perez@email.com",
          "contacto_emergencia_nombre": "Pedro Pérez",
          "contacto_emergencia_telefono": "+1 809 555 9999",
          "observaciones_generales": "Alumno responsable",
          "activo": true
        },
        {
          "nombre_completo": "Ana García López",
          "tlf_alumno": "+1 809 555 8888",
          "direccion": "Calle 45, Sto. Dgo.",
          "fecha_nacimiento": "2012-03-20",
          "instrumento_principal": "Piano",
          "nivel": "intermedio",
          "representante_nombre": "Carlos García",
          "representante_cedula": "87654321",
          "representante_tlf": "+1 809 555 7777",
          "correo_representante": "carlos.g@email.com",
          "activo": true
        }
      ],
      programas: [
        {
          "nombre": "Guitarra Clásica",
          "descripcion": "Programa de guitarra clásica para principiantes",
          "nivel": "básico",
          "duracion_anios": 3,
          "activo": true
        },
        {
          "nombre": "Piano Iniciación",
          "descripcion": "Aprende piano desde cero",
          "nivel": "inicial",
          "duracion_anios": 2,
          "activo": true
        }
      ],
      salones: [
        {
          "nombre": "Salón A1",
          "codigo_salon": "A-101",
          "ubicacion": "Edificio Principal, Piso 1",
          "piso": 1,
          "capacidad": 10,
          "is_active": true
        },
        {
          "nombre": "Sala de Piano",
          "codigo_salon": "PIANO-01",
          "ubicacion": "Edificio Principal, Piso 2",
          "piso": 2,
          "capacidad": 5,
          "is_active": true
        }
      ],
      maestros: [
        {
          "nombre_completo": "Carlos Rodríguez",
          "correo": "carlos.rodriguez@soi.edu",
          "tlf": "+1 809 555 1111",
          "especialidad": "Guitarra Clásica",
          "resena": "Maestro con 15 años de experiencia en guitarra clásica",
          "activo": true
        },
        {
          "nombre_completo": "María Fernández",
          "correo": "maria.fernandez@soi.edu",
          "tlf": "+1 809 555 2222",
          "especialidad": "Piano",
          "resena": "Licenciada en Música, especialista en piano clásico",
          "activo": true
        }
      ],
      clases: [
        {
          "nombre": "Guitarra Básico A",
          "instrumento": "Guitarra",
          "tipo_clase": "grupal",
          "capacidad_maxima": 8,
          "activo": true
        },
        {
          "nombre": "Piano Intermedio",
          "instrumento": "Piano",
          "tipo_clase": "individual",
          "capacidad_maxima": 5,
          "activo": true
        }
      ],
      inscripciones: [
        {
          "alumno_id": "uuid-del-alumno-1",
          "clase_id": "uuid-de-la-clase-1",
          "fecha_inscripcion": "2024-01-15",
          "estado": "activo"
        }
      ],
      asistencias: [
        {
          "alumno_id": "uuid-del-alumno",
          "sesion_id": "uuid-de-la-sesion",
          "estado": "P",
          "fecha": "2024-06-10"
        }
      ],
      progresos: [
        {
          "alumno_id": "uuid-del-alumno",
          "clase_id": "uuid-de-la-clase",
          "tipo_evaluacion": "parcial",
          "calificacion": 4.5,
          "fecha_evaluacion": "2024-06-15",
          "observaciones": "Buen progreso en técnica",
          "estado": "completado"
        }
      ]
    }
    return EXAMPLES[entity] || [{}]
  }

  // Mostrar estructura cuando selecciona entidad
  entitySelect.addEventListener('change', (e) => {
    selectedEntity = e.target.value
    const entity = entities[selectedEntity]
    
    if (entity) {
      entityDesc.textContent = entity.description
      structureCard.style.display = 'block'
      editorCard.style.display = 'none'
      previewCard.style.display = 'none'
      resultsCard.style.display = 'none'
      
      // Mostrar campos requeridos
      const required = entity.fields.filter(f => f.required)
      const optional = entity.fields.filter(f => !f.required)
      
      let html = '<div class="row"><div class="col-md-6">'
      html += '<strong class="text-danger">Campos obligatorios:</strong><br>'
      html += '<code>' + required.map(f => f.name).join('</code>, <code>') + '</code>'
      html += '</div><div class="col-md-6">'
      html += '<strong class="text-muted">Campos opcionales:</strong><br>'
      html += '<small>' + optional.map(f => f.name).join(', ') + '</small>'
      html += '</div></div>'
      
      // Ejemplo completo
      html += '<hr><strong>Ejemplo completo (copiá y pegá para probar):</strong><pre class="mt-2 p-2 bg-dark text-light rounded" style="font-size:11px">'
      const example = generateExample(selectedEntity)
      html += JSON.stringify(example, null, 2) + '</pre>'
      
      structureInfo.innerHTML = html
    } else {
      entityDesc.textContent = ''
      structureCard.style.display = 'none'
      editorCard.style.display = 'none'
    }
  })

  // Abrir editor
  document.getElementById('btn-open-editor').addEventListener('click', () => {
    const entity = entities[selectedEntity]
    editorCard.style.display = 'block'
    dataTextarea.value = ''
    parseStatus.innerHTML = ''
    previewCard.style.display = 'none'
    executeImportBtn.disabled = true
    dataTextarea.focus()
  })

  // Auto-detectar formato
  dataTextarea.addEventListener('input', () => {
    const content = dataTextarea.value.trim()
    parseStatus.innerHTML = ''
    executeImportBtn.disabled = true
    
    if (!content) return
    
    // Detectar si es JSON o CSV
    const isJSON = (content.startsWith('[') || content.startsWith('{')) && content.includes(':')
    
    if (isJSON) {
      try {
        parsedData = parseJSON(content)
        if (parsedData.error) {
          parseStatus.innerHTML = `<span class="text-danger">❌ ${parsedData.error}</span>`
        } else {
          parseStatus.innerHTML = `<span class="text-success">✓ JSON válido - ${parsedData.data.length} registros detectados</span>`
        }
      } catch (e) {
        parseStatus.innerHTML = `<span class="text-danger">❌ Error: ${e.message}</span>`
      }
    } else {
      parsedData = parseCSV(content)
      if (parsedData.error) {
        parseStatus.innerHTML = `<span class="text-danger">❌ ${parsedData.error}</span>`
      } else {
        parseStatus.innerHTML = `<span class="text-success">✓ CSV válido - ${parsedData.data.length} registros detectados</span>`
      }
    }
  })

  // Previsualizar
  previewBtn.addEventListener('click', async () => {
    if (!parsedData || parsedData.error || !parsedData.data) {
      parseStatus.innerHTML = '<span class="text-danger">❌ No hay datos válidos</span>'
      return
    }
    
    previewData = await previewImport(selectedEntity, parsedData.data)
    renderPreview()
    previewCard.style.display = 'block'
    executeImportBtn.disabled = false
  })

  // Importar
  executeImportBtn.addEventListener('click', async () => {
    if (!parsedData || !parsedData.data) return
    
    executeImportBtn.disabled = true
    executeImportBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Importando...'
    
    try {
      const results = await importData(selectedEntity, parsedData.data)
      
      resultsCard.style.display = 'block'
      const header = document.getElementById('results-header')
      const content = document.getElementById('results-content')
      
      if (results.errors.length === 0) {
        header.className = 'card-header bg-success bg-opacity-10'
        content.innerHTML = `
          <div class="alert alert-success mb-0">
            <h5><i class="bi bi-check-circle-fill me-2"></i>✅ Importación exitosa!</h5>
            <p class="mb-0">${results.success} registros importados correctamente.</p>
          </div>
        `
      } else {
        header.className = 'card-header bg-warning bg-opacity-10'
        content.innerHTML = `
          <div class="alert alert-warning mb-0">
            <h5>⚠️ Importación con errores</h5>
            <p><strong>${results.success} exitosos</strong> - <strong>${results.errors.length} errores</strong></p>
            <hr>
            <small><strong>Errores:</strong><br>${results.errors.slice(0, 5).map(e => `• Fila ${e.row}: ${e.error}`).join('<br>')}</small>
          </div>
        `
      }
      
      // Reset
      dataTextarea.value = ''
      parseStatus.innerHTML = ''
      previewCard.style.display = 'none'
      executeImportBtn.disabled = true
      executeImportBtn.innerHTML = '<i class="bi bi-cloud-upload me-1"></i> Importar'
      
    } catch (err) {
      parseStatus.innerHTML = `<span class="text-danger">❌ Error: ${err.message}</span>`
      executeImportBtn.disabled = false
      executeImportBtn.innerHTML = '<i class="bi bi-cloud-upload me-1"></i> Importar'
    }
  })

  function renderPreview() {
    if (!previewData || previewData.length === 0) return
    
    const thead = document.getElementById('preview-thead')
    const tbody = document.getElementById('preview-tbody')
    const issuesDiv = document.getElementById('preview-issues')
    
    const headers = Object.keys(previewData[0].data)
    thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>'
    
    tbody.innerHTML = previewData.map(row => 
      '<tr>' + headers.map(h => `<td>${row.data[h] ?? ''}</td>`).join('') + '</tr>'
    ).join('')
    
    const allIssues = previewData.flatMap(r => r.issues)
    if (allIssues.length > 0) {
      issuesDiv.innerHTML = `<span class="text-warning">⚠️ ${allIssues.length} advertencias</span>`
    } else {
      issuesDiv.innerHTML = `<span class="text-success">✓ Todo看起来 bien - listo para importar</span>`
    }
  }
}