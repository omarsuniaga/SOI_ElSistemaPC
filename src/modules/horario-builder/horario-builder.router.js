import { router } from '../../core/router/router.js';
import { renderHorarioBuilderView } from './views/horarioBuilderView.js';

export function registerRoutesHorarioBuilder() {
  router.register('horario-builder', renderHorarioBuilderView);
}
