import {
  getMaestroProfile,
  getMaestroClasesDetalle,
  getMaestroHistoricoDesempeno,
  getMaestroNotificationHistory,
  registrarContactoWhatsAppMaestro,
  actualizarTelefonoMaestro,
  normalizarTelefonoWhatsApp,
  getSemanaActualSantoDomingo,
} from '../api/adminMaestroApi.js'
import { router } from '../../../core/router/router.js'

function escHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export class MaestroDetalleView {
  constructor(containerId, maestroId) {
    this.containerId = containerId
    this.maestroId = maestroId
    this.container = document.getElementById(containerId)
    this.maestro = null
    this.clasesProgramadas = []
    this.historico = null
    this.notificaciones = []
    this.filtroVista = 'todas' // 'todas' | 'pendientes'
    this.claseSeleccionadaParaWhatsApp = null
  }

  async init() {
    try {
      this.container.innerHTML = `
        <div class="premium-loading" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:350px;gap:1rem;">
          <div class="premium-loading-spinner" style="width:42px;height:42px;border:3px solid rgba(99,102,241,0.2);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
          <div style="color:#94a3b8;font-size:0.95rem;font-weight:500;">Cargando balance canónico de clases y asistencia...</div>
        </div>
      `

      const [maestro, clasesProgramadas, historico, notificaciones] = await Promise.all([
        getMaestroProfile(this.maestroId),
        getMaestroClasesDetalle(this.maestroId),
        getMaestroHistoricoDesempeno(this.maestroId),
        getMaestroNotificationHistory(this.maestroId),
      ])

      this.maestro = maestro
      this.clasesProgramadas = clasesProgramadas || []
      this.historico = historico
      this.notificaciones = notificaciones

      this.render()
    } catch (err) {
      console.error('[MaestroDetalleView] Error:', err)
      this.container.innerHTML = `
        <div class="premium-error-card" style="padding:2rem;background:#1e1b2e;border:1px solid rgba(239,68,68,0.3);border-radius:16px;text-align:center;">
          <i class="bi bi-exclamation-triangle-fill" style="font-size:2.5rem;color:#ef4444;margin-bottom:1rem;display:inline-block;"></i>
          <h4 style="color:#f87171;margin-bottom:0.5rem;">Error al cargar el detalle</h4>
          <div style="color:#94a3b8;font-size:0.9rem;">${escHTML(err.message)}</div>
          <button class="btn btn-sm btn-outline-secondary mt-3" id="btnVolverError">Volver al panel</button>
        </div>`
      document.getElementById('btnVolverError')?.addEventListener('click', () => router.navigate('admin-dashboard'))
    }
  }

  render() {
    const m = this.maestro || { nombre_completo: 'Maestro de Cátedra', especialidad: 'Música', telefono: '' }
    const h = this.historico || { total: 0, registradas: 0, pendientes: 0, vencidas: 0, porcentajeCumplimiento: 100, esSolvente: true, semanas: [] }
    const notiCount = this.notificaciones?.length ?? 0

    const pendientesCount = this.clasesProgramadas.filter(c => c.estado === 'pendiente').length
    const vencidasCount = this.clasesProgramadas.filter(c => c.estado === 'vencida').length
    const esSolvente = pendientesCount === 0 && vencidasCount === 0

    const clasesAMostrar = this.filtroVista === 'pendientes'
      ? this.clasesProgramadas.filter(c => c.estado === 'pendiente' || c.estado === 'vencida')
      : this.clasesProgramadas

    const iniciales = (m.nombre_completo || 'M')
      .split(' ')
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .toUpperCase()

    this.container.innerHTML = `
      <div class="maestro-detalle-wrapper" style="max-width:1200px;margin:0 auto;color:#f1f5f9;display:flex;flex-direction:column;gap:1.5rem;">
        
        <!-- HEADER PRINCIPAL -->
        <div class="maestro-header-card" style="background:linear-gradient(135deg, rgba(30,27,75,0.85), rgba(15,23,42,0.95));border:1px solid rgba(99,102,241,0.25);border-radius:20px;padding:1.5rem 1.75rem;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.25rem;">
          
          <div style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline-light" id="btnVolver" style="border-radius:10px;padding:0.45rem 0.9rem;border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#e2e8f0;font-weight:600;display:inline-flex;align-items:center;gap:0.5rem;">
              <i class="bi bi-arrow-left"></i> Volver
            </button>

            <div style="width:54px;height:54px;border-radius:16px;background:linear-gradient(135deg, #6366f1, #a855f7);display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;color:#fff;box-shadow:0 4px 14px rgba(99,102,241,0.4);">
              ${iniciales}
            </div>

            <div>
              <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                <h3 style="margin:0;font-size:1.4rem;font-weight:800;letter-spacing:-0.02em;color:#f8fafc;">
                  ${escHTML(m.nombre_completo)}
                </h3>
                <span class="badge" style="background:${esSolvente ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};color:${esSolvente ? '#34d399' : '#f87171'};border:1px solid ${esSolvente ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};padding:0.35rem 0.65rem;border-radius:8px;font-size:0.75rem;font-weight:700;">
                  <i class="bi ${esSolvente ? 'bi-patch-check-fill' : 'bi-exclamation-triangle-fill'}"></i> ${esSolvente ? 'Solvente para Nómina' : 'Insolvente (Requiere Registros)'}
                </span>
              </div>
              <p style="margin:0.25rem 0 0;color:#94a3b8;font-size:0.875rem;display:flex;gap:1rem;flex-wrap:wrap;">
                <span><i class="bi bi-music-note-beamed" style="color:#818cf8;"></i> ${escHTML(m.especialidad || 'Cátedra')}</span>
                <span><i class="bi bi-telephone" style="color:#38bdf8;"></i> ${m.telefono ? escHTML(m.telefono) : '<span style="color:#fbbf24;font-size:0.8rem;">Sin teléfono registrado</span>'}</span>
                ${m.email && m.email !== '---' ? `<span><i class="bi bi-envelope" style="color:#a78bfa;"></i> ${escHTML(m.email)}</span>` : ''}
              </p>
            </div>
          </div>

          <!-- BOTONES DE ACCIÓN RÁPIDA -->
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <button class="btn btn-success" id="btnOpenWhatsAppModal" style="background:linear-gradient(135deg, #25D366, #128C7E);border:none;border-radius:12px;padding:0.6rem 1.25rem;font-weight:700;font-size:0.9rem;display:inline-flex;align-items:center;gap:0.5rem;box-shadow:0 4px 15px rgba(37,211,102,0.3);color:#fff;">
              <i class="bi bi-whatsapp" style="font-size:1.1rem;"></i> Enviar Recordatorio WhatsApp
            </button>
          </div>
        </div>

        <!-- BENTO KPIS -->
        <div class="metrics-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1rem;">
          
          <!-- Tasa de Cumplimiento -->
          <div class="kpi-card" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.25rem;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg, #10b981, #06b6d4);"></div>
            <div style="color:#94a3b8;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;">
              Cumplimiento Canónico
            </div>
            <div style="display:flex;align-items:baseline;gap:0.5rem;">
              <span style="font-size:2rem;font-weight:800;color:${h.porcentajeCumplimiento >= 85 ? '#34d399' : h.porcentajeCumplimiento >= 70 ? '#f97316' : '#f87171'};">
                ${h.porcentajeCumplimiento}%
              </span>
              <span style="color:#64748b;font-size:0.8rem;">global</span>
            </div>
            <div style="margin-top:0.5rem;width:100%;height:6px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;">
              <div style="width:${Math.min(100, h.porcentajeCumplimiento)}%;height:100%;background:linear-gradient(90deg, #10b981, #34d399);border-radius:999px;"></div>
            </div>
          </div>

          <!-- Clases Pendientes (<= 7 días) -->
          <div class="kpi-card" style="background:#0f172a;border:1px solid ${pendientesCount > 0 ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'};border-radius:16px;padding:1.25rem;position:relative;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#f97316;"></div>
            <div style="color:#94a3b8;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;">
              Pendientes (&le; 7 días)
            </div>
            <div style="font-size:2rem;font-weight:800;color:${pendientesCount > 0 ? '#f97316' : '#f8fafc'};">
              ${pendientesCount}
            </div>
            <div style="color:#64748b;font-size:0.75rem;margin-top:0.25rem;">
              ${pendientesCount === 0 ? 'Sin atrasos recientes' : 'Requiere registro docente'}
            </div>
          </div>

          <!-- Clases Vencidas (> 7 días) -->
          <div class="kpi-card" style="background:#0f172a;border:1px solid ${vencidasCount > 0 ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'};border-radius:16px;padding:1.25rem;position:relative;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#ef4444;"></div>
            <div style="color:#94a3b8;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;">
              Vencidas (&gt; 7 días)
            </div>
            <div style="font-size:2rem;font-weight:800;color:${vencidasCount > 0 ? '#ef4444' : '#34d399'};">
              ${vencidasCount}
            </div>
            <div style="color:#64748b;font-size:0.75rem;margin-top:0.25rem;">
              ${vencidasCount > 0 ? 'Bloquea nómina docente' : 'Sin clases vencidas'}
            </div>
          </div>

          <!-- Notificaciones y Recordatorios -->
          <div class="kpi-card" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.25rem;position:relative;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#8b5cf6;"></div>
            <div style="color:#94a3b8;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;display:flex;align-items:center;justify-content:space-between;">
              <span>Recordatorios</span>
              <i class="bi bi-info-circle" title="Historial de avisos por WhatsApp enviados al docente" style="cursor:help;"></i>
            </div>
            <div style="font-size:2rem;font-weight:800;color:#c084fc;">
              ${notiCount}
            </div>
            <div style="color:#64748b;font-size:0.75rem;margin-top:0.25rem;">
              ${notiCount === 0 ? 'Sin recordatorios emitidos' : 'Avisos registrados'}
            </div>
          </div>

        </div>

        <!-- GRÁFICA DE DESEMPEÑO HISTÓRICO -->
        <div class="grafica-card" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">
          
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;">
            <div>
              <h4 style="margin:0;font-size:1.1rem;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:0.5rem;">
                <i class="bi bi-graph-up-arrow" style="color:#818cf8;"></i> Desempeño Canónico de las Últimas 6 Semanas
              </h4>
              <p style="margin:0.25rem 0 0;color:#64748b;font-size:0.8rem;">
                Clases programadas según calendario vs sesiones cerradas por el maestro
              </p>
            </div>

            <!-- Leyenda de colores -->
            <div style="display:flex;align-items:center;gap:1rem;font-size:0.75rem;font-weight:600;">
              <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#34d399;">
                <span style="width:10px;height:10px;border-radius:3px;background:#10b981;display:inline-block;"></span> Registrada / Cubierta
              </span>
              <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#f97316;">
                <span style="width:10px;height:10px;border-radius:3px;background:#f97316;display:inline-block;"></span> Pendiente (&le;7d)
              </span>
              <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#ef4444;">
                <span style="width:10px;height:10px;border-radius:3px;background:#ef4444;display:inline-block;"></span> Vencida (&gt;7d)
              </span>
            </div>
          </div>

          <!-- BARRAS SEMANALES -->
          <div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:1rem;align-items:end;min-height:160px;padding:1.5rem 1rem 0.5rem;background:rgba(15,23,42,0.6);border-radius:14px;border:1px solid rgba(255,255,255,0.03);">
            ${(h.semanas || []).map(sem => {
              const totalSem = (sem.registradas + sem.pendientes + sem.vencidas) || 0
              const barHeight = totalSem > 0 ? Math.min(100, Math.max(25, totalSem * 22)) : 10
              const pctVerde = totalSem > 0 ? Math.round((sem.registradas / totalSem) * 100) : 100
              const pctNaranja = totalSem > 0 ? Math.round((sem.pendientes / totalSem) * 100) : 0
              const pctRojo = totalSem > 0 ? Math.round((sem.vencidas / totalSem) * 100) : 0

              return `
                <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;height:100%;justify-content:flex-end;">
                  <div style="width:100%;max-width:44px;height:${barHeight}px;background:rgba(255,255,255,0.05);border-radius:8px;display:flex;flex-direction:column-reverse;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:inset 0 2px 4px rgba(0,0,0,0.3);">
                    ${sem.registradas > 0 ? `<div style="height:${pctVerde}%;background:linear-gradient(180deg, #34d399, #10b981);width:100%;" title="${sem.registradas} registradas"></div>` : ''}
                    ${sem.pendientes > 0 ? `<div style="height:${pctNaranja}%;background:linear-gradient(180deg, #fb923c, #f97316);width:100%;" title="${sem.pendientes} pendientes"></div>` : ''}
                    ${sem.vencidas > 0 ? `<div style="height:${pctRojo}%;background:linear-gradient(180deg, #f87171, #ef4444);width:100%;" title="${sem.vencidas} vencidas"></div>` : ''}
                    ${totalSem === 0 ? `<div style="height:100%;background:rgba(255,255,255,0.03);width:100%;" title="Sin clases programadas"></div>` : ''}
                  </div>
                  <span style="font-size:0.75rem;font-weight:700;color:${sem.label === 'Esta Sem' ? '#818cf8' : '#94a3b8'};">
                    ${escHTML(sem.label)}
                  </span>
                </div>
              `
            }).join('')}
          </div>

        </div>

        <!-- TABLA DE CLASES PROGRAMADAS Y DETALLE -->
        <div class="tabla-card" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:1.5rem;overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem;">
            <div>
              <h4 style="margin:0;font-size:1.1rem;font-weight:700;color:#f8fafc;">
                Detalle Canónico por Clase (fn_estado_asistencia_maestro)
              </h4>
              <p style="margin:0.25rem 0 0;color:#64748b;font-size:0.8rem;">
                Programación de clases de la semana activa y estado de cierre de bitácoras
              </p>
            </div>

            <!-- Toggle filtro -->
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn ${this.filtroVista === 'todas' ? 'btn-primary' : 'btn-outline-secondary'}" id="btnFiltroTodas">
                Todas (${this.clasesProgramadas.length})
              </button>
              <button type="button" class="btn ${this.filtroVista === 'pendientes' ? 'btn-warning' : 'btn-outline-secondary'}" id="btnFiltroPendientes" style="${this.filtroVista === 'pendientes' ? 'background:#f97316;border-color:#f97316;color:#fff;' : ''}">
                Solo Pendientes/Vencidas (${pendientesCount + vencidasCount})
              </button>
            </div>
          </div>

          <div style="overflow-x:auto;">
            <table class="table" style="width:100%;border-collapse:separate;border-spacing:0 0.5rem;margin:0;">
              <thead>
                <tr style="color:#64748b;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">
                  <th style="padding:0.75rem 1rem;background:transparent;border:none;">Cátedra / Clase</th>
                  <th style="padding:0.75rem 1rem;background:transparent;border:none;">Fecha</th>
                  <th style="padding:0.75rem 1rem;background:transparent;border:none;">Horario</th>
                  <th style="padding:0.75rem 1rem;background:transparent;border:none;">Estado Canónico</th>
                  <th style="padding:0.75rem 1rem;background:transparent;border:none;">Días Atraso</th>
                  <th style="padding:0.75rem 1rem;background:transparent;border:none;text-align:right;">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${clasesAMostrar.length === 0
                  ? `
                    <tr>
                      <td colspan="6" style="text-align:center;padding:3rem 1rem;background:rgba(255,255,255,0.02);border-radius:12px;color:#94a3b8;">
                        <i class="bi bi-check-circle-fill" style="font-size:2rem;color:#10b981;margin-bottom:0.5rem;display:inline-block;"></i>
                        <div style="font-weight:600;color:#e2e8f0;">¡Excelente! No hay clases pendientes en este rango</div>
                        <div style="font-size:0.8rem;color:#64748b;">Todas las clases programadas se encuentran registradas o al día.</div>
                      </td>
                    </tr>
                  `
                  : clasesAMostrar.map(r => {
                    let badgeBg = 'background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);'
                    let estadoLabel = 'REGISTRADA'
                    let estadoIcon = 'bi-check-circle-fill'

                    if (r.estado === 'cubierta_emergente') {
                      badgeBg = 'background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);'
                      estadoLabel = 'CUBIERTA EMERGENTE'
                      estadoIcon = 'bi-shield-fill-check'
                    } else if (r.estado === 'futura') {
                      badgeBg = 'background:rgba(100,116,139,0.15);color:#94a3b8;border:1px solid rgba(100,116,139,0.3);'
                      estadoLabel = 'FUTURA'
                      estadoIcon = 'bi-calendar-event'
                    } else if (r.estado === 'pendiente') {
                      badgeBg = 'background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3);'
                      estadoLabel = 'PENDIENTE (<=7D)'
                      estadoIcon = 'bi-clock-fill'
                    } else if (r.estado === 'vencida') {
                      badgeBg = 'background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);'
                      estadoLabel = 'VENCIDA (>7D)'
                      estadoIcon = 'bi-exclamation-triangle-fill'
                    }

                    const nombreClase = r.clase_nombre || 'Cátedra Instrumental'
                    const fechaStr = r.fecha ? new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : '---'
                    const horaInicio = r.hora_inicio ? r.hora_inicio.slice(0, 5) : ''
                    const horaFin = r.hora_fin ? r.hora_fin.slice(0, 5) : ''
                    const horarioStr = horaInicio ? `${horaInicio} - ${horaFin}` : '---'

                    return `
                      <tr style="background:rgba(255,255,255,0.02);transition:all 0.2s ease;">
                        
                        <!-- CLASE -->
                        <td style="padding:1rem;border-radius:12px 0 0 12px;border:1px solid rgba(255,255,255,0.05);border-right:none;">
                          <div style="font-weight:700;color:#f8fafc;font-size:0.95rem;display:flex;align-items:center;gap:0.5rem;">
                            <i class="bi bi-mortarboard" style="color:#818cf8;"></i>
                            ${escHTML(nombreClase)}
                          </div>
                        </td>

                        <!-- FECHA -->
                        <td style="padding:1rem;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1;font-size:0.85rem;font-weight:600;">
                          ${escHTML(fechaStr)}
                        </td>

                        <!-- HORARIO -->
                        <td style="padding:1rem;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);color:#94a3b8;font-size:0.8rem;">
                          <i class="bi bi-clock"></i> ${escHTML(horarioStr)}
                        </td>

                        <!-- ESTADO CANÓNICO -->
                        <td style="padding:1rem;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.3rem 0.65rem;border-radius:8px;font-size:0.72rem;font-weight:700;${badgeBg}">
                            <i class="bi ${estadoIcon}"></i>
                            ${estadoLabel}
                          </span>
                        </td>

                        <!-- DÍAS ATRASO -->
                        <td style="padding:1rem;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);font-weight:700;color:${r.dias_atraso > 7 ? '#ef4444' : r.dias_atraso > 0 ? '#f97316' : '#64748b'};font-size:0.85rem;">
                          ${r.dias_atraso ?? 0} días
                        </td>

                        <!-- ACCIÓN -->
                        <td style="padding:1rem;border-radius:0 12px 12px 0;border:1px solid rgba(255,255,255,0.05);border-left:none;text-align:right;">
                          <button class="btn btn-sm btn-outline-success btnRecordarClaseWA" data-clase="${escHTML(nombreClase)}" data-fecha="${escHTML(fechaStr)}" style="border-radius:8px;padding:0.35rem 0.75rem;font-size:0.8rem;font-weight:600;border-color:rgba(37,211,102,0.4);color:#34d399;background:rgba(37,211,102,0.08);display:inline-flex;align-items:center;gap:0.35rem;">
                            <i class="bi bi-whatsapp"></i> Recordar
                          </button>
                        </td>

                      </tr>
                    `
                  }).join('')
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- MODAL DE WHATSAPP CON PLANTILLAS -->
      <div id="modalWhatsAppMaestro" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;padding:1rem;">
        <div style="background:#0f172a;border:1px solid rgba(37,211,102,0.3);border-radius:20px;max-width:550px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);overflow:hidden;display:flex;flex-direction:column;">
          
          <!-- MODAL HEADER -->
          <div style="background:linear-gradient(135deg, #1e293b, #0f172a);padding:1.25rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div style="width:40px;height:40px;border-radius:12px;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.25rem;">
                <i class="bi bi-whatsapp"></i>
              </div>
              <div>
                <h5 style="margin:0;font-size:1.05rem;font-weight:800;color:#f8fafc;">
                  Notificar al Maestro por WhatsApp
                </h5>
                <span style="font-size:0.75rem;color:#94a3b8;">
                  Destinatario: ${escHTML(m.nombre_completo)}
                </span>
              </div>
            </div>
            <button id="btnCloseWAModal" style="background:none;border:none;color:#94a3b8;font-size:1.25rem;cursor:pointer;">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- MODAL BODY -->
          <div style="padding:1.25rem 1.5rem;display:flex;flex-direction:column;gap:1rem;">
            
            <!-- Campo de Teléfono Destino Editable -->
            <div>
              <label style="font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;display:flex;align-items:center;justify-content:space-between;">
                <span>Número de WhatsApp del Profesor</span>
                <span style="color:#38bdf8;font-size:0.7rem;font-weight:600;"><i class="bi bi-shield-check"></i> Formato internacional</span>
              </label>
              <div style="display:flex;gap:0.5rem;">
                <input type="text" id="txtTelefonoDestinoWA" class="form-control" value="${escHTML(m.telefono || '')}" placeholder="Ej: 04141234567 o +584141234567" style="background:#1e293b;border:1px solid rgba(255,255,255,0.12);color:#f1f5f9;border-radius:10px;padding:0.5rem 0.75rem;font-size:0.875rem;flex:1;">
                <button type="button" id="btnGuardarTelefonoPerfil" class="btn btn-sm btn-outline-info" style="border-radius:10px;padding:0.4rem 0.75rem;font-size:0.75rem;font-weight:600;white-space:nowrap;" title="Guardar este número en el expediente del maestro">
                  <i class="bi bi-save"></i> Guardar
                </button>
              </div>
              <div id="lblGuardarTelefonoMsg" style="font-size:0.7rem;color:#34d399;margin-top:0.25rem;display:none;"></div>
            </div>

            <!-- Selector de Plantillas -->
            <div>
              <label style="font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;display:block;">
                Seleccionar Plantilla de Mensaje
              </label>
              <select id="selectPlantillaWA" class="form-select" style="background:#1e293b;border:1px solid rgba(255,255,255,0.12);color:#f1f5f9;border-radius:10px;padding:0.5rem 0.75rem;font-size:0.85rem;">
                <option value="recordatorio_general">1. Recordatorio de Clases Pendientes</option>
                <option value="cierre_nomina">2. Alerta de Cierre & Solvencia de Nómina</option>
                <option value="clase_especifica">3. Recordatorio de Clase Específica</option>
                <option value="libre">4. Mensaje Personalizado</option>
              </select>
            </div>

            <!-- Previsualización de Mensaje tipo WhatsApp -->
            <div>
              <label style="font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;display:block;">
                Mensaje a Enviar
              </label>
              <div style="background:#0b141a;border:1px solid rgba(37,211,102,0.2);border-radius:12px;padding:1rem;position:relative;">
                <textarea id="txtMensajeWA" rows="6" style="width:100%;background:transparent;border:none;color:#e9edef;font-size:0.875rem;line-height:1.4;resize:vertical;outline:none;font-family:inherit;"></textarea>
                <div style="text-align:right;font-size:0.7rem;color:#8696a0;margin-top:0.25rem;">
                  <i class="bi bi-check2-all" style="color:#53bdeb;"></i> Vista previa
                </div>
              </div>
            </div>

          </div>

          <!-- MODAL FOOTER -->
          <div style="background:linear-gradient(135deg, #1e293b, #0f172a);padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:flex-end;gap:0.75rem;">
            <button id="btnCancelarWAModal" class="btn btn-sm btn-outline-secondary" style="border-radius:10px;padding:0.5rem 1rem;color:#cbd5e1;">
              Cancelar
            </button>
            <button id="btnDispararWhatsApp" class="btn btn-sm btn-success" style="background:#25D366;border:none;border-radius:10px;padding:0.5rem 1.25rem;font-weight:700;display:inline-flex;align-items:center;gap:0.5rem;color:#fff;box-shadow:0 4px 12px rgba(37,211,102,0.35);">
              <i class="bi bi-send-fill"></i> Abrir WhatsApp & Registrar
            </button>
          </div>

        </div>
      </div>
    `

    this.attachEvents()
  }

  attachEvents() {
    document.getElementById('btnVolver')?.addEventListener('click', () => {
      router.navigate('admin-dashboard')
    })

    document.getElementById('btnFiltroTodas')?.addEventListener('click', () => {
      this.filtroVista = 'todas'
      this.render()
    })

    document.getElementById('btnFiltroPendientes')?.addEventListener('click', () => {
      this.filtroVista = 'pendientes'
      this.render()
    })

    const modal = document.getElementById('modalWhatsAppMaestro')
    const btnOpenWA = document.getElementById('btnOpenWhatsAppModal')
    const btnCloseWA = document.getElementById('btnCloseWAModal')
    const btnCancelarWA = document.getElementById('btnCancelarWAModal')
    const selectPlantilla = document.getElementById('selectPlantillaWA')
    const txtMensaje = document.getElementById('txtMensajeWA')
    const txtTelefono = document.getElementById('txtTelefonoDestinoWA')
    const btnGuardarTel = document.getElementById('btnGuardarTelefonoPerfil')
    const lblGuardarMsg = document.getElementById('lblGuardarTelefonoMsg')
    const btnDispararWA = document.getElementById('btnDispararWhatsApp')

    const updatePlantilla = () => {
      const p = selectPlantilla.value
      const nombre = this.maestro?.nombre_completo || 'Maestro'
      const pendientesCount = this.clasesProgramadas.filter(c => c.estado === 'pendiente' || c.estado === 'vencida').length

      if (p === 'recordatorio_general') {
        txtMensaje.value = `Estimado Maestro ${nombre}, le saludamos desde la Dirección Académica de El Sistema Punta Cana. Le recordamos que mantiene ${pendientesCount} registro(s) de asistencia pendiente(s) en la plataforma. Agradecemos su apoyo completándolos hoy para mantener el seguimiento al día: ${window.location.origin}/maestro`
      } else if (p === 'cierre_nomina') {
        txtMensaje.value = `¡Alerta Institucional! Estimado Maestro ${nombre}, estamos en proceso de validación y cierre para la nómina académica. Tiene ${pendientesCount} sesión(es) pendientes o vencidas que requieren su registro inmediato para emitir su solvencia: ${window.location.origin}/maestro`
      } else if (p === 'clase_especifica') {
        const c = this.claseSeleccionadaParaWhatsApp
        const claseNombre = c?.clase || 'su cátedra'
        const fechaStr = c?.fecha || 'reciente'
        txtMensaje.value = `Estimado Maestro ${nombre}, le recordamos realizar el registro de asistencia y contenido de la sesión de *${claseNombre}* correspondiente al *${fechaStr}*. Enlace directo: ${window.location.origin}/maestro`
      } else {
        txtMensaje.value = `Hola Maestro ${nombre}, `
      }
    }

    btnOpenWA?.addEventListener('click', () => {
      this.claseSeleccionadaParaWhatsApp = null
      selectPlantilla.value = 'recordatorio_general'
      updatePlantilla()
      modal.style.display = 'flex'
    })

    btnCloseWA?.addEventListener('click', () => { modal.style.display = 'none' })
    btnCancelarWA?.addEventListener('click', () => { modal.style.display = 'none' })
    selectPlantilla?.addEventListener('change', updatePlantilla)

    // Botones individuales de cada fila
    this.container.querySelectorAll('.btnRecordarClaseWA').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clase = btn.dataset.clase
        const fecha = btn.dataset.fecha
        this.claseSeleccionadaParaWhatsApp = { clase, fecha }
        selectPlantilla.value = 'clase_especifica'
        updatePlantilla()
        modal.style.display = 'flex'
      })
    })

    // Guardar número de teléfono editado
    btnGuardarTel?.addEventListener('click', async () => {
      const nuevoTel = txtTelefono.value.trim()
      btnGuardarTel.disabled = true
      btnGuardarTel.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'

      const updated = await actualizarTelefonoMaestro(this.maestroId, nuevoTel)
      btnGuardarTel.disabled = false
      btnGuardarTel.innerHTML = '<i class="bi bi-save"></i> Guardar'

      if (updated) {
        this.maestro.telefono = nuevoTel
        this.maestro.tlf = nuevoTel
        lblGuardarMsg.style.display = 'block'
        lblGuardarMsg.style.color = '#34d399'
        lblGuardarMsg.textContent = '✓ Teléfono actualizado en el expediente del maestro'
        setTimeout(() => { lblGuardarMsg.style.display = 'none' }, 4000)
      } else {
        lblGuardarMsg.style.display = 'block'
        lblGuardarMsg.style.color = '#f87171'
        lblGuardarMsg.textContent = 'Error al guardar el número en la base de datos'
      }
    })

    // Abrir WhatsApp y registrar notificación
    btnDispararWA?.addEventListener('click', async () => {
      const mensaje = txtMensaje.value.trim()
      const rawPhone = txtTelefono.value.trim() || this.maestro?.telefono
      const phoneClean = normalizarTelefonoWhatsApp(rawPhone)

      if (!phoneClean) {
        alert('Por favor ingrese un número de teléfono válido para el maestro.')
        return
      }

      await registrarContactoWhatsAppMaestro(this.maestroId, {
        mensaje,
        canal: 'whatsapp',
        tipo: selectPlantilla.value
      })

      const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`
      window.open(waUrl, '_blank')
      modal.style.display = 'none'

      // Recargar histórico de notificaciones
      this.notificaciones = await getMaestroNotificationHistory(this.maestroId)
      this.render()
    })
  }
}
