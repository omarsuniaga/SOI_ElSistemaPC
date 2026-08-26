import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';
import { TriggerRepository } from '../../../domain/calendar/repositories/TriggerRepository';
import { TaskRepository } from '../../../domain/tasks/repositories/TaskRepository';
import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { OperationalHealthService } from '../../../domain/orchestration/services/OperationalHealthService';
import { TaskUnlockPolicy } from '../../../domain/tasks/policies/TaskUnlockPolicy';
import { RadarHorizonGroup, RadarSummaryDTO } from '../dtos/CalendarItemDTO';

export class GetTemporalRadar {
  constructor(
    private calendarRepo: CalendarRepository,
    private triggerRepo: TriggerRepository,
    private taskRepo: TaskRepository,
    private protocolRunRepo: ProtocolRunRepository
  ) {}

  async execute(): Promise<RadarSummaryDTO> {
    const [items, activeTriggers, allProtocolRuns, allTasks] = await Promise.all([
      this.calendarRepo.findAll(),
      this.triggerRepo.findAllActive(),
      this.protocolRunRepo.findAll(),
      this.taskRepo.findAll(),
    ]);

    const taskIds = allTasks.map(t => t.id);
    const dependencies = await this.taskRepo.getDependenciesForTasks(taskIds);
    const dagMap = TaskUnlockPolicy.resolveAll(allTasks, dependencies);

    const now = new Date();

    const horizonBuckets: Record<RadarHorizonGroup['horizon'], RadarHorizonGroup> = {
      OVERDUE: { horizon: 'OVERDUE', label: 'Retrasados / Vencidos', badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30', items: [] },
      TODAY: { horizon: 'TODAY', label: 'T0 — Hoy', badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30', items: [] },
      'T-3': { horizon: 'T-3', label: 'T-3 (Próximos 3 días)', badgeClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30', items: [] },
      'T-7': { horizon: 'T-7', label: 'T-7 (Esta semana)', badgeClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', items: [] },
      'T-15': { horizon: 'T-15', label: 'T-15 (Próximos 15 días)', badgeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30', items: [] },
      'T-30': { horizon: 'T-30', label: 'T-30 (Próximos 30 días)', badgeClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', items: [] },
      'T-60': { horizon: 'T-60', label: 'T-60 (Mediano Plazo)', badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30', items: [] },
      'T-90': { horizon: 'T-90', label: 'T-90 (Largo Plazo)', badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', items: [] },
      FUTURE: { horizon: 'FUTURE', label: 'Horizonte Extendido', badgeClass: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', items: [] },
    };

    let riskCount = 0;
    let criticalCount = 0;

    for (const trigger of activeTriggers) {
      const calendarItem = items.find(i => i.id === trigger.calendarItemId);
      if (!calendarItem) continue;

      const itemTasks = allTasks.filter(t => t.calendarItemId === calendarItem.id);
      const health = OperationalHealthService.evaluate(calendarItem, itemTasks, dagMap);

      if (health.status === 'AT_RISK') riskCount++;
      if (health.status === 'CRITICAL') criticalCount++;

      const pendingApprovalsCount = itemTasks.filter(t => t.status === 'WAITING_APPROVAL').length;
      let blockedCount = 0;
      for (const task of itemTasks) {
        const res = dagMap.get(task.id);
        if (res?.isBlocked) blockedCount++;
      }

      const entry = {
        calendarItem,
        trigger,
        health,
        activeTasksCount: itemTasks.length,
        pendingApprovalsCount,
        blockedCount,
      };

      const fireDate = new Date(trigger.fireAt);
      const diffHours = (fireDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const diffDays = Math.round(diffHours / 24);

      if (trigger.isOverdue) {
        horizonBuckets.OVERDUE.items.push(entry);
      } else if (diffDays === 0) {
        horizonBuckets.TODAY.items.push(entry);
      } else if (diffDays > 0 && diffDays <= 3) {
        horizonBuckets['T-3'].items.push(entry);
      } else if (diffDays > 3 && diffDays <= 7) {
        horizonBuckets['T-7'].items.push(entry);
      } else if (diffDays > 7 && diffDays <= 15) {
        horizonBuckets['T-15'].items.push(entry);
      } else if (diffDays > 15 && diffDays <= 30) {
        horizonBuckets['T-30'].items.push(entry);
      } else if (diffDays > 30 && diffDays <= 60) {
        horizonBuckets['T-60'].items.push(entry);
      } else if (diffDays > 60 && diffDays <= 90) {
        horizonBuckets['T-90'].items.push(entry);
      } else {
        horizonBuckets.FUTURE.items.push(entry);
      }
    }

    const horizons = Object.values(horizonBuckets).filter(h => h.items.length > 0);

    return {
      totalUpcomingItems: items.filter(i => i.isUpcoming(now)).length,
      activeTriggersCount: activeTriggers.length,
      activeProtocolRunsCount: allProtocolRuns.filter(r => r.status === 'RUNNING' || r.status === 'AT_RISK').length,
      riskItemsCount: riskCount,
      criticalItemsCount: criticalCount,
      horizons,
    };
  }
}
