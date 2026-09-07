import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import { 
  Vault, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  FileCheck, 
  Printer, 
  Lock, 
  HelpCircle,
  TrendingDown,
  TrendingUp,
  ReceiptText
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';

export const CajaDiariaView: React.FC = () => {
  const { cierresCaja, pagos, currentUser, crearCierreCaja } = useFinance();
  
  const [denominaciones, setDenominaciones] = useState<{ [key: number]: number }>({
    2000: 0,
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    25: 0
  });

  const [observaciones, setObservaciones] = useState('');
  const [cierreSuccess, setCierreSuccess] = useState<string | null>(null);

  // Calculate total cash collected today
  const today = new Date().toISOString().split('T')[0];
  const pagosEfectivoHoy = pagos.filter(p => p.metodo_pago === 'efectivo' && p.fecha_pago === today);
  const totalEsperadoCentavos = pagosEfectivoHoy.reduce((acc, p) => acc + p.monto_total_centavos, 0);

  // Calculate total physically counted
  const totalContadoCentavos = Object.entries(denominaciones).reduce((acc, [billete, cant]) => {
    return acc + (Number(billete) * Number(cant) * 100);
  }, 0);

  const diferenciaCentavos = totalContadoCentavos - totalEsperadoCentavos;

  const handleDenomChange = (billete: number, cant: number) => {
    setDenominaciones(prev => ({
      ...prev,
      [billete]: Math.max(0, cant)
    }));
  };

  const handleCerrarCaja = (e: React.FormEvent) => {
    e.preventDefault();
    const res = crearCierreCaja({
      monto_apertura_centavos: 0,
      monto_contado_centavos: totalContadoCentavos,
      motivo_diferencia: diferenciaCentavos !== 0 ? observaciones : undefined,
    });

    if (res.success) {
      setCierreSuccess(`Cierre de caja del día formalizado exitosamente por ${currentUser.nombre}.`);
      setTimeout(() => setCierreSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20">
              Ventanilla & Efectivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Arqueo & Cierre de Caja Diaria
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Conciliación de ventanilla física, conteo ciego de billetes y generación de acta inmutable (G-14).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Invariante G-14 Activo</span>
          </div>
        </div>
      </div>

      {cierreSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{cierreSuccess}</span>
        </div>
      )}

      {/* Main Closing Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Denomination Counter (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 p-6 sm:p-7 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold text-sm text-white">Desglose Físico por Denominación</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">Pesos Dominicanos (DOP)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[2000, 1000, 500, 200, 100, 50, 25].map(denom => (
              <div key={denom} className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-white">RD$ {denom}</span>
                  <span className="text-[10px] text-zinc-500 block font-mono">
                    Subtotal: {formatDOP(denom * (denominaciones[denom] || 0) * 100)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={denominaciones[denom] || ''}
                  onChange={(e) => handleDenomChange(denom, parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>

          <div className="p-5 bg-gradient-to-r from-zinc-950 to-indigo-950/40 text-white rounded-2xl border border-indigo-500/30 flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-medium">Total Físico Recontado:</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{formatDOP(totalContadoCentavos)}</span>
          </div>
        </div>

        {/* Right: Reconciliation Balance & Signature (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 p-6 sm:p-7 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-4">
          <h2 className="font-semibold text-sm text-white border-b border-zinc-800/80 pb-3">
            Balance de Cuadratura
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <span className="text-zinc-400">Total Recaudado en Sistema:</span>
              <span className="font-mono font-bold text-white">{formatDOP(totalEsperadoCentavos)}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <span className="text-zinc-400">Total Conteo Físico en Caja:</span>
              <span className="font-mono font-bold text-white">{formatDOP(totalContadoCentavos)}</span>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              diferenciaCentavos === 0 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : diferenciaCentavos > 0 
                  ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <div>
                <span className="font-bold block text-xs">
                  {diferenciaCentavos === 0 ? '✓ Cuadratura Perfecta' : diferenciaCentavos > 0 ? 'Sobrante en Caja' : 'Faltante en Caja'}
                </span>
                <span className="text-[10px] opacity-75 font-mono">Diferencia neta</span>
              </div>
              <span className="text-base font-mono font-bold">
                {formatDOP(Math.abs(diferenciaCentavos))}
              </span>
            </div>

            {diferenciaCentavos !== 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-zinc-400 font-semibold block text-[11px]">Justificación obligatoria de la diferencia:</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                  placeholder="Detalle causa del descuadre para auditoría..."
                  className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleCerrarCaja}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-xs shadow-xl shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-emerald-300" />
                <span>Firmar y Cerrar Jornada (FIN-P14)</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Historical Closings Log */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 font-semibold text-xs text-zinc-200 flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-zinc-400" />
          <span>Histórico de Actas de Cierre Inmutables</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-5">Fecha</th>
                <th className="py-3 px-5">Cajero / Responsable</th>
                <th className="py-3 px-5">Esperado</th>
                <th className="py-3 px-5">Físico</th>
                <th className="py-3 px-5">Diferencia</th>
                <th className="py-3 px-5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {cierresCaja.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                    No hay cierres anteriores registrados en esta sesión.
                  </td>
                </tr>
              ) : (
                cierresCaja.map(arq => (
                  <tr key={arq.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-zinc-300">{arq.fecha}</td>
                    <td className="py-3.5 px-5 text-white font-medium">{arq.cajero_nombre}</td>
                    <td className="py-3.5 px-5 font-mono text-zinc-400">{formatDOP(arq.monto_esperado_centavos)}</td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-white">{formatDOP(arq.monto_contado_centavos)}</td>
                    <td className="py-3.5 px-5 font-mono">
                      <span className={`font-bold ${arq.diferencia_centavos === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatDOP(arq.diferencia_centavos)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                        Cerrado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

