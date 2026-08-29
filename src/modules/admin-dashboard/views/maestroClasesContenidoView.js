/**
 * maestroClasesContenidoView.js
 * "Clases Dadas" de un maestro — vista aérea para admin/superadmin/
 * coordinación académica. Contraparte, del lado del panel admin, de
 * portal-maestros/views/misClasesView.js: mismo servicio de datos
 * (historialClasesService.js), estética premium/glass del admin en vez de
 * los estilos pm-* del portal de maestros.
 *
 * Agrega dos cosas que el maestro no tiene en su propia vista:
 *  - Selector de rango/clase sobre CUALQUIER maestro (recibe maestroId).
 *  - Botón manual "Analizar con IA" por clase (Groq) que pondera si esa
 *    clase avanza, está estancada, o retrocede, leyendo el contenido en
 *    texto libre que el maestro registró sesión a sesión.
 */

import { getMaestroProfile } from '../api/adminMaestroApi.js'
import {
  cargarHistorialClases,
  cargarProgresosDeClase,
  rangoFechas,
  RANGOS,
} from '../../../portal-maestros/services/historialClasesService.js'
import { generateDailyReport, generateRangeReportHTML } from '../../../portal-maestros/services/reportService.js'
import { openReport } from '../../../portal-maestros/services/reportTemplates.js'
import { analyzeClassProgress } from '../../../portal-maestros/services/groqService.js'
import { router } from '../../../core/router/router.js'
import { descargarPdfHistoricoMaestro } from '../../maestros/domain/generarPdfHistoricoMaestro.js'

function escHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function formatHora(hora) {
  return hora ? String(hora).slice(0, 5) : '—'
}

