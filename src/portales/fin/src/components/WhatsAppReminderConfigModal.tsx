import React, { useState } from 'react';
import {
  X,
  Settings,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  ReminderConfig,
  ReminderTemplate,
  DEFAULT_REMINDER_CONFIG
} from '../types/reminders';

interface WhatsAppReminderConfigModalProps {
  config: ReminderConfig;
  onClose: () => void;
  onSave: (newConfig: ReminderConfig) => void;
}

export const WhatsAppReminderConfigModal: React.FC<WhatsAppReminderConfigModalProps> = ({
  config,
  onClose,
  onSave
}) => {
  const [cooldownHoras, setCooldownHoras] = useState<number>(config.cooldown_horas);
  const [plantillas, setPlantillas] = useState<ReminderTemplate[]>(config.plantillas);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTemplateChange = (field: keyof ReminderTemplate, value: string) => {
    const updated = [...plantillas];
    updated[selectedTemplateIndex] = {
      ...updated[selectedTemplateIndex],
      [field]: value
    };
    setPlantillas(updated);
  };

  const handleResetDefaults = () => {
    if (confirm('¿Deseas restaurar todas las plantillas y el tiempo de espera a los valores institucionales por defecto (76 horas)?')) {
      setCooldownHoras(DEFAULT_REMINDER_CONFIG.cooldown_horas);
      setPlantillas(DEFAULT_REMINDER_CONFIG.plantillas);
      setSuccessMessage('Valores por defecto restaurados.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownHoras <= 0) {
      alert('Las horas de enfriamiento deben ser mayores a 0.');
      return;
    }

    onSave({
      ...config,
      cooldown_horas: cooldownHoras,
      plantillas
    });

    setSuccessMessage('Configuración de recordatorios guardada exitosamente.');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const currentTemplate = plantillas[selectedTemplateIndex] || plantillas[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Configuración de Recordatorios de WhatsApp
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ajuste de tiempos de enfriamiento entre vueltas y personalización de plantillas de cobranza.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Cooldown Timer Configuration */}
          <div className="p-5 bg-zinc-950/80 rounded-3xl border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Tiempo de Espera entre Vueltas (Cooldown Radial)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Es el tiempo que el cronómetro circular cuenta hacia atrás tras enviar un recordatorio antes de habilitar la siguiente vuelta de cobranza.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {[24, 48, 72, 76, 96, 120].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setCooldownHoras(h)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    cooldownHoras === h
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {h} horas {h === 76 && '(Recomendado)'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs text-zinc-400 font-semibold">
                Horas personalizadas:
              </label>
              <input
                type="number"
                min="1"
                max="720"
                value={cooldownHoras}
                onChange={(e) => setCooldownHoras(parseInt(e.target.value) || 76)}
                className="w-28 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500 text-center"
              />
              <span className="text-xs text-zinc-500 font-mono">
                (~{(cooldownHoras / 24).toFixed(1)} días)
              </span>
            </div>
          </div>

          {/* Section 2: Templates Customization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Plantillas de Mensajes Preestablecidas</span>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Predeterminadas</span>
              </button>
            </div>

            {/* Template Tabs */}
            <div className="flex flex-wrap gap-2">
              {plantillas.map((tpl, idx) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateIndex(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    selectedTemplateIndex === idx
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tpl.tituloCorto || tpl.nombre}
                </button>
              ))}
            </div>

            {/* Template Editor */}
            {currentTemplate && (
              <div className="p-4 bg-zinc-950/80 rounded-3xl border border-zinc-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Título de la Plantilla
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.nombre}
                    onChange={(e) => handleTemplateChange('nombre', e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Cuerpo del Mensaje de WhatsApp
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Variables: {'{alumno}'}, {'{representante}'}, {'{concepto}'}, {'{periodo}'}, {'{saldo}'}, {'{dias_atraso}'}
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={currentTemplate.texto}
                    onChange={(e) => handleTemplateChange('texto', e.target.value)}
                    className="w-full p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-none"
                  />
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all hover:scale-102 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>

      </div>
    </div>
  );
};
