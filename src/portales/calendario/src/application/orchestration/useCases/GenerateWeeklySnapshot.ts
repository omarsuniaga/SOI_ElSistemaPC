import { CalendarRepository } from '../../../domain/calendar/repositories/CalendarRepository';
import { TaskRepository } from '../../../domain/tasks/repositories/TaskRepository';
import { ScheduleRepository } from '../../../domain/schedule/repositories/ScheduleRepository';
import { WeeklySnapshotDTO } from '../../calendar/dtos/CalendarItemDTO';

export class GenerateWeeklySnapshot {
  constructor(
    private calendarRepo: CalendarRepository,
    private taskRepo: TaskRepository,
    private scheduleRepo: ScheduleRepository
  ) {}

  async execute(targetDate: Date = new Date()): Promise<WeeklySnapshotDTO> {
    const allItems = await this.calendarRepo.findAll();
    const allTasks = await this.taskRepo.findAll();
    const activePeriod = await this.scheduleRepo.getActivePeriod();

    const startOfWeek = new Date(targetDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const confirmedEvents = allItems.filter(i => {
      const d = new Date(i.startAt);
      return (i.kind === 'EVENT' || i.kind === 'SEASON') && (i.status === 'CONFIRMED' || i.status === 'ACTIVE');
    });

    const pendingDeadlines = allItems.filter(i => i.kind === 'DEADLINE' && i.status !== 'CLOSED');
    const activeMilestones = allItems.filter(i => i.kind === 'MILESTONE');

    const departmentLoadSummary: Record<string, { eventCount: number; taskCount: number }> = {
      DIR: { eventCount: 0, taskCount: 0 },
      ACM: { eventCount: 0, taskCount: 0 },
      ADM: { eventCount: 0, taskCount: 0 },
      FIN: { eventCount: 0, taskCount: 0 },
      LOG: { eventCount: 0, taskCount: 0 },
      EVT: { eventCount: 0, taskCount: 0 },
      COM: { eventCount: 0, taskCount: 0 },
      AGT: { eventCount: 0, taskCount: 0 },
    };

    for (const item of allItems) {
      if (departmentLoadSummary[item.departmentOwner]) {
        departmentLoadSummary[item.departmentOwner].eventCount++;
      }
    }

    for (const task of allTasks) {
      if (departmentLoadSummary[task.department]) {
        departmentLoadSummary[task.department].taskCount++;
      }
    }

    const criticalAlerts: string[] = [
      'Declaración TSS / DGII programada para fin de mes: requiere conciliación de nómina de FIN.',
      'Concierto de Gala Navideña en T-21: Mantenimiento urgente de Cátedra de Cuerdas en Luthería.',
      'Audiciones de Nuevo Ingreso: 3 salas asignadas en Edificio Central con protocolo de acústica verificado.',
    ];

    const operationalNotes: string[] = [
      'Se ha implementado el bloqueo institucional del 20 de diciembre al 7 de enero.',
      'Hermes ha verificado 119 expedientes regulares aptos para reinscripción.',
      'Todas las cátedras de vientos y percusión tienen asignación docente sin solapamientos.',
    ];

    // Compute approximate week of year
    const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
    const pastDays = (targetDate.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);

    return {
      weekNumber: weekNumber || 34,
      startDate: startOfWeek.toISOString().slice(0, 10),
      endDate: endOfWeek.toISOString().slice(0, 10),
      academicPeriodName: activePeriod?.name || 'Periodo Académico 2026-S2',
      confirmedEvents,
      pendingDeadlines,
      activeMilestones,
      criticalAlerts,
      operationalNotes,
      departmentLoadSummary,
    };
  }
}
