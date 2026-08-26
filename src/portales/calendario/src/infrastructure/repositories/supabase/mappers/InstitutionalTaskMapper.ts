import { InstitutionalTask, InstitutionalTaskProps, TaskStatus } from '../../../../domain/tasks/entities/InstitutionalTask';
import { PriorityLevel, DepartmentCode } from '../../../../domain/shared/types';

/**
 * Maps between Supabase table `tareas_institucionales` and Domain InstitutionalTask.
 *
 * Note: Some fields differ between the database schema and domain model:
 * - `estado` in DB is enum `tarea_institucional_estado` (Spanish); mapped to TaskStatus enum
 * - `prioridad` in DB is enum `tarea_institucional_prioridad` (Spanish); mapped to PriorityLevel
 * - `departamento` in DB can be TECNICO/LUT; mapped to domain DepartmentCode (TECNICO→AGT, LUT→LOG)
 * - `asignado_a` in DB is text; mapped to ownerRole string
 * - `event_id` in DB is nullable; mapped to calendarItemId
 * - `checklist` in DB is jsonb array; inferred as evidenceItems
 * - `documentos_adjuntos` in DB is jsonb array; used to construct evidenceItems
 */

// Mapping: Supabase estado → Domain TaskStatus
const ESTADO_MAP: Record<string, TaskStatus> = {
  'pendiente': 'PENDING',
  'en_progreso': 'IN_PROGRESS',
  'completada': 'COMPLETED',
  'bloqueada': 'BLOCKED',
  'bloqueada_por_dependencia': 'BLOCKED',
  'cancelada': 'CANCELLED',
  'observada': 'WAITING_APPROVAL',
};

// Mapping: Supabase prioridad → Domain PriorityLevel
const PRIORIDAD_MAP: Record<string, PriorityLevel> = {
  'baja': 'LOW',
  'media': 'NORMAL',
  'alta': 'HIGH',
  'critica': 'CRITICAL',
};

// Mapping: Supabase departamento → Domain DepartmentCode
// Note: DB uses TECNICO/LUT, domain uses AGT/LOG
const DEPARTAMENTO_MAP: Record<string, DepartmentCode> = {
  'DIR': 'DIR',
  'ACM': 'ACM',
  'ADM': 'ADM',
  'FIN': 'FIN',
  'LOG': 'LOG',
  'COM': 'COM',
  'TECNICO': 'AGT', // Hermes AI/Orquestación
  'LUT': 'LOG',     // Luthería belongs to Logistics
};

// Row type from Supabase
interface TareasInstitucionalRow {
  id: string;
  event_id: string | null;
  titulo: string;
  descripcion: string | null;
  departamento: string; // enum soi_departamento
  asignado_a: string | null;
  estado: string; // enum tarea_institucional_estado
  prioridad: string; // enum tarea_institucional_prioridad
  fecha_vencimiento: string | null;
  checklist: Array<{ texto?: string; label?: string; completado: boolean }> | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  minuta_id: string | null;
  documentos_adjuntos: Array<{
    id?: string;
    nombre?: string;
    url?: string;
    tipo?: string;
    verificado?: boolean;
    uploadedAt?: string;
  }> | null;
  entidad_tipo: string | null;
  entidad_id: string | null;
  entidad_label: string | null;
  correlation_id: string;
  updated_by: string | null;
  updated_by_nombre: string | null;
  process_code: string | null;
  dependencia_tarea_id: string | null;
  depende_de_tarea_id: string | null;
  t_minus_dias: number | null;
  source_event_id: string | null;
}

