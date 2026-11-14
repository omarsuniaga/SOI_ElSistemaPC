import { APP_VERSION, CHANGELOG, getVersionTypeMeta } from './CHANGELOG.js'
import { escHTML as esc } from '../../portal-maestros/utils/portalUtils.js'
import './versionHistory.css'
export function renderVersionHistoryView(container) {
  const totalChanges=CHANGELOG.reduce((n,r)=>n+r.changes.length,0)
  container.innerHTML=`<section class="soi-releases p-3 p-md-4" aria-label="Historial de versiones del SOI">
    <header><h2>Versiones y novedades del SOI</h2><p>Consulta qué cambió y cuándo se publicó cada entrega.</p></header>
    <div class="soi-release-stats"><div><strong>${esc(APP_VERSION)}</strong><span>Versión actual</span></div><div><strong>${CHANGELOG.length}</strong><span>Versiones documentadas</span></div><div><strong>${totalChanges}</strong><span>Cambios documentados</span></div></div>
    <p class="soi-release-caption">El conteo corresponde a las entregas y los cambios descritos en este historial. Las entregas antiguas reconstruidas se identifican como numeración retrospectiva.</p>
    <div class="soi-release-filters"><label>Buscar una mejora<input type="search" class="form-control" data-release-search placeholder="Ej.: asistencias, cumpleaños, modo oscuro"></label>
    <label>Tipo de cambio<select class="form-select" data-release-type><option value="">Todos</option>${['feature','fix','security','refactor','perf'].map(type=>`<option value="${type}">${getVersionTypeMeta(type).label}</option>`).join('')}</select></label></div>
    <p role="status" data-release-count></p><div data-release-list></div></section>`
  const update=()=>{
    const search=container.querySelector('[data-release-search]').value.trim().toLocaleLowerCase('es')
    const type=container.querySelector('[data-release-type]').value
    const entries=CHANGELOG.filter(r=>(!type||r.type===type)&&(!search||[r.version,r.title,...r.changes].join(' ').toLocaleLowerCase('es').includes(search)))
    container.querySelector('[data-release-count]').textContent=`Mostrando ${entries.length} de ${CHANGELOG.length} versiones documentadas.`
    container.querySelector('[data-release-list]').innerHTML=entries.map(r=>`<article class="soi-release-card ${r.version===APP_VERSION?'soi-release-current':''}"><div class="soi-release-heading"><h3>v${esc(r.version)} · ${esc(r.title)}</h3><time datetime="${esc(r.date)}">Publicación: ${new Date(r.date+'T12:00:00').toLocaleDateString('es-DO',{day:'numeric',month:'long',year:'numeric'})}</time></div><p class="soi-release-caption">${esc(getVersionTypeMeta(r.type).label)}${r.version===APP_VERSION?' · Versión actual':''}${r.retrospective?' · Numeración retrospectiva':''}</p><ul>${r.changes.map(change=>`<li>${esc(change)}</li>`).join('')}</ul>${r.pullRequests?.length?`<p class="soi-release-caption">Entregas verificables: ${r.pullRequests.map(pr=>`<a href="https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/${Number(pr)}" target="_blank" rel="noopener noreferrer">#${Number(pr)}</a>`).join(' · ')}</p>`:''}</article>`).join('')||'<p>No hay versiones para estos filtros.</p>'
  }
  container.querySelector('[data-release-search]').addEventListener('input',update)
  container.querySelector('[data-release-type]').addEventListener('change',update)
  update()
}
