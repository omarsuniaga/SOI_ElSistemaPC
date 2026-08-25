import { CalendarRepository, CalendarFilterOptions } from '../../../domain/calendar/repositories/CalendarRepository';
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';
import { INITIAL_CALENDAR_ITEMS } from './mockData';

export class MockCalendarRepository implements CalendarRepository {
  private items: Map<string, CalendarItem> = new Map();

  constructor() {
    for (const data of INITIAL_CALENDAR_ITEMS) {
      this.items.set(data.id, new CalendarItem(data));
    }
  }

  async findAll(filter?: CalendarFilterOptions): Promise<CalendarItem[]> {
    let result = Array.from(this.items.values());

    if (filter) {
      if (filter.department) {
        result = result.filter(
          item =>
            item.departmentOwner === filter.department ||
            item.secondaryDepartments.includes(filter.department!)
        );
      }
      if (filter.kind) {
        result = result.filter(item => item.kind === filter.kind);
      }
      if (filter.category) {
        result = result.filter(item => item.category === filter.category);
      }
      if (filter.status) {
        result = result.filter(item => item.status === filter.status);
      }
      if (filter.venueId) {
        result = result.filter(item => item.venueId === filter.venueId);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        result = result.filter(
          item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.location?.toLowerCase().includes(query) ||
            item.ownerRole.toLowerCase().includes(query)
        );
      }
      if (filter.startDate) {
        result = result.filter(item => new Date(item.endAt) >= new Date(filter.startDate!));
      }
      if (filter.endDate) {
        result = result.filter(item => new Date(item.startAt) <= new Date(filter.endDate!));
      }
    }

    return result.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  async findById(id: string): Promise<CalendarItem | null> {
    return this.items.get(id) ?? null;
  }

  async findByDateRange(start: string, end: string): Promise<CalendarItem[]> {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Array.from(this.items.values())
      .filter(item => {
        const itemStart = new Date(item.startAt);
        const itemEnd = new Date(item.endAt);
        return itemStart <= endDate && itemEnd >= startDate;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  async save(item: CalendarItem): Promise<void> {
    this.items.set(item.id, item);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}
