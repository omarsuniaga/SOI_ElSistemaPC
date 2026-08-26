export interface AcademicPeriodProps {
  id: string;
  code: string; // e.g. '2026-S2', '2027-S1'
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  enrollmentDeadline: string;
  regularClassesStart: string;
  evaluationWeek: string;
}

export class AcademicPeriod {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly isActive: boolean;
  readonly enrollmentDeadline: string;
  readonly regularClassesStart: string;
  readonly evaluationWeek: string;

  constructor(props: AcademicPeriodProps) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.isActive = props.isActive;
    this.enrollmentDeadline = props.enrollmentDeadline;
    this.regularClassesStart = props.regularClassesStart;
    this.evaluationWeek = props.evaluationWeek;
  }

  toJSON(): AcademicPeriodProps {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
      enrollmentDeadline: this.enrollmentDeadline,
      regularClassesStart: this.regularClassesStart,
      evaluationWeek: this.evaluationWeek,
    };
  }
}
