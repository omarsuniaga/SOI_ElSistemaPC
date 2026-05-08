import { router } from '../../core/router/router.js';
import { renderProgramasView } from './views/programasView.js';

export function registerRoutesProgramas() {
  router.register('programas', renderProgramasView);
}
