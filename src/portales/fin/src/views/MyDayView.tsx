import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Coins,
  Landmark,
  Receipt,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  PlusCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { computeEstadoGastoFijo } from '../lib/gastosFijos';

interface MyDayViewProps {
  onOpenQuickPayment?: () => void;
  setActiveView: (view: string) => void;
}

export const MyDayView: React.FC<MyDayViewProps> = ({ onOpenQuickPayment, setActiveView }) => {
  const {
    currentUser,
    tareas,
    completarTarea,
    gastosFijos,
    gastosFijosPagos,
    periodoActivo,
    cuotas,
    pagos,
    facturasGasto,
    transaccionesBancarias,
    solicitudesNecesidades,
    nomina,
    cierresCaja,
    serviceBalanceStatus,
    authoritativeServiceBalances,
    serviceBalanceErrorMessage,
    serviceBalanceRefreshing,
    canRequestServiceBalanceRefresh,
    serviceBalanceRefreshOutcome,
    serviceBalanceRefreshMessage,
    requestServiceBalanceRefresh
  } = useFinance();

  const today = new Date().toISOString().split('T')[0];

  // Calculated daily metrics
  const pagosHoy = pagos.filter(p => p.fecha_pago === today);
  const totalCobradoHoy = pagosHoy.reduce((acc, p) => acc + p.monto_total_centavos, 0);

  const [mdyAnio, mdyMes] = periodoActivo.split('-').map(Number);
  const mdyHoy = new Date().getDate();
  const gastosFijosCriticos = gastosFijos.filter(g => {
    if (!g.activo) return false;
    const pago = gastosFijosPagos.find(p => p.gasto_fijo_id === g.id && p.periodo_anio === mdyAnio && p.periodo_mes === mdyMes);
    const estado = computeEstadoGastoFijo({ diaInicio: g.dia_inicio, diaFin: g.dia_fin }, mdyHoy, pago?.estado === 'pagado');
    return estado.tone === 'warn' && g.dia_fin - mdyHoy <= 3;
  });
  const facturasPendientesAprobacion = facturasGasto.filter(f => f.estado === 'recibida' || f.estado === 'validada');
  const transaccionesSinConciliar = transaccionesBancarias.filter(t => t.estado_conciliacion === 'pendiente' || t.estado_conciliacion === 'sugerida');
  const cuotasVencidasCriticas = cuotas.filter(c => c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < new Date());

  const cajaCerradaHoy = cierresCaja.some(c => c.fecha === today && c.estado === 'cerrado');
  const upcomingServiceBalances = [...authoritativeServiceBalances]
    .sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31'))
    .slice(0, 4);

  const formatServiceAmount = (amountCentavos: number | null, currencyCode: string) => {
    if (amountCentavos === null) return 'Sin balance confirmado';
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currencyCode || 'DOP',
      maximumFractionDigits: 2,
    }).format(amountCentavos / 100);
  };

  const serviceDueLabel = (daysRemaining: number | null, dueDate: string | null) => {
    if (!dueDate || daysRemaining === null) return 'Vencimiento sin confirmar';
    if (daysRemaining < 0) return `Vencido hace ${Math.abs(daysRemaining)} día(s)`;
    if (daysRemaining === 0) return 'Vence hoy';
    return `${dueDate} (${daysRemaining} día(s))`;
  };

  const handleServiceBalanceRefresh = async () => {
    await requestServiceBalanceRefresh();
  };

  const handleCobrar = () => {
    if (onOpenQuickPayment) {
      onOpenQuickPayment();
    } else {
      setActiveView('registro_pago');
    }
  };

  return (
    <div className="space-y-6">

      {/* Bento Grid Hero / Feature Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Large Bento Hero Card (col-span-2) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[11px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                Cockpit Financiero Operativo
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[11px] font-medium rounded-full border border-zinc-700/60 hidden sm:inline-block">
                Rol: {currentUser.rol.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mt-4 text-white leading-tight tracking-tight">
              Bienvenido, {currentUser.nombre}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
              Monitoreo activo de vencimientos 48h, cuadratura de ventanilla física, recaudación en tiempo real y flujo de caja institucional.
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 mt-6 sm:mt-8 pt-6 border-t border-zinc-800/80 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Recaudación en Ventanilla Hoy</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {formatDOP(totalCobradoHoy)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">({pagosHoy.length} recibos)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCobrar}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Pago en Ventanilla</span>
              </button>
              <button
                onClick={() => setActiveView('caja_diaria')}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-2xl text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{cajaCerradaHoy ? 'Caja Cerrada ✓' : 'Arqueo Caja'}</span>
              </button>
            </div>
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        </div>

        {/* Bento Side Promo / Status Card */}
        <div className="bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-900 border border-indigo-500/20 rounded-[2.5rem] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-400/30">
                Auditoría INV
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h3 className="text-lg font-semibold text-white mt-4">Integridad & Doble Partida</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              14 invariantes normativos escaneados en cada transacción contable y emisión de recibos.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Estado de Blindaje:</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Blindado
            </span>
          </div>
        </div>

      </div>

      {/* Critical Alert Ribbon if 48h Service is Due */}
      {gastosFijosCriticos.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-[2rem] p-5 text-rose-200 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-300 shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-rose-100 flex items-center gap-2">
                <span>Ventana de pago por cerrar: Gasto Fijo Esencial</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider">Urgente</span>
              </div>
              <p className="text-xs text-rose-300/80 mt-1">
                {gastosFijosCriticos.map(g => `${g.nombre} (${formatDOP(g.monto_centavos)})`).join(', ')} cierra su ventana de pago en 3 días o menos.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('gastos_fijos')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-lg shadow-rose-900/40"
          >
            <span>Gestionar Gastos Fijos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Bento Metrics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Recaudación Hoy */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-emerald-400 text-xs font-bold font-mono">DOP</span>
          </div>
          <div className="mt-4">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Recaudado Hoy</p>
            <p className="text-2xl font-semibold font-mono text-white mt-1">{formatDOP(totalCobradoHoy)}</p>
            <p className="text-[11px] text-zinc-500 mt-1">{pagosHoy.length} pagos registrados</p>
          </div>
          <button
            onClick={() => setActiveView('registro_pago')}
            className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-between w-full"
          >
            <span>Historial de Cobros</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Facturas por Aprobar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
              <Receipt className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-indigo-400 text-xs font-bold font-mono">CXP</span>
          </div>
          <div className="mt-4">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Facturas por Validar</p>
            <p className="text-2xl font-semibold text-white mt-1">{facturasPendientesAprobacion.length} Pendientes</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Monto: {formatDOP(facturasPendientesAprobacion.reduce((a, f) => a + f.monto_neto_centavos, 0))}
            </p>
          </div>
          <button
            onClick={() => setActiveView('facturas')}
            className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-between w-full"
          >
            <span>Validar Cuentas por Pagar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Conciliación Bancaria */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
              <Landmark className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-sky-400 text-xs font-bold font-mono">BPD / BR</span>
          </div>
          <div className="mt-4">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Depósitos sin Conciliar</p>
            <p className="text-2xl font-semibold text-white mt-1">{transaccionesSinConciliar.length} En Tránsito</p>
            <p className="text-[11px] text-zinc-500 mt-1">Con sugerencias automáticas de match</p>
          </div>
          <button
            onClick={() => setActiveView('bancos')}
            className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center justify-between w-full"
          >
            <span>Conciliador Asistido</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cartera Vencida */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-amber-400 text-xs font-bold font-mono">MORA</span>
          </div>
          <div className="mt-4">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Cuotas en Mora</p>
            <p className="text-2xl font-semibold text-white mt-1">{cuotasVencidasCriticas.length} Cuotas</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Saldo: {formatDOP(cuotasVencidasCriticas.reduce((a, c) => a + c.saldo_centavos, 0))}
            </p>
          </div>
          <button
            onClick={() => setActiveView('mora_cobranza')}
            className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center justify-between w-full"
          >
            <span>Gestión Humanizada (FIN-P13)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Grid: Checklist de Tareas Operativas + Vencimientos de la Semana */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Bento Tareas Institucionales del Día */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-[2.5rem] p-6 sm:p-7 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Tareas y Rutinas Operativas
                </h2>
                <p className="text-xs text-zinc-400">
                  Generadas por calendario fiscal, reglas de proceso y alertas del sistema.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700/60">
              {tareas.filter(t => t.estado === 'completada').length}/{tareas.length} Hechas
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {tareas.map(tarea => {
              const isCompleted = tarea.estado === 'completada';
              return (
                <div
                  key={tarea.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${isCompleted
                      ? 'bg-zinc-950/40 border-zinc-800/60 opacity-50'
                      : tarea.prioridad === 'critica'
                        ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => completarTarea(tarea.id)}
                      disabled={isCompleted}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-600 hover:border-emerald-400 text-transparent hover:text-emerald-400'
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                          {tarea.titulo}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tarea.prioridad === 'critica'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : tarea.prioridad === 'alta'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                          {tarea.prioridad}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {tarea.departamento_origen} → {tarea.departamento_destino}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {tarea.descripcion}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-2 font-mono">
                        <span>Límite: {tarea.fecha_limite}</span>
                        <span>· Creado por: {tarea.creada_por}</span>
                      </div>
                    </div>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => completarTarea(tarea.id)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl shrink-0 transition-colors border border-zinc-700"
                    >
                      Completar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Bento Calendario de Vencimientos de la Semana */}
        <div className="bg-zinc-900 rounded-[2.5rem] p-6 sm:p-7 border border-zinc-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Vencimientos de la Semana
                </h2>
                <p className="text-xs text-zinc-400">
                  Compromisos ineludibles y servicios.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {serviceBalanceStatus === 'loading' && (
                <p className="text-xs text-zinc-400">Consultando vencimientos canónicos…</p>
              )}

              {serviceBalanceStatus === 'empty' && (
                <p className="text-xs text-zinc-400">Aún no hay servicios migrados al balance canónico. Los borradores locales siguen disponibles en el directorio.</p>
              )}

              {(serviceBalanceStatus === 'error' || serviceBalanceStatus === 'unconfigured') && (
                <p className="text-xs text-rose-300">{serviceBalanceErrorMessage || 'No hay datos canónicos disponibles para mostrar.'}</p>
              )}

              {serviceBalanceStatus === 'online' && upcomingServiceBalances.map((service) => {
                const urgent = service.daysRemaining !== null && service.daysRemaining <= 3;
                const hasSnapshot = service.observedAt !== null;
                const amount = service.amountDueCentavos ?? service.balanceCentavos;
                return (
                  <div key={service.serviceAccountId} className={`p-3.5 rounded-2xl border ${urgent ? 'bg-amber-500/10 border-amber-500/20' : 'bg-zinc-950/70 border-zinc-800'}`}>
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-200">
                      <span className="truncate">{service.accountName}</span>
                      <span className={`font-mono text-[11px] shrink-0 ${urgent ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {serviceDueLabel(service.daysRemaining, service.dueDate)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      {hasSnapshot ? formatServiceAmount(amount, service.currencyCode) : 'Sin balance confirmado por el proveedor'}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {hasSnapshot
                        ? `Consultado: ${new Date(service.observedAt).toLocaleString('es-DO')}`
                        : service.lastStatus === 'unsupported'
                          ? `${service.providerName}: conector sin configurar`
                          : 'Pendiente de una consulta autorizada al proveedor'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 space-y-2">
            <button
              onClick={handleServiceBalanceRefresh}
              disabled={serviceBalanceRefreshing || !canRequestServiceBalanceRefresh}
              className="w-full py-2.5 bg-sky-950/50 hover:bg-sky-900/60 disabled:opacity-50 disabled:cursor-not-allowed text-sky-200 text-xs font-semibold rounded-2xl text-center transition-colors border border-sky-900/70"
            >
              {serviceBalanceRefreshing ? 'Solicitando actualización…' : 'Solicitar actualización segura'}
            </button>
            {serviceBalanceRefreshOutcome !== 'idle' && serviceBalanceRefreshMessage && (
              <p className={`text-xs ${
                serviceBalanceRefreshOutcome === 'success'
                  ? 'text-emerald-300'
                  : serviceBalanceRefreshOutcome === 'skipped'
                    ? 'text-amber-300'
                    : 'text-rose-300'
              }`}>
                {serviceBalanceRefreshMessage}
              </p>
            )}
            {!canRequestServiceBalanceRefresh && serviceBalanceStatus === 'online' && (
              <p className="text-[10px] text-zinc-500">
                La actualización manual estará disponible cuando exista un conector activo y una sesión autorizada.
              </p>
            )}
            <button
              onClick={() => setActiveView('gastos_fijos')}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-2xl text-center transition-colors border border-zinc-700"
            >
              Ver Gastos Fijos Mensuales
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
