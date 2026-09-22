/**
 * Acceso al portal Calendario según la base (`has_portal_access`): asignación
 * explícita en user_portal_access o rol por defecto del catálogo. Falla cerrada:
 * un error o cualquier respuesta distinta de `true` deniega el acceso.
 */
export async function hasCalendarPortalAccess(client: {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>;
}): Promise<boolean> {
  try {
    const { data, error } = await client.rpc('has_portal_access', { p_portal_id: 'CAL' });
    return !error && data === true;
  } catch {
    return false;
  }
}
