import { DepartmentCode, PriorityLevel } from '../../shared/types';

export type TaskStatus =
  | 'BLOCKED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TaskEvidence {
  id: string;
  type: 'DOCUMENT' | 'URL' | 'SYSTEM_RECORD' | 'CHECKLIST';
  label: string;
  url?: string;
  verified: boolean;
  uploadedAt?: string;
}

export interface InstitutionalTaskProps {
  id: string;
  protocolRunId?: string;
  calendarItemId?: string;
  correlationId: string; // e.g. SOI-2027-S2-REENROLLMENT, SOI-EVT-XMAS-2026
  title: string;
  description: string;
  department: DepartmentCode;
  ownerRole: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueAt: string;
  startedAt?: string;
  completedAt?: string;
  evidenceRequired: boolean;
  evidenceItems?: TaskEvidence[];
  triggerLabel?: string; // e.g. 'T-30', 'T-7'
  progressPercentage?: number;
}

export class InstitutionalTask {
  readonly id: string;
  readonly protocolRunId?: string;
  readonly calendarItemId?: string;
  readonly correlationId: string;
  readonly title: string;
  readonly description: string;
  readonly department: DepartmentCode;
  readonly ownerRole: string;
  readonly status: TaskStatus;
  readonly priority: PriorityLevel;
  readonly dueAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly evidenceRequired: boolean;
  readonly evidenceItems: TaskEvidence[];
  readonly triggerLabel?: string;
  readonly progressPercentage: number;

  constructor(props: InstitutionalTaskProps) {
    this.id = props.id;
    this.protocolRunId = props.protocolRunId;
    this.calendarItemId = props.calendarItemId;
    this.correlationId = props.correlationId;
    this.title = props.title;
    this.description = props.description;
    this.department = props.department;
    this.ownerRole = props.ownerRole;
    this.status = props.status;
    this.priority = props.priority;
    this.dueAt = props.dueAt;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.evidenceRequired = props.evidenceRequired;
    this.evidenceItems = props.evidenceItems ?? [];
    this.triggerLabel = props.triggerLabel;
    this.progressPercentage = props.progressPercentage ?? (props.status === 'COMPLETED' ? 100 : 0);
  }

  get isOverdue(): boolean {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') return false;
    return new Date(this.dueAt) < new Date();
  }

  get isEvidenceFulfilled(): boolean {
    if (!this.evidenceRequired) return true;
    if (this.evidenceItems.length === 0) return false;
    return this.evidenceItems.every(e => e.verified);
  }

  copyWith(updates: Partial<InstitutionalTaskProps>): InstitutionalTask {
    return new InstitutionalTask({
      ...this.toJSON(),
      ...updates,
    });
  }

  toJSON(): InstitutionalTaskProps {
    return {
      id: this.id,
      protocolRunId: this.protocolRunId,
      calendarItemId: this.calendarItemId,
      correlationId: this.correlationId,
      title: this.title,
      description: this.description,
      department: this.department,
      ownerRole: this.ownerRole,
      status: this.status,
      priority: this.priority,
      dueAt: this.dueAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      evidenceRequired: this.evidenceRequired,
      evidenceItems: this.evidenceItems,
      triggerLabel: this.triggerLabel,
      progressPercentage: this.progressPercentage,
    };
  }
}
