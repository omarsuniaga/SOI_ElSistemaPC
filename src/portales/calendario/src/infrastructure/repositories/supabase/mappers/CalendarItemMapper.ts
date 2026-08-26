import { CalendarItem, CalendarItemProps } from '../../../../domain/calendar/entities/CalendarItem';
import { CalendarItemKind } from '../../../../domain/calendar/valueObjects/CalendarItemKind';
import { CalendarItemStatus } from '../../../../domain/calendar/valueObjects/CalendarItemStatus';
import { CategoryFamily } from '../../../../domain/calendar/valueObjects/CategoryFamily';
import { DepartmentCode } from '../../../../domain/shared/types';

/**
 * Maps between Supabase table `calendario_institucional` and Domain CalendarItem.
 *
 * Note: Some fields differ between the database schema and domain model:
 * - `estado` in DB is text (Spanish values like "programado"); mapped to CalendarItemStatus enum
 * - `categoria` in DB is enum event_categoria; mapped to CategoryFamily
 * - `departamento_responsable` in DB uses TECNICO/LUT; mapped to domain DepartmentCode (TECNICO→AGT, LUT→LOG)
 * - `allDay` not in DB; derived as false (all calendar events have specific times)
 * - `kind` not in DB; derived from categoria
 * - `secondaryDepartments` not in DB; will be empty array
 * - `ownerRole` not in DB; will be empty string
 */

// Mapping: Supabase categoria → Domain CategoryFamily
const CATEGORIA_MAP: Record<string, CategoryFamily> = {
  'aniversario': 'INSTITUTIONAL',
  'audicion_trimestral': 'ACADEMIC',
  'ensayo_intensivo': 'ACADEMIC',
  'concierto': 'ARTISTIC',
  'ensayo': 'ACADEMIC',
  'reunion': 'INSTITUTIONAL',
  'patrocinio': 'PARTNERSHIPS',
  'pago': 'FINANCE',
  'corte': 'FINANCE',
  'inscripcion': 'ADMISSIONS',
  'auditoria': 'ADMINISTRATIVE',
  'otro': 'ADMINISTRATIVE',
};

// Mapping: Supabase departamento_responsable → Domain DepartmentCode
// Note: DB uses TECNICO/LUT, domain uses AGT/LOG
const DEPARTAMENTO_MAP: Record<string, DepartmentCode> = {
  'DIR': 'DIR',
  'ACM': 'ACM',
  'ADM': 'ADM',
  'FIN': 'FIN',
  'LOG': 'LOG',
  'COM': 'COM',
  'TECNICO': 'AGT', // Hermes AI/Orquestación
  'LUT': 'LOG',     // Lutería belongs to Logistics
};

// Mapping: Supabase estado → Domain CalendarItemStatus
// Note: estado is stored as text with Spanish values
const ESTADO_MAP: Record<string, CalendarItemStatus> = {
  'programado': 'PLANNED',
  'en_curso': 'ACTIVE',
  'activo': 'ACTIVE',
  'cerrado': 'CLOSED',
  'concluido': 'CLOSED',
  'cancelado': 'CANCELLED',
  'borrador': 'DRAFT',
  'draft': 'DRAFT',
};

// Derive CalendarItemKind from CategoryFamily
function deriveKindFromCategory(category: CategoryFamily): CalendarItemKind {
  // Map categories to appropriate kinds
  // Most academic/artistic become EVENT; institutional/partnerships/holidays might be SEASON or MILESTONE
  switch (category) {
    case 'ACADEMIC':
    case 'ARTISTIC':
      return 'EVENT';
    case 'INSTITUTIONAL':
    case 'PARTNERSHIPS':
      return 'MILESTONE';
    case 'ADMISSIONS':
    case 'ADMISSIONS':
      return 'WINDOW';
    case 'FISCAL':
    case 'FINANCE':
      return 'DEADLINE';
    default:
      return 'EVENT';
  }
}

