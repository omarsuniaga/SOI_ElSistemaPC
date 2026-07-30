/**
 * AGT-PORTAL — Constantes contractuales
 * -------------------------------------
 * Single source of truth para el código del agente. Si cambia el contrato
 * (en 06_IA_AGENTS_LOGIC/AGT-PORTAL_Lector_Portales_V9.md), se cambia aquí
 * y el scanner/comparator/reporter lo respetan.
 */

export const AGENT_CODE = 'AGT-PORTAL'
export const PORTAL_CONTRACT_VERSION = 'V9'

// Estados de cobertura portal ↔ doc
export const COVERAGE_STATES = Object.freeze({
  ALIGNED: 'aligned',
  PORTAL_EXCEEDS_DOC: 'portal_exceeds_doc',
  DOC_EXCEEDS_PORTAL: 'doc_exceeds_portal',
  DRIFT: 'drift',
  LEGACY: 'legacy',
})

// Departamentos oficiales del SOI V9
export const DEPARTMENTS = Object.freeze([
  'DIR',
  'ACM',
  'ADM',
  'FIN',
  'OPR',
  'LOG',
  'COM',
  'EVT',
])

// Mapeo de carpetas portal a departamento canónico
// (lo que AGT-PORTAL-Puente consume y la doc de AGT-PORTAL-{DIR,ACM,...} declara)
export const PORTAL_DEPT_MAP = Object.freeze({
  'portal-maestros': 'ACM',
  portales: null, // necesita análisis fino (subcarpetas)
  'portales/acm': 'ACM',
  'portales/adm': 'ADM',
  'portales/com': 'COM',
  'portales/fin': 'FIN',
  'portales/inventario': 'OPR',
  'portales/luteria': 'OPR',
  'portales/audiciones': 'ACM',
  'portales/calendario': 'ACM',
  'portales/simulador': 'ACM',
  'portales/tecnico': 'AGT',
  'portales/_shared': null,
})

// Patrones de archivo que califican como "vista" o "feature" de un portal
export const FEATURE_FILE_PATTERNS = [
  /\.js$/,
  /\.ts$/,
  /\.vue$/,
]

// Subcarpetas que NO deben escanearse (basura / dependencias / builds)
export const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  '.claude',
  '.windsurf',
  '.obsidian',
  '.hermes',
  '.agent',
  '.agents',
  '.atl',
  '.antigravitycli',
  '.venv',
  '.pi',
  '.worktrees',
  '.tmp',
])

// Extensiones de archivo a ignorar en el escaneo
export const SKIP_EXTENSIONS = new Set([
  '.md',
  '.json',
  '.log',
  '.lock',
  '.map',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.pdf',
  '.docx',
  '.xlsx',
])

// Tamaño máximo de un archivo a leer (saltar binarios pesados o generados)
export const MAX_FILE_BYTES = 200_000

// Mínimo de líneas de código para que un archivo sea candidato a "vista/feature"
export const MIN_LINES_FOR_FEATURE = 5
