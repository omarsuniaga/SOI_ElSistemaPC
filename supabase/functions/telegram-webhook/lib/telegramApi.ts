export interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  from?: { id: number; is_bot?: boolean; first_name?: string; username?: string };
  text?: string;
  date: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface GetUpdatesParams {
  offset?: number;
  limit?: number;
  timeout?: number;
}

export async function getUpdates(token: string, params: GetUpdatesParams): Promise<TelegramUpdate[]> {
  const url = new URL(`https://api.telegram.org/bot${token}/getUpdates`);
  if (params.offset !== undefined) url.searchParams.set('offset', String(params.offset));
  if (params.limit !== undefined) url.searchParams.set('limit', String(params.limit));
  if (params.timeout !== undefined) url.searchParams.set('timeout', String(params.timeout));

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
  return data.result as TelegramUpdate[];
}

export async function sendMessage(token: string, chatId: number, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram sendMessage error: ${data.description}`);
}
