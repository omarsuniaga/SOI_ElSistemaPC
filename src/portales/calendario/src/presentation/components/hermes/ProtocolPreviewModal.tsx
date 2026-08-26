import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../../context/AppContainerContext';
import { useUIStore } from '../../state/uiStore';
import { ProtocolPreviewDTO } from '../../../application/orchestration/dtos/OperationalHealthDTO';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { DepartmentCode } from '../../../domain/shared/types';
import {
  X,
  Workflow,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export const ProtocolPreviewModal: React.FC = () => {
  const container = useAppContainer();
  const { previewProtocolCode, previewTargetDate, closeProtocolPreview, openItemDrawer } = useUIStore();
  const [preview, setPreview] = useState<ProtocolPreviewDTO | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (previewProtocolCode) {
      setIsActivated(false);
      container.generateProtocolPreview
        .execute(previewProtocolCode, previewTargetDate || new Date().toISOString())
        .then(setPreview);
    } else {
      setPreview(null);
    }
  }, [previewProtocolCode, previewTargetDate]);

  if (!previewProtocolCode || !preview) return null;

  const handleActivate = () => {
    setIsActivated(true);
    setTimeout(() => {
      closeProtocolPreview();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-400">
                  {preview.processCode}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  • {preview.estimatedDurationDays} días de horizonte
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-100">{preview.processName}</h3>
            </div>
          </div>
          <button
            onClick={closeProtocolPreview}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Participating Departments */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400 font-mono">Departamentos involucrados:</span>
          {preview.participatingDepartments.map(d => (
            <DepartmentBadge key={d} code={d as DepartmentCode} size="sm" />
          ))}
        </div>

        {/* Proposed Tasks Flow */}
        <div className="mt-4 max-h-80 overflow-y-auto pr-1 space-y-2">
          <p className="text-xs font-mono text-zinc-400 uppercase font-semibold">
            Tareas Derivadas del Protocolo (WBS / Cronograma)
          </p>
          {preview.proposedTasks.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="font-mono text-xs font-bold text-amber-400 w-12 shrink-0">
                  {t.offsetDays === 0
                    ? 'T0'
                    : t.offsetDays > 0
                    ? `T+${t.offsetDays}`
                    : `T${t.offsetDays}`}
                </div>
                <div>
                  <div className="font-medium text-zinc-200">{t.title}</div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span>{t.ownerRole}</span>
                    {t.evidenceRequired && (
                      <span className="flex items-center gap-1 text-indigo-400 text-[10px]">
                        <FileCheck className="w-3 h-3" /> Evidencia obligatoria
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DepartmentBadge code={t.department as DepartmentCode} size="sm" />
                <PriorityBadge priority={t.priority as any} size="sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-mono">
            Generará correlationId único para observabilidad en Hermes.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={closeProtocolPreview}
              className="px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 text-xs hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleActivate}
              disabled={isActivated}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                isActivated
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {isActivated ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Protocolo Activado</span>
                </>
              ) : (
                <>
                  <Workflow className="w-4 h-4" />
                  <span>Activar Protocolo SOI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
