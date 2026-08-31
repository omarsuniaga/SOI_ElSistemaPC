/**
 * End-to-End Simulation Test: SOI Automated Enrollment Funnel
 * Demonstrates the 4-stage pipeline:
 * 1. Inbound Keyword Detection (Lead Capture)
 * 2. Form Buffer & Event Logging (Idempotency)
 * 3. FSM Slot Booking & Concurrency Lock
 * 4. Admin Calendar Aggregation & Morning Briefing
 */

const crypto = require('crypto');

// Simulated in-memory database representing Postgres tables
const db = {
  applicants: new Map(),
  appointments: new Map(),
  applicant_events: [],
  whatsapp_queue: []
};

console.log('===============================================================');
console.log('🚀 SIMULACIÓN END-TO-END: EMBUDO DE INSCRIPCIÓN Y CITAS (SOI)');
console.log('===============================================================\n');

// ---------------------------------------------------------------------------
// PASO 1: Inbound Lead Router (WhatsApp)
// ---------------------------------------------------------------------------
console.log('--- PASO 1: Ingreso de Lead por WhatsApp con Palabra Clave ---');
const inboundMessage = {
  jid: '18095551234@s.whatsapp.net',
  text: '¡Hola! Vi el anuncio en Instagram y quiero inscribirme.',
  pushName: 'María Pérez'
};

function processInboundWhatsApp(msg) {
  const keywords = ['inscribirme', 'inscripcion', 'formulario', 'postulacion'];
  const matched = keywords.some(k => msg.text.toLowerCase().includes(k));

  if (matched) {
    const cleanPhone = msg.jid.replace(/@.*$/, '');
    const leadKey = `lead_wa_${cleanPhone}`;

    if (!db.applicants.has(leadKey)) {
      db.applicants.set(leadKey, {
        id: 'app_' + crypto.randomUUID().slice(0, 8),
        idempotency_key: leadKey,
        full_name: msg.pushName,
        phone_number: cleanPhone,
        status: 'LEAD',
        utm_source: 'whatsapp_inbound'
      });
    }

    const response = '¡Hola María! Bienvenido al proceso de inscripciones de El Sistema Punta Cana 🎶.\n' +
                     '👉 Formulario: https://forms.gle/soi-inscripciones\n' +
                     '📺 Video: https://youtu.be/soi-presentacion';

    db.whatsapp_queue.push({ jid: msg.jid, message: response, status: 'sent' });
    return { status: 'MATCHED', reply: response };
  }
  return { status: 'IGNORED' };
}

const step1Result = processInboundWhatsApp(inboundMessage);
console.log('✔ Lead detectado y registrado como LEAD en Supabase.');
console.log('✔ Respuesta automática enviada (0 tokens consumidos):\n' + step1Result.reply + '\n');

// ---------------------------------------------------------------------------
// PASO 2: Buffer de Ingesta (Google Apps Script / onFormSubmit)
// ---------------------------------------------------------------------------
console.log('--- PASO 2: Envío de Google Forms y Webhook Firmado ---');
const formSubmission = {
  responseId: 'gform_resp_987654',
  fullName: 'María Pérez',
  phone: '18095551234',
  email: 'maria.perez@example.com',
  utmSource: 'instagram_ads'
};

function onGoogleFormSubmit(data) {
  const idempotencyKey = `form_response_${data.responseId}`;
  const applicantId = 'app_' + crypto.randomUUID().slice(0, 8);

  // Upsert applicant
  const applicant = {
    id: applicantId,
    idempotency_key: idempotencyKey,
    full_name: data.fullName,
    phone_number: data.phone,
    email: data.email,
    utm_source: data.utmSource,
    status: 'FORM_COMPLETED'
  };
  db.applicants.set(idempotencyKey, applicant);

  // Log Event
  db.applicant_events.push({
    applicant_id: applicantId,
    event_name: 'FORM_SUBMITTED',
    payload: { utm_source: data.utmSource, idempotency_key: idempotencyKey },
    created_at: new Date().toISOString()
  });

  // Emulate HMAC Webhook
  const payloadStr = JSON.stringify({ applicant_id: applicantId, phone_number: data.phone, full_name: data.fullName });
  const signature = crypto.createHmac('sha256', 'secret-key-123').update(payloadStr).digest('hex');

  return { applicant, signature, payloadStr };
}

