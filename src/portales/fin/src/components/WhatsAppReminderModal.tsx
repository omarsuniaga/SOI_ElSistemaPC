import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Send,
  User,
  Sparkles,
  Phone,
  RotateCcw
} from 'lucide-react';
import { Cuota, Familia, Alumno } from '../types';
import { formatDOP } from '../lib/financialMath';
import { ReminderConfig, ReminderTemplate } from '../types/reminders';
import { CuotaCooldownState } from '../hooks/useWhatsAppReminders';

interface WhatsAppReminderModalProps {
  cuota: Cuota;
  familia?: Familia;
  alumno?: Alumno;
  cooldownState: CuotaCooldownState;
  config: ReminderConfig;
  onClose: () => void;
  onSendReminder: (params: {
    plantillaId: string;
    plantillaNombre: string;
    telefonoDestino: string;
    mensajeEnviado: string;
  }) => void;
  onResetCooldown?: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  cuota,
  familia,
  alumno,
  cooldownState,
  config,
  onClose,
  onSendReminder,
  onResetCooldown
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    // Select best template by overdue days
    const today = new Date();
    const vDate = new Date(cuota.fecha_vencimiento);
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysOverdue === 0) return 'tpl-preventivo';
    if (daysOverdue <= 15) return 'tpl-mora-temprana';
    return 'tpl-mora-critica';
  });

  const [customMessage, setCustomMessage] = useState<string>('');
  const [targetPhone, setTargetPhone] = useState<string>(() => {
    const raw = familia?.telefono_principal || alumno?.representante_tlf || '';
    return raw;
  });

  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [showHistoryTab, setShowHistoryTab] = useState<boolean>(false);

  // Overdue calculations
  const today = new Date();
  const vDate = new Date(cuota.fecha_vencimiento);
  const daysOverdue = Math.max(0, Math.floor((today.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24)));

  const repName = familia?.representante_principal?.nombre_completo || alumno?.representante_nombre || 'Representante';
  const studentName = alumno?.nombre_completo || cuota.alumno_nombre || 'Estudiante';

  // Interpolate variables
  const interpolateTemplate = (templateText: string) => {
    return templateText
      .replace(/{representante}/g, repName)
      .replace(/{alumno}/g, studentName)
      .replace(/{concepto}/g, cuota.arancel_concepto)
      .replace(/{periodo}/g, cuota.periodo)
      .replace(/{saldo}/g, formatDOP(cuota.saldo_centavos))
      .replace(/{fecha_vencimiento}/g, cuota.fecha_vencimiento)
      .replace(/{dias_atraso}/g, String(daysOverdue));
  };

  const selectedTemplate = config.plantillas.find(t => t.id === selectedTemplateId);

  // Update custom message when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setCustomMessage(interpolateTemplate(selectedTemplate.texto));
    }
  }, [selectedTemplateId, cuota, familia, alumno]);

  // Clean phone digits for wa.me
  const cleanPhone = useMemo(() => {
    let digits = targetPhone.replace(/\D/g, '');
    if (!digits) return '';
    // If it starts with local 809/829/849 without country code, prepend 1
    if (digits.length === 10 && (digits.startsWith('809') || digits.startsWith('829') || digits.startsWith('849'))) {
      digits = '1' + digits;
    }
    return digits;
  }, [targetPhone]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const handleSend = () => {
    if (!cleanPhone) {
      alert('Por favor ingrese un número de teléfono de WhatsApp válido.');
      return;
    }

    // Build wa.me url
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Register reminder
    onSendReminder({
      plantillaId: selectedTemplateId,
      plantillaNombre: selectedTemplate?.nombre || 'Personalizado',
      telefonoDestino: cleanPhone,
      mensajeEnviado: customMessage
    });

    onClose();
  };

  const nextRoundNumber = cooldownState.totalVueltas + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Recordatorio de Pago por WhatsApp
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold rounded-full border border-emerald-500/20">
                  Vuelta #{nextRoundNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Alumno: <strong className="text-white">{studentName}</strong> · Rep: <span className="text-zinc-300">{repName}</span> · Balance: <strong className="text-rose-400 font-mono">{formatDOP(cuota.saldo_centavos)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cooldownState.historial.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryTab(!showHistoryTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  showHistoryTab
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Historial ({cooldownState.totalVueltas})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cooldown Active Banner */}
        {cooldownState.enCooldown && (
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                <strong>Período de Enfriamiento Activo:</strong> Se envió recordatorio hace poco. Quedan <strong>{cooldownState.horasRestantes}h {cooldownState.minutosRestantes}m</strong> para la reactivación programada.
              </span>
            </div>
            {onResetCooldown && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Deseas reiniciar el temporizador de cooldown para esta cuota?')) {
                    onResetCooldown();
                  }
                }}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 border border-amber-500/30 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar Cooldown</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {showHistoryTab ? (
            /* History Panel */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Historial de Recordatorios Enviados ({cooldownState.historial.length})</span>
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Cadencia configurada: cada {config.cooldown_horas} horas
                </span>
              </div>

              <div className="space-y-3">
                {cooldownState.historial.map((item, idx) => (
                  <div key={idx} className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-zinc-400 font-mono">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded border border-emerald-500/20">
                        Vuelta #{item.intento_num}
                      </span>
                      <span>
                        {new Date(item.timestamp).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="text-white font-semibold">
                      Plantilla: <span className="text-indigo-400">{item.plantilla_nombre}</span> · Destino: <span className="font-mono text-zinc-300">{item.telefono_destino}</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] bg-zinc-900 p-3 rounded-xl border border-zinc-800/80 whitespace-pre-wrap font-sans">
                      {item.mensaje_enviado}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Main WhatsApp Composer */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Template Selection & Controls */}
              <div className="lg:col-span-6 space-y-5">
                
                {/* Phone input */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Número de WhatsApp del Representante</span>
                    {cleanPhone && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Formato wa.me: +{cleanPhone}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="Ej: (849) 266-5100"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Templates Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Seleccionar Plantilla Institucional
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {config.plantillas.map(tpl => {
                      const isSelected = tpl.id === selectedTemplateId;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`p-3 rounded-2xl text-left text-xs transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                              : 'bg-zinc-950/60 hover:bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{tpl.tituloCorto || tpl.nombre}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
                            {tpl.nombre}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Mensaje a Enviar (Personalizable)
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedNotice ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                    <span>{customMessage.length} caracteres</span>
                    <span>Variables interpoladas automáticamente</span>
                  </div>
                </div>

              </div>

              {/* Right Column: WhatsApp Real Preview (Chat Bubble) */}
              <div className="lg:col-span-6 flex flex-col">
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Vista Previa en WhatsApp
                </label>

                <div className="flex-1 bg-[#0b141a] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between shadow-inner relative overflow-hidden">
                  
                  {/* WhatsApp Chat Header Simulation */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                        {repName.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{repName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">+{cleanPhone || '18090000000'}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded">
                      El Sistema PC
                    </span>
                  </div>

                  {/* WhatsApp Message Bubble */}
                  <div className="flex justify-end mb-4">
                    <div className="max-w-[92%] bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm p-4 shadow-md text-xs leading-relaxed space-y-1 relative font-sans">
                      <div className="whitespace-pre-wrap">{customMessage}</div>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/60 pt-1 font-mono">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCircle2 className="w-3 h-3 text-sky-400" />
                      </div>
                    </div>
                  </div>

                  {/* Chat Footer Helper */}
                  <div className="pt-3 border-t border-zinc-800/60 text-center text-[10px] text-zinc-500">
                    Al presionar enviar se abrirá WhatsApp con el texto y el número cargados para su envío instantáneo.
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>
              Cadencia: <strong>{config.cooldown_horas} horas</strong> de enfriamiento por vuelta
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!cleanPhone}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-102 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {cooldownState.enCooldown
                  ? `Forzar Envío Extraordinario (Vuelta #${nextRoundNumber})`
                  : `Enviar a WhatsApp (Vuelta #${nextRoundNumber})`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
