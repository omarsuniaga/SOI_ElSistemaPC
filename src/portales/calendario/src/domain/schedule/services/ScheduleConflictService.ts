import { ClassSchedule } from '../entities/ClassSchedule';
import { CalendarItem } from '../../calendar/entities/CalendarItem';

export type ConflictSeverity = 'CRITICAL' | 'WARNING';

export interface ScheduleConflict {
  id: string;
  type: 'TEACHER_DOUBLE_BOOKING' | 'ROOM_OVERLAP' | 'STUDENT_GROUP_OVERLAP' | 'BLOCKOUT_COLLISION';
  severity: ConflictSeverity;
  title: string;
  description: string;
  scheduleIds: string[];
  blockoutCalendarItemId?: string;
}

export class ScheduleConflictService {
  static detectConflicts(
    schedules: ClassSchedule[],
    blockouts: CalendarItem[] = []
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    // Helper for time overlap check
    const isTimeOverlap = (s1Start: string, s1End: string, s2Start: string, s2End: string) => {
      return s1Start < s2End && s2Start < s1End;
    };

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i];
        const b = schedules[j];

        if (a.dayOfWeek !== b.dayOfWeek) continue;
        if (!isTimeOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) continue;

        // 1. Teacher double booking
        if (a.teacherId === b.teacherId) {
          conflicts.push({
            id: `conflict-teacher-${a.id}-${b.id}`,
            type: 'TEACHER_DOUBLE_BOOKING',
            severity: 'CRITICAL',
            title: `Conflicto de Docente: ${a.teacherName}`,
            description: `El docente ${a.teacherName} tiene dos clases solapadas (${a.instrument} vs ${b.instrument}) el ${a.dayOfWeek} de ${a.startTime} a ${a.endTime}.`,
            scheduleIds: [a.id, b.id],
          });
        }

        // 2. Room overlap
        if (a.venueId === b.venueId) {
          conflicts.push({
            id: `conflict-room-${a.id}-${b.id}`,
            type: 'ROOM_OVERLAP',
            severity: 'CRITICAL',
            title: `Conflicto de Sala: ${a.venueName}`,
            description: `La sala ${a.venueName} está reservada simultáneamente para "${a.studentGroup}" y "${b.studentGroup}" de ${a.startTime} a ${b.endTime}.`,
            scheduleIds: [a.id, b.id],
          });
        }

        // 3. Student group overlap
        if (a.studentGroup === b.studentGroup && a.id !== b.id) {
          conflicts.push({
            id: `conflict-group-${a.id}-${b.id}`,
            type: 'STUDENT_GROUP_OVERLAP',
            severity: 'WARNING',
            title: `Cruce de Elenco / Grupo: ${a.studentGroup}`,
            description: `El grupo ${a.studentGroup} tiene asignaciones simultáneas de ${a.instrument} y ${b.instrument}.`,
            scheduleIds: [a.id, b.id],
          });
        }
      }
    }

    return conflicts;
  }
}
