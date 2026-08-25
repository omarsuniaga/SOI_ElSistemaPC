import { DepartmentCode } from '../../shared/types';

export type ProtocolRunStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'BLOCKED'
  | 'AT_RISK'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export interface DepartmentProgress {
  department: DepartmentCode;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

export interface ProtocolRunProps {
  id: string;
  processCode: string; // e.g. ADM-P01, EVT-P02, ACM-PXX
  processName: string;
  calendarItemId: string;
  triggerId?: string;
  correlationId: string; // e.g. SOI-2027-S2-REENROLLMENT
  status: ProtocolRunStatus;
  startedAt: string;
  completedAt?: string;
  ownerRole: string;
  snapshotContext?: Record<string, string | number | boolean | null>;
  resultSummary?: string;
  overallProgress: number; // 0-100
  departmentBreakdown?: DepartmentProgress[];
}

export class ProtocolRun {
  readonly id: string;
  readonly processCode: string;
  readonly processName: string;
  readonly calendarItemId: string;
  readonly triggerId?: string;
  readonly correlationId: string;
  readonly status: ProtocolRunStatus;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly ownerRole: string;
  readonly snapshotContext: Record<string, string | number | boolean | null>;
  readonly resultSummary?: string;
  readonly overallProgress: number;
  readonly departmentBreakdown: DepartmentProgress[];

  constructor(props: ProtocolRunProps) {
    this.id = props.id;
    this.processCode = props.processCode;
    this.processName = props.processName;
    this.calendarItemId = props.calendarItemId;
    this.triggerId = props.triggerId;
    this.correlationId = props.correlationId;
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.ownerRole = props.ownerRole;
    this.snapshotContext = props.snapshotContext ?? {};
    this.resultSummary = props.resultSummary;
    this.overallProgress = props.overallProgress;
    this.departmentBreakdown = props.departmentBreakdown ?? [];
  }

  toJSON(): ProtocolRunProps {
    return {
      id: this.id,
      processCode: this.processCode,
      processName: this.processName,
      calendarItemId: this.calendarItemId,
      triggerId: this.triggerId,
      correlationId: this.correlationId,
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      ownerRole: this.ownerRole,
      snapshotContext: this.snapshotContext,
      resultSummary: this.resultSummary,
      overallProgress: this.overallProgress,
      departmentBreakdown: this.departmentBreakdown,
    };
  }
}
