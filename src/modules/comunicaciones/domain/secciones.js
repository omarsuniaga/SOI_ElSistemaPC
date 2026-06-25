/**
 * secciones.js — Lógica de dominio para Comunicaciones.
 * Normaliza instrumentos (los datos vienen sucios: "Violin", "Violín", "Volín"),
 * los agrupa en familias/secciones (cuerdas, maderas, metales, percusión) y
 * construye links wa.me y teléfonos normalizados para República Dominicana.
 */

// Normalización: variantes sucias → forma canónica.
const NORMALIZACION = {
  violin: 'Violín',
  'volín': 'Violín',
  'violín': 'Violín',
  viola: 'Viola',
  cello: 'Cello',
  violoncello: 'Cello',
  violonchelo: 'Cello',
  chelo: 'Cello',
  contrabajo: 'Contrabajo',
  flauta: 'Flauta',
  oboe: 'Oboe',
  clarinete: 'Clarinete',
  fagot: 'Fagot',
  saxofon: 'Saxofón',
  'saxofón': 'Saxofón',
  corno: 'Corno',
  trompeta: 'Trompeta',
  'trombón': 'Trombón',
  trombon: 'Trombón',
  tuba: 'Tuba',
  'percusión': 'Percusión',
  percusion: 'Percusión',
  coro: 'Coro',
  piano: 'Piano',
}

// Familias (secciones de orquesta).
export const FAMILIAS = {
  cuerdas: { label: 'Cuerdas', icon: 'bi-music-note-beamed', instrumentos: ['Violín', 'Viola', 'Cello', 'Contrabajo'] },
  maderas: { label: 'Maderas', icon: 'bi-wind', instrumentos: ['Flauta', 'Oboe', 'Clarinete', 'Fagot', 'Saxofón'] },
  metales: { label: 'Metales', icon: 'bi-trumpet', instrumentos: ['Corno', 'Trompeta', 'Trombón', 'Tuba'] },
  percusion: { label: 'Percusión', icon: 'bi-bullseye', instrumentos: ['Percusión'] },
  coro: { label: 'Coro', icon: 'bi-people', instrumentos: ['Coro'] },
  otros: { label: 'Otros', icon: 'bi-three-dots', instrumentos: ['Piano'] },
}

/**
 * Normaliza un nombre de instrumento a su forma canónica.
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizarInstrumento(raw) {
  if (!raw) return null
  const key = String(raw).trim().toLowerCase()
  return NORMALIZACION[key] || capitalizar(String(raw).trim())
}

/**
 * Devuelve la familia/sección de un instrumento.
 * @param {string} instrumentoRaw
 * @returns {string} clave de FAMILIAS (cuerdas|maderas|metales|percusion|coro|otros)
 */
export function familiaDe(instrumentoRaw) {
  const inst = normalizarInstrumento(instrumentoRaw)
  if (!inst) return 'otros'
  for (const [clave, fam] of Object.entries(FAMILIAS)) {
    if (fam.instrumentos.includes(inst)) return clave
  }
  return 'otros'
}

/**
 * Normaliza un teléfono a solo dígitos con código de país (RD = 1).
 * RD usa +1 con códigos de área 809/829/849.
 * @param {string} tel
 * @returns {string|null} dígitos listos para wa.me, o null si no es válido
 */
export function normalizarTelefono(tel) {
  if (!tel) return null
  let d = String(tel).replace(/\D/g, '')
  if (d.length === 0) return null
  // 10 dígitos sin código de país → anteponer 1 (RD/US)
  if (d.length === 10) d = '1' + d
  // Demasiado corto para ser válido
  if (d.length < 11) return null
  return d
}

/**
 * Construye un link wa.me (click-to-chat) con mensaje pre-cargado.
 * @param {string} telefono
 * @param {string} mensaje
 * @returns {string|null} URL https://wa.me/... o null si el teléfono no es válido
 */
export function construirWaLink(telefono, mensaje = '') {
  const d = normalizarTelefono(telefono)
  if (!d) return null
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''
  return `https://wa.me/${d}${texto}`
}

/**
 * Resuelve las variables de una plantilla contra un contacto.
 * Variables soportadas: {nombre_alumno} {representante} {instrumento} {seccion}
 * @param {string} texto
 * @param {object} contacto
 * @returns {string}
 */
export function resolverVariables(texto, contacto = {}) {
  if (!texto) return ''
  const fam = FAMILIAS[familiaDe(contacto.instrumento)]
  return texto
    .replace(/\{nombre_alumno\}/g, contacto.alumno || '')
    .replace(/\{representante\}/g, contacto.contactoNombre || '')
    .replace(/\{instrumento\}/g, normalizarInstrumento(contacto.instrumento) || '')
    .replace(/\{seccion\}/g, fam?.label || '')
}

function capitalizar(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s
}
