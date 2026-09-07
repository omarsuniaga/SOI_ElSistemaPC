import type { AlumnoCarteraRow } from '../hooks/useAlumnosCartera';

export type CarteraTab = 'pendientes' | 'al_dia' | 'retirados' | 'todos';

export const CARTERA_TABS: { id: CarteraTab; label: string }[] = [
  { id: 'pendientes', label: 'Pendientes de cobro' },
  { id: 'al_dia', label: 'Al día / Becados' },
  { id: 'retirados', label: 'Deudas de retirados' },
  { id: 'todos', label: 'Todos' },
];

/** Días de atraso de la cuota vencida más antigua (0 si no hay o es futura). */
export function diasAtraso(fechaMasAntiguaVencida: string | null | undefined, hoy: Date = new Date()): number {
  if (!fechaMasAntiguaVencida) return 0;
  const venc = new Date(`${fechaMasAntiguaVencida}T00:00:00`);
  if (Number.isNaN(venc.getTime())) return 0;
  const ms = hoy.getTime() - venc.getTime();
  return ms <= 0 ? 0 : Math.floor(ms / 86_400_000);
}

/** Filtro de pestaña + búsqueda. La búsqueda es sobre alumno / contacto / familia. */
export function filtrarCartera(
  rows: AlumnoCarteraRow[],
  tab: CarteraTab,
  search: string,
): AlumnoCarteraRow[] {
  const term = search.trim().toLowerCase();

  return rows.filter((r) => {
    // 1. pestaña
    switch (tab) {
      case 'pendientes':
        if (r.estado_pago !== 'debe' && r.estado_pago !== 'mora') return false;
        break;
      case 'al_dia':
        if (r.estado_pago !== 'al_dia' && r.estado_pago !== 'exento') return false;
        break;
      case 'retirados':
        if (r.estado_pago !== 'inactivo' || (r.saldo_pendiente_centavos ?? 0) <= 0) return false;
        break;
      case 'todos':
      default:
        break;
    }

    // 2. búsqueda
    if (!term) return true;
    return (
      (r.alumno_nombre ?? '').toLowerCase().includes(term) ||
      (r.contacto_nombre ?? '').toLowerCase().includes(term) ||
      (r.nombre_familia ?? '').toLowerCase().includes(term)
    );
  });
}

/** Conteo por pestaña, para los badges. */
export function contarPorPestana(rows: AlumnoCarteraRow[]): Record<CarteraTab, number> {
  return {
    pendientes: rows.filter((r) => r.estado_pago === 'debe' || r.estado_pago === 'mora').length,
    al_dia: rows.filter((r) => r.estado_pago === 'al_dia' || r.estado_pago === 'exento').length,
    retirados: rows.filter((r) => r.estado_pago === 'inactivo' && (r.saldo_pendiente_centavos ?? 0) > 0).length,
    todos: rows.length,
  };
}

export interface SemaforoInfo {
  dot: string;      // clase de color del punto
  label: string;
  chip: string;     // clases del chip de estado
}

export function semaforo(estado: string | null | undefined): SemaforoInfo {
  switch (estado) {
    case 'al_dia':
      return { dot: 'bg-emerald-400', label: 'Al día', chip: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'exento':
      return { dot: 'bg-sky-400', label: 'Exento', chip: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    case 'debe':
      return { dot: 'bg-amber-400', label: 'Debe', chip: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'mora':
      return { dot: 'bg-rose-500', label: 'En mora', chip: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    case 'inactivo':
      return { dot: 'bg-zinc-500', label: 'Retirado', chip: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
    default:
      return { dot: 'bg-zinc-600', label: estado ?? '—', chip: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  }
}
