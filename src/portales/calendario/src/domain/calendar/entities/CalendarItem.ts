import { DepartmentCode, PriorityLevel } from '../../shared/types';
import { CalendarItemKind } from '../valueObjects/CalendarItemKind';
import { CalendarItemStatus } from '../valueObjects/CalendarItemStatus';
import { CategoryFamily } from '../valueObjects/CategoryFamily';

export interface CalendarItemMetadata {
  expectedAttendance?: number;
  orchestraSection?: string;
  repertoire?: string[];
  budgetRequired?: number;
  isPublic?: boolean;
  academicTerm?: string;
  customFields?: Record<string, string | number | boolean>;
}

export interface CalendarItemProps {
  id: string;
  title: string;
  description: string;
  kind: CalendarItemKind;
  category: CategoryFamily;
  departmentOwner: DepartmentCode;
  secondaryDepartments?: DepartmentCode[];
  ownerRole: string;
  startAt: string; // ISO 8601 string
  endAt: string;   // ISO 8601 string
  allDay: boolean;
  status: CalendarItemStatus;
  priority: PriorityLevel;
  location?: string;
  venueId?: string;
  parentCycleId?: string;
  metadata?: CalendarItemMetadata;
  createdAt: string;
  updatedAt: string;
}

export class CalendarItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly kind: CalendarItemKind;
  readonly category: CategoryFamily;
  readonly departmentOwner: DepartmentCode;
  readonly secondaryDepartments: DepartmentCode[];
  readonly ownerRole: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly allDay: boolean;
  readonly status: CalendarItemStatus;
  readonly priority: PriorityLevel;
  readonly location?: string;
  readonly venueId?: string;
  readonly parentCycleId?: string;
  readonly metadata: CalendarItemMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: CalendarItemProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.kind = props.kind;
    this.category = props.category;
    this.departmentOwner = props.departmentOwner;
    this.secondaryDepartments = props.secondaryDepartments ?? [];
    this.ownerRole = props.ownerRole;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.allDay = props.allDay;
    this.status = props.status;
    this.priority = props.priority;
    this.location = props.location;
    this.venueId = props.venueId;
    this.parentCycleId = props.parentCycleId;
    this.metadata = props.metadata ?? {};
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get durationInHours(): number {
    const start = new Date(this.startAt).getTime();
    const end = new Date(this.endAt).getTime();
    return Math.max(0, (end - start) / (1000 * 60 * 60));
  }

  get allowsOperationalTriggers(): boolean {
    return this.status === 'CONFIRMED' || this.status === 'ACTIVE' || this.status === 'CLOSING';
  }

  isUpcoming(now: Date = new Date()): boolean {
    return new Date(this.startAt) >= now;
  }

  daysUntilStart(now: Date = new Date()): number {
    const diff = new Date(this.startAt).getTime() - now.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  toJSON(): CalendarItemProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      kind: this.kind,
      category: this.category,
      departmentOwner: this.departmentOwner,
      secondaryDepartments: this.secondaryDepartments,
      ownerRole: this.ownerRole,
      startAt: this.startAt,
      endAt: this.endAt,
      allDay: this.allDay,
      status: this.status,
      priority: this.priority,
      location: this.location,
      venueId: this.venueId,
      parentCycleId: this.parentCycleId,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
