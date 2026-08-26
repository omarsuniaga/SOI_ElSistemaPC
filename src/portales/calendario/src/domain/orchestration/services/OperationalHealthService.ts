import { CalendarItem } from '../../calendar/entities/CalendarItem';
import { InstitutionalTask } from '../../tasks/entities/InstitutionalTask';
import { TaskDAGResolution } from '../../tasks/policies/TaskUnlockPolicy';

export type HealthStatus = 'HEALTHY' | 'ATTENTION' | 'AT_RISK' | 'CRITICAL';

export interface HealthEvaluationResult {
  score: number; // 0-100
  status: HealthStatus;
  reasons: string[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    criticalOverdueTasks: number;
    blockedTasks: number;
    missingEvidenceCount: number;
    daysRemaining: number;
  };
}

export class OperationalHealthService {
  /**
   * Pure domain evaluation of institutional health for a Calendar Item and its orchestrated tasks.
   */
  static evaluate(
    calendarItem: CalendarItem,
    tasks: InstitutionalTask[],
    dagResolutions?: Map<string, TaskDAGResolution>
  ): HealthEvaluationResult {
    let score = 100;
    const reasons: string[] = [];

    const now = new Date();
    const daysRemaining = calendarItem.daysUntilStart(now);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const overdueTasks = tasks.filter(t => t.isOverdue).length;
    const criticalOverdueTasks = tasks.filter(
      t => t.isOverdue && (t.priority === 'CRITICAL' || t.priority === 'HIGH')
    ).length;

    let blockedTasks = 0;
    if (dagResolutions) {
      for (const res of dagResolutions.values()) {
        if (res.isBlocked) blockedTasks++;
      }
    } else {
      blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;
    }

    const missingEvidenceTasks = tasks.filter(
      t => t.evidenceRequired && !t.isEvidenceFulfilled && t.status !== 'CANCELLED'
    ).length;

    const waitingApprovalTasks = tasks.filter(t => t.status === 'WAITING_APPROVAL').length;

    // Penalty deductions based on domain policies:
    if (criticalOverdueTasks > 0) {
      const penalty = Math.min(35, criticalOverdueTasks * 18);
      score -= penalty;
      reasons.push(`${criticalOverdueTasks} tarea(s) críticas vencidas sin completar.`);
    } else if (overdueTasks > 0) {
      const penalty = Math.min(20, overdueTasks * 8);
      score -= penalty;
      reasons.push(`${overdueTasks} tarea(s) con retraso operativo.`);
    }

    if (blockedTasks > 0) {
      const penalty = Math.min(25, blockedTasks * 10);
      score -= penalty;
      reasons.push(`${blockedTasks} tarea(s) bloqueada(s) por dependencias no resueltas.`);
    }

    if (waitingApprovalTasks > 1) {
      score -= 10;
      reasons.push(`${waitingApprovalTasks} autorizaciones pendientes de Dirección/Finanzas.`);
    } else if (waitingApprovalTasks === 1) {
      score -= 5;
      reasons.push(`1 autorización pendiente de aprobación formal.`);
    }

    if (missingEvidenceTasks > 2) {
      score -= 12;
      reasons.push(`${missingEvidenceTasks} entregables sin evidencia documental adjunta.`);
    }

    // Urgency factor when close to deadline
    if (daysRemaining <= 7 && daysRemaining >= 0 && totalTasks > 0) {
      const completionRate = completedTasks / totalTasks;
      if (completionRate < 0.7) {
        const urgencyPenalty = 15;
        score -= urgencyPenalty;
        reasons.push(`A menos de 7 días con avance menor al 70% (${Math.round(completionRate * 100)}%).`);
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, Math.round(score)));

    if (reasons.length === 0) {
      if (completedTasks === totalTasks && totalTasks > 0) {
        reasons.push('Todas las tareas completadas y verificadas.');
      } else {
        reasons.push('Cronograma temporal en orden y dentro de los márgenes previstos.');
      }
    }

    let status: HealthStatus = 'HEALTHY';
    if (score < 50) {
      status = 'CRITICAL';
    } else if (score < 70) {
      status = 'AT_RISK';
    } else if (score < 90) {
      status = 'ATTENTION';
    }

    return {
      score,
      status,
      reasons,
      metrics: {
        totalTasks,
        completedTasks,
        overdueTasks,
        criticalOverdueTasks,
        blockedTasks,
        missingEvidenceCount: missingEvidenceTasks,
        daysRemaining,
      },
    };
  }
}
