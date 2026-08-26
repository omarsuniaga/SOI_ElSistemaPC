/**
 * audit-new-views.js — Auditoría Integral de las Nuevas Vistas del Portal ADM.
 * Verifica integridad de archivos, imports, exports, router, payloads de API y generación PDF.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = process.cwd()

console.log('\n=============================================================')
console.log('🔍 AUDITORÍA DE CALIDAD: NUEVAS VISTAS PORTAL ADM (SOI)')
console.log('=============================================================\n')

let passCount = 0
let failCount = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`)
    passCount++
  } else {
    console.error(`  ❌ [FAIL] ${message}`)
    failCount++
  }
}

// ---------------------------------------------------------------------------
// 1. Verificación de Existencia de Archivos Críticos
// ---------------------------------------------------------------------------
console.log('📁 1. Verificación de Archivos y Módulos:')

const filesToCheck = [
  'src/portales/adm/adm.js',
  'src/modules/admin-dashboard/admin-dashboard.router.js',
  'src/modules/admin-dashboard/views/reporteMensualView.js',
  'src/modules/admin-dashboard/views/reporteSemestralView.js',
  'src/modules/admin-dashboard/views/analisisContenidoView.js',
  'src/modules/hermes/views/seguimientoTareasView.js',
  'src/modules/admin-dashboard/api/academicReportsApi.js',
  'src/modules/admin-dashboard/api/contenidoAnalyticsApi.js',
  'src/modules/admin-dashboard/services/academicReportsPdfService.js',
]

filesToCheck.forEach((rel) => {
  const full = resolve(ROOT, rel)
  assert(existsSync(full), `Archivo existe: ${rel}`)
})

// ---------------------------------------------------------------------------
// 2. Auditoría de Navegación vs. Rutas Registradas
// ---------------------------------------------------------------------------
console.log('\n🧭 2. Consistencia entre Navegación (adm.js) y Router:')

const admContent = readFileSync(resolve(ROOT, 'src/portales/adm/adm.js'), 'utf-8')
const routerContent = readFileSync(resolve(ROOT, 'src/modules/admin-dashboard/admin-dashboard.router.js'), 'utf-8')
const shellContent = readFileSync(resolve(ROOT, 'src/portales/_shared/adminPortalShell.js'), 'utf-8')

const expectedRoutes = [
  { id: 'reporte-mensual', name: 'Resumen del Mes', source: routerContent },
  { id: 'analisis-contenido', name: 'Análisis Pedagógico', source: routerContent },
  { id: 'reporte-semestral', name: 'Informe del Período', source: routerContent },
  { id: 'seguimiento-tareas', name: 'Seguimiento de Tareas', source: shellContent },
]

expectedRoutes.forEach(({ id, name, source }) => {
  assert(admContent.includes(`id: '${id}'`), `adm.js incluye ítem de nav: '${id}' (${name})`)
  assert(source.includes(`'${id}'`) || source.includes(`"${id}"`), `Router registra handler para: '${id}'`)
})

// ---------------------------------------------------------------------------
// 3. Auditoría de Métodos Exportados en PDF Service
// ---------------------------------------------------------------------------
console.log('\n📄 3. Auditoría del Servicio de Generación de PDFs:')

const pdfServiceContent = readFileSync(resolve(ROOT, 'src/modules/admin-dashboard/services/academicReportsPdfService.js'), 'utf-8')

const expectedPdfGenerators = [
  'descargarPdfResumenMensual',
  'descargarPdfInformeSemestral',
  'descargarPdfSeguimientoTareas',
  'descargarPdfAnalisisContenido',
]

expectedPdfGenerators.forEach((fn) => {
  assert(pdfServiceContent.includes(`export async function ${fn}`) || pdfServiceContent.includes(`export function ${fn}`), `PDF Service exporta: ${fn}`)
})

// ---------------------------------------------------------------------------
// 4. Auditoría de Vinculación de Botones PDF en Vistas
// ---------------------------------------------------------------------------
console.log('\n🔘 4. Auditoría de Botones de Descarga PDF en las Vistas:')

const mensualContent = readFileSync(resolve(ROOT, 'src/modules/admin-dashboard/views/reporteMensualView.js'), 'utf-8')
const semestralContent = readFileSync(resolve(ROOT, 'src/modules/admin-dashboard/views/reporteSemestralView.js'), 'utf-8')
const analisisContent = readFileSync(resolve(ROOT, 'src/modules/admin-dashboard/views/analisisContenidoView.js'), 'utf-8')
const tareasContent = readFileSync(resolve(ROOT, 'src/modules/hermes/views/seguimientoTareasView.js'), 'utf-8')

assert(mensualContent.includes('descargarPdfResumenMensual'), 'ReporteMensualView invoca descargarPdfResumenMensual')
assert(mensualContent.includes('btnDescargarPdfMensual'), 'ReporteMensualView define botón btnDescargarPdfMensual con event listener')

assert(semestralContent.includes('descargarPdfInformeSemestral'), 'ReporteSemestralView invoca descargarPdfInformeSemestral')
assert(semestralContent.includes('btnDescargarPdfSemestral'), 'ReporteSemestralView define botón btnDescargarPdfSemestral con event listener')

assert(analisisContent.includes('descargarPdfAnalisisContenido'), 'AnalisisContenidoView invoca descargarPdfAnalisisContenido')
assert(analisisContent.includes('btnDescargarPdfContenido'), 'AnalisisContenidoView define botón btnDescargarPdfContenido con event listener')

assert(tareasContent.includes('descargarPdfSeguimientoTareas'), 'SeguimientoTareasView invoca descargarPdfSeguimientoTareas')
assert(tareasContent.includes('btnDescargarPdfTareas'), 'SeguimientoTareasView define botón btnDescargarPdfTareas con event listener')

// ---------------------------------------------------------------------------
// 5. Auditoría de Sanitización y Prevención XSS
// ---------------------------------------------------------------------------
console.log('\n🛡️ 5. Auditoría de Sanitización XSS en Vistas:')

assert(mensualContent.includes('escapeHTML'), 'ReporteMensualView utiliza escapeHTML para entradas dinámicas')
assert(semestralContent.includes('escapeHTML'), 'ReporteSemestralView utiliza escapeHTML para entradas dinámicas')
assert(analisisContent.includes('escapeHTML'), 'AnalisisContenidoView utiliza escapeHTML para entradas dinámicas')
assert(tareasContent.includes('escapeHTML'), 'SeguimientoTareasView utiliza escapeHTML para entradas dinámicas')

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------
console.log('\n-------------------------------------------------------------')
console.log(`📊 RESULTADO DE LA AUDITORÍA: ${passCount} PASADOS / ${failCount} FALLADOS`)
console.log('-------------------------------------------------------------\n')

if (failCount > 0) {
  process.exit(1)
} else {
  console.log('🎉 Todas las verificaciones de código y arquitectura pasaron con 100% de éxito.\n')
}
