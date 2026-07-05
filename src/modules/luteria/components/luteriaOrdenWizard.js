/**
 * luteriaOrdenWizard.js — Modal para crear una nueva orden de reparación
 * con búsqueda automática por número de serie en inventario_activos.
 *
 * Loop 18: integración completa con el portal de inventarios.
 * - Si el instrumento existe en inventario_activos, autocompleta los campos.
 * - Si no existe, el luthier los completa manualmente y se crea el activo.
 * - Permite subir 1 foto del daño al bucket instrumentos-fotos.
 * - Al guardar: registra evento en inventario_historial.
 */

import {
  createOrden,
  getActivoBySerie,
  createActivo,
  updateActivoEstado,
  registrarEventoHistorial,
  uploadFotoInstrumento,
} from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { listarInstrumentos } from '../../instrumentos/api/instrumentosApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Lee el nombre del usuario actual desde la sesión de Supabase.
 * Retorna "Sistema" como fallback si no hay sesión o no se puede leer el perfil.
 */
async function getCurrentUserName() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'Sistema'
    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre_completo, rol')
      .eq('id', user.id)
      .single()
    if (profile?.nombre_completo) return profile.nombre_completo
    return user.email?.split('@')[0] || 'Sistema'
  } catch (err) {
    console.warn('[luteriaOrdenWizard] No pude leer sesión:', err.message)
    return 'Sistema'
  }
}

const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const TIPOS_DANO = [
  { value: 'grieta', label: 'Grieta' },
  { value: 'rotura', label: 'Rotura' },
  { value: 'desafinacion', label: 'Desafinación' },
  { value: 'desgaste', label: 'Desgaste' },
  { value: 'otro', label: 'Otro' },
]

/**
 * Flujo del wizard:
 * 1. Luthier tipea numero_serie → busca en inventario_activos.
 * 2. Si existe, autocompleta tipo, marca, modelo, notas. Muestra foto si tiene.
 * 3. Si no existe, deja los campos vacíos y el luthier los completa.
 * 4. Luthier sube 1 foto (opcional).
 * 5. Al guardar:
 *    a. INSERT/UPDATE inventario_activos.
 *    b. UPDATE estado_uso='en_mantenimiento', estado_conservacion='mantenimiento'.
 *    c. INSERT inventario_historial con metadata={orden_id, foto_url}.
 *    d. INSERT lut_ordenes_reparacion.
 */
