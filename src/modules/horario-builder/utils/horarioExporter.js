/**
 * Utility exporter for schedule assignments to structured PDF and Excel sheets.
 * Reuses dynamic imports for xlsx and jsPDF to optimize production chunk bundles.
 */

export async function exportToExcel(assignments = [], options = {}) {
  try {
    const XLSX = await import('xlsx');
    const period = typeof options === 'string' ? options : (options.period || 'S1-2026');
    const subtitle = typeof options === 'object' ? (options.subtitle || options.entityName || '') : '';
    
    // Create new workbook
    const wb = XLSX.utils.book_new();

    // Map general sheet rows
    const headers = ['Clase', 'Docente/Maestro', 'Día', 'Hora Inicio', 'Hora Fin', 'Salón'];
    const rows = assignments.map(a => [
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
    const salonRows = [...assignments]
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
    const title = typeof options === 'object' ? (options.title || 'SOI — SISTEMA OPERATIVO INSTITUCIONAL') : 'SOI — SISTEMA OPERATIVO INSTITUCIONAL';
    const subtitle = typeof options === 'object' ? (options.subtitle || `Reporte Oficial de Planificación Horaria — Período: ${period}`) : `Reporte Oficial de Planificación Horaria — Período: ${period}`;
    const entityName = typeof options === 'object' ? (options.entityName || null) : null;
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

    // AutoTable Body
    const headers = [['Clase / Cátedra', 'Docente Encargado', 'Día Semanal', 'Franja Horaria', 'Salón Asignado']];
    const body = assignments.map(a => [
      a.clase_nombre || a.clase || 'Sin nombre',
      a.maestro_nombre || a.maestro || 'Sin asignación',
      (a.dia || '').toUpperCase(),
      `${a.hora_inicio || ''} - ${a.hora_fin || ''}`,
      a.salon_nombre || a.salon || 'Sin salón'
    ]);

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
      columnStyles: {
        0: { cellWidth: 70 }, // Clase
        1: { cellWidth: 70 }, // Docente
        2: { cellWidth: 35 }, // Día
        3: { cellWidth: 40 }, // Horario
        4: { cellWidth: 50 }  // Salón
      },
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

