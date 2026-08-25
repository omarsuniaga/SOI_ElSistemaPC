import { TaskRepository } from '../../../domain/tasks/repositories/TaskRepository';
import { InstitutionalTask } from '../../../domain/tasks/entities/InstitutionalTask';

export class EscalateTask {
  constructor(private taskRepo: TaskRepository) {}

  async execute(taskId: string, escalationNote: string): Promise<InstitutionalTask> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new Error(`Tarea con ID ${taskId} no encontrada.`);
    }

    const updated = new InstitutionalTask({
      ...task.toJSON(),
      priority: 'CRITICAL',
      status: 'WAITING_APPROVAL',
      description: `${task.description}\n\n[ESCALADO POR REVISIÓN INSTITUCIONAL]: ${escalationNote}`,
    });

    await this.taskRepo.save(updated);
    return updated;
  }
}
