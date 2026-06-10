/**
 * DSL Parser — Planificación Module
 *
 * Re-exports everything from the shared DSL parser (single source of truth).
 * All DSL parsing logic lives in src/shared/utils/dslParser.js.
 */
export {
  parseDSL,
  parseDsl,
  highlightDSL,
  highlightDsl,
  getTokenSummary,
  validateDsl,
  TOKEN_COLORS,
  TOKEN_LABELS,
  generateProfileAssertions,
  hasProfileTokens,
} from '../../../shared/utils/dslParser.js'
