/**
 * Institutional & Regulatory Policy Settings
 * Configurable thresholds separated from pure invariant mechanisms.
 */

export interface ReceivablesPolicyConfig {
  diasGraciaMora: number; // e.g. 5 days after due date before mora flag
  limiteDiasMoraGrave: number; // e.g. 60 days
  montoCuotaBaseMensualCents: number; // e.g. 125000 (RD$ 1,250.00)
  montoInscripcionCents: number; // e.g. 60000 (RD$ 600.00)
  porcentajeRetencionItbisServicios: number; // e.g. 100% or 30%
  porcentajeRetencionIsrServicios: number; // e.g. 10%
}

export const DEFAULT_RECEIVABLES_POLICY: ReceivablesPolicyConfig = {
  diasGraciaMora: 5,
  limiteDiasMoraGrave: 60,
  montoCuotaBaseMensualCents: 125000,
  montoInscripcionCents: 60000,
  porcentajeRetencionItbisServicios: 100,
  porcentajeRetencionIsrServicios: 10
};
