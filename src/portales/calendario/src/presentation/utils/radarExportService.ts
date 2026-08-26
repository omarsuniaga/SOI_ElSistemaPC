import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RadarSummaryDTO } from '../../application/calendar/dtos/CalendarItemDTO';
import {
  formatInstitutionalDate,
  formatInstitutionalTime,
  formatInstitutionalDateTime,
  getTimeZoneAbbr,
  DEFAULT_INSTITUTION_TIMEZONE,
} from './dateTimeFormatter';

export interface ExportRadarOptions {
  timeZone: string;
  departmentFilter?: string;
  horizonFilter?: string;
  includeHealthDiagnostics?: boolean;
}

/**
 * Clean string for CSV cell (escapes double quotes and surrounds with quotes if necessary)
 */
function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports current temporal radar insights into a CSV spreadsheet
 */
export function exportRadarToCSV(
  radar: RadarSummaryDTO,
  options: ExportRadarOptions
): void {
  const { timeZone, departmentFilter = 'ALL', horizonFilter = 'ALL' } = options;
  const tzAbbr = getTimeZoneAbbr(timeZone);

  const headers = [
    'Horizonte Temporal',
    'Departamento',
    'Hito Institucional',
    'Tipo de Hito',
    'Acción / Trigger',
    'Protocolo SOP',
    'Fecha de Disparo (Local)',
    'Hora de Disparo (Local)',
    'Zona Horaria',
    'Salud Operativa',
    'Score de Salud (%)',
    'Tareas Activas',
    'Tareas Bloqueadas',
    'Aprobaciones Pendientes',
    'Diagnóstico de Riesgo',
  ];

  const rows: string[][] = [];

  for (const group of radar.horizons) {
    if (horizonFilter !== 'ALL' && group.horizon !== horizonFilter) {
      continue;
    }

    for (const item of group.items) {
      if (departmentFilter !== 'ALL' && item.trigger.department !== departmentFilter) {
        continue;
      }

      const dateStr = formatInstitutionalDate(item.trigger.fireAt, timeZone);
      const timeStr = formatInstitutionalTime(item.trigger.fireAt, timeZone);
      const diagMessages = item.health.reasons.join(' | ') || 'Operación Nominal';

      rows.push([
        escapeCsvCell(group.label),
        escapeCsvCell(item.trigger.department),
        escapeCsvCell(item.calendarItem.title),
        escapeCsvCell(item.calendarItem.kind),
        escapeCsvCell(item.trigger.description),
        escapeCsvCell(item.trigger.protocolCode || 'N/A'),
        escapeCsvCell(dateStr),
        escapeCsvCell(timeStr),
        escapeCsvCell(tzAbbr),
        escapeCsvCell(item.health.status),
        escapeCsvCell(`${item.health.score}%`),
        escapeCsvCell(item.activeTasksCount),
        escapeCsvCell(item.blockedCount),
        escapeCsvCell(item.pendingApprovalsCount),
        escapeCsvCell(diagMessages),
      ]);
    }
  }

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  const csvContent =
    '\uFEFF' +
    headers.map(h => `"${h}"`).join(',') +
    '\n' +
    rows.map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const nowStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `SOI_Radar_Temporal_Insights_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports current temporal radar insights into a formal, highly styled PDF executive report
 */
export function exportRadarToPDF(
  radar: RadarSummaryDTO,
  options: ExportRadarOptions
): void {
  const { timeZone, departmentFilter = 'ALL', horizonFilter = 'ALL' } = options;
  const tzAbbr = getTimeZoneAbbr(timeZone);
  const now = new Date();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Theme colors
  const primaryColor: [number, number, number] = [245, 158, 11]; // Amber 500
  const darkBg: [number, number, number] = [15, 17, 23]; // Zinc 950
  const textDark: [number, number, number] = [24, 24, 27];

  // Header Banner
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, 297, 30, 'F');

  // Title & Institution
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA DE ORQUESTACIÓN INSTITUCIONAL (SOI)', 14, 12);

  doc.setTextColor(228, 228, 231);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Informe Ejecutivo de Inteligencia y Radar Temporal — Fundación Escuela y Conservatorio de Música Punta Cana (FUNEYCA)',
    14,
    18
  );

  // Metadata Right-Aligned
  doc.setTextColor(161, 161, 170);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${formatInstitutionalDateTime(now, timeZone)} (${tzAbbr})`, 283, 12, { align: 'right' });
  doc.text(`Filtro Dept: ${departmentFilter}  |  Filtro Horizonte: ${horizonFilter}`, 283, 18, { align: 'right' });

  // Decorative Amber line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(14, 30, 283, 30);

  // Summary Metrics Cards Block (Y: 34 to 50)
  const startYMetrics = 34;
  const cardWidth = 51;
  const cardHeight = 16;
  const spacing = 3.5;

  const metrics = [
    { label: 'Hitos en Calendario', val: `${radar.totalUpcomingItems}`, sub: 'Horizonte Activo', color: [245, 158, 11] },
    { label: 'Triggers Programados', val: `${radar.activeTriggersCount}`, sub: 'Evaluación T-X', color: [99, 102, 241] },
    { label: 'Protocolos en Ejecución', val: `${radar.activeProtocolRunsCount}`, sub: 'SOPs Hermes', color: [16, 185, 129] },
    { label: 'Hitos en Riesgo', val: `${radar.riskItemsCount}`, sub: 'Atención Requerida', color: [249, 115, 22] },
    { label: 'Puntos Críticos / Bloqueos', val: `${radar.criticalItemsCount}`, sub: 'Riesgo Inminente', color: [239, 68, 68] },
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (cardWidth + spacing);
    doc.setFillColor(244, 244, 245);
    doc.roundedRect(x, startYMetrics, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(228, 228, 231);
    doc.roundedRect(x, startYMetrics, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(113, 113, 122);
    doc.text(m.label.toUpperCase(), x + 3, startYMetrics + 4.5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.val, x + 3, startYMetrics + 10.5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(161, 161, 170);
    doc.text(m.sub, x + 3, startYMetrics + 14.5);
  });

  // Table Data Assembly
  const tableData: (string | number)[][] = [];

  for (const group of radar.horizons) {
    if (horizonFilter !== 'ALL' && group.horizon !== horizonFilter) {
      continue;
    }

    for (const item of group.items) {
      if (departmentFilter !== 'ALL' && item.trigger.department !== departmentFilter) {
        continue;
      }

      const dateStr = `${formatInstitutionalDate(item.trigger.fireAt, timeZone)}\n${formatInstitutionalTime(item.trigger.fireAt, timeZone)} ${tzAbbr}`;
      const diag = item.health.reasons.length > 0 ? item.health.reasons.join(', ') : 'Operación Nominal';

      tableData.push([
        group.label,
        item.trigger.department,
        item.calendarItem.title,
        `${item.trigger.description}${item.trigger.protocolCode ? `\n[SOP: ${item.trigger.protocolCode}]` : ''}`,
        dateStr,
        `${item.health.status} (${item.health.score}%)`,
        `Act: ${item.activeTasksCount} | Bloq: ${item.blockedCount}\nAprob: ${item.pendingApprovalsCount}`,
        diag,
      ]);
    }
  }

  // Draw AutoTable
  autoTable(doc, {
    startY: 54,
    head: [
      [
        'Horizonte',
        'Dept.',
        'Hito / Evento Institucional',
        'Acción Programada & SOP',
        'Disparo (Local)',
        'Salud',
        'Cargas',
        'Diagnóstico Operativo',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [245, 158, 11],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [39, 39, 42],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 20 },
      2: { cellWidth: 48, fontStyle: 'bold' },
      3: { cellWidth: 54 },
      4: { cellWidth: 28 },
      5: { cellWidth: 24 },
      6: { cellWidth: 25 },
      7: { cellWidth: 42 },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: data => {
      // Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;

      doc.setFontSize(7.5);
      doc.setTextColor(161, 161, 170);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'FUNEYCA • Sistema de Orquestación Institucional (SOI) — Confidencial para Uso de Dirección y Coordinación',
        14,
        202
      );
      doc.text(`Página ${currentPage} de ${pageCount}`, 283, 202, { align: 'right' });
    },
  });

  const nowStr = new Date().toISOString().slice(0, 10);
  doc.save(`SOI_Radar_Temporal_Informe_Ejecutivo_${nowStr}.pdf`);
}
