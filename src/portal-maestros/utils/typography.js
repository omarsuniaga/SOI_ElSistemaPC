/**
 * Typography preferences — Portal Maestros
 * Escala de texto (fuente compatible con the --pm-font-scale -> --pm-font-size-base chain)
 * y selección de tipografía (--pm-font-family) con persistencia compartida
 * entre perfilView y themeToggle.
 */

export const FONT_SCALE_KEY = 'portal-maestros-font-scale'
export const FONT_FAMILY_KEY = 'portal-maestros-font-family'

export const FONT_SCALES = ['0.5', '0.6', '0.85', '0.9', '1', '1.16', '1.25', '1.5', '1.8']

export const FONT_SCALE_LABELS = {
  '0.5': '50%',
  '0.6': '60%',
  '0.85': '85%',
  '0.9': '90%',
  '1': '100%',
  '1.16': '116%',
  '1.25': '125%',
  '1.5': '150%',
  '1.8': '180%'
}

export const FONT_FAMILIES = [
  { id: 'system', label: 'Sistema', stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", url: null },
  { id: 'inter', label: 'Inter', stack: "'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { id: 'poppins', label: 'Poppins', stack: "'Poppins', -apple-system, 'Segoe UI', Roboto, sans-serif", url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { id: 'nunito', label: 'Nunito', stack: "'Nunito', -apple-system, 'Segoe UI', Roboto, sans-serif", url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
  { id: 'lato', label: 'Lato', stack: "'Lato', 'Segoe UI', Roboto, sans-serif", url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { id: 'merriweather', label: 'Merriweather', stack: "'Merriweather', Georgia, 'Times New Roman', serif", url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap' },
  { id: 'georgia', label: 'Georgia (serif)', stack: "Georgia, 'Times New Roman', serif", url: null }
]

export function normalizeFontScale(scale) {
  const s = String(scale)
  return FONT_SCALES.includes(s) ? s : '1'
}

export function scaleIndex(scale) {
  return FONT_SCALES.indexOf(normalizeFontScale(scale))
}

export function scaleLabel(scale) {
  return FONT_SCALE_LABELS[normalizeFontScale(scale)] || '100%'
}

export function getSavedFontScale() {
  return normalizeFontScale(localStorage.getItem(FONT_SCALE_KEY))
}

export function applyFontScale(scale) {
  const resolved = normalizeFontScale(scale)
  document.documentElement.style.setProperty('--pm-font-scale', resolved)
  localStorage.setItem(FONT_SCALE_KEY, resolved)
  window.dispatchEvent(new CustomEvent('fontScaleChanged', { detail: { scale: resolved } }))
  return resolved
}

export function resolveFontFamily(id) {
  const found = FONT_FAMILIES.find(f => f.id === String(id))
  return found || FONT_FAMILIES[0]
}

export function getSavedFontFamily() {
  const saved = localStorage.getItem(FONT_FAMILY_KEY)
  return resolveFontFamily(saved).id
}

export function applyFontFamily(id) {
  const family = resolveFontFamily(id)
  document.documentElement.style.setProperty('--pm-font-family', family.stack)
  localStorage.setItem(FONT_FAMILY_KEY, family.id)
  loadFont(family)
  window.dispatchEvent(new CustomEvent('fontFamilyChanged', { detail: { family: family.id } }))
  return family.id
}

function loadFont(family) {
  if (!family.url) return
  const cssId = `google-font-${family.id}`
  if (document.getElementById(cssId)) return
  try {
    const link = document.createElement('link')
    link.id = cssId
    link.rel = 'stylesheet'
    link.href = family.url
    link.media = 'print'
    link.onload = () => { link.media = 'all' }
    link.onerror = () => {
      console.warn(`[typography] No se pudo cargar la fuente "${family.label}". Se utilizará la fuente del sistema de respaldo.`)
    }
    document.head.appendChild(link)
  } catch (err) {
    console.warn(`[typography] Error al registrar hoja de estilo de fuente:`, err)
  }
}

export function getCurrentFontStack() {
  return resolveFontFamily(getSavedFontFamily()).stack
}