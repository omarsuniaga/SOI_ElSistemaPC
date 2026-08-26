import { TriggerRepository } from '../../../domain/calendar/repositories/TriggerRepository';
import { TemporalTrigger } from '../../../domain/calendar/entities/TemporalTrigger';

export class ToggleTriggerStatus {
  constructor(private triggerRepo: TriggerRepository) {}

  async execute(triggerId: string, setActive?: boolean): Promise<TemporalTrigger> {
    const trigger = await this.triggerRepo.findById(triggerId);
    if (!trigger) {
      throw new Error(`Trigger con ID ${triggerId} no encontrado.`);
    }

    const updated = new TemporalTrigger({
      ...trigger.toJSON(),
      isActive: setActive !== undefined ? setActive : !trigger.isActive,
    });

    await this.triggerRepo.save(updated);
    return updated;
  }
}
