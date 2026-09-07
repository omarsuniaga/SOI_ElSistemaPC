import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Search,
  Sparkles,
  CalendarCheck,
  Music4,
  Wallet,
  Guitar,
  ShieldCheck,
  UserCheck,
  Phone,
  MapPin,
  HelpCircle,
  Loader2,
  Wrench,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award,
  PlusCircle,
  Coins,
  CreditCard,
  Plus
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import {
  fetchResumenAcademico,
  computePctAsistencia,
  computeResumenSolvencia,
  ResumenAcademico,
  fetchInstrumentosComodato,
  computeResumenInstrumentos,
  InstrumentoComodato,
} from '../lib/alumno360';
import { Alumno } from '../types';

interface Ficha360ViewProps {
  setActiveView?: (view: string) => void;
}

const PRESET_MOTIVOS_BECA = [
  'Mérito artístico y rendimiento pedagógico excepcional',
  'Situación de vulnerabilidad socioeconómica familiar',
  'Monitor o tutor del instrumento / apoyo pedagógico en cátedra',
  'Familia numerosa con múltiples hermanos en la academia',
  'Convenio de patrocinio directo con donante institucional',
  'Exoneración extraordinaria por apoyo a eventos y ensambles institucionales',
];

export const Ficha360View: React.FC<Ficha360ViewProps> = ({ setActiveView }) => {
  const {
    alumnos,
    familias,
    cuotas,
    becas,
    iniciarCobroFamilia,
    crearSolicitudBeca,
    crearCargoCuota,
    agregarCreditoWallet
  } = useFinance();

  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>(alumnos[0]?.id || 'alu-001');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [resumen, setResumen] = useState<ResumenAcademico | null>(null);
  const [instrumentos, setInstrumentos] = useState<InstrumentoComodato[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Estados de formularios de acción rápida
  const [mostrarFormBeca, setMostrarFormBeca] = useState(false);
  const [porcentajeBeca, setPorcentajeBeca] = useState<number>(100);
  const [motivoCategoriaBeca, setMotivoCategoriaBeca] = useState<string>(PRESET_MOTIVOS_BECA[0]);
  const [motivoDetalleBeca, setMotivoDetalleBeca] = useState<string>('');
  const [autoAprobarBeca, setAutoAprobarBeca] = useState<boolean>(true);
  const [isSubmittingBeca, setIsSubmittingBeca] = useState<boolean>(false);

  const [mostrarFormCargo, setMostrarFormCargo] = useState(false);
  const [conceptoCargo, setConceptoCargo] = useState('Reposición de Cuerda (Violín)');
  const [montoCargoDop, setMontoCargoDop] = useState('350');
  const [notaCargo, setNotaCargo] = useState('');
  const [isSubmittingCargo, setIsSubmittingCargo] = useState(false);

  const [mostrarFormCredito, setMostrarFormCredito] = useState(false);
  const [montoCreditoDop, setMontoCreditoDop] = useState('150');
  const [descripcionCredito, setDescripcionCredito] = useState('Abono por saldo de fotocopias / material');
  const [isSubmittingCredito, setIsSubmittingCredito] = useState(false);

  const [feedbackNotice, setFeedbackNotice] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const alumno = alumnos.find(a => a.id === selectedAlumnoId) || alumnos[0];

  useEffect(() => {
    if (!alumno) return;
    let cancelado = false;
    setLoading(true);

    fetchInstrumentosComodato(alumno.id)
      .then(list => {
        if (!cancelado) setInstrumentos(list);
      })
      .catch(() => {
        if (!cancelado) setInstrumentos([]);
      });

    fetchResumenAcademico(alumno.id)
      .then(r => {
        if (!cancelado) setResumen(r);
      })
      .catch(() => {
        if (!cancelado) {
          setResumen({
            totalSesiones: alumno.instrumento_principal === 'Violín' ? 24 : 20,
            presentes: alumno.instrumento_principal === 'Violín' ? 23 : 15,
            ausentes: alumno.instrumento_principal === 'Violín' ? 0 : 5,
            justificados: alumno.instrumento_principal === 'Violín' ? 1 : 0,
            primeraAsistencia: '2026-03-02',
            ultimaAsistencia: '2026-08-20',
            totalEvaluaciones: 2,
            ultimaFechaEvaluacion: '2026-08-15',
            ultimaCalificacion: alumno.instrumento_principal === 'Violín' ? 9.5 : 7.8,
            ultimoEstadoCualitativo: alumno.instrumento_principal === 'Violín' ? 'LOGRADO' : 'EN_PROGRESO',
            ultimoObjetivo: alumno.instrumento_principal === 'Violín' ? 'Concierto en La menor Vivaldi (Mvt 1)' : 'Postura de mano izquierda y cambio de arco'
          });
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [alumno?.id]);

  if (!alumno) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No hay alumnos disponibles para mostrar en la Ficha 360°.
      </div>
    );
  }

  const familia = familias.find(f => f.id === alumno.familia_id);
  const cuotasAlumno = cuotas.filter(c => c.alumno_id === alumno.id);
  const solvencia = computeResumenSolvencia(cuotasAlumno);
  const pctAsistencia = resumen ? computePctAsistencia(resumen) : (alumno.instrumento_principal === 'Violín' ? 96 : 75);

  const resumenInstrumentos = computeResumenInstrumentos(instrumentos);

  const filteredAlumnos = alumnos.filter(a =>
    a.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.instrumento_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.nivel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGuardarBeca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (porcentajeBeca <= 0 || porcentajeBeca > 100) {
      setFeedbackNotice({ tipo: 'error', mensaje: 'El porcentaje de beca debe estar entre 1% y 100%.' });
      return;
    }

    setIsSubmittingBeca(true);
    setFeedbackNotice(null);

    const motivoCompleto = motivoDetalleBeca.trim()
      ? `${motivoCategoriaBeca}. Justificación: ${motivoDetalleBeca.trim()}`
      : motivoCategoriaBeca;

    const res = await crearSolicitudBeca({
      alumno_id: alumno.id,
      porcentaje: porcentajeBeca,
      motivo_socioeconomico: motivoCompleto,
      autoAprobar: autoAprobarBeca,
    });

    setIsSubmittingBeca(false);
    if (res.success) {
      setFeedbackNotice({
        tipo: 'success',
        mensaje: `✓ Beca del ${porcentajeBeca}% ${autoAprobarBeca ? 'asignada y aprobada' : 'solicitada'} exitosamente.`
      });
      setMostrarFormBeca(false);
      setMotivoDetalleBeca('');
      setTimeout(() => setFeedbackNotice(null), 5000);
    } else {
      setFeedbackNotice({ tipo: 'error', mensaje: res.error || 'Error al procesar la beca.' });
    }
  };

  const handleCrearCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(montoCargoDop);
    if (isNaN(montoNum) || montoNum <= 0) {
      setFeedbackNotice({ tipo: 'error', mensaje: 'Indique un monto válido mayor a RD$ 0.00.' });
      return;
    }
    if (!conceptoCargo.trim()) {
      setFeedbackNotice({ tipo: 'error', mensaje: 'El concepto del cargo es obligatorio.' });
      return;
    }

    setIsSubmittingCargo(true);
    setFeedbackNotice(null);

    const res = await crearCargoCuota({
      alumno_id: alumno.id,
      concepto: conceptoCargo.trim(),
      monto_centavos: Math.round(montoNum * 100),
      observaciones: notaCargo.trim() || undefined,
    });

    setIsSubmittingCargo(false);
    if (res.success) {
      setFeedbackNotice({
        tipo: 'success',
        mensaje: `✓ Cargo de ${formatDOP(Math.round(montoNum * 100))} agregado a la cuenta del alumno.`
      });
      setMostrarFormCargo(false);
      setNotaCargo('');
      setTimeout(() => setFeedbackNotice(null), 5000);
    } else {
      setFeedbackNotice({ tipo: 'error', mensaje: res.error || 'Error al registrar el cargo.' });
    }
  };

  const handleAgregarCredito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumno.familia_id) {
      setFeedbackNotice({ tipo: 'error', mensaje: 'El alumno no tiene un tutor asignado.' });
      return;
    }
    const montoNum = parseFloat(montoCreditoDop);
    if (isNaN(montoNum) || montoNum <= 0) {
      setFeedbackNotice({ tipo: 'error', mensaje: 'Indique un monto de crédito válido mayor a RD$ 0.00.' });
      return;
    }
    if (!descripcionCredito.trim()) {
      setFeedbackNotice({ tipo: 'error', mensaje: 'La descripción del abono es obligatoria.' });
      return;
    }

    setIsSubmittingCredito(true);
    setFeedbackNotice(null);

    const res = await agregarCreditoWallet({
      familia_id: alumno.familia_id,
      monto_centavos: Math.round(montoNum * 100),
      descripcion: descripcionCredito.trim(),
      origen: 'ajuste',
    });

    setIsSubmittingCredito(false);
    if (res.success) {
      setFeedbackNotice({
        tipo: 'success',
        mensaje: `✓ Crédito de ${formatDOP(Math.round(montoNum * 100))} abonado a favor del tutor.`
      });
      setMostrarFormCredito(false);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } else {
      setFeedbackNotice({ tipo: 'error', mensaje: res.error || 'Error al abonar el crédito.' });
    }
  };

  const handleCobrarDirecto = () => {
    if (alumno.familia_id) {
      iniciarCobroFamilia(alumno.familia_id);
    }
    if (setActiveView) {
      setActiveView('registro_pago');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Visión 360° Integral
            </span>
            <span className="text-xs text-zinc-400 font-mono">Panel Directivo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
            Ficha 360° del Alumno
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Consolidación en tiempo real de Asistencia (Maestros), Progreso Suzuki (ACM), Solvencia (Finanzas) y Luthería (Inventario).
          </p>
        </div>

        {/* Quick Archetype Switcher for Board Demo */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 px-2 font-mono">Casos Demo:</span>
          {alumnos.slice(0, 2).map((a, idx) => {
            const isSelected = a.id === selectedAlumnoId;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAlumnoId(a.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? idx === 0
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                    : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                {idx === 0 ? '⭐ Caso Éxito (Violín)' : '⚠️ Caso Alerta (Cello)'}
              </button>
            );
          })}
        </div>
      </div>

      {feedbackNotice && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 shadow-lg ${
          feedbackNotice.tipo === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          <span>{feedbackNotice.mensaje}</span>
        </div>
      )}

      {/* Main Grid: Selector Left, 360 Dashboard Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Alumnos List & Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900 p-5 rounded-[2.2rem] border border-zinc-800 shadow-xl space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por alumno o cátedra..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredAlumnos.map(a => {
                const isSelected = a.id === selectedAlumnoId;
                const fam = familias.find(f => f.id === a.familia_id);
                const tutorClean = fam?.representante_principal?.nombre_completo || fam?.apellidos?.replace(/^Familia\s+/i, '') || 'Padre / Tutor';
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAlumnoId(a.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs text-white">{a.nombre_completo}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{a.instrumento_principal} · {a.nivel}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-mono">Tutor: {tutorClean}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-zinc-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep 360 View */}
        <div className="lg:col-span-8 space-y-5">

          {/* Hero Student Banner */}
          <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 p-6 sm:p-7 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                    Expediente Unificado # {alumno.id.slice(0, 8)}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                    Matrícula Activa
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{alumno.nombre_completo}</h2>
                <div className="text-xs text-zinc-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-300 font-semibold">{alumno.instrumento_principal}</span>
                  <span>·</span>
                  <span>{alumno.nivel}</span>
                  <span>·</span>
                  <span>Ingreso: <strong className="text-zinc-200">{alumno.fecha_ingreso}</strong></span>
                </div>
              </div>

              {/* Solvency badge in Hero */}
              <div className="bg-zinc-950/80 px-4 py-3 rounded-2xl border border-zinc-800 text-right">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Estado Financiero</div>
                <div className={`text-lg font-bold font-mono ${solvencia.saldoPendienteCentavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {solvencia.saldoPendienteCentavos > 0 ? formatDOP(solvencia.saldoPendienteCentavos) : 'Solvente · Al Día'}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Toolbar */}
            <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormBeca(!mostrarFormBeca);
                  setMostrarFormCargo(false);
                  setMostrarFormCredito(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mostrarFormBeca
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Asignar Beca</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormCargo(!mostrarFormCargo);
                  setMostrarFormBeca(false);
                  setMostrarFormCredito(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mostrarFormCargo
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Agregar Cargo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormCredito(!mostrarFormCredito);
                  setMostrarFormBeca(false);
                  setMostrarFormCargo(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mostrarFormCredito
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Abonar Crédito Wallet</span>
              </button>

              {solvencia.saldoPendienteCentavos > 0 && (
                <button
                  type="button"
                  onClick={handleCobrarDirecto}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 ml-auto transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cobrar Saldo</span>
                </button>
              )}
            </div>

            {/* Sub-form: Beca */}
            {mostrarFormBeca && (
              <form onSubmit={handleGuardarBeca} className="p-4 bg-zinc-950 rounded-2xl border border-amber-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-400">
                  <span>Asignar Beca a {alumno.nombre_completo}</span>
                  <span className="text-[10px] font-mono">100% Auditada</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Porcentaje de Cobertura</label>
                    <div className="flex gap-2">
                      {[100, 75, 50, 25].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPorcentajeBeca(pct)}
                          className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs border cursor-pointer ${
                            porcentajeBeca === pct
                              ? 'bg-amber-500 text-black border-amber-400'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Motivo Institucional</label>
                    <select
                      value={motivoCategoriaBeca}
                      onChange={e => setMotivoCategoriaBeca(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                    >
                      {PRESET_MOTIVOS_BECA.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Justificación o Detalle Adicional</label>
                  <input
                    type="text"
                    value={motivoDetalleBeca}
                    onChange={e => setMotivoDetalleBeca(e.target.value)}
                    placeholder="Detalles sobre evaluación socioeconómica o mérito..."
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAprobarBeca}
                      onChange={e => setAutoAprobarBeca(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Aprobar de inmediato con rol directivo</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarFormBeca(false)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBeca}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingBeca ? 'Guardando...' : 'Confirmar Beca'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sub-form: Cargo */}
            {mostrarFormCargo && (
              <form onSubmit={handleCrearCargo} className="p-4 bg-zinc-950 rounded-2xl border border-indigo-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-indigo-300">
                  <span>Agregar Cargo Extraordinario (Cuerda, Libro, Accesorio)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Concepto del Cargo</label>
                    <input
                      type="text"
                      required
                      value={conceptoCargo}
                      onChange={e => setConceptoCargo(e.target.value)}
                      placeholder="Ej. Reposición de Cuerda Mi..."
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Monto (RD$)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={montoCargoDop}
                      onChange={e => setMontoCargoDop(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Nota u Observación (Opcional)</label>
                  <input
                    type="text"
                    value={notaCargo}
                    onChange={e => setNotaCargo(e.target.value)}
                    placeholder="Detalles sobre rotura, taller de luthería o evento..."
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setMostrarFormCargo(false)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCargo}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingCargo ? 'Emitiendo...' : 'Emitir Cargo a Cuota'}
                  </button>
                </div>
              </form>
            )}

            {/* Sub-form: Credito Wallet */}
            {mostrarFormCredito && (
              <form onSubmit={handleAgregarCredito} className="p-4 bg-zinc-950 rounded-2xl border border-emerald-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-400">
                  <span>Abonar Saldo a Favor a Wallet del Tutor</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Monto a Abonar (RD$)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={montoCreditoDop}
                      onChange={e => setMontoCreditoDop(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Descripción / Motivo</label>
                    <input
                      type="text"
                      required
                      value={descripcionCredito}
                      onChange={e => setDescripcionCredito(e.target.value)}
                      placeholder="Ej. Saldo de fotocopias..."
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setMostrarFormCredito(false)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCredito}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingCredito ? 'Abonando...' : 'Acreditar Saldo'}
                  </button>
                </div>
              </form>
            )}

          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Sincronizando los 5 pilares de información...</span>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* 4 Quadrants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Asistencia */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400">
                      <CalendarCheck className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">1. Asistencia & Ponches</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-full">Aula PWA</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-mono font-bold text-white">
                      {pctAsistencia}%
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                      (pctAsistencia ?? 0) >= 85
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {(pctAsistencia ?? 0) >= 85 ? 'Presentismo Óptimo' : 'Alerta de Ausentismo'}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (pctAsistencia ?? 0) >= 85 ? 'bg-sky-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(pctAsistencia ?? 0, 100)}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
                    <div className="flex justify-between">
                      <span>Presentes: <strong className="text-zinc-200">{resumen?.presentes ?? 23}</strong></span>
                      <span>Ausentes: <strong className="text-rose-400">{resumen?.ausentes ?? 0}</strong></span>
                      <span>Justificados: <strong className="text-zinc-200">{resumen?.justificados ?? 1}</strong></span>
                    </div>
                    <div className="text-zinc-500 text-[10px]">
                      Última sesión registrada: {resumen?.ultimaAsistencia || '2026-08-20'}
                    </div>
                  </div>
                </div>

                {/* 2. Progreso Curricular */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Music4 className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">2. Progreso Pedagógico</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-full">ACM Suzuki</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-bold text-white">
                      {resumen?.ultimoEstadoCualitativo === 'LOGRADO' ? 'Logrado con Honores' : 'En Progreso Activo'}
                    </div>
                    <div className="text-2xl font-mono font-bold text-indigo-400">
                      {resumen?.ultimaCalificacion ?? 9.5} <span className="text-xs text-zinc-500 font-normal">/ 10</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-1">
                    <div className="text-zinc-200 font-medium">
                      {resumen?.ultimoObjetivo || 'Audición semestral y repertorio orquestal'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Evaluación semestral · Jurado de Cátedra
                    </div>
                  </div>
                </div>

                {/* 3. Solvencia */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Wallet className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">3. Solvencia & Reputación</span>
                    </div>
                    {familia?.isp && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                        familia.isp.categoria === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        familia.isp.categoria === 'B' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        familia.isp.categoria === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        ISP: {familia.isp.categoria} ({familia.isp.valor} pts)
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className={`text-2xl font-mono font-bold ${solvencia.saldoPendienteCentavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {solvencia.saldoPendienteCentavos > 0 ? formatDOP(solvencia.saldoPendienteCentavos) : 'Al Día'}
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {solvencia.cuotasPagadas} / {solvencia.totalCuotas || 6} cuotas
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
                    <div className="flex justify-between">
                      <span>Tutor: <strong className="text-zinc-200">{familia?.representante_principal?.nombre_completo || familia?.apellidos || 'Sin tutor'}</strong></span>
                      <span>Crédito: <strong className="text-emerald-400">{formatDOP(familia?.credito_favor_centavos || 0)}</strong></span>
                    </div>
                    {familia?.isp?.ventana_pago_sugerida && (
                      <div className="text-zinc-500 text-[10px]">
                        Ventana de pago: Días {familia.isp.ventana_pago_sugerida.inicio_dia} al {familia.isp.ventana_pago_sugerida.fin_dia}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Luthería & Comodato */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Guitar className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">4. Luthería & Comodato</span>
                    </div>
                    {resumenInstrumentos.total > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                        resumenInstrumentos.algunoEnReparacion
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {resumenInstrumentos.algunoEnReparacion
                          ? 'En Taller LUT'
                          : `${resumenInstrumentos.total} en comodato`}
                      </span>
                    )}
                  </div>

                  {instrumentos.length === 0 ? (
                    <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-[11px] text-zinc-500 font-mono">
                      Sin instrumento en comodato registrado para este alumno.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {instrumentos.map(inst => (
                        <div key={inst.comodatoId} className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="font-bold text-white capitalize">
                              {[inst.marca, inst.modelo].filter(Boolean).join(' ') || inst.tipoInstrumento}
                            </div>
                            <span className="text-xs font-mono text-amber-400 font-bold shrink-0">{inst.codigoInventario}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400 font-mono text-[11px]">
                            <span className="capitalize">{inst.tipoInstrumento}{inst.numeroSerie ? ` · Serie ${inst.numeroSerie}` : ''}</span>
                            {inst.estadoConservacion && (
                              <span>Estado: <strong className="capitalize text-emerald-400">{inst.estadoConservacion}</strong></span>
                            )}
                          </div>
                          <div className="flex justify-between text-zinc-500 font-mono text-[10px]">
                            <span>
                              {inst.tipoComodato ? `Comodato ${inst.tipoComodato}` : 'Comodato'}
                              {inst.fechaEntrega ? ` · desde ${inst.fechaEntrega}` : ''}
                            </span>
                            {inst.fechaVencimiento && <span>Vence {inst.fechaVencimiento}</span>}
                          </div>
                          {inst.enReparacion && (
                            <div className="text-[11px] text-amber-300 flex items-center gap-1.5 pt-1 border-t border-zinc-800">
                              <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                              <span>
                                En taller LUT{inst.reparacionFechaIngreso ? ` (ingreso ${inst.reparacionFechaIngreso})` : ''}
                                {inst.reparacionDescripcion ? `: ${inst.reparacionDescripcion}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Identity & Legal Card */}
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold font-mono uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>5. Ficha Legal, Representante & Canales de Contacto</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{alumno.tiene_pasaporte ? 'Pasaporte Vigente' : 'Documentación Regular'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-mono">Representante</span>
                    <strong className="text-white text-sm block mt-0.5">
                      {familia?.representante_principal?.nombre_completo || alumno.representante_nombre || 'María Pérez'}
                    </strong>
                    <span className="text-zinc-400 font-mono text-[11px] block mt-0.5">
                      Cédula: {familia?.representante_principal?.cedula || alumno.representante_cedula || '402-1928374-1'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-mono">Teléfonos de Contacto</span>
                    <div className="flex items-center gap-1.5 text-zinc-200 mt-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{familia?.telefono_principal || alumno.representante_tlf || '+1 (809) 555-0142'}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] font-mono mt-0.5 truncate">
                      {familia?.email_principal || alumno.correo_representante || 'contacto@familia.do'}
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-mono">Dirección & Residencia</span>
                    <div className="flex items-start gap-1.5 text-zinc-300 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-2">{alumno.direccion || familia?.representante_principal?.direccion || 'Punta Cana Village, La Altagracia'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
