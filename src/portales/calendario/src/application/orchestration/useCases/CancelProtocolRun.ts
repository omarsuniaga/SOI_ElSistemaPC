import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { ProtocolRun } from '../../../domain/orchestration/entities/ProtocolRun';

export class CancelProtocolRun {
  constructor(private protocolRunRepo: ProtocolRunRepository) {}

  async execute(runId: string, reason: string): Promise<ProtocolRun> {
    const run = await this.protocolRunRepo.findById(runId);
    if (!run) {
      throw new Error(`Protocol Run con ID ${runId} no encontrado.`);
    }

    const cancelledRun = new ProtocolRun({
      ...run.toJSON(),
      status: 'CANCELLED',
      completedAt: new Date().toISOString(),
      snapshotContext: {
        ...run.snapshotContext,
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
      },
    });

    await this.protocolRunRepo.save(cancelledRun);
    return cancelledRun;
  }
}
