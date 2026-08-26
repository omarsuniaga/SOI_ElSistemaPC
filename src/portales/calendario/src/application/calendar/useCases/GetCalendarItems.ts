import { CalendarRepository, CalendarFilterOptions } from '../../../domain/calendar/repositories/CalendarRepository';
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';

export class GetCalendarItems {
  constructor(private calendarRepo: CalendarRepository) {}

  async execute(filter?: CalendarFilterOptions): Promise<CalendarItem[]> {
    return this.calendarRepo.findAll(filter);
  }
}
