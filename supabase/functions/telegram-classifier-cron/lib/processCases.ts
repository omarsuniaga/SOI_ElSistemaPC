import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { GroqResponse } from './classifier.ts';

export interface SoiProcessContract {
  process_code: string;
  process_name: string;
  department_owner: string;
  canonical_doc_path: string;
  doc_id: string;
  trigger_type: string;
  required_evidence: Record<string, unknown>;
  closure_criteria: Record<string, unknown>;
  responsible_departments: string[];
  task_templates: Record<string, unknown>;
  automation_status: string;
  active: boolean;
}

export function applyFallbackLogic(
  groqData: GroqResponse,
): { isFallback: boolean; reason?: string } {
  if (groqData.confidence < 0.5) {
    return { isFallback: true, reason: 'low_confidence' };
  }
  if (!groqData.deptos || groqData.deptos.length === 0) {
    return { isFallback: true, reason: 'no_deptos' };
  }
  return { isFallback: false };
}

export async function matchProcessCode(
  supabase: SupabaseClient,
  processCode: string | null,
): Promise<{ found: boolean; contract?: SoiProcessContract }> {
  if (!processCode) return { found: false };

  const { data, error } = await supabase
    .from('soi_process_contracts')
    .select('*')
    .eq('process_code', processCode)
    .eq('active', true)
    .single();

  if (error || !data) return { found: false };
  return { found: true, contract: data as unknown as SoiProcessContract };
}
