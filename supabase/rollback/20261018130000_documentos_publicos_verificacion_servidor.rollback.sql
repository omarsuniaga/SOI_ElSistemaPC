-- Rollback de 20261018130000_documentos_publicos_verificacion_servidor.sql
-- Restaura la RPC directa para usuarios (vuelve la validación de firma solo-cliente).
-- Las versiones ya registradas no se tocan.
BEGIN;
GRANT EXECUTE ON FUNCTION public.registrar_version_documento(uuid, text, text, bigint, text, text, text) TO authenticated;
DROP FUNCTION IF EXISTS public.registrar_version_documento_verificada(uuid, uuid, text, text, bigint, text, text, text);
DROP FUNCTION IF EXISTS public._registrar_version_documento_core(uuid, uuid, text, text, bigint, text, text, text);
COMMIT;
