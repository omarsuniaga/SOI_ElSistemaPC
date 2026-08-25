import { TaskRepository, TaskFilterOptions } from '../../../domain/tasks/repositories/TaskRepository';
import { InstitutionalTask } from '../../../domain/tasks/entities/InstitutionalTask';
import { TaskUnlockPolicy, TaskDAGResolution } from '../../../domain/tasks/policies/TaskUnlockPolicy';

export interface TaskWithDAGInfo {
  task: InstitutionalTask;
  dag: TaskDAGResolution;
}

export class GetTasks {
  constructor(private taskRepo: TaskRepository) {}

  async execute(filter?: TaskFilterOptions): Promise<TaskWithDAGInfo[]> {
    const tasks = await this.taskRepo.findAll(filter);
    const taskIds = tasks.map(t => t.id);
    const dependencies = await this.taskRepo.getDependenciesForTasks(taskIds);
    const dagMap = TaskUnlockPolicy.resolveAll(tasks, dependencies);

    return tasks.map(task => ({
      task,
      dag: dagMap.get(task.id) || {
        taskId: task.id,
        isBlocked: false,
        unresolvedPredecessorIds: [],
        resolvedPredecessorIds: [],
        blockingTaskTitles: [],
      },
    }));
  }
}
