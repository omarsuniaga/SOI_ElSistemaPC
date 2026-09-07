import React, { useMemo, useState, useCallback } from 'react';
import {
  Sparkles,
  Search,
  CreditCard,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatDOP } from '../lib/financialMath';
import { useAlumnosCartera, type AlumnoCarteraRow } from '../hooks/useAlumnosCartera';
import { supabaseRest } from '../infrastructure/supabase/SupabaseRestClient';
import { Database } from '../infrastructure/supabase/database.types';
import {
  CARTERA_TABS,
  type CarteraTab,
  diasAtraso,
  filtrarCartera,
  contarPorPestana,
  semaforo,
} from '../lib/carteraHelpers';

type CuotaRow = Database['public']['Tables']['cuotas']['Row'];
const ABIERTAS = 'pendiente,vencida,en_mora';

interface CuotasViewProps {
  setActiveView?: (view: string) => void;
}

export const CuotasView: React.FC<CuotasViewProps> = ({ setActiveView }) => {
  const { periodoActivo, generarCuotasMensuales, iniciarCobroFamilia } = useFinance();
  const { rows, isLoading, error, refresh } = useAlumnosCartera();

  const [tab, setTab] = useState<CarteraTab>('pendientes');
  const [search, setSearch] = useState('');
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cuotasByAlumno, setCuotasByAlumno] = useState<Record<string, CuotaRow[] | 'loading' | 'error'>>({});

  const hoy = useMemo(() => new Date(), []);
  const counts = useMemo(() => contarPorPestana(rows), [rows]);
  const filtered = useMemo(() => filtrarCartera(rows, tab, search), [rows, tab, search]);

  const handleGenerar = () => {
    const res = generarCuotasMensuales(periodoActivo);
    setGenMessage(`Facturación ${periodoActivo}: ${res.generadas} cuota(s) creadas, ${res.omitidas} omitidas.`);
    setTimeout(() => setGenMessage(null), 5000);
    void refresh();
  };

  const handleCobrar = (familiaId: string | null) => {
    if (familiaId) iniciarCobroFamilia(familiaId);
    setActiveView?.('registro_pago');
  };

  const toggleExpand = useCallback(async (alumnoId: string) => {
    if (expanded === alumnoId) {
      setExpanded(null);
      return;
    }
    setExpanded(alumnoId);
    if (cuotasByAlumno[alumnoId]) return;
    setCuotasByAlumno((s) => ({ ...s, [alumnoId]: 'loading' }));
    try {
      const data = await supabaseRest<CuotaRow[]>(
        `cuotas?alumno_id=eq.${alumnoId}&estado=in.(${ABIERTAS})&select=*&order=fecha_vencimiento.asc`,
      );
      setCuotasByAlumno((s) => ({ ...s, [alumnoId]: Array.isArray(data) ? data : [] }));
    } catch {
      setCuotasByAlumno((s) => ({ ...s, [alumnoId]: 'error' }));
    }
  }, [expanded, cuotasByAlumno]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
            Facturación & Cartera
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Cartera de Alumnos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Una fila por alumno. Saldo consolidado, semáforo de estado y cobro directo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleCobrar(null)}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
          <button
            onClick={handleGenerar}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-indigo-950/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generar Facturación ({periodoActivo})</span>
          </button>
        </div>
      </div>

      {genMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{genMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {CARTERA_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {t.label}
            <span className={`ml-2 font-mono ${tab === t.id ? 'text-indigo-200' : 'text-zinc-600'}`}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por alumno, representante o familia…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            <strong className="text-white">{filtered.length}</strong> alumno{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-zinc-500 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando cartera…
          </div>
        ) : error ? (
          <div className="p-8 flex flex-col items-center gap-3 text-rose-400 text-xs">
            <AlertTriangle className="w-6 h-6" />
            <span>{error}</span>
            <button onClick={() => void refresh()} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-200 cursor-pointer">
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">Sin alumnos en esta vista.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-5">Alumno</th>
                  <th className="py-3 px-5">Cuotas</th>
                  <th className="py-3 px-5">Saldo pendiente</th>
                  <th className="py-3 px-5">Vencimiento crítico</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filtered.map((r) => {
                  const s = semaforo(r.estado_pago);
                  const dias = diasAtraso(r.fecha_mas_antigua_vencida, hoy);
                  const saldo = r.saldo_pendiente_centavos ?? 0;
                  const pend = r.cuotas_pendientes_count ?? 0;
                  const isOpen = expanded === r.alumno_id;
                  const detalle = r.alumno_id ? cuotasByAlumno[r.alumno_id] : undefined;
                  return (
                    <React.Fragment key={r.alumno_id ?? Math.random()}>
                      <tr className="hover:bg-zinc-950/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <button
                            onClick={() => r.alumno_id && toggleExpand(r.alumno_id)}
                            className="flex items-start gap-2 text-left cursor-pointer group"
                          >
                            <ChevronRight
                              className={`w-3.5 h-3.5 mt-0.5 text-zinc-600 transition-transform ${isOpen ? 'rotate-90 text-zinc-300' : ''}`}
                            />
                            <span>
                              <span className="font-semibold text-white group-hover:text-indigo-300">
                                {r.alumno_nombre}
                              </span>
                              {pend > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-mono">
                                  {pend} pend.
                                </span>
                              )}
                              <span className="block text-[11px] text-zinc-500 mt-0.5">
                                {r.contacto_nombre} · {r.nombre_familia}
                                {r.instrumento_principal ? ` · ${r.instrumento_principal}` : ''}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-zinc-400">
                          {pend > 0 ? `${pend} abierta${pend === 1 ? '' : 's'}` : '—'}
                          {r.estado_pago === 'exento' && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px]">⭐ Exento</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 font-mono">
                          <span className={saldo > 0 ? 'text-rose-400 font-bold' : 'text-zinc-500'}>
                            {saldo > 0 ? formatDOP(saldo) : 'Al día'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-zinc-300">
                          {r.fecha_mas_antigua_vencida ?? '—'}
                          {dias > 0 && (
                            <span className="block text-[10px] text-rose-400 font-bold">🔴 {dias} días de atraso</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${s.chip}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.contacto_telefono && (
                              <a
                                href={`https://wa.me/${r.contacto_telefono.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Escribir por WhatsApp"
                                className="p-1.5 bg-zinc-800 hover:bg-emerald-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleCobrar(r.familia_id)}
                              disabled={saldo <= 0}
                              title="Registrar pago"
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-zinc-950/60">
                          <td colSpan={6} className="px-5 py-3">
                            <CuotaDetalle detalle={detalle} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const CuotaDetalle: React.FC<{ detalle: CuotaRow[] | 'loading' | 'error' | undefined }> = ({ detalle }) => {
  if (detalle === 'loading' || detalle === undefined) {
    return <span className="text-[11px] text-zinc-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Cargando cuotas…</span>;
  }
  if (detalle === 'error') {
    return <span className="text-[11px] text-rose-400">No se pudieron cargar las cuotas.</span>;
  }
  if (detalle.length === 0) {
    return <span className="text-[11px] text-zinc-500">Sin cuotas abiertas.</span>;
  }
  return (
    <table className="w-full text-[11px]">
      <thead className="text-zinc-500 font-mono uppercase">
        <tr>
          <th className="text-left py-1">Concepto</th>
          <th className="text-left py-1">Período</th>
          <th className="text-right py-1">Monto</th>
          <th className="text-right py-1">Pagado</th>
          <th className="text-right py-1">Saldo</th>
          <th className="text-left py-1 pl-3">Vence</th>
        </tr>
      </thead>
      <tbody className="text-zinc-300">
        {detalle.map((c) => {
          const saldo = (c.monto_final_centavos ?? 0) - (c.monto_pagado_centavos ?? 0);
          return (
            <tr key={c.id}>
              <td className="py-1 capitalize">{c.concepto}</td>
              <td className="py-1 font-mono">{c.ciclo_anio}-{String(c.ciclo_mes).padStart(2, '0')}</td>
              <td className="py-1 text-right font-mono">{formatDOP(c.monto_final_centavos ?? 0)}</td>
              <td className="py-1 text-right font-mono text-emerald-400">{formatDOP(c.monto_pagado_centavos ?? 0)}</td>
              <td className="py-1 text-right font-mono text-rose-400 font-semibold">{formatDOP(saldo)}</td>
              <td className="py-1 pl-3 font-mono">{c.fecha_vencimiento}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
