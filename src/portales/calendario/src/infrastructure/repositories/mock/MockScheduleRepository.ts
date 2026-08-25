import { ScheduleRepository } from '../../../domain/schedule/repositories/ScheduleRepository';
import { ClassSchedule } from '../../../domain/schedule/entities/ClassSchedule';
import { AcademicPeriod } from '../../../domain/schedule/entities/AcademicPeriod';
import { INITIAL_CLASS_SCHEDULES, INITIAL_ACADEMIC_PERIODS } from './mockData';

export class MockScheduleRepository implements ScheduleRepository {
  private schedules: Map<string, ClassSchedule> = new Map();
  private periods: Map<string, AcademicPeriod> = new Map();

  constructor() {
    for (const data of INITIAL_CLASS_SCHEDULES) {
      this.schedules.set(data.id, new ClassSchedule(data));
    }
    for (const data of INITIAL_ACADEMIC_PERIODS) {
      this.periods.set(data.id, new AcademicPeriod(data));
    }
  }

  async findAll(): Promise<ClassSchedule[]> {
    return Array.from(this.schedules.values());
  }

  async findByPeriod(periodId: string): Promise<ClassSchedule[]> {
    return Array.from(this.schedules.values()).filter(s => s.academicPeriodId === periodId);
  }

  async findByTeacher(teacherId: string): Promise<ClassSchedule[]> {
    return Array.from(this.schedules.values()).filter(s => s.teacherId === teacherId);
  }

  async findByVenue(venueId: string): Promise<ClassSchedule[]> {
    return Array.from(this.schedules.values()).filter(s => s.venueId === venueId);
  }

  async save(schedule: ClassSchedule): Promise<void> {
    this.schedules.set(schedule.id, schedule);
  }

  async delete(id: string): Promise<void> {
    this.schedules.delete(id);
  }

  async getAcademicPeriods(): Promise<AcademicPeriod[]> {
    return Array.from(this.periods.values());
  }

  async getActivePeriod(): Promise<AcademicPeriod | null> {
    return Array.from(this.periods.values()).find(p => p.isActive) ?? null;
  }

  async savePeriod(period: AcademicPeriod): Promise<void> {
    this.periods.set(period.id, period);
  }
}
