import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import { 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  HelpCircle,
  Building,
  DollarSign,
  PlusCircle,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';

export const PresupuestoView: React.FC = () => {
  const { partidas, crearPartidaPresupuestaria, trasladarPresupuesto } = useFinance();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form states: New Partida
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCentro, setNuevoCentro] = useState<'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT'>('ACM');
  const [nuevoMonto, setNuevoMonto] = useState<number>(250000);

  // Form states: Transfer
  const [origenId, setOrigenId] = useState(partidas[0]?.id || '');
  const [destinoId, setDestinoId] = useState(partidas[1]?.id || '');
  const [montoTraslado, setMontoTraslado] = useState<number>(15000);
  const [justificacion, setJustificacion] = useState('');

  const totalPresupuestado = partidas.reduce((acc, p) => acc + p.monto_anual_centavos, 0);
  const totalComprometido = partidas.reduce((acc, p) => acc + p.comprometido_centavos, 0);
  const totalPagado = partidas.reduce((acc, p) => acc + p.pagado_centavos, 0);
  const totalDisponible = partidas.reduce((acc, p) => acc + p.disponible_centavos, 0);

  const pctEjecucionTotal = (totalPagado / totalPresupuestado) * 100;

  const handleCreatePartida = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCodigo || !nuevoNombre || nuevoMonto <= 0) return;

    const res = crearPartidaPresupuestaria({
      codigo_partida: nuevoCodigo,
      nombre: nuevoNombre,
      centro_costo: nuevoCentro,
      monto_anual_centavos: Math.round(nuevoMonto * 100),
    });

    if (res.success) {
      setActionNotice(`Partida presupuestaria ${nuevoCodigo} - ${nuevoNombre} aprobada y creada.`);
      setShowCreateModal(false);
      setNuevoCodigo('');
      setNuevoNombre('');
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (origenId === destinoId) {
      setErrorNotice('La partida de origen y destino no pueden ser la misma.');
      setTimeout(() => setErrorNotice(null), 4000);
      return;
    }

    const res = trasladarPresupuesto({
      origen_id: origenId,
      destino_id: destinoId,
      monto_centavos: Math.round(montoTraslado * 100),
      justificacion: justificacion || 'Reasignación de fondos operacionales inter-departamentales',
    });

    if (res.success) {
      setActionNotice(`Traslado de ${formatDOP(Math.round(montoTraslado * 100))} aplicado exitosamente.`);
      setShowTransferModal(false);
      setJustificacion('');
      setTimeout(() => setActionNotice(null), 5000);
    } else {
      setErrorNotice(res.error || 'Error al ejecutar el traslado.');
      setTimeout(() => setErrorNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Control Presupuestario
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Presupuesto & Centros de Costos 2026
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Estructura programática anual, control de compromisos y disponibilidad en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Traslado Presupuestario</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Partida</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Presupuesto Aprobado</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {formatDOP(totalPresupuestado)}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">Ejercicio Fiscal 2026</div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">Ejecutado (Pagado)</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-sky-400">
            {formatDOP(totalPagado)}
          </div>
          <div className="text-[11px] text-sky-500 font-mono">{pctEjecucionTotal.toFixed(1)}% del total anual</div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Comprometido en O/C</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
            {formatDOP(totalComprometido)}
          </div>
          <div className="text-[11px] text-amber-500 font-mono">Facturas validadas / órdenes</div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Saldo Disponible</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
            {formatDOP(totalDisponible)}
          </div>
          <div className="text-[11px] text-emerald-500 font-mono">Fondos libres para girar</div>
        </div>
      </div>

      {/* Detailed Budget Table */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-5">Código / Partida</th>
                <th className="py-3 px-5">Centro de Costo</th>
                <th className="py-3 px-5">Presupuesto Anual</th>
                <th className="py-3 px-5">Comprometido</th>
                <th className="py-3 px-5">Ejecutado (Pagado)</th>
                <th className="py-3 px-5">Disponible</th>
                <th className="py-3 px-5 text-center">% Avance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {partidas.map(partida => {
                const pct = (partida.pagado_centavos / partida.monto_anual_centavos) * 100;
                return (
                  <tr key={partida.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white">{partida.nombre}</div>
                      <div className="font-mono text-[10px] text-indigo-400 mt-0.5">{partida.codigo_partida}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono font-medium text-[11px]">
                        {partida.centro_costo}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-white">
                      {formatDOP(partida.monto_anual_centavos)}
                    </td>
                    <td className="py-3.5 px-5 text-amber-400 font-mono">
                      {formatDOP(partida.comprometido_centavos)}
                    </td>
                    <td className="py-3.5 px-5 text-sky-400 font-mono font-semibold">
                      {formatDOP(partida.pagado_centavos)}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-emerald-400">
                      {formatDOP(partida.disponible_centavos)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[10px] text-zinc-300">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nueva Partida Presupuestaria */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">Nueva Partida Presupuestaria 2026</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartida} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Código de Partida (Ej. PAR-2026-ACM-04)</label>
                <input
                  type="text"
                  required
                  placeholder="PAR-2026-..."
                  value={nuevoCodigo}
                  onChange={e => setNuevoCodigo(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Nombre / Objeto del Gasto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taller de Cuerdas Frotadas..."
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Centro de Costo</label>
                  <select
                    value={nuevoCentro}
                    onChange={e => setNuevoCentro(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="DIR">DIR (Dirección Ejecutiva)</option>
                    <option value="ACM">ACM (Académico / Cátedras)</option>
                    <option value="ADM">ADM (Administración)</option>
                    <option value="FIN">FIN (Finanzas / Contraloría)</option>
                    <option value="LOG">LOG (Logística & Conciertos)</option>
                    <option value="LUT">LUT (Luthería & Instrumentos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Presupuesto Anual (DOP)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={nuevoMonto}
                    onChange={e => setNuevoMonto(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
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
                  Crear Partida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Traslado Presupuestario */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Reasignación / Traslado Presupuestario</h3>
              </div>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Partida Origen (Cede Fondos)</label>
                <select
                  value={origenId}
                  onChange={e => setOrigenId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {partidas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_partida} - {p.nombre} (Disp: {formatDOP(p.disponible_centavos)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Partida Destino (Recibe Fondos)</label>
                <select
                  value={destinoId}
                  onChange={e => setDestinoId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {partidas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_partida} - {p.nombre} (Disp: {formatDOP(p.disponible_centavos)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Monto a Trasladar (DOP)</label>
                <input
                  type="number"
                  required
                  min="100"
                  step="500"
                  value={montoTraslado}
                  onChange={e => setMontoTraslado(Number(e.target.value))}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Justificación Institucional / Motivo</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describa el motivo del traslado presupuestario..."
                  value={justificacion}
                  onChange={e => setJustificacion(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Ejecutar Traslado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

