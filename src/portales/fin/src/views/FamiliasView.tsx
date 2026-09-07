import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Users, 
  Search, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  AlertCircle, 
  Wallet, 
  X, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  UserCheck,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { Familia, Alumno } from '../types';
import { AlumnoFichaModal } from '../components/AlumnoFichaModal';

interface FamiliasViewProps {
  setActiveView?: (view: string) => void;
}

export const FamiliasView: React.FC<FamiliasViewProps> = ({ setActiveView }) => {
  const { familias, alumnos, cuotas, pagos, iniciarCobroFamilia, crearNuevaFamilia } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<Familia | null>(null);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Family Form state
  const [apellidos, setApellidos] = useState('');
  const [codigoFam, setCodigoFam] = useState('');
  const [repNombre, setRepNombre] = useState('');
  const [repCedula, setRepCedula] = useState('');
  const [repTelefono, setRepTelefono] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [almNombre, setAlmNombre] = useState('');
  const [almInstrumento, setAlmInstrumento] = useState('Violín');
  const [almNivel, setAlmNivel] = useState('Iniciación A');

  const handleCobrarFamilia = (famId: string) => {
    iniciarCobroFamilia(famId);
    if (setActiveView) {
      setActiveView('registro_pago');
    }
  };

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apellidos || !repNombre || !almNombre) return;

    crearNuevaFamilia({
      codigo_familia: codigoFam || `FAM-${(familias.length + 101).toString()}`,
      apellidos,
      representante_nombre: repNombre,
      representante_cedula: repCedula || '001-0000000-0',
      representante_telefono: repTelefono || '(809) 555-0100',
      representante_email: repEmail || 'contacto@familia.do',
      alumno_nombre: almNombre,
      instrumento: almInstrumento,
      nivel: almNivel,
    });

    setSuccessToast(`Familia ${apellidos} registrada exitosamente junto al alumno ${almNombre}.`);
    setShowCreateModal(false);
    setApellidos('');
    setCodigoFam('');
    setRepNombre('');
    setRepCedula('');
    setRepTelefono('');
    setRepEmail('');
    setAlmNombre('');
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const filtered = familias.filter(f => {
    const term = searchTerm.toLowerCase();
    const matchSearch = f.apellidos.toLowerCase().includes(term) ||
      f.representante_principal?.nombre_completo.toLowerCase().includes(term) ||
      f.telefono_principal.includes(term) ||
      f.codigo_familia.toLowerCase().includes(term);

    if (filterCategory === 'all') return matchSearch;
    return matchSearch && f.isp.categoria === filterCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Expedientes & Solvencia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Familias & Cuentas 360°
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Perfil financiero consolidado, cálculo transparente del ISP y trazabilidad de alumnos por hogar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Familia</span>
          </button>
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{familias.length} Familias</span>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-zinc-900 p-5 rounded-[2.2rem] border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por apellido, representante, código, teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Categoría ISP:</span>
          {['all', 'A', 'B', 'C', 'D', 'E'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                  : 'bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              {cat === 'all' ? 'Todos' : `Cat. ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Families Grid Table */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-5">Familia / Código</th>
                <th className="py-3 px-5">Representante Legal</th>
                <th className="py-3 px-5">Alumnos Inscritos</th>
                <th className="py-3 px-5">Saldo Pendiente</th>
                <th className="py-3 px-5">Wallet Crédito</th>
                <th className="py-3 px-5 text-center">Índice Solvencia (ISP)</th>
                <th className="py-3 px-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filtered.map(fam => {
                const famAlumnos = alumnos.filter(a => a.familia_id === fam.id);
                return (
                  <tr key={fam.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white text-xs sm:text-sm">Familia {fam.apellidos}</div>
                      <div className="text-[10px] font-mono text-indigo-400">{fam.codigo_familia}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-zinc-200">{fam.representante_principal?.nombre_completo || 'Sin representante asignado'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{fam.telefono_principal}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1.5">
                        {famAlumnos.map(a => (
                          <span key={a.id} className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] font-medium">
                            {a.nombre_completo} ({a.instrumento_principal})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      <span className={`font-semibold ${fam.saldo_pendiente_centavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {fam.saldo_pendiente_centavos > 0 ? formatDOP(fam.saldo_pendiente_centavos) : 'Al Día'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      <span className="font-semibold text-emerald-400">
                        {formatDOP(fam.credito_favor_centavos)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        fam.isp.categoria === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        fam.isp.categoria === 'B' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        fam.isp.categoria === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        fam.isp.categoria === 'D' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        fam.isp.categoria === 'E' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        Cat. {fam.isp.categoria} ({fam.isp.valor} pts)
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fam.saldo_pendiente_centavos > 0 && (
                          <button
                            onClick={() => handleCobrarFamilia(fam.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Registrar Pago</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedFamily(fam)}
                          className="px-3 py-1.5 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Ficha 360°</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360 Drawer / Modal */}
      {selectedFamily && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-zinc-800 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                  Ficha Integral 360°
                </span>
                <h2 className="text-lg font-semibold text-white mt-0.5">
                  Familia {selectedFamily.apellidos} <span className="text-zinc-500 font-mono text-sm">({selectedFamily.codigo_familia})</span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedFamily(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Representative & Contacts Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Representante Legal:</span>
                <span className="font-semibold text-white text-sm block mt-0.5">
                  {selectedFamily.representante_principal?.nombre_completo || 'Sin registro explícito'}
                </span>
                <span className="text-zinc-400 block mt-1 font-mono text-[11px]">
                  Cédula: {selectedFamily.representante_principal?.cedula || 'N/D'}
                </span>
              </div>
              <div className="space-y-1.5 justify-center flex flex-col">
                <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{selectedFamily.telefono_principal}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
                  <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{selectedFamily.email_principal}</span>
                </div>
              </div>
            </div>

            {/* ISP Deep-Dive Breakdown */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 to-amber-950/20 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-amber-300 uppercase tracking-wider">
                    Desglose Matemático del ISP (Índice de Solvencia)
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Normalizado por cobertura de datos ({Math.round(selectedFamily.isp.cobertura_datos * 100)}% de datos disponibles).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {selectedFamily.isp.valor} <span className="text-xs text-zinc-500">/ 100</span>
                  </span>
                  <span className="block text-[10px] font-mono font-bold text-amber-300">
                    Categoría {selectedFamily.isp.categoria}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {selectedFamily.isp.desglose.map((comp, idx) => (
                  <div key={idx} className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 text-xs">
                    <div className="flex justify-between font-medium text-white">
                      <span>{comp.nombre} (Peso: {comp.peso} pts)</span>
                      <span className="text-amber-400 font-mono font-bold">{comp.puntos} pts</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Dato: {comp.dato_crudo} · {comp.descripcion}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center justify-between font-mono">
                <span className="font-semibold">Ventana de Pago Probable:</span>
                <span>Días {selectedFamily.isp.ventana_pago_sugerida.inicio_dia} al {selectedFamily.isp.ventana_pago_sugerida.fin_dia} del mes ({selectedFamily.isp.ventana_pago_sugerida.patron})</span>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono">
                Alumnos en la Familia ({alumnos.filter(a => a.familia_id === selectedFamily.id).length})
              </h3>
              <div className="space-y-2">
                {alumnos.filter(a => a.familia_id === selectedFamily.id).map(alu => (
                  <button
                    key={alu.id}
                    onClick={() => setSelectedAlumno(alu)}
                    className="w-full p-3.5 bg-zinc-950/80 hover:bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs transition-all cursor-pointer text-left"
                  >
                    <div>
                      <span className="font-semibold text-white">{alu.nombre_completo}</span>
                      <span className="text-zinc-400 block text-[11px] mt-0.5">{alu.instrumento_principal} · {alu.nivel}</span>
                    </div>
                    <span className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                        Activo
                      </span>
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Cuotas & History */}
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono">
                Historial y Cuotas Abiertas
              </h3>
              <div className="space-y-2">
                {cuotas.filter(c => c.familia_id === selectedFamily.id).map(cuota => (
                  <div key={cuota.id} className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-white">{cuota.alumno_nombre} ({cuota.periodo})</span>
                      <span className="text-zinc-500 block text-[10px] font-mono mt-0.5">Vence: {cuota.fecha_vencimiento}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${cuota.saldo_centavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {cuota.saldo_centavos > 0 ? formatDOP(cuota.saldo_centavos) : 'Pagada'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const famId = selectedFamily.id;
                  setSelectedFamily(null);
                  handleCobrarFamilia(famId);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Registrar Pago de Familia</span>
              </button>

              <button
                onClick={() => setSelectedFamily(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Registrar Nueva Familia */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 text-white relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-base text-white">Registro de Nueva Familia & Alumno</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFamily} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1.5">Apellidos de la Familia:</label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej: Castillo Martínez"
                    required
                    className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1.5">Código Familia (Opcional):</label>
                  <input
                    type="text"
                    value={codigoFam}
                    onChange={(e) => setCodigoFam(e.target.value)}
                    placeholder="Auto-generado si vacío..."
                    className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">
                  Datos del Representante Legal
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      value={repNombre}
                      onChange={(e) => setRepNombre(e.target.value)}
                      placeholder="Ej: Carmen Martínez"
                      required
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Cédula / Pasaporte:</label>
                    <input
                      type="text"
                      value={repCedula}
                      onChange={(e) => setRepCedula(e.target.value)}
                      placeholder="001-XXXXXXX-X"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={repTelefono}
                      onChange={(e) => setRepTelefono(e.target.value)}
                      placeholder="(809) 555-0100"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Correo Electrónico:</label>
                    <input
                      type="email"
                      value={repEmail}
                      onChange={(e) => setRepEmail(e.target.value)}
                      placeholder="carmen@correo.com"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">
                  Estudiante Inscrito Inicial
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-zinc-400 font-semibold block mb-1">Nombre Alumno:</label>
                    <input
                      type="text"
                      value={almNombre}
                      onChange={(e) => setAlmNombre(e.target.value)}
                      placeholder="Ej: Daniel Castillo"
                      required
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Instrumento:</label>
                    <select
                      value={almInstrumento}
                      onChange={(e) => setAlmInstrumento(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Violín">Violín</option>
                      <option value="Violonchelo">Violonchelo</option>
                      <option value="Viola">Viola</option>
                      <option value="Contrabajo">Contrabajo</option>
                      <option value="Flauta Dulce / Traversa">Flauta</option>
                      <option value="Clarinete">Clarinete</option>
                      <option value="Trompeta">Trompeta</option>
                      <option value="Percusión">Percusión</option>
                      <option value="Coro">Coro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Nivel Inicial:</label>
                    <select
                      value={almNivel}
                      onChange={(e) => setAlmNivel(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Iniciación A">Iniciación A</option>
                      <option value="Iniciación B">Iniciación B</option>
                      <option value="Semillero Musical">Semillero Musical</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Orquesta Juvenil">Orquesta Juvenil</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Guardar Familia y Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAlumno && (
        <AlumnoFichaModal
          alumno={selectedAlumno}
          onClose={() => setSelectedAlumno(null)}
          onSelectOtroAlumno={(a) => setSelectedAlumno(a)}
        />
      )}

    </div>
  );
};

