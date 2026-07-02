import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

export async function isValidUser(supabase: SupabaseClient, telegramUserId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('telegram_allowed_users')
    .select('id')
    .eq('telegram_user_id', telegramUserId)
    .eq('activo', true);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}
