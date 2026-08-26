import { TriggerRepository } from '../../../domain/calendar/repositories/TriggerRepository';
import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { TriggerExecution } from '../../../domain/orchestration/entities/TriggerExecution';

export interface ExecuteTriggerResult {
  success: boolean;
  message: string;
  execution?: TriggerExecution;
  alreadyExecuted?: boolean;
}

export class ExecuteTrigger {
  constructor(
    private triggerRepo: TriggerRepository,
    private protocolRunRepo: ProtocolRunRepository
  ) {}

  async execute(triggerId: string, correlationIdPrefix: string = 'SOI-OP'): Promise<ExecuteTriggerResult> {
    const trigger = await this.triggerRepo.findById(triggerId);
    if (!trigger) {
      return { success: false, message: `Disparador temporal #${triggerId} no encontrado.` };
    }

    const idempotencyKey = `EXEC-${trigger.id}-${trigger.fireAt.slice(0, 10)}`;
    const existing = await this.protocolRunRepo.getExecutionByIdempotencyKey(idempotencyKey);

    if (existing && existing.status === 'EXECUTED') {
      return {
        success: true,
        alreadyExecuted: true,
        message: `El disparador ${trigger.label} ya fue ejecutado previamente de forma idempotente.`,
        execution: existing,
      };
    }

    const execution = new TriggerExecution({
      id: `exec-${Date.now()}`,
      triggerId: trigger.id,
      scheduledFor: trigger.fireAt,
      executedAt: new Date().toISOString(),
      status: 'EXECUTED',
      idempotencyKey,
      retryCount: 0,
    });

    await this.protocolRunRepo.saveExecution(execution);
    await this.triggerRepo.markExecuted(trigger.id, execution.executedAt!);

    return {
      success: true,
      message: `Disparador temporal ${trigger.label} ejecutado exitosamente.`,
      execution,
    };
  }
}
