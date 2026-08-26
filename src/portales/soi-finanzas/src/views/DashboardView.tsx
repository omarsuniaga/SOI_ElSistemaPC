import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  DollarSign, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PieChart, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { formatDOP, formatUSD } from '../lib/financialMath';

interface DashboardViewProps {
  setActiveView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { 
    cuentasBancarias, 
    cuotas, 
    pagos, 
    facturasGasto, 
    partidas, 
    familias, 
    nomina,
    patrocinadores
  } = useFinance();

  // 1. Balances Bancarios
  const totalBancos = cuentasBancarias.reduce((acc, c) => acc + c.saldo_libro_centavos, 0);
  
  // 2. Obligaciones Comprometidas (Facturas aprobadas o pendientes + nómina estimada)
  const facturasPendientesMonto = facturasGasto.filter(f => f.estado !== 'pagada' && f.estado !== 'anulada')
    .reduce((acc, f) => acc + f.monto_neto_centavos, 0);
  const nominaPendienteMonto = nomina.filter(n => n.estado_pago !== 'pagado')
    .reduce((acc, n) => acc + n.monto_neto_centavos, 0);
  const totalComprometido = facturasPendientesMonto + nominaPendienteMonto;

  // 3. Liquidez Realmente Disponible (SDD §21 & §22)
  const liquidezRealmenteDisponible = Math.max(0, totalBancos - totalComprometido);

  // 4. Cartera de Cuentas por Cobrar
  const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente' || c.estado === 'parcial');
  const totalCuentasPorCobrar = cuotasPendientes.reduce((acc, c) => acc + c.saldo_centavos, 0);
  
  const today = new Date();
  const cuotasVencidas = cuotasPendientes.filter(c => new Date(c.fecha_vencimiento) < today);
  const totalCarteraVencida = cuotasVencidas.reduce((acc, c) => acc + c.saldo_centavos, 0);
  const totalCarteraAlDia = totalCuentasPorCobrar - totalCarteraVencida;

  // 5. Recaudación del Ciclo
  const totalRecaudado = pagos.reduce((acc, p) => acc + p.monto_total_centavos, 0);
  const totalFacturadoBruto = cuotas.reduce((acc, c) => acc + c.monto_neto_centavos, 0);
  const tasaCobranza = totalFacturadoBruto > 0 ? (totalRecaudado / totalFacturadoBruto) * 100 : 100;

  // 6. ISP Breakdown
  const catA = familias.filter(f => f.isp.categoria === 'A').length;
  const catB = familias.filter(f => f.isp.categoria === 'B').length;
  const catC = familias.filter(f => f.isp.categoria === 'C').length;
  const catD = familias.filter(f => f.isp.categoria === 'D').length;
  const catE = familias.filter(f => f.isp.categoria === 'E').length;
  const catSinHistorial = familias.filter(f => f.isp.categoria === 'SIN_HISTORIAL').length;

