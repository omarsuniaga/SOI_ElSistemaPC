/**
 * Utility exporter for schedule assignments to structured PDF and Excel sheets.
 * Reuses dynamic imports for xlsx and jsPDF to optimize production chunk bundles.
 */

export async function exportToExcel(assignments, period = 'S1-2026') {
  try {
    const XLSX = await import('xlsx');
    
    // Create new workbook
    const wb = XLSX.utils.book_new();

    // Map general sheet rows
    const headers = ['Clase', 'Docente/Maestro', 'Día', 'Hora Inicio', 'Hora Fin', 'Salón'];
    const rows = assignments.map(a => [
      a.clase_nombre,
      a.maestro_nombre,
      a.dia.toUpperCase(),
      a.hora_inicio,
      a.hora_fin,
      a.salon_nombre
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Horario Optimizado');

    // Create a detailed sheet grouped by Salon
    const salonHeaders = ['Salón', 'Clase', 'Docente/Maestro', 'Día', 'Horario'];
    const salonRows = [...assignments]
      .sort((a, b) => a.salon_nombre.localeCompare(b.salon_nombre))
      .map(a => [
        a.salon_nombre,
        a.clase_nombre,
        a.maestro_nombre,
        a.dia.toUpperCase(),
        `${a.hora_inicio} - ${a.hora_fin}`
      ]);

    const wsSalon = XLSX.utils.aoa_to_sheet([salonHeaders, ...salonRows]);
    XLSX.utils.book_append_sheet(wb, wsSalon, 'Detalle por Salones');

    // Trigger local download
    XLSX.writeFile(wb, `SOI-Horarios-${period}.xlsx`);
    return true;
  } catch (error) {
    console.error('[horarioExporter] Error exporting to Excel:', error);
    throw new Error('No se pudo generar la planilla Excel: ' + error.message);
  }
}

export async function exportToPDF(assignments, period = 'S1-2026') {
  try {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

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
    doc.rect(0, 0, 297, 35, 'F');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SOI — SISTEMA OPERATIVO INSTITUCIONAL', 15, 18);

    doc.setTextColor(107, 114, 128); // Muted gray
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Reporte Oficial de Planificación Horaria — Período: ${period}`, 15, 26);

    // Date stamp
    doc.setFontSize(9);
    doc.text(`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 230, 26);

    // Line separator
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(15, 35, 282, 35);

    // AutoTable Body
    const headers = [['Clase / Cátedra', 'Docente Encargado', 'Día Semanal', 'Franja Horaria', 'Salón Asignado']];
    const body = assignments.map(a => [
      a.clase_nombre,
      a.maestro_nombre,
      a.dia.toUpperCase(),
      `${a.hora_inicio} - ${a.hora_fin}`,
      a.salon_nombre
    ]);

    autoTable(doc, {
      startY: 42,
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
    doc.save(`SOI-Horarios-${period}.pdf`);
    return true;
  } catch (error) {
    console.error('[horarioExporter] Error exporting to PDF:', error);
    throw new Error('No se pudo generar el reporte PDF: ' + error.message);
  }
}
