import { TaskRepository } from '../../../domain/tasks/repositories/TaskRepository';
import { TaskStatus } from '../../../domain/tasks/entities/InstitutionalTask';

export class UpdateTaskStatus {
  constructor(private taskRepo: TaskRepository) {}

  async execute(taskId: string, newStatus: TaskStatus): Promise<void> {
    return this.taskRepo.updateStatus(taskId, newStatus);
  }
}
