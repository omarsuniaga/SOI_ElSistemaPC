import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { findStudentMention } from './classHistoryService.js'

export function downloadClassHistoryPdf(report, classInfo) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Informe de clase', 14, 18)
  doc.setFontSize(10)
  doc.text(String(classInfo.nombre || 'Clase'), 14, 25)
  autoTable(doc, { startY: 30, body: [
    ['Maestro actual', classInfo.maestro_nombre || classInfo.maestroNombre || 'Sin asignar'],
    ['Primera clase registrada', report.firstRecorded || 'Sin registros'],
    ['Período académico', report.periodName || 'Todo el historial disponible'],
    ['Rango solicitado', `${report.from || 'Desde el primer registro'} / ${report.to || 'Hasta el último registro'}`],
    ['Alumnos únicos con asistencia registrada', String(report.students.length)],
    ['Alcance', 'Registros disponibles; no acredita altas, retiros ni fecha de inicio real. Mes sin registros no equivale a ausencias.'],
  ] })
  autoTable(doc, { startY: doc.lastAutoTable.finalY + 8,
    head: [['Mes', 'Clases', 'Asistieron', 'Justificadas', 'Ausencias', '% asistencia']],
    body: report.months.length ? report.months.map(({ key, data: d }) => [key, d?.sessions ?? 'Sin registros', d?.attended ?? '—', d?.justified ?? '—', d?.absent ?? '—', d?.attendanceRatePct == null ? 'Sin datos' : `${d.attendanceRatePct}%`]) : [['Sin registros', '', '', '', '', '']],
  })
  if (report.mode === 'ai') autoTable(doc, { startY: doc.lastAutoTable.finalY + 8,
    head: [['Mes', 'Resumen generado por IA · verificar con la evidencia']],
    body: report.months.map(m => [m.key, m.narrative || 'Resumen por IA no disponible / sin contenido registrado']),
  })
  autoTable(doc, { startY: doc.lastAutoTable.finalY + 8,
    head: [['Fecha / ID de registro', 'Maestro registrado', 'Contenido y observaciones', 'P/T/J/A']],
    body: report.entries.map(e => [e.date + '\n' + (e.id || ''), e.teacher, e.content || 'Sin contenido registrado',
      ['presente', 'tarde', 'justificado', 'ausente'].map(state => e.attendance.filter(a => a.estado === state).length).join('/')]),
    styles: { fontSize: 8, overflow: 'linebreak' },
  })
  autoTable(doc, { startY: doc.lastAutoTable.finalY + 8,
    head: [['Alumnos con registros en el rango', 'Identificador']],
    body: report.students.map(s => [s.name, s.id]),
  })
  if (report.studentHistories) autoTable(doc, { startY: doc.lastAutoTable.finalY + 8,
    head: [['Alumno / nómina', 'Fecha', 'Participación', 'Contenido del maestro']],
    body: report.studentHistories.flatMap(student => student.records.length ? student.records.map(r => [
      student.name + (student.current ? ' · Nómina actual' : ' · Histórico'),
      r.date, r.participation, (findStudentMention(r.content, student, report.studentHistories) ? 'Menciona al alumno: ' : '') + (r.content || 'Sin contenido registrado') + (r.notes.length ? '\nComentario vinculado al alumno: ' + r.notes.join('\n') : ''),
    ]) : [[student.name, 'Sin registros en el rango', '', '']]),
    styles: { fontSize: 8, overflow: 'linebreak' },
  })
  if (report.detailsIncomplete) {
    doc.addPage(); doc.setFontSize(10)
    doc.text('Advertencia: algunas observaciones individuales no pudieron cargarse.', 14, 20)
  }
  doc.save(`Informe_Clase_${String(report.classId).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`)
}
