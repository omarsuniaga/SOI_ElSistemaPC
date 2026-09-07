import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Filter, 
  Search,
  FileCheck,
  Building,
  Layers,
  Scale
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';

export const ContabilidadLibroView: React.FC = () => {
  const { asientos, verificarInvariantes } = useFinance();
  const [activeTab, setActiveTab] = useState<'libro' | 'invariantes' | 'catalogo'>('libro');
  const [searchTerm, setSearchTerm] = useState('');

  const invariantes = verificarInvariantes();
  const totalInvariantes = invariantes.length;
  const passedInvariantes = invariantes.filter(i => i.cumple).length;
  const allGood = passedInvariantes === totalInvariantes;

  const filteredAsientos = asientos.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchNum = a.numero.toString().includes(term) || a.plantilla_id.toLowerCase().includes(term);
    const matchDesc = a.descripcion.toLowerCase().includes(term);
    const matchLine = a.lineas.some(l => l.cuenta_codigo.includes(term) || l.cuenta_nombre.toLowerCase().includes(term));
    return matchNum || matchDesc || matchLine;
  });

  const catalogoEstandar = [
    { codigo: '1.1.01.01', nombre: 'Caja General / Ventanilla', tipo: 'Activo', nivel: 4, naturaleza: 'Deudora' },
    { codigo: '1.1.02.01', nombre: 'Banco Popular Dominicano Cta Corriente DOP', tipo: 'Activo', nivel: 4, naturaleza: 'Deudora' },
    { codigo: '1.1.02.02', nombre: 'Banreservas Cta Operativa DOP', tipo: 'Activo', nivel: 4, naturaleza: 'Deudora' },
    { codigo: '1.1.03.01', nombre: 'Cuentas por Cobrar Cuotas & Matrículas (Representantes)', tipo: 'Activo', nivel: 4, naturaleza: 'Deudora' },
    { codigo: '2.1.01.01', nombre: 'Cuentas por Pagar Proveedores Comerciales', tipo: 'Pasivo', nivel: 4, naturaleza: 'Acreedora' },
    { codigo: '2.1.02.01', nombre: 'Retenciones TSS por Pagar (SFS + AFP)', tipo: 'Pasivo', nivel: 4, naturaleza: 'Acreedora' },
    { codigo: '2.1.03.01', nombre: 'Anticipos y Créditos a Favor de Familias (Wallet)', tipo: 'Pasivo', nivel: 4, naturaleza: 'Acreedora' },
    { codigo: '4.1.01.01', nombre: 'Ingresos por Matrícula y Cuotas Académicas (Bruto)', tipo: 'Ingreso', nivel: 4, naturaleza: 'Acreedora' },
    { codigo: '4.1.02.01', nombre: 'Donaciones & Patrocinios Corporativos', tipo: 'Ingreso', nivel: 4, naturaleza: 'Acreedora' },
    { codigo: '5.1.01.01', nombre: 'Honorarios y Sueldos Docentes (Cátedras)', tipo: 'Gasto', nivel: 4, naturaleza: 'Deudora' },
    { codigo: '5.1.02.01', nombre: 'Energía Eléctrica CEPM', tipo: 'Gasto', nivel: 4, naturaleza: 'Deudora' },
    { codigo: '5.1.03.01', nombre: 'Internet y Telecomunicaciones Claro', tipo: 'Gasto', nivel: 4, naturaleza: 'Deudora' },
    { codigo: '5.1.04.01', nombre: 'Gasto Programa Social de Becas y Exoneraciones', tipo: 'Gasto', nivel: 4, naturaleza: 'Deudora' },
  ];

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Auditoría & Libros
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Contabilidad General & Auditoría
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Libro diario de partida doble (INV-01), catálogo de cuentas y verificación continua de 14 invariantes normativos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs ${
            allGood 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <ShieldCheck className={`w-4 h-4 ${allGood ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span>{passedInvariantes}/{totalInvariantes} Invariantes Auditados OK</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 space-x-6 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('libro')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'libro' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Libro Diario ({asientos.length} Asientos)</span>
        </button>

        <button
          onClick={() => setActiveTab('invariantes')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'invariantes' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Motor de Auditoría e Invariantes ({invariantes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalogo' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catálogo de Cuentas Institucional</span>
        </button>
      </div>

      {/* Tab 1: Libro Diario */}
      {activeTab === 'libro' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-5 rounded-[2.2rem] border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por número, concepto, cuenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              Total Asientos Registrados: <strong className="text-white">{asientos.length}</strong>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAsientos.map(asiento => {
              const totalDebito = asiento.lineas.reduce((acc, l) => acc + l.debito_centavos, 0);
              const totalCredito = asiento.lineas.reduce((acc, l) => acc + l.credito_centavos, 0);
              const esCuadrado = totalDebito === totalCredito;

              return (
                <div key={asiento.id} className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
                  <div className="p-5 bg-zinc-950/80 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-[11px]">
                        {asiento.plantilla_id} #{asiento.numero.toString().padStart(6, '0')}
                      </span>
                      <span className="font-semibold text-white text-xs sm:text-sm">{asiento.descripcion}</span>
                    </div>

                    <div className="flex items-center gap-4 text-zinc-400 font-mono text-xs">
                      <span>Fecha: <strong className="text-zinc-200">{asiento.fecha_contable}</strong></span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        esCuadrado 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {esCuadrado ? '✓ Cuadrado (INV-01)' : '⚠️ Descuadre'}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider border-b border-zinc-800/80 bg-zinc-950/30">
                        <tr>
                          <th className="py-2.5 px-5">Código Cuenta</th>
                          <th className="py-2.5 px-5">Nombre de Cuenta</th>
                          <th className="py-2.5 px-5 text-right">Débito (DOP)</th>
                          <th className="py-2.5 px-5 text-right">Crédito (DOP)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {asiento.lineas.map((linea, idx) => (
                          <tr key={idx} className="hover:bg-zinc-950/40 transition-colors">
                            <td className="py-3 px-5 font-mono font-medium text-zinc-400">
                              {linea.cuenta_codigo}
                            </td>
                            <td className="py-3 px-5 text-white font-medium">
                              {linea.cuenta_nombre}
                            </td>
                            <td className="py-3 px-5 text-right font-mono font-semibold text-zinc-200">
                              {linea.debito_centavos > 0 ? formatDOP(linea.debito_centavos) : '-'}
                            </td>
                            <td className="py-3 px-5 text-right font-mono font-semibold text-zinc-200">
                              {linea.credito_centavos > 0 ? formatDOP(linea.credito_centavos) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-zinc-950/80 font-bold border-t border-zinc-800">
                        <tr>
                          <td colSpan={2} className="py-3 px-5 text-zinc-400 uppercase text-[11px] font-mono">
                            Sumas Iguales
                          </td>
                          <td className="py-3 px-5 text-right font-mono text-emerald-400">
                            {formatDOP(totalDebito)}
                          </td>
                          <td className="py-3 px-5 text-right font-mono text-emerald-400">
                            {formatDOP(totalCredito)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Invariantes Normativos Scanner */}
      {activeTab === 'invariantes' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-zinc-900 to-indigo-950/50 text-white p-7 rounded-[2.5rem] border border-indigo-500/30 space-y-2 shadow-xl">
            <h2 className="text-base font-semibold text-indigo-300">
              Escaneo Continuo de Integridad Financiera & Segregación de Funciones
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
              El sistema ejecuta verificaciones matemáticas en tiempo real sobre cada transacción para garantizar cumplimiento con las reglas de negocio inviolables de FUNEYCA-PC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invariantes.map(inv => (
              <div 
                key={inv.id}
                className={`p-6 rounded-[2.2rem] border transition-all ${
                  inv.cumple 
                    ? 'bg-zinc-900 border-zinc-800 shadow-xl' 
                    : 'bg-rose-950/30 border-rose-500/40 shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-zinc-950 text-indigo-400 border border-zinc-800 px-2 py-0.5 rounded-lg">
                      {inv.id}
                    </span>
                    <h3 className="font-semibold text-xs text-white">{inv.nombre}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
                    inv.cumple 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {inv.cumple ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                    {inv.cumple ? 'Auditado OK' : 'Violación'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-3 font-mono text-[11px] bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                  Fórmula: {inv.formula}
                </p>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500">Auditoría en Vivo:</span>
                  <span className="font-medium text-zinc-300 font-mono">{inv.detalles}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Catálogo de Cuentas */}
      {activeTab === 'catalogo' && (
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-5">Código Cuenta</th>
                  <th className="py-3 px-5">Nombre de la Cuenta</th>
                  <th className="py-3 px-5">Tipo</th>
                  <th className="py-3 px-5">Nivel</th>
                  <th className="py-3 px-5">Naturaleza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {catalogoEstandar.map(cta => (
                  <tr key={cta.codigo} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3 px-5 font-mono font-semibold text-indigo-400">{cta.codigo}</td>
                    <td className="py-3 px-5 text-white font-medium">{cta.nombre}</td>
                    <td className="py-3 px-5 capitalize text-zinc-400 font-mono">{cta.tipo}</td>
                    <td className="py-3 px-5 text-zinc-500 font-mono">Nivel {cta.nivel}</td>
                    <td className="py-3 px-5 font-mono font-semibold uppercase text-[10px] text-zinc-400">
                      {cta.naturaleza}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

