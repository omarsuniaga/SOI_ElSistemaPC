import { Alumno, Cuota, Familia } from '../types';

export interface FilterFamiliasParams {
  familias: Familia[];
  alumnos: Alumno[];
  searchTerm: string;
  soloAlumnosActivos: boolean;
}

/**
 * Filtra el listado de familias para la ventanilla de cobro garantizando que,
 * por defecto, solo se listen familias con alumnos activos y no se busque
 * sobre alumnos retirados.
 */
export function filtrarFamiliasCobro(params: FilterFamiliasParams): Familia[] {
  const { familias, alumnos, searchTerm, soloAlumnosActivos } = params;
  const term = searchTerm.trim().toLowerCase();

  return familias.filter(f => {
    const alusFam = alumnos.filter(a => a.familia_id === f.id);
    
    // Si soloAlumnosActivos está activado, la familia debe tener al menos 1 alumno activo
    if (soloAlumnosActivos) {
      const tieneActivos = alusFam.some(a => a.activo);
      if (!tieneActivos) return false;
    }

    if (!term) return true;

    const matchApellidos = f.apellidos.toLowerCase().includes(term);
    const matchRep = f.representante_principal?.nombre_completo.toLowerCase().includes(term) ?? false;
    const matchTel = f.telefono_principal.includes(term);
    const matchCed = f.representante_principal?.cedula.includes(term) ?? false;
    
    const matchAlu = alusFam.some(a => {
      if (soloAlumnosActivos && !a.activo) return false;
      return a.nombre_completo.toLowerCase().includes(term);
    });

    return matchApellidos || matchRep || matchTel || matchCed || matchAlu;
  });
}

/**
 * Discrimina y preselecciona las cuotas de cobro, protegiendo al cajero de
 * cobrar accidentalmente cuotas a alumnos inactivos o retirados.
 */
export function resolverCuotasCobro(params: {
  cuotasFamilia: Cuota[];
  alumnosFamilia: Alumno[];
  soloAlumnosActivos?: boolean;
}): {
  cuotasSeleccionadas: Cuota[];
  cuotasActivas: Cuota[];
  cuotasInactivas: Cuota[];
  totalCentavos: number;
} {
  const { cuotasFamilia, alumnosFamilia, soloAlumnosActivos = true } = params;
  const activeAluIds = new Set(alumnosFamilia.filter(a => a.activo).map(a => a.id));

  const cuotasActivas: Cuota[] = [];
  const cuotasInactivas: Cuota[] = [];

  for (const c of cuotasFamilia) {
    if (activeAluIds.has(c.alumno_id)) {
      cuotasActivas.push(c);
    } else {
      cuotasInactivas.push(c);
    }
  }

  // Preselecciona cuotas de alumnos activos si existen; si no hay activos pero el usuario
  // abrió la familia deliberadamente para cobro de cartera vieja, selecciona las disponibles
  const cuotasSeleccionadas = (soloAlumnosActivos && cuotasActivas.length > 0)
    ? cuotasActivas
    : cuotasFamilia;

  const totalCentavos = cuotasSeleccionadas.reduce((acc, c) => acc + c.saldo_centavos, 0);

  return {
    cuotasSeleccionadas,
    cuotasActivas,
    cuotasInactivas,
    totalCentavos
  };
}
