import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { GroqResponse } from './classifier.ts';
import type { SoiProcessContract } from './processCases.ts';

export interface TaskResult {
  caseId: string;
  taskIds: string[];
  taskCount: number;
}

export async function createTasks(
  supabase: SupabaseClient,
  hermesRow: Record<string, unknown>,
  groqData: GroqResponse,
  groqRaw: string,
  fallback: { isFallback: boolean; reason?: string },
  contract: SoiProcessContract | null,
): Promise<TaskResult> {
  const correlationId = crypto.randomUUID();

  const telegramUserId = hermesRow.telegram_user_id as number;
  const { data: userInfo } = await supabase
    .from('telegram_allowed_users')
    .select('nombre, created_by')
    .eq('telegram_user_id', telegramUserId)
    .single();

  const requestedByName = userInfo?.nombre ?? 'Usuario Telegram';
  const requestedBy = userInfo?.created_by ?? null;

  let departments: string[];
  let processCode: string | null;
  let title: string;
  let description: string;
  let priority: string;
  let fallbackReason: string | undefined;

  if (fallback.isFallback) {
    departments = ['DIR'];
    processCode = null;
    title = `[No clasificado] ${hermesRow.summary as string}`;
    description = groqData.descripcion || (hermesRow.summary as string);
    priority = 'media';
    fallbackReason = fallback.reason;
  } else {
    departments = groqData.deptos;
    processCode = groqData.process_code;
    title = groqData.titulo;
    description = groqData.descripcion;
    priority = groqData.urgencia;
  }

  const priorityMap: Record<string, string> = {
    baja: 'baja',
    media: 'media',
    alta: 'alta',
  };

  const { data: caseData, error: caseError } = await supabase
    .from('hermes_process_cases')
    .upsert(
      {
        process_code: processCode,
        title,
        description,
        source: 'telegram',
        status: 'pendiente',
        priority: priorityMap[groqData.urgencia] ?? 'media',
        requested_by: requestedBy,
        requested_by_name: requestedByName,
        owner_department: departments[0] ?? 'DIR',
        entity_type: null,
        entity_id: null,
        entity_label: null,
        required_evidence_snapshot: contract?.required_evidence ?? null,
        closure_criteria_snapshot: contract?.closure_criteria ?? null,
        closure_summary: null,
        metadata: {
          groq_response: JSON.parse(groqRaw),
          correlation_id: correlationId,
          fallback_reason: fallbackReason ?? null,
          hermes_inbox_id: hermesRow.id,
        },
      },
      { onConflict: 'process_code, source' },
    )
    .select('id')
    .single();

  if (caseError) throw new Error(`Failed to upsert hermes_process_cases: ${caseError.message}`);

  const caseId = caseData.id;
  const taskIds: string[] = [];

  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];

    const { data: taskData, error: taskError } = await supabase
      .from('tareas_institucionales')
      .insert({
        process_code: processCode ?? 'DIR-G01',
        title: departments.length > 1 ? `${title} [${dept}]` : title,
        description,
        source: 'telegram',
        status: 'pendiente',
        priority: priorityMap[groqData.urgencia] ?? 'media',
        requested_by: requestedBy,
        requested_by_name: requestedByName,
        owner_department: dept,
        entity_type: null,
        entity_id: null,
        entity_label: null,
        required_evidence_snapshot: contract?.required_evidence ?? null,
        closure_criteria_snapshot: contract?.closure_criteria ?? null,
        closure_summary: null,
        metadata: {
          groq_response: JSON.parse(groqRaw),
          correlation_id: correlationId,
          fallback_reason: fallbackReason ?? null,
          hermes_inbox_id: hermesRow.id,
          department_index: i,
          case_id: caseId,
        },
      })
      .select('id')
      .single();

    if (taskError) throw new Error(`Failed to insert tareas_institucionales: ${taskError.message}`);
    taskIds.push(taskData.id);
  }

  return { caseId, taskIds, taskCount: taskIds.length };
}
