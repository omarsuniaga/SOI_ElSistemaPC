import { useState, useEffect, useCallback } from 'react';
import {
  ReminderConfig,
  CuotaReminderRecord,
  DEFAULT_REMINDER_CONFIG,
  ReminderHistoryItem
} from '../types/reminders';

const CONFIG_STORAGE_KEY = 'SOI_FINANZAS_WHATSAPP_REMINDERS_CONFIG_V1';
const RECORDS_STORAGE_KEY = 'SOI_FINANZAS_WHATSAPP_REMINDERS_RECORDS_V1';

export interface CuotaCooldownState {
  totalVueltas: number;
  enCooldown: boolean;
  horasRestantes: number;
  minutosRestantes: number;
  segundosRestantes: number;
  porcentajeRestante: number; // 0 to 100
  porcentajeConsumido: number; // 0 to 100
  fechaInicioVuelta: string | null;
  fechaReactivacion: string | null;
  ultimoEnvio: string | null;
  historial: ReminderHistoryItem[];
}

export function useWhatsAppReminders() {
  const [config, setConfig] = useState<ReminderConfig>(() => {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!raw) return DEFAULT_REMINDER_CONFIG;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_REMINDER_CONFIG,
        ...parsed,
        plantillas: parsed.plantillas?.length ? parsed.plantillas : DEFAULT_REMINDER_CONFIG.plantillas
      };
    } catch {
      return DEFAULT_REMINDER_CONFIG;
    }
  });

  const [records, setRecords] = useState<Record<string, CuotaReminderRecord>>(() => {
    try {
      const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Ticker to re-evaluate cooldown percentages every 10 seconds or immediately
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // 1-second tick for precise visual clock animation
    return () => clearInterval(interval);
  }, []);

  const saveConfig = useCallback((newConfig: ReminderConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Could not save reminder config to localStorage:', e);
    }
  }, []);

  const saveRecords = useCallback((newRecords: Record<string, CuotaReminderRecord>) => {
    setRecords(newRecords);
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(newRecords));
    } catch (e) {
      console.warn('Could not save reminder records to localStorage:', e);
    }
  }, []);

  const getCuotaCooldownState = useCallback((cuotaId: string): CuotaCooldownState => {
    const record = records[cuotaId];
    if (!record || !record.fecha_inicio_vuelta_actual || record.total_vueltas === 0) {
      return {
        totalVueltas: record?.total_vueltas || 0,
        enCooldown: false,
        horasRestantes: 0,
        minutosRestantes: 0,
        segundosRestantes: 0,
        porcentajeRestante: 0,
        porcentajeConsumido: 100,
        fechaInicioVuelta: null,
        fechaReactivacion: null,
        ultimoEnvio: record?.fecha_ultimo_envio || null,
        historial: record?.historial || []
      };
    }

    const inicioMs = new Date(record.fecha_inicio_vuelta_actual).getTime();
    const cooldownMs = config.cooldown_horas * 3600 * 1000;
    const reactivacionMs = inicioMs + cooldownMs;
    const diffRestanteMs = reactivacionMs - currentTime;

    if (diffRestanteMs <= 0) {
      return {
        totalVueltas: record.total_vueltas,
        enCooldown: false,
        horasRestantes: 0,
        minutosRestantes: 0,
        segundosRestantes: 0,
        porcentajeRestante: 0,
        porcentajeConsumido: 100,
        fechaInicioVuelta: record.fecha_inicio_vuelta_actual,
        fechaReactivacion: new Date(reactivacionMs).toISOString(),
        ultimoEnvio: record.fecha_ultimo_envio,
        historial: record.historial || []
      };
    }

    const totalSegundosRestantes = Math.floor(diffRestanteMs / 1000);
    const horas = Math.floor(totalSegundosRestantes / 3600);
    const minutos = Math.floor((totalSegundosRestantes % 3600) / 60);
    const segundos = totalSegundosRestantes % 60;

    const fraction = diffRestanteMs / cooldownMs;
    const porcentajeRestante = Math.min(100, Math.max(0, Math.round(fraction * 100 * 10) / 10));
    const porcentajeConsumido = Math.min(100, Math.max(0, Math.round((1 - fraction) * 100 * 10) / 10));

    return {
      totalVueltas: record.total_vueltas,
      enCooldown: true,
      horasRestantes: horas,
      minutosRestantes: minutos,
      segundosRestantes: segundos,
      porcentajeRestante,
      porcentajeConsumido,
      fechaInicioVuelta: record.fecha_inicio_vuelta_actual,
      fechaReactivacion: new Date(reactivacionMs).toISOString(),
      ultimoEnvio: record.fecha_ultimo_envio,
      historial: record.historial || []
    };
  }, [records, config.cooldown_horas, currentTime]);

  const registrarEnvio = useCallback((params: {
    cuotaId: string;
    familiaId: string;
    alumnoId: string;
    plantillaId: string;
    plantillaNombre: string;
    telefonoDestino: string;
    mensajeEnviado: string;
  }) => {
    const nowIso = new Date().toISOString();
    const existing = records[params.cuotaId];

    const nuevoIntentoNum = (existing?.total_vueltas || 0) + 1;

    const nuevoItemHistorial: ReminderHistoryItem = {
      intento_num: nuevoIntentoNum,
      timestamp: nowIso,
      plantilla_id: params.plantillaId,
      plantilla_nombre: params.plantillaNombre,
      telefono_destino: params.telefonoDestino,
      mensaje_enviado: params.mensajeEnviado,
    };

    const nuevoRecord: CuotaReminderRecord = {
      cuota_id: params.cuotaId,
      familia_id: params.familiaId,
      alumno_id: params.alumnoId,
      total_vueltas: nuevoIntentoNum,
      fecha_inicio_vuelta_actual: nowIso,
      fecha_ultimo_envio: nowIso,
      historial: [...(existing?.historial || []), nuevoItemHistorial]
    };

    const updated = {
      ...records,
      [params.cuotaId]: nuevoRecord
    };

    saveRecords(updated);
    return nuevoRecord;
  }, [records, saveRecords]);

  const resetearCooldown = useCallback((cuotaId: string) => {
    const existing = records[cuotaId];
    if (!existing) return;

    // Remove start date of current round so cooldown terminates immediately
    const updated = {
      ...records,
      [cuotaId]: {
        ...existing,
        fecha_inicio_vuelta_actual: new Date(0).toISOString()
      }
    };
    saveRecords(updated);
  }, [records, saveRecords]);

  return {
    config,
    saveConfig,
    records,
    getCuotaCooldownState,
    registrarEnvio,
    resetearCooldown
  };
}
