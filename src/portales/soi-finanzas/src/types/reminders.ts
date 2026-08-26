export interface ReminderTemplate {
  id: string;
  nombre: string;
  tipo: 'preventivo' | 'mora_temprana' | 'mora_critica' | 'convenio' | 'personalizado';
  tituloCorto: string;
  texto: string;
}

export interface ReminderConfig {
  cooldown_horas: number; // Horas de enfriamiento entre vueltas (default: 76)
  plantillas: ReminderTemplate[];
  permitir_forzar_envio?: boolean; // Permite omitir cooldown en emergencias
}

export interface ReminderHistoryItem {
  intento_num: number;
  timestamp: string; // ISO String
  plantilla_id: string;
  plantilla_nombre: string;
  telefono_destino: string;
  mensaje_enviado: string;
  registrado_por?: string;
}

export interface CuotaReminderRecord {
  cuota_id: string;
  familia_id: string;
  alumno_id: string;
  total_vueltas: number;
  fecha_inicio_vuelta_actual: string; // ISO String
  fecha_ultimo_envio: string; // ISO String
  historial: ReminderHistoryItem[];
}

export const DEFAULT_REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'tpl-preventivo',
    nombre: 'Recordatorio Amable & Preventivo',
    tipo: 'preventivo',
    tituloCorto: 'Preventivo',
    texto: `🎼 *El Sistema Punta Cana*
Estimado/a *{representante}*,

Esperamos se encuentre muy bien. Le saludamos cordialmente para recordarle amablemente el balance de la mensualidad musical correspondiente a su representado/a *{alumno}*:

📌 *Concepto:* {concepto} ({periodo})
💰 *Balance Pendiente:* *{saldo}*
🗓️ *Fecha Límite:* {fecha_vencimiento}

💳 *Cuentas Bancarias Institucionales:*
• *Banco Popular Dominicano:* Cta. Corriente # 812-445890-1
• *Banreservas:* Cta. Corriente # 240-019842-3
A nombre de: *Fundación El Sistema Punta Cana*

Agradecemos enviar el comprobante de pago por esta vía para registrar su recibo oficial. ¡Muchas gracias por su compromiso con la formación artística de su hijo/a! 🎻✨`
  },
  {
    id: 'tpl-mora-temprana',
    nombre: 'Aviso de Cuota Vencida (1 a 15 días)',
    tipo: 'mora_temprana',
    tituloCorto: 'Mora Temprana',
    texto: `🔔 *El Sistema Punta Cana — Aviso de Cartera*
Estimado/a *{representante}*,

Nos comunicamos desde el Departamento de Administración y Finanzas. Notamos que la cuota de *{alumno}* presenta *{dias_atraso} días de vencimiento*:

📌 *Concepto:* {concepto} ({periodo})
💰 *Monto Adeudado:* *{saldo}*

Le invitamos a regularizar este balance para mantener al día el expediente académico y administrativo de su hijo/a.

💳 *Para Transferencias o Depósitos:*
• *Banco Popular:* # 812-445890-1 (Corriente)
• *Banreservas:* # 240-019842-3 (Corriente)

Quedamos atentos al envío de su comprobante por este medio. Si ya realizó este pago, por favor remítanos la captura para conciliar su cuenta. 🙏`
  },
  {
    id: 'tpl-mora-critica',
    nombre: 'Notificación de Regularización & Acompañamiento',
    tipo: 'mora_critica',
    tituloCorto: 'Acompañamiento',
    texto: `⚠️ *El Sistema Punta Cana — Notificación Administrativa*
Estimado/a *{representante}*,

Nos ponemos en contacto respecto a la cuenta pendiente del estudiante *{alumno}*, la cual acumula *{dias_atraso} días de atraso* por un balance de *{saldo}*.

En *El Sistema Punta Cana* nuestro compromiso prioritario es el bienestar y continuidad educativa de nuestros alumnos. Si su familia está atravesando una situación socioeconómica imprevista, por favor comuníquese con nosotros para explorar un *Convenio de Pago Flexible* o una evaluación social.

Por favor responda a este mensaje o visítenos en la sede institucional para coordinar la mejor solución. 🤝`
  },
  {
    id: 'tpl-convenio',
    nombre: 'Seguimiento a Compromiso / Convenio',
    tipo: 'convenio',
    tituloCorto: 'Convenio',
    texto: `🤝 *El Sistema Punta Cana — Seguimiento a Convenio*
Estimado/a *{representante}*,

Le saludamos cordialmente en seguimiento al acuerdo establecido para la regularización de las cuotas de *{alumno}*.

📌 *Monto Acordado:* *{saldo}*
📌 *Concepto:* Regularización de Cartera ({periodo})

Agradecemos confirmar la fecha estimada de su próximo abono o remitirnos el comprobante si ya fue efectuado. Estamos a su entera disposición. 🎻`
  }
];

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  cooldown_horas: 76,
  plantillas: DEFAULT_REMINDER_TEMPLATES,
  permitir_forzar_envio: true,
};