export class InstitutionalTaskMapper {
  /**
   * Convert a Supabase row to a Domain InstitutionalTask.
   */
  static toDomain(row: TareasInstitucionalRow): InstitutionalTask {
    // Map estado to TaskStatus
    const status: TaskStatus = ESTADO_MAP[row.estado.toLowerCase()] || 'PENDING';

    // Map prioridad to PriorityLevel
    const priority: PriorityLevel = PRIORIDAD_MAP[row.prioridad.toLowerCase()] || 'NORMAL';

    // Map departamento to DepartmentCode
    const department: DepartmentCode = DEPARTAMENTO_MAP[row.departamento] || 'DIR';

    // Build evidence items from documentos_adjuntos
    const evidenceItems = (row.documentos_adjuntos || []).map((doc, idx) => ({
      id: doc.id || `doc-${idx}`,
      type: 'DOCUMENT' as const,
      label: doc.nombre || doc.url || 'Documento adjunto',
      url: doc.url,
      verified: doc.verificado || false,
      uploadedAt: doc.uploadedAt,
    }));

    // Check if evidence is required (evidenceItems present or feedback indicates need)
    const evidenceRequired = evidenceItems.length > 0 || (row.feedback ? row.feedback.includes('evidencia') : false);

    // Determine if task has been started
    const startedAt = (row.estado !== 'pendiente' && row.created_at) ? row.created_at : undefined;

    // Determine completed date (if completed)
    const completedAt = (row.estado === 'completada') ? row.updated_at : undefined;

    // Calculate progress percentage from checklist
    let progressPercentage = 0;
    if (row.checklist && row.checklist.length > 0) {
      const completed = row.checklist.filter(item => item.completado).length;
      progressPercentage = Math.round((completed / row.checklist.length) * 100);
    } else if (row.estado === 'completada') {
      progressPercentage = 100;
    }

    const props: InstitutionalTaskProps = {
      id: row.id,
      correlationId: row.correlation_id,
      title: row.titulo,
      description: row.descripcion || '',
      department,
      ownerRole: row.asignado_a || '',
      status,
      priority,
      dueAt: row.fecha_vencimiento || new Date().toISOString(),
      startedAt,
      completedAt,
      evidenceRequired,
      evidenceItems,
      triggerLabel: row.t_minus_dias ? `T-${row.t_minus_dias}` : undefined,
      progressPercentage,
    };

    return new InstitutionalTask(props);
  }

  /**
   * Convert a Domain InstitutionalTask to a Supabase row (for insert/update).
   * Note: Supabase auto-generates id, created_at, updated_at; those are excluded.
   */
  static toRow(task: InstitutionalTask): Partial<TareasInstitucionalRow> {
    // Reverse-map TaskStatus to estado
    const estadoKey = Object.entries(ESTADO_MAP).find(([_, v]) => v === task.status)?.[0];
    const estado = estadoKey || 'pendiente';

    // Reverse-map PriorityLevel to prioridad
    const prioridadKey = Object.entries(PRIORIDAD_MAP).find(([_, v]) => v === task.priority)?.[0];
    const prioridad = prioridadKey || 'media';

    // Reverse-map DepartmentCode to departamento
    const departamentoKey = Object.entries(DEPARTAMENTO_MAP).find(([_, v]) => v === task.department)?.[0];
    const departamento = departamentoKey || 'DIR';

    // Convert evidenceItems back to documentos_adjuntos format
    const documentos_adjuntos = task.evidenceItems.map(evidence => ({
      id: evidence.id,
      nombre: evidence.label,
      url: evidence.url,
      verificado: evidence.verified,
      uploadedAt: evidence.uploadedAt,
    }));

    // Extract t_minus_dias from triggerLabel if present (e.g., "T-30" → 30)
    let t_minus_dias: number | null = null;
    if (task.triggerLabel && task.triggerLabel.startsWith('T-')) {
      const dias = parseInt(task.triggerLabel.substring(2), 10);
      if (!isNaN(dias)) {
        t_minus_dias = dias;
      }
    }

    return {
      titulo: task.title,
      descripcion: task.description || null,
      departamento,
      asignado_a: task.ownerRole || null,
      estado,
      prioridad,
      fecha_vencimiento: task.dueAt,
      documentos_adjuntos: documentos_adjuntos.length > 0 ? documentos_adjuntos : null,
      correlation_id: task.correlationId,
      t_minus_dias,
    };
  }
}
