import type { GroqResponse } from './classifier.ts';
import type { TaskResult } from './crearTareas.ts';
import { sendMessage } from './telegramApi.ts';

export async function sendConfirmation(
  botToken: string,
  chatId: number,
  result: TaskResult,
  isFallback: boolean,
  groqData: Pick<GroqResponse, 'descripcion'>,
): Promise<void> {
  let text: string;

  if (isFallback) {
    text = `Derivado a DIR para ruteo manual. Tarea #${result.taskCount} creada. Resumen: ${groqData.descripcion}`;
  } else {
    text = `Recibido. ${result.taskCount} tareas creadas: ${result.taskIds.join(', ')}. Resumen: ${groqData.descripcion}`;
  }

  await sendMessage(botToken, chatId, text);
}
