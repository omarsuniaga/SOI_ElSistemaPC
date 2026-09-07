import React from 'react';
import { MessageSquare, Clock, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { CuotaCooldownState } from '../hooks/useWhatsAppReminders';

interface WhatsAppCooldownButtonProps {
  cooldownState: CuotaCooldownState;
  onClick: () => void;
  disabled?: boolean;
}

export const WhatsAppCooldownButton: React.FC<WhatsAppCooldownButtonProps> = ({
  cooldownState,
  onClick,
  disabled = false,
}) => {
  const {
    enCooldown,
    totalVueltas,
    horasRestantes,
    minutosRestantes,
    porcentajeRestante,
    fechaReactivacion,
    ultimoEnvio
  } = cooldownState;

  // SVG Radial constants
  const size = 20;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Offset: When 100% remaining, full ring. As time passes, it drains.
  const strokeDashoffset = circumference - (porcentajeRestante / 100) * circumference;

  const formatShortTime = () => {
    if (horasRestantes > 0) {
      return `${horasRestantes}h ${minutosRestantes}m`;
    }
    return `${minutosRestantes}m`;
  };

  const formattedLastDate = ultimoEnvio
    ? new Date(ultimoEnvio).toLocaleDateString('es-DO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const formattedReactivationDate = fechaReactivacion
    ? new Date(fechaReactivacion).toLocaleDateString('es-DO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  if (enCooldown) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={`Vuelta #${totalVueltas} en curso (Enviado: ${formattedLastDate}). Próxima vuelta disponible: ${formattedReactivationDate}. Haz clic para ver historial o forzar reenvío.`}
        className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-950/90 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-[11px] font-mono text-zinc-300 transition-all shadow-sm cursor-pointer"
      >
        {/* Radial Clock Progress SVG */}
        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#27272a" /* zinc-800 */
              strokeWidth={strokeWidth}
            />
            {/* Draining timer ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f59e0b" /* amber-500 */
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <Clock className="w-2.5 h-2.5 text-amber-400 absolute" />
        </div>

        {/* Cooldown Info */}
        <div className="flex items-center gap-1.5 leading-none">
          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 font-bold text-[9px] rounded-md border border-amber-500/20">
            V{totalVueltas}
          </span>
          <span className="font-semibold text-amber-200/90 group-hover:text-amber-200">
            {formatShortTime()}
          </span>
        </div>
      </button>
    );
  }

  // Not in cooldown: Ready for next cycle or initial cycle
  const hasHistory = totalVueltas > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={
        hasHistory
          ? `¡Cooldown finalizado! Completadas ${totalVueltas} vuelta(s). Último envío: ${formattedLastDate}. Listo para Vuelta #${totalVueltas + 1}.`
          : 'Enviar recordatorio de pago por WhatsApp al representante.'
      }
      className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shadow-sm cursor-pointer ${
        hasHistory
          ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 ring-1 ring-emerald-500/20 animate-pulse'
          : 'bg-zinc-950/80 hover:bg-emerald-950/40 text-zinc-300 hover:text-emerald-300 border border-zinc-800 hover:border-emerald-500/40'
      }`}
    >
      <MessageSquare className={`w-3.5 h-3.5 ${hasHistory ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-emerald-400'}`} />
      
      <span>{hasHistory ? `Vuelta ${totalVueltas + 1}` : 'WhatsApp'}</span>

      {hasHistory && (
        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[9px] rounded-md border border-emerald-500/30">
          ✓{totalVueltas}
        </span>
      )}
    </button>
  );
};
