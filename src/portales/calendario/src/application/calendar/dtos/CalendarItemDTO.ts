import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';
import { TemporalTrigger } from '../../../domain/calendar/entities/TemporalTrigger';
import { HealthEvaluationResult } from '../../../domain/orchestration/services/OperationalHealthService';
import { InstitutionalTask } from '../../../domain/tasks/entities/InstitutionalTask';
import { TaskDAGResolution } from '../../../domain/tasks/policies/TaskUnlockPolicy';

export interface CalendarItemDetailDTO {
  item: CalendarItem;
  triggers: TemporalTrigger[];
  tasks: InstitutionalTask[];
  dagResolutions: Record<string, TaskDAGResolution>;
  health: HealthEvaluationResult;
  protocolRunsCount: number;
}

export interface RadarHorizonGroup {
  horizon: 'OVERDUE' | 'TODAY' | 'T-3' | 'T-7' | 'T-15' | 'T-30' | 'T-60' | 'T-90' | 'FUTURE';
  label: string;
  badgeClass: string;
  items: Array<{
    calendarItem: CalendarItem;
    trigger: TemporalTrigger;
    health: HealthEvaluationResult;
    activeTasksCount: number;
    pendingApprovalsCount: number;
    blockedCount: number;
  }>;
}

export interface RadarSummaryDTO {
  totalUpcomingItems: number;
  activeTriggersCount: number;
  activeProtocolRunsCount: number;
  riskItemsCount: number;
  criticalItemsCount: number;
  horizons: RadarHorizonGroup[];
}

export interface WeeklySnapshotDTO {
  weekNumber: number;
  startDate: string;
  endDate: string;
  academicPeriodName: string;
  confirmedEvents: CalendarItem[];
  pendingDeadlines: CalendarItem[];
  activeMilestones: CalendarItem[];
  criticalAlerts: string[];
  operationalNotes: string[];
  departmentLoadSummary: Record<string, { eventCount: number; taskCount: number }>;
}
