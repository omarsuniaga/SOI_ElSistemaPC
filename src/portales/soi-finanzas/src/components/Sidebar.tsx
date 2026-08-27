import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { computeEstadoGastoFijo } from '../lib/gastosFijos';
import {
  LayoutDashboard,
  Clock,
  CreditCard,
  Users,
  FileText,
  AlertCircle,
  Award,
  HeartHandshake,
  Wallet,
  Receipt,
  Zap,
  Truck,
  Coins,
  Landmark,
  PieChart,
  ShoppingBag,
  Briefcase,
  Guitar,
  Scale,
  BarChart3,
  TrendingUp,
  BookOpen,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Database,
  Settings,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  sidebarOpen,
  setSidebarOpen,
  isOpenMobile, 
  setIsOpenMobile 
}) => {
  const isMobileOpen = sidebarOpen ?? isOpenMobile ?? false;
  const setMobileOpen = (val: boolean) => {
    if (setSidebarOpen) setSidebarOpen(val);
    if (setIsOpenMobile) setIsOpenMobile(val);
  };

  const {
    cuotas,
    tareas,
    gastosFijos,
    gastosFijosPagos,
    periodoActivo,
    transaccionesBancarias,
    solicitudesNecesidades,
    facturasGasto,
    nomina
  } = useFinance();

  const tareasCount = tareas.filter(t => t.estado !== 'completada').length;
  const cuotasVencidasCount = cuotas.filter(c => c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < new Date()).length;

  const [gfAnio, gfMes] = periodoActivo.split('-').map(Number);
  const gfHoy = new Date().getDate();
  const gastosFijosAlertaCount = gastosFijos.filter(g => {
    if (!g.activo) return false;
    const pago = gastosFijosPagos.find(p => p.gasto_fijo_id === g.id && p.periodo_anio === gfAnio && p.periodo_mes === gfMes);
    const estado = computeEstadoGastoFijo({ diaInicio: g.dia_inicio, diaFin: g.dia_fin }, gfHoy, pago?.estado === 'pagado');
    return estado.tone === 'warn' || estado.tone === 'crit';
  }).length;
  const transaccionesPendientes = transaccionesBancarias.filter(t => t.estado_conciliacion === 'pendiente' || t.estado_conciliacion === 'sugerida').length;
  const comprasPendientes = solicitudesNecesidades.filter(s => s.estado === 'en_presupuesto' || s.estado === 'pendiente').length;
  const facturasPorAprobar = facturasGasto.filter(f => f.estado === 'recibida' || f.estado === 'validada').length;
  const nominaPendiente = nomina.filter(n => n.estado_pago !== 'aprobado' && n.estado_pago !== 'pagado').length;

  const navGroups = [
    {
      title: 'Operación & Cockpit',
      items: [
        { id: 'my_day', alias: 'my-day', label: 'Mi Día (Cockpit)', icon: Clock, badge: tareasCount > 0 ? `${tareasCount}` : undefined, badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
        { id: 'dashboard', label: 'Dashboard Financiero', icon: LayoutDashboard },
        { id: 'tareas', label: 'Tareas del Director & HERMES', icon: Sparkles, badge: tareasCount > 0 ? `${tareasCount}` : undefined, badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
      ]
    },
    {
      title: 'Ingresos & Cartera 360°',
      items: [
        { id: 'ficha_360', alias: 'ficha360', label: 'Ficha 360° Alumno (Directiva)', icon: Sparkles, badge: '360°', badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold' },
        { id: 'registro_pago', alias: 'registro-pago', label: 'Cobranza & Registro', icon: CreditCard, highlight: true },
        { id: 'familias', label: 'Familias & Cuentas 360°', icon: Users },
        { id: 'cuotas', label: 'Cuotas & Aging Cartera', icon: FileText, badge: cuotasVencidasCount > 0 ? `${cuotasVencidasCount}` : undefined, badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
        { id: 'mora_cobranza', alias: 'mora', label: 'Gestión de Mora (FIN-P13)', icon: AlertCircle },
        { id: 'becas', label: 'Becas & Exoneraciones', icon: Award },
      ]
    },
    {
      title: 'Egresos, Compras & Activos',
      items: [
        { id: 'tiendita', alias: 'procurement', label: 'Tiendita (Procurement Store)', icon: ShoppingBag, badge: 'IA', badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' },
        { id: 'facturas', label: 'Cuentas por Pagar', icon: Receipt, badge: facturasPorAprobar > 0 ? `${facturasPorAprobar}` : undefined, badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
        { id: 'gastos_fijos', alias: 'servicios_fijos', label: 'Gastos Fijos Mensuales', icon: Calendar, badge: gastosFijosAlertaCount > 0 ? `${gastosFijosAlertaCount}` : undefined, badgeClass: 'bg-rose-500 text-white font-bold animate-pulse' },
        { id: 'lutheria', alias: 'lutheria_inventario', label: 'Luthería & Comodatos (OPR)', icon: Guitar },
      ]
    },
    {
      title: 'Tesorería & Cajas',
      items: [
        { id: 'caja_diaria', alias: 'caja', label: 'Caja Diaria & Cierre (FIN-P14)', icon: Coins },
        { id: 'bancos', label: 'Bancos & Conciliación', icon: Landmark, badge: transaccionesPendientes > 0 ? `${transaccionesPendientes}` : undefined, badgeClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/20' },
      ]
    },
    {
      title: 'Presupuesto & Nómina',
      items: [
        { id: 'presupuesto', label: 'Presupuesto & Partidas', icon: PieChart },
        { id: 'nomina', label: 'Nómina Docente (INV-12)', icon: Briefcase, badge: nominaPendiente > 0 ? `${nominaPendiente}` : undefined, badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
      ]
    },
    {
      title: 'Auditoría & Integraciones',
      items: [
        { id: 'contabilidad', alias: 'asientos', label: 'Libro Diario & 14 Invariantes', icon: BookOpen },
        { id: 'supabase_settings', alias: 'supabase', label: 'Supabase & Diagnóstico', icon: Database, badge: 'RLS', badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
      ]
    }
  ];

  const handleSelect = (id: string) => {
    setActiveView(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-72 bg-zinc-950 text-zinc-300 border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Navigation Content in Bento style */}
        <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {group.title}
              </h3>
              <div className="space-y-1 mt-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id || (item.alias && activeView === item.alias);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group text-left
                        ${isActive 
                          ? 'bg-zinc-900 text-white font-semibold border border-zinc-700/80 shadow-inner' 
                          : item.highlight
                            ? 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/40 border border-indigo-800/40'
                            : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : item.highlight ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold leading-none shrink-0 ${item.badgeClass || 'bg-zinc-800 text-zinc-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & Institutional signature with Bento aesthetic */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 text-xs text-zinc-400 flex items-center justify-between">
          <div>
            <div className="font-semibold text-zinc-200 text-xs">FUNEYCA-PC</div>
            <div className="text-[10px] text-zinc-500 font-mono">Bento Architecture v1.0</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};

