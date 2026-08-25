import { HealthEvaluationResult } from '../../../domain/orchestration/services/OperationalHealthService';
import { ProtocolRun } from '../../../domain/orchestration/entities/ProtocolRun';
import { InstitutionalTask } from '../../../domain/tasks/entities/InstitutionalTask';
import { TaskDAGResolution } from '../../../domain/tasks/policies/TaskUnlockPolicy';

export interface ProtocolRunDetailDTO {
  run: ProtocolRun;
  tasks: InstitutionalTask[];
  dagResolutions: Record<string, TaskDAGResolution>;
  health?: HealthEvaluationResult;
}

export interface ProtocolPreviewDTO {
  processCode: string;
  processName: string;
  targetDate: string;
  proposedTasks: Array<{
    title: string;
    department: string;
    ownerRole: string;
    offsetDays: number;
    priority: string;
    evidenceRequired: boolean;
  }>;
  estimatedDurationDays: number;
  participatingDepartments: string[];
}
