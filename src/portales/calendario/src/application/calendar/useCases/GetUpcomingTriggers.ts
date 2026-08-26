import { TriggerRepository } from '../../../domain/calendar/repositories/TriggerRepository';
import { TemporalTrigger } from '../../../domain/calendar/entities/TemporalTrigger';

export class GetUpcomingTriggers {
  constructor(private triggerRepo: TriggerRepository) {}

  async execute(horizonDays: number = 90): Promise<TemporalTrigger[]> {
    return this.triggerRepo.findAllUpcoming(horizonDays);
  }
}