  return (
    <div className="space-y-6">
      
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Analítica Global
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Dashboard de Salud Financiera
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Matriz de liquidez disponible, solvencia familiar (ISP) y control presupuestario FUNEYCA-PC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('contabilidad')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-semibold transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditor de 14 Invariantes</span>
          </button>
        </div>
      </div>

      {/* Top Liquidity Matrix - Bento Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total en Bancos */}
        <div className="bg-zinc-900 rounded-[2.2rem] p-6 border border-zinc-800 relative overflow-hidden shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="uppercase tracking-wider text-[11px]">Saldo Total en Bancos</span>
              <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20">
                <Landmark className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-white mt-3">
              {formatDOP(totalBancos)}
            </div>
            <div className="text-xs text-zinc-500 mt-2 font-mono flex flex-col gap-0.5">
              <span>BPD: {formatDOP(cuentasBancarias[0]?.saldo_libro_centavos || 0)}</span>
              <span>Banreservas: {formatDOP(cuentasBancarias[1]?.saldo_libro_centavos || 0)}</span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">Extractos conciliados</span>
            <button 
              onClick={() => setActiveView('bancos')}
              className="text-sky-400 font-semibold hover:text-sky-300 flex items-center gap-1"
            >
              <span>Ver bancos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Obligaciones Comprometidas */}
        <div className="bg-zinc-900 rounded-[2.2rem] p-6 border border-zinc-800 relative overflow-hidden shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="uppercase tracking-wider text-[11px]">Obligaciones Comprometidas</span>
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-rose-400 mt-3">
              {formatDOP(totalComprometido)}
            </div>
            <div className="text-xs text-zinc-500 mt-2 font-mono flex flex-col gap-0.5">
              <span>CXP pendientes: {formatDOP(facturasPendientesMonto)}</span>
              <span>Nómina docente: {formatDOP(nominaPendienteMonto)}</span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">Fondos ya reservados</span>
            <button 
              onClick={() => setActiveView('facturas')}
              className="text-rose-400 font-semibold hover:text-rose-300 flex items-center gap-1"
            >
              <span>Ver compromisos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Liquidez Libre y Disponible (Bento Highlight Card) */}
        <div className="bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-900 text-white rounded-[2.2rem] p-6 border border-indigo-500/30 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="uppercase tracking-wider text-[11px] text-indigo-300">Liquidez Realmente Disponible</span>
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                <ShieldCheck className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-3">
              {formatDOP(liquidezRealmenteDisponible)}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Saldo libre de compromisos para imprevistos, compras e inversión.
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Margen operativo seguro</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
              100% Solvente
            </span>
          </div>
        </div>

      </div>

      {/* Row 2: Bento Grid 2 Columns (Cartera CxC + ISP Solvencia) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Bento Cartera de Matrícula (col-span-2) */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-[2.5rem] p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div>
              <h2 className="text-base font-semibold text-white">
                Estado de Cartera de Matrícula (CxC)
              </h2>
              <p className="text-xs text-zinc-400">
                Total facturado pendiente y segmentación de morosidad escolar.
              </p>
            </div>
            <button
              onClick={() => setActiveView('cuotas')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 w-fit flex items-center gap-1"
            >
              <span>Ver Cartera Detallada</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-zinc-950/70 rounded-2xl border border-zinc-800">
              <div className="text-zinc-400 text-xs font-medium">Cuentas por Cobrar Total</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{formatDOP(totalCuentasPorCobrar)}</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">{cuotasPendientes.length} cuotas abiertas</div>
            </div>

            <div className="p-4 bg-zinc-950/70 rounded-2xl border border-emerald-900/30">
              <div className="text-emerald-400 text-xs font-medium">Cartera Al Día</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{formatDOP(totalCarteraAlDia)}</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">Con vencimiento en plazo</div>
            </div>

            <div className="p-4 bg-zinc-950/70 rounded-2xl border border-rose-900/30">
              <div className="text-rose-400 text-xs font-medium">Cartera Vencida (Mora)</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">{formatDOP(totalCarteraVencida)}</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">{cuotasVencidas.length} cuotas vencidas</div>
            </div>
          </div>

          {/* Progress Bar of Collection */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-zinc-400">Eficacia de Recaudación del Ciclo Activo</span>
              <span className="font-mono font-bold text-emerald-400">{tasaCobranza.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden flex border border-zinc-800 p-0.5">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-md shadow-indigo-500/50" 
                style={{ width: `${Math.min(100, tasaCobranza)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Bento Solvencia ISP */}
        <div className="bg-zinc-900 rounded-[2.5rem] p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-4">
          <div className="pb-3 border-b border-zinc-800/80">
            <h2 className="text-base font-semibold text-white">
              Solvencia Escolar (ISP)
            </h2>
            <p className="text-xs text-zinc-400">
              {familias.length} familias categorizadas por historial.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] border border-emerald-500/30">A</span>
                <span className="font-medium text-zinc-200">Excelente (90-100)</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">{catA} fam</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px] border border-sky-500/30">B</span>
                <span className="font-medium text-zinc-200">Bueno (75-89)</span>
              </div>
              <span className="font-mono font-bold text-sky-400">{catB} fam</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">C</span>
                <span className="font-medium text-zinc-200">Regular (55-74)</span>
              </div>
              <span className="font-mono font-bold text-amber-400">{catC} fam</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[10px] border border-orange-500/30">D</span>
                <span className="font-medium text-zinc-200">Atención (35-54)</span>
              </div>
              <span className="font-mono font-bold text-orange-400">{catD} fam</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px] border border-rose-500/30">E</span>
                <span className="font-medium text-zinc-200">Crítico (&lt;35)</span>
              </div>
              <span className="font-mono font-bold text-rose-400">{catE} fam</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Bento Presupuesto Institucional */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div>
            <h2 className="text-base font-semibold text-white">
              Ejecución Presupuestaria Anual 2026
            </h2>
            <p className="text-xs text-zinc-400">
              Presupuestado vs. Comprometido vs. Pagado por Centro de Costo institucional.
            </p>
          </div>
          <button
            onClick={() => setActiveView('presupuesto')}
            className="text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 rounded-xl border border-zinc-700 w-fit"
          >
            Ver Partidas Detalladas
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {partidas.map(partida => {
            const pctEjecutado = (partida.pagado_centavos / partida.monto_anual_centavos) * 100;
            const pctComprometido = (partida.comprometido_centavos / partida.monto_anual_centavos) * 100;
            return (
              <div key={partida.id} className="p-4 bg-zinc-950/70 rounded-2xl border border-zinc-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-200">{partida.codigo_partida} · {partida.nombre}</span>
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {partida.centro_costo}
                    </span>
                  </div>
                  <div className="text-zinc-400 font-mono text-[11px]">
                    <span className="text-zinc-200 font-bold">{formatDOP(partida.pagado_centavos)}</span> de {formatDOP(partida.monto_anual_centavos)}
                    <span className="text-emerald-400 font-bold ml-2">(Disp: {formatDOP(partida.disponible_centavos)})</span>
                  </div>
                </div>

                <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden flex border border-zinc-800">
                  <div 
                    className="bg-indigo-500 h-full" 
                    style={{ width: `${pctEjecutado}%` }}
                    title={`Ejecutado: ${pctEjecutado.toFixed(1)}%`}
                  />
                  <div 
                    className="bg-amber-400 h-full" 
                    style={{ width: `${pctComprometido}%` }}
                    title={`Comprometido: ${pctComprometido.toFixed(1)}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

