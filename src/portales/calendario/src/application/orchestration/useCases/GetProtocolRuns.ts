import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { ProtocolRun } from '../../../domain/orchestration/entities/ProtocolRun';

export class GetProtocolRuns {
  constructor(private protocolRunRepo: ProtocolRunRepository) {}

  async execute(): Promise<ProtocolRun[]> {
    return this.protocolRunRepo.findAll();
  }
}
