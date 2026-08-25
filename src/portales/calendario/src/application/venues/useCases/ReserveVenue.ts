import { VenueRepository } from '../../../domain/venues/repositories/VenueRepository';
import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';

export interface ReserveVenueRequest {
  venueId: string;
  eventName: string;
  startAt: string;
  endAt: string;
  departmentOwner: any;
  ownerRole: string;
  notes?: string;
}

export class ReserveVenue {
  constructor(
    private venueRepo: VenueRepository,
    private calendarRepo: CalendarRepository
  ) {}

  async execute(request: ReserveVenueRequest): Promise<CalendarItem> {
    const venue = await this.venueRepo.findById(request.venueId);
    if (!venue) {
      throw new Error(`Sede / Sala con ID ${request.venueId} no encontrada.`);
    }

    const calendarItem = new CalendarItem({
      id: `item-res-${venue.id.toLowerCase()}-${Date.now()}`,
      title: `Reserva: ${request.eventName}`,
      description: request.notes || `Reserva de espacio institucional en ${venue.name} (Aforo: ${venue.capacity} pax).`,
      kind: 'EVENT',
      category: 'ARTISTIC',
      departmentOwner: request.departmentOwner || 'EVT',
      ownerRole: request.ownerRole || 'LOG',
      startAt: request.startAt,
      endAt: request.endAt,
      allDay: false,
      status: 'CONFIRMED',
      priority: 'NORMAL',
      location: venue.name,
      venueId: venue.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.calendarRepo.save(calendarItem);
    return calendarItem;
  }
}
