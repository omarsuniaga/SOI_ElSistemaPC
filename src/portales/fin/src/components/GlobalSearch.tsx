import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Search, 
  X, 
  Users, 
  Receipt, 
  BookOpen, 
  CreditCard, 
  ArrowRight, 
  CornerDownLeft, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  GraduationCap, 
  CheckCircle2,
  Clock,
  Building,
  TrendingUp,
  Tag
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';

interface GlobalSearchProps {
  setActiveView: (view: string) => void;
}

type SearchCategory = 'all' | 'familias' | 'facturas' | 'asientos' | 'pagos';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ setActiveView }) => {
  const { 
    familias, 
    alumnos, 
    facturasGasto, 
    asientos, 
    cuotas, 
    pagos 
  } = useFinance();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut (Cmd+K / Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filtered Results
  const results = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return { familias: [], facturas: [], asientos: [], pagos: [], totalCount: 0 };

    // 1. Familias
    const matchedFamilias = familias.filter(f => {
      const matchFamily = f.apellidos.toLowerCase().includes(cleanQuery) ||
        f.codigo_familia.toLowerCase().includes(cleanQuery) ||
        f.telefono_principal.includes(cleanQuery) ||
        f.email_principal.toLowerCase().includes(cleanQuery);

      const matchRep = f.representante_principal?.nombre_completo.toLowerCase().includes(cleanQuery) ||
        f.representante_principal?.cedula?.includes(cleanQuery);

      // Search matching students in this family
      const familyAlumnos = alumnos.filter(a => a.familia_id === f.id);
      const matchAlumno = familyAlumnos.some(a => 
        a.nombre_completo.toLowerCase().includes(cleanQuery) ||
        a.instrumento_principal.toLowerCase().includes(cleanQuery)
      );

      return matchFamily || matchRep || matchAlumno;
    }).map(f => {
      const familyAlumnos = alumnos.filter(a => a.familia_id === f.id);
      return { ...f, alumnos: familyAlumnos };
    });

    // 2. Facturas de Gasto
    const matchedFacturas = facturasGasto.filter(fg => {
      return fg.numero_factura.toLowerCase().includes(cleanQuery) ||
        (fg.ncf && fg.ncf.toLowerCase().includes(cleanQuery)) ||
        fg.proveedor_nombre.toLowerCase().includes(cleanQuery) ||
        fg.concepto.toLowerCase().includes(cleanQuery) ||
        fg.centro_costo.toLowerCase().includes(cleanQuery) ||
        (fg.solicitado_por_nombre && fg.solicitado_por_nombre.toLowerCase().includes(cleanQuery));
    });

    // 3. Asientos Contables
    const matchedAsientos = asientos.filter(as => {
      const matchNum = as.numero.toString().includes(cleanQuery) ||
        `asi-${as.numero}`.includes(cleanQuery) ||
        as.plantilla_id.toLowerCase().includes(cleanQuery);

      const matchDesc = as.descripcion.toLowerCase().includes(cleanQuery);
      const matchPeriod = as.periodo.toLowerCase().includes(cleanQuery);
      const matchLine = as.lineas.some(l => 
        l.cuenta_codigo.toLowerCase().includes(cleanQuery) || 
        l.cuenta_nombre.toLowerCase().includes(cleanQuery)
      );

      return matchNum || matchDesc || matchPeriod || matchLine;
    });

    // 4. Pagos y Recibos
    const matchedPagos = pagos.filter(p => {
      return p.numero_recibo.toLowerCase().includes(cleanQuery) ||
        p.familia_nombre.toLowerCase().includes(cleanQuery) ||
        p.representante_nombre.toLowerCase().includes(cleanQuery) ||
        (p.referencia_bancaria && p.referencia_bancaria.toLowerCase().includes(cleanQuery)) ||
        (p.observaciones && p.observaciones.toLowerCase().includes(cleanQuery));
    });

    const totalCount = matchedFamilias.length + matchedFacturas.length + matchedAsientos.length + matchedPagos.length;

    return {
      familias: matchedFamilias,
      facturas: matchedFacturas,
      asientos: matchedAsientos,
      pagos: matchedPagos,
      totalCount
    };
  }, [query, familias, alumnos, facturasGasto, asientos, pagos]);

  // Flatten items for keyboard navigation
  const flatItems = useMemo(() => {
    const list: Array<{ type: string; id: string; view: string; item: any }> = [];

    if (selectedCategory === 'all' || selectedCategory === 'familias') {
      results.familias.forEach(f => list.push({ type: 'familia', id: f.id, view: 'familias', item: f }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'facturas') {
      results.facturas.forEach(fg => list.push({ type: 'factura', id: fg.id, view: 'facturas', item: fg }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'asientos') {
      results.asientos.forEach(as => list.push({ type: 'asiento', id: as.id, view: 'contabilidad', item: as }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'pagos') {
      results.pagos.forEach(p => list.push({ type: 'pago', id: p.id, view: 'cuotas', item: p }));
    }

    return list;
  }, [results, selectedCategory]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems.length > 0 && flatItems[highlightedIndex]) {
        handleSelectItem(flatItems[highlightedIndex].view);
      }
    }
  };

  const handleSelectItem = (view: string) => {
    setActiveView(view);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:max-w-sm lg:max-w-md">
      
      {/* Search Input Box */}
      <div 
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all cursor-text text-xs ${
          isOpen 
            ? 'bg-zinc-900 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30' 
            : 'bg-zinc-900/90 border-zinc-800/90 hover:border-zinc-700 text-zinc-400'
        }`}
      >
        <Search className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-indigo-400' : 'text-zinc-400'}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar familias, facturas, asientos... (⌘K)"
          className="bg-transparent text-white placeholder-zinc-500 focus:outline-none w-full text-xs font-normal"
        />

        {query && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-zinc-800 shrink-0">
          <span className="text-[9px]">⌘</span>K
        </div>
      </div>

      {/* Floating Results Dropdown / Palette */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-[580px] lg:w-[650px] top-full mt-2.5 z-50 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Top Category Filter Tabs */}
          <div className="p-3 bg-zinc-950/90 border-b border-zinc-800/80 flex items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span>Todo</span>
                {query && <span className="text-[10px] opacity-80 font-mono">({results.totalCount})</span>}
              </button>

              <button
                onClick={() => setSelectedCategory('familias')}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'familias'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Familias</span>
                {query && <span className="text-[10px] opacity-80 font-mono">({results.familias.length})</span>}
              </button>

              <button
                onClick={() => setSelectedCategory('facturas')}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'facturas'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Facturas</span>
                {query && <span className="text-[10px] opacity-80 font-mono">({results.facturas.length})</span>}
              </button>

              <button
                onClick={() => setSelectedCategory('asientos')}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'asientos'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Asientos</span>
                {query && <span className="text-[10px] opacity-80 font-mono">({results.asientos.length})</span>}
              </button>

              <button
                onClick={() => setSelectedCategory('pagos')}
                className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'pagos'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Recibos</span>
                {query && <span className="text-[10px] opacity-80 font-mono">({results.pagos.length})</span>}
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results Container */}
          <div className="max-h-[65vh] sm:max-h-[420px] overflow-y-auto p-3.5 space-y-4">
            
            {/* 1. Empty Query - Quick Access Suggestions */}
            {!query.trim() && (
              <div className="space-y-4 py-2">
                <div className="px-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Accesos Directos Frecuentes</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Escribe para buscar o haz clic en cualquier módulo principal.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectItem('familias')}
                    className="p-3 bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-2xl text-left transition-all group flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          Cuentas 360° & Familias
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {familias.length} hogares · Solvencia ISP
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => handleSelectItem('facturas')}
                    className="p-3 bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-2xl text-left transition-all group flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                          Facturas de Gastos & NCF
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {facturasGasto.length} comprobantes registrados
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => handleSelectItem('contabilidad')}
                    className="p-3 bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-2xl text-left transition-all group flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          Libro Diario & Mayor
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {asientos.length} asientos contables AS
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => handleSelectItem('registro_pago')}
                    className="p-3 bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-2xl text-left transition-all group flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                          Ventanilla de Pagos
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Cobranza rápida y recibos
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. When query has matches */}
            {query.trim() && (
              <div className="space-y-4">
                
                {/* Zero Results State */}
                {results.totalCount === 0 && (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mx-auto text-zinc-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      No se encontraron resultados para "{query}"
                    </p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                      Intenta buscar por apellido de familia, código NCF (ej. B0100000045), número de asiento o nombre de estudiante.
                    </p>
                  </div>
                )}

                {/* Section: Familias */}
                {(selectedCategory === 'all' || selectedCategory === 'familias') && results.familias.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        Familias & Alumnos ({results.familias.length})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {results.familias.slice(0, 4).map((f) => (
                        <div
                          key={f.id}
                          onClick={() => handleSelectItem('familias')}
                          className="p-3 bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-indigo-500/40 rounded-2xl transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-xs">
                                Familia {f.apellidos}
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md">
                                {f.codigo_familia}
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                f.isp.categoria === 'A' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                f.isp.categoria === 'B' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                                f.isp.categoria === 'C' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                ISP Cat. {f.isp.categoria}
                              </span>
                            </div>

                            <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span>Rep: <strong className="text-zinc-300">{f.representante_principal?.nombre_completo || 'N/A'}</strong></span>
                              <span>·</span>
                              <span>Tel: {f.telefono_principal}</span>
                              {f.alumnos.length > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="text-indigo-400 font-medium">
                                    Alumnos: {f.alumnos.map(a => `${a.nombre_completo} (${a.instrumento_principal})`).join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-zinc-500">Saldo Pendiente</div>
                              <div className={`text-xs font-mono font-bold ${f.saldo_pendiente_centavos > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {formatDOP(f.saldo_pendiente_centavos)}
                              </div>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-zinc-900 text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1">
                              <span>Ver</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Facturas de Gasto */}
                {(selectedCategory === 'all' || selectedCategory === 'facturas') && results.facturas.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-amber-400" />
                        Facturas de Gasto & Proveedores ({results.facturas.length})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {results.facturas.slice(0, 4).map((fg) => (
                        <div
                          key={fg.id}
                          onClick={() => handleSelectItem('facturas')}
                          className="p-3 bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-amber-500/40 rounded-2xl transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white group-hover:text-amber-300 transition-colors text-xs">
                                {fg.proveedor_nombre}
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md">
                                {fg.numero_factura}
                              </span>
                              {fg.ncf && (
                                <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                                  NCF: {fg.ncf}
                                </span>
                              )}
                              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                                fg.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                fg.estado === 'aprobada' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {fg.estado.toUpperCase()}
                              </span>
                            </div>

                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 truncate">
                              <span>Concepto: <strong className="text-zinc-300">{fg.concepto}</strong></span>
                              <span>·</span>
                              <span className="font-mono text-zinc-500">CC: {fg.centro_costo}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-zinc-500">Monto Neto</div>
                              <div className="text-xs font-mono font-bold text-white">
                                {formatDOP(fg.monto_neto_centavos)}
                              </div>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-zinc-900 text-zinc-300 group-hover:bg-amber-600 group-hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1">
                              <span>Ver</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Asientos Contables */}
                {(selectedCategory === 'all' || selectedCategory === 'asientos') && results.asientos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        Asientos & Libro Diario ({results.asientos.length})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {results.asientos.slice(0, 4).map((as) => (
                        <div
                          key={as.id}
                          onClick={() => handleSelectItem('contabilidad')}
                          className="p-3 bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-emerald-500/40 rounded-2xl transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-400 text-xs">
                                Asiento #{as.numero}
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md">
                                {as.plantilla_id}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {as.fecha_contable}
                              </span>
                              {as.cuadrado && (
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  Cuadrado
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-zinc-300 truncate">
                              {as.descripcion}
                            </div>

                            <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                              <span>Cuentas: {as.lineas.map(l => l.cuenta_codigo).join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-zinc-500">Total Débitos</div>
                              <div className="text-xs font-mono font-bold text-emerald-400">
                                {formatDOP(as.total_debitos_centavos)}
                              </div>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-zinc-900 text-zinc-300 group-hover:bg-emerald-600 group-hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1">
                              <span>Libro</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Pagos y Recibos */}
                {(selectedCategory === 'all' || selectedCategory === 'pagos') && results.pagos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                        Recibos & Pagos Registrados ({results.pagos.length})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {results.pagos.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectItem('cuotas')}
                          className="p-3 bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-sky-500/40 rounded-2xl transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sky-400 text-xs">
                                {p.numero_recibo}
                              </span>
                              <span className="font-semibold text-white text-xs">
                                Familia {p.familia_nombre}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md uppercase">
                                {p.metodo_pago}
                              </span>
                            </div>

                            <div className="text-[11px] text-zinc-400">
                              <span>Fecha: {p.fecha_pago}</span>
                              {p.referencia_bancaria && (
                                <span className="ml-2 font-mono text-zinc-500">Ref: {p.referencia_bancaria}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-zinc-500">Cobrado</div>
                              <div className="text-xs font-mono font-bold text-emerald-400">
                                {formatDOP(p.monto_total_centavos)}
                              </div>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-zinc-900 text-zinc-300 group-hover:bg-sky-600 group-hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1">
                              <span>Recibo</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer Guide */}
          <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">↓</kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">Enter</kbd>
                Abrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400">Esc</kbd>
                Cerrar
              </span>
            </div>
            <span className="font-mono text-indigo-400 font-semibold">SOI Finanzas 360°</span>
          </div>

        </div>
      )}

    </div>
  );
};
