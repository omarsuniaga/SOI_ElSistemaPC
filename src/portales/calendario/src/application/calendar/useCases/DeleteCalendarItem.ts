import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';

export class DeleteCalendarItem {
  constructor(private calendarRepo: CalendarRepository) {}

  async execute(id: string): Promise<void> {
    const item = await this.calendarRepo.findById(id);
    if (!item) {
      throw new Error(`No se encontró el hito con ID ${id}`);
    }
    await this.calendarRepo.delete(id);
  }
}
