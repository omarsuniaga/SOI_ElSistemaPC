/**
 * simuladorEngine.js — Reloj virtual del simulador (Slice 3).
 * Función pura de estado + `setInterval`, sin dependencias de red ni DOM.
 *
 * Modelo: `velocidad` = segundos reales por día simulado (sim_runs.velocidad,
 * ver migración 20260707_simulador_core.sql). Cada disparo de `onTick` representa
 * el avance de UN día simulado; quien invoca `crearSimuladorEngine` es responsable
 * de avanzar `fecha_actual_virtual` y de llamar a la edge function `simulador-tick`
 * dentro de `onTick` (I/O vive fuera de este módulo — mantiene el engine puro y
 * testeable con fake timers).
 *
 * Design ref: sdd/portal-simulador/design (obs #2723), decisión #1
 * (tick disparado desde el frontend con setInterval, no pg_cron).
 *
 * @param {object} opciones
 * @param {number} opciones.velocidad — segundos reales por día simulado (> 0)
 * @param {Function} opciones.onTick — callback invocado en cada tick
 * @returns {{
 *   start: () => void,
 *   pause: () => void,
 *   resume: () => void,
 *   stop: () => void,
 *   cambiarVelocidad: (nuevaVelocidad: number) => void,
 *   getEstado: () => 'corriendo'|'pausado',
 *   getVelocidad: () => number,
 * }}
 */
export function crearSimuladorEngine({ velocidad, onTick }) {
  if (typeof velocidad !== 'number' || !(velocidad > 0)) {
    throw new Error('velocidad debe ser un número mayor que 0 (segundos reales por día simulado)')
  }
  if (typeof onTick !== 'function') {
    throw new Error('onTick debe ser una función')
  }

  let _velocidad = velocidad
  let _estado = 'pausado'
  let _intervalId = null

  function _limpiarIntervalo() {
    if (_intervalId != null) {
      clearInterval(_intervalId)
      _intervalId = null
    }
  }

  function _programarIntervalo() {
    _limpiarIntervalo()
    if (_estado !== 'corriendo') return
    _intervalId = setInterval(() => {
      onTick()
    }, _velocidad * 1000)
  }

  function start() {
    if (_estado === 'corriendo') return // idempotente
    _estado = 'corriendo'
    _programarIntervalo()
  }

  function pause() {
    _estado = 'pausado'
    _limpiarIntervalo()
  }

  function resume() {
    if (_estado === 'corriendo') return
    _estado = 'corriendo'
    _programarIntervalo()
  }

  function stop() {
    _estado = 'pausado'
    _limpiarIntervalo()
  }

  function cambiarVelocidad(nuevaVelocidad) {
    if (typeof nuevaVelocidad !== 'number' || !(nuevaVelocidad > 0)) {
      throw new Error('nuevaVelocidad debe ser un número mayor que 0')
    }
    _velocidad = nuevaVelocidad
    // Reprograma el intervalo con la nueva cadencia; si está pausado, el
    // cambio se aplica sin disparar timers (se reflejará al resume()).
    if (_estado === 'corriendo') _programarIntervalo()
  }

  function getEstado() {
    return _estado
  }

  function getVelocidad() {
    return _velocidad
  }

  return { start, pause, resume, stop, cambiarVelocidad, getEstado, getVelocidad }
}
