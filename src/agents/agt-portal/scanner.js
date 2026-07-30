/**
 * AGT-PORTAL — Scanner
 * --------------------
 * Recorre el árbol de portales y extrae una lista normalizada de "features"
 * (vistas, servicios, componentes, dashboards) con metadata para que el
 * comparator pueda cruzarlas contra la documentación.
 *
 * No usa fs directamente. Recibe un objeto "fsAdapter" con la firma:
 *   { readdirSync, statSync, readFileSync, existsSync }
 * así puede correr tanto en Node (CLI) como en navegador (tests jsdom).
 *
 * La firma pública es:
 *   scanPortal(rootPath, options = {}, fsAdapter = nodeFs)
 *
 * options:
 *   - includeDirs: lista de subcarpetas relativas a root a escanear
 *                  (default: ['portal-maestros', 'portales'])
 *   - maxDepth:    profundidad máxima de recursión (default: 8)
 */

import {
  FEATURE_FILE_PATTERNS,
  SKIP_DIRS,
  SKIP_EXTENSIONS,
  MAX_FILE_BYTES,
  MIN_LINES_FOR_FEATURE,
  PORTAL_DEPT_MAP,
  DEPARTMENTS,
} from './contract.js'

/**
 * Adapter para Node — solo se carga si el caller NO inyecta su propio fsAdapter.
 * Esto mantiene al módulo compatible con jsdom (vitest) y con un futuro
 * build para navegador.
 */
let _nodeFs = null
async function getNodeFs() {
  if (_nodeFs) return _nodeFs
  const fs = await import('node:fs')
  _nodeFs = {
    readdirSync: (p) => fs.readdirSync(p, { withFileTypes: true }),
    statSync:    (p) => fs.statSync(p),
    readFileSync:(p, enc) => fs.readFileSync(p, enc),
    existsSync:  (p) => fs.existsSync(p),
  }
  return _nodeFs
}

/**
 * Normaliza un nombre de archivo a un identificador humano.
 *  - 'cobrosView.js'      -> 'cobros'
 *  - 'finDashboardView.js'-> 'fin-dashboard'
 *  - 'reciboPdf.js'       -> 'recibo-pdf'
 */