// Row type from Supabase
interface CalendarioInstitucionalRow {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string | null;
  departamento_responsable: string;
  metadata: Record<string, unknown> | null;
  estado: string;
  created_at: string;
  updated_at: string;
  venue_id: string | null;
  es_macro_evento?: boolean;
  aforo_proyectado?: number;
  salud_proyecto?: string;
  metadata_pm?: Record<string, unknown>;
}

export class CalendarItemMapper {
  /**
   * Convert a Supabase row to a Domain CalendarItem.
   */
  static toDomain(row: CalendarioInstitucionalRow): CalendarItem {
    // Map categoria to CategoryFamily
    const category: CategoryFamily = CATEGORIA_MAP[row.categoria] || 'ADMINISTRATIVE';

    // Map estado to CalendarItemStatus
    const status: CalendarItemStatus = ESTADO_MAP[row.estado.toLowerCase()] || 'DRAFT';

    // Map departamento_responsable to DepartmentCode
    const departmentOwner: DepartmentCode = DEPARTAMENTO_MAP[row.departamento_responsable] || 'DIR';

    // Derive kind from category
    const kind: CalendarItemKind = deriveKindFromCategory(category);

    // Merge metadata and metadata_pm into domain metadata
    const domainMetadata = {
      ...(row.metadata || {}),
      ...(row.metadata_pm || {}),
    };

    // Add aforo_proyectado to metadata if present
    if (row.aforo_proyectado) {
      (domainMetadata as Record<string, unknown>).expectedAttendance = row.aforo_proyectado;
    }

    // If es_macro_evento is true, add to metadata
    if (row.es_macro_evento) {
      (domainMetadata as Record<string, unknown>).isMacroEvent = true;
    }

    const props: CalendarItemProps = {
      id: row.id,
      title: row.titulo,
      description: row.descripcion || '',
      kind,
      category,
      departmentOwner,
      secondaryDepartments: [], // Not present in Supabase schema
      ownerRole: '', // Not present in Supabase schema
      startAt: new Date(row.fecha_inicio).toISOString(),
      endAt: new Date(row.fecha_fin).toISOString(),
      allDay: false, // Supabase events have explicit times
      status,
      priority: 'NORMAL', // Default; could be enhanced if Supabase adds priority column
      location: row.ubicacion || undefined,
      venueId: row.venue_id || undefined,
      parentCycleId: undefined, // Not present in Supabase schema
      metadata: domainMetadata as any,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };

    return new CalendarItem(props);
  }

  /**
   * Convert a Domain CalendarItem to a Supabase row (for insert/update).
   * Note: Supabase auto-generates id, created_at, updated_at; those are excluded.
   */
  static toRow(item: CalendarItem): Partial<CalendarioInstitucionalRow> {
    // Reverse-map CategoryFamily to categoria
    const categoriaKey = Object.entries(CATEGORIA_MAP).find(([_, v]) => v === item.category)?.[0];
    const categoria = categoriaKey || 'otro';

    // Reverse-map DepartmentCode to departamento_responsable
    const departamentoKey = Object.entries(DEPARTAMENTO_MAP).find(([_, v]) => v === item.departmentOwner)?.[0];
    const departamento_responsable = departamentoKey || 'DIR';

    // Reverse-map CalendarItemStatus to estado
    const estadoKey = Object.entries(ESTADO_MAP).find(([_, v]) => v === item.status)?.[0];
    const estado = estadoKey || 'programado';

    return {
      titulo: item.title,
      descripcion: item.description || null,
      categoria,
      fecha_inicio: item.startAt,
      fecha_fin: item.endAt,
      ubicacion: item.location || null,
      departamento_responsable,
      metadata: (item.metadata as unknown as Record<string, unknown>) || null,
      estado,
      venue_id: item.venueId || null,
      es_macro_evento: Boolean((item.metadata as Record<string, unknown>)?.isMacroEvent) || false,
      aforo_proyectado: (item.metadata as Record<string, unknown>)?.expectedAttendance as number | undefined,
    };
  }
}
