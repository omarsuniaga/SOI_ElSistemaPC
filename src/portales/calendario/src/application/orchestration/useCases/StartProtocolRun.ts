import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { ProtocolRun } from '../../../domain/orchestration/entities/ProtocolRun';

export class StartProtocolRun {
  constructor(private protocolRunRepo: ProtocolRunRepository) {}

  async execute(processCode: string, processName: string, calendarItemId?: string): Promise<ProtocolRun> {
    const runId = `run-${processCode.toLowerCase()}-${Date.now()}`;
    const correlationId = `SOI-${processCode}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;

    const newRun = new ProtocolRun({
      id: runId,
      processCode,
      processName,
      calendarItemId: calendarItemId || 'item-evt-2026-xmas',
      correlationId,
      status: 'RUNNING',
      ownerRole: 'Coordinador General',
      startedAt: new Date().toISOString(),
      overallProgress: 0,
      departmentBreakdown: [
        { department: 'EVT', totalTasks: 4, completedTasks: 0, percentage: 0 },
        { department: 'LOG', totalTasks: 3, completedTasks: 0, percentage: 0 },
        { department: 'ACM', totalTasks: 2, completedTasks: 0, percentage: 0 },
      ],
      snapshotContext: {
        triggeredBy: 'Manual Launch via SOI Console',
      },
    });

    await this.protocolRunRepo.save(newRun);
    return newRun;
  }
}
