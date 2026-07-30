/**
 * AGT-PORTAL — Lector de Portales del SOI V9
 * ------------------------------------------------
 * Implementa el contrato definido en:
 *   - 06_IA_AGENTS_LOGIC/AGT-PORTAL_Lector_Portales_V9.md
 *   - 00_SISTEMA_MAESTRO/SOI_DOCUMENTACION_Y_PORTALES_V9.md
 *   - 00_SISTEMA_MAESTRO/SOI_HERMES_OPERATIONS_MANAGER_V9.md
 *
 * Responsabilidad:
 *   Recorrer el árbol 09_SOI_WEB_PORTAL/, compararlo con la documentación
 *   institucional (VIGENCIA + SOI_PROCESS_INDEX + MOCs) y emitir hallazgos:
 *     - portal_exceeds_doc : existe en el portal, falta en la documentación
 *     - doc_exceeds_portal : existe en la documentación, falta en el portal
 *     - drift              : existe en ambos pero con desalineación
 *     - aligned            : existe en ambos y coincide
 *     - legacy             : existe en el portal pero marcado obsoleto
 *
 * Uso:
 *   import { scanPortal, comparePortalDocs, buildReport } from 'agents/agt-portal'
 *   const features = scanPortal(portalRoot)
 *   const { findings, coverage } = comparePortalDocs(features, { processIndex, vigencia, mocs })
 *   const report = buildReport({ findings, coverage, department })
 *
 * No depende de Node APIs (fs/path) en este entry — el scanner se invoca
 * explícitamente pasando paths. La CLI se encarga de resolverlos.
 */

import { scanPortal } from './scanner.js'
import { comparePortalDocs } from './comparator.js'
import { buildReport, buildMarkdownReport, buildCoverageIndex } from './reporter.js'
import { PORTAL_CONTRACT_VERSION, AGENT_CODE, COVERAGE_STATES } from './contract.js'

export {
  scanPortal,
  comparePortalDocs,
  buildReport,
  buildMarkdownReport,
  buildCoverageIndex,
  PORTAL_CONTRACT_VERSION,
  AGENT_CODE,
  COVERAGE_STATES,
}

export const agentContract = {
  agent_code: AGENT_CODE,
  contract_version: PORTAL_CONTRACT_VERSION,
  coverage_domain: 'portal_observation',
  purpose:
    'Recorrer el portal, compararlo con la documentación institucional, emitir hallazgos accionables y mantener el índice de cobertura vivo.',
  decision_rules: [
    'priorizar siempre el documento rector vigente',
    'si el portal excede al documento, crear brecha de documentación y proponer escritura al departamento',
    'si el documento excede al portal, crear brecha de implementación y generar tarea de portal',
    'si hay conflicto, escalar a Hermes y Dirección',
  ],
  evidence_required: [
    'archivo de portal leído',
    'documento rector leído',
    'vista o función asociada',
    'brecha o coincidencia detectada',
  ],
  sla: 'mismo día para barridos; 24h para mapeos relacionales',
  failure_mode: 'si no existe documentación asociada, marcar drift y pedir normalización',
  output_states: COVERAGE_STATES,
}
