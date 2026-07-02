import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

export async function processOptOut(supabase: SupabaseClient, telegramUserId: number): Promise<void> {
  const { error } = await supabase
    .from('telegram_allowed_users')
    .update({ activo: false })
    .eq('telegram_user_id', telegramUserId);

  if (error) throw new Error(`Failed to opt out user ${telegramUserId}: ${error.message}`);
}
