export type TriggerExecutionStatus =
  | 'PENDING'
  | 'EXECUTED'
  | 'SKIPPED'
  | 'FAILED'
  | 'RETRYING';

export interface TriggerExecutionProps {
  id: string;
  triggerId: string;
  scheduledFor: string;
  executedAt?: string;
  status: TriggerExecutionStatus;
  protocolRunId?: string;
  idempotencyKey: string; // UNIQUE constraint simulation
  retryCount: number;
  errorMessage?: string;
}

export class TriggerExecution {
  readonly id: string;
  readonly triggerId: string;
  readonly scheduledFor: string;
  readonly executedAt?: string;
  readonly status: TriggerExecutionStatus;
  readonly protocolRunId?: string;
  readonly idempotencyKey: string;
  readonly retryCount: number;
  readonly errorMessage?: string;

  constructor(props: TriggerExecutionProps) {
    this.id = props.id;
    this.triggerId = props.triggerId;
    this.scheduledFor = props.scheduledFor;
    this.executedAt = props.executedAt;
    this.status = props.status;
    this.protocolRunId = props.protocolRunId;
    this.idempotencyKey = props.idempotencyKey;
    this.retryCount = props.retryCount;
    this.errorMessage = props.errorMessage;
  }

  toJSON(): TriggerExecutionProps {
    return {
      id: this.id,
      triggerId: this.triggerId,
      scheduledFor: this.scheduledFor,
      executedAt: this.executedAt,
      status: this.status,
      protocolRunId: this.protocolRunId,
      idempotencyKey: this.idempotencyKey,
      retryCount: this.retryCount,
      errorMessage: this.errorMessage,
    };
  }
}
