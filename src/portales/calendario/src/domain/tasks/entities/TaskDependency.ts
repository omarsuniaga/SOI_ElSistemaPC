export type TaskDependencyType = 'BLOCKING' | 'INFORMATIONAL';

export interface TaskDependencyProps {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: TaskDependencyType;
  description?: string;
}

export class TaskDependency {
  readonly id: string;
  readonly taskId: string;
  readonly dependsOnTaskId: string;
  readonly dependencyType: TaskDependencyType;
  readonly description?: string;

  constructor(props: TaskDependencyProps) {
    this.id = props.id;
    this.taskId = props.taskId;
    this.dependsOnTaskId = props.dependsOnTaskId;
    this.dependencyType = props.dependencyType;
    this.description = props.description;
  }

  toJSON(): TaskDependencyProps {
    return {
      id: this.id,
      taskId: this.taskId,
      dependsOnTaskId: this.dependsOnTaskId,
      dependencyType: this.dependencyType,
      description: this.description,
    };
  }
}
