import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { HermesInsight } from '../../../domain/orchestration/entities/HermesInsight';

export class GetHermesRecommendations {
  constructor(private protocolRunRepo: ProtocolRunRepository) {}

  async execute(): Promise<HermesInsight[]> {
    const insights = await this.protocolRunRepo.getInsights();
    return insights.filter(i => !i.isDismissed);
  }

  async dismiss(id: string): Promise<void> {
    return this.protocolRunRepo.dismissInsight(id);
  }
}
