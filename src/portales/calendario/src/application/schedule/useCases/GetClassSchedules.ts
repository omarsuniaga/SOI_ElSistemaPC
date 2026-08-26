import { ScheduleRepository } from '../../../domain/schedule/repositories/ScheduleRepository';
import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';
import { ClassSchedule } from '../../../domain/schedule/entities/ClassSchedule';
import { AcademicPeriod } from '../../../domain/schedule/entities/AcademicPeriod';
import { ScheduleConflictService, ScheduleConflict } from '../../../domain/schedule/services/ScheduleConflictService';

export interface ScheduleViewDTO {
  schedules: ClassSchedule[];
  conflicts: ScheduleConflict[];
  activePeriod: AcademicPeriod | null;
  periods: AcademicPeriod[];
}

export class GetClassSchedules {
  constructor(
    private scheduleRepo: ScheduleRepository,
    private calendarRepo: CalendarRepository
  ) {}

  async execute(): Promise<ScheduleViewDTO> {
    const [schedules, periods, activePeriod, calendarItems] = await Promise.all([
      this.scheduleRepo.findAll(),
      this.scheduleRepo.getAcademicPeriods(),
      this.scheduleRepo.getActivePeriod(),
      this.calendarRepo.findAll(),
    ]);

    const blockouts = calendarItems.filter(i => i.kind === 'BLOCKOUT');
    const conflicts = ScheduleConflictService.detectConflicts(schedules, blockouts);

    return {
      schedules,
      conflicts,
      activePeriod,
      periods,
    };
  }
}
