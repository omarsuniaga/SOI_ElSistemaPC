import{i as e}from"./supabase-Dhe7Tlxd.js";import{d as t,f as n,m as r,p as i}from"./scoreDirectorView-CytNpgkZ.js";async function a(e){e&&(e.innerHTML=`
    <div class="page-container d-flex align-items-center justify-content-center" style="min-height:300px;">
      <div class="spinner-border text-primary"></div>
    </div>`,await o(e))}async function o(t){try{let{data:n,error:r}=await e.from(`generated_documents`).select(`*`).order(`created_at`,{ascending:!1}).limit(100);if(r)throw r;s(t,n||[])}catch(e){t.innerHTML=`<div class="page-container"><div class="alert alert-warning">Error: ${e.message}</div></div>`}}function s(e,a){let s={borrador:`bg-secondary-subtle text-secondary-emphasis`,generado:`bg-success-subtle text-success-emphasis`,archivado:`bg-warning-subtle text-warning-emphasis`,anulado:`bg-danger-subtle text-danger-emphasis`};e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
             style="width:42px;height:42px;">
          <i class="bi bi-clock-history fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Historial documental</h1>
          <p class="text-muted small mb-0">${a.length} documento(s) registrados</p>
        </div>
        <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-doc-hist-back">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </button>
      </div>

      ${a.length===0?`
        <div class="text-center py-5 text-muted">
          <i class="bi bi-clock-history fs-1 d-block mb-2 opacity-40"></i>
          <p>No hay documentos generados aún.</p>
        </div>`:a.map(e=>`
          <div class="card border-0 shadow-sm mb-2">
            <div class="card-body py-2 px-3">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="flex-grow-1 overflow-hidden">
                  <div class="fw-semibold small text-truncate">${e.titulo}</div>
                  <div class="text-muted" style="font-size:0.72rem;">
                    ${e.alumno_nombre?`<span class="me-2"><i class="bi bi-person me-1"></i>${e.alumno_nombre}</span>`:``}
                    ${e.actividad_nombre?`<span class="me-2"><i class="bi bi-calendar3 me-1"></i>${e.actividad_nombre}</span>`:``}
                    <span>${new Date(e.created_at).toLocaleDateString(`es-DO`)}</span>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                  <span class="badge ${s[e.estado]||`bg-secondary-subtle text-secondary-emphasis`}">${e.estado}</span>
                  <button class="btn btn-sm btn-outline-primary btn-doc-redownload" data-id="${e.id}" title="Descargar">
                    <i class="bi bi-download"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-secondary btn-doc-archive" data-id="${e.id}" title="Archivar">
                    <i class="bi bi-archive"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>`).join(``)}
    </div>`,e.querySelector(`#btn-doc-hist-back`)?.addEventListener(`click`,()=>window.router?.navigate(`exportar-datos`)),e.querySelectorAll(`.btn-doc-redownload`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let o=a.find(t=>t.id===e.dataset.id);o&&i(r({title:o.titulo,content:o.contenido_final,metadata:{alumnoNombre:o.alumno_nombre,tipo:o.tipo}}),n({tipo:o.tipo,alumnoNombre:o.alumno_nombre,fecha:o.created_at?.slice(0,10)}))})}),e.querySelectorAll(`.btn-doc-archive`).forEach(n=>{n.addEventListener(`click`,async r=>{r.stopPropagation(),confirm(`¿Archivar este documento?`)&&(await t(n.dataset.id),await o(e))})})}export{a as renderGeneratedDocumentsView};