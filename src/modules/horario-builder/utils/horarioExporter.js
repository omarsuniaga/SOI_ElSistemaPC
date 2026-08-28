/**
 * Utility exporter for schedule assignments to structured PDF and Excel sheets.
 * Reuses dynamic imports for xlsx and jsPDF to optimize production chunk bundles.
 */

/**
 * Filters assignments down to a single scope entity (a specific teacher,
 * class, room or student) or returns all assignments for scope 'general'.
 *
 * @param {Array} assignments
 * @param {Object} scope - { type: 'general'|'maestro'|'clase'|'salon'|'alumno', id, name }
 * @returns {Array}
 */
export function filterAssignmentsByScope(assignments = [], scope = null) {
  if (!scope || scope.type === 'general' || !scope.id) return assignments;

  const fieldByType = {
    maestro: 'maestro_id',
    clase: 'clase_id',
    salon: 'salon_id'
  };

  if (scope.type === 'alumno') {
    return assignments.filter(a => (a.alumnos_ids || []).includes(scope.id));
  }

  const field = fieldByType[scope.type];
  if (!field) return assignments;
  return assignments.filter(a => a[field] === scope.id);
}

/**
 * Builds the header labels (title/subtitle/entityName) for a given scope,
 * shared between the PDF and Excel exporters so both stay consistent.
 *
 * @param {Object} scope - { type, id, name }
 * @param {string} period
 * @returns {{ title: string, subtitle: string, entityName: string|null }}
 */
export function buildScopeLabel(scope = null, period = 'S1-2026') {
  const title = 'SOI — SISTEMA OPERATIVO INSTITUCIONAL';

  if (!scope || scope.type === 'general' || !scope.id) {
    return {
      title,
      subtitle: `Reporte Oficial de Planificación Horaria — Período: ${period}`,
      entityName: null
    };
  }

  const labelByType = {
    maestro: 'Horario del Maestro',
    clase: 'Horario de la Clase',
    salon: 'Horario del Salón',
    alumno: 'Horario del Alumno'
  };

  return {
    title,
    subtitle: `${labelByType[scope.type] || 'Horario Personalizado'} — Período: ${period}`,
    entityName: scope.name || null
  };
}

/**
 * Groups assignments by entity (teacher or room), returning only entities
 * that actually have at least one assignment — used to drive batch exports.
 *
 * @param {Array} assignments
 * @param {'maestro'|'salon'|'clase'} type
 * @returns {Array<{ id: string, name: string, assignments: Array }>}
 */
export function groupAssignmentsByEntity(assignments = [], type = 'maestro') {
  const idFieldByType = { maestro: 'maestro_id', salon: 'salon_id', clase: 'clase_id' };
  const nameFieldByType = { maestro: 'maestro_nombre', salon: 'salon_nombre', clase: 'clase_nombre' };
  const idField = idFieldByType[type] || 'maestro_id';
  const nameField = nameFieldByType[type] || 'maestro_nombre';

  const byId = new Map();
  for (const a of assignments) {
    const id = a[idField];
    if (!id) continue;
    if (!byId.has(id)) {
      byId.set(id, { id, name: a[nameField] || 'Sin nombre', assignments: [] });
    }
    byId.get(id).assignments.push(a);
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function exportToExcel(assignments = [], options = {}) {
  try {
    const XLSX = await import('xlsx');
    const period = typeof options === 'string' ? options : (options.period || 'S1-2026');
    const scope = typeof options === 'object' ? (options.scope || null) : null;
    const scoped = filterAssignmentsByScope(assignments, scope);
    const labels = buildScopeLabel(scope, period);
    const subtitle = typeof options === 'object' && options.subtitle
      ? options.subtitle
      : (labels.entityName || '');

    // Create new workbook
    const wb = XLSX.utils.book_new();

    // Map general sheet rows
    const headers = ['Clase', 'Docente/Maestro', 'Día', 'Hora Inicio', 'Hora Fin', 'Salón'];
    const rows = scoped.map(a => [
      a.clase_nombre || a.clase || 'Sin nombre',
      a.maestro_nombre || a.maestro || 'Sin asignación',
      (a.dia || '').toUpperCase(),
      a.hora_inicio || '',
      a.hora_fin || '',
      a.salon_nombre || a.salon || 'Sin salón'
    ]);

    const sheetTitle = subtitle ? `Horario - ${subtitle.slice(0, 20)}` : 'Horario Registrado';
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle.slice(0, 31));

    // Create a detailed sheet grouped by Salon
    const salonHeaders = ['Salón', 'Clase', 'Docente/Maestro', 'Día', 'Horario'];
    const salonRows = [...scoped]
      .sort((a, b) => (a.salon_nombre || '').localeCompare(b.salon_nombre || ''))
      .map(a => [
        a.salon_nombre || 'Sin salón',
        a.clase_nombre || 'Sin nombre',
        a.maestro_nombre || 'Sin maestro',
        (a.dia || '').toUpperCase(),
        `${a.hora_inicio || ''} - ${a.hora_fin || ''}`
      ]);

    const wsSalon = XLSX.utils.aoa_to_sheet([salonHeaders, ...salonRows]);
    XLSX.utils.book_append_sheet(wb, wsSalon, 'Detalle por Salones');

    // Trigger local download
    const filename = subtitle
      ? `SOI-Horarios-${subtitle.replace(/[^a-zA-Z0-9]/g, '_')}-${period}.xlsx`
      : `SOI-Horarios-${period}.xlsx`;
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('[horarioExporter] Error exporting to Excel:', error);
    throw new Error('No se pudo generar la planilla Excel: ' + error.message);
  }
}

export async function exportToPDF(assignments = [], options = {}) {
  try {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const period = typeof options === 'string' ? options : (options.period || 'S1-2026');
    const scope = typeof options === 'object' ? (options.scope || null) : null;
    const scoped = filterAssignmentsByScope(assignments, scope);
    const labels = buildScopeLabel(scope, period);

    const title = typeof options === 'object' && options.title ? options.title : labels.title;
    const subtitle = typeof options === 'object' && options.subtitle ? options.subtitle : labels.subtitle;
    const entityName = typeof options === 'object' && options.entityName ? options.entityName : labels.entityName;
    const statsText = typeof options === 'object' ? (options.statsText || null) : null;

    // Landscape orientation for structured visual weekly schedules
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Color Palette Tokens
    const primaryColor = [99, 102, 241]; // Indigo
    const textColor = [31, 41, 55];    // Dark Gray

    // Report Header
    doc.setFillColor(243, 244, 246);
    doc.rect(0, 0, 297, entityName ? 42 : 35, 'F');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title.toUpperCase(), 15, 14);

    doc.setTextColor(107, 114, 128); // Muted gray
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(subtitle, 15, 22);

    if (entityName) {
      doc.setTextColor(17, 24, 39);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(entityName, 15, 30);
    }

    if (statsText) {
      doc.setTextColor(75, 85, 99);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(statsText, 15, entityName ? 37 : 30);
    }

    // Date stamp
    doc.setFontSize(9);
    doc.text(`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 220, 22);

    // Line separator
    const lineY = entityName ? 42 : 35;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(15, lineY, 282, lineY);

    // AutoTable Body — omit the column matching the active scope entity,
    // it's already shown in the header and would be redundant on every row.
    const allColumns = [
      { key: 'clase', header: 'Clase / Cátedra', width: 70, cell: a => a.clase_nombre || a.clase || 'Sin nombre' },
      { key: 'maestro', header: 'Docente Encargado', width: 70, cell: a => a.maestro_nombre || a.maestro || 'Sin asignación' },
      { key: 'dia', header: 'Día Semanal', width: 35, cell: a => (a.dia || '').toUpperCase() },
      { key: 'horario', header: 'Franja Horaria', width: 40, cell: a => `${a.hora_inicio || ''} - ${a.hora_fin || ''}` },
      { key: 'salon', header: 'Salón Asignado', width: 50, cell: a => a.salon_nombre || a.salon || 'Sin salón' }
    ];
    const hiddenColumnKey = { maestro: 'maestro', clase: 'clase', salon: 'salon' }[scope && scope.type];
    const columns = allColumns.filter(c => c.key !== hiddenColumnKey);

    const headers = [columns.map(c => c.header)];
    const body = scoped.map(a => columns.map(c => c.cell(a)));
    const columnStyles = {};
    columns.forEach((c, idx) => { columnStyles[idx] = { cellWidth: c.width }; });

    autoTable(doc, {
      startY: lineY + 5,
      head: headers,
      body: body,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor,
        cellPadding: 4
      },
      columnStyles,
      margin: { left: 15, right: 15 }
    });

    // Save PDF
    const safeName = entityName ? entityName.replace(/[^a-zA-Z0-9]/g, '_') : 'General';
    doc.save(`SOI-Horarios-${safeName}-${period}.pdf`);
    return true;
  } catch (error) {
    console.error('[horarioExporter] Error exporting to PDF:', error);
    throw new Error('No se pudo generar el reporte PDF: ' + error.message);
  }
}

/**
 * Generates one personalized PDF per teacher or per room, sequentially.
 * Skips entities with no assignments (already filtered by groupAssignmentsByEntity).
 *
 * @param {Array} assignments
 * @param {'maestro'|'salon'|'clase'} type
 * @param {Object} options - forwarded to exportToPDF (period, statsText, etc.)
 * @returns {Promise<number>} number of PDFs generated
 */
export async function exportBatchPDF(assignments = [], type = 'maestro', options = {}) {
  const groups = groupAssignmentsByEntity(assignments, type);
  for (const group of groups) {
    await exportToPDF(assignments, {
      ...options,
      scope: { type, id: group.id, name: group.name }
    });
  }
  return groups.length;
}
