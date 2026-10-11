/**
 * contentGuard — re-export del guard de contenido de WhatsApp.
 *
 * SDD whatsapp-gateway-multidepto · F3. Sin lógica nueva: el runner usa el mismo
 * guard que el resto del sistema.
 *
 * NOTA: `detectPromptInjection` / `shouldBlockSensitiveMessage` están tuneados
 * para mensajes de ENTRADA (detectar prompt injection de un usuario). El
 * dispatchLoop solo aplica `clampMessageText` (tope de longitud, siempre sano);
 * el bloqueo de contenido de salida se hace al COMPONER el mensaje
 * (`fn_whatsapp_encolar_manual`, F5), no al despacharlo.
 */

export {
  detectPromptInjection,
  clampMessageText,
  estimateTokenBudget,
  shouldBlockSensitiveMessage,
  buildSafeRejectionMessage,
  WHATSAPP_SECURITY_DEFAULTS,
} from '../../modules/hermes/api/whatsappSecurityGuard.js'
