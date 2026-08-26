import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { ProtocolRun } from '../../../domain/orchestration/entities/ProtocolRun';
import { TriggerExecution } from '../../../domain/orchestration/entities/TriggerExecution';
import { HermesInsight } from '../../../domain/orchestration/entities/HermesInsight';
import { INITIAL_PROTOCOL_RUNS, INITIAL_HERMES_INSIGHTS } from './mockData';

export class MockProtocolRunRepository implements ProtocolRunRepository {
  private runs: Map<string, ProtocolRun> = new Map();
  private executions: Map<string, TriggerExecution> = new Map();
  private insights: Map<string, HermesInsight> = new Map();

  constructor() {
    for (const data of INITIAL_PROTOCOL_RUNS) {
      this.runs.set(data.id, new ProtocolRun(data));
    }
    for (const data of INITIAL_HERMES_INSIGHTS) {
      this.insights.set(data.id, new HermesInsight(data));
    }
  }

  async findAll(): Promise<ProtocolRun[]> {
    return Array.from(this.runs.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async findById(id: string): Promise<ProtocolRun | null> {
    return this.runs.get(id) ?? null;
  }

  async findByCalendarItemId(calendarItemId: string): Promise<ProtocolRun[]> {
    return Array.from(this.runs.values()).filter(r => r.calendarItemId === calendarItemId);
  }

  async findByCorrelationId(correlationId: string): Promise<ProtocolRun | null> {
    return Array.from(this.runs.values()).find(r => r.correlationId === correlationId) ?? null;
  }

  async save(run: ProtocolRun): Promise<void> {
    this.runs.set(run.id, run);
  }

  async getExecutionByIdempotencyKey(key: string): Promise<TriggerExecution | null> {
    return Array.from(this.executions.values()).find(e => e.idempotencyKey === key) ?? null;
  }

  async saveExecution(execution: TriggerExecution): Promise<void> {
    this.executions.set(execution.id, execution);
  }

  async getInsights(): Promise<HermesInsight[]> {
    return Array.from(this.insights.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async saveInsight(insight: HermesInsight): Promise<void> {
    this.insights.set(insight.id, insight);
  }

  async dismissInsight(id: string): Promise<void> {
    const existing = this.insights.get(id);
    if (existing) {
      this.insights.set(
        id,
        new HermesInsight({
          ...existing.toJSON(),
          isDismissed: true,
        })
      );
    }
  }
}
