import React from 'react';
import { Database, AlertTriangle, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';

interface SupabaseStatusBannerProps {
  status: 'authoritative_online' | 'read_cache_degraded' | 'offline_blocked' | 'loading';
  lastSync?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export const SupabaseStatusBanner: React.FC<SupabaseStatusBannerProps> = ({
  status,
  lastSync,
  errorMessage,
  onRetry
}) => {
  if (status === 'authoritative_online') {
    return (
      <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">SOI Supabase Autoritativo Conectado</span>
          <span className="text-emerald-400/70 text-[11px]">| Sistema de Registro Activo (RLS Enforced)</span>
        </div>
        {lastSync && (
          <span className="text-[10px] text-emerald-400/60 font-mono hidden sm:inline">
            Sincronizado: {lastSync}
          </span>
        )}
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="bg-indigo-950/40 border-b border-indigo-800/40 px-4 py-1.5 flex items-center justify-between text-xs text-indigo-300">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Conectando con base de datos autoritativa SOI Supabase...</span>
        </div>
      </div>
    );
  }

  if (status === 'read_cache_degraded') {
    return (
      <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">MODO DEGRADADO (Caché de solo lectura): </span>
            <span>Supabase no está disponible temporalmente. Transacciones financieras bloqueadas por seguridad.</span>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Reintentar Conexión
          </button>
        )}
      </div>
    );
  }

  // offline_blocked (Fail-closed)
  return (
    <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-rose-200">
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <div>
          <span className="font-bold">FAIL-CLOSED ACTIVADO: </span>
          <span>{errorMessage || 'Sin conexión autoritativa con Supabase. Escrituras financieras deshabilitadas.'}</span>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          Reconectar
        </button>
      )}
    </div>
  );
};
