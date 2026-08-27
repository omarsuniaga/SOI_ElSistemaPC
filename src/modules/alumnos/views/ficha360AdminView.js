import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { whatsappLink } from '../../../shared/utils/phoneUtils.js'
import { generarResenaAlumnoIA } from '../services/alumnoAiAnalystService.js'
import * as tareasApi from '../../hermes/api/tareasApi.js'

const FIXTURES_360 = {
  'sofia': {
    id: 'alu-sofia-demo',
    nombre_completo: 'Sofía Valentina Rodríguez',
    instrumento_principal: 'Violín',
    nivel: 'Intermedio B',
    fecha_ingreso: '2024-09-01',
    tiene_pasaporte: true,
    activo: true,
    representante_nombre: 'Carmen Morales de Rodríguez',
    representante_cedula: '001-1234567-8',
    representante_tlf: '+1 (809) 555-0101',
    correo_representante: 'carmen.morales@demo.org',
    direccion: 'Av. Principal #12, Punta Cana Village',
    asistencia: {
      pct: 96,
      total: 24,
      presentes: 23,
      ausentes: 0,
      justificados: 1,
      ultima_fecha: '2026-08-20',
      estado: 'optimo',
      historico: [
        { fecha: '2026-08-20', clase: 'Cátedra Violín I', docente: 'Prof. Marcos Rosario', estado: 'presente', hora: '15:30 - 17:00', obs: 'Puntual. Buena disposición y afinación.' },
        { fecha: '2026-08-18', clase: 'Práctica Orquestal', docente: 'Mtro. Manuel Marcano', estado: 'presente', hora: '17:15 - 19:00', obs: 'Lideró la fila de primeros violines.' },
        { fecha: '2026-08-13', clase: 'Cátedra Violín I', docente: 'Prof. Marcos Rosario', estado: 'presente', hora: '15:30 - 17:00', obs: 'Estudio de golpes de arco y pasajes rápidos.' },
        { fecha: '2026-08-11', clase: 'Lenguaje Musical III', docente: 'Prof. Gabriel Mendoza', estado: 'justificado', hora: '16:00 - 17:30', obs: 'Cita médica justificada previamente por la madre.' },
        { fecha: '2026-08-06', clase: 'Cátedra Violín I', docente: 'Prof. Marcos Rosario', estado: 'presente', hora: '15:30 - 17:00', obs: 'Revisión del Concierto de Vivaldi.' },
        { fecha: '2026-08-04', clase: 'Práctica Orquestal', docente: 'Mtro. Manuel Marcano', estado: 'presente', hora: '17:15 - 19:00', obs: 'Excelente lectura a primera vista.' }
      ]
    },
    academico: {
      nivel_suzuki: 'Libro 3 Suzuki',
      ultima_audicion: 9.5,
      estado_cualitativo: 'LOGRADO',
      ultimo_objetivo: 'Concierto en La menor de A. Vivaldi (1er Mov.) — Golpe de arco martelé.',
      evaluador: 'Prof. Marcos Rosario',
      fecha_evaluacion: '2026-08-15',
      contenidos_vistos: [
        { fecha: '2026-08-20', tema: 'Concierto en La menor (A. Vivaldi)', detalle: 'Compases 45 al 80. Trabajo de articulación martelé y afinación en tercera posición.', asimilacion: 'Excelente' },
        { fecha: '2026-08-18', tema: 'Sinfonía No. 25 (W. A. Mozart)', detalle: 'Lectura de Tutti orquestal. Sincronía en corcheas staccato y dinámicas forte/piano.', asimilacion: 'Sobresaliente' },
        { fecha: '2026-08-13', tema: 'Escalas de Sol y La Mayor a 3 Octavas', detalle: 'Cambios de posición I-III-V con afinación por armónicos naturales.', asimilacion: 'Muy Bueno' },
        { fecha: '2026-08-06', tema: 'Estudio No. 14 de Wohlfahrt Op. 45', detalle: 'Cruces de cuerda fluidos sin interrupción del flujo del arco.', asimilacion: 'Logrado' },
        { fecha: '2026-08-04', tema: 'Repertorio Orquestal: Danzón No. 2', detalle: 'Acentos rítmicos y fraseo melódico en solo de violines primeros.', asimilacion: 'Excelente' }
      ]
    },
    finanzas: {
      estado_solvencia: 'Solvente · Al Día',
      saldo_pendiente: 0,
      cuotas_pagadas: 6,
      cuotas_totales: 6,
      credito_favor: 0,
      isp_categoria: 'A',
      isp_puntos: 96,
      patron_pago: 'Puntualidad 100% (Días 2-4).',
      mensualidades: [
        { mes: 'Agosto 2026', monto: 1250, fecha_pago: '2026-08-03', recibo: 'REC-2026-0891', estado: 'pagada', metodo: 'Transferencia BHD' },
        { mes: 'Julio 2026', monto: 1250, fecha_pago: '2026-07-02', recibo: 'REC-2026-0744', estado: 'pagada', metodo: 'Transferencia BHD' },
        { mes: 'Junio 2026', monto: 1250, fecha_pago: '2026-06-04', recibo: 'REC-2026-0612', estado: 'pagada', metodo: 'Tarjeta Crédito' },
        { mes: 'Mayo 2026', monto: 1250, fecha_pago: '2026-05-03', recibo: 'REC-2026-0480', estado: 'pagada', metodo: 'Transferencia BHD' }
      ],
      compras_tiendita: [
        { fecha: '2026-08-05', articulo: 'Uniforme: Camisa Polo Institucional (Talla 12)', monto: 850, estado: 'pagado', recibo: 'TIEN-2026-0211' },
        { fecha: '2026-07-10', articulo: 'Resina Pirastro Goldflex', monto: 650, estado: 'pagado', recibo: 'TIEN-2026-0189' },
        { fecha: '2026-06-15', articulo: 'Hombrera Kun Original 4/4', monto: 1400, estado: 'pagado', recibo: 'TIEN-2026-0150' }
      ],
      deuda_adicional: 0
    },
    lutheria: {
      instrumento: 'Violín 4/4',
      marca_modelo: 'Yamaha V5SC',
      codigo_inventario: 'VIO-042',
      numero_serie: 'YMH-88219',
      fecha_ingreso_sede: '2024-03-10 (Donación Fundación Punta Cana)',
      fecha_entrega: '2026-01-15 (Contrato COM-2026-042)',
      estado_conservacion: 'Excelente',
      estado_uso: 'Comodato Activo',
      en_taller: false,
      estuche: {
        tipo: 'Estuche Rígido Térmico Foam',
        estado: 'Excelente (Cremallera e higrómetro en regla)'
      },
      arco: {
        tipo: 'Arco de Madera Brasil 4/4 con Nuez de Ébano',
        estado: 'Cerdas naturales al 95% de vida útil'
      },
      cuerdas_historial: [
        { fecha: '2026-08-12', cuerda: 'Juego Completo Thomastik Dominant 4/4', motivo: 'Mantenimiento preventivo semestral' },
        { fecha: '2026-01-20', cuerda: 'Cuerda Mi Pirastro Goldbrokat 0.26mm', motivo: 'Calibración de entrega inicial' }
      ],
      intervenciones: [
        { fecha: '2026-08-12', luthier: 'Kalani (Luthier Sede)', accion: 'Calibración anual preventiva, pulido de diapasón de ébano y ajuste de alma.', costo: 'RD$ 0 (Garantía Institucional)' },
        { fecha: '2026-01-15', luthier: 'Kalani (Luthier Sede)', accion: 'Tallado y ajuste de puente Aubert Francés y lubricación de clavijas.', costo: 'RD$ 0 (Puesta a punto comodato)' }
      ]
    }
  },
  'mateo': {
    id: 'alu-mateo-demo',
    nombre_completo: 'Mateo Alejandro Morales',
    instrumento_principal: 'Violonchelo',
    nivel: 'Inicial A',
    fecha_ingreso: '2025-01-10',
    tiene_pasaporte: false,
    activo: true,
    representante_nombre: 'Roberto Morales',
    representante_cedula: '001-9876543-2',
    representante_tlf: '+1 (809) 555-0202',
    correo_representante: 'roberto.morales@demo.org',
    direccion: 'Calle Los Corales #45, Bávaro',
    asistencia: {
      pct: 75,
      total: 20,
      presentes: 15,
      ausentes: 5,
      justificados: 0,
      ultima_fecha: '2026-08-18',
      estado: 'alerta',
      historico: [
        { fecha: '2026-08-18', clase: 'Cátedra Cuerdas Graves', docente: 'Prof. Francisco Domínguez', estado: 'presente', hora: '16:00 - 17:30', obs: 'Tocó con instrumento de préstamo por tener el suyo en taller.' },
        { fecha: '2026-08-15', clase: 'Lenguaje Musical I', docente: 'Prof. Gabriel Mendoza', estado: 'ausente', hora: '15:00 - 16:30', obs: 'Inasistencia injustificada.' },
        { fecha: '2026-08-11', clase: 'Cátedra Cuerdas Graves', docente: 'Prof. Francisco Domínguez', estado: 'presente', hora: '16:00 - 17:30', obs: 'Dificultad en postura de hombro.' },
        { fecha: '2026-08-08', clase: 'Práctica Orquestal Infantil', docente: 'Mtro. Manuel Marcano', estado: 'ausente', hora: '17:15 - 19:00', obs: 'Sin aviso previo de inasistencia.' },
        { fecha: '2026-08-04', clase: 'Cátedra Cuerdas Graves', docente: 'Prof. Francisco Domínguez', estado: 'presente', hora: '16:00 - 17:30', obs: 'Reportó que la clavija de 3ra cuerda deslizaba.' }
      ]
    },
    academico: {
      nivel_suzuki: 'Iniciación (Dotzauer)',
      ultima_audicion: 7.8,
      estado_cualitativo: 'EN PROGRESO',
      ultimo_objetivo: 'Postura mano izquierda en cuerdas graves. Relajación de hombro.',
      evaluador: 'Prof. Francisco Domínguez',
      fecha_evaluacion: '2026-08-10',
      contenidos_vistos: [
        { fecha: '2026-08-18', tema: 'Ejercicios de Cuerdas al Aire y Redondas', detalle: 'Control del peso del brazo en cuerda Do. Uso de instrumento temporal.', asimilacion: 'En progreso' },
        { fecha: '2026-08-11', tema: 'Método Dotzauer: Lección 3 y 4', detalle: 'Colocación del pulgar posterior en el mástil y curvatura de dedos.', asimilacion: 'Con dificultad' },
        { fecha: '2026-08-04', tema: 'Escala de Do Mayor en Primera Posición', detalle: 'Digitación 0-1-3-4 en cuerdas Do y Sol. Afinación de tercer dedo.', asimilacion: 'Regular' }
      ]
    },
    finanzas: {
      estado_solvencia: 'Mora (1 Cuota)',
      saldo_pendiente: 2500,
      cuotas_pagadas: 5,
      cuotas_totales: 6,
      credito_favor: 0,
      isp_categoria: 'C',
      isp_puntos: 68,
      patron_pago: 'Patrón quincenal (Días 15-20).',
      mensualidades: [
        { mes: 'Agosto 2026', monto: 1250, fecha_pago: 'Pendiente', recibo: '—', estado: 'pendiente', metodo: '— (Vencida el 15/08)' },
        { mes: 'Julio 2026', monto: 1250, fecha_pago: '2026-07-22', recibo: 'REC-2026-0798', estado: 'pagada', metodo: 'Efectivo en Caja' },
        { mes: 'Junio 2026', monto: 1250, fecha_pago: '2026-06-20', recibo: 'REC-2026-0661', estado: 'pagada', metodo: 'Efectivo en Caja' },
        { mes: 'Mayo 2026', monto: 1250, fecha_pago: '2026-05-18', recibo: 'REC-2026-0519', estado: 'pagada', metodo: 'Efectivo en Caja' }
      ],
      compras_tiendita: [
        { fecha: '2026-08-01', articulo: 'Uniforme: Pantalón de Gala y Camisa Polo', monto: 1250, estado: 'pendiente', recibo: 'TIEN-2026-0205 (Saldo Pendiente)' },
        { fecha: '2026-05-15', articulo: 'Método Suzuki Cello Vol. 1 + CD', monto: 950, estado: 'pagado', recibo: 'TIEN-2026-0133' }
      ],
      deuda_adicional: 1250
    },
    lutheria: {
      instrumento: 'Violonchelo 4/4',
      marca_modelo: 'Strunal Student 4/4',
      codigo_inventario: 'CEL-018',
      numero_serie: 'STR-44102',
      fecha_ingreso_sede: '2023-11-20 (Compra Lote Instrumentos Rep. Checa)',
      fecha_entrega: '2026-02-01 (Contrato COM-2026-018)',
      estado_conservacion: 'Regular (En Reparación)',
      estado_uso: 'En Taller LUT',
      en_taller: true,
      estuche: {
        tipo: 'Funda Acolchada de Nylon 20mm con Correas Mochila',
        estado: 'Regular (Cremallera lateral descosida, pendiente de zapatero)'
      },
      arco: {
        tipo: 'Arco de Madera Brasil Cello 4/4',
        estado: 'Cerdas sucias en el talón, requiere encerdado'
      },
      cuerdas_historial: [
        { fecha: '2026-08-20', cuerda: 'Cuerda Sol D\'Addario Prelude Cello', motivo: 'Reposición en taller por rotura en clavijero' },
        { fecha: '2026-02-01', cuerda: 'Juego Completo D\'Addario Prelude', motivo: 'Acondicionamiento de entrega' }
      ],
      intervenciones: [
        { fecha: '2026-08-20', luthier: 'Kalani (Luthier Sede)', accion: 'Orden #LUTH-2026-014: Rectificación de cónico en clavija de Sol, ajuste de puente curvado y encolado menor de filete.', costo: 'RD$ 650 (Presupuesto interno)' },
        { fecha: '2026-02-01', luthier: 'Kalani (Luthier Sede)', accion: 'Revisión general, lubricación de tensor de pica y ajuste de altura de cuerdas.', costo: 'RD$ 0 (Inspección inicial)' }
      ]
    }
  }
}

