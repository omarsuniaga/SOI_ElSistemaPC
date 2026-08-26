import { InstitutionalTask } from '../entities/InstitutionalTask';
import { TaskDependency } from '../entities/TaskDependency';

export interface TaskDAGResolution {
  taskId: string;
  isBlocked: boolean;
  unresolvedPredecessorIds: string[];
  resolvedPredecessorIds: string[];
  blockingTaskTitles: string[];
}

export class TaskUnlockPolicy {
  /**
   * Evaluates a task against all dependencies in the graph and determines if it is blocked.
   */
  static evaluateTask(
    task: InstitutionalTask,
    allTasks: InstitutionalTask[],
    dependencies: TaskDependency[]
  ): TaskDAGResolution {
    const taskDeps = dependencies.filter(
      d => d.taskId === task.id && d.dependencyType === 'BLOCKING'
    );

    const unresolvedPredecessorIds: string[] = [];
    const resolvedPredecessorIds: string[] = [];
    const blockingTaskTitles: string[] = [];

    for (const dep of taskDeps) {
      const pred = allTasks.find(t => t.id === dep.dependsOnTaskId);
      if (!pred || pred.status !== 'COMPLETED') {
        unresolvedPredecessorIds.push(dep.dependsOnTaskId);
        if (pred) {
          blockingTaskTitles.push(pred.title);
        } else {
          blockingTaskTitles.push(`Tarea dependiente #${dep.dependsOnTaskId}`);
        }
      } else {
        resolvedPredecessorIds.push(dep.dependsOnTaskId);
      }
    }

    return {
      taskId: task.id,
      isBlocked: unresolvedPredecessorIds.length > 0,
      unresolvedPredecessorIds,
      resolvedPredecessorIds,
      blockingTaskTitles,
    };
  }

  /**
   * Resolves the entire task map for a correlation or calendar item.
   */
  static resolveAll(
    tasks: InstitutionalTask[],
    dependencies: TaskDependency[]
  ): Map<string, TaskDAGResolution> {
    const map = new Map<string, TaskDAGResolution>();
    for (const task of tasks) {
      map.set(task.id, this.evaluateTask(task, tasks, dependencies));
    }
    return map;
  }
}
