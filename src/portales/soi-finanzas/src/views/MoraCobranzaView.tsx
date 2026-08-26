import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  AlertCircle,
  Handshake,
  ShieldAlert,
  Clock,
  MessageSquare,
  Calendar,
  CheckCircle2,
  User,
  Plus,
  HelpCircle,
  FileCheck,
  ArrowRight,
  X,
  CreditCard
} from 'lucide-react';
import { formatDOP } from '../lib/financialMath';

interface MoraCobranzaViewProps {
  setActiveView?: (view: string) => void;
}

export const MoraCobranzaView: React.FC<MoraCobranzaViewProps> = ({ setActiveView }) => {
  const { familias, cuotas, compromisos, crearCompromisoPago, iniciarCobroFamilia } = useFinance();
  const [selectedFamilyForAgreement, setSelectedFamilyForAgreement] = useState<string | null>(null);
  const [agreementAmount, setAgreementAmount] = useState<string>('');
  const [agreementDate, setAgreementDate] = useState<string>('');
  const [agreementText, setAgreementText] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleCobrarFamilia = (famId: string) => {
    iniciarCobroFamilia(famId);
    if (setActiveView) {
      setActiveView('registro_pago');
    }
  };

  // Group families by delinquency stage (FIN-P13 Policy)
  const familiasConMora = familias.filter(f => f.saldo_pendiente_centavos > 0);

  const familiasPreventivas = familiasConMora.filter(f => f.estado_cartera === 'preventivo' || f.isp.categoria === 'C');
  const familiasMoraTemprana = familiasConMora.filter(f => f.estado_cartera === 'mora_temprana' || f.isp.categoria === 'D');
  const familiasMoraCritica = familiasConMora.filter(f => f.estado_cartera === 'mora_critica' || f.isp.categoria === 'E');
  const familiasConvenio = familias.filter(f => f.estado_cartera === 'convenio');

  const handleOpenAgreement = (famId: string) => {
    setSelectedFamilyForAgreement(famId);
    const fam = familias.find(f => f.id === famId);
    if (fam) {
      setAgreementAmount((fam.saldo_pendiente_centavos / 100).toString());
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setAgreementDate(nextWeek.toISOString().split('T')[0]);
      setAgreementText(`Compromiso de pago en cuota(s) acordado con ${fam.representante_principal?.nombre_completo || 'el representante'}.`);
    }
  };

  const handleSaveAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamilyForAgreement) return;
    const fam = familias.find(f => f.id === selectedFamilyForAgreement);
    if (!fam) return;

    const cuotasFam = cuotas.filter(c => c.familia_id === fam.id && c.saldo_centavos > 0);

    crearCompromisoPago({
      familia_id: fam.id,
      representante_id: fam.representante_id || 'rep-default',
      cuotas_ids: cuotasFam.map(c => c.id),
      monto_centavos: parseFloat(agreementAmount) * 100,
      fecha_limite: agreementDate,
      acuerdo_texto: agreementText,
    });

    setSuccessNotice(`Convenio formal registrado para Familia ${fam.apellidos}. La deuda pasa al tramo de Cartera en Convenio (G-13).`);
    setSelectedFamilyForAgreement(null);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className="space-y-6">

      {/* Bento Header & Policy Statement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Cartera & Acompañamiento
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2 tracking-tight">
            Gestión Humanizada de Cobranza & Acuerdos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Acompañamiento socioeconómico respetuoso, convenios de pago y salvaguarda ética de no exclusión educativa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Salvaguarda Ética: Cero Bloqueos Automáticos</span>
          </span>
        </div>
      </div>

      {/* Ethical Protocol Notice */}
      <div className="p-5 bg-gradient-to-r from-amber-950/30 to-zinc-900 rounded-[2.2rem] border border-amber-500/20 text-xs text-amber-200 space-y-1.5 shadow-xl">
        <div className="flex items-center gap-2 font-semibold text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Principio Institucional de Cobranza Protectora:</span>
        </div>
        <p className="text-zinc-400 text-[11px] leading-relaxed">
          El estado de morosidad constituye una alerta de seguimiento y nunca autoriza a suspender a un menor de sus clases o retirar su instrumento.
          Ante dificultades severas, el protocolo FIN-P13 exige proponer convenios escalonados o evaluar la postulación a la Beca Social FUNEYCA.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Delinquency Segmentation Tiers (Bento 3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Tier 1: Seguimiento Preventivo (Cat C) */}
        <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Etapa 1</span>
              <h2 className="text-sm font-semibold text-white mt-0.5">Seguimiento Preventivo</h2>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
              {familiasPreventivas.length} familias
            </span>
          </div>

          <div className="space-y-3">
            {familiasPreventivas.map(fam => (
              <div key={fam.id} className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-2.5">
                <div className="flex justify-between font-semibold text-white">
                  <span>Familia {fam.apellidos}</span>
                  <span className="text-rose-400 font-mono font-bold">{formatDOP(fam.saldo_pendiente_centavos)}</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Rep: {fam.representante_principal?.nombre_completo} · Tel: {fam.telefono_principal}
                </div>
                <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">ISP: {fam.isp.valor} (Cat. C)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCobrarFamilia(fam.id)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Registrar Pago</span>
                    </button>
                    <button
                      onClick={() => {
                        const msg = `Hola estimado/a ${fam.representante_principal?.nombre_completo}, le saludamos cordialmente de El Sistema Punta Cana. Le recordamos amablemente la cuota mensual pendiente de sus hijos. Estamos a su orden para cualquier consulta.`;
                        navigator.clipboard.writeText(msg);
                        setSuccessNotice(`Mensaje de WhatsApp preventivo copiado al portapapeles para ${fam.representante_principal?.nombre_completo}.`);
                        setTimeout(() => setSuccessNotice(null), 4000);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Atención & Mora Temprana (Cat D) */}
        <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">Etapa 2</span>
              <h2 className="text-sm font-semibold text-white mt-0.5">Mora Temprana (31-60 Días)</h2>
            </div>
            <span className="text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full">
              {familiasMoraTemprana.length} familias
            </span>
          </div>

          <div className="space-y-3">
            {familiasMoraTemprana.map(fam => (
              <div key={fam.id} className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-2.5">
                <div className="flex justify-between font-semibold text-white">
                  <span>Familia {fam.apellidos}</span>
                  <span className="text-rose-400 font-mono font-bold">{formatDOP(fam.saldo_pendiente_centavos)}</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Contacto: {fam.representante_principal?.nombre_completo} ({fam.telefono_principal})
                </div>
                <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-orange-400 font-bold">ISP: {fam.isp.valor} (Cat. D)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCobrarFamilia(fam.id)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Registrar Pago</span>
                    </button>
                    <button
                      onClick={() => handleOpenAgreement(fam.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>Crear Convenio</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Mora Crítica & Casos Especiales (Cat E) */}
        <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest">Etapa 3</span>
              <h2 className="text-sm font-semibold text-white mt-0.5">Mora Crítica (&gt;60 Días)</h2>
            </div>
            <span className="text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
              {familiasMoraCritica.length} familias
            </span>
          </div>

          <div className="space-y-3">
            {familiasMoraCritica.map(fam => (
              <div key={fam.id} className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-2.5">
                <div className="flex justify-between font-semibold text-white">
                  <span>Familia {fam.apellidos}</span>
                  <span className="text-rose-400 font-mono font-bold">{formatDOP(fam.saldo_pendiente_centavos)}</span>
                </div>
                <p className="text-[11px] text-zinc-400 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  {fam.notas_cobranza || 'Caso especial que requiere evaluación para asignación de Beca Social o convenio de cuota única.'}
                </p>
                <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-rose-400 font-bold">Visto Bueno DIR</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCobrarFamilia(fam.id)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Registrar Pago</span>
                    </button>
                    <button
                      onClick={() => handleOpenAgreement(fam.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Handshake className="w-3.5 h-3.5 text-amber-300" />
                      <span>Pactar Convenio</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Payment Agreement Form Modal */}
      {selectedFamilyForAgreement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-[2.5rem] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-800 space-y-5">

            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  🤝
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Registrar Convenio de Pago</h3>
                  <p className="text-xs text-zinc-400">Reestructuración formal de cartera</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFamilyForAgreement(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAgreement} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Monto del Compromiso (DOP)</label>
                <input
                  type="number"
                  step="0.01"
                  value={agreementAmount}
                  onChange={(e) => setAgreementAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Fecha Límite para Pago</label>
                <input
                  type="date"
                  value={agreementDate}
                  onChange={(e) => setAgreementDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Acuerdo & Condiciones Pactadas</label>
                <textarea
                  value={agreementText}
                  onChange={(e) => setAgreementText(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFamilyForAgreement(null)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-950/50 transition-all cursor-pointer"
                >
                  Formalizar Convenio
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

