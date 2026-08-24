import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  FileText, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Filter, 
  Search,
  Layers,
  CreditCard,
  Settings,
  MessageSquare
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { useWhatsAppReminders } from '../hooks/useWhatsAppReminders';
import { WhatsAppCooldownButton } from '../components/WhatsAppCooldownButton';
import { WhatsAppReminderModal } from '../components/WhatsAppReminderModal';
import { WhatsAppReminderConfigModal } from '../components/WhatsAppReminderConfigModal';
import { Cuota } from '../types';

interface CuotasViewProps {
  setActiveView?: (view: string) => void;
}

export const CuotasView: React.FC<CuotasViewProps> = ({ setActiveView }) => {
  const { cuotas, familias, alumnos, periodoActivo, generarCuotasMensuales, iniciarCobroFamilia } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgingBucket, setSelectedAgingBucket] = useState<string>('all');
  const [genMessage, setGenMessage] = useState<string | null>(null);

  // WhatsApp Reminders state
  const {
    config,
    saveConfig,
    getCuotaCooldownState,
    registrarEnvio,
    resetearCooldown
  } = useWhatsAppReminders();

  const [selectedCuotaForReminder, setSelectedCuotaForReminder] = useState<Cuota | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const handleCobrarCuota = (famId: string, cuotaId: string) => {
    iniciarCobroFamilia(famId, cuotaId);
    if (setActiveView) {
      setActiveView('registro_pago');
    }
  };

  const today = new Date();

  // Aging calculation
  const getDaysOverdue = (vencimientoStr: string) => {
    const vDate = new Date(vencimientoStr);
    const diffTime = today.getTime() - vDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getAgingBucket = (cuota: any) => {
    if (cuota.estado === 'pagada') return 'pagada';
    const days = getDaysOverdue(cuota.fecha_vencimiento);
    if (days === 0) return 'al_dia';
    if (days <= 15) return '1-15';
    if (days <= 45) return '16-45';
    if (days <= 90) return '46-90';
    return '+90';
  };

  // Aging Metrics
  const cuotasAlDia = cuotas.filter(c => c.estado === 'pendiente' && getAgingBucket(c) === 'al_dia');
  const cuotas1_15 = cuotas.filter(c => c.estado === 'pendiente' && getAgingBucket(c) === '1-15');
  const cuotas16_45 = cuotas.filter(c => c.estado === 'pendiente' && getAgingBucket(c) === '16-45');
  const cuotas46_90 = cuotas.filter(c => c.estado === 'pendiente' && getAgingBucket(c) === '46-90');
  const cuotasMas90 = cuotas.filter(c => c.estado === 'pendiente' && getAgingBucket(c) === '+90');

  const filteredCuotas = cuotas.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchSearch = c.alumno_nombre.toLowerCase().includes(term) ||
      c.arancel_concepto.toLowerCase().includes(term) ||
      c.periodo.includes(term);

    if (!matchSearch) return false;
    if (selectedAgingBucket === 'all') return true;
    return getAgingBucket(c) === selectedAgingBucket;
  });

  const handleGenerarMes = () => {
    const res = generarCuotasMensuales(periodoActivo);
    setGenMessage(`Generación de cuotas ${periodoActivo}: ${res.generadas} cuota(s) creadas, ${res.omitidas} omitidas (ya emitidas o beca 100%).`);
    setTimeout(() => setGenMessage(null), 5000);
  };

  const handleSendReminder = (params: {
    plantillaId: string;
    plantillaNombre: string;
    telefonoDestino: string;
    mensajeEnviado: string;
  }) => {
    if (!selectedCuotaForReminder) return;

    const record = registrarEnvio({
      cuotaId: selectedCuotaForReminder.id,
      familiaId: selectedCuotaForReminder.familia_id,
      alumnoId: selectedCuotaForReminder.alumno_id,
      plantillaId: params.plantillaId,
      plantillaNombre: params.plantillaNombre,
      telefonoDestino: params.telefonoDestino,
      mensajeEnviado: params.mensajeEnviado
    });

    setReminderToast(
      `✓ Recordatorio de Vuelta #${record.total_vueltas} registrado para ${selectedCuotaForReminder.alumno_nombre}. Cronómetro circular de ${config.cooldown_horas}h iniciado.`
    );
    setTimeout(() => setReminderToast(null), 6000);
  };

  // Find family & student for selected cuota
  const activeReminderFamily = selectedCuotaForReminder
    ? familias.find(f => f.id === selectedCuotaForReminder.familia_id)
    : undefined;

  const activeReminderStudent = selectedCuotaForReminder
    ? alumnos.find(a => a.id === selectedCuotaForReminder.alumno_id)
    : undefined;

  return (
    <div className="space-y-6">
      
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Facturación & Cartera
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Gestión de Cuotas & Aging de Cartera
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Estructura de facturación de aranceles, aplicación de becas automáticas y recordatorios de WhatsApp con cooldown radial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-3.5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            title="Configurar cadencia y plantillas de WhatsApp"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">WhatsApp ({config.cooldown_horas}h)</span>
          </button>

          <button
            onClick={() => {
              if (setActiveView) setActiveView('registro_pago');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all hover:scale-102 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
          
          <button
            onClick={handleGenerarMes}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-indigo-950/50 transition-all hover:scale-102 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generar Facturación ({periodoActivo})</span>
          </button>
        </div>
      </div>

      {genMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{genMessage}</span>
        </div>
      )}

      {reminderToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2">
          <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Aging Analysis Cards (Bento Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div 
          onClick={() => setSelectedAgingBucket('al_dia')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            selectedAgingBucket === 'al_dia' ? 'bg-emerald-950/30 border-emerald-500 shadow-xl' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Corriente (Al Día)</div>
          <div className="text-base sm:text-lg font-mono font-bold text-white mt-2">
            {formatDOP(cuotasAlDia.reduce((a, c) => a + c.saldo_centavos, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">{cuotasAlDia.length} cuotas</div>
        </div>

        <div 
          onClick={() => setSelectedAgingBucket('1-15')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            selectedAgingBucket === '1-15' ? 'bg-amber-950/30 border-amber-500 shadow-xl' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">1 a 15 Días</div>
          <div className="text-base sm:text-lg font-mono font-bold text-white mt-2">
            {formatDOP(cuotas1_15.reduce((a, c) => a + c.saldo_centavos, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">{cuotas1_15.length} cuotas</div>
        </div>

        <div 
          onClick={() => setSelectedAgingBucket('16-45')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            selectedAgingBucket === '16-45' ? 'bg-orange-950/30 border-orange-500 shadow-xl' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">16 a 45 Días</div>
          <div className="text-base sm:text-lg font-mono font-bold text-white mt-2">
            {formatDOP(cuotas16_45.reduce((a, c) => a + c.saldo_centavos, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">{cuotas16_45.length} cuotas</div>
        </div>

        <div 
          onClick={() => setSelectedAgingBucket('46-90')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            selectedAgingBucket === '46-90' ? 'bg-rose-950/40 border-rose-500 shadow-xl' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">46 a 90 Días</div>
          <div className="text-base sm:text-lg font-mono font-bold text-white mt-2">
            {formatDOP(cuotas46_90.reduce((a, c) => a + c.saldo_centavos, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">{cuotas46_90.length} cuotas</div>
        </div>

        <div 
          onClick={() => setSelectedAgingBucket('+90')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            selectedAgingBucket === '+90' ? 'bg-rose-950/70 border-rose-400 shadow-xl' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider">+90 Días (Crítico)</div>
          <div className="text-base sm:text-lg font-mono font-bold text-rose-300 mt-2">
            {formatDOP(cuotasMas90.reduce((a, c) => a + c.saldo_centavos, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">{cuotasMas90.length} cuotas</div>
        </div>

        <div 
          onClick={() => setSelectedAgingBucket('all')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            selectedAgingBucket === 'all' ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-white'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">Ver Todos</div>
          <div className="text-base sm:text-lg font-mono font-bold mt-2">
            {cuotas.length} Cuotas
          </div>
          <div className="text-[10px] opacity-70 font-mono mt-1">Total cartera</div>
        </div>

      </div>

      {/* Search and Table */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar por alumno, concepto, período..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Mostrando <strong className="text-white">{filteredCuotas.length}</strong> cuotas
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-5">Alumno</th>
                <th className="py-3 px-5">Concepto / Arancel</th>
                <th className="py-3 px-5">Período</th>
                <th className="py-3 px-5">Bruto</th>
                <th className="py-3 px-5">Beca / Desc.</th>
                <th className="py-3 px-5">Neto Facturado</th>
                <th className="py-3 px-5">Saldo Pendiente</th>
                <th className="py-3 px-5">Vencimiento</th>
                <th className="py-3 px-5">Estado</th>
                <th className="py-3 px-5 text-right">Acción / Recordatorio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredCuotas.map(cuota => {
                const days = getDaysOverdue(cuota.fecha_vencimiento);
                const cooldownState = getCuotaCooldownState(cuota.id);

                return (
                  <tr key={cuota.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">
                      {cuota.alumno_nombre}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-300">
                      {cuota.arancel_concepto}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-medium text-indigo-400">
                      {cuota.periodo}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-400 font-mono">
                      {formatDOP(cuota.monto_bruto_centavos)}
                    </td>
                    <td className="py-3.5 px-5 text-emerald-400 font-mono font-medium">
                      {cuota.descuento_beca_centavos > 0 ? `-${formatDOP(cuota.descuento_beca_centavos)}` : 'RD$ 0.00'}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-white">
                      {formatDOP(cuota.monto_neto_centavos)}
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      <span className={`font-bold ${cuota.saldo_centavos > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                        {formatDOP(cuota.saldo_centavos)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      <div className="text-zinc-300">{cuota.fecha_vencimiento}</div>
                      {cuota.estado === 'pendiente' && days > 0 && (
                        <span className="text-[10px] text-rose-400 font-bold block">
                          {days} días de atraso
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        cuota.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        cuota.estado === 'parcial' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        days > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {cuota.estado === 'pagada' ? 'Pagada' : days > 0 ? 'En Mora' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {cuota.saldo_centavos > 0 ? (
                        <div className="flex items-center justify-end gap-2">
                          <WhatsAppCooldownButton
                            cooldownState={cooldownState}
                            onClick={() => setSelectedCuotaForReminder(cuota)}
                          />
                          
                          <button
                            onClick={() => handleCobrarCuota(cuota.familia_id, cuota.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Registrar Pago</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-mono">Al Día</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Reminder Composer Modal */}
      {selectedCuotaForReminder && (
        <WhatsAppReminderModal
          cuota={selectedCuotaForReminder}
          familia={activeReminderFamily}
          alumno={activeReminderStudent}
          cooldownState={getCuotaCooldownState(selectedCuotaForReminder.id)}
          config={config}
          onClose={() => setSelectedCuotaForReminder(null)}
          onSendReminder={handleSendReminder}
          onResetCooldown={() => resetearCooldown(selectedCuotaForReminder.id)}
        />
      )}

      {/* WhatsApp Settings Modal */}
      {showConfigModal && (
        <WhatsAppReminderConfigModal
          config={config}
          onClose={() => setShowConfigModal(false)}
          onSave={saveConfig}
        />
      )}

    </div>
  );
};

