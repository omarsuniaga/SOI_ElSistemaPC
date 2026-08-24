import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Award, 
  HeartHandshake, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Building2, 
  HelpCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { AsignarBecaModal } from '../components/AsignarBecaModal';

export const BecasView: React.FC = () => {
  const { becas, patrocinadores, alumnos, currentUser, aprobarBeca, crearSolicitudBeca } = useFinance();
  const [activeTab, setActiveTab] = useState<'becas' | 'patrocinios' | 'contabilidad_as02'>('becas');
  const [showAsignarModal, setShowAsignarModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalBecados = becas.filter(b => b.estado === 'activo').length;
  const valorTotalBecasMesCentavos = becas
    .filter(b => b.estado === 'activo')
    .reduce((acc, b) => {
      if (b.tipo === 'total') return acc + 125000;
      if (b.tipo === 'parcial_porcentaje' && b.porcentaje) return acc + (125000 * b.porcentaje) / 100;
      return acc;
    }, 0);

  const handleAsignarBeca = async (params: {
    alumno_id: string;
    porcentaje: number;
    motivo_socioeconomico: string;
    patrocinador_id?: string;
    autoAprobar?: boolean;
  }) => {
    const res = await crearSolicitudBeca({
      alumno_id: params.alumno_id,
      porcentaje: params.porcentaje,
      motivo_socioeconomico: params.motivo_socioeconomico,
    });

    if (res.success) {
      const alumno = alumnos.find(a => a.id === params.alumno_id);
      setToastMessage(
        `✓ Beca del ${params.porcentaje}% registrada exitosamente para ${alumno?.nombre_completo || 'el alumno'}.`
      );
      setTimeout(() => setToastMessage(null), 5000);
    }
    return res;
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20">
              Inversión Social & Alianzas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Programa de Becas, Exoneraciones & Patrocinios
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Registro formal de beneficios socioeconómicos, trazabilidad a donantes y contabilización transparente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-4 py-2.5 rounded-2xl border border-amber-500/20 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>{totalBecados} Alumnos Becados</span>
          </span>

          <button
            onClick={() => setShowAsignarModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl text-xs shadow-xl shadow-amber-950/50 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Asignar Beca a Alumno</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top 3 Bento KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Inversión Social Mensual</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {formatDOP(valorTotalBecasMesCentavos)} <span className="text-xs text-zinc-500 font-sans">/ mes</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">Reconocido como gasto social del programa</div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Patrocinios Comprometidos</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
            {formatDOP(patrocinadores.reduce((a, p) => a + p.monto_comprometido_anual_centavos, 0))}
          </div>
          <div className="text-[11px] text-emerald-500/80 font-mono">Grupo Puntacana, Meliá Hotels y aliados</div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-2">
          <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Aprobación Directiva</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            100% Auditada
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">Toda beca requiere firma de Dirección Ejecutiva</div>
        </div>
      </div>

      {/* Bento Tabs / Segmented Control */}
      <div className="bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 flex flex-wrap gap-1.5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('becas')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'becas'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Registro de Becas & Exoneraciones ({becas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('patrocinios')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'patrocinios'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-400" />
          <span>Donantes & Patrocinantes ({patrocinadores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contabilidad_as02')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'contabilidad_as02'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCheck className="w-4 h-4 text-indigo-400" />
          <span>Mecanismo Contable AS-02</span>
        </button>
      </div>

      {/* Tab 1: Becas List */}
      {activeTab === 'becas' && (
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-5">Alumno</th>
                  <th className="py-3 px-5">Tipo de Beca</th>
                  <th className="py-3 px-5">Motivo Socioeconómico</th>
                  <th className="py-3 px-5">Patrocinador / Fondo</th>
                  <th className="py-3 px-5">Vigencia</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5 text-right">Aprobación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {becas.map(beca => (
                  <tr key={beca.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">
                      {beca.alumno_nombre}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-amber-400">
                      {beca.tipo === 'total' ? 'Beca Completa (100%)' : `Parcial (${beca.porcentaje}%)`}
                    </td>
                    <td className="py-3.5 px-5 max-w-xs text-zinc-400 text-[11px]">
                      {beca.motivo_socioeconomico}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-300">
                      {beca.patrocinador_nombre || 'Fondo Propio FUNEYCA'}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-400 font-mono text-[11px]">
                      {beca.fecha_inicio} a {beca.fecha_fin}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        beca.estado === 'activo' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {beca.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {beca.estado === 'solicitado' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => aprobarBeca(beca.id, true)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-semibold cursor-pointer transition-colors"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => aprobarBeca(beca.id, false)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-semibold cursor-pointer transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                      {beca.estado === 'activo' && (
                        <div className="flex items-center justify-end gap-2 text-zinc-500">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Aprobada por {beca.aprobado_por_nombre || 'Dirección'}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Patrocinadores */}
      {activeTab === 'patrocinios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patrocinadores.map(pat => (
            <div key={pat.id} className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">{pat.tipo}</span>
                  <h3 className="text-base font-semibold text-white mt-0.5">{pat.nombre}</h3>
                  <p className="text-xs text-zinc-400">Contacto: {pat.contacto} ({pat.email})</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Compromiso Anual:</div>
                  <div className="text-sm font-mono font-bold text-white">
                    {formatDOP(pat.monto_comprometido_anual_centavos)}
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                {pat.notas}
              </p>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Recibido a la fecha:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatDOP(pat.monto_recibido_acumulado_centavos)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Explicación Contable AS-02 */}
      {activeTab === 'contabilidad_as02' && (
        <div className="bg-zinc-900 p-7 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2.5 text-white font-semibold text-base">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Plantilla de Asiento AS-02: Emisión de Cuota con Beca</span>
          </div>

          <p className="text-zinc-400 leading-relaxed">
            Para una cuota de RD$1,250 con beca del 25% (RD$312.50), la institución reconoce simultáneamente el valor bruto del servicio formativo, 
            la cuenta por cobrar neta real y el gasto del programa social de becas. Esto permite responder a donantes y auditorías con exactitud 
            sin inflar los ingresos netos.
          </p>

          <div className="bg-zinc-950 text-zinc-100 p-5 rounded-2xl border border-zinc-800 font-mono text-[11px] space-y-2.5">
            <div className="text-amber-400 font-bold tracking-wider">ASIENTO DE EJEMPLO (AS-02):</div>
            <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-500 uppercase text-[10px]">
              <span>Cuenta Contable</span>
              <span>Débito (RD$)</span>
              <span>Crédito (RD$)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-300">1.1.03.01 Cuentas por Cobrar Representantes (Neto)</span>
              <span className="text-emerald-400">937.50</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-300">5.1.04.01 Gasto Programa de Becas y Descuentos</span>
              <span className="text-emerald-400">312.50</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-300">4.1.01.01 Ingresos por Matrícula y Cuotas (Bruto)</span>
              <span>-</span>
              <span className="text-sky-400">1,250.00</span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-zinc-800 font-bold text-amber-300">
              <span>SUMAS IGUALES</span>
              <span>1,250.00</span>
              <span>1,250.00</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Beca a Alumno */}
      {showAsignarModal && (
        <AsignarBecaModal
          alumnos={alumnos}
          patrocinadores={patrocinadores}
          becasExistentes={becas}
          onClose={() => setShowAsignarModal(false)}
          onSubmit={handleAsignarBeca}
        />
      )}

    </div>
  );
};

