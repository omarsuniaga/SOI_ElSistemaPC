import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';

export class SaveCalendarItem {
  constructor(private calendarRepo: CalendarRepository) {}

  async execute(item: CalendarItem): Promise<void> {
    return this.calendarRepo.save(item);
  }
}
