import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseGroqResponse } from './lib/classifier.ts';
import { applyFallbackLogic, matchProcessCode } from './lib/processCases.ts';
import { createTasks } from './lib/crearTareas.ts';
import { sendConfirmation } from './lib/responderTelegram.ts';
import { systemPrompt } from './lib/prompt/v1.ts';
import { fewShots } from './lib/prompt/fewshots.ts';
import { logINFO, logWARNING } from './lib/log.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
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

async function readConfig(supabase: SupabaseClient, key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', key)
    .single();
  if (error || !data) return null;
  return data.value;
}

async function callGroq(userText: string): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...fewShots,
    { role: 'user', content: userText },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GROQ API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405);

  const url = new URL(req.url);
  if (url.pathname !== '/process') return errorResponse('Not found', 404);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const monitorToken = await readConfig(supabase, 'telegram_monitor_healthcheck_secret');
    const headerToken = req.headers.get('X-Monitor-Token');
    if (monitorToken && headerToken !== monitorToken) {
      logWARNING('Auth', 'Invalid X-Monitor-Token');
      return errorResponse('Unauthorized', 401);
    }

    const enabled = await readConfig(supabase, 'telegram_ingest_enabled');
    if (enabled !== 'true') {
      logINFO('KillSwitch', 'Ingest disabled, skipping');
      return json({ skipped: 'kill_switch' });
    }

    const { data: inboxRows, error: inboxError } = await supabase
      .from('hermes_inbox')
      .select('*')
      .eq('canal', 'telegram')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(20);

    if (inboxError) throw new Error(`Failed to fetch hermes_inbox: ${inboxError.message}`);

    logINFO('Process', `Fetched ${inboxRows?.length ?? 0} unprocessed messages`);

    let processed = 0;
    let errors = 0;

    for (const row of inboxRows ?? []) {
      try {
        const { data: raw, error: rawError } = await supabase
          .from('telegram_messages_raw')
          .select('raw_payload')
          .eq('id', row.raw_ref)
          .single();

        if (rawError || !raw) {
          logWARNING('Process', `Raw message not found for inbox ${row.id}`);
          errors++;
          continue;
        }

        const payload = raw.raw_payload as Record<string, unknown>;
        const msgObj = payload.message as Record<string, unknown> | undefined;
        const messageText = msgObj?.text as string | undefined;
        if (!messageText) {
          logWARNING('Process', `No text in raw payload for inbox ${row.id}`);
          await supabase.from('hermes_inbox').update({ processed: true }).eq('id', row.id);
          errors++;
          continue;
        }

        const groqRaw = await callGroq(messageText);
        logINFO('GROQ', `Raw response: ${groqRaw.substring(0, 200)}`);

        const parsed = parseGroqResponse(groqRaw);
        if (!parsed.ok) {
          logWARNING('GROQ', `Failed to parse response: ${parsed.error}`);
          errors++;
          continue;
        }

        const groqData = parsed.data;
        const fallback = applyFallbackLogic(groqData);

        let contract = null;
        if (!fallback.isFallback && groqData.process_code) {
          const match = await matchProcessCode(supabase, groqData.process_code);
          contract = match.found ? match.contract : null;
        }

        const result = await createTasks(supabase, row, groqData, groqRaw, fallback, contract);
        logINFO('Tasks', `Created ${result.taskIds.length} tasks for inbox ${row.id}`);

        await supabase.from('hermes_inbox').update({ processed: true }).eq('id', row.id);

        const chatId = msgObj?.chat as Record<string, unknown> | undefined;
        const chatIdNumber = chatId?.id as number | undefined;
        if (chatIdNumber) {
          await sendConfirmation(TELEGRAM_BOT_TOKEN, chatIdNumber, result, fallback.isFallback, groqData);
        }

        processed++;
      } catch (err) {
        logWARNING('Process', `Error processing inbox ${row.id}: ${err instanceof Error ? err.message : String(err)}`);
        errors++;
      }
    }

    return json({ ok: true, processed, errors });
  } catch (err) {
    logWARNING('Fatal', err instanceof Error ? err.message : String(err));
    return errorResponse('Internal error', 500);
  }
});
