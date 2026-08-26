import { TemporalTrigger } from '../entities/TemporalTrigger';

export interface TriggerRepository {
  findByCalendarItemId(calendarItemId: string): Promise<TemporalTrigger[]>;
  findById(id: string): Promise<TemporalTrigger | null>;
  findAllUpcoming(horizonDays?: number): Promise<TemporalTrigger[]>;
  findAllActive(): Promise<TemporalTrigger[]>;
  save(trigger: TemporalTrigger): Promise<void>;
  markExecuted(id: string, executionTimestamp: string): Promise<void>;
}
