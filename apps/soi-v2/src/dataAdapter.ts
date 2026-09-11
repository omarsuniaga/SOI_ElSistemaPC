import snapshot from './assets/data/mocks/academic.json';
import type { AcademicDataAdapter } from './domain';
// This demo has no credentials or remote persistence. UI consumes this port only.
export const academicDataAdapter: AcademicDataAdapter = {
  async load() { return structuredClone(snapshot); }
};
