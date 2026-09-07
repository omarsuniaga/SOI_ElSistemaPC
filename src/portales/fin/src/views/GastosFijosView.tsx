import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Phone,
  Zap,
  Droplet,
  Home,
  Users,
  Briefcase,
  Clock,
  Package,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  X,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { computeEstadoGastoFijo, computeVentanaBarra } from '../lib/gastosFijos';
import { CategoriaGastoFijo, GastoFijo } from '../types';

const CATEGORIA_META: Record<CategoriaGastoFijo, { label: string; icon: React.ElementType; chipClass: string }> = {
  comunicaciones: { label: 'Comunicaciones', icon: Phone, chipClass: 'bg-sky-500/10 border-sky-500/20 text-sky-400' },
  energia: { label: 'Energía', icon: Zap, chipClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  agua: { label: 'Agua', icon: Droplet, chipClass: 'bg-sky-500/10 border-sky-500/20 text-sky-400' },
  limpieza: { label: 'Operaciones', icon: Package, chipClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  personal: { label: 'Recursos Humanos', icon: Briefcase, chipClass: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
  alquiler: { label: 'Alquiler', icon: Home, chipClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  software: { label: 'Software', icon: Package, chipClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  seguro: { label: 'Seguros', icon: ShieldCheck, chipClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  otro: { label: 'Otro', icon: Package, chipClass: 'bg-zinc-800 border-zinc-700 text-zinc-300' },
};

const TONE_CLASS: Record<string, string> = {
  ok: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  warn: 'text-amber-400 bg-amber-500/12 border-amber-500/30',
  crit: 'text-rose-400 bg-rose-500/12 border-rose-500/30',
  idle: 'text-zinc-400 bg-zinc-950 border-zinc-800',
};

const SEG_CLASS: Record<string, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  crit: 'bg-rose-500',
  idle: 'bg-zinc-700',
};

export const GastosFijosView: React.FC = () => {
  const {
    gastosFijos,
    gastosFijosPagos,
    periodoActivo,
    crearGastoFijo,
    registrarPagoGastoFijo,
    generarInstanciasGastosFijosMes,
  } = useFinance();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<CategoriaGastoFijo>('energia');
  const [nuevoCentroCosto, setNuevoCentroCosto] = useState<'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT'>('ADM');
  const [nuevoMonto, setNuevoMonto] = useState<number>(5000);
  const [nuevoDiaInicio, setNuevoDiaInicio] = useState<number>(1);
  const [nuevoDiaFin, setNuevoDiaFin] = useState<number>(5);

  const [anioStr, mesStr] = periodoActivo.split('-');
  const periodoAnio = Number(anioStr);
  const periodoMes = Number(mesStr);
  const hoy = new Date().getDate();

  const filas = useMemo(() => {
    return gastosFijos
      .filter(g => g.activo)
      .map(g => {
        const pago = gastosFijosPagos.find(
          p => p.gasto_fijo_id === g.id && p.periodo_anio === periodoAnio && p.periodo_mes === periodoMes
        );
        const estado = computeEstadoGastoFijo(
          { diaInicio: g.dia_inicio, diaFin: g.dia_fin },
          hoy,
          pago?.estado === 'pagado',
          pago?.fecha_pago
        );
        const barra = computeVentanaBarra({ diaInicio: g.dia_inicio, diaFin: g.dia_fin });
        return { gasto: g, pago, estado, barra };
      })
      .sort((a, b) => a.gasto.dia_inicio - b.gasto.dia_inicio);
  }, [gastosFijos, gastosFijosPagos, periodoAnio, periodoMes, hoy]);

  const totalMensual = filas.reduce((acc, f) => acc + f.gasto.monto_centavos, 0);
  const totalPagado = filas.filter(f => f.pago?.estado === 'pagado').reduce((acc, f) => acc + f.gasto.monto_centavos, 0);
  const totalPendiente = totalMensual - totalPagado;
  const atencionCount = filas.filter(f => f.estado.tone === 'warn' || f.estado.tone === 'crit').length;

  const handleGenerar = async () => {
    setGenerando(true);
    const res = await generarInstanciasGastosFijosMes(periodoAnio, periodoMes);
    setGenerando(false);
    if (res.success) {
      setSuccessMessage(`Instancias del período ${periodoActivo} generadas (${res.generadas ?? 0} nuevas).`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Error al generar las instancias del mes.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleMarcarPagado = async (gasto: GastoFijo) => {
    const res = await registrarPagoGastoFijo({
      gasto_fijo_id: gasto.id,
      periodo_anio: periodoAnio,
      periodo_mes: periodoMes,
      monto_centavos: gasto.monto_centavos,
    });
    if (res.success) {
      setSuccessMessage(`${gasto.nombre} marcado como pagado.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.error || 'Error al registrar el pago.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || nuevoDiaFin < nuevoDiaInicio || nuevoMonto <= 0) {
      setErrorMessage('Revisa el nombre, el monto y que el día final no sea menor al inicial.');
      return;
    }

    const res = await crearGastoFijo({
      nombre: nuevoNombre,
      categoria: nuevaCategoria,
      centro_costo: nuevoCentroCosto,
      monto_centavos: Math.round(nuevoMonto * 100),
      dia_inicio: nuevoDiaInicio,
      dia_fin: nuevoDiaFin,
      repetir_mensual: true,
    });

    if (res.success) {
      setSuccessMessage(`Gasto fijo "${nuevoNombre}" registrado.`);
      setShowCreateModal(false);
      setNuevoNombre('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Error al crear el gasto fijo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Presupuesto &amp; Nómina
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Gastos Fijos Mensuales
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Cada gasto tiene una ventana de pago (día inicio–día fin), no un solo día de vencimiento. Se repite automáticamente cada mes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleGenerar}
            disabled={generando}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-400 ${generando ? 'animate-spin' : ''}`} />
            <span>Generar instancias {periodoActivo}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Gasto Fijo</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Comprometido</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">{formatDOP(totalMensual)}</div>
          <div className="text-[11px] text-zinc-500 font-mono">{filas.length} gastos fijos &middot; {periodoActivo}</div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">Pagado Este Mes</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-sky-400">{formatDOP(totalPagado)}</div>
          <div className="text-[11px] text-sky-500 font-mono">
            {filas.filter(f => f.pago?.estado === 'pagado').length} de {filas.length} liquidados
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Pendiente</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">{formatDOP(totalPendiente)}</div>
          <div className="text-[11px] text-amber-500 font-mono">por pagar este período</div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Requieren Atención</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-rose-400">{atencionCount}</div>
          <div className="text-[11px] text-rose-500 font-mono">en ventana o vencidos</div>
        </div>
      </div>

      {/* Calendar Panel */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Calendario de Gastos Fijos &mdash; {periodoActivo}</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Cada barra es la ventana de pago. La marca blanca es el día de hoy.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-[11px] text-indigo-300">
            Hoy: día {hoy}
          </div>
        </div>

        {filas.length === 0 && (
          <div className="p-10 text-center text-xs text-zinc-500">
            No hay gastos fijos registrados todavía. Crea el primero con "Nuevo Gasto Fijo".
          </div>
        )}

        <div className="divide-y divide-zinc-800/60">
          {filas.map(({ gasto, pago, estado, barra }) => {
            const meta = CATEGORIA_META[gasto.categoria];
            const Icon = meta.icon;
            return (
              <div key={gasto.id} className="grid grid-cols-1 md:grid-cols-[240px_120px_1fr_190px_150px] items-center gap-4 md:gap-5 px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${meta.chipClass}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{gasto.nombre}</div>
                    <div className="text-[10.5px] text-zinc-500 font-mono mt-0.5">{meta.label}</div>
                  </div>
                </div>

                <div className="font-mono font-bold text-sm text-white">{formatDOP(gasto.monto_centavos)}</div>

                <div>
                  <div className="relative h-2 rounded-full bg-zinc-950 border border-zinc-800">
                    <div
                      className={`absolute -top-px -bottom-px rounded-full ${SEG_CLASS[estado.tone]}`}
                      style={{ left: `${barra.leftPct}%`, width: `${barra.widthPct}%` }}
                    />
                    <div
                      className="absolute -top-1 w-0.5 h-4 bg-white rounded-sm shadow"
                      style={{ left: `${((hoy - 0.5) / 31) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
                    <span>Día {gasto.dia_inicio}</span>
                    <span>Ventana de pago</span>
                    <span>Día {gasto.dia_fin}</span>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${TONE_CLASS[estado.tone]}`}>
                    {estado.label}
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-1">{estado.sub}</div>
                </div>

                <div className="flex md:justify-end">
                  {pago?.estado === 'pagado' ? (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarcarPagado(gasto)}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-xl text-[11px] font-semibold cursor-pointer"
                    >
                      Marcar pagado
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 px-6 py-3.5 bg-zinc-950/50 border-t border-zinc-800/60 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Cada gasto fijo es una plantilla recurrente: usa "Generar instancias" al cerrar el mes para crear el registro del siguiente período.</span>
        </div>
      </div>

      {/* Modal: Nuevo Gasto Fijo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">Nuevo Gasto Fijo Mensual</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nombre del gasto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Servicio Eléctrico"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORIA_META) as CategoriaGastoFijo[]).map(cat => {
                    const meta = CATEGORIA_META[cat];
                    const Icon = meta.icon;
                    const selected = cat === nuevaCategoria;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setNuevaCategoria(cat)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border text-[10px] cursor-pointer ${
                          selected ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Monto mensual (DOP)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={nuevoMonto}
                    onChange={e => setNuevoMonto(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Centro de costo</label>
                  <select
                    value={nuevoCentroCosto}
                    onChange={e => setNuevoCentroCosto(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="DIR">DIR</option>
                    <option value="ACM">ACM</option>
                    <option value="ADM">ADM</option>
                    <option value="FIN">FIN</option>
                    <option value="LOG">LOG</option>
                    <option value="LUT">LUT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5">Ventana de pago (día del mes)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 text-[10px]">Desde</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="31"
                      value={nuevoDiaInicio}
                      onChange={e => setNuevoDiaInicio(Number(e.target.value))}
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 text-[10px]">Hasta</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="31"
                      value={nuevoDiaFin}
                      onChange={e => setNuevoDiaFin(Number(e.target.value))}
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Se repite automáticamente cada mes. Usa "Generar instancias" para crear el registro del siguiente período.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Guardar Gasto Fijo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