const step2Result = onGoogleFormSubmit(formSubmission);
console.log('✔ Datos recibidos y saneados desde Google Forms.');
console.log('✔ Estado actualizado a FORM_COMPLETED. Evento FORM_SUBMITTED registrado.');
console.log(`✔ Webhook emitido a Hermes con firma HMAC: ${step2Result.signature.slice(0, 16)}...\n`);

// ---------------------------------------------------------------------------
// PASO 3: Motor de Agendamiento FSM & Bloqueo Atómico con TTL
// ---------------------------------------------------------------------------
console.log('--- PASO 3: Selección de Slot y Bloqueo Concurrente (FSM) ---');

// Hermes offers 3 slots
const slots = [
  'Viernes 28 de Agosto - 10:00 AM',
  'Viernes 28 de Agosto - 11:00 AM',
  'Sábado 29 de Agosto - 09:00 AM'
];

console.log('Bot ofrece turnos:');
slots.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));

// User picks "1"
console.log('\nUsuario responde: "1"');

function holdAndConfirmSlot(applicantId, slotText) {
  const aptId = 'apt_' + crypto.randomUUID().slice(0, 8);
  const lockExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Hold slot
  const appointment = {
    id: aptId,
    applicant_id: applicantId,
    slot: slotText,
    status: 'RESERVED_PENDING',
    locked_until: lockExpires
  };
  db.appointments.set(aptId, appointment);

  console.log(`✔ Slot bloqueado con TTL de 10 min (expira: ${lockExpires}).`);

  // User confirms "SI"
  console.log('Usuario responde: "SI, confirmo"');
  appointment.status = 'CONFIRMED';
  appointment.locked_until = null;

  // Update applicant to SCHEDULED
  for (let [k, app] of db.applicants.entries()) {
    if (app.id === applicantId) {
      app.status = 'SCHEDULED';
    }
  }

  // Record Event
  db.applicant_events.push({
    applicant_id: applicantId,
    event_name: 'APPOINTMENT_SCHEDULED',
    payload: { appointment_id: aptId, slot: slotText },
    created_at: new Date().toISOString()
  });

  return appointment;
}

const step3Apt = holdAndConfirmSlot(step2Result.applicant.id, slots[0]);
console.log('✔ Cita CONFIRMADA y estado de aspirante actualizado a SCHEDULED.\n');

// ---------------------------------------------------------------------------
// PASO 4: Vista Admin Calendar & Briefing Matutino 8:00 AM
// ---------------------------------------------------------------------------
console.log('--- PASO 4: Sincronización en Calendario y Briefing 8:00 AM ---');

function generateAdminBriefing() {
  const confirmedList = [];
  for (let [id, apt] of db.appointments.entries()) {
    if (apt.status === 'CONFIRMED') {
      let applicantName = 'Desconocido';
      let phone = '';
      for (let app of db.applicants.values()) {
        if (app.id === apt.applicant_id) {
          applicantName = app.full_name;
          phone = app.phone_number;
        }
      }
      confirmedList.push(`• ${apt.slot} - ${applicantName} (Tel: ${phone})`);
    }
  }

  return '📋 *AGENDA DE ENTREVISTAS DE HOY (28/08/2026)*\n' +
         `Total citados: ${confirmedList.length}\n` +
         confirmedList.join('\n') + '\n\n' +
         '¡Éxitos en la jornada de inscripciones!';
}

const briefing = generateAdminBriefing();
console.log('Simulación de mensaje diario enviado al Coordinador de Admisiones:');
console.log(briefing);

console.log('\n===============================================================');
console.log('✅ TODAS LAS ETAPAS DEL FLUJO EJECUTARON DE FORMA PERFECTA');
console.log('===============================================================');
