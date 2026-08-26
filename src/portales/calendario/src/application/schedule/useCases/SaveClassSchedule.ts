import { ScheduleRepository } from '../../../domain/schedule/repositories/ScheduleRepository';
import { ClassSchedule } from '../../../domain/schedule/entities/ClassSchedule';

export class SaveClassSchedule {
  constructor(private scheduleRepo: ScheduleRepository) {}

  async execute(schedule: ClassSchedule): Promise<void> {
    return this.scheduleRepo.save(schedule);
  }

  async delete(id: string): Promise<void> {
    return this.scheduleRepo.delete(id);
  }
}
