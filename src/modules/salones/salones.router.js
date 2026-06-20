import { router } from '../../core/router/router.js';
import { renderSalonesView } from './views/salonesView.js';

export function registerRoutesSalones() {
  router.register('salones', renderSalonesView);
}
