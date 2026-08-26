import { AutomationLevel, DepartmentCode } from '../../shared/types';

export type InsightType = 'RISK' | 'DETECTION' | 'RECOMMENDATION' | 'OPPORTUNITY';

export interface ProposedAction {
  id: string;
  label: string;
  actionType: 'TRIGGER_WORKFLOW' | 'ESCALATE_TASK' | 'SEND_REMINDER' | 'DISMISS' | 'OPEN_DRAWER';
  payload?: Record<string, string | number | boolean>;
  isPrimary?: boolean;
}

export interface HermesInsightProps {
  id: string;
  type: InsightType;
  title: string;
  summary: string;
  detailedAnalysis?: string;
  department: DepartmentCode;
  automationLevel: AutomationLevel;
  calendarItemId?: string;
  protocolRunId?: string;
  correlationId?: string;
  metrics?: Array<{ label: string; value: string | number; badge?: string }>;
  proposedActions: ProposedAction[];
  createdAt: string;
  isDismissed?: boolean;
}

export class HermesInsight {
  readonly id: string;
  readonly type: InsightType;
  readonly title: string;
  readonly summary: string;
  readonly detailedAnalysis?: string;
  readonly department: DepartmentCode;
  readonly automationLevel: AutomationLevel;
  readonly calendarItemId?: string;
  readonly protocolRunId?: string;
  readonly correlationId?: string;
  readonly metrics: Array<{ label: string; value: string | number; badge?: string }>;
  readonly proposedActions: ProposedAction[];
  readonly createdAt: string;
  readonly isDismissed: boolean;

  constructor(props: HermesInsightProps) {
    this.id = props.id;
    this.type = props.type;
    this.title = props.title;
    this.summary = props.summary;
    this.detailedAnalysis = props.detailedAnalysis;
    this.department = props.department;
    this.automationLevel = props.automationLevel;
    this.calendarItemId = props.calendarItemId;
    this.protocolRunId = props.protocolRunId;
    this.correlationId = props.correlationId;
    this.metrics = props.metrics ?? [];
    this.proposedActions = props.proposedActions ?? [];
    this.createdAt = props.createdAt;
    this.isDismissed = props.isDismissed ?? false;
  }

  toJSON(): HermesInsightProps {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      summary: this.summary,
      detailedAnalysis: this.detailedAnalysis,
      department: this.department,
      automationLevel: this.automationLevel,
      calendarItemId: this.calendarItemId,
      protocolRunId: this.protocolRunId,
      correlationId: this.correlationId,
      metrics: this.metrics,
      proposedActions: this.proposedActions,
      createdAt: this.createdAt,
      isDismissed: this.isDismissed,
    };
  }
}
