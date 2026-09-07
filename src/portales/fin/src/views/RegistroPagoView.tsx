import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Search, 
  User, 
  CreditCard, 
  CheckCircle2, 
  Printer, 
  Share2, 
  PlusCircle, 
  Receipt, 
  AlertCircle, 
  Wallet,
  Sparkles,
  ArrowRight,
  Calculator,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDOP, parseToCents } from '../lib/financialMath';
import { Pago, MetodoPago } from '../types';

export const RegistroPagoView: React.FC = () => {
  const { 
    familias, 
    alumnos, 
    cuotas, 
    pagos, 
    selectedFamiliaIdForPayment,
    setSelectedFamiliaIdForPayment,
    registrarPagoTransaccional,
    supabaseStatus,
    supabaseErrorMessage
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamiliaId, setSelectedFamiliaId] = useState<string | null>(null);
  const [selectedCuotasIds, setSelectedCuotasIds] = useState<string[]>([]);
  const [montoPagarInput, setMontoPagarInput] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('transferencia');
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referencia, setReferencia] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [reciboGenerado, setReciboGenerado] = useState<Pago | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select if selectedFamiliaIdForPayment was set
  useEffect(() => {
    if (selectedFamiliaIdForPayment) {
      handleSelectFamilia(selectedFamiliaIdForPayment);
      setSelectedFamiliaIdForPayment(null);
    } else if (!selectedFamiliaId) {
      // Default to first family with pending debt for instant readiness
      const famWithDebt = familias.find(f => f.saldo_pendiente_centavos > 0);
      if (famWithDebt) {
        handleSelectFamilia(famWithDebt.id);
      }
    }
  }, [selectedFamiliaIdForPayment, familias]);

  // Search filter
  const filteredFamilias = familias.filter(f => {
    const term = searchTerm.toLowerCase();
    const matchApellidos = f.apellidos.toLowerCase().includes(term);
    const matchRep = f.representante_principal?.nombre_completo.toLowerCase().includes(term);
    const matchTel = f.telefono_principal.includes(term);
    const matchCed = f.representante_principal?.cedula.includes(term);
    const matchAlu = alumnos.some(a => a.familia_id === f.id && a.nombre_completo.toLowerCase().includes(term));
    return matchApellidos || matchRep || matchTel || matchCed || matchAlu;
  });

  const selectedFamilia = familias.find(f => f.id === selectedFamiliaId);
  const familiaAlumnos = alumnos.filter(a => a.familia_id === selectedFamiliaId);
  const familiaCuotasPendientes = cuotas.filter(c => c.familia_id === selectedFamiliaId && (c.estado === 'pendiente' || c.estado === 'parcial'));

  // Select family handler
  const handleSelectFamilia = (famId: string) => {
    setSelectedFamiliaId(famId);
    const openCuotas = cuotas.filter(c => c.familia_id === famId && (c.estado === 'pendiente' || c.estado === 'parcial'));
    const allIds = openCuotas.map(c => c.id);
    setSelectedCuotasIds(allIds);
    
    // Default monto to total pending
    const totalPendiente = openCuotas.reduce((acc, c) => acc + c.saldo_centavos, 0);
    setMontoPagarInput((totalPendiente / 100).toString());
    setReciboGenerado(null);
    setMensajeExito(null);
    setErrorMsg(null);
  };

  const handleToggleCuota = (cuotaId: string) => {
    let updated: string[];
    if (selectedCuotasIds.includes(cuotaId)) {
      updated = selectedCuotasIds.filter(id => id !== cuotaId);
    } else {
      updated = [...selectedCuotasIds, cuotaId];
    }
    setSelectedCuotasIds(updated);

    const sum = familiaCuotasPendientes
      .filter(c => updated.includes(c.id))
      .reduce((acc, c) => acc + c.saldo_centavos, 0);
    setMontoPagarInput((sum / 100).toString());
  };

  const handleSelectAllCuotas = () => {
    const allIds = familiaCuotasPendientes.map(c => c.id);
    setSelectedCuotasIds(allIds);
    const sum = familiaCuotasPendientes.reduce((acc, c) => acc + c.saldo_centavos, 0);
    setMontoPagarInput((sum / 100).toString());
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // FAIL-CLOSED POLICY: Financial write prohibited if not connected to authoritative Supabase backend
    if (supabaseStatus !== 'authoritative_online') {
      setErrorMsg(`FAIL_CLOSED: Registro de pago cancelado. No hay conexión autoritativa con Supabase (${supabaseErrorMessage || 'Modo solo lectura'}).`);
      return;
    }

    if (!selectedFamiliaId) {
      setErrorMsg('Por favor seleccione una familia o alumno.');
      return;
    }

    const montoCentavos = parseToCents(montoPagarInput);
    if (montoCentavos <= 0) {
      setErrorMsg('El monto a registrar debe ser mayor a RD$0.00');
      return;
    }

    // Prevent double-submit while the RPC is in flight — a second click here
    // would otherwise fire a second registrarPagoTransaccional call before
    // the first one resolves.
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await registrarPagoTransaccional({
        familia_id: selectedFamiliaId,
        monto_total_centavos: montoCentavos,
        metodo_pago: metodoPago,
        fecha_pago: fechaPago,
        referencia,
        observaciones,
        cuotas_especificas_ids: selectedCuotasIds.length > 0 ? selectedCuotasIds : undefined,
      });

      if (res.success && res.pago) {
        setReciboGenerado(res.pago);
        setMensajeExito(`¡Pago registrado exitosamente! Recibo correlativo ${res.pago.numero_recibo} generado.`);
        setErrorMsg(null);

        // Re-sync cuota selection against the just-refreshed (server-authoritative)
        // cuota list. Without this, selectedCuotasIds keeps referencing whatever
        // was checked before this payment — including cuotas this payment just
        // closed — so a second payment made right after the first would send a
        // stale/closed cuota id and silently land as 100% wallet credit instead
        // of applying to the family's next open cuota.
        if (selectedFamiliaId) handleSelectFamilia(selectedFamiliaId);

        // Trigger Confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {}
      } else {
        setErrorMsg(res.error || 'Error al procesar la imputación. La cuota NO fue marcada como pagada.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
              Ventanilla Única
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Cobranza & Registro de Pago
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Imputación atómica FIFO con bloqueo de concurrencia, numeración consecutiva y emisión de recibo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Motor FIFO Activo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Buscador Rápido de Familias y Alumnos (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  1. Buscar Familia o Alumno
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Búsqueda por apellido, cédula, teléfono o instrumento.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">
                {filteredFamilias.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Nombre, cédula, teléfono, alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Results list */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredFamilias.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                  No se encontraron familias que coincidan con la búsqueda.
                </div>
              ) : (
                filteredFamilias.map(fam => {
                  const isSelected = selectedFamiliaId === fam.id;
                  const totalPendiente = cuotas.filter(c => c.familia_id === fam.id && (c.estado === 'pendiente' || c.estado === 'parcial'))
                    .reduce((acc, c) => acc + c.saldo_centavos, 0);
                  const alus = alumnos.filter(a => a.familia_id === fam.id);

                  return (
                    <div
                      key={fam.id}
                      onClick={() => handleSelectFamilia(fam.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50' 
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-xs text-white flex items-center gap-2">
                            <span>Familia {fam.apellidos}</span>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">({fam.codigo_familia})</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1">
                            Rep: {fam.representante_principal?.nombre_completo || 'Sin registro'} · Tel: {fam.telefono_principal}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-zinc-500 text-[10px]">Alumnos:</span>
                            {alus.map(a => (
                              <span key={a.id} className="px-2 py-0.5 bg-zinc-800/80 rounded-lg text-[10px] text-zinc-300 font-mono">
                                {a.nombre_completo} ({a.instrumento_principal})
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-xs font-mono font-bold ${totalPendiente > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {totalPendiente > 0 ? formatDOP(totalPendiente) : 'Al Día'}
                          </div>
                          <span className={`inline-block mt-1.5 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                            fam.isp.categoria === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            fam.isp.categoria === 'B' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                            fam.isp.categoria === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            fam.isp.categoria === 'D' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            ISP: {fam.isp.categoria} ({fam.isp.valor})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* Right Col: Detalle de Imputación y Formulario de Registro (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {!selectedFamilia ? (
            <div className="bg-zinc-900 rounded-[2.5rem] p-12 border border-zinc-800 text-center text-zinc-400 flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <User className="w-10 h-10 text-zinc-500 stroke-1" />
              </div>
              <div className="font-semibold text-sm text-zinc-200">Seleccione una familia para iniciar el registro</div>
              <p className="text-xs max-w-sm text-zinc-500">
                Podrá seleccionar cuotas específicas por alumno, aplicar pagos parciales o generar crédito en wallet institucional.
              </p>
            </div>
          ) : (
            <form onSubmit={handleExecutePayment} className="space-y-4">
              
              {/* Selected Family Summary Card */}
              <div className="bg-gradient-to-r from-zinc-900 to-indigo-950/50 text-white p-6 rounded-[2.2rem] border border-indigo-500/30 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      Cuenta Familiar Activa
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      Familia {selectedFamilia.apellidos} · <span className="font-mono text-zinc-400">{selectedFamilia.codigo_familia}</span>
                    </div>
                    <div className="text-xs text-zinc-300 mt-1">
                      Representante: {selectedFamilia.representante_principal?.nombre_completo} ({selectedFamilia.representante_principal?.cedula})
                    </div>
                  </div>

                  <div className="sm:text-right bg-zinc-950/80 px-4 py-2.5 rounded-2xl border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Wallet Institucional</div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      {formatDOP(selectedFamilia.credito_favor_centavos)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Selection by Student */}
              <div className="bg-zinc-900 p-6 rounded-[2.2rem] border border-zinc-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    2. Seleccionar Cuotas a Imputar ({selectedCuotasIds.length} seleccionadas)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllCuotas}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Seleccionar Todas
                  </button>
                </div>

                {familiaCuotasPendientes.length === 0 ? (
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Esta familia no tiene cuotas vencidas ni pendientes en el período actual.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {familiaCuotasPendientes.map(cuota => {
                      const isChecked = selectedCuotasIds.includes(cuota.id);
                      return (
                        <div
                          key={cuota.id}
                          onClick={() => handleToggleCuota(cuota.id)}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/30' 
                              : 'bg-zinc-950/60 border-zinc-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-950 border-zinc-700"
                            />
                            <div>
                              <div className="text-xs font-semibold text-zinc-200">
                                {cuota.alumno_nombre} · <span className="text-zinc-400">{cuota.arancel_concepto}</span>
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                Período: {cuota.periodo} · Vence: {cuota.fecha_vencimiento}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-white">
                              {formatDOP(cuota.saldo_centavos)}
                            </div>
                            {cuota.descuento_beca_centavos > 0 && (
                              <div className="text-[10px] text-emerald-400 font-mono">
                                Beca: -{formatDOP(cuota.descuento_beca_centavos)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment execution parameters */}
              <div className="bg-zinc-900 p-6 rounded-[2.2rem] border border-zinc-800 shadow-xl space-y-4">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  3. Datos de la Transacción
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="monto-pago-input" className="text-xs font-semibold text-zinc-400 block">
                        Monto a Recibir (DOP)
                      </label>
                      {familiaCuotasPendientes.length > 0 && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const sum = familiaCuotasPendientes.reduce((acc, c) => acc + c.saldo_centavos, 0);
                              setMontoPagarInput((sum / 100).toString());
                              handleSelectAllCuotas();
                            }}
                            className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-md text-[10px] font-mono font-semibold border border-indigo-500/20 transition-colors"
                          >
                            100%
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const sum = familiaCuotasPendientes.reduce((acc, c) => acc + c.saldo_centavos, 0);
                              setMontoPagarInput((sum / 200).toString());
                            }}
                            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-[10px] font-mono font-semibold border border-zinc-700 transition-colors"
                          >
                            50%
                          </button>
                          {familiaCuotasPendientes[0] && (
                            <button
                              type="button"
                              onClick={() => {
                                setMontoPagarInput((familiaCuotasPendientes[0].saldo_centavos / 100).toString());
                                setSelectedCuotasIds([familiaCuotasPendientes[0].id]);
                              }}
                              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-[10px] font-mono font-semibold border border-zinc-700 transition-colors"
                            >
                              1 Cuota
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-zinc-500 font-bold">RD$</span>
                      <input
                        id="monto-pago-input"
                        type="text"
                        value={montoPagarInput}
                        onChange={(e) => setMontoPagarInput(e.target.value)}
                        className="w-full pl-12 pr-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="metodo-pago-select" className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Método de Pago
                    </label>
                    <select
                      id="metodo-pago-select"
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                      className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="transferencia">Transferencia Bancaria (BPD / Reservas)</option>
                      <option value="efectivo">Efectivo en Ventanilla</option>
                      <option value="pago_movil">Pago Móvil / TPago</option>
                      <option value="tarjeta">Tarjeta de Débito / Crédito</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fecha-pago-input" className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Fecha de Valor (Efectiva)
                    </label>
                    <input
                      id="fecha-pago-input"
                      type="date"
                      value={fechaPago}
                      onChange={(e) => setFechaPago(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="referencia-pago-input" className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Referencia o N° Transferencia
                    </label>
                    <input
                      id="referencia-pago-input"
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ej: BPD-TRF-994821"
                      className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                </div>

                <div>
                  <label htmlFor="observaciones-pago-input" className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Observaciones (Opcional)
                  </label>
                  <input
                    id="observaciones-pago-input"
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Nota administrativa para el recibo..."
                    className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {mensajeExito && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{mensajeExito}</span>
                    </div>
                    {reciboGenerado && (
                      <button
                        type="button"
                        onClick={() => setReciboGenerado(reciboGenerado)}
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold underline cursor-pointer"
                      >
                        Ver Recibo
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    id="btn-register-payment"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-sm shadow-xl shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isSubmitting ? 'Registrando pago…' : 'Confirmar e Imputar Pago Transaccional'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFamiliaId) handleSelectFamilia(selectedFamiliaId);
                      setReferencia('');
                      setObservaciones('');
                      setMensajeExito(null);
                      setErrorMsg(null);
                    }}
                    title="Restablecer formulario"
                    className="px-4 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-2xl transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </form>
          )}

        </div>

      </div>

      {/* Official Receipt Modal / Preview when generated */}
      {reciboGenerado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-[2.5rem] max-w-lg w-full p-7 shadow-2xl border border-zinc-800 space-y-5 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Recibo Oficial de Pago</h3>
                  <p className="text-[11px] text-zinc-400">FUNEYCA-PC · El Sistema Punta Cana</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold bg-zinc-950 text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-800">
                {reciboGenerado.numero_recibo}
              </span>
            </div>

            <div className="bg-zinc-950 p-5 rounded-2xl space-y-2.5 text-xs text-zinc-300 border border-zinc-800/80">
              <div className="flex justify-between">
                <span className="text-zinc-500">Familia / Representante:</span>
                <span className="font-semibold text-white">{reciboGenerado.representante_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha de Pago:</span>
                <span className="font-mono text-zinc-300">{reciboGenerado.fecha_pago}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Método de Pago:</span>
                <span className="font-medium uppercase text-zinc-300">{reciboGenerado.metodo_pago}</span>
              </div>
              {reciboGenerado.referencia_bancaria && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Referencia:</span>
                  <span className="font-mono text-indigo-400">{reciboGenerado.referencia_bancaria}</span>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <span className="font-semibold text-zinc-200 block">Conceptos Imputados:</span>
                {reciboGenerado.aplicaciones.map((app, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">{app.alumno_nombre} ({app.cuota_periodo})</span>
                    <span className="font-mono font-semibold text-white">{formatDOP(app.monto_aplicado_centavos)}</span>
                  </div>
                ))}
              </div>

              {reciboGenerado.credito_generado_centavos > 0 && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex justify-between font-semibold">
                  <span>Excedente acreditado a Wallet:</span>
                  <span className="font-mono">{formatDOP(reciboGenerado.credito_generado_centavos)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-300">TOTAL RECIBIDO:</span>
                <span className="text-emerald-400 font-mono text-lg">{formatDOP(reciboGenerado.monto_total_centavos)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                onClick={() => {
                  const txt = `*RECIBO DE PAGO - EL SISTEMA PUNTA CANA*\nRecibo: ${reciboGenerado.numero_recibo}\nRepresentante: ${reciboGenerado.representante_nombre}\nMonto: ${formatDOP(reciboGenerado.monto_total_centavos)}\nFecha: ${reciboGenerado.fecha_pago}\n¡Gracias por su puntual apoyo a la formación musical de sus hijos!`;
                  navigator.clipboard.writeText(txt);
                  setCopiedWhatsApp(true);
                  setTimeout(() => setCopiedWhatsApp(false), 3000);
                }}
                className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>{copiedWhatsApp ? '¡Copiado!' : 'Copiar WhatsApp'}</span>
              </button>
              <button
                onClick={() => setReciboGenerado(null)}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 rounded-xl font-semibold text-xs border border-zinc-800 transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
