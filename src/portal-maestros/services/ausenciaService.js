import * as ausenciasApi from '../api/ausenciasApi.js';
import { supabase } from '../../lib/supabaseClient.js';
import { validateAbsenceRequest } from './ausenciaValidator.js';

const STORAGE_BUCKET = 'documentos';
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function normalizeDayName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getDaysInRange(start, end) {
  const days = new Set();
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);

  while (current <= last) {
    days.add(normalizeDayName(DAY_NAMES[current.getDay()]));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function formatSessionTime(item) {
  if (!item?.hora_inicio && !item?.hora_fin) return '';
  if (!item.hora_fin) return item.hora_inicio;
  return `${item.hora_inicio} - ${item.hora_fin}`;
}

function safeFileName(fileName) {
  return String(fileName || 'soporte')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function findAffectedClasses(maestroId, fechaInicio, fechaFin) {
  const clases = await ausenciasApi.obtenerClasesMaestro(maestroId);
  const claseIds = (clases || []).map((clase) => clase.id);
  if (!claseIds.length) return [];

  const [sesiones, horarios] = await Promise.all([
    ausenciasApi.obtenerSesionesRango(claseIds, fechaInicio, fechaFin),
    ausenciasApi.obtenerHorariosClases(claseIds),
  ]);

  const byClassId = new Map(clases.map((clase) => [clase.id, clase]));
  const affected = new Map();

  for (const sesion of sesiones || []) {
    const clase = byClassId.get(sesion.clase_id);
    if (!clase) continue;
    affected.set(sesion.clase_id, {
      claseId: sesion.clase_id,
      className: clase.nombre,
      instrumento: clase.instrumento || '',
      sessionDate: sesion.fecha || fechaInicio,
      sessionTime: formatSessionTime(sesion),
      actividadReemplazo: '',
      selected: true,
    });
  }

  const rangeDays = getDaysInRange(fechaInicio, fechaFin);
  for (const horario of horarios || []) {
    if (!rangeDays.has(normalizeDayName(horario.dia)) || affected.has(horario.clase_id)) continue;
    const clase = byClassId.get(horario.clase_id);
    if (!clase) continue;
    affected.set(horario.clase_id, {
      claseId: horario.clase_id,
      className: clase.nombre,
      instrumento: clase.instrumento || '',
      sessionDate: '',
      sessionTime: formatSessionTime(horario),
      actividadReemplazo: '',
      selected: true,
    });
  }

  return [...affected.values()];
}

export async function findAvailableSalons(fecha, hora) {
  if (!fecha || !hora) return [];

  const [salones, sesiones] = await Promise.all([
    ausenciasApi.obtenerSalonesActivos(),
    ausenciasApi.obtenerSesionesOcupadas(fecha, hora),
  ]);

  const occupiedIds = new Set((sesiones || []).map((sesion) => sesion.salon_id).filter(Boolean));
  return (salones || []).filter((salon) => !occupiedIds.has(salon.id));
}

export async function findSubstituteTeachers(claseId) {
  if (!claseId || !ausenciasApi.obtenerMaestrosSuplentes) return [];
  return ausenciasApi.obtenerMaestrosSuplentes(claseId);
}

export async function uploadAbsenceSupportFile({ maestroId, file }) {
  if (!file) return null;

  const path = `ausencias/${maestroId}/${Date.now()}_${safeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function buildAbsencePayload({ maestro, formState, archivoUrl = null }) {
  const selectedClasses = (formState.clasesAfectadas || []).filter((clase) => clase.selected !== false);
  const actividadesPorClase = Object.fromEntries(
    selectedClasses.map((clase) => [clase.claseId, clase.actividadReemplazo || ''])
  );

  const claseEmergente = formState.claseEmergente?.activo
    ? {
        activo: true,
        clase_id: formState.claseEmergente.claseId || null,
        fecha: formState.claseEmergente.fechaNueva || null,
        hora: formState.claseEmergente.horaNueva || null,
        salon_id: formState.claseEmergente.salonIdNuevo || null,
      }
    : null;

  return {
    maestro_id: maestro.id,
    tipo_ausencia: formState.tipoAusencia,
    fecha_inicio: formState.fechaInicio,
    fecha_fin: formState.fechaFin,
    motivo: formState.motivo?.trim() || '',
    urgencia: formState.urgencia,
    duracion_tipo: formState.duracionTipo || (formState.fechaInicio === formState.fechaFin ? 'un_dia' : 'varios_dias'),
    clases_afectadas: selectedClasses.map((clase) => clase.claseId),
    actividades_por_clase: actividadesPorClase,
    clase_emergente: claseEmergente,
    archivo_url: archivoUrl,
    estado: 'pendiente',
  };
}

export function formatWhatsAppMessage({
  maestro,
  ausencia,
  clasesAfectadas = [],
  coverageSummary = 'Pendiente de coordinación',
  approvalUrl = '',
}) {
  const fechas = ausencia.fecha_inicio === ausencia.fecha_fin
    ? ausencia.fecha_inicio
    : `${ausencia.fecha_inicio} al ${ausencia.fecha_fin}`;

  return [
    'Solicitud de ausencia',
    `Maestro: ${maestro?.nombre_completo || maestro?.nombre || 'No especificado'}`,
    `Tipo: ${ausencia.tipo_ausencia}`,
    `Urgencia: ${ausencia.urgencia}`,
    `Fechas: ${fechas}`,
    `Clases afectadas: ${clasesAfectadas.length}`,
    `Solución: ${coverageSummary}`,
    approvalUrl ? `Aprobación: ${approvalUrl}` : '',
    '',
    'Enviado desde Portal SOI',
  ].filter(Boolean).join('\n');
}

export async function createAbsenceRequest({ maestro, formState, notifyDirector = true, approvalUrl = '' }) {
  const validation = validateAbsenceRequest(formState);
  if (!validation.valid) {
    const error = new Error('La solicitud de ausencia tiene errores de validación.');
    error.validationErrors = validation.errors;
    throw error;
  }

  const archivoUrl = await uploadAbsenceSupportFile({
    maestroId: maestro.id,
    file: formState.archivo?.file || null,
  });

  const payload = buildAbsencePayload({
    maestro,
    formState: { ...formState, duracionTipo: validation.duracionTipo },
    archivoUrl,
  });

  const ausencia = await ausenciasApi.registrarAusencia(payload);
  const whatsappText = formatWhatsAppMessage({
    maestro,
    ausencia,
    clasesAfectadas: formState.clasesAfectadas || [],
    coverageSummary: formState.coverageSummary,
    approvalUrl,
  });

  const notification = notifyDirector && ausenciasApi.crearNotificacionAusencia
    ? await ausenciasApi.crearNotificacionAusencia({ ausencia, maestro, approvalUrl })
    : null;

  return { ausencia, whatsappText, notification };
}
