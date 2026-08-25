import React, { useState, useEffect } from 'react';
import { useAppContainer } from '../../context/AppContainerContext';
import { useUIStore } from '../../state/uiStore';
import { RadarSummaryDTO } from '../../../application/calendar/dtos/CalendarItemDTO';
import {
  exportRadarToCSV,
  exportRadarToPDF,
} from '../../utils/radarExportService';
import {
  formatInstitutionalDateTime,
  getTimeZoneAbbr,
} from '../../utils/dateTimeFormatter';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Filter,
  Globe2,
  CalendarDays,
  Zap,
  AlertTriangle,
  Flame,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export const RadarExportModal: React.FC = () => {
  const container = useAppContainer();
  const {
    isExportModalOpen,
    closeExportModal,
    preferredTimeZone,
    selectedDepartmentFilter,
  } = useUIStore();

  const [radar, setRadar] = useState<RadarSummaryDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [selectedDept, setSelectedDept] = useState<string>(selectedDepartmentFilter || 'ALL');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isExportModalOpen) {
      setLoading(true);
      setExportSuccess(null);
      container.getTemporalRadar
        .execute()
        .then(res => {
          setRadar(res);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching radar data for export:', err);
          setLoading(false);
        });
    }
  }, [isExportModalOpen, container]);

  if (!isExportModalOpen) return null;

  // Compute filtered items count
  let filteredItemsCount = 0;
  let filteredRiskCount = 0;
  let filteredCriticalCount = 0;

  if (radar) {
    for (const group of radar.horizons) {
      if (selectedHorizon !== 'ALL' && group.horizon !== selectedHorizon) continue;
      for (const item of group.items) {
        if (selectedDept !== 'ALL' && item.trigger.department !== selectedDept) continue;
        filteredItemsCount++;
        if (item.health.status === 'AT_RISK') filteredRiskCount++;
        if (item.health.status === 'CRITICAL') filteredCriticalCount++;
      }
    }
  }

  const handleExport = async () => {
    if (!radar) return;
    setIsExporting(true);
    setExportSuccess(null);

    try {
      const options = {
        timeZone: preferredTimeZone,
        departmentFilter: selectedDept,
        horizonFilter: selectedHorizon,
        includeHealthDiagnostics: true,
      };

      if (exportFormat === 'csv') {
        exportRadarToCSV(radar, options);
        setExportSuccess('Archivo CSV exportado exitosamente con codificación UTF-8.');
      } else {
        exportRadarToPDF(radar, options);
        setExportSuccess('Informe Ejecutivo PDF generado y descargado exitosamente.');
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const tzAbbr = getTimeZoneAbbr(preferredTimeZone);

  return (
    <div
      id="modal-export-radar"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Exportar Datos e Insights del Radar Temporal
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generación de tabulados CSV e informes ejecutivos PDF institucionales
              </p>
            </div>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={closeExportModal}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Format Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              1. Selecciona el Formato de Exportación
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CSV Option */}
              <button
                type="button"
                id="btn-select-format-csv"
                onClick={() => setExportFormat('csv')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  exportFormat === 'csv'
                    ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-100 block">Hoja de Cálculo (CSV)</span>
                      <span className="text-[11px] font-mono text-emerald-400">.csv (UTF-8)</span>
                    </div>
                  </div>
                  {exportFormat === 'csv' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Tabulado completo compatible con Excel, Google Sheets y Numbers con formato institucional y fechas sincronizadas.
                </p>
              </button>

              {/* PDF Option */}
              <button
                type="button"
                id="btn-select-format-pdf"
                onClick={() => setExportFormat('pdf')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  exportFormat === 'pdf'
                    ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/30'
                    : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-100 block">Informe Ejecutivo (PDF)</span>
                      <span className="text-[11px] font-mono text-amber-400">.pdf (Landscape A4)</span>
                    </div>
                  </div>
                  {exportFormat === 'pdf' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-500/20" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Documento formal con membrete FUNEYCA, bloques de KPI, tablas jerárquicas de disparadores y diagnósticos de salud.
                </p>
              </button>
            </div>
          </div>

          {/* Filtering Options */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                2. Alcance y Filtros del Reporte
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {filteredItemsCount} registros seleccionados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Filtrar por Departamento:
                </label>
                <select
                  id="select-export-dept"
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">Todos los Departamentos</option>
                  <option value="ACADEMIC">Académico (ACADEMIC)</option>
                  <option value="PRODUCTION">Producción Artística (PRODUCTION)</option>
                  <option value="LOGISTICS">Logística & Espacios (LOGISTICS)</option>
                  <option value="DIRECTION">Dirección General (DIRECTION)</option>
                  <option value="ADMIN">Administración & Finanzas (ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Filtrar por Horizonte Temporal:
                </label>
                <select
                  id="select-export-horizon"
                  value={selectedHorizon}
                  onChange={e => setSelectedHorizon(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ALL">Todos los Horizontes (T-0 a T-90+)</option>
                  <option value="OVERDUE">Retrasados / Vencidos</option>
                  <option value="TODAY">T0 — Hoy</option>
                  <option value="T-3">T-3 (Próximos 3 días)</option>
                  <option value="T-7">T-7 (Esta semana)</option>
                  <option value="T-15">T-15 (Próximos 15 días)</option>
                  <option value="T-30">T-30 (Próximos 30 días)</option>
                  <option value="T-60">T-60 (Mediano Plazo)</option>
                  <option value="T-90">T-90 (Largo Plazo)</option>
                  <option value="FUTURE">Horizonte Extendido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timezone Context Confirmation */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 text-xs">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <Globe2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Zona horaria institucional aplicada:{' '}
                <strong className="text-zinc-100 font-mono">{preferredTimeZone} ({tzAbbr})</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              Sincronizado
            </span>
          </div>

          {/* KPI Scope Summary */}
          {radar && (
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/30">
                <span className="text-[10px] text-zinc-500 font-mono block">TRIGGERS A EXPORTAR</span>
                <span className="text-base font-bold font-mono text-zinc-200">
                  {filteredItemsCount}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <span className="text-[10px] text-amber-500 font-mono block">EN ATENCIÓN</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {filteredRiskCount}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5">
                <span className="text-[10px] text-rose-500 font-mono block">BLOQUEOS CRÍTICOS</span>
                <span className="text-base font-bold font-mono text-rose-400">
                  {filteredCriticalCount}
                </span>
              </div>
            </div>
          )}

          {/* Export Success Message */}
          {exportSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            id="btn-cancel-export"
            onClick={closeExportModal}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cerrar
          </button>

          <button
            type="button"
            id="btn-confirm-export-data"
            onClick={handleExport}
            disabled={loading || isExporting || filteredItemsCount === 0}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold font-mono flex items-center gap-2 shadow-lg transition-all ${
              exportFormat === 'csv'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 disabled:bg-zinc-800 disabled:text-zinc-500'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/40 disabled:bg-zinc-800 disabled:text-zinc-500'
            }`}
          >
            {isExporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Generando Exportación...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  {exportFormat === 'csv' ? 'Descargar Archivo CSV' : 'Generar y Descargar PDF'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
