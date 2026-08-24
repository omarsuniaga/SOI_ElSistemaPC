import React, { useState, useMemo } from 'react';
import {
  X,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  HeartHandshake,
  Percent,
  Sparkles,
  Check,
  Building2,
  Calendar
} from 'lucide-react';
import { Alumno, Patrocinador, Beca } from '../types';
import { formatDOP } from '../lib/financialMath';

interface AsignarBecaModalProps {
  alumnos: Alumno[];
  patrocinadores: Patrocinador[];
  becasExistentes: Beca[];
  onClose: () => void;
  onSubmit: (params: {
    alumno_id: string;
    porcentaje: number;
    motivo_socioeconomico: string;
    patrocinador_id?: string;
    autoAprobar?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

const PRESET_MOTIVOS = [
  'Monitor o tutor del instrumento / apoyo pedagógico en cátedra',
  'Situación de vulnerabilidad socioeconómica familiar',
  'Mérito artístico y rendimiento pedagógico excepcional',
  'Familia numerosa con múltiples hermanos en la academia',
  'Convenio de patrocinio directo con donante institucional',
  'Exoneración extraordinaria por apoyo a eventos y ensambles institucionales',
];

export const AsignarBecaModal: React.FC<AsignarBecaModalProps> = ({
  alumnos,
  patrocinadores,
  becasExistentes,
  onClose,
  onSubmit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>('');
  const [porcentaje, setPorcentaje] = useState<number>(100);
  const [motivoCategoria, setMotivoCategoria] = useState<string>(PRESET_MOTIVOS[0]);
  const [motivoDetalle, setMotivoDetalle] = useState<string>('');
  const [patrocinadorId, setPatrocinadorId] = useState<string>('');
  const [autoAprobar, setAutoAprobar] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter students
  const filteredAlumnos = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return alumnos.slice(0, 30); // Top 30 when no search
    return alumnos
      .filter(
        a =>
          a.nombre_completo.toLowerCase().includes(term) ||
          (a.instrumento_principal && a.instrumento_principal.toLowerCase().includes(term)) ||
          (a.representante_nombre && a.representante_nombre.toLowerCase().includes(term))
      )
      .slice(0, 50);
  }, [alumnos, searchTerm]);

  const selectedAlumno = useMemo(() => {
    return alumnos.find(a => a.id === selectedAlumnoId);
  }, [alumnos, selectedAlumnoId]);

  // Check if student already has an active scholarship
  const existingBecaForSelected = useMemo(() => {
    if (!selectedAlumnoId) return null;
    return becasExistentes.find(b => b.alumno_id === selectedAlumnoId && b.estado === 'activo');
  }, [becasExistentes, selectedAlumnoId]);

  // Estimate monthly fee reduction (default base fee RD$ 1,250)
  const cuotaBaseEstimadaCentavos = 125000;
  const descuentoEstimadoCentavos = Math.round((cuotaBaseEstimadaCentavos * porcentaje) / 100);
  const cuotaFinalEstimadaCentavos = cuotaBaseEstimadaCentavos - descuentoEstimadoCentavos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumnoId) {
      setErrorMessage('Por favor seleccione un alumno de la lista.');
      return;
    }

    if (porcentaje <= 0 || porcentaje > 100) {
      setErrorMessage('El porcentaje de beca debe estar entre 1% y 100%.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const motivoCompleto = motivoDetalle.trim()
      ? `${motivoCategoria}. Detalle: ${motivoDetalle.trim()}`
      : motivoCategoria;

    const res = await onSubmit({
      alumno_id: selectedAlumnoId,
      porcentaje,
      motivo_socioeconomico: motivoCompleto,
      patrocinador_id: patrocinadorId || undefined,
      autoAprobar,
    });

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Error al asignar la beca.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Asignación de Beca & Beneficio Social
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Seleccione el estudiante y configure el porcentaje de exoneración o patrocinio directo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Student Selector */}
            <div className="lg:col-span-6 space-y-4">
              <label className="block text-xs font-semibold text-zinc-300">
                1. Seleccionar Alumno Beneficiario
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, instrumento o tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Students List Box */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2 max-h-64 overflow-y-auto space-y-1.5 divide-y divide-zinc-900">
                {filteredAlumnos.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No se encontraron alumnos con el criterio de búsqueda.
                  </div>
                ) : (
                  filteredAlumnos.map(al => {
                    const isSelected = al.id === selectedAlumnoId;
                    const hasActiveBeca = becasExistentes.some(b => b.alumno_id === al.id && b.estado === 'activo');

                    return (
                      <div
                        key={al.id}
                        onClick={() => setSelectedAlumnoId(al.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-amber-500/10 border border-amber-500/50 text-white ring-1 ring-amber-500/30'
                            : 'hover:bg-zinc-900 text-zinc-300 border border-transparent'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{al.nombre_completo}</span>
                            {hasActiveBeca && (
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[9px] rounded font-semibold border border-amber-500/30">
                                Beca Activa
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {al.instrumento_principal || 'Cátedra General'} · Tutor: {al.representante_nombre || 'No asignado'}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {selectedAlumno && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-xs space-y-1 text-amber-200">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <User className="w-3.5 h-3.5" />
                    <span>Alumno Seleccionado: {selectedAlumno.nombre_completo}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Cátedra: {selectedAlumno.instrumento_principal || 'Instrumento'} · Nivel: {selectedAlumno.nivel_academico || 'Académico'}
                  </div>
                  {existingBecaForSelected && (
                    <div className="text-[10px] text-rose-400 font-semibold pt-1">
                      ⚠️ Este alumno ya cuenta con una beca del {existingBecaForSelected.porcentaje || 100}%. Registrar esta solicitud actualizará su cobertura.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Benefit & Sponsorship Configuration */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Percentage Presets */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  2. Porcentaje de Exoneración / Beca
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '100% Total', val: 100 },
                    { label: '75%', val: 75 },
                    { label: '50%', val: 50 },
                    { label: '25%', val: 25 },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setPorcentaje(item.val)}
                      className={`p-2.5 rounded-xl text-center text-xs font-mono font-bold transition-all border cursor-pointer ${
                        porcentaje === item.val
                          ? 'bg-amber-500 border-amber-400 text-black shadow-md'
                          : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-xs text-zinc-400 font-medium">Porcentaje libre:</span>
                  <div className="relative w-28">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={porcentaje}
                      onChange={(e) => setPorcentaje(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                      className="w-full pl-3 pr-7 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-500"
                    />
                    <Percent className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2" />
                  </div>
                </div>

                {/* Live simulation badge */}
                <div className="mt-3 p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Descuento aplicado:</span>
                  <span className="text-emerald-400 font-bold">
                    -{formatDOP(descuentoEstimadoCentavos)} / mes
                  </span>
                  <span className="text-zinc-400">Cuota final familia:</span>
                  <span className="text-white font-bold">
                    {formatDOP(cuotaFinalEstimadaCentavos)}
                  </span>
                </div>
              </div>

              {/* Sponsor Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  3. Patrocinador / Fondo de Cobertura
                </label>
                <select
                  value={patrocinadorId}
                  onChange={(e) => setPatrocinadorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">🏛️ Fondo Propio Social FUNEYCA</option>
                  {patrocinadores.map(pat => (
                    <option key={pat.id} value={pat.id}>
                      🤝 {pat.nombre} ({pat.tipo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Justification & Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  4. Justificación & Motivo del Beneficio
                </label>
                <select
                  value={motivoCategoria}
                  onChange={(e) => setMotivoCategoria(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 mb-2"
                >
                  {PRESET_MOTIVOS.map(mot => (
                    <option key={mot} value={mot}>{mot}</option>
                  ))}
                </select>

                <textarea
                  rows={2}
                  placeholder="Detalle o notas adicionales del comité evaluador (opcional)..."
                  value={motivoDetalle}
                  onChange={(e) => setMotivoDetalle(e.target.value)}
                  className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              {/* Direct approval toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="chk-auto-aprobar"
                  checked={autoAprobar}
                  onChange={(e) => setAutoAprobar(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="chk-auto-aprobar" className="text-xs text-zinc-300 cursor-pointer select-none">
                  Aprobar y activar inmediatamente la beca (Resolución de Dirección)
                </label>
              </div>

            </div>

          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedAlumnoId || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-xs font-bold text-black flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all hover:scale-102 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando...' : 'Asignar & Registrar Beca'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
