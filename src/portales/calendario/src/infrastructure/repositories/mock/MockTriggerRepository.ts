import { TriggerRepository } from '../../../domain/calendar/repositories/TriggerRepository';
import { TemporalTrigger } from '../../../domain/calendar/entities/TemporalTrigger';
import { INITIAL_TEMPORAL_TRIGGERS } from './mockData';

export class MockTriggerRepository implements TriggerRepository {
  private triggers: Map<string, TemporalTrigger> = new Map();

  constructor() {
    for (const data of INITIAL_TEMPORAL_TRIGGERS) {
      this.triggers.set(data.id, new TemporalTrigger(data));
    }
  }

  async findByCalendarItemId(calendarItemId: string): Promise<TemporalTrigger[]> {
    return Array.from(this.triggers.values())
      .filter(t => t.calendarItemId === calendarItemId)
      .sort((a, b) => a.offsetValue - b.offsetValue);
  }

  async findById(id: string): Promise<TemporalTrigger | null> {
    return this.triggers.get(id) ?? null;
  }

  async findAllUpcoming(horizonDays: number = 90): Promise<TemporalTrigger[]> {
    const now = new Date();
    const futureLimit = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);

    return Array.from(this.triggers.values())
      .filter(t => t.isActive && new Date(t.fireAt) <= futureLimit)
      .sort((a, b) => new Date(a.fireAt).getTime() - new Date(b.fireAt).getTime());
  }

  async findAllActive(): Promise<TemporalTrigger[]> {
    return Array.from(this.triggers.values())
      .filter(t => t.isActive)
      .sort((a, b) => new Date(a.fireAt).getTime() - new Date(b.fireAt).getTime());
  }

  async save(trigger: TemporalTrigger): Promise<void> {
    this.triggers.set(trigger.id, trigger);
  }

  async markExecuted(id: string, executionTimestamp: string): Promise<void> {
    const existing = this.triggers.get(id);
    if (existing) {
      this.triggers.set(
        id,
        new TemporalTrigger({
          ...existing.toJSON(),
          isExecuted: true,
          lastExecutedAt: executionTimestamp,
        })
      );
    }
  }
}
