import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

export async function checkRateLimit(
  supabase: SupabaseClient,
  telegramUserId: number,
  maxPerHour: number,
): Promise<{ allowed: boolean; retryAfterMinutes?: number }> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('hermes_inbox')
    .select('id')
    .eq('telegram_user_id', telegramUserId)
    .gt('created_at', since);

  if (error) {
    console.warn('[WARN][RateLimit] Query failed, allowing:', error.message);
    return { allowed: true };
  }

  const count = data?.length ?? 0;
  if (count >= maxPerHour) {
    return { allowed: false, retryAfterMinutes: 60 };
  }

  return { allowed: true };
}
