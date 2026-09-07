import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import { 
  Receipt, 
  Plus, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Truck,
  DollarSign,
  X,
  PlusCircle
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';
import { FacturaGasto, MetodoPago } from '../types';

export const FacturasGastoView: React.FC = () => {
  const { 
    facturasGasto, 
    proveedores, 
    partidas, 
    currentUser, 
    aprobarFacturaGasto, 
    registrarPagoFacturaGasto,
    crearFacturaGasto
  } = useFinance();

  const [paymentModalFactura, setPaymentModalFactura] = useState<FacturaGasto | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('transferencia');
  const [referencia, setReferencia] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // New Invoice Form state
  const [nuevoProveedorId, setNuevoProveedorId] = useState(proveedores[0]?.id || '');
  const [nuevoNumFactura, setNuevoNumFactura] = useState('');
  const [nuevoNCF, setNuevoNCF] = useState('');
  const [nuevoConcepto, setNuevoConcepto] = useState('');
  const [nuevoCentroCosto, setNuevoCentroCosto] = useState<'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT'>('LOG');
  const [nuevaPartidaId, setNuevaPartidaId] = useState(partidas[0]?.id || '');
  const [nuevoMontoBruto, setNuevoMontoBruto] = useState<number>(10000);
  const [nuevoITBIS, setNuevoITBIS] = useState<number>(1800);
  const [nuevaRetencion, setNuevaRetencion] = useState<number>(0);
  const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );

  const handleApprove = (facturaId: string) => {
    const res = aprobarFacturaGasto(facturaId);
    if (res.success) {
      setActionNotice('Factura aprobada formalmente para pago. Partida presupuestaria comprometida.');
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      setErrorNotice(res.error || 'Error al aprobar factura.');
      setTimeout(() => setErrorNotice(null), 4000);
    }
  };

  const handleExecutePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalFactura) return;

    const res = registrarPagoFacturaGasto(paymentModalFactura.id, metodoPago, referencia || 'TRF-BPD-DIRECTA');
    if (res.success) {
      setActionNotice(`Pago a ${paymentModalFactura.proveedor_nombre} ejecutado exitosamente. Asiento AS-08 registrado.`);
      setPaymentModalFactura(null);
      setTimeout(() => setActionNotice(null), 5000);
    } else {
      setErrorNotice(res.error || 'Error al ejecutar el pago.');
    }
  };

  const handleCreateFactura = (e: React.FormEvent) => {
    e.preventDefault();
    const prov = proveedores.find(p => p.id === nuevoProveedorId) || proveedores[0];

    const res = crearFacturaGasto({
      proveedor_id: prov?.id || `prov-${Date.now()}`,
      proveedor_nombre: prov?.nombre_comercial || 'Proveedor Institucional',
      concepto: nuevoConcepto,
      centro_costo: nuevoCentroCosto,
      partida_presupuestaria_id: nuevaPartidaId,
      monto_bruto_centavos: Math.round(nuevoMontoBruto * 100),
      itbis_centavos: Math.round(nuevoITBIS * 100),
      retencion_centavos: Math.round(nuevaRetencion * 100),
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_vencimiento: nuevaFechaVencimiento,
      numero_factura: nuevoNumFactura || `FAC-${Date.now().toString().slice(-5)}`,
      ncf: nuevoNCF || `B01000${Math.floor(10000 + Math.random() * 90000)}`,
    });

    if (res.success) {
      setActionNotice('Factura de gasto registrada y comprometida en el presupuesto institucional.');
      setShowCreateModal(false);
      setNuevoNumFactura('');
      setNuevoNCF('');
      setNuevoConcepto('');
      setTimeout(() => setActionNotice(null), 5000);
    } else {
      setErrorNotice(res.error || 'Error al crear factura.');
    }
  };

  const totalPendientePagar = facturasGasto
    .filter(f => f.estado !== 'pagada' && f.estado !== 'anulada')
    .reduce((acc, f) => acc + f.monto_neto_centavos, 0);

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Tesorería & Proveedores
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Cuentas por Pagar & Facturas de Gastos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Flujo de validación, aprobación por niveles y desembolso bancario con retenciones fiscales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Factura</span>
          </button>

          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-right flex flex-col items-end justify-center shadow-xl">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total por Pagar:</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-rose-400 mt-0.5">
              {formatDOP(totalPendientePagar)}
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Invoices Bento Table */}
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-5">Factura / NCF</th>
                <th className="py-3 px-5">Proveedor</th>
                <th className="py-3 px-5">Concepto / Partida</th>
                <th className="py-3 px-5">Bruto</th>
                <th className="py-3 px-5">ITBIS</th>
                <th className="py-3 px-5">Neto a Pagar</th>
                <th className="py-3 px-5">Vencimiento</th>
                <th className="py-3 px-5">Estado</th>
                <th className="py-3 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {facturasGasto.map(fac => (
                <tr key={fac.id} className="hover:bg-zinc-950/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-white">{fac.numero_factura}</div>
                    <div className="text-[10px] font-mono text-indigo-400 mt-0.5">NCF: {fac.ncf || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-medium text-zinc-200">{fac.proveedor_nombre}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono font-medium inline-block mt-1">
                      Centro: {fac.centro_costo}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 max-w-xs text-zinc-400 text-xs">
                    {fac.concepto}
                  </td>
                  <td className="py-3.5 px-5 text-zinc-400 font-mono">
                    {formatDOP(fac.monto_bruto_centavos)}
                  </td>
                  <td className="py-3.5 px-5 text-zinc-400 font-mono">
                    {formatDOP(fac.itbis_centavos)}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-semibold text-white">
                    {formatDOP(fac.monto_neto_centavos)}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-zinc-300">
                    {fac.fecha_vencimiento}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      fac.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      fac.estado === 'aprobada' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                      fac.estado === 'validada' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {fac.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {fac.estado === 'validada' && (
                      <button
                        onClick={() => handleApprove(fac.id)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                      >
                        Aprobar Gasto
                      </button>
                    )}
                    {fac.estado === 'aprobada' && (
                      <button
                        onClick={() => setPaymentModalFactura(fac)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                      >
                        Registrar Pago
                      </button>
                    )}
                    {fac.estado === 'pagada' && (
                      <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                        Pagado ({fac.fecha_pago})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {paymentModalFactura && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-[2.5rem] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-800 space-y-5">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-semibold text-base text-white">Registrar Desembolso a Proveedor</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{paymentModalFactura.proveedor_nombre} · <span className="font-mono text-indigo-400">{paymentModalFactura.numero_factura}</span></p>
              </div>
              <button
                onClick={() => setPaymentModalFactura(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950/80 p-4 rounded-2xl text-xs space-y-2 border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Monto Neto a Desembolsar:</span>
                <span className="font-mono font-bold text-base text-emerald-400">{formatDOP(paymentModalFactura.monto_neto_centavos)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Cuenta de Débito:</span>
                <span className="font-medium text-zinc-300">Banco Popular Cuenta Corriente</span>
              </div>
            </div>

            <form onSubmit={handleExecutePay} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Método de Pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="transferencia">Transferencia Bancaria (LBTR / Directa)</option>
                  <option value="efectivo">Caja Chica</option>
                  <option value="tarjeta">Tarjeta Institucional</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Referencia Bancaria</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: TRF-BPD-992810"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalFactura(null)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  Confirmar Pago Bancario
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: Nueva Factura de Gasto */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-[2.5rem] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-800 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-base text-white">Registrar Factura de Proveedor</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-zinc-500 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFactura} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Proveedor:</label>
                  <select
                    value={nuevoProveedorId}
                    onChange={(e) => setNuevoProveedorId(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre_comercial} ({p.rnc_cedula})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Centro de Costo:</label>
                  <select
                    value={nuevoCentroCosto}
                    onChange={(e) => setNuevoCentroCosto(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACM">Académico / Maestros (ACM)</option>
                    <option value="DIR">Dirección Musical (DIR)</option>
                    <option value="LOG">Logística & Conciertos (LOG)</option>
                    <option value="ADM">Administración (ADM)</option>
                    <option value="FIN">Finanzas (FIN)</option>
                    <option value="LUT">Luthería & Mantenimiento (LUT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">No. Factura Proveedor:</label>
                  <input
                    type="text"
                    value={nuevoNumFactura}
                    onChange={(e) => setNuevoNumFactura(e.target.value)}
                    placeholder="FAC-00921"
                    required
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">NCF (Comprobante Fiscal):</label>
                  <input
                    type="text"
                    value={nuevoNCF}
                    onChange={(e) => setNuevoNCF(e.target.value)}
                    placeholder="B0100000045"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Concepto / Justificación del Gasto:</label>
                <input
                  type="text"
                  value={nuevoConcepto}
                  onChange={(e) => setNuevoConcepto(e.target.value)}
                  placeholder="Ej: Mantenimiento anual y cambio de cuerdas contrabajos"
                  required
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Partida Presupuestaria Afectada:</label>
                <select
                  value={nuevaPartidaId}
                  onChange={(e) => setNuevaPartidaId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {partidas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_partida} - {p.nombre} (Disponible: {formatDOP(p.disponible_centavos)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Monto Bruto (DOP):</label>
                  <input
                    type="number"
                    value={nuevoMontoBruto}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNuevoMontoBruto(val);
                      setNuevoITBIS(Math.round(val * 0.18));
                    }}
                    required
                    min="1"
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">ITBIS 18% (DOP):</label>
                  <input
                    type="number"
                    value={nuevoITBIS}
                    onChange={(e) => setNuevoITBIS(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Retención DGII (DOP):</label>
                  <input
                    type="number"
                    value={nuevaRetencion}
                    onChange={(e) => setNuevaRetencion(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs">
                <span className="text-zinc-300 font-medium">Neto Final a Desembolsar:</span>
                <span className="font-mono font-bold text-sm text-indigo-400">
                  {formatDOP(Math.round((nuevoMontoBruto + nuevoITBIS - nuevaRetencion) * 100))}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Comprometer y Validar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

