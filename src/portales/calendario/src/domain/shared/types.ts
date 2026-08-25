export type DepartmentCode =
  | 'DIR' // Executive Direction
  | 'ACM' // Academic / Musical
  | 'ADM' // Administration
  | 'FIN' // Finance
  | 'LOG' // Logistics (includes Lutherie)
  | 'EVT' // Events
  | 'COM' // Communications
  | 'AGT'; // AI Agents / Hermes

export interface DepartmentMeta {
  code: DepartmentCode;
  name: string;
  shortDescription: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  badgeClass: string;
}

export const DEPARTMENTS: Record<DepartmentCode, DepartmentMeta> = {
  DIR: {
    code: 'DIR',
    name: 'Dirección Ejecutiva',
    shortDescription: 'Gobernanza institucional y autorizaciones de alto nivel',
    colorHex: '#e11d48',
    bgHex: 'rgba(225, 29, 72, 0.12)',
    borderHex: 'rgba(225, 29, 72, 0.3)',
    badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  ACM: {
    code: 'ACM',
    name: 'Académico / Musical',
    shortDescription: 'Cátedras, orquestas, coros, audiciones y repertorios',
    colorHex: '#3b82f6',
    bgHex: 'rgba(59, 130, 246, 0.12)',
    borderHex: 'rgba(59, 130, 246, 0.3)',
    badgeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  ADM: {
    code: 'ADM',
    name: 'Administración',
    shortDescription: 'Matrículas, registros de estudiantes y gestión operativa',
    colorHex: '#06b6d4',
    bgHex: 'rgba(6, 182, 212, 0.12)',
    borderHex: 'rgba(6, 182, 212, 0.3)',
    badgeClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  FIN: {
    code: 'FIN',
    name: 'Finanzas',
    shortDescription: 'Presupuestos, colegiaturas, nómina, TSS y proveedores',
    colorHex: '#10b981',
    bgHex: 'rgba(16, 185, 129, 0.12)',
    borderHex: 'rgba(16, 185, 129, 0.3)',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  LOG: {
    code: 'LOG',
    name: 'Logística y Luthería',
    shortDescription: 'Mantenimiento, instrumentos, inventario y traslados',
    colorHex: '#f59e0b',
    bgHex: 'rgba(245, 158, 11, 0.12)',
    borderHex: 'rgba(245, 158, 11, 0.3)',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  EVT: {
    code: 'EVT',
    name: 'Eventos y Producción',
    shortDescription: 'Conciertos, recitales, protocolo y salas',
    colorHex: '#8b5cf6',
    bgHex: 'rgba(139, 92, 246, 0.12)',
    borderHex: 'rgba(139, 92, 246, 0.3)',
    badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  COM: {
    code: 'COM',
    name: 'Comunicaciones',
    shortDescription: 'Prensa, campañas institucionales y cobertura audiovisual',
    colorHex: '#ec4899',
    bgHex: 'rgba(236, 72, 153, 0.12)',
    borderHex: 'rgba(236, 72, 153, 0.3)',
    badgeClass: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  },
  AGT: {
    code: 'AGT',
    name: 'Hermes AI / Orquestación',
    shortDescription: 'Detección temporal, automatizaciones y escalamiento',
    colorHex: '#6366f1',
    bgHex: 'rgba(99, 102, 241, 0.12)',
    borderHex: 'rgba(99, 102, 241, 0.3)',
    badgeClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
};

export type PriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type AutomationLevel = 'AUTO' | 'PROPOSAL' | 'HUMAN_REQUIRED';

export interface ConditionRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: string | number | boolean | string[];
}

export interface TriggerCondition {
  all?: ConditionRule[];
  any?: ConditionRule[];
  description?: string;
}
