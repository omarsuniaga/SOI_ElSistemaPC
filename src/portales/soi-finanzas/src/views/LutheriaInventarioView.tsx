import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatDOP } from '../lib/financialMath';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import {
  Wrench,
  Guitar,
  FileText,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  User,
  Users,
  Search,
  Check,
  X,
  Clock,
  Droplets,
  Thermometer,
  Lock,
  Layers,
  Sparkles,
  QrCode,
  FileCheck
} from 'lucide-react';
import { FichaDiagnosticoLutheria, ContratoComodato } from '../types';

export const LutheriaInventarioView: React.FC = () => {
  const {
    activos,
    fichasLutheria,
    contratosComodato,
    currentUser,
    alumnos,
    familias,
    representantes,
    crearFichaLutheria,
    aprobarFichaLutheria,
    crearContratoComodato
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'taller' | 'comodatos' | 'deposito'>('taller');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDano, setFilterDano] = useState<string>('todos');

  // Modal states
  const [showFichaModal, setShowFichaModal] = useState(false);
  const [showComodatoModal, setShowComodatoModal] = useState(false);
  const [selectedFichaForView, setSelectedFichaForView] = useState<FichaDiagnosticoLutheria | null>(null);
  const [selectedComodatoForView, setSelectedComodatoForView] = useState<ContratoComodato | null>(null);

  // Success / error notice
  const [notice, setNotice] = useState<string | null>(null);

  // Form states for New Ficha FIN-F18
  const [formCodigo, setFormCodigo] = useState('INST-VN-0042');
  const [formTipo, setFormTipo] = useState('Violín 4/4');
  const [formMarca, setFormMarca] = useState('Yamaha V5SC');
  const [formSerie, setFormSerie] = useState('YVN-99281');
  const [formAlumno, setFormAlumno] = useState('');
  const [formProfesor, setFormProfesor] = useState('Prof. Marcos Rosario');
  const [formReporte, setFormReporte] = useState('');
  const [formEvaluacion, setFormEvaluacion] = useState('');
  const [formClasificacion, setFormClasificacion] = useState<'menor' | 'mayor' | 'critico'>('menor');
  const [formTrabajos, setFormTrabajos] = useState('');
  const [formRepuestos, setFormRepuestos] = useState<Array<{ cantidad: number; descripcion: string; costo_unitario: number }>>([
    { cantidad: 1, descripcion: '', costo_unitario: 0 }
  ]);

  // Form states for New Comodato FIN-F19b
  const [comodatoAlumnoId, setComodatoAlumnoId] = useState(alumnos[0]?.id || '');
  const [comodatoCodigo, setComodatoCodigo] = useState('INST-VN-0042');
  const [comodatoInstrumento, setComodatoInstrumento] = useState('Violín 4/4');
  const [comodatoMarca, setComodatoMarca] = useState('Yamaha V5');
  const [comodatoSerie, setComodatoSerie] = useState('YVN-8849201');
  const [comodatoValorLibros, setComodatoValorLibros] = useState(28000);
  const [comodatoFechaInicio, setComodatoFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [comodatoFechaFin, setComodatoFechaFin] = useState('2026-12-15');

  // Calculate totals for metrics
  const totalReparaciones = fichasLutheria.length;
  const reparacionesPendientesAprobacion = fichasLutheria.filter(f => f.requiere_aprobacion_financiera && f.aprobacion_financiera_estado === 'pendiente').length;
  const totalComodatosVigentes = contratosComodato.filter(c => c.estado === 'vigente').length;
  const totalValorComodatosCentavos = contratosComodato.reduce((acc, c) => acc + (c.estado === 'vigente' ? c.valor_estimado_libros_centavos : 0), 0);

  // Filtered fichas
  const filteredFichas = fichasLutheria.filter(f => {
    const matchesSearch = f.numero_ficha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.codigo_patrimonial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tipo_instrumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.alumno_asociado_nombre && f.alumno_asociado_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDano = filterDano === 'todos' || f.clasificacion_dano === filterDano;
    return matchesSearch && matchesDano;
  });

  const handleAddRepuestoLine = () => {
    setFormRepuestos([...formRepuestos, { cantidad: 1, descripcion: '', costo_unitario: 0 }]);
  };

  const handleRemoveRepuestoLine = (index: number) => {
    setFormRepuestos(formRepuestos.filter((_, i) => i !== index));
  };

  const handleRepuestoChange = (index: number, field: string, value: any) => {
    const updated = [...formRepuestos];
    updated[index] = { ...updated[index], [field]: value };
    setFormRepuestos(updated);
  };

  const calculateFormTotalCost = () => {
    return formRepuestos.reduce((acc, r) => acc + (Number(r.cantidad || 0) * Number(r.costo_unitario || 0)), 0);
  };

  const handleSubmitFicha = (e: React.FormEvent) => {
    e.preventDefault();
    const repuestosFormatted = formRepuestos
      .filter(r => r.descripcion.trim() !== '')
      .map(r => ({
        cantidad: Number(r.cantidad),
        descripcion: r.descripcion,
        costo_unitario_centavos: Math.round(Number(r.costo_unitario) * 100),
        costo_total_centavos: Math.round(Number(r.cantidad) * Number(r.costo_unitario) * 100)
      }));

    const res = crearFichaLutheria({
      codigo_patrimonial: formCodigo,
      tipo_instrumento: formTipo,
      marca_modelo: formMarca,
      numero_serie: formSerie,
      alumno_asociado_nombre: formAlumno.trim() || undefined,
      profesor_catedra: formProfesor,
      reporte_usuario: formReporte,
      evaluacion_luthier: formEvaluacion,
      clasificacion_dano: formClasificacion,
      trabajos_planificados: formTrabajos,
      repuestos: repuestosFormatted
    });

    if (res.success && res.ficha) {
      setShowFichaModal(false);
      setNotice(`Ficha ${res.ficha.numero_ficha} creada con éxito.${res.ficha.requiere_aprobacion_financiera ? ' Requiere aprobación financiera (>= RD$3,000).' : ''}`);
      setTimeout(() => setNotice(null), 6000);
      // Reset form
      setFormReporte('');
      setFormEvaluacion('');
      setFormTrabajos('');
      setFormRepuestos([{ cantidad: 1, descripcion: '', costo_unitario: 0 }]);
    }
  };

  const handleApproveFicha = (fichaId: string, approved: boolean) => {
    const res = aprobarFichaLutheria(fichaId, approved);
    if (res.success) {
      setNotice(`Ficha actualizada: ${approved ? 'Autorizada financieramente.' : 'Rechazada.'}`);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleSubmitComodato = (e: React.FormEvent) => {
    e.preventDefault();
    const alumno = alumnos.find(a => a.id === comodatoAlumnoId);
    const rep = representantes.find(r => r.familia_id === alumno?.familia_id) || representantes[0];

    const res = crearContratoComodato({
      nombre_representante: rep ? rep.nombre_completo : 'Representante Legal',
      nacionalidad_representante: 'Dominicana',
      estado_civil_representante: 'Soltero/a',
      cedula_representante: rep ? rep.cedula : '001-0000000-0',
      direccion_representante: 'La Altagracia, República Dominicana',
      nombre_estudiante: alumno ? alumno.nombre_completo : 'Estudiante',
      alumno_id: comodatoAlumnoId,
      tipo_instrumento: comodatoInstrumento,
      marca_modelo: comodatoMarca,
      numero_serie: comodatoSerie,
      codigo_patrimonial: comodatoCodigo,
      valor_estimado_libros_centavos: Math.round(comodatoValorLibros * 100),
      fecha_inicio: comodatoFechaInicio,
      fecha_termino: comodatoFechaFin,
    });

    if (res.success && res.contrato) {
      setShowComodatoModal(false);
      setNotice(`Contrato de Comodato ${res.contrato.numero_contrato} emitido formalmente con firma hash.`);
      setTimeout(() => setNotice(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Header Banner Bento */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Guitar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Luthería, Depósito & Comodatos (FIN-P18 / FIN-P19 / OPR-P10)
              </h1>
              <p className="text-xs text-zinc-400">
                Gobernanza del taller de mantenimiento, control ambiental de sede y contratos de préstamo patrimonial.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('taller')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'taller' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Taller & Diagnósticos (FIN-F18)</span>
            {reparacionesPendientesAprobacion > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white font-bold rounded-full animate-pulse">
                {reparacionesPendientesAprobacion}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('comodatos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'comodatos' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Comodatos (FIN-F19b)</span>
          </button>

          <button
            onClick={() => setActiveTab('deposito')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deposito' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Depósito & Clima (OPR-P11)</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: TALLER DE LUTHERÍA & DIAGNÓSTICOS (FIN-F18) */}
      {activeTab === 'taller' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="text-zinc-400 text-xs font-medium">Diagnósticos Registrados</div>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{totalReparaciones}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Historial acumulado del taller</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="text-zinc-400 text-xs font-medium">Límite Autónomo Kalani</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">&lt; RD$ 3,000</div>
              <div className="text-[11px] text-emerald-500/80 mt-1">Ejecución directa in-house (FIN-P18 §3)</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="text-zinc-400 text-xs font-medium">Por Autorizar (&ge; RD$ 3k)</div>
              <div className={`text-2xl font-bold mt-1 font-mono ${reparacionesPendientesAprobacion > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {reparacionesPendientesAprobacion}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Supervisión Katherine Sánchez</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="text-zinc-400 text-xs font-medium">Activos en Mantenimiento</div>
              <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                {activos.filter(a => a.estado_uso === 'en_reparacion').length}
              </div>
              <div className="text-[11px] text-amber-500/80 mt-1">Calibración y banco de trabajo</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por ficha, instrumento, placa o alumno..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={filterDano}
                onChange={e => setFilterDano(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="todos">Todos los Daños</option>
                <option value="menor">Daño Menor (&lt;48h)</option>
                <option value="mayor">Daño Mayor (&lt;10d)</option>
                <option value="critico">Daño Crítico (Baja)</option>
              </select>
            </div>

            <button
              onClick={() => setShowFichaModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Ficha de Luthería (FIN-F18)</span>
            </button>
          </div>

          {/* List of Fichas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
              <div className="text-xs font-semibold text-zinc-300">
                Libro Maestro de Intervenciones & Reparaciones
              </div>
              <div className="text-xs font-mono text-zinc-500">
                Mostrando {filteredFichas.length} registros
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/30">
                    <th className="p-3.5 font-medium">No. Ficha / Fecha</th>
                    <th className="p-3.5 font-medium">Activo & Cátedra</th>
                    <th className="p-3.5 font-medium">Diagnóstico & Daño</th>
                    <th className="p-3.5 font-medium">Presupuesto</th>
                    <th className="p-3.5 font-medium">Aprobación Financiera</th>
                    <th className="p-3.5 font-medium">Estado</th>
                    <th className="p-3.5 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredFichas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-500">
                        No se encontraron fichas de luthería con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredFichas.map(f => {
                      const isHighCost = f.costo_total_centavos >= 300000;
                      return (
                        <tr key={f.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-amber-400">{f.numero_ficha}</div>
                            <div className="text-zinc-500 text-[11px]">{f.fecha_ingreso}</div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-white">{f.tipo_instrumento}</div>
                            <div className="text-zinc-400 font-mono text-[11px]">{f.codigo_patrimonial} — {f.marca_modelo}</div>
                            {f.alumno_asociado_nombre && (
                              <div className="text-indigo-400 text-[10px] flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3" />
                                <span>{f.alumno_asociado_nombre}</span>
                              </div>
                            )}
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                f.clasificacion_dano === 'menor'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : f.clasificacion_dano === 'mayor'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {f.clasificacion_dano === 'menor' ? 'Daño Menor (<48h)' : f.clasificacion_dano === 'mayor' ? 'Daño Mayor (<10d)' : 'Daño Crítico (Baja)'}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-[11px] truncate mt-1" title={f.evaluacion_luthier}>
                              {f.evaluacion_luthier}
                            </p>
                          </td>

                          <td className="p-3.5">
                            <div className="font-mono font-bold text-white">{formatDOP(f.costo_total_centavos)}</div>
                            <div className="text-zinc-500 text-[10px]">
                              {f.repuestos.length} repuesto(s)
                            </div>
                          </td>

                          <td className="p-3.5">
                            {f.requiere_aprobacion_financiera ? (
                              <div>
                                {f.aprobacion_financiera_estado === 'autorizado' ? (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1 w-fit">
                                    <Check className="w-3 h-3" />
                                    <span>Autorizado Finanzas</span>
                                  </span>
                                ) : f.aprobacion_financiera_estado === 'rechazado' ? (
                                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1 w-fit">
                                    <X className="w-3 h-3" />
                                    <span>Rechazado</span>
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-semibold flex items-center gap-1 w-fit">
                                      <Clock className="w-3 h-3 animate-spin" />
                                      <span>Pendiente Katherine Sánchez</span>
                                    </span>
                                    {(currentUser.rol === 'finanzas' || currentUser.rol === 'director') && (
                                      <div className="flex items-center gap-1 pt-1">
                                        <button
                                          onClick={() => handleApproveFicha(f.id, true)}
                                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                                        >
                                          Autorizar
                                        </button>
                                        <button
                                          onClick={() => handleApproveFicha(f.id, false)}
                                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded text-[10px] font-bold cursor-pointer"
                                        >
                                          Rechazar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-500 text-[10px] font-mono">Autónomo (&lt; RD$ 3k)</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.estado_activo_final === 'reparado_calibrado'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : f.estado_activo_final === 'desincorporado_baja'
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {f.estado_activo_final === 'reparado_calibrado' ? 'Reparado & Apto' : f.estado_activo_final === 'desincorporado_baja' ? 'Baja Patrimonial (AS-07)' : 'En Intervención'}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedFichaForView(f)}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span>Ver Ficha FIN-F18</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMODATOS DE INSTRUMENTOS (FIN-F19b) */}
      {activeTab === 'comodatos' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="text-zinc-400 text-xs font-medium">Contratos Vigentes (FIN-F19b)</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{totalComodatosVigentes}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Préstamos en custodia de familias</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="text-zinc-400 text-xs font-medium">Valor Patrimonial en Custodia</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{formatDOP(totalValorComodatosCentavos)}</div>
              <div className="text-[11px] text-emerald-500/80 mt-1">Respaldado con Cláusula Sexta (Reposición)</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="text-zinc-400 text-xs font-medium">Firma Criptográfica SHA-256</div>
              <div className="text-2xl font-bold text-sky-400 mt-1 font-mono">100% Validada</div>
              <div className="text-[11px] text-sky-500/80 mt-1">Consentimiento digital no repudiable</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="text-xs text-zinc-400">
              Contratos formales de préstamo de uso gratuito según las disposiciones del Código Civil de la República Dominicana.
            </div>
            <button
              onClick={() => setShowComodatoModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Contrato Comodato (FIN-F19b)</span>
            </button>
          </div>

          {/* Comodato Cards Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contratosComodato.map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                      <Guitar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.tipo_instrumento}</h4>
                      <div className="text-zinc-400 font-mono text-[11px]">{c.codigo_patrimonial} — {c.marca_modelo}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                    Vigente
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Estudiante Comodatario:</span>
                    <span className="font-semibold text-white">{c.nombre_estudiante}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Representante Legal:</span>
                    <span className="font-semibold text-zinc-300">{c.nombre_representante}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">{c.cedula_representante}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Valor en Libros (Reposición):</span>
                    <span className="font-mono font-bold text-emerald-400">{formatDOP(c.valor_estimado_libros_centavos)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Vigencia Académica:</span>
                    <span className="font-mono text-zinc-300">{c.fecha_inicio} al {c.fecha_termino}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>HASH CRIPTOGRÁFICO FIRMA DIGITAL:</span>
                    <span className="text-indigo-400">SHA-256</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 truncate">
                    {c.hash_firma_sha256}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Contrato: <span className="text-zinc-300">{c.numero_contrato}</span>
                  </div>
                  <button
                    onClick={() => setSelectedComodatoForView(c)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ver / Imprimir Contrato</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEPÓSITO & CONTROL AMBIENTAL (OPR-P11) */}
      {activeTab === 'deposito' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hygrometer Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-white text-sm">Humedad Relativa Depósito</h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold">
                  Rango Óptimo
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-bold text-white font-mono">52%</div>
                <div className="text-xs text-zinc-400 font-mono">Rango Seguro: 45% - 60%</div>
              </div>

              <div className="w-full bg-zinc-950 rounded-full h-2.5 border border-zinc-800 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '52%' }} />
              </div>

              <p className="text-[11px] text-zinc-400">
                La madera de contrabajos y chelos se mantiene protegida de hinchazón o rajaduras armónicas (OPR-P11 §3).
              </p>
            </div>

            {/* Dehumidifier Status Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Deshumidificador 24h</h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold animate-pulse">
                  Activo
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Primer Vaciado (10:00 AM):</span>
                  <span className="text-emerald-400 font-bold font-mono">Completado (Kalani)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Segundo Vaciado (17:30 PM):</span>
                  <span className="text-amber-400 font-bold font-mono">Programado</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Temperatura Sala:</span>
                  <span className="text-white font-bold font-mono">22.4 °C</span>
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400">
                Alerta roja automática si la humedad supera el 60% por más de 48h continuas.
              </div>
            </div>

            {/* Storage Security Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">Seguridad & Protocolo</h3>
                </div>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-bold">
                  Doble Candado
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Regla de Oro: Cero atriles o instrumentos a la intemperie.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Auditoría AGT-OPR a las 18:00 PM para cierre diario.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Custodia de llave en caja fuerte de oficina.</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-zinc-500">
                Responsable del Depósito: Kalani (Luthier Sede)
              </div>
            </div>
          </div>

          {/* Physical Layout Sections Bento */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Distribución por Secciones del Depósito (OPR-P11 §4)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-bold text-amber-400">Sección A: Cuerdas Graves</div>
                <p className="text-zinc-400 text-[11px]">
                  Racks acolchados especiales de piso para Contrabajos y Violonchelos. Prohibido apoyar contra pared.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-bold text-indigo-400">Sección B: Cuerdas Agudas</div>
                <p className="text-zinc-400 text-[11px]">
                  Estantería modular suspendida para estuches de Violines y Violas organizados por tamaños (4/4, 3/4, 1/2).
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-bold text-sky-400">Sección C: Vientos</div>
                <p className="text-zinc-400 text-[11px]">
                  Estantería metálica cerrada hermética para flautas, oboes, trompetas y trombones con estuches sellados.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400">Sección D: Mobiliario</div>
                <p className="text-zinc-400 text-[11px]">
                  Racks rodantes para 100+ atriles metálicos plegables y sillas de orquesta bajo resguardo diario.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA FICHA DIAGNÓSTICO FIN-F18 */}
      {showFichaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Ficha de Ingreso y Diagnóstico de Luthería (FIN-F18)</h3>
              </div>
              <button 
                onClick={() => setShowFichaModal(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFicha} className="space-y-4 text-xs">
              {/* Asset Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Código Patrimonial</label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={e => setFormCodigo(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tipo de Instrumento</label>
                  <input
                    type="text"
                    required
                    value={formTipo}
                    onChange={e => setFormTipo(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Marca / Modelo</label>
                  <input
                    type="text"
                    required
                    value={formMarca}
                    onChange={e => setFormMarca(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Número de Serie</label>
                  <input
                    type="text"
                    value={formSerie}
                    onChange={e => setFormSerie(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Alumno Asociado (Comodato / Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Mateo Santana"
                    value={formAlumno}
                    onChange={e => setFormAlumno(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Profesor / Cátedra</label>
                  <input
                    type="text"
                    required
                    value={formProfesor}
                    onChange={e => setFormProfesor(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Damage & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Reporte de Falla Manifestada</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Clavija de La se desliza, puente doblado..."
                    value={formReporte}
                    onChange={e => setFormReporte(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Clasificación del Daño</label>
                  <select
                    value={formClasificacion}
                    onChange={e => setFormClasificacion(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                  >
                    <option value="menor">Daño Menor (SLA &lt; 48h)</option>
                    <option value="mayor">Daño Mayor (SLA &lt; 10d)</option>
                    <option value="critico">Daño Crítico (Baja Técnica)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Evaluación Técnica del Luthier (Kalani)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detalles sobre encolados, calibración de acción, alma, cejilla..."
                  value={formEvaluacion}
                  onChange={e => setFormEvaluacion(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Trabajos Planificados</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rectificación de cejilla, reemplazo de cuerdas y prueba de sonido..."
                  value={formTrabajos}
                  onChange={e => setFormTrabajos(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Repuestos Breakdown */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300">Materiales y Repuestos de Luthería</label>
                  <button
                    type="button"
                    onClick={handleAddRepuestoLine}
                    className="text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer"
                  >
                    + Agregar Repuesto
                  </button>
                </div>

                {formRepuestos.map((r, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Cant."
                        value={r.cantidad}
                        onChange={e => handleRepuestoChange(index, 'cantidad', Number(e.target.value))}
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-center font-mono"
                      />
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Descripción del repuesto (ej. Cuerda Mi, Puente Aubert)..."
                        value={r.descripcion}
                        onChange={e => handleRepuestoChange(index, 'descripcion', e.target.value)}
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Costo Unit (RD$)"
                        value={r.costo_unitario}
                        onChange={e => handleRepuestoChange(index, 'costo_unitario', Number(e.target.value))}
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-right"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      {formRepuestos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRepuestoLine(index)}
                          className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 mt-2">
                  <span className="text-zinc-400 font-medium">Costo Total Estimado:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm">{formatDOP(calculateFormTotalCost() * 100)}</span>
                    {calculateFormTotalCost() >= 3000 ? (
                      <span className="block text-[10px] text-amber-400 font-semibold">
                        &ge; RD$ 3,000 &rarr; Requiere Aprobación Katherine Sánchez (FIN-P18 §3)
                      </span>
                    ) : (
                      <span className="block text-[10px] text-emerald-400 font-semibold">
                        &lt; RD$ 3,000 &rarr; Ejecución Autónoma Kalani
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowFichaModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Guardar Ficha FIN-F18
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO COMODATO FIN-F19b */}
      {showComodatoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">Emisión de Contrato de Comodato (FIN-F19b)</h3>
              </div>
              <button 
                onClick={() => setShowComodatoModal(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitComodato} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Seleccionar Alumno Comodatario</label>
                <select
                  value={comodatoAlumnoId}
                  onChange={e => setComodatoAlumnoId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none font-mono"
                >
                  {alumnos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre_completo} ({a.instrumento_principal})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Código Patrimonial</label>
                  <input
                    type="text"
                    required
                    value={comodatoCodigo}
                    onChange={e => setComodatoCodigo(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tipo de Instrumento</label>
                  <input
                    type="text"
                    required
                    value={comodatoInstrumento}
                    onChange={e => setComodatoInstrumento(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Marca y Modelo</label>
                  <input
                    type="text"
                    required
                    value={comodatoMarca}
                    onChange={e => setComodatoMarca(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Valor en Libros (RD$)</label>
                  <input
                    type="number"
                    required
                    value={comodatoValorLibros}
                    onChange={e => setComodatoValorLibros(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={comodatoFechaInicio}
                    onChange={e => setComodatoFechaInicio(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Fecha Término</label>
                  <input
                    type="date"
                    required
                    value={comodatoFechaFin}
                    onChange={e => setComodatoFechaFin(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1 text-[11px] text-zinc-400">
                <div className="font-semibold text-zinc-200">Garantía Legal V9 (Código Civil Dominicano):</div>
                <p>
                  Incluye Cláusula Quinta (Rescisión automática por 3 faltas injustificadas) y Cláusula Sexta (Reposición en efectivo del valor en libros en caso de daño o extravío).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowComodatoModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Emitir Contrato & Firma SHA-256
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZADOR OFICIAL FICHA FIN-F18 */}
      {selectedFichaForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-zinc-100 print:text-black">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Documento Oficial V9</div>
                <h2 className="text-base font-bold text-white">FICHA DE INGRESO Y DIAGNÓSTICO DE LUTHERÍA (FIN-F18)</h2>
              </div>
              <button 
                onClick={() => setSelectedFichaForView(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div>
                <span className="text-zinc-500 block text-[10px]">NÚMERO DE FICHA:</span>
                <span className="font-bold text-amber-400">{selectedFichaForView.numero_ficha}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">FECHA DE INGRESO:</span>
                <span className="text-white">{selectedFichaForView.fecha_ingreso}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">LUTHIER ASIGNADO:</span>
                <span className="text-white">{selectedFichaForView.luthier_nombre}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">CÁTEDRA / PROFESOR:</span>
                <span className="text-white">{selectedFichaForView.profesor_catedra}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-1">
                1. Identificación del Activo
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Código Patrimonial:</span>
                  <span className="font-mono font-bold text-white">{selectedFichaForView.codigo_patrimonial}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Instrumento:</span>
                  <span className="text-zinc-200">{selectedFichaForView.tipo_instrumento}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Marca / Modelo:</span>
                  <span className="text-zinc-200">{selectedFichaForView.marca_modelo}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Número de Serie:</span>
                  <span className="font-mono text-zinc-200">{selectedFichaForView.numero_serie || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-1">
                2. Diagnóstico Técnico y Evaluación
              </h4>
              <p className="text-zinc-300">
                <strong className="text-zinc-400">Reporte del Usuario:</strong> {selectedFichaForView.reporte_usuario}
              </p>
              <p className="text-zinc-300">
                <strong className="text-zinc-400">Evaluación Luthier:</strong> {selectedFichaForView.evaluacion_luthier}
              </p>
              <div className="pt-1">
                <span className="font-semibold text-zinc-400">Clasificación: </span>
                <span className="font-mono uppercase font-bold text-amber-400">{selectedFichaForView.clasificacion_dano}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-1">
                3. Materiales y Presupuesto de Reparación
              </h4>
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px]">
                    <th className="pb-1">Cant.</th>
                    <th className="pb-1">Descripción del Repuesto</th>
                    <th className="pb-1 text-right">Costo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {selectedFichaForView.repuestos.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1">{r.cantidad}</td>
                      <td className="py-1">{r.descripcion}</td>
                      <td className="py-1 text-right">{formatDOP(r.costo_total_centavos)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold text-white">
                    <td colSpan={2} className="pt-2 text-right">Total Presupuesto:</td>
                    <td className="pt-2 text-right text-amber-400">{formatDOP(selectedFichaForView.costo_total_centavos)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-800 text-center text-xs">
              <div className="border-t border-zinc-700 pt-2">
                <div className="font-semibold text-white">{selectedFichaForView.luthier_nombre}</div>
                <div className="text-[10px] text-zinc-500">Luthier Sede / Taller</div>
              </div>
              <div className="border-t border-zinc-700 pt-2">
                <div className="font-semibold text-white">
                  {selectedFichaForView.aprobado_por_nombre || 'Katherine Sánchez'}
                </div>
                <div className="text-[10px] text-zinc-500">Aprobación Financiera (ADM_FIN)</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ficha Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZADOR CONTRATO COMODATO FIN-F19b */}
      {selectedComodatoForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Documento Legal Dominicano</div>
                <h3 className="font-bold text-white text-base">CONTRATO DE COMODATO DE INSTRUMENTO (FIN-F19b)</h3>
              </div>
              <button 
                onClick={() => setSelectedComodatoForView(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs space-y-2 leading-relaxed">
              <p>
                Entre <strong>EL SISTEMA PUNTA CANA</strong> (EL COMODANTE) y el señor/señora <strong>{selectedComodatoForView.nombre_representante}</strong> (Cédula: <strong>{selectedComodatoForView.cedula_representante}</strong>), actuando en representación legal del menor <strong>{selectedComodatoForView.nombre_estudiante}</strong> (EL COMODATARIO).
              </p>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1 font-mono text-[11px]">
                <div><strong>Activo:</strong> {selectedComodatoForView.tipo_instrumento} ({selectedComodatoForView.marca_modelo})</div>
                <div><strong>Código Patrimonial:</strong> {selectedComodatoForView.codigo_patrimonial}</div>
                <div><strong>Valor en Libros:</strong> {formatDOP(selectedComodatoForView.valor_estimado_libros_centavos)}</div>
                <div><strong>Vigencia:</strong> {selectedComodatoForView.fecha_inicio} hasta {selectedComodatoForView.fecha_termino}</div>
              </div>

              <p className="text-[11px] text-zinc-400">
                <strong>Cláusula Quinta:</strong> Causal de rescisión y devolución obligatoria en 48 horas si el estudiante acumula tres (3) inasistencias consecutivas injustificadas.
              </p>

              <p className="text-[11px] text-zinc-400">
                <strong>Cláusula Sexta:</strong> En caso de pérdida, robo o destrucción, EL COMODATARIO se compromete a la reposición de un instrumento idéntico o el pago en efectivo del valor estimado en libros ({formatDOP(selectedComodatoForView.valor_estimado_libros_centavos)}).
              </p>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div className="text-[10px] text-zinc-500 font-mono">SELLO CRIPTOGRÁFICO DE CONSENTIMIENTO DIGITAL (SHA-256):</div>
              <div className="text-[10px] font-mono text-indigo-400 break-all">{selectedComodatoForView.hash_firma_sha256}</div>
            </div>

            {/* Signature blocks */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-zinc-800 text-center text-xs">
              <div className="border-t border-zinc-700 pt-2">
                <div className="font-semibold text-white">Dirección Ejecutiva</div>
                <div className="text-[10px] text-zinc-500">El Sistema Punta Cana (EL COMODANTE)</div>
              </div>
              <div className="border-t border-zinc-700 pt-2">
                <div className="font-semibold text-white">{selectedComodatoForView.nombre_representante}</div>
                <div className="text-[10px] text-zinc-500">Cédula: {selectedComodatoForView.cedula_representante} (EL COMODATARIO)</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Contrato Notariable</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
