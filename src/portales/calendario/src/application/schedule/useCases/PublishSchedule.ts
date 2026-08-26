import { ScheduleRepository } from '../../../domain/schedule/repositories/ScheduleRepository';
import { AcademicPeriod } from '../../../domain/schedule/entities/AcademicPeriod';

export class PublishSchedule {
  constructor(private scheduleRepo: ScheduleRepository) {}

  async execute(periodId: string): Promise<{ success: boolean; message: string }> {
    const active = await this.scheduleRepo.getActivePeriod();
    if (!active) {
      throw new Error('No se encontró un periodo académico activo para publicar.');
    }

    const updated = new AcademicPeriod({
      ...active.toJSON(),
      isActive: true,
    });

    await this.scheduleRepo.savePeriod(updated);
    return {
      success: true,
      message: `Matriz académica publicada exitosamente para ${active.name}. Las franjas de cátedras y ensayos quedan bloqueadas en el calendario.`,
    };
  }
}
