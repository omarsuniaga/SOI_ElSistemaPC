// Lógica pura de estado para Gastos Fijos Mensuales (ventana de pago día_inicio-día_fin).
// Extraída como función pura para poder testearla, igual que FifoAllocationEngine/Money.

export type ToneGastoFijo = 'ok' | 'warn' | 'crit' | 'idle';

export interface EstadoGastoFijo {
  tone: ToneGastoFijo;
  label: string;
  sub: string;
}

export interface GastoFijoVentana {
  diaInicio: number;
  diaFin: number;
}

/**
 * Calcula el estado de un gasto fijo para un día del mes dado.
 * - `pagado=true` siempre gana (fechaPago se usa solo para el mensaje).
 * - Dentro de la ventana [diaInicio, diaFin] y sin pagar -> "warn" (en ventana, urge).
 * - Después de diaFin y sin pagar -> "crit" (vencido).
 * - Antes de diaInicio -> "idle" (próximo).
 */
export function computeEstadoGastoFijo(
  gasto: GastoFijoVentana,
  hoy: number,
  pagado: boolean,
  fechaPago?: string | null
): EstadoGastoFijo {
  if (pagado) {
    return {
      tone: 'ok',
      label: 'Pagado',
      sub: fechaPago ? `el ${fechaPago}` : 'este período',
    };
  }

  if (hoy >= gasto.diaInicio && hoy <= gasto.diaFin) {
    const restantes = gasto.diaFin - hoy;
    return {
      tone: 'warn',
      label: restantes <= 0 ? 'Último día' : `Vence en ${restantes} día${restantes === 1 ? '' : 's'}`,
      sub: 'dentro de la ventana de pago',
    };
  }

  if (hoy > gasto.diaFin) {
    const atraso = hoy - gasto.diaFin;
    return {
      tone: 'crit',
      label: 'Vencido',
      sub: `ventana cerró hace ${atraso} día${atraso === 1 ? '' : 's'}`,
    };
  }

  const faltan = gasto.diaInicio - hoy;
  return {
    tone: 'idle',
    label: 'Próximo',
    sub: `inicia en ${faltan} día${faltan === 1 ? '' : 's'}`,
  };
}

/** left%/width% (base 31 días) de la barra de ventana, para el estilo inline de la UI. */
export function computeVentanaBarra(gasto: GastoFijoVentana): { leftPct: number; widthPct: number } {
  const totalDias = 31;
  const leftPct = ((gasto.diaInicio - 1) / totalDias) * 100;
  const widthPct = ((gasto.diaFin - gasto.diaInicio + 1) / totalDias) * 100;
  return { leftPct, widthPct };
}