function formatFecha(fecha) {
  const d = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ESTADO_VERDICTO = {
  avanza: { label: 'AVANZA', color: '#34d399', bg: 'rgba(52, 199, 89, 0.15)', icon: 'bi-graph-up-arrow', pulse: false },
  estancada: { label: 'ESTANCADA', color: '#f87171', bg: 'rgba(255, 59, 48, 0.15)', icon: 'bi-dash-circle', pulse: true },
  retrocede: { label: 'RETROCEDE', color: '#f87171', bg: 'rgba(255, 59, 48, 0.15)', icon: 'bi-graph-down-arrow', pulse: true },
}

export class MaestroClasesContenidoView {
  constructor(containerId, maestroId) {
    this.containerId = containerId
    this.maestroId = maestroId
    this.container = document.getElementById(containerId)
    this.maestroNombre = 'Maestro de Cátedra'
    this.clases = []
    this.sesiones = []
    this.dias = 30
    this.claseFiltro = 'todas'
    // Resultado de análisis IA por claseId, en memoria — vive mientras dure
    // la vista. El botón es manual: nunca se dispara solo, y no se persiste.
    this.analisisIA = new Map()
    this.analizando = new Set()
  }

  async init() {
    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:350px;gap:1rem;">
        <div style="width:42px;height:42px;border:3px solid rgba(99,102,241,0.2);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <div style="color:#94a3b8;font-size:0.95rem;font-weight:500;">Cargando historial de clases dadas...</div>
      </div>
    `
    try {
      const [maestro, historial] = await Promise.all([
        getMaestroProfile(this.maestroId),
        cargarHistorialClases({ maestroId: this.maestroId, dias: this.dias, claseId: this.claseFiltro }),
      ])
      this.maestroNombre = maestro.nombre_completo || 'Maestro de Cátedra'
      this.clases = historial.clases
      this.sesiones = historial.sesiones
      this.render()
    } catch (err) {
      console.error('[MaestroClasesContenidoView] Error:', err)
      this.container.innerHTML = `
        <div style="padding:2rem;background:#1e1b2e;border:1px solid rgba(239,68,68,0.3);border-radius:16px;text-align:center;">
          <i class="bi bi-exclamation-triangle-fill" style="font-size:2.5rem;color:#ef4444;margin-bottom:1rem;display:inline-block;"></i>
          <h4 style="color:#f87171;margin-bottom:0.5rem;">Error al cargar el historial</h4>
          <div style="color:#94a3b8;font-size:0.9rem;">${escHTML(err.message)}</div>
          <button class="btn btn-sm btn-outline-secondary mt-3" id="btnVolverError">Volver</button>
        </div>`
      document.getElementById('btnVolverError')?.addEventListener('click', () => router.navigate('admin-dashboard'))
    }
  }

  async _recargarHistorial() {
    const historial = await cargarHistorialClases({
      maestroId: this.maestroId,
      dias: this.dias,
      claseId: this.claseFiltro,
    })
    this.clases = historial.clases
    this.sesiones = historial.sesiones
    this.render()
  }

  _sesionesPorClase() {
    const mapa = new Map()
    for (const s of this.sesiones) {
      if (!mapa.has(s.claseId)) mapa.set(s.claseId, [])
      mapa.get(s.claseId).push(s)
    }
    return mapa
  }

  render() {
    const porClase = this._sesionesPorClase()
    const clasesConSesiones = this.clases.filter((c) => porClase.has(c.id))

    const opcionesClase = this.clases
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((c) => `<option value="${c.id}" ${this.claseFiltro === c.id ? 'selected' : ''}>${escHTML(c.nombre)}</option>`)
      .join('')

    this.container.innerHTML = `
      <style>
        @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
      </style>
      <div style="max-width:1200px;margin:0 auto;color:#f1f5f9;display:flex;flex-direction:column;gap:1.5rem;">

        <div style="background:linear-gradient(135deg, rgba(30,27,75,0.85), rgba(15,23,42,0.95));border:1px solid rgba(99,102,241,0.25);border-radius:20px;padding:1.5rem 1.75rem;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.25rem;">
          <div style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline-light" id="btnVolver" style="border-radius:10px;padding:0.45rem 0.9rem;border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#e2e8f0;font-weight:600;">
              <i class="bi bi-arrow-left"></i> Volver
            </button>
            <div>
              <h3 style="margin:0;font-size:1.4rem;font-weight:800;letter-spacing:-0.02em;color:#f8fafc;">
                <i class="bi bi-journal-richtext" style="color:#818cf8;"></i> Clases Dadas · ${escHTML(this.maestroNombre)}
              </h3>
              <p style="margin:0.25rem 0 0;color:#94a3b8;font-size:0.85rem;">
                ${this.sesiones.length} sesión${this.sesiones.length === 1 ? '' : 'es'} · ${clasesConSesiones.length} clase${clasesConSesiones.length === 1 ? '' : 's'} con registros en este rango
              </p>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
            <select id="selectRango" style="background:#1e293b;border:1px solid rgba(255,255,255,0.12);color:#f1f5f9;border-radius:10px;padding:0.5rem 0.75rem;font-size:0.85rem;">
              ${RANGOS.map((r) => `<option value="${r.dias}" ${this.dias === r.dias ? 'selected' : ''}>${r.label}</option>`).join('')}
            </select>
            <select id="selectClase" style="background:#1e293b;border:1px solid rgba(255,255,255,0.12);color:#f1f5f9;border-radius:10px;padding:0.5rem 0.75rem;font-size:0.85rem;">
              <option value="todas" ${this.claseFiltro === 'todas' ? 'selected' : ''}>Todas las clases</option>
              ${opcionesClase}
            </select>
            <button id="btnReporteCompleto" ${this.sesiones.length === 0 ? 'disabled' : ''} style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:0.5rem 0.85rem;font-weight:600;font-size:0.85rem;color:#f1f5f9;display:inline-flex;align-items:center;gap:0.4rem;">
              <i class="bi bi-file-earmark-code"></i> Ver HTML
            </button>
            <button id="btnDescargarPdf" ${this.sesiones.length === 0 ? 'disabled' : ''} style="background:linear-gradient(135deg, #6366f1, #a855f7);border:none;border-radius:10px;padding:0.5rem 1rem;font-weight:700;font-size:0.85rem;color:#fff;display:inline-flex;align-items:center;gap:0.4rem;box-shadow:0 4px 14px rgba(99,102,241,0.35);">
              <i class="bi bi-file-earmark-pdf"></i> Descargar PDF
            </button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1.25rem;">
          ${
            clasesConSesiones.length === 0
              ? `
            <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:3rem 1.5rem;text-align:center;color:#94a3b8;">
              <i class="bi bi-inbox" style="font-size:2.5rem;opacity:0.5;display:block;margin-bottom:0.75rem;"></i>
              Este maestro no tiene sesiones confirmadas en el rango seleccionado.
            </div>
          `
              : clasesConSesiones.map((c) => this._renderClaseCard(c, porClase.get(c.id) || [])).join('')
          }
        </div>
      </div>
    `

    this.attachEvents()
  }

  _renderClaseCard(clase, sesionesClase) {
    const totalP = sesionesClase.reduce((s, x) => s + x.presentes, 0)
    const totalA = sesionesClase.reduce((s, x) => s + x.ausentes, 0)
    const totalJ = sesionesClase.reduce((s, x) => s + x.justificados, 0)
    const analizando = this.analizando.has(clase.id)
    const resultado = this.analisisIA.get(clase.id)

    return `
      <div class="clase-card" data-clase-id="${clase.id}" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.75rem;">
          <div>
            <h4 style="margin:0;font-size:1.1rem;font-weight:700;color:#f8fafc;">
              <i class="bi bi-mortarboard" style="color:#818cf8;"></i> ${escHTML(clase.nombre)}
            </h4>
            <p style="margin:0.2rem 0 0;color:#64748b;font-size:0.8rem;">
              ${sesionesClase.length} sesión${sesionesClase.length === 1 ? '' : 'es'} ·
              <span style="color:#34d399;">${totalP} P</span> ·
              <span style="color:#f87171;">${totalA} A</span> ·
              <span style="color:#fbbf24;">${totalJ} J</span>
            </p>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button
              class="btn-analizar-ia"
              data-clase-id="${clase.id}"
              ${analizando ? 'disabled' : ''}
              style="background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.35);border-radius:10px;padding:0.5rem 0.9rem;font-weight:700;font-size:0.8rem;color:#a5b4fc;display:inline-flex;align-items:center;gap:0.4rem;"
            >
              ${analizando ? '<span class="spinner-border spinner-border-sm"></span> Analizando…' : '<i class="bi bi-stars"></i> Analizar con IA'}
            </button>
            <button
              class="btn-pdf-clase"
              data-clase-id="${clase.id}"
              title="Descargar reporte de esta clase"
              style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:0.5rem 0.7rem;color:#cbd5e1;"
            >
              <i class="bi bi-file-earmark-pdf"></i>
            </button>
          </div>
        </div>

        ${this._renderVeredicto(resultado)}

        <details style="border-top:1px solid rgba(255,255,255,0.06);padding-top:0.75rem;">
          <summary style="cursor:pointer;color:#818cf8;font-size:0.85rem;font-weight:600;">Ver sesiones y contenido registrado</summary>
          <div style="display:flex;flex-direction:column;gap:0.6rem;margin-top:0.75rem;">
            ${sesionesClase.map((s) => this._renderSesionRow(s)).join('')}
          </div>
        </details>
      </div>
    `
  }

  _renderVeredicto(resultado) {
    if (!resultado) return ''

    if (resultado.error) {
      return `
        <div style="padding:0.75rem 1rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;color:#f87171;font-size:0.82rem;">
          <i class="bi bi-exclamation-triangle"></i> No se pudo completar el análisis: ${escHTML(resultado.error)}
        </div>
      `
    }

    const v = ESTADO_VERDICTO[resultado.estado] || ESTADO_VERDICTO.estancada
    return `
      <div style="padding:0.85rem 1rem;background:${v.bg};border-radius:12px;border:1px solid ${v.color}44;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.4rem;">
          <span style="font-weight:800;font-size:0.75rem;letter-spacing:0.05em;color:${v.color};${v.pulse ? 'animation: pulse-red 2s infinite;' : ''}">
            <i class="bi ${v.icon}"></i> ${v.label}
          </span>
          <span style="font-weight:800;color:${v.color};">${resultado.puntaje}/100</span>
        </div>
        <p style="margin:0;font-size:0.82rem;color:#cbd5e1;line-height:1.4;">${escHTML(resultado.resumen)}</p>
        ${
          resultado.senalesAlerta?.length
            ? `<ul style="margin:0.5rem 0 0;padding-left:1.1rem;font-size:0.78rem;color:#fca5a5;">${resultado.senalesAlerta.map((s) => `<li>${escHTML(s)}</li>`).join('')}</ul>`
            : ''
        }
        ${
          resultado.senalesPositivas?.length
            ? `<ul style="margin:0.35rem 0 0;padding-left:1.1rem;font-size:0.78rem;color:#86efac;">${resultado.senalesPositivas.map((s) => `<li>${escHTML(s)}</li>`).join('')}</ul>`
            : ''
        }
      </div>
    `
  }

  _renderSesionRow(s) {
    return `
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:0.85rem 1rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.4rem;">
          <span style="font-size:0.78rem;font-weight:700;color:#cbd5e1;">
            <i class="bi bi-calendar3"></i> ${escHTML(formatFecha(s.fecha))}
            <span style="color:#64748b;font-weight:500;"> · ${escHTML(formatHora(s.horaInicio))}–${escHTML(formatHora(s.horaFin))}</span>
            ${s.salonNombre ? `<span style="color:#64748b;font-weight:500;"> · ${escHTML(s.salonNombre)}</span>` : ''}
          </span>
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <span style="font-size:0.7rem;font-weight:700;color:#34d399;">${s.presentes}P</span>
            <span style="font-size:0.7rem;font-weight:700;color:#f87171;">${s.ausentes}A</span>
            <span style="font-size:0.7rem;font-weight:700;color:#fbbf24;">${s.justificados}J</span>
            <button
              class="btn-pdf-sesion"
              data-sesion-id="${s.id}"
              title="Ver / descargar reporte de esta sesión"
              style="background:none;border:none;color:#818cf8;padding:0.15rem 0.35rem;"
            >
              <i class="bi bi-file-earmark-pdf"></i>
            </button>
          </div>
        </div>
        <p style="margin:0;font-size:0.8rem;color:${s.contenido ? '#e2e8f0' : '#64748b'};white-space:pre-wrap;line-height:1.4;${s.contenido ? '' : 'font-style:italic;'}">
          ${s.contenido ? escHTML(s.contenido) : 'Sin contenido registrado.'}
        </p>
      </div>
    `
  }

  attachEvents() {
    document.getElementById('btnVolver')?.addEventListener('click', () => {
      router.navigate('admin-maestro-detalle', { maestroId: this.maestroId })
    })

    document.getElementById('selectRango')?.addEventListener('change', async (e) => {
      this.dias = Number(e.target.value)
      await this._recargarHistorial()
    })

    document.getElementById('selectClase')?.addEventListener('change', async (e) => {
      this.claseFiltro = e.target.value
      await this._recargarHistorial()
    })

    document.getElementById('btnReporteCompleto')?.addEventListener('click', () => {
      this._descargarReporte(this.sesiones, this._claseLabelActual())
    })

    document.getElementById('btnDescargarPdf')?.addEventListener('click', () => {
      if (!this.sesiones || this.sesiones.length === 0) return
      const rangoLabel = RANGOS.find((r) => r.dias === this.dias)?.label || `Últimos ${this.dias} días`
      descargarPdfHistoricoMaestro(
        { id: this.maestroId, nombre: this.maestroNombre },
        this.sesiones,
        { rangoLabel, claseLabel: this._claseLabelActual() }
      )
    })

    this.container.querySelectorAll('.btn-pdf-sesion').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const sesionId = btn.dataset.sesionId
        const original = btn.innerHTML
        btn.disabled = true
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i>'
        try {
          await generateDailyReport(sesionId)
        } finally {
          btn.disabled = false
          btn.innerHTML = original
        }
      })
    })

    this.container.querySelectorAll('.btn-pdf-clase').forEach((btn) => {
      btn.addEventListener('click', () => {
        const claseId = btn.dataset.claseId
        const clase = this.clases.find((c) => c.id === claseId)
        const sesionesClase = this.sesiones.filter((s) => s.claseId === claseId)
        const rangoLabel = RANGOS.find((r) => r.dias === this.dias)?.label || `Últimos ${this.dias} días`
        descargarPdfHistoricoMaestro(
          { id: this.maestroId, nombre: this.maestroNombre },
          sesionesClase,
          { rangoLabel, claseLabel: clase?.nombre || 'Clase' }
        )
      })
    })

    this.container.querySelectorAll('.btn-analizar-ia').forEach((btn) => {
      btn.addEventListener('click', () => this._analizarClase(btn.dataset.claseId))
    })
  }

  _claseLabelActual() {
    if (this.claseFiltro === 'todas') return 'Todas las clases'
    return this.clases.find((c) => c.id === this.claseFiltro)?.nombre || 'Clase'
  }

  _descargarReporte(sesiones, claseLabel) {
    if (!sesiones || sesiones.length === 0) return
    const rangoLabel = RANGOS.find((r) => r.dias === this.dias)?.label || `Últimos ${this.dias} días`
    const html = generateRangeReportHTML(sesiones, {
      maestroNombre: this.maestroNombre,
      claseLabel,
      rangoLabel,
    })
    const fechaArchivo = new Date().toISOString().split('T')[0]
    openReport(html, `reporte-clases-${fechaArchivo}`, {
      title: `Reporte de Clases · ${this.maestroNombre} · ${rangoLabel} · ${claseLabel}`,
    })
  }

  async _analizarClase(claseId) {
    if (this.analizando.has(claseId)) return
    this.analizando.add(claseId)
    this.render()

    try {
      const sesionesClase = this.sesiones.filter((s) => s.claseId === claseId)
      const { desde, hasta } = rangoFechas(this.dias)
      const progresos = await cargarProgresosDeClase(claseId, { desde, hasta })
      const clase = this.clases.find((c) => c.id === claseId)
      const totalAlumnos = new Set(sesionesClase.flatMap((s) => s.roster.map((r) => r.alumnoId))).size

      const resultado = await analyzeClassProgress(sesionesClase, progresos, {
        clase: clase?.nombre || 'Clase',
        docente: this.maestroNombre,
        totalAlumnos,
      })
      this.analisisIA.set(claseId, resultado)
    } catch (err) {
      console.error('[MaestroClasesContenidoView] analyzeClassProgress falló:', err)
      this.analisisIA.set(claseId, { error: err.message })
    } finally {
      this.analizando.delete(claseId)
      this.render()
    }
  }
}
