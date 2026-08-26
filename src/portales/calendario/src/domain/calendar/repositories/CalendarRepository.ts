import { CalendarItem } from '../entities/CalendarItem';
import { CalendarItemKind } from '../valueObjects/CalendarItemKind';
import { DepartmentCode } from '../../shared/types';

export interface CalendarFilterOptions {
  department?: DepartmentCode;
  kind?: CalendarItemKind;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  venueId?: string;
  ownerRole?: string;
}

export interface CalendarRepository {
  findAll(filter?: CalendarFilterOptions): Promise<CalendarItem[]>;
  findById(id: string): Promise<CalendarItem | null>;
  findByDateRange(start: string, end: string): Promise<CalendarItem[]>;
  save(item: CalendarItem): Promise<void>;
  delete(id: string): Promise<void>;
}
