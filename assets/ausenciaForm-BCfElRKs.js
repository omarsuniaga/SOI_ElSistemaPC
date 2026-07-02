import"./supabase--PHJV0L9.js";function e(e){return`
    <form id="ausenciaForm" class="row g-3">
      <div class="col-md-6">
        <label class="form-label label-apple">Fecha de inicio</label>
        <input type="date" class="input-apple" id="ausenciaFechaInicio" required>
      </div>
      <div class="col-md-6">
        <label class="form-label label-apple">Fecha de fin</label>
        <input type="date" class="input-apple" id="ausenciaFechaFin" required>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Motivo de ausencia</label>
        <select class="input-apple" id="ausenciaMotivo" required>
          <option value="">Selecciona un motivo</option>
          <option value="enfermedad">Enfermedad</option>
          <option value="personal">Asunto personal</option>
          <option value="familiar">Emergencia familiar</option>
          <option value="capacitacion">Capacitación</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Maestro sustituto</label>
        <select class="input-apple" id="ausenciaSustituto" required>
          <option value="">Cargando maestros...</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Observaciones</label>
        <textarea class="input-apple" id="ausenciaObservaciones" rows="3"
          placeholder="Información adicional relevante"></textarea>
      </div>
      <div class="col-12">
        <div id="ausenciaError" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn-apple-primary" id="btnEnviarAusencia">
          <i class="bi bi-send me-1"></i>Enviar solicitud
        </button>
      </div>
    </form>
  `}export{e as renderAusenciaForm};