import { ProtocolRun } from '../entities/ProtocolRun';
import { TriggerExecution } from '../entities/TriggerExecution';
import { HermesInsight } from '../entities/HermesInsight';

export interface ProtocolRunRepository {
  findAll(): Promise<ProtocolRun[]>;
  findById(id: string): Promise<ProtocolRun | null>;
  findByCalendarItemId(calendarItemId: string): Promise<ProtocolRun[]>;
  findByCorrelationId(correlationId: string): Promise<ProtocolRun | null>;
  save(run: ProtocolRun): Promise<void>;
  
  // Executions & Idempotency
  getExecutionByIdempotencyKey(key: string): Promise<TriggerExecution | null>;
  saveExecution(execution: TriggerExecution): Promise<void>;
  
  // Hermes Insights
  getInsights(): Promise<HermesInsight[]>;
  saveInsight(insight: HermesInsight): Promise<void>;
  dismissInsight(id: string): Promise<void>;
}
