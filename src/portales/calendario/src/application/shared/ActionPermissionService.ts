import {
  UserRole,
  SystemActionCode,
  ActionPermissionResult,
  INSTITUTIONAL_ROLES,
} from '../../domain/shared/ActionPermission';

export class ActionPermissionService {
  checkPermission(role: UserRole, action: SystemActionCode): ActionPermissionResult {
    // Hermes Assistant has restricted autonomous write permissions
    if (role === 'AGT') {
      const allowedForAgent: SystemActionCode[] = [
        'SAVE_SCHEDULE_DRAFT',
      ];
      if (allowedForAgent.includes(action)) {
        return { action, allowed: true };
      }
      return {
        action,
        allowed: false,
        requiresExecutiveApproval: true,
        reason: 'El agente Hermes requiere supervisión humana autorizada para ejecutar esta acción en producción.',
      };
    }

    // Direction role has full master authority
    if (role === 'DIR') {
      if (action === 'CANCEL_CONFIRMED_EVENT' || action === 'DELETE_EVENT' || action === 'DELETE_CALENDAR_ITEM' || action === 'CANCEL_PROTOCOL_RUN') {
        return {
          action,
          allowed: true,
          requiresConfirmation: true,
          reason: 'Esta es una acción crítica con impacto en toda la institución. Se requiere confirmación explícita.',
        };
      }
      return { action, allowed: true };
    }

    // Specific domain role rules for non-DIR roles
    switch (action) {
      case 'CANCEL_CONFIRMED_EVENT':
      case 'DELETE_EVENT':
      case 'DELETE_CALENDAR_ITEM':
        return {
          action,
          allowed: false,
          requiresExecutiveApproval: true,
          reason: 'Solo Dirección General (DIR) cuenta con autoridad para cancelar o eliminar hitos confirmados en la partitura institucional.',
        };

      case 'PUBLISH_SCHEDULE':
        if (role === 'ACM') {
          return {
            action,
            allowed: true,
            requiresConfirmation: true,
            reason: 'La publicación de la matriz académica bloqueará las franjas para todo el periodo escolar.',
          };
        }
        return {
          action,
          allowed: false,
          reason: 'Solo Coordinación Académica (ACM) y Dirección (DIR) pueden publicar la matriz de horarios.',
        };

      case 'APPROVE_TASK':
        if (role === 'FIN' || role === 'ACM' || role === 'EVT') {
          return { action, allowed: true };
        }
        return {
          action,
          allowed: false,
          reason: 'Se requiere rol con nivel de jefatura o supervisión para validar esta aprobación.',
        };

      case 'APPROVE_HERMES_PROPOSAL':
        return { action, allowed: true };

      case 'START_PROTOCOL_RUN':
      case 'CANCEL_PROTOCOL_RUN':
        if (role === 'EVT' || role === 'PRD') {
          return {
            action,
            allowed: true,
            requiresConfirmation: action === 'CANCEL_PROTOCOL_RUN',
          };
        }
        return {
          action,
          allowed: false,
          reason: 'Solo Eventos, Producción o Dirección pueden orquestar o cancelar Protocol Runs.',
        };

      case 'RESERVE_VENUE':
        if (role === 'LOG' || role === 'PRD' || role === 'EVT' || role === 'ACM') {
          return { action, allowed: true };
        }
        return { action, allowed: false, reason: 'Rol no autorizado para bloquear espacios institucionales.' };

      default:
        return { action, allowed: true };
    }
  }
}
