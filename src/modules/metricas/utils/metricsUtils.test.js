import * as Utils from './metricsUtils.js'

function assert(condicion, mensaje) {
  if (!condicion) {
    console.error(`❌ FAIL: ${mensaje}`)
    return false
  } else {
    console.log(`✅ PASS: ${mensaje}`)
    return true
  }
}

export function runTests() {
  console.group('Testing Metrics Utilities')
  let success = true

  // formatScore
  const score87 = Utils.formatScore(87)
  success &= assert(score87.text === '87/100', 'formatScore(87) retorna texto correcto')
  success &= assert(score87.colorClass === 'text-danger', 'formatScore(87) es rojo (riesgo alto)')
  
  const score20 = Utils.formatScore(20)
  success &= assert(score20.colorClass === 'text-success', 'formatScore(20) es verde (riesgo bajo)')

  // formatTasa
  const tasa95 = Utils.formatTasa(95.4)
  success &= assert(tasa95.text === '95.4%', 'formatTasa(95.4) retorna texto correcto')
  success &= assert(tasa95.colorClass === 'text-success', 'formatTasa(95.4) es verde')

  const tasa60 = Utils.formatTasa(60)
  success &= assert(tasa60.colorClass === 'text-danger', 'formatTasa(60) es rojo')

  // formatDelta
  const deltaPos = Utils.formatDelta(0.5)
  success &= assert(deltaPos.text.includes('+0.5 ↑'), 'formatDelta(0.5) tiene signo + y flecha arriba')
  success &= assert(deltaPos.colorClass === 'text-success', 'formatDelta(0.5) es verde')

  const deltaNeg = Utils.formatDelta(-1.2)
  success &= assert(deltaNeg.text.includes('-1.2 ↓'), 'formatDelta(-1.2) tiene flecha abajo')
  success &= assert(deltaNeg.colorClass === 'text-danger', 'formatDelta(-1.2) es rojo')

  // getNivelLabel
  success &= assert(Utils.getNivelLabel('basico') === 'Básico', 'getNivelLabel maps "basico" to "Básico"')
  
  // getColorAlerta
  success &= assert(Utils.getColorAlerta('rojo') === 'danger', 'getColorAlerta("rojo") is "danger"')
  success &= assert(Utils.getColorAlerta('naranja') === 'warning', 'getColorAlerta("naranja") is "warning"')

  // calcularTendencia
  success &= assert(Utils.calcularTendencia([10, 20, 30]) === 'subiendo', 'calcularTendencia [10, 20, 30] is subiendo')
  success &= assert(Utils.calcularTendencia([30, 20, 10]) === 'bajando', 'calcularTendencia [30, 20, 10] is bajando')
  success &= assert(Utils.calcularTendencia([10, 10, 10]) === 'estable', 'calcularTendencia [10, 10, 10] is estable')

  console.groupEnd()
  return success
}
