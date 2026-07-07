/**
 * escritorioMaquinaEstados.js — Máquina de estados pura para el muñeco de
 * un escritorio departamental en la Sala de Trabajo (Slice 4).
 *
 * Estados: idle (respiración/parpadeo sutil, sin I/O) -> working (tecleando,
 * al recibir un evento de sim_log de su departamento) -> talking (globo de
 * diálogo con el texto de la acción) -> vuelve a idle (o al siguiente evento
 * en cola si llegan varios eventos concurrentes).
 *
 * Cola FIFO: si llegan varias entradas de sim_log mientras el muñeco está
 * ocupado, se encolan y se procesan en orden, cada una con una duración
 * mínima visible (`DURACION_WORKING_MS` + `DURACION_TALKING_MS`) para que
 * el usuario alcance a leer la animación aunque los ticks lleguen muy
 * rápido (velocidad alta del simulador).
 *
 * Puro: usa `setTimeout`/`clearTimeout` globales (testeable con fake timers
 * de Vitest), sin dependencias de Canvas ni de red.
 *
 * Design ref: sdd/portal-simulador/design (obs #2723); Spec ref:
 * sdd/portal-simulador/spec (obs #2722) — simulador-vista-animada.
 */

const DURACION_WORKING_MS = 900
const DURACION_TALKING_MS = 2200
const DURACION_WALKING_MS = 1200

/**
 * @returns {{
 *   DURACION_WORKING_MS: number,
 *   DURACION_TALKING_MS: number,
 *   DURACION_WALKING_MS: number,
 *   encolarEvento: (evento: {texto: string, requiereCaminata?: boolean}) => void,
 *   getEstado: () => 'idle'|'walking'|'working'|'talking',
 *   getDialogo: () => string|null,
 *   getColaLength: () => number,
 *   reset: () => void,
 * }}
 */
export function crearEscritorioMaquinaEstados() {
  let _estado = 'idle'
  let _dialogo = null
  let _cola = []
  let _timeoutId = null

  function _limpiarTimeout() {
    if (_timeoutId != null) {
      clearTimeout(_timeoutId)
      _timeoutId = null
    }
  }

  function _procesarSiguiente() {
    const evento = _cola.shift()
    if (!evento) {
      _estado = 'idle'
      _dialogo = null
      return
    }

    if (evento.requiereCaminata) {
      _estado = 'walking'
      _dialogo = null
      _timeoutId = setTimeout(() => {
        _procesarWorking(evento)
      }, DURACION_WALKING_MS)
    } else {
      _procesarWorking(evento)
    }
  }

  function _procesarWorking(evento) {
    _estado = 'working'
    _dialogo = null
    _timeoutId = setTimeout(() => {
      _estado = 'talking'
      _dialogo = evento.texto
      _timeoutId = setTimeout(() => {
        _procesarSiguiente()
      }, DURACION_TALKING_MS)
    }, DURACION_WORKING_MS)
  }

  function encolarEvento(evento) {
    if (!evento || typeof evento.texto !== 'string' || evento.texto.length === 0) {
      throw new Error('encolarEvento requiere un evento con { texto: string }')
    }

    _cola.push(evento)
    if (_estado === 'idle') {
      _procesarSiguiente()
    }
  }

  function getEstado() {
    return _estado
  }

  function getDialogo() {
    return _dialogo
  }

  function getColaLength() {
    return _cola.length
  }

  function reset() {
    _limpiarTimeout()
    _cola = []
    _estado = 'idle'
    _dialogo = null
  }

  return {
    DURACION_WORKING_MS,
    DURACION_TALKING_MS,
    DURACION_WALKING_MS,
    encolarEvento,
    getEstado,
    getDialogo,
    getColaLength,
    reset,
  }
}
