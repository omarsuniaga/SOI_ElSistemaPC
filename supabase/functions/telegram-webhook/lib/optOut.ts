import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const OPT_OUT_KEYWORDS = ['baja', 'stop', 'cancelar'];

export function isOptOutMessage(text: string): boolean {
  return OPT_OUT_KEYWORDS.includes(text.trim().toLowerCase());
}

export async function processOptOut(supabase: SupabaseClient, telegramUserId: number): Promise<void> {
  const { error } = await supabase
    .from('telegram_allowed_users')
    .update({ activo: false })
    .eq('telegram_user_id', telegramUserId);

  if (error) throw new Error(`Failed to opt out user ${telegramUserId}: ${error.message}`);
}
