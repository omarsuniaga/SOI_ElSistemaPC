import { TaskRepository } from '../../../domain/tasks/repositories/TaskRepository';
import { InstitutionalTask, InstitutionalTaskProps } from '../../../domain/tasks/entities/InstitutionalTask';

export class CreateTask {
  constructor(private taskRepo: TaskRepository) {}

  async execute(props: Omit<InstitutionalTaskProps, 'id'> & { id?: string }): Promise<InstitutionalTask> {
    const taskId = props.id || `task-custom-${Date.now()}`;
    const newTask = new InstitutionalTask({
      ...props,
      id: taskId,
      evidenceItems: props.evidenceItems || [],
      progressPercentage: props.progressPercentage || 0,
    });

    await this.taskRepo.save(newTask);
    return newTask;
  }
}