export async function openLuteriaOrdenWizard({ instrumentoId = null, onSuccess } = {}) {
  // Cache local para no re-consultar en cada apertura.
  let instrumentosCache = []
  try {
    instrumentosCache = await listarInstrumentos({ activo: true })
  } catch (err) {
    console.warn('[luteriaOrdenWizard] No pude cargar instrumentos:', err.message)
  }

  // Estado mutable de la busqueda por serial.
  let activoEncontrado = null
  let fotoFile = null
  let fotoUrl = null

  const instrumentosOptions = instrumentosCache
    .map((i) => `<option value="${escapeHTML(i.id)}" ${i.id === instrumentoId ? 'selected' : ''}>${escapeHTML(i.codigo)} — ${escapeHTML(i.nombre)} (${escapeHTML(i.estado)})</option>`)
    .join('')

  const body = `
    <form id="lut-wizard-form" autocomplete="off">
      <div class="mb-3">
        <label class="form-label">Número de serie <span class="text-danger">*</span></label>
        <div class="input-group">
          <input type="text" id="lut-serie" class="form-control"
            placeholder="Ej: STR-1720-001" ${instrumentoId ? 'readonly' : ''}>
          <button type="button" id="lut-buscar-serie" class="btn btn-outline-primary">
            <i class="bi bi-search me-1"></i>Buscar en inventario
          </button>
        </div>
        <small class="text-muted" id="lut-serie-status">
          Si el instrumento ya está en el inventario, se autocompletan los datos.
        </small>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Tipo de instrumento</label>
          <input type="text" id="lut-tipo-instrumento" class="form-control"
            placeholder="violín, cello, piano..." list="lut-tipos-list">
          <datalist id="lut-tipos-list">
            <option value="violin"><option value="viola"><option value="chelo">
            <option value="contrabajo"><option value="piano"><option value="guitarra">
            <option value="flauta"><option value="clarinete"><option value="trompeta">
          </datalist>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Marca</label>
          <input type="text" id="lut-marca" class="form-control" placeholder="Luthier SOI, Yamaha, etc.">
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Modelo</label>
          <input type="text" id="lut-modelo" class="form-control" placeholder="Stradivarius 1720, etc.">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Diseño / estilo</label>
          <input type="text" id="lut-diseno" class="form-control" placeholder="Barroco, moderno, etc.">
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">¿El instrumento es propio?</label>
        <div class="form-check">
          <input type="checkbox" id="lut-instrumento-propio" class="form-check-input">
          <label for="lut-instrumento-propio" class="form-check-label">
            Marcá si es del alumno (instrumento propio). Si no, pertenece a la institución.
          </label>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Alumno (si aplica)</label>
        <input type="text" id="lut-alumno" class="form-control" placeholder="Nombre del alumno al que se le asigna">
        <small class="text-muted">Solo si el instrumento es del alumno o se le va a asignar.</small>
      </div>

      <div class="mb-3">
        <label class="form-label">Descripción del daño <span class="text-danger">*</span></label>
        <textarea id="lut-descripcion" class="form-control" rows="3" required
          placeholder="Describí el daño observado (qué se rompió, cuándo se detectó, contexto)"></textarea>
      </div>

      <div class="row">
        <div class="col-md-4 mb-3">
          <label class="form-label">Tipo de daño</label>
          <select id="lut-tipo" class="form-select">
            ${TIPOS_DANO.map((t) => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Gravedad</label>
          <select id="lut-gravedad" class="form-select">
            <option value="leve">Leve</option>
            <option value="moderada" selected>Moderada</option>
            <option value="grave">Grave</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Prioridad</label>
          <select id="lut-prioridad" class="form-select">
            <option value="baja">Baja</option>
            <option value="media" selected>Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="form-check">
            <input type="checkbox" id="lut-reemplazo" class="form-check-input">
            <label for="lut-reemplazo" class="form-check-label">Requiere reemplazo de pieza</label>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="form-check">
            <input type="checkbox" id="lut-cobro" class="form-check-input">
            <label for="lut-cobro" class="form-check-label">Requiere cobro al alumno</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Foto del daño (opcional)</label>
        <input type="file" id="lut-foto" class="form-control" accept="image/jpeg,image/png,image/webp">
        <small class="text-muted">JPG, PNG o WebP. Máximo 5 MB. Se guarda en Supabase Storage.</small>
        <div id="lut-foto-preview" class="mt-2"></div>
      </div>

      <div id="lut-wizard-error" class="alert alert-danger d-none" role="alert"></div>
    </form>
  `

  const modal = AppModal.open({
    title: 'Nueva Orden de Reparación',
    size: 'lg',
    body,
    saveText: 'Crear orden',
    cancelText: 'Cancelar',
    onSave: async (closeModal) => {
      const errorEl = document.getElementById('lut-wizard-error')
      errorEl.classList.add('d-none')

      const serie = document.getElementById('lut-serie').value.trim()
      const tipoInstrumento = document.getElementById('lut-tipo-instrumento').value.trim()
      const marca = document.getElementById('lut-marca').value.trim()
      const modelo = document.getElementById('lut-modelo').value.trim()
      const diseno = document.getElementById('lut-diseno').value.trim()
      const instrumentoPropio = document.getElementById('lut-instrumento-propio').checked
      const alumno = document.getElementById('lut-alumno').value.trim()
      const descripcion = document.getElementById('lut-descripcion').value.trim()
      const tipo = document.getElementById('lut-tipo').value
      const gravedad = document.getElementById('lut-gravedad').value
      const prioridad = document.getElementById('lut-prioridad').value
      const reemplazo = document.getElementById('lut-reemplazo').checked
      const cobro = document.getElementById('lut-cobro').checked

      // Validación
      if (!serie) {
        errorEl.textContent = 'El número de serie es obligatorio.'
        errorEl.classList.remove('d-none')
        return
      }
      if (!tipoInstrumento) {
        errorEl.textContent = 'Tenés que indicar el tipo de instrumento.'
        errorEl.classList.remove('d-none')
        return
      }
      if (!descripcion) {
        errorEl.textContent = 'La descripción del daño es obligatoria.'
        errorEl.classList.remove('d-none')
        return
      }

      const saveBtn = document.querySelector('#lut-wizard-form').closest('.modal').querySelector('.btn-primary')
      if (saveBtn) {
        saveBtn.disabled = true
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
      }

      try {
        const reportadoPorNombre = await getCurrentUserName()

        // 1. Si hay foto, subirla primero.
        if (fotoFile) {
          fotoUrl = await uploadFotoInstrumento(fotoFile, serie)
        }

        // 2. Buscar o crear el activo en inventario_activos.
        let activo = activoEncontrado
        if (!activo) {
          // Re-buscar por si el luthier no apretó "Buscar" pero la serie existe.
          activo = await getActivoBySerie(serie)
        }
        if (!activo) {
          // Crear nuevo activo.
          activo = await createActivo({
            tipo_instrumento: tipoInstrumento,
            marca,
            modelo,
            numero_serie: serie,
            estado_uso: 'en_mantenimiento',
            estado_conservacion: 'mantenimiento',
            foto_url: fotoUrl,
            notas: diseno ? `Diseño/estilo: ${diseno}` : null,
          })
        } else {
          // Actualizar el activo existente: marcar como en mantenimiento.
          activo = await updateActivoEstado(activo.id, {
            estado_uso: 'en_mantenimiento',
            estado_conservacion: gravedad === 'critica' ? 'de_baja' : 'mantenimiento',
            foto_url: fotoUrl || activo.foto_url,
          })
        }

        // 3. Crear la orden de reparación.
        const orden = await createOrden({
          instrumento_id: activo.id,
          alumno_nombre: alumno || null,
          reportado_por_nombre: reportadoPorNombre,
          departamento_origen: 'LUT',
          prioridad,
          descripcion_inicial: descripcion,
          tipo_dano: tipo,
          gravedad,
          requiere_reemplazo: reemplazo,
          requiere_cobro: cobro,
        })

        // 4. Registrar evento en inventario_historial.
        await registrarEventoHistorial(
          activo.id,
          'dañado',
          `Reporte de daño: ${descripcion}. Orden ${orden.id}. Instrumento ${instrumentoPropio ? 'propio del alumno' : 'de la institución'}.`,
          null,
          {
            orden_id: orden.id,
            tipo_dano: tipo,
            gravedad,
            prioridad,
            foto_url: fotoUrl,
            reportado_por: reportadoPorNombre,
            instrumento_propio: instrumentoPropio,
            diseno,
            requiere_reemplazo: reemplazo,
            requiere_cobro: cobro,
          }
        )

        closeModal()
        if (onSuccess) onSuccess({ orden, activo })
      } catch (err) {
        console.error('[luteriaOrdenWizard] error:', err)
        errorEl.textContent = 'Error al crear la orden: ' + err.message
        errorEl.classList.remove('d-none')
        if (saveBtn) {
          saveBtn.disabled = false
          saveBtn.textContent = 'Crear orden'
        }
      }
    },
  })

  // ─── Wiring post-render: búsqueda por serie y preview de foto ───

  setTimeout(() => {
    const buscarBtn = document.getElementById('lut-buscar-serie')
    const serieInput = document.getElementById('lut-serie')
    const statusEl = document.getElementById('lut-serie-status')
    const tipoInput = document.getElementById('lut-tipo-instrumento')
    const marcaInput = document.getElementById('lut-marca')
    const modeloInput = document.getElementById('lut-modelo')
    const fotoInput = document.getElementById('lut-foto')
    const fotoPreview = document.getElementById('lut-foto-preview')

    async function buscarActivo() {
      const serie = serieInput.value.trim()
      if (!serie) {
        statusEl.textContent = 'Tipeá un número de serie para buscar.'
        statusEl.className = 'text-muted'
        return
      }
      statusEl.textContent = 'Buscando...'
      statusEl.className = 'text-muted'
      try {
        const activo = await getActivoBySerie(serie)
        if (activo) {
          activoEncontrado = activo
          tipoInput.value = activo.tipo_instrumento || ''
          marcaInput.value = activo.marca || ''
          modeloInput.value = activo.modelo || ''
          statusEl.innerHTML = `<span class="text-success">✓ Encontrado: ${escapeHTML(activo.modelo || activo.tipo_instrumento)} (${escapeHTML(activo.estado_uso)})</span>`
          statusEl.className = 'text-success'
        } else {
          activoEncontrado = null
          statusEl.innerHTML = '<span class="text-warning">⚠ No encontrado. Se creará un nuevo activo en el inventario.</span>'
          statusEl.className = 'text-warning'
        }
      } catch (err) {
        statusEl.textContent = 'Error al buscar: ' + err.message
        statusEl.className = 'text-danger'
      }
    }

    buscarBtn?.addEventListener('click', buscarActivo)
    serieInput?.addEventListener('blur', () => {
      if (serieInput.value.trim() && !activoEncontrado) buscarActivo()
    })

    fotoInput?.addEventListener('change', (e) => {
      fotoFile = e.target.files[0] || null
      if (fotoFile) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          fotoPreview.innerHTML = `<img src="${ev.target.result}" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:0.5rem">`
        }
        reader.readAsDataURL(fotoFile)
      } else {
        fotoPreview.innerHTML = ''
      }
    })
  }, 100)
}