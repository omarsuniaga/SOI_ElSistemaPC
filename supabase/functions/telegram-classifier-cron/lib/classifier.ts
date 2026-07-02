import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

export const GroqResponseSchema = z.object({
  deptos: z.array(z.string()),
  process_code: z.string().nullable(),
  titulo: z.string(),
  descripcion: z.string(),
  urgencia: z.enum(['baja', 'media', 'alta']),
  confidence: z.number().min(0).max(1),
});

export type GroqResponse = z.infer<typeof GroqResponseSchema>;

export function parseGroqResponse(
  raw: string,
): { ok: true; data: GroqResponse } | { ok: false; error: string } {
  try {
    const json = JSON.parse(raw);
    const result = GroqResponseSchema.safeParse(json);
    if (!result.success) {
      return { ok: false, error: `Zod validation failed: ${result.error.message}` };
    }
    return { ok: true, data: result.data };
  } catch (err) {
    return { ok: false, error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}` };
  }
}
