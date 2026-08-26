export type CategoryFamily =
  | 'ACADEMIC'
  | 'ARTISTIC'
  | 'ADMISSIONS'
  | 'FINANCE'
  | 'FISCAL'
  | 'ADMINISTRATIVE'
  | 'OPERATIONS'
  | 'INSTITUTIONAL'
  | 'HR'
  | 'HOLIDAYS'
  | 'PARTNERSHIPS'
  | 'COMMUNICATIONS';

export interface CategoryFamilyMeta {
  category: CategoryFamily;
  label: string;
  subcategories: string[];
  departmentDefault: string;
}

export const CATEGORY_FAMILIES: Record<CategoryFamily, CategoryFamilyMeta> = {
  ACADEMIC: {
    category: 'ACADEMIC',
    label: 'Académico',
    subcategories: ['Clases regulares', 'Evaluaciones semestrales', 'Audiciones', 'Masterclasses', 'Capacitación docente'],
    departmentDefault: 'ACM',
  },
  ARTISTIC: {
    category: 'ARTISTIC',
    label: 'Artístico y Conciertos',
    subcategories: ['Concierto de Gala', 'Recitales de Cátedra', 'Ensayos Generales', 'Festivales Orquestales'],
    departmentDefault: 'ACM',
  },
  ADMISSIONS: {
    category: 'ADMISSIONS',
    label: 'Admisiones e Ingreso',
    subcategories: ['Postulaciones', 'Inscripción Nuevo Ingreso', 'Reinscripciones Regulares'],
    departmentDefault: 'ADM',
  },
  FINANCE: {
    category: 'FINANCE',
    label: 'Finanzas y Pagos',
    subcategories: ['Cobro Colegiaturas', 'Nómina Docente', 'Pago a Proveedores', 'Cierre Contable'],
    departmentDefault: 'FIN',
  },
  FISCAL: {
    category: 'FISCAL',
    label: 'Fiscal y Regulatorio',
    subcategories: ['Declaración DGII', 'TSS', 'Infotep', 'Reporte Regulatorio'],
    departmentDefault: 'FIN',
  },
  ADMINISTRATIVE: {
    category: 'ADMINISTRATIVE',
    label: 'Administrativo',
    subcategories: ['Expedientes Estudiantiles', 'Semana Administrativa', 'Auditoría Documental'],
    departmentDefault: 'ADM',
  },
  OPERATIONS: {
    category: 'OPERATIONS',
    label: 'Operaciones y Luthería',
    subcategories: ['Mantenimiento Instrumentos', 'Apertura Extraordinaria', 'Inventario Anual', 'Cierre Edificio'],
    departmentDefault: 'LOG',
  },
  INSTITUTIONAL: {
    category: 'INSTITUTIONAL',
    label: 'Institucional y Junta',
    subcategories: ['Reunión de Junta Directiva', 'Comité de Dirección', 'Planeación Estratégica'],
    departmentDefault: 'DIR',
  },
  HR: {
    category: 'HR',
    label: 'Talento Humano',
    subcategories: ['Capacitación Staff', 'Periodo Vacacional', 'Evaluación de Desempeño'],
    departmentDefault: 'DIR',
  },
  HOLIDAYS: {
    category: 'HOLIDAYS',
    label: 'Feriados y Efemérides',
    subcategories: ['Feriados Nacionales', 'Fechas Patrias', 'Receso Institucional'],
    departmentDefault: 'DIR',
  },
  PARTNERSHIPS: {
    category: 'PARTNERSHIPS',
    label: 'Alianzas y Donantes',
    subcategories: ['Postulación a Fondos', 'Visita de Donantes', 'Rendición de Cuentas'],
    departmentDefault: 'DIR',
  },
  COMMUNICATIONS: {
    category: 'COMMUNICATIONS',
    label: 'Comunicaciones y Medios',
    subcategories: ['Campañas de Difusión', 'Publicaciones Institucionales', 'Cobertura de Evento'],
    departmentDefault: 'COM',
  },
};
