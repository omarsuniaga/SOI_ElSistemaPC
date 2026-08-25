import { AutomationLevel, DepartmentCode, TriggerCondition } from '../../shared/types';

export type TriggerType = 'ABSOLUTE' | 'RELATIVE' | 'RECURRENT' | 'CONDITIONAL';

export type TriggerOffsetUnit = 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS';

export type TriggerActionType =
  | 'SPAWN_PROTOCOL_RUN'
  | 'CREATE_TASK'
  | 'SEND_DISPATCH'
  | 'EVALUATE_CONDITIONS'
  | 'ESCALATE_ALERT';

export interface TemporalTriggerProps {
  id: string;
  calendarItemId: string;
  type: TriggerType;
  offsetValue: number; // e.g. -90 for T-90, -7 for T-7, 0 for T0, +1 for T+1
  offsetUnit: TriggerOffsetUnit;
  label: string; // e.g. 'T-90', 'T-7', 'T0', 'T+3'
  fireAt: string; // Calculated ISO timestamp
  condition?: TriggerCondition;
  protocolCode?: string; // Canonical SOI process code or placeholder (e.g. ACM-PXX, ADM-P01)
  actionType: TriggerActionType;
  requiresApproval: boolean;
  automationLevel: AutomationLevel;
  department: DepartmentCode;
  ownerRole: string;
  description: string;
  isActive: boolean;
  lastExecutedAt?: string;
  isExecuted?: boolean;
}

export class TemporalTrigger {
  readonly id: string;
  readonly calendarItemId: string;
  readonly type: TriggerType;
  readonly offsetValue: number;
  readonly offsetUnit: TriggerOffsetUnit;
  readonly label: string;
  readonly fireAt: string;
  readonly condition?: TriggerCondition;
  readonly protocolCode?: string;
  readonly actionType: TriggerActionType;
  readonly requiresApproval: boolean;
  readonly automationLevel: AutomationLevel;
  readonly department: DepartmentCode;
  readonly ownerRole: string;
  readonly description: string;
  readonly isActive: boolean;
  readonly lastExecutedAt?: string;
  readonly isExecuted: boolean;

  constructor(props: TemporalTriggerProps) {
    this.id = props.id;
    this.calendarItemId = props.calendarItemId;
    this.type = props.type;
    this.offsetValue = props.offsetValue;
    this.offsetUnit = props.offsetUnit;
    this.label = props.label || this.computeLabel(props.offsetValue);
    this.fireAt = props.fireAt;
    this.condition = props.condition;
    this.protocolCode = props.protocolCode;
    this.actionType = props.actionType;
    this.requiresApproval = props.requiresApproval;
    this.automationLevel = props.automationLevel;
    this.department = props.department;
    this.ownerRole = props.ownerRole;
    this.description = props.description;
    this.isActive = props.isActive;
    this.lastExecutedAt = props.lastExecutedAt;
    this.isExecuted = props.isExecuted ?? false;
  }

  private computeLabel(offset: number): string {
    if (offset === 0) return 'T0';
    if (offset > 0) return `T+${offset}`;
    return `T${offset}`;
  }

  get isOverdue(): boolean {
    if (this.isExecuted) return false;
    return new Date(this.fireAt) < new Date();
  }

  toJSON(): TemporalTriggerProps {
    return {
      id: this.id,
      calendarItemId: this.calendarItemId,
      type: this.type,
      offsetValue: this.offsetValue,
      offsetUnit: this.offsetUnit,
      label: this.label,
      fireAt: this.fireAt,
      condition: this.condition,
      protocolCode: this.protocolCode,
      actionType: this.actionType,
      requiresApproval: this.requiresApproval,
      automationLevel: this.automationLevel,
      department: this.department,
      ownerRole: this.ownerRole,
      description: this.description,
      isActive: this.isActive,
      lastExecutedAt: this.lastExecutedAt,
      isExecuted: this.isExecuted,
    };
  }
}
