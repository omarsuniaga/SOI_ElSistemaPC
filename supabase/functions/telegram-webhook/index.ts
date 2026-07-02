import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { isValidUser } from './lib/allowlist.ts';
import { checkRateLimit } from './lib/rateLimit.ts';
import { processOptOut } from './lib/optOut.ts';
import { getUpdates, sendMessage, TelegramUpdate } from './lib/telegramApi.ts';
import { logINFO, logWARNING } from './lib/log.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return json({ error: message }, status);
}

async function readConfig(
  supabase: ReturnType<typeof createClient>,
  key: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', key)
    .single();
  if (error || !data) return null;
  return data.value;
}

serve(async (req: Request) => {
  if (req.method !== 'GET') return errorResponse('Method not allowed', 405);

  const url = new URL(req.url);
  if (!url.pathname.endsWith('/poll')) return errorResponse('Not found', 404);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const enabled = await readConfig(supabase, 'telegram_ingest_enabled');
    if (enabled !== 'true') {
      return json({ skipped: 'kill_switch' });
    }

    const rateLimitRaw = await readConfig(supabase, 'telegram_rate_limit_per_hour');
    const maxPerHour = rateLimitRaw ? parseInt(rateLimitRaw, 10) : 10;

    const lastUpdateIdRaw = await readConfig(supabase, 'telegram_last_update_id');
    const offsetParam = url.searchParams.get('offset');
    const offset = offsetParam
      ? parseInt(offsetParam, 10)
      : lastUpdateIdRaw
        ? parseInt(lastUpdateIdRaw, 10) + 1
        : undefined;

    let updates: TelegramUpdate[];
    try {
      updates = await getUpdates(TELEGRAM_BOT_TOKEN, { offset, timeout: 10 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Conflict')) {
        return json({ ok: true, conflict: true });
      }
      throw err;
    }

    let processed = 0;
    let skipped = 0;
    let lastUpdateId = offset ?? 0;

    for (const update of updates) {
      lastUpdateId = Math.max(lastUpdateId, update.update_id);

      try {
        const msg = update.message;
        if (!msg || !msg.text) { skipped++; continue; }

        const chatId = msg.chat.id;
        const userId = msg.from?.id;
        if (!userId) { skipped++; continue; }

        const allowed = await isValidUser(supabase, userId);
        if (!allowed) { skipped++; continue; }

        const withinLimit = await checkRateLimit(supabase, userId, maxPerHour);
        if (!withinLimit) { skipped++; continue; }

        const isOptOut = await processOptOut(supabase, userId);
        if (isOptOut) { skipped++; continue; }

        const deptTurnoRegex = /^(direccion|secretaria|docencia|atencion|calidad|desarrollo|dirección)/i;
        const match = msg.text.match(deptTurnoRegex);
        if (!match) {
          const helpText
            = 'Hola! Envame el nombre del departamento y tu consulta. Departamentos disponibles:\n\n'
              + 'Dirección General (direccion)\n'
              + 'Secretaría General (secretaria)\n'
              + 'Dirección Académica (docencia)\n'
              + 'Calidad (calidad)\n'
              + 'Atención al Estudiante (atencion)\n'
              + 'Desarrollo Estudiantil (desarrollo)\n\n'
              + 'Ejemplo: "direccion necesito una constancia de estudios"';
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, helpText);
          skipped++;
          continue;
        }

        const { data: raw, error: rawError } = await supabase.from('telegram_messages_raw').insert({
          telegram_message_id: msg.message_id,
          telegram_chat_id: chatId,
          telegram_user_id: userId,
          message_type: 'text',
          raw_payload: msg,
        }).select('id').single();

        if (rawError || !raw) {
          logWARNING('Insert', `Failed to insert telegram_messages_raw: ${rawError?.message ?? 'no id'}`);
          skipped++;
          continue;
        }

        const { error: inboxError } = await supabase.from('hermes_inbox').insert({
          canal: 'telegram',
          categoria: match[1].toLowerCase(),
          summary: msg.text,
          raw_ref: raw.id,
          telegram_user_id: userId,
        });

        if (inboxError) {
          logWARNING('Insert', `Failed to insert hermes_inbox: ${inboxError.message}`);
          skipped++;
          continue;
        }

        await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 'Recibido. Tu solicitud ser procesada en breve.');
        processed++;
      } catch (err) {
        logWARNING('ProcessUpdate', `Error: ${err instanceof Error ? err.message : String(err)}`);
        skipped++;
      }
    }

    if (updates.length > 0) {
      await supabase
        .from('system_config')
        .upsert(
          { key: 'telegram_last_update_id', value: String(lastUpdateId) },
          { onConflict: 'key' },
        );
    }

    return json({ ok: true, processed, skipped });
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    logWARNING('Fatal', msg);
    return errorResponse(msg, 500);
  }
});
