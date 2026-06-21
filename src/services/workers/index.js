import { registerObservationPromotionCron } from './observationPromotionCron.js'
import { registerBitacoraAlertCron } from './bitacoraAlertCron.js'
import { registerAsistenciaWhatsappCron } from './asistenciaWhatsappCron.js'
import { registerRiesgoPedagogicoCron } from './riesgoPedagogicoCron.js'
import { registerReportesPdfCron } from './reportesPdfCron.js'

export function registerAllCrons(supabase, logger = console) {
  registerObservationPromotionCron(supabase, logger)
  registerBitacoraAlertCron(supabase, logger)
  registerAsistenciaWhatsappCron(supabase, logger)
  registerRiesgoPedagogicoCron(supabase, logger)
  registerReportesPdfCron(supabase, logger)
}
