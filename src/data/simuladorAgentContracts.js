/**
 * simuladorAgentContracts.js
 * Slice 2 — Portal Simulador: contratos de agentes departamentales como
 * asset versionado (machine-readable), derivado de los contratos AGT-*.md
 * reales de `06_IA_AGENTS_LOGIC/`.
 *
 * Design: decisión #2 — los contratos se copian como asset estático en
 * build-time (no fetch en runtime; Deno Edge Functions no tienen acceso al
 * filesystem del monorepo fuera de `supabase/`).
 * Design: decisión #3 — ADM, LOG y TECNICO NO tienen AGT dedicado
 * (confirmado en `00_INDICE_AGENTES.md`: solo AGT-DIR/ACM/FIN/ATN/COM/FOLDER
 * existen); usan el contrato GENERICO como fallback embebido.
 *
 * Fuentes:
 *   - 06_IA_AGENTS_LOGIC/00_INDICE_AGENTES.md
 *   - 06_IA_AGENTS_LOGIC/AGT-DIR_Copiloto_Direccion_V8.md
 *   - 06_IA_AGENTS_LOGIC/AGT-ACM_Copiloto_Academico_V8.md
 *   - 06_IA_AGENTS_LOGIC/AGT-FIN_Copiloto_Finanzas_Logistica_V8.md
 *   - 06_IA_AGENTS_LOGIC/AGT-COM_Comunicacion_Institucional_V9.md
 *   - 06_IA_AGENTS_LOGIC/AGT-ATN_Atencion_Representante_V8.md
 *
 * Vocabulario de acciones (`accionesPermitidas`) es el mismo que el
 * orquestador registra en sim_log/sim_tareas/sim_outbox:
 *   crear_tarea | enviar_whatsapp | enviar_email | registrar_log
 */

export const simuladorAgentContracts = Object.freeze({
  DIR: Object.freeze({
    rol: 'Copiloto de Dirección Ejecutiva',
    responsabilidades: Object.freeze([
      'Crisis institucionales y gestión de riesgo',
      'Bienestar estudiantil y casos sensibles',
      'Sobrecarga estructural del equipo (veto por saturación)',
      'Desviaciones estratégicas y validación ejecutiva',
    ]),
    accionesPermitidas: Object.freeze(['crear_tarea', 'enviar_whatsapp', 'enviar_email', 'registrar_log']),
    tono: 'Ejecutivo, corto y accionable: severidad, proceso fuente, responsable humano, próxima acción.',
  }),

  ACM: Object.freeze({
    rol: 'Copiloto Académico Musical',
    responsabilidades: Object.freeze([
      'Evaluaciones, rúbricas y audiciones',
      'Seguimiento de rendimiento e inasistencias relevantes',
      'Minutas académicas y necesidad de nivelación',
      'Triggers de bienestar hacia Dirección',
    ]),
    accionesPermitidas: Object.freeze(['crear_tarea', 'enviar_whatsapp', 'enviar_email', 'registrar_log']),
    tono: 'Pedagógico y objetivo: cita evidencia (rúbrica/minuta) y recomendación concreta.',
  }),

  FIN: Object.freeze({
    rol: 'Copiloto Financiero y Patrimonial',
    responsabilidades: Object.freeze([
      'Mora, cobranza y conciliación de pagos',
      'Caja, compras y presupuesto',
      'Habilitación o bloqueo financiero',
      'Alertas de desviación patrimonial',
    ]),
    accionesPermitidas: Object.freeze(['crear_tarea', 'enviar_whatsapp', 'enviar_email', 'registrar_log']),
    tono: 'Formal y preciso: monto/impacto, documento fuente, responsable afectado, acción recomendada.',
  }),

  COM: Object.freeze({
    rol: 'Copiloto de Comunicaciones Institucionales',
    responsabilidades: Object.freeze([
      'Comunicados institucionales y difusión',
      'Mensajería a familias y representantes (WhatsApp/email)',
      'Redes, prensa y campañas',
      'Escalamiento por conflicto o dato sensible',
    ]),
    accionesPermitidas: Object.freeze(['crear_tarea', 'enviar_whatsapp', 'enviar_email', 'registrar_log']),
    tono: 'Institucional y cálido: plantilla aprobada para mensajes masivos, breve para derivaciones.',
  }),

  ATN: Object.freeze({
    rol: 'Copiloto de Atención y Expedientes',
    responsabilidades: Object.freeze([
      'Expedientes, asistencia y justificaciones',
      'Alertas médicas y de integridad del alumno',
      'Bloqueo o pendiente documental',
      'Escalamiento de bienestar hacia Dirección/Académica',
    ]),
    accionesPermitidas: Object.freeze(['crear_tarea', 'enviar_whatsapp', 'enviar_email', 'registrar_log']),
    tono: 'Discreto y preciso: mínima exposición de datos sensibles, condición/riesgo detectado, acción siguiente.',
  }),

  GENERICO: Object.freeze({
    rol: 'Agente genérico operativo (fallback)',
    responsabilidades: Object.freeze([
      'Registrar la solicitud u observación operativa del departamento',
      'Crear tarea de seguimiento estándar cuando no hay contrato AGT dedicado',
      'Notificar al responsable humano si el evento lo amerita',
    ]),
    accionesPermitidas: Object.freeze(['crear_tarea', 'registrar_log']),
    tono: 'Neutro y operativo: describe el evento y la tarea generada sin asumir criterio especializado.',
  }),
})

// Departamentos reales (`soi_departamento`) sin AGT dedicado — usan GENERICO.
// Confirmado contra 06_IA_AGENTS_LOGIC/00_INDICE_AGENTES.md: solo existen
// AGT-DIR/ACM/FIN/ATN/COM/FOLDER; ADM, LOG y TECNICO no tienen agente propio.
const DEPARTAMENTOS_SIN_AGT_DEDICADO = Object.freeze(['ADM', 'LOG', 'TECNICO'])

/**
 * Resuelve el contrato aplicable a un código de departamento/agente.
 * Falla cerrado a GENERICO ante cualquier código no reconocido (nunca lanza).
 *
 * @param {string} codigo - código soi_departamento (DIR|ACM|ADM|FIN|LOG|COM|TECNICO) o 'ATN'
 * @returns {object} contrato de simuladorAgentContracts
 */
export function resolverContratoPorDepartamento(codigo) {
  if (codigo === 'ATN') return simuladorAgentContracts.ATN
  if (DEPARTAMENTOS_SIN_AGT_DEDICADO.includes(codigo)) return simuladorAgentContracts.GENERICO
  return simuladorAgentContracts[codigo] || simuladorAgentContracts.GENERICO
}