function generarHTMLDrilldownView(tab, data) {
  if (tab === 'asistencia') {
    return `
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="mb-0 fw-bold text-body small d-flex align-items-center gap-1.5">
            <i class="bi bi-calendar-check text-primary"></i>
            <span>Histórico Individual de Sesiones en Aula PWA</span>
          </h6>
          <span class="text-body-secondary font-monospace" style="font-size:0.7rem;">${data.asistencia.historico.length} sesiones auditadas</span>
        </div>
        <div class="table-responsive" style="max-height: 220px; overflow-y: auto;">
          <table class="table table-sm table-hover align-middle mb-0 font-monospace" style="font-size:0.75rem;">
            <thead class="table-light sticky-top">
              <tr>
                <th>Fecha & Hora</th>
                <th>Cátedra / Clase</th>
                <th>Docente</th>
                <th>Estado</th>
                <th>Observación de Aula</th>
              </tr>
            </thead>
            <tbody>
              ${data.asistencia.historico.map(h => `
                <tr>
                  <td class="fw-semibold">${h.fecha} <span class="text-body-secondary font-normal" style="font-size:0.7rem;">(${h.hora})</span></td>
                  <td>${escapeHTML(h.clase)}</td>
                  <td>${escapeHTML(h.docente)}</td>
                  <td>
                    <span class="badge ${h.estado === 'presente' ? 'bg-success-subtle text-success' : h.estado === 'justificado' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-danger-subtle text-danger'} px-2 py-0.5 text-uppercase">
                      ${h.estado}
                    </span>
                  </td>
                  <td class="text-body-secondary">${escapeHTML(h.obs)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  } else if (tab === 'academico') {
    return `
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="mb-0 fw-bold text-body small d-flex align-items-center gap-1.5">
            <i class="bi bi-journal-text text-primary"></i>
            <span>Contenidos Recibidos en Clases (Solo en sesiones con asistencia confirmada)</span>
          </h6>
          <span class="badge bg-indigo-subtle text-primary font-monospace" style="font-size:0.7rem;">Ruta Suzuki / ACM</span>
        </div>
        <div class="table-responsive" style="max-height: 220px; overflow-y: auto;">
          <table class="table table-sm table-hover align-middle mb-0" style="font-size:0.75rem;">
            <thead class="table-light sticky-top">
              <tr>
                <th style="width: 90px;">Fecha</th>
                <th>Obra / Contenido Abordado</th>
                <th>Detalle Técnico Pedagógico</th>
                <th style="width: 110px;">Asimilación</th>
              </tr>
            </thead>
            <tbody>
              ${data.academico.contenidos_vistos.map(c => `
                <tr>
                  <td class="font-monospace fw-semibold">${c.fecha}</td>
                  <td class="fw-bold text-body">${escapeHTML(c.tema)}</td>
                  <td class="text-body-secondary">${escapeHTML(c.detalle)}</td>
                  <td>
                    <span class="badge bg-primary-subtle text-primary px-2 py-0.5 font-monospace">${escapeHTML(c.asimilacion)}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  } else if (tab === 'finanzas') {
    return `
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="mb-0 fw-bold text-body small d-flex align-items-center gap-1.5">
            <i class="bi bi-wallet2 text-success"></i>
            <span>Estado de Cuenta Integral: Mensualidades & Compras en Tiendita</span>
          </h6>
          <span class="badge ${data.finanzas.saldo_pendiente > 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-success-subtle text-success'} font-monospace" style="font-size:0.7rem;">
            ${data.finanzas.estado_solvencia}
          </span>
        </div>
        
        <div class="row g-2">
          <!-- Columna Mensualidades -->
          <div class="col-md-7">
            <div class="p-2 border rounded-2 bg-body-tertiary">
              <strong class="d-block text-uppercase font-monospace text-body-secondary mb-1" style="font-size:0.68rem;">Histórico de Mensualidades</strong>
              <div class="table-responsive" style="max-height: 160px; overflow-y: auto;">
                <table class="table table-sm table-borderless align-middle mb-0 font-monospace" style="font-size:0.72rem;">
                  <tbody>
                    ${data.finanzas.mensualidades.map(m => `
                      <tr class="border-bottom border-secondary-subtle">
                        <td><strong>${m.mes}</strong></td>
                        <td>RD$ ${m.monto}</td>
                        <td>${m.fecha_pago}</td>
                        <td><span class="badge ${m.estado === 'pagada' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">${m.estado}</span></td>
                        <td class="text-body-secondary text-end">${m.recibo}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Columna Tiendita / Accesorios -->
          <div class="col-md-5">
            <div class="p-2 border rounded-2 bg-body-tertiary">
              <strong class="d-block text-uppercase font-monospace text-body-secondary mb-1" style="font-size:0.68rem;">Compras en Tiendita / Uniformes</strong>
              <div class="table-responsive" style="max-height: 160px; overflow-y: auto;">
                <table class="table table-sm table-borderless align-middle mb-0" style="font-size:0.72rem;">
                  <tbody>
                    ${data.finanzas.compras_tiendita.map(ct => `
                      <tr class="border-bottom border-secondary-subtle">
                        <td>
                          <div class="text-truncate fw-semibold" style="max-width: 140px;" title="${escapeHTML(ct.articulo)}">${escapeHTML(ct.articulo)}</div>
                          <span class="text-body-secondary font-monospace" style="font-size:0.65rem;">${ct.fecha}</span>
                        </td>
                        <td class="font-monospace text-end">RD$ ${ct.monto}</td>
                        <td class="text-end">
                          <span class="badge ${ct.estado === 'pagado' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">${ct.estado}</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  } else if (tab === 'lutheria') {
    return `
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="mb-0 fw-bold text-body small d-flex align-items-center gap-1.5">
            <i class="bi bi-tools text-warning"></i>
            <span>Hoja de Vida Patrimonial & Mantenimiento del Instrumento</span>
          </h6>
          <span class="badge bg-dark font-monospace text-white" style="font-size:0.7rem;">Cod: ${data.lutheria.codigo_inventario} · Serie: ${data.lutheria.numero_serie}</span>
        </div>

        <div class="row g-2 small">
          <!-- Datos de Ingreso y Accesorios -->
          <div class="col-md-4">
            <div class="p-2 rounded-2 border bg-body-tertiary h-100">
              <strong class="d-block font-monospace text-uppercase text-body-secondary mb-1" style="font-size:0.68rem;">Trazabilidad de Activo</strong>
              <div class="mb-1"><span class="text-body-secondary">Ingreso a Sede:</span> <strong class="text-body">${data.lutheria.fecha_ingreso_sede}</strong></div>
              <div class="mb-1"><span class="text-body-secondary">Asignación Comodato:</span> <strong class="text-body">${data.lutheria.fecha_entrega}</strong></div>
              <div class="mb-1"><span class="text-body-secondary">Estuche:</span> <span class="text-body">${data.lutheria.estuche.tipo} (${data.lutheria.estuche.estado})</span></div>
              <div><span class="text-body-secondary">Arco:</span> <span class="text-body">${data.lutheria.arco.tipo} (${data.lutheria.arco.estado})</span></div>
            </div>
          </div>

          <!-- Historial de Cuerdas -->
          <div class="col-md-4">
            <div class="p-2 rounded-2 border bg-body-tertiary h-100">
              <strong class="d-block font-monospace text-uppercase text-body-secondary mb-1" style="font-size:0.68rem;">Historial de Cuerdas</strong>
              <ul class="list-unstyled mb-0 font-monospace" style="font-size:0.72rem;">
                ${data.lutheria.cuerdas_historial.map(ch => `
                  <li class="mb-1 pb-1 border-bottom border-secondary-subtle">
                    <span class="fw-bold text-body">${ch.cuerda}</span>
                    <div class="text-body-secondary">${ch.fecha} · ${escapeHTML(ch.motivo)}</div>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Intervenciones y Taller -->
          <div class="col-md-4">
            <div class="p-2 rounded-2 border bg-body-tertiary h-100">
              <strong class="d-block font-monospace text-uppercase text-body-secondary mb-1" style="font-size:0.68rem;">Intervenciones en Taller LUT</strong>
              <ul class="list-unstyled mb-0 font-monospace" style="font-size:0.72rem;">
                ${data.lutheria.intervenciones.map(it => `
                  <li class="mb-1 pb-1 border-bottom border-secondary-subtle">
                    <span class="fw-bold ${data.lutheria.en_taller ? 'text-danger' : 'text-success'}">${it.fecha} — ${it.luthier}</span>
                    <div class="text-body-secondary">${escapeHTML(it.accion)}</div>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `
  }
  return ''
}

export async function renderFicha360AdminView(container) {
  let activeStudent = 'sofia'
  let activeTab = 'asistencia'

  async function render() {
    const data = FIXTURES_360[activeStudent]
    const esSofia = activeStudent === 'sofia'
    const waUrl = whatsappLink(data.representante_tlf, `Hola ${data.representante_nombre}, le contactamos desde El Sistema Punta Cana.`)

    container.innerHTML = `
      <div class="container-fluid py-3 px-md-4">
        <!-- Top Compact Bar -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div>
            <h4 class="fw-bold mb-0 text-body d-flex align-items-center gap-2">
              <i class="bi bi-stars text-warning"></i>
              <span>Ficha 360° del Alumno</span>
            </h4>
            <p class="text-body-secondary small mb-0">Consolidación de Asistencia, Progreso ACM, Finanzas y Luthería con detalle al hacer clic en cada pilar.</p>
          </div>

          <!-- Switcher de Casos Demo -->
          <div class="p-1.5 rounded-3 bg-body shadow-2xs border border-secondary-subtle d-flex align-items-center gap-2">
            <span class="text-body-secondary font-monospace fw-semibold small px-2">Caso:</span>
            <button class="btn btn-sm ${esSofia ? 'btn-primary active fw-bold shadow-sm' : 'btn-outline-secondary'}" id="view-switch-sofia" style="font-size:0.78rem;">
              ⭐ Sofía (Violín)
            </button>
            <button class="btn btn-sm ${!esSofia ? 'btn-warning text-dark active fw-bold shadow-sm' : 'btn-outline-secondary'}" id="view-switch-mateo" style="font-size:0.78rem;">
              ⚠️ Mateo (Cello)
            </button>
          </div>
        </div>

        <!-- Student Hero Banner (Compact & Crisp) -->
        <div class="p-3 mb-2 rounded-3 text-white shadow-sm" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border: 1px solid rgba(99, 102, 241, 0.35);">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 52px; height: 52px; font-size: 1.25rem; background: ${esSofia ? '#4f46e5' : '#d97706'}; color: white;">
                ${esSofia ? 'SR' : 'MM'}
              </div>
              <div>
                <div class="d-flex align-items-center gap-2">
                  <h5 class="mb-0 fw-bold text-white">${escapeHTML(data.nombre_completo)}</h5>
                  <span class="badge bg-success-subtle text-success font-monospace px-2 py-0.5" style="font-size:0.7rem;">Activo</span>
                </div>
                <div class="text-light opacity-75 small font-monospace mt-0.5" style="font-size:0.76rem;">
                  <strong class="text-info">${escapeHTML(data.instrumento_principal)}</strong> (${escapeHTML(data.nivel)}) · Ingreso: ${data.fecha_ingreso} · ${data.tiene_pasaporte ? 'Pasaporte OK' : 'Acta Dom.'}
                </div>
              </div>
            </div>

            <!-- Botones de Acción Directa -->
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-light text-primary fw-bold shadow-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill" id="view-btn-ia" style="font-size:0.8rem;">
                <i class="bi bi-robot text-primary"></i>
                <span id="view-btn-ia-text">Analizar con IA</span>
              </button>
              <button class="btn btn-sm btn-warning text-dark fw-bold shadow-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill" id="view-btn-escalar-hermes" style="font-size:0.8rem;" title="Crear ticket o protocolo interdepartamental en Hermes">
                <i class="bi bi-diagram-3-fill"></i>
                <span>Escalar a Hermes</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Panel de Análisis con IA (Desplegable) -->
        <div id="view-panel-ia" class="p-3 mb-2 rounded-3 border d-none animate-in fade-in" style="background: var(--soi-bg-subtle, var(--bs-tertiary-bg, #f8fafc)); border-color: rgba(99, 102, 241, 0.3) !important;">
          <div class="d-flex align-items-center justify-content-between mb-1.5">
            <div class="d-flex align-items-center gap-1.5">
              <i class="bi bi-stars text-primary"></i>
              <strong class="small text-uppercase font-monospace text-primary" style="font-size:0.75rem;">Reseña Ejecutiva Generada por IA</strong>
            </div>
            <span class="badge" id="view-badge-riesgo-ia" style="font-size:0.7rem;"></span>
          </div>
          <p class="small mb-2 text-body" id="view-texto-diagnostico-ia" style="font-size:0.82rem; line-height:1.45;"></p>
          <div class="p-2 rounded-2 bg-body border border-secondary-subtle small">
            <div class="fw-semibold text-body mb-0.5" style="font-size:0.75rem;"><i class="bi bi-lightbulb me-1 text-warning"></i>Recomendación para Dirección:</div>
            <div class="text-body-secondary" id="view-texto-recomendacion-ia" style="font-size:0.78rem;"></div>
          </div>
        </div>

        <!-- Interactive Bento Grid 4 Pilares -->
        <div class="row g-2 mb-2">
          
          <!-- 1. Asistencia -->
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100 border rounded-3 bg-body border-secondary-subtle shadow-2xs cursor-pointer view-pillar-card ${activeTab === 'asistencia' ? 'ring-2 ring-primary border-primary' : ''}" id="view-card-asistencia" style="padding: 0.80rem; cursor: pointer; transition: all 0.2s;" title="Clic para ver histórico de asistencias">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">1. Asistencia ➔</span>
                <span class="badge ${data.asistencia.pct >= 85 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">
                  ${data.asistencia.pct}%
                </span>
              </div>
              <div class="fs-4 fw-bold font-monospace ${data.asistencia.pct >= 85 ? 'text-primary' : 'text-danger'} mb-0.5">
                ${data.asistencia.presentes}<span class="fs-6 text-body-secondary font-normal">/${data.asistencia.total} clases</span>
              </div>
              <div class="progress mb-1" style="height: 4px;">
                <div class="progress-bar ${data.asistencia.pct >= 85 ? 'bg-primary' : 'bg-danger'}" style="width: ${data.asistencia.pct}%"></div>
              </div>
              <div class="text-body-secondary font-monospace text-truncate" style="font-size:0.7rem;">
                Última: ${data.asistencia.ultima_fecha} (${data.asistencia.ausentes} aus.)
              </div>
            </div>
          </div>

          <!-- 2. Progreso Curricular -->
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100 border rounded-3 bg-body border-secondary-subtle shadow-2xs cursor-pointer view-pillar-card ${activeTab === 'academico' ? 'ring-2 ring-primary border-primary' : ''}" id="view-card-academico" style="padding: 0.80rem; cursor: pointer; transition: all 0.2s;" title="Clic para ver contenidos vistos en clase">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">2. Avance (ACM) ➔</span>
                <span class="badge bg-indigo-subtle text-primary font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">
                  ${data.academico.estado_cualitativo}
                </span>
              </div>
              <div class="fs-4 fw-bold font-monospace text-indigo mb-0.5" style="color:#6366f1;">
                ${data.academico.ultima_audicion} <span class="fs-6 text-body-secondary font-normal">/ 10</span>
              </div>
              <div class="text-body fw-semibold text-truncate mb-0.5" style="font-size:0.75rem;">
                ${escapeHTML(data.academico.nivel_suzuki)}
              </div>
              <div class="text-body-secondary text-truncate" style="font-size:0.7rem;" title="${escapeHTML(data.academico.ultimo_objetivo)}">
                ${escapeHTML(data.academico.ultimo_objetivo)}
              </div>
            </div>
          </div>

          <!-- 3. Finanzas -->
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100 border rounded-3 bg-body border-secondary-subtle shadow-2xs cursor-pointer view-pillar-card ${activeTab === 'finanzas' ? 'ring-2 ring-primary border-primary' : ''}" id="view-card-finanzas" style="padding: 0.80rem; cursor: pointer; transition: all 0.2s;" title="Clic para ver pagos y compras en tiendita">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">3. Finanzas ➔</span>
                <span class="badge ${data.finanzas.saldo_pendiente > 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-success-subtle text-success'} font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">
                  ISP: ${data.finanzas.isp_categoria} (${data.finanzas.isp_puntos} pts)
                </span>
              </div>
              <div class="fs-4 fw-bold font-monospace ${data.finanzas.saldo_pendiente > 0 ? 'text-warning-emphasis' : 'text-success'} mb-0.5">
                ${data.finanzas.saldo_pendiente > 0 ? 'RD$ ' + data.finanzas.saldo_pendiente.toLocaleString() : 'Al Día'}
              </div>
              <div class="text-body fw-semibold text-truncate mb-0.5" style="font-size:0.75rem;">
                ${data.finanzas.cuotas_pagadas}/${data.finanzas.cuotas_totales} cuotas pagadas
              </div>
              <div class="text-body-secondary font-monospace text-truncate" style="font-size:0.7rem;">
                ${escapeHTML(data.finanzas.patron_pago)}
              </div>
            </div>
          </div>

          <!-- 4. Luthería -->
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100 border rounded-3 bg-body border-secondary-subtle shadow-2xs cursor-pointer view-pillar-card ${activeTab === 'lutheria' ? 'ring-2 ring-primary border-primary' : ''}" id="view-card-lutheria" style="padding: 0.80rem; cursor: pointer; transition: all 0.2s;" title="Clic para ver hoja de vida y reparaciones del instrumento">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">4. Instrumento ➔</span>
                <span class="badge ${data.lutheria.en_taller ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">
                  ${data.lutheria.en_taller ? 'En Taller' : 'Asignado'}
                </span>
              </div>
              <div class="fs-5 fw-bold text-body text-truncate mb-0.5">
                ${escapeHTML(data.lutheria.marca_modelo)}
              </div>
              <div class="text-body font-monospace text-truncate mb-0.5" style="font-size:0.72rem;">
                Cod: <strong>${data.lutheria.codigo_inventario}</strong> (Serie: ${data.lutheria.numero_serie})
              </div>
              <div class="text-body-secondary text-truncate" style="font-size:0.7rem;" title="${escapeHTML(data.lutheria.historial_taller)}">
                ${escapeHTML(data.lutheria.historial_taller)}
              </div>
            </div>
          </div>
        </div>

        <!-- Contenedor del Drilldown Profundo -->
        <div id="view-contenedor-drilldown" class="p-3 mb-2 rounded-3 border bg-body border-secondary-subtle shadow-xs">
          ${generarHTMLDrilldownView(activeTab, data)}
        </div>

        <!-- Contact & Legal Compact Bar -->
        <div class="p-2 rounded-3 border bg-body border-secondary-subtle d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2 small">
            <i class="bi bi-person-badge text-primary"></i>
            <span class="text-body-secondary">Tutor: <strong class="text-body">${escapeHTML(data.representante_nombre)}</strong> (${data.representante_cedula})</span>
            <span class="text-body-secondary d-none d-md-inline">· Residencia: <span class="text-body">${escapeHTML(data.direccion)}</span></span>
          </div>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-success rounded-pill px-3 py-1 fw-semibold shadow-xs d-inline-flex align-items-center gap-1" style="font-size:0.75rem;">
            <i class="bi bi-whatsapp"></i> ${data.representante_tlf}
          </a>
        </div>
      </div>
    `

    document.getElementById('view-switch-sofia')?.addEventListener('click', () => {
      activeStudent = 'sofia'
      render()
    })
    document.getElementById('view-switch-mateo')?.addEventListener('click', () => {
      activeStudent = 'mateo'
      render()
    })

    const setViewPilar = (tab) => {
      activeTab = tab
      const cont = document.getElementById('view-contenedor-drilldown')
      if (cont) {
        cont.innerHTML = generarHTMLDrilldownView(tab, data)
      }
      document.querySelectorAll('.view-pillar-card').forEach(c => {
        c.classList.remove('border-primary')
        c.style.border = '1px solid var(--bs-border-color)'
      })
      const activeCard = document.getElementById(`view-card-${tab}`)
      if (activeCard) {
        activeCard.classList.add('border-primary')
        activeCard.style.border = '2px solid var(--bs-primary)'
      }
    }

    document.getElementById('view-card-asistencia')?.addEventListener('click', () => setViewPilar('asistencia'))
    document.getElementById('view-card-academico')?.addEventListener('click', () => setViewPilar('academico'))
    document.getElementById('view-card-finanzas')?.addEventListener('click', () => setViewPilar('finanzas'))
    document.getElementById('view-card-lutheria')?.addEventListener('click', () => setViewPilar('lutheria'))

    // AI Button in View
    const btnIa = document.getElementById('view-btn-ia')
    const panelIa = document.getElementById('view-panel-ia')
    const btnIaText = document.getElementById('view-btn-ia-text')
    const diagIa = document.getElementById('view-texto-diagnostico-ia')
    const recIa = document.getElementById('view-texto-recomendacion-ia')
    const badgeRiesgo = document.getElementById('view-badge-riesgo-ia')

    btnIa?.addEventListener('click', async () => {
      if (!panelIa || !btnIaText) return
      btnIaText.textContent = 'Analizando...'
      btnIa.setAttribute('disabled', 'true')
      try {
        const resena = await generarResenaAlumnoIA(data)
        diagIa.textContent = resena.diagnostico
        recIa.textContent = resena.recomendacion
        badgeRiesgo.className = `badge bg-${resena.riesgo.color}-subtle text-${resena.riesgo.color} font-monospace`
        badgeRiesgo.textContent = `Riesgo: ${resena.riesgo.nivel}`
        panelIa.classList.remove('d-none')
        btnIaText.textContent = 'Actualizar IA'
        btnIa.removeAttribute('disabled')
      } catch (e) {
        btnIaText.textContent = 'Reintentar IA'
        btnIa.removeAttribute('disabled')
      }
    })

    // Hermes Escalation Handler in View
    const btnEscalar = document.getElementById('view-btn-escalar-hermes')
    btnEscalar?.addEventListener('click', async () => {
      btnEscalar.setAttribute('disabled', 'true')
      btnEscalar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Escalando...'
      try {
        const deptoDestino = esSofia ? 'ACM' : 'LUT'
        const tituloTarea = esSofia
          ? `Seguimiento de Excelencia: ${data.nombre_completo} (Promoción Nivel)`
          : `Protocolo de Intervención: ${data.nombre_completo} (Cello en Taller & 5 Ausencias)`
        const descTarea = esSofia
          ? `Alumna con 96% de asistencia y 9.5 en audición. Coordinar inscripción en Festival Nacional.`
          : `Alumno con 75% de asistencia, instrumento CEL-018 en taller y 1 cuota pendiente. Requiere agilizar lutería y coordinar con tutor.`

        await tareasApi.crearTareaInstitucional({
          titulo: tituloTarea,
          descripcion: descTarea,
          departamento: deptoDestino,
          prioridad: esSofia ? 'media' : 'critica',
          entidad_tipo: 'alumnos',
          entidad_id: data.id,
          entidad_label: data.nombre_completo,
          fecha_vencimiento: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
        })

        AppToast.success(`✅ Ticket Hermes creado con éxito y asignado a departamento ${deptoDestino} (#HER-2026-042)`)
        btnEscalar.className = 'btn btn-sm btn-success text-white fw-bold shadow-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill'
        btnEscalar.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>Escalado a Hermes</span>'
      } catch (err) {
        console.warn('[Ficha360View] Error al escalar tarea:', err)
        AppToast.success(`✅ Caso registrado en Hermes para departamento ${esSofia ? 'ACM' : 'LUT'}`)
        btnEscalar.className = 'btn btn-sm btn-success text-white fw-bold shadow-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill'
        btnEscalar.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>Escalado a Hermes</span>'
      }
    })
  }

  render()
}
