import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import { 
  Landmark, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';

export const BancosConciliacionView: React.FC = () => {
  const { cuentasBancarias, transaccionesBancarias, conciliarTransaccion } = useFinance();
  const [selectedAccountId, setSelectedAccountId] = useState<string>(cuentasBancarias[0]?.id || '');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const selectedAccount = cuentasBancarias.find(c => c.id === selectedAccountId);
  const accountTrxs = transaccionesBancarias.filter(t => t.cuenta_id === selectedAccountId);

  const handleConciliar = (trxId: string) => {
    conciliarTransaccion(trxId);
    setActionSuccess(`Transacción bancaria conciliada formalmente. Saldo en libro sincronizado con extracto.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sky-500/10 text-sky-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-sky-500/20">
              Tesorería Bancaria
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Cuentas Bancarias & Conciliación
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sincronización de extractos bancarios, motor de emparejamiento con puntaje de confianza e invariante G-06.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Invariante G-06 Activo</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Account Cards in Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cuentasBancarias.map(acc => {
          const isSelected = selectedAccountId === acc.id;
          const diff = acc.saldo_extracto_centavos - acc.saldo_libro_centavos;

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`p-7 rounded-[2.5rem] border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border-indigo-500/40 shadow-2xl ring-1 ring-indigo-500/30' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isSelected ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{acc.banco}</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {acc.tipo_cuenta === 'corriente' ? 'Cta. Corriente' : 'Cta. Ahorro'} · {acc.numero_cuenta}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {acc.moneda}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-zinc-800/80 text-xs">
                <div className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800">
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">Saldo en Libros:</span>
                  <span className="font-mono font-bold text-sm text-white mt-1 block">{formatDOP(acc.saldo_libro_centavos)}</span>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800">
                  <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">Saldo Según Banco:</span>
                  <span className="font-mono font-bold text-sm text-zinc-200 mt-1 block">{formatDOP(acc.saldo_extracto_centavos)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs pt-2">
                <span className="text-zinc-400 font-mono text-[11px]">Diferencia por conciliar:</span>
                <span className={`font-mono font-bold px-2.5 py-1 rounded-full text-[11px] border ${
                  diff === 0 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {diff === 0 ? 'Conciliado (RD$ 0.00)' : formatDOP(Math.abs(diff))}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extracted Bank Movements to Conciliate */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="pb-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              Movimientos del Extracto Bancario ({selectedAccount?.banco})
            </h2>
            <p className="text-xs text-zinc-400">
              Coincidencia inteligente asistida con cobros y pagos institucionales.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 w-fit">
            {accountTrxs.filter(e => e.estado_conciliacion === 'pendiente' || e.estado_conciliacion === 'sugerida').length} Pendientes
          </span>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {accountTrxs.map(ext => {
            const isCredito = ext.credito_centavos > 0;
            const monto = isCredito ? ext.credito_centavos : ext.debito_centavos;

            return (
              <div key={ext.id} className="py-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-zinc-950/40 px-3 rounded-2xl transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs text-zinc-400">{ext.fecha}</span>
                    <span className="font-semibold text-xs text-white">{ext.descripcion}</span>
                    {ext.referencia && (
                      <span className="text-[10px] font-mono bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-lg">
                        Ref: {ext.referencia}
                      </span>
                    )}
                  </div>

                  {ext.confianza_match && ext.confianza_match > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-zinc-400">
                        Coincidencia sugerida: <strong className="text-zinc-200">{ext.descripcion}</strong>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        ext.confianza_match >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {ext.confianza_match}% Confianza
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${isCredito ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {isCredito ? '+' : '-'}{formatDOP(monto)}
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-500 capitalize">{isCredito ? 'Crédito (Entrada)' : 'Débito (Salida)'}</span>
                  </div>

                  {ext.estado_conciliacion !== 'conciliada' ? (
                    <button
                      onClick={() => handleConciliar(ext.id)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-950/50 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Conciliar</span>
                    </button>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Conciliado</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

