import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { TaskRepository } from '../../../domain/tasks/repositories/TaskRepository';
import { TaskUnlockPolicy, TaskDAGResolution } from '../../../domain/tasks/policies/TaskUnlockPolicy';
import { ProtocolRunDetailDTO } from '../dtos/OperationalHealthDTO';

export class GetProtocolRunDetails {
  constructor(
    private protocolRunRepo: ProtocolRunRepository,
    private taskRepo: TaskRepository
  ) {}

  async execute(id: string): Promise<ProtocolRunDetailDTO | null> {
    const run = await this.protocolRunRepo.findById(id);
    if (!run) return null;

    const tasks = await this.taskRepo.findAll({ protocolRunId: run.id });
    const taskIds = tasks.map(t => t.id);
    const dependencies = await this.taskRepo.getDependenciesForTasks(taskIds);
    const dagMap = TaskUnlockPolicy.resolveAll(tasks, dependencies);

    const dagResolutions: Record<string, TaskDAGResolution> = {};
    for (const [taskId, res] of dagMap.entries()) {
      dagResolutions[taskId] = res;
    }

    return {
      run,
      tasks,
      dagResolutions,
    };
  }
}
