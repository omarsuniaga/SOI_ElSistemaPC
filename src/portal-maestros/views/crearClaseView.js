import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

export async function renderCrearClaseView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  try {
    // Verificar si el admin autorizó al maestro a crear clases
    const { data: config } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'maestros_pueden_crear_clases')
      .maybeSingle()

    const puedeCrear = config?.value === 'true'

    if (!puedeCrear) {
      container.innerHTML = `
        <div class="pm-empty" style="text-align:center;padding:3rem 1rem;">
          <i class="bi bi-lock" style="font-size:3rem;color:var(--pm-text-muted);"></i>
          <p style="margin-top:1rem;"><strong>Crear clases deshabilitado</strong></p>
          <p style="font-size:0.85rem;color:var(--pm-text-muted);">Solo los administradores pueden crear nuevas clases. Contacta al admin si necesitas una nueva clase.</p>
        </div>
      `
      return
    }

    // Obtener instrumentos disponibles
    const { data: instrumentos } = await supabase
      .from('instrumentos')
      .select('id, nombre')
      .order('nombre')

    // Obtener maestros para co-docencia
    const { data: maestros } = await supabase
      .from('maestros')
      .select('id, nombre, email')
      .neq('id', maestro.id)
      .order('nombre')

    container.innerHTML = `
      <div class="pm-crear-clase">
        <h2 class="pm-title">
          <i class="bi bi-plus-circle"></i> Crear Nueva Clase
        </h2>
        <p class="pm-subtitle">Esta clase será visible para ti y tus alumnos</p>

        <div class="pm-form-section">
          <h3 class="pm-section-title">Información básica</h3>
          
          <div class="pm-form-group">
            <label class="pm-label">Nombre de la clase *</label>
            <input type="text" id="nueva-clase-nombre" class="pm-input" 
              placeholder="Ej: Guitarra Beginners, Piano Intermedio">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Instrumento *</label>
            <select id="nueva-clase-instrumento" class="pm-input">
              <option value="">Seleccionar instrumento...</option>
              ${(instrumentos || []).map(i => `<option value="${i.id}">${escHTML(i.nombre)}</option>`).join('')}
            </select>
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Capacidad máxima de alumnos</label>
            <input type="number" id="nueva-clase-capacidad" class="pm-input" 
              value="10" min="1" max="50">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Salón / Ubicación</label>
            <input type="text" id="nueva-clase-salon" class="pm-input" 
              placeholder="Ej: Salon 1, Room A">
          </div>
        </div>

        <div class="pm-form-section">
          <h3 class="pm-section-title">Horario</h3>
          
          <div id="nueva-clase-horarios">
            <div class="pm-horario-row" data-index="0">
              <select class="pm-input pm-horario-dia">
                ${DIAS_SEMANA.map(d => `<option value="${d}">${d.charAt(0).toUpperCase() + d.slice(1)}</option>`).join('')}
              </select>
              <input type="time" class="pm-input pm-horario-inicio" value="15:30">
              <span>a</span>
              <input type="time" class="pm-input pm-horario-fin" value="17:00">
              <button class="pm-btn-remove" type="button"><i class="bi bi-x"></i></button>
              </div>
          </div>
          
          <button class="pm-btn pm-btn-secondary" id="btn-agregar-horario" style="margin-top:0.5rem;">
            <i class="bi bi-plus"></i> Agregar horario
          </button>
        </div>

        <div class="pm-form-section">
          <h3 class="pm-section-title">Maestro(es)</h3>
          
          <div class="pm-form-group">
            <label class="pm-label">Maestro titular *</label>
            <input type="text" class="pm-input" value="${escHTML(maestro.nombre || 'Tú')}" disabled>
            <input type="hidden" id="nueva-clase-maestro-titular" value="${maestro.id}">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Maestro auxiliar (opcional)</label>
            <select id="nueva-clase-maestro-aux" class="pm-input">
              <option value="">Sin maestro auxiliar</option>
              ${(maestros || []).map(m => `<option value="${m.id}">${escHTML(m.nombre || m.email)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="pm-form-actions">
          <button class="pm-btn" id="btn-cancelar-clase">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="btn-guardar-clase">Crear Clase</button>
        </div>
      </div>
    `

    // Agregar más horarios
    document.getElementById('btn-agregar-horario').onclick = () => {
      const container = document.getElementById('nueva-clase-horarios')
      const index = container.children.length
      const row = document.createElement('div')
      row.className = 'pm-horario-row'
      row.dataset.index = index
      row.innerHTML = `
        <select class="pm-input pm-horario-dia">
          ${DIAS_SEMANA.map(d => `<option value="${d}">${d.charAt(0).toUpperCase() + d.slice(1)}</option>`).join('')}
        </select>
        <input type="time" class="pm-input pm-horario-inicio" value="15:30">
        <span>a</span>
        <input type="time" class="pm-input pm-horario-fin" value="17:00">
        <button class="pm-btn-remove" type="button"><i class="bi bi-x"></i></button>
      `
      row.querySelector('.pm-btn-remove').onclick = () => row.remove()
      container.appendChild(row)
    }

    // Guardar clase
    document.getElementById('btn-guardar-clase').onclick = async () => {
      const nombre = document.getElementById('nueva-clase-nombre').value.trim()
      const instrumentoId = document.getElementById('nueva-clase-instrumento').value
      const capacidad = parseInt(document.getElementById('nueva-clase-capacidad').value) || 10
      const salon = document.getElementById('nueva-clase-salon').value.trim()
      const maestroAuxId = document.getElementById('nueva-clase-maestro-aux').value

      if (!nombre) {
        alert('El nombre de la clase es obligatorio')
        return
      }
      if (!instrumentoId) {
        alert('Selecciona un instrumento')
        return
      }

      const btn = document.getElementById('btn-guardar-clase')
      btn.disabled = true
      btn.textContent = 'Creando...'

      try {
        // Crear la clase
        const { data: clase, error } = await supabase
          .from('clases')
          .insert({
            nombre,
            instrumento_id: instrumentoId,
            capacidad_maxima: capacidad,
            salon,
            maestro_principal_id: maestro.id,
            maestro_suplente_id: maestroAuxId || null,
            activo: true
          })
          .select()
          .single()

        if (error) throw error

        // Agregar horarios
        const horariosRows = document.querySelectorAll('.pm-horario-row')
        const horarios = []
        for (const row of horariosRows) {
          const dia = row.querySelector('.pm-horario-dia').value
          const horaInicio = row.querySelector('.pm-horario-inicio').value
          const horaFin = row.querySelector('.pm-horario-fin').value
          if (dia && horaInicio && horaFin) {
            horarios.push({
              clase_id: clase.id,
              dia,
              hora_inicio: horaInicio,
              hora_fin: horaFin
            })
          }
        }

        if (horarios.length > 0) {
          const { error: errHorarios } = await supabase
            .from('clase_horarios')
            .insert(horarios)
          
          if (errHorarios) throw errHorarios
        }

        alert('¡Clase creada exitosamente!')
        window.location.hash = '#/calendario'

      } catch (err) {
        console.error(err)
        alert('Error al crear la clase: ' + err.message)
        btn.disabled = false
        btn.textContent = 'Crear Clase'
      }
    }

    // Cancelar
    document.getElementById('btn-cancelar-clase').onclick = () => {
      window.history.back()
    }

  } catch (err) {
    container.innerHTML = `
      <div class="pm-empty" style="color:var(--pm-danger)">
        Error: ${escHTML(err.message)}
      </div>
    `
  }
}