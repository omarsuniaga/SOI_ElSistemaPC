import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterStudents, resolveRoute } from './domain.ts';
const { students, classes } = JSON.parse(readFileSync(new URL('./assets/data/mocks/academic.json', import.meta.url), 'utf8'));
test('pending assignment excludes inactive students', () => {
  const result = filterStudents(students, '', 'unassigned');
  assert.equal(result.length, 2);
  assert.ok(result.every(student => student.status === 'activo' && student.classId === null));
});
test('search is accent insensitive and combines with follow-up filter', () => {
  assert.equal(filterStudents(students, 'violin', 'all').length, 5);
  assert.equal(filterStudents(students, 'violin', 'unassigned').length, 1);
  assert.equal(filterStudents(students, 'nonexistent', 'all').length, 0);
});
test('all class references resolve and capacity is respected', () => {
  for (const student of students) assert.ok(student.classId === null || classes.some((clase: {id: string}) => clase.id === student.classId));
  for (const clase of classes) assert.ok(students.filter((student: {classId: string | null}) => student.classId === clase.id).length <= clase.capacity);
});
test('direct URLs resolve and unknown nested routes are rejected', () => {
  assert.deepEqual(resolveRoute('/academico/clases/'), {page:'classes'});
  assert.deepEqual(resolveRoute('/alumnos/demo-alumno-1'), {page:'student',id:'demo-alumno-1'});
  assert.deepEqual(resolveRoute('/clases/demo-clase-1'), {page:'class',id:'demo-clase-1'});
  for (const path of ['/other','//evil.test','/alumnos/demo-alumno-1/edit','/api/v2/students']) assert.deepEqual(resolveRoute(path), {page:'notFound'});
});
