import { createAlertaBadge, createAlertaIcon, createAlertaRow } from './alertaBadge.js'

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`)
  }
}

function assertContains(str, substr, message) {
  if (!str.includes(substr)) {
    throw new Error(`ASSERTION FAILED: ${message} - "${str}" does not contain "${substr}"`)
  }
}

export function runTests() {
  console.log('🧪 Running alertaBadge tests...')
  let passed = 0
  let failed = 0

  try {
    const badgeRojo = createAlertaBadge('rojo')
    assertContains(badgeRojo, 'danger', 'createAlertaBadge(rojo) should contain danger class')
    console.log('✅ createAlertaBadge(rojo) contains danger')
    passed++
  } catch (e) {
    console.error('❌ createAlertaBadge(rojo) failed:', e.message)
    failed++
  }

  try {
    const badgeNaranja = createAlertaBadge('naranja')
    assertContains(badgeNaranja, 'warning', 'createAlertaBadge(naranja) should contain warning class')
    console.log('✅ createAlertaBadge(naranja) contains warning')
    passed++
  } catch (e) {
    console.error('❌ createAlertaBadge(naranja) failed:', e.message)
    failed++
  }

  try {
    const badgeAmarillo = createAlertaBadge('amarillo')
    assertContains(badgeAmarillo, 'info', 'createAlertaBadge(amarillo) should contain info class')
    console.log('✅ createAlertaBadge(amarillo) contains info')
    passed++
  } catch (e) {
    console.error('❌ createAlertaBadge(amarillo) failed:', e.message)
    failed++
  }

  try {
    const icon = createAlertaIcon('caida_calificacion')
    assert(icon === '📉', 'createAlertaIcon(caida_calificacion) should return 📉')
    console.log('✅ createAlertaIcon(caida_calificacion) returns 📉')
    passed++
  } catch (e) {
    console.error('❌ createAlertaIcon(caida_calificacion) failed:', e.message)
    failed++
  }

  try {
    const unknown = createAlertaIcon('tipo_desconocido')
    assert(typeof unknown === 'string' && unknown.length > 0, 'createAlertaIcon(tipo_desconocido) should return a non-empty string')
    console.log('✅ createAlertaIcon(tipo_desconocido) does not crash, returns:', unknown)
    passed++
  } catch (e) {
    console.error('❌ createAlertaIcon(tipo_desconocido) failed:', e.message)
    failed++
  }

  try {
    const testAlerta = {
      tipo_alerta: 'sin_evaluacion',
      color: 'rojo',
      alumno_id: '123',
      alumno_nombre: 'Test Alumno',
      instrumento_principal: 'Piano',
      maestro_nombre: 'Maestro Test',
      descripcion: 'Test description',
      valor_numerico: 5,
      fecha_referencia: '2024-01-15',
    }
    const row = createAlertaRow(testAlerta)
    assert(typeof row === 'string' && row.length > 0, 'createAlertaRow should return non-empty HTML string')
    assertContains(row, 'Test Alumno', 'createAlertaRow should contain student name')
    assertContains(row, 'Sin Evaluación', 'createAlertaRow should contain tipo label')
    console.log('✅ createAlertaRow returns non-empty HTML with correct data')
    passed++
  } catch (e) {
    console.error('❌ createAlertaRow failed:', e.message)
    failed++
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)
  return { passed, failed }
}