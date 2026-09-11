export interface Alumno { id: string; name: string; instrument: string; level: string; classId: string | null; absences: number; contactVerified: boolean; status: string }
export interface Clase { id: string; name: string; teacher: string; day: string; time: string; room: string; capacity: number }
export interface AcademicSnapshot { students: Alumno[]; classes: Clase[] }
export interface AcademicDataAdapter { load(): Promise<AcademicSnapshot> }
export type Filter = 'all' | 'unassigned' | 'absence' | 'contact';
export const needsAssignment = (student: Alumno) => student.status === 'activo' && student.classId === null;
export function filterStudents(students: Alumno[], query: string, filter: Filter) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  return students.filter(student => normalize(`${student.name} ${student.instrument}`).includes(normalize(query)) &&
    (filter === 'all' || (filter === 'unassigned' && needsAssignment(student)) ||
    (filter === 'absence' && student.status === 'activo' && student.absences >= 2) ||
    (filter === 'contact' && student.status === 'activo' && !student.contactVerified)));
}
export type Route = { page: 'home' | 'students' | 'classes' | 'notFound' } | { page: 'student' | 'class'; id: string };
export function resolveRoute(path: string): Route {
  const normalized = path.replace(/\/+$/, '') || '/';
  if (normalized === '/' || normalized === '/academico') return { page: 'home' };
  if (normalized === '/administrativo') return { page: 'students' };
  if (normalized === '/academico/clases') return { page: 'classes' };
  const detail = normalized.match(/^\/(alumnos|clases)\/(demo-(?:alumno|clase)-\d+)$/);
  if (detail) return { page: detail[1] === 'alumnos' ? 'student' : 'class', id: detail[2] };
  return { page: 'notFound' };
}
