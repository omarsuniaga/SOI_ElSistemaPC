import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';

export interface SeasonRoadmapDTO {
  seasons: CalendarItem[];
  windows: CalendarItem[];
  deadlines: CalendarItem[];
  events: CalendarItem[];
  blockouts: CalendarItem[];
}

export class GetSeasons {
  constructor(private calendarRepo: CalendarRepository) {}

  async execute(): Promise<SeasonRoadmapDTO> {
    const items = await this.calendarRepo.findAll();

    return {
      seasons: items.filter(i => i.kind === 'SEASON'),
      windows: items.filter(i => i.kind === 'WINDOW'),
      deadlines: items.filter(i => i.kind === 'DEADLINE'),
      events: items.filter(i => i.kind === 'EVENT' || i.kind === 'MILESTONE'),
      blockouts: items.filter(i => i.kind === 'BLOCKOUT'),
    };
  }
}