function normalizeFeatureName(filename) {
  const base = filename.replace(/\.(js|ts|vue)$/, '')
  // Quitar sufijos típicos
  const cleaned = base
    .replace(/(View|Component|Service|Api|Store|Logic|Helper)$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
  return cleaned || base.toLowerCase()
}

/**
 * Intenta inferir el departamento al que pertenece un feature a partir de:
 *  1. La ruta (PORTAL_DEPT_MAP) si está en portales/<algo>/
 *  2. El nombre del archivo (módulo)
 *  3. La importación de un módulo conocido (heurística por contenido)
 */
function inferDepartment(relPath, fileName, content) {
  // 1. Por ruta
  const top = relPath.split(/[\\/]/).slice(0, 2).join('/')
  if (PORTAL_DEPT_MAP[top] !== undefined && PORTAL_DEPT_MAP[top] !== null) {
    return PORTAL_DEPT_MAP[top]
  }

  // 2. Por nombre (heurística simple)
  const lower = fileName.toLowerCase()
  for (const dept of DEPARTMENTS) {
    const re = new RegExp(`(^|[^a-z])${dept.toLowerCase()}([^a-z]|$)`)
    if (re.test(lower)) return dept
  }

  // 3. Por contenido (imports relativos a módulos conocidos)
  if (content) {
    const importMatches = content.match(/from\s+['"]\.\.?\/([^'"]+)['"]/g) || []
    for (const m of importMatches) {
      const target = m.match(/from\s+['"]\.\.?\/([^'"]+)['"]/)[1].toLowerCase()
      if (target.includes('modules/alumnos') || target.includes('modules/clases')) return 'ACM'
      if (target.includes('modules/caja') || target.includes('modules/finanzas')) return 'FIN'
      if (target.includes('modules/inventario') || target.includes('modules/luteria')) return 'OPR'
      if (target.includes('modules/comunicaciones')) return 'COM'
      if (target.includes('modules/admin')) return 'ADM'
      if (target.includes('modules/hermes')) return 'AGT'
    }
  }

  return 'SIN_ASIGNAR'
}

/**
 * Heurística: el archivo es una "vista" si termina en View, o está en /views/.
 * Es un "servicio" si termina en Service, o está en /services/.
 * Es un "componente" si está en /components/ o termina en Component.
 * Es un "api" si está en /api/ o termina en Api.
 * Es un "dashboard" si el nombre contiene Dashboard o Home.
 */
function inferFeatureKind(relPath, fileName) {
  const lower = fileName.toLowerCase()
  const inViews = relPath.includes(`${'\\'}views${'\\'}`) || relPath.includes('/views/')
  const inServices = relPath.includes(`${'\\'}services${'\\'}`) || relPath.includes('/services/')
  const inComponents = relPath.includes(`${'\\'}components${'\\'}`) || relPath.includes('/components/')
  const inApi = relPath.includes(`${'\\'}api${'\\'}`) || relPath.includes('/api/')

  if (inViews || lower.endsWith('view.js') || lower.endsWith('view.ts')) return 'view'
  if (inServices || lower.endsWith('service.js') || lower.endsWith('service.ts')) return 'service'
  if (inApi || lower.endsWith('api.js') || lower.endsWith('api.ts')) return 'api'
  if (inComponents || lower.endsWith('component.js') || lower.endsWith('component.vue')) return 'component'
  if (lower.includes('dashboard') || lower.endsWith('home.js')) return 'dashboard'
  return 'feature'
}

function shouldSkipDir(name) {
  return SKIP_DIRS.has(name) || name.startsWith('.') && name !== '.'
}

function shouldScanFile(name) {
  if (SKIP_EXTENSIONS.has('.' + name.split('.').pop().toLowerCase())) return false
  return FEATURE_FILE_PATTERNS.some((re) => re.test(name))
}

function walkDir(absPath, relBase, depth, maxDepth, out, fs) {
  if (depth > maxDepth) return
  let entries
  try {
    entries = fs.readdirSync(absPath)
  } catch {
    return
  }
  for (const entry of entries) {
    if (shouldSkipDir(entry)) continue
    const childAbs = `${absPath}/${entry}`.replace(/[\\/]+/g, '/')
    const childRel = relBase ? `${relBase}/${entry}` : entry
    let stat
    try {
      stat = fs.statSync(childAbs)
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      walkDir(childAbs, childRel, depth + 1, maxDepth, out, fs)
    } else if (stat.isFile() && shouldScanFile(entry)) {
      if (stat.size > MAX_FILE_BYTES) continue
      out.push({ absPath: childAbs, relPath: childRel, name: entry, size: stat.size })
    }
  }
}

/**
 * scanPortal
 * ----------
 * @param {string} rootPath - carpeta raíz del portal (ej. 09_SOI_WEB_PORTAL)
 * @param {object} [options]
 * @param {object} [fsAdapter] - inyeccion de fs (default: Node fs)
 * @returns {Promise<{ root, scanned_at, total_files, total_features, departments: object, features: object[] }>}
 */
export async function scanPortal(rootPath, options = {}, fsAdapter = null) {
  const fs = fsAdapter || (await getNodeFs())
  const includeDirs = options.includeDirs || ['portal-maestros', 'portales']
  const maxDepth = options.maxDepth || 8
  const candidates = []

  if (!fs.existsSync(rootPath)) {
    return {
      root: rootPath,
      scanned_at: new Date().toISOString(),
      total_files: 0,
      total_features: 0,
      departments: {},
      features: [],
      warnings: [`rootPath no existe: ${rootPath}`],
    }
  }

  for (const sub of includeDirs) {
    const abs = `${rootPath}/${sub}`.replace(/[\\/]+/g, '/')
    if (!fs.existsSync(abs)) continue
    walkDir(abs, sub, 0, maxDepth, candidates, fs)
  }

  const features = []
  for (const cand of candidates) {
    let content = ''
    let lines = 0
    try {
      content = fs.readFileSync(cand.absPath, 'utf8')
      lines = content.split(/\r?\n/).length
    } catch {
      continue
    }
    if (lines < MIN_LINES_FOR_FEATURE) continue

    const featureName = normalizeFeatureName(cand.name)
    const department = inferDepartment(cand.relPath, cand.name, content)
    const kind = inferFeatureKind(cand.relPath, cand.name)

    features.push({
      feature_id: `${department}__${cand.relPath.replace(/[\\/]/g, '__').replace(/\.(js|ts|vue)$/, '')}`,
      name: featureName,
      file: cand.name,
      rel_path: cand.relPath,
      abs_path: cand.absPath,
      department,
      kind,
      lines,
      // tags extraídos por regex simple
      tags: extractTags(content),
    })
  }

  // Agrupar por departamento
  const departments = {}
  for (const f of features) {
    if (!departments[f.department]) departments[f.department] = []
    departments[f.department].push(f)
  }

  return {
    root: rootPath,
    scanned_at: new Date().toISOString(),
    total_files: candidates.length,
    total_features: features.length,
    departments,
    features,
    warnings: [],
  }
}

const TAG_PATTERNS = [
  { re: /kpi|indicador|metricas/i, tag: 'metrics' },
  { re: /asistencia|attendance/i, tag: 'attendance' },
  { re: /pago|cobro|recibo|caja|mora/i, tag: 'finance' },
  { re: /clase|alumno|leccion|recital/i, tag: 'pedagogy' },
  { re: /inventario|activo|comodato/i, tag: 'inventory' },
  { re: /whatsapp|comunicacion|chat/i, tag: 'comms' },
  { re: /donant|patrocin|sponsor/i, tag: 'fundraising' },
  { re: /crisis|alerta|riesgo/i, tag: 'risk' },
  { re: /audicion|concurso|jurado/i, tag: 'audition' },
]

function extractTags(content) {
  const tags = new Set()
  for (const { re, tag } of TAG_PATTERNS) {
    if (re.test(content)) tags.add(tag)
  }
  return Array.from(tags)
}
