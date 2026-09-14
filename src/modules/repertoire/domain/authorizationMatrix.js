// Canonical capability vocabulary for Repertoire authorization reviews.
// Policy enforcement remains server-side; this matrix prevents role-only
// assumptions from being reintroduced in adapters or views.
export const REPERTOIRE_CAPABILITIES = Object.freeze([
  'READ_MONTAGE', 'READ_FILA', 'EDIT_PREPARATION', 'EDIT_STUDENT_OVERRIDE',
  'READ_HISTORY', 'WRITE_SESSION_REPERTOIRE', 'EDIT_TARGET', 'READ_TARGET',
  'MANAGE_EVENT_RELATION', 'READ_SIGNAL', 'ACK_SIGNAL', 'READ_REPORT'
])

const TEACHER = Object.freeze({ READ_MONTAGE: true, READ_FILA: 'assigned', EDIT_PREPARATION: 'assigned', EDIT_STUDENT_OVERRIDE: 'assigned', READ_HISTORY: 'assigned', WRITE_SESSION_REPERTOIRE: 'owned-session', EDIT_TARGET: 'assigned', READ_TARGET: 'assigned', MANAGE_EVENT_RELATION: false, READ_SIGNAL: 'recipient', ACK_SIGNAL: 'recipient', READ_REPORT: 'assigned' })
const ACADEMIC = Object.freeze({ READ_MONTAGE: 'academic', READ_FILA: 'academic', EDIT_PREPARATION: 'academic', EDIT_STUDENT_OVERRIDE: 'academic', READ_HISTORY: 'academic', WRITE_SESSION_REPERTOIRE: 'academic-session', EDIT_TARGET: 'academic', READ_TARGET: 'academic', MANAGE_EVENT_RELATION: 'explicit', READ_SIGNAL: 'academic', ACK_SIGNAL: 'recipient-or-academic', READ_REPORT: 'academic' })
const DIRECTION = Object.freeze({ READ_MONTAGE: 'broad', READ_FILA: 'broad', EDIT_PREPARATION: false, EDIT_STUDENT_OVERRIDE: false, READ_HISTORY: 'broad', WRITE_SESSION_REPERTOIRE: false, EDIT_TARGET: 'explicit', READ_TARGET: 'broad', MANAGE_EVENT_RELATION: 'explicit', READ_SIGNAL: 'broad', ACK_SIGNAL: 'recipient-or-admin', READ_REPORT: 'broad' })
const ADMIN = Object.freeze({ ...ACADEMIC, MANAGE_EVENT_RELATION: true, ACK_SIGNAL: 'admin', EDIT_TARGET: true })
const FINANCE = Object.freeze({ ...Object.fromEntries(REPERTOIRE_CAPABILITIES.map((capability) => [capability, false])) })

export const REPERTOIRE_AUTHORIZATION_MATRIX = Object.freeze({
  teacher: TEACHER,
  acm: ACADEMIC,
  coordinacion_academica: ACADEMIC,
  direccion: DIRECTION,
  admin: ADMIN,
  superadmin: ADMIN,
  finanzas: FINANCE
})

export const REPERTOIRE_TABLE_POLICY_AUDIT = Object.freeze([
  ['obras', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['obra_versiones', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montajes', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montaje_secciones', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montaje_filas', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montaje_alumnos', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['obra_compases', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montaje_compases', 'academic', 'RPC', 'RPC', 'RPC', 'SAFE'],
  ['catalogo_estados_preparacion', 'academic', 'none', 'none', 'none', 'SAFE'],
  ['montaje_alumno_compases', 'assigned/RPC', 'RPC', 'RPC', 'RPC', 'SAFE'],
  ['montaje_pasajes', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montaje_pasaje_compases', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montaje_grupos_compases', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['montaje_grupo_compases', 'academic', 'academic', 'academic', 'academic', 'TOO_BROAD'],
  ['sesion_repertorio_trabajos', 'session', 'owner/session', 'owner', 'none', 'SAFE'],
  ['sesion_repertorio_trabajo_compases', 'session', 'owner/session', 'owner', 'owner', 'SAFE'],
  ['observacion_sesion_repertorio', 'observation/session', 'owner/session', 'owner', 'owner', 'SAFE'],
  ['montaje_preparacion_historial', 'assigned/academic', 'RPC', 'none', 'none', 'SAFE'],
  ['montaje_targets', 'scope', 'scope', 'scope', 'archive', 'TOO_BROAD'],
  ['montaje_target_milestones', 'target-scope', 'target-scope', 'target-scope', 'archive', 'TOO_BROAD'],
  ['montaje_eventos', 'academic', 'explicit', 'explicit', 'explicit', 'TOO_BROAD'],
  ['repertoire_signals', 'scope', 'trusted-signal', 'none', 'none', 'SAFE'],
  ['repertoire_signal_deliveries', 'recipient', 'system', 'recipient', 'none', 'SAFE']
].map(([table, select, insert, update, remove, status]) => Object.freeze({ table, select, insert, update, remove, status })))
