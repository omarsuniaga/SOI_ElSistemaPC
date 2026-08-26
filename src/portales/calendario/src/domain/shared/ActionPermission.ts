import { DepartmentCode } from './types';

export type UserRole = 'DIR' | 'EVT' | 'FIN' | 'ACM' | 'PRD' | 'LOG' | 'AGT';

export interface RoleMetadata {
  code: UserRole;
  title: string;
  department: DepartmentCode;
  authorityLevel: 'EXECUTIVE' | 'OPERATIONAL' | 'ASSISTANT';
  description: string;
}

export const INSTITUTIONAL_ROLES: Record<UserRole, RoleMetadata> = {
  DIR: {
    code: 'DIR',
    title: 'Dirección General & Rectoría',
    department: 'DIR',
    authorityLevel: 'EXECUTIVE',
    description: 'Máxima autoridad institucional. Puede cancelar eventos confirmados, publicar calendarios maestros y autorizar excepciones.',
  },
  EVT: {
    code: 'EVT',
    title: 'Coordinación de Eventos & Galas',
    department: 'EVT',
    authorityLevel: 'OPERATIONAL',
    description: 'Gestión integral de hitos artísticos, lanzamientos de protocolos y orquestación de conciertos.',
  },
  FIN: {
    code: 'FIN',
    title: 'Administración & Finanzas',
    department: 'FIN',
    authorityLevel: 'OPERATIONAL',
    description: 'Control presupuestario, aprobaciones de gasto y supervisión de cobros y matrículas.',
  },
  ACM: {
    code: 'ACM',
    title: 'Coordinación Académica & Cátedras',
    department: 'ACM',
    authorityLevel: 'OPERATIONAL',
    description: 'Programación semanal de cátedras, asignación docente y gestión pedagógica.',
  },
  PRD: {
    code: 'PRD',
    title: 'Dirección Técnica & Producción',
    department: 'EVT',
    authorityLevel: 'OPERATIONAL',
    description: 'Montaje de salas, requerimientos acústicos y hojas de ruta escénicas.',
  },
  LOG: {
    code: 'LOG',
    title: 'Logística & Espacios',
    department: 'LOG',
    authorityLevel: 'OPERATIONAL',
    description: 'Reserva de salas, control de aforos y despacho de instrumentos y materiales.',
  },
  AGT: {
    code: 'AGT',
    title: 'Hermes AI Assistant (Observador)',
    department: 'AGT',
    authorityLevel: 'ASSISTANT',
    description: 'Inferencia de riesgos temporales y propuesta de diagnósticos. No puede ejecutar acciones sensibles sin aprobación humana.',
  },
};

export type SystemActionCode =
  | 'CANCEL_CONFIRMED_EVENT'
  | 'CREATE_EVENT'
  | 'EDIT_EVENT'
  | 'DELETE_EVENT'
  | 'DELETE_CALENDAR_ITEM'
  | 'EXECUTE_TRIGGER'
  | 'TOGGLE_TRIGGER'
  | 'START_PROTOCOL_RUN'
  | 'CANCEL_PROTOCOL_RUN'
  | 'COMPLETE_TASK'
  | 'APPROVE_TASK'
  | 'ESCALATE_TASK'
  | 'PUBLISH_SCHEDULE'
  | 'SAVE_SCHEDULE_DRAFT'
  | 'RESERVE_VENUE'
  | 'APPROVE_HERMES_PROPOSAL'
  | 'EXPORT_SENSITIVE_DATA'
  | 'MODIFY_TIMEZONE';

export interface ActionPermissionResult {
  action: SystemActionCode;
  allowed: boolean;
  requiresConfirmation?: boolean;
  requiresExecutiveApproval?: boolean;
  reason?: string;
}
