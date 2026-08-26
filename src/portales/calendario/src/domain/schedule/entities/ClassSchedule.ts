export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ClassScheduleProps {
  id: string;
  chairName: string; // e.g. 'Cátedra de Cuerdas Frotadas', 'Cátedra de Viento Metal', 'Iniciación Musical'
  teacherName: string;
  teacherId: string;
  instrument: string; // e.g. 'Violín I', 'Violonchelo', 'Trompeta', 'Coro Infantil'
  studentGroup: string; // e.g. 'Orquesta Sinfónica Juvenil', 'Nivel Intermedio B', 'Semillero A'
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g. '15:00'
  endTime: string;   // e.g. '17:00'
  venueId: string;
  venueName: string;
  academicPeriodId: string;
  maxStudents: number;
  currentEnrolled: number;
}

export class ClassSchedule {
  readonly id: string;
  readonly chairName: string;
  readonly teacherName: string;
  readonly teacherId: string;
  readonly instrument: string;
  readonly studentGroup: string;
  readonly dayOfWeek: DayOfWeek;
  readonly startTime: string;
  readonly endTime: string;
  readonly venueId: string;
  readonly venueName: string;
  readonly academicPeriodId: string;
  readonly maxStudents: number;
  readonly currentEnrolled: number;

  constructor(props: ClassScheduleProps) {
    this.id = props.id;
    this.chairName = props.chairName;
    this.teacherName = props.teacherName;
    this.teacherId = props.teacherId;
    this.instrument = props.instrument;
    this.studentGroup = props.studentGroup;
    this.dayOfWeek = props.dayOfWeek;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.venueId = props.venueId;
    this.venueName = props.venueName;
    this.academicPeriodId = props.academicPeriodId;
    this.maxStudents = props.maxStudents;
    this.currentEnrolled = props.currentEnrolled;
  }

  toJSON(): ClassScheduleProps {
    return {
      id: this.id,
      chairName: this.chairName,
      teacherName: this.teacherName,
      teacherId: this.teacherId,
      instrument: this.instrument,
      studentGroup: this.studentGroup,
      dayOfWeek: this.dayOfWeek,
      startTime: this.startTime,
      endTime: this.endTime,
      venueId: this.venueId,
      venueName: this.venueName,
      academicPeriodId: this.academicPeriodId,
      maxStudents: this.maxStudents,
      currentEnrolled: this.currentEnrolled,
    };
  }
}
