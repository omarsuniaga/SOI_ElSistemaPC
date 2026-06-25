/**
 * allRegistrars.js — Lista única de registrars de módulos (espejo de MODULES_REGISTRY
 * en main.js). Ambos portales departamentales registran TODOS los módulos para que
 * cualquier data-route resuelva en el router central; la diferencia entre portales es
 * la NAV que se muestra (la lente) + el gating por rol, no qué módulos existen.
 */

import { registerRoutesMaestros } from '../../modules/maestros/index.js'
import { registerRoutesProgramas } from '../../modules/programas/index.js'
import { registerRoutesAlumnos } from '../../modules/alumnos/index.js'
import { registerRoutesSalones } from '../../modules/salones/index.js'
import { registerRoutesClases } from '../../modules/clases/index.js'
import { registerRoutesAsistencias } from '../../modules/asistencias/index.js'
import { registerRoutesPlanificacion } from '../../modules/planificacion/index.js'
import { registerRoutesProgresos } from '../../modules/progresos/index.js'
import { registerRoutesObservaciones } from '../../modules/observaciones/index.js'
import { registerRoutesMetricas } from '../../modules/metricas/index.js'
import { registerRoutesConfig } from '../../modules/config/index.js'
import { registerRoutesAcademicAdmin } from '../../modules/academic-admin/academic-admin.router.js'
import { registerRoutesAdminDashboard } from '../../modules/admin-dashboard/admin-dashboard.router.js'
import { registerRoutesPermisos } from '../../modules/permisos/index.js'
import { registerRoutesPedagogico } from '../../modules/pedagogico/index.js'
import { registerRoutesHorarioBuilder } from '../../modules/horario-builder/index.js'
import { registerRoutesAdminNotificaciones } from '../../modules/admin-notificaciones/index.js'
import { registerRoutesAdminAprobacion } from '../../modules/admin-aprobacion/index.js'
import { registerRoutesAdminUsuarios } from '../../modules/admin-usuarios/index.js'
import { registerRoutesBitacora } from '../../modules/bitacora/index.js'

export const allRegistrars = [
  registerRoutesProgramas,
  registerRoutesClases,
  registerRoutesSalones,
  registerRoutesHorarioBuilder,
  registerRoutesPedagogico,
  registerRoutesPlanificacion,
  registerRoutesProgresos,
  registerRoutesObservaciones,
  registerRoutesBitacora,
  registerRoutesAsistencias,
  registerRoutesMetricas,
  registerRoutesAcademicAdmin,
  registerRoutesAlumnos,
  registerRoutesMaestros,
  registerRoutesPermisos,
  registerRoutesConfig,
  registerRoutesAdminDashboard,
  registerRoutesAdminNotificaciones,
  registerRoutesAdminAprobacion,
  registerRoutesAdminUsuarios,
]
