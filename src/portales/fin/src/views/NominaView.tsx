import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard, 
  HelpCircle,
  FileCheck,
  Briefcase,
  DollarSign,
  Award,
  PlusCircle,
  Printer,
  X,
  Star,
  Check
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { EvaluacionPeriodoPrueba } from '../types';

export const NominaView: React.FC = () => {
  const {
    nomina,
    evaluacionesPrueba,
    currentUser,
    aprobarLineaNomina,
    dispersarNominaDocente,
    crearEvaluacionPeriodoPrueba
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'nomina' | 'evaluaciones'>('nomina');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Modal states for FIN-F09b
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [selectedEvalForView, setSelectedEvalForView] = useState<EvaluacionPeriodoPrueba | null>(null);

  // Evaluation Form State
  const [formColaborador, setFormColaborador] = useState('');
  const [formPuesto, setFormPuesto] = useState('Profesor de Cátedra Instrumental');
  const [formDepto, setFormDepto] = useState('Académico Musical (ACM)');
  const [formFechaIngreso, setFormFechaIngreso] = useState('2026-05-15');
  const [formEvaluador, setFormEvaluador] = useState(currentUser.nombre);
  const [formCalidad, setFormCalidad] = useState(4.5);
  const [formNotasCalidad, setFormNotasCalidad] = useState('Excelente técnica instrumental y metodología pedagógica.');
  const [formAsistencia, setFormAsistencia] = useState(4.8);
  const [formNotasAsistencia, setFormNotasAsistencia] = useState('Puntualidad ejemplar en ensayos y clases individuales.');
  const [formEquipo, setFormEquipo] = useState(4.6);
  const [formNotasEquipo, setFormNotasEquipo] = useState('Gran disposición y colaboración con el equipo de dirección orquestal.');
  const [formIniciativa, setFormIniciativa] = useState(4.5);
  const [formNotasIniciativa, setFormNotasIniciativa] = useState('Propone adaptaciones pedagógicas y materiales complementarios.');
  const [formFortalezas, setFormFortalezas] = useState('Compromiso institucional, afinidad con los alumnos y rigor musical.');
  const [formMejora, setFormMejora] = useState('Continuar optimizando el registro en tiempo real de bitácoras de avance.');

  const totalBrutoCentavos = nomina.reduce((acc, n) => acc + n.monto_base_centavos + n.bonos_centavos, 0);
  const totalDeduccionesCentavos = nomina.reduce((acc, n) => acc + n.retencion_tss_centavos + n.retencion_isr_centavos, 0);
  const totalNetoCentavos = nomina.reduce((acc, n) => acc + n.monto_neto_centavos, 0);

  const pendientesAprobacion = nomina.filter(n => n.estado_pago === 'borrador' || n.estado_pago === 'validado');
  const aprobadasListas = nomina.filter(n => n.estado_pago === 'aprobado');

  const liveAverage = Number(
    (formCalidad * 0.25 + formAsistencia * 0.25 + formEquipo * 0.25 + formIniciativa * 0.25).toFixed(2)
  );

  const handleApproveNomina = (nominaId: string, maestroId: string) => {
    // Segregation of duties check (INV-12)
    if (currentUser.id === maestroId && currentUser.rol === 'coordinacion') {
      setErrorNotice('Regla de Segregación (INV-12): Ningún colaborador puede aprobar o validar su propia línea de nómina.');
      setTimeout(() => setErrorNotice(null), 5000);
      return;
    }

    const res = aprobarLineaNomina(nominaId);
    if (res.success) {
      setSuccessNotice('Línea de honorarios docentes aprobada y lista para dispersión.');
      setTimeout(() => setSuccessNotice(null), 4000);
    } else {
      setErrorNotice(res.error || 'Error al procesar la nómina.');
      setTimeout(() => setErrorNotice(null), 4000);
    }
  };

  const handleDispersar = () => {
    const res = dispersarNominaDocente();
    if (res.success) {
      setSuccessNotice(`Dispersión ejecutada con éxito: ${res.dispersadas} pagos procesados (${formatDOP(res.total_neto_centavos || 0)}). Asiento AS-06 generado.`);
      setTimeout(() => setSuccessNotice(null), 6000);
    } else {
      setErrorNotice(res.error || 'Error al dispersar la nómina.');
      setTimeout(() => setErrorNotice(null), 5000);
    }
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formColaborador.trim()) {
      setErrorNotice('Por favor ingrese el nombre del colaborador a evaluar.');
      return;
    }

    const res = crearEvaluacionPeriodoPrueba({
      nombre_colaborador: formColaborador,
      puesto_trabajo: formPuesto,
      departamento: formDepto,
      fecha_ingreso: formFechaIngreso,
      nombre_evaluador: formEvaluador,
      calif_calidad: formCalidad,
      notas_calidad: formNotasCalidad,
      calif_asistencia: formAsistencia,
      notas_asistencia: formNotasAsistencia,
      calif_equipo: formEquipo,
      notas_equipo: formNotasEquipo,
      calif_iniciativa: formIniciativa,
      notas_iniciativa: formNotasIniciativa,
      fortalezas: formFortalezas,
      areas_mejora: formMejora
    });

    if (res.success && res.evaluacion) {
      setShowEvalModal(false);
      setSuccessNotice(`Evaluación FIN-F09b registrada con éxito. Dictamen: ${res.evaluacion.dictamen.toUpperCase()} (Promedio: ${res.evaluacion.promedio_ponderado}/5.0)`);
      setTimeout(() => setSuccessNotice(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Gestión de Talento & Compensaciones
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">
            Nómina Docente, Cátedras & Período de Prueba (FIN-P09 / FIN-F09b)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cálculo de honorarios, retenciones de ley (TSS/ISR), dispersión bancaria y evaluación de los 3 meses de prueba.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('nomina')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'nomina' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Planilla de Honorarios</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluaciones')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'evaluaciones' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Evaluación Período Prueba (FIN-F09b)</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* TAB 1: NÓMINA DOCENTE */}
      {activeTab === 'nomina' && (
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              Cumplimiento de la regla de segregación de funciones (INV-12): El maestro no puede auto-aprobar sus horas.
            </div>
            {aprobadasListas.length > 0 && (
              <button
                onClick={handleDispersar}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Dispersar Nómina ({aprobadasListas.length} listas / {formatDOP(totalNetoCentavos)})</span>
              </button>
            )}
          </div>

          {/* KPI Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 p-6 sm:p-7 rounded-[2.5rem] border border-zinc-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Monto Bruto Total Cátedras</span>
                <div className="w-9 h-9 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-semibold text-white font-mono tracking-tight">
                  {formatDOP(totalBrutoCentavos)}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Sueldo base y horas pedagógicas</div>
              </div>
            </div>

            <div className="bg-zinc-900 p-6 sm:p-7 rounded-[2.5rem] border border-zinc-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Retenciones Fiscales & TSS</span>
                <div className="w-9 h-9 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-semibold text-rose-400 font-mono tracking-tight">
                  {formatDOP(totalDeduccionesCentavos)}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">TSS (SFS + AFP) e ISR DGII</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-indigo-950/40 p-6 sm:p-7 rounded-[2.5rem] border border-indigo-500/30 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-300 font-medium">Total Neto a Desembolsar</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-semibold text-emerald-400 font-mono tracking-tight">
                  {formatDOP(totalNetoCentavos)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Vía dispersión electrónica BPD</div>
              </div>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-xs text-zinc-200">Planilla Consolidada de Honorarios</h2>
              <span className="text-[11px] font-mono text-zinc-500">Invariante INV-12</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-5">Docente / Músico</th>
                    <th className="py-3 px-5">Cátedra / Especialidad</th>
                    <th className="py-3 px-5">Horas Validadas</th>
                    <th className="py-3 px-5">Bruto</th>
                    <th className="py-3 px-5">Deducciones</th>
                    <th className="py-3 px-5">Neto a Cobrar</th>
                    <th className="py-3 px-5">Estado</th>
                    <th className="py-3 px-5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {nomina.map(item => (
                    <tr key={item.id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-white">{item.maestro_nombre}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">ID: {item.maestro_id}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-medium text-zinc-300">{item.especialidad}</span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-zinc-400">
                        {item.horas_trabajadas_validadas} hrs <span className="text-zinc-600">({formatDOP(item.tarifa_hora_centavos)}/h)</span>
                      </td>
                      <td className="py-3.5 px-5 text-zinc-300 font-mono">{formatDOP(item.monto_base_centavos + item.bonos_centavos)}</td>
                      <td className="py-3.5 px-5 text-rose-400 font-mono">
                        -{formatDOP(item.retencion_tss_centavos + item.retencion_isr_centavos)}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-semibold text-white">{formatDOP(item.monto_neto_centavos)}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          item.estado_pago === 'pagado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          item.estado_pago === 'aprobado' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {item.estado_pago}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {item.estado_pago !== 'aprobado' && item.estado_pago !== 'pagado' && (
                          <button
                            onClick={() => handleApproveNomina(item.id, item.maestro_id)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-semibold transition-all shadow-md shadow-indigo-950/50 cursor-pointer"
                          >
                            Aprobar Honorarios
                          </button>
                        )}
                        {item.estado_pago === 'aprobado' && (
                          <span className="text-[11px] text-sky-400 font-mono font-medium">
                            Aprobado (Listo)
                          </span>
                        )}
                        {item.estado_pago === 'pagado' && (
                          <span className="text-[11px] text-emerald-400 font-mono font-medium">
                            Liquidado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EVALUACIÓN PERÍODO DE PRUEBA (FIN-F09b) */}
      {activeTab === 'evaluaciones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="text-xs text-zinc-400">
              Evaluación legal al término de los 3 meses de prueba (FIN-P09). Escala 1.0 a 5.0 con 4 criterios ponderados al 25% cada uno.
            </div>
            <button
              onClick={() => setShowEvalModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Evaluación (FIN-F09b)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluacionesPrueba.map(e => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{e.nombre_colaborador}</h4>
                    <p className="text-zinc-400 text-xs">{e.puesto_trabajo} — {e.departamento}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    e.dictamen === 'aprobado'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : e.dictamen === 'prorroga'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {e.dictamen === 'aprobado' ? 'Contrato Definitivo' : e.dictamen === 'prorroga' ? 'Prórroga Evaluación' : 'No Aprobado'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Calidad (25%)</span>
                    <span className="font-mono font-bold text-white text-xs">{e.calif_calidad}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Asistencia (25%)</span>
                    <span className="font-mono font-bold text-white text-xs">{e.calif_asistencia}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Equipo (25%)</span>
                    <span className="font-mono font-bold text-white text-xs">{e.calif_equipo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Iniciativa (25%)</span>
                    <span className="font-mono font-bold text-white text-xs">{e.calif_iniciativa}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-400">Promedio Ponderado:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{e.promedio_ponderado} / 5.0</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Evaluador: <span className="text-zinc-300">{e.nombre_evaluador}</span>
                  </div>
                  <button
                    onClick={() => setSelectedEvalForView(e)}
                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Ver Ficha FIN-F09b</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: NUEVA EVALUACIÓN FIN-F09b */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Ficha de Evaluación de Período de Prueba (FIN-F09b)</h3>
              </div>
              <button 
                onClick={() => setShowEvalModal(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Nombre del Colaborador</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Prof. Carmen Valenzuela"
                    value={formColaborador}
                    onChange={e => setFormColaborador(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Puesto de Trabajo</label>
                  <input
                    type="text"
                    required
                    value={formPuesto}
                    onChange={e => setFormPuesto(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Departamento</label>
                  <input
                    type="text"
                    required
                    value={formDepto}
                    onChange={e => setFormDepto(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4 Weighted Criteria */}
              <div className="space-y-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Criterios de Desempeño (Escala 1.0 a 5.0 — Peso 25% c/u)</span>
                  <span className="font-mono text-amber-400 font-bold">Promedio: {liveAverage}</span>
                </div>

                {/* Criterion 1 */}
                <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t border-zinc-800/60">
                  <div className="col-span-4">
                    <span className="font-medium text-white block">1. Calidad y Competencia</span>
                    <span className="text-[10px] text-zinc-500">Rigor técnico y pedagogía</span>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={formCalidad}
                      onChange={e => setFormCalidad(Number(e.target.value))}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-center"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Observaciones de calidad..."
                      value={formNotasCalidad}
                      onChange={e => setFormNotasCalidad(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Criterion 2 */}
                <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t border-zinc-800/60">
                  <div className="col-span-4">
                    <span className="font-medium text-white block">2. Puntualidad y Asistencia</span>
                    <span className="text-[10px] text-zinc-500">Cumplimiento de horario</span>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={formAsistencia}
                      onChange={e => setFormAsistencia(Number(e.target.value))}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-center"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Observaciones de asistencia..."
                      value={formNotasAsistencia}
                      onChange={e => setFormNotasAsistencia(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Criterion 3 */}
                <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t border-zinc-800/60">
                  <div className="col-span-4">
                    <span className="font-medium text-white block">3. Trabajo en Equipo</span>
                    <span className="text-[10px] text-zinc-500">Sinergia y respeto mutuo</span>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={formEquipo}
                      onChange={e => setFormEquipo(Number(e.target.value))}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-center"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Observaciones de equipo..."
                      value={formNotasEquipo}
                      onChange={e => setFormNotasEquipo(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Criterion 4 */}
                <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t border-zinc-800/60">
                  <div className="col-span-4">
                    <span className="font-medium text-white block">4. Iniciativa y Proactividad</span>
                    <span className="text-[10px] text-zinc-500">Aportes a la institución</span>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={formIniciativa}
                      onChange={e => setFormIniciativa(Number(e.target.value))}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-center"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Observaciones de iniciativa..."
                      value={formNotasIniciativa}
                      onChange={e => setFormNotasIniciativa(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Fortalezas Destacadas</label>
                  <textarea
                    rows={2}
                    value={formFortalezas}
                    onChange={e => setFormFortalezas(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Áreas de Mejora</label>
                  <textarea
                    rows={2}
                    value={formMejora}
                    onChange={e => setFormMejora(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Registrar Evaluación FIN-F09b
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZADOR FIN-F09b OFICIAL */}
      {selectedEvalForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Dirección de Recursos Humanos</div>
                <h3 className="font-bold text-white text-base">EVALUACIÓN DE PERÍODO DE PRUEBA (FIN-F09b)</h3>
              </div>
              <button 
                onClick={() => setSelectedEvalForView(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div>
                <span className="text-zinc-500 block text-[10px]">COLABORADOR:</span>
                <span className="font-bold text-white">{selectedEvalForView.nombre_colaborador}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">PUESTO:</span>
                <span className="text-zinc-300">{selectedEvalForView.puesto_trabajo}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">FECHA EVALUACIÓN:</span>
                <span className="text-zinc-300">{selectedEvalForView.fecha_evaluacion}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">DICTAMEN:</span>
                <span className="font-bold uppercase text-amber-400">{selectedEvalForView.dictamen}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-1">
                Calificaciones Ponderadas
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-zinc-900 rounded-xl">
                  <strong>1. Calidad:</strong> {selectedEvalForView.calif_calidad}/5.0
                  <p className="text-zinc-400 text-[11px] mt-0.5">{selectedEvalForView.notas_calidad}</p>
                </div>
                <div className="p-2.5 bg-zinc-900 rounded-xl">
                  <strong>2. Asistencia:</strong> {selectedEvalForView.calif_asistencia}/5.0
                  <p className="text-zinc-400 text-[11px] mt-0.5">{selectedEvalForView.notas_asistencia}</p>
                </div>
                <div className="p-2.5 bg-zinc-900 rounded-xl">
                  <strong>3. Equipo:</strong> {selectedEvalForView.calif_equipo}/5.0
                  <p className="text-zinc-400 text-[11px] mt-0.5">{selectedEvalForView.notas_equipo}</p>
                </div>
                <div className="p-2.5 bg-zinc-900 rounded-xl">
                  <strong>4. Iniciativa:</strong> {selectedEvalForView.calif_iniciativa}/5.0
                  <p className="text-zinc-400 text-[11px] mt-0.5">{selectedEvalForView.notas_iniciativa}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 rounded-xl text-xs space-y-1">
              <div><strong>Fortalezas:</strong> {selectedEvalForView.fortalezas}</div>
              <div><strong>Áreas de Mejora:</strong> {selectedEvalForView.areas_mejora}</div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-800 text-center text-xs">
              <div className="border-t border-zinc-700 pt-2">
                <div className="font-semibold text-white">{selectedEvalForView.nombre_evaluador}</div>
                <div className="text-[10px] text-zinc-500">Evaluador Directo</div>
              </div>
              <div className="border-t border-zinc-700 pt-2">
                <div className="font-semibold text-white">Dirección General</div>
                <div className="text-[10px] text-zinc-500">Visto Bueno RRHH / Dirección</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ficha Oficial FIN-F09b</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

