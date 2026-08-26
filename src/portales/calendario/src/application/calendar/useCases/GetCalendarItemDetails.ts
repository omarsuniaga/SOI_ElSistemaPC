import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';
import { TriggerRepository } from '../../../domain/calendar/repositories/TriggerRepository';
import { TaskRepository } from '../../../domain/tasks/repositories/TaskRepository';
import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { TaskUnlockPolicy, TaskDAGResolution } from '../../../domain/tasks/policies/TaskUnlockPolicy';
import { OperationalHealthService } from '../../../domain/orchestration/services/OperationalHealthService';
import { CalendarItemDetailDTO } from '../dtos/CalendarItemDTO';

export class GetCalendarItemDetails {
  constructor(
    private calendarRepo: CalendarRepository,
    private triggerRepo: TriggerRepository,
    private taskRepo: TaskRepository,
    private protocolRunRepo: ProtocolRunRepository
  ) {}

  async execute(id: string): Promise<CalendarItemDetailDTO | null> {
    const item = await this.calendarRepo.findById(id);
    if (!item) return null;

    const [triggers, tasks, protocolRuns] = await Promise.all([
      this.triggerRepo.findByCalendarItemId(id),
      this.taskRepo.findByCalendarItemId(id),
      this.protocolRunRepo.findByCalendarItemId(id),
    ]);

    const taskIds = tasks.map(t => t.id);
    const dependencies = await this.taskRepo.getDependenciesForTasks(taskIds);
    const dagResolutionsMap = TaskUnlockPolicy.resolveAll(tasks, dependencies);

    const dagResolutions: Record<string, TaskDAGResolution> = {};
    for (const [taskId, res] of dagResolutionsMap.entries()) {
      dagResolutions[taskId] = res;
    }

    const health = OperationalHealthService.evaluate(item, tasks, dagResolutionsMap);

    return {
      item,
      triggers,
      tasks,
      dagResolutions,
      health,
      protocolRunsCount: protocolRuns.length,
    };
  }
}
