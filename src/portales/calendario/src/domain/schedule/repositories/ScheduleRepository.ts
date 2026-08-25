import { ClassSchedule } from '../entities/ClassSchedule';
import { AcademicPeriod } from '../entities/AcademicPeriod';

export interface ScheduleRepository {
  findAll(): Promise<ClassSchedule[]>;
  findByPeriod(periodId: string): Promise<ClassSchedule[]>;
  findByTeacher(teacherId: string): Promise<ClassSchedule[]>;
  findByVenue(venueId: string): Promise<ClassSchedule[]>;
  save(schedule: ClassSchedule): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Periods
  getAcademicPeriods(): Promise<AcademicPeriod[]>;
  getActivePeriod(): Promise<AcademicPeriod | null>;
  savePeriod(period: AcademicPeriod): Promise<void>;
}
