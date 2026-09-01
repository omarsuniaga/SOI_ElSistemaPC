/* ═══════════════════════════════════════════════════════════════════════
   app.js — orquestador. Carga datos de Supabase, arma el modelo de vista y
   se lo pasa a cada componente. Polling (sin realtime). Caché anti-corte.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SIG = window.SIG;
  var CFG = SIG.cfg;
  var $ = SIG.$;

  /* ---- modo ----
     Sin parámetros  -> PLAYER: polling a Supabase (Raspberry / Netlify).
     ?preview=1       -> PREVIEW: el layout, la marca y los medios llegan por
                        postMessage desde el Estudio del portal; el horario y el
                        calendario se siguen trayendo reales (solo lectura).
  */
  var PREVIEW = /[?&]preview=1\b/.test(location.search);
  // 'device' = la copia de la Raspberry (device.js la marca); 'web' = una carga
  // suelta en Netlify (no hace consultas: la cartelera se administra desde el portal).
  var MODE = PREVIEW ? 'preview' : (CFG.mode === 'device' ? 'device' : 'web');
  SIG.preview = PREVIEW;
  SIG.mode = MODE;

  function postToParent(msg) {
    try { if (window.parent && window.parent !== window) window.parent.postMessage(msg, '*'); } catch (e) {}
  }

  var cab = SIG.Cabecera($('#mount-cabecera'));
  var vis = SIG.Visualizador($('#mount-visualizador'));
  var hor = SIG.Horario($('#mount-horario'));

  var state = {
    layout: SIG.mergeLayout(null),
    marca: CFG.marca,
    screen: null,
    eventos: [],
    hoy: [],
    manana: [],
    media: [],
    online: true,
  };

  function setOnline(ok) {
    if (ok === state.online) return;
    state.online = ok;
    $('#flag-offline').hidden = ok;
  }

  function applyGrid() {
    var L = state.layout;
    var grid = $('.app__grid');
    var side = L.horario.visible !== false;
    var head = L.cabecera.visible !== false;
    var w = L.horario.anchoPct || 27.5;
    grid.style.gridTemplateColumns = side ? ('1fr minmax(0, ' + w + '%)') : '1fr';
    grid.style.gridTemplateRows = head ? 'calc(var(--u) * 8.4) 1fr' : '1fr';
    grid.style.gridTemplateAreas = head
      ? (side ? '"cabecera cabecera" "visualizador horario"' : '"cabecera" "visualizador"')
      : (side ? '"visualizador horario"' : '"visualizador"');
  }

  /* ---- modelo → componentes ---- */
  function push() {
    applyGrid();
    cab.update({ marca: state.marca, layout: state.layout, eventos: state.eventos });
    vis.update({ layout: state.layout, items: state.media });
    hor.update({ layout: state.layout, hoy: state.hoy, manana: state.manana });
  }

  /* ---- cargas ---- */
  function loadPantalla() {
    return SIG.api('signage_pantallas?slug=eq.' + encodeURIComponent(CFG.screenSlug) +
      '&select=id,nombre,institucion,siglas,layout,modo_nocturno&limit=1')
      .then(function (rows) {
        if (rows && rows[0]) {
          state.screen = rows[0];
          state.layout = SIG.mergeLayout(rows[0].layout);
          state.marca = {
            institucion: rows[0].institucion || CFG.marca.institucion,
            siglas: rows[0].siglas || CFG.marca.siglas,
          };
          SIG.cache.put('screen', rows[0]);
        }
      })
      .catch(function (e) {
        var c = state.screen || SIG.cache.get('screen');
        if (c) { state.screen = c; state.layout = SIG.mergeLayout(c.layout); }
        console.warn('[pantalla]', e.message);
      });
  }

  function loadHorario() {
    var cols = 'select=hora_inicio,hora_fin,clase_nombre,instrumento,salon_nombre,maestro_nombre,origen';
    return Promise.all([
      SIG.api('signage_v_horario_hoy?' + cols),
      SIG.api('signage_v_horario_manana?' + cols),
    ]).then(function (res) {
      state.hoy = res[0] || [];
      state.manana = res[1] || [];
      SIG.cache.put('hoy', state.hoy);
      SIG.cache.put('manana', state.manana);
      setOnline(true);
    }).catch(function (e) {
      if (!state.hoy.length) state.hoy = SIG.cache.get('hoy') || [];
      if (!state.manana.length) state.manana = SIG.cache.get('manana') || [];
      setOnline(false);
      console.warn('[horario]', e.message);
    });
  }

  function loadCalendario() {
    return SIG.api('signage_v_calendario_mes?select=titulo,ubicacion,fecha_inicio,fecha_fin')
      .then(function (rows) {
        var now = Date.now();
        state.eventos = (rows || [])
          .filter(function (e) { return new Date(e.fecha_fin || e.fecha_inicio).getTime() >= now - 6 * 3600e3; })
          .sort(function (a, b) { return new Date(a.fecha_inicio) - new Date(b.fecha_inicio); })
          .map(function (e) {
            return { titulo: e.titulo, cuando: SIG.time.dayMonth(e.fecha_inicio), lugar: e.ubicacion || '' };
          });
        SIG.cache.put('eventos', state.eventos);
        setOnline(true);
      })
      .catch(function (e) {
        if (!state.eventos.length) state.eventos = SIG.cache.get('eventos') || [];
        setOnline(false);
        console.warn('[calendario]', e.message);
      });
  }

  function loadMedia() {
    return SIG.api('signage_media?activo=eq.true&order=orden.asc&select=id,pantalla_id,tipo,titulo,credito,storage_path,youtube_url,youtube_video_id,duracion_seg,vigente_desde,vigente_hasta')
      .then(function (rows) {
        var today = SIG.time.isoDate();
        var sid = state.screen && state.screen.id;
        state.media = (rows || []).filter(function (m) {
          if (m.pantalla_id && sid && m.pantalla_id !== sid) return false;
          if (m.vigente_desde && m.vigente_desde > today) return false;
          if (m.vigente_hasta && m.vigente_hasta < today) return false;
          if (m.tipo === 'youtube' && !CFG.enableYouTube) return false;
          return true;
        });
        SIG.cache.put('media', state.media);
        setOnline(true);
      })
      .catch(function (e) {
        if (!state.media.length) state.media = SIG.cache.get('media') || [];
        setOnline(false);
        console.warn('[media]', e.message);
      });
  }

  /* ---- reposo (modo nocturno) ---- */
  function applyReposo() {
    var box = $('#reposo');
    if (PREVIEW) { box.hidden = true; return; }   // el Estudio siempre muestra contenido
    var mn = state.screen && state.screen.modo_nocturno;
    if (!mn || !mn.activo) { box.hidden = true; return; }
    var h = SIG.time.localHour();
    var from = parseInt(String(mn.desde || '21:00'), 10);
    var to = parseInt(String(mn.hasta || '06:00'), 10);
    var night = from > to ? (h >= from || h < to) : (h >= from && h < to);
    box.hidden = !night;
    if (night) {
      $('#reposo-time').textContent = SIG.time.hm();
      $('#reposo-date').textContent = SIG.time.dateLong();
    }
  }

  function hideBoot() {
    var b = $('#boot');
    b.classList.add('is-hidden');
    setTimeout(function () { b.hidden = true; }, 550);
  }

  /* ---- arranque: PLAYER (Raspberry / Netlify) ---- */
  function bootPlayer() {
    loadPantalla()
      .then(function () { return Promise.all([loadHorario(), loadCalendario(), loadMedia()]); })
      .then(function () {
        push();
        applyReposo();
        setInterval(function () { loadPantalla().then(push); }, CFG.poll.pantalla);
        setInterval(function () { loadHorario().then(push); }, CFG.poll.horario);
        setInterval(function () { loadCalendario().then(push); }, CFG.poll.calendario);
        setInterval(function () { loadMedia().then(push); }, CFG.poll.media);
        setInterval(function () {
          if (SIG.time.localHour() === CFG.dailyReloadHour) location.reload();
        }, 60000);
        hideBoot();
      });
  }

  /* ---- arranque: PREVIEW (Estudio del portal) ---- */
  function applyModel(model) {
    if (!model || typeof model !== 'object') return;
    if (model.layout) state.layout = SIG.mergeLayout(model.layout);
    if (model.marca) state.marca = {
      institucion: model.marca.institucion || CFG.marca.institucion,
      siglas: model.marca.siglas || CFG.marca.siglas,
    };
    if (Array.isArray(model.media)) {
      var today = SIG.time.isoDate();
      state.media = model.media.filter(function (m) {
        if (m.activo === false) return false;
        if (m.vigente_desde && m.vigente_desde > today) return false;
        if (m.vigente_hasta && m.vigente_hasta < today) return false;
        if (m.tipo === 'youtube' && !CFG.enableYouTube) return false;
        return true;
      }).sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
    }
    // datos que el Estudio puede querer simular; si no vienen, se usan los reales
    if (Array.isArray(model.hoy)) state.hoy = model.hoy;
    if (Array.isArray(model.manana)) state.manana = model.manana;
    if (Array.isArray(model.eventos)) {
      state.eventos = model.eventos.map(function (e) {
        return { titulo: e.titulo, cuando: e.cuando || (e.fecha_inicio ? SIG.time.dayMonth(e.fecha_inicio) : ''), lugar: e.lugar || e.ubicacion || '' };
      });
    }
    push();
  }

  function bootPreview() {
    window.addEventListener('message', function (ev) {
      var d = ev.data;
      if (!d || typeof d !== 'object' || String(d.type || '').indexOf('signage:') !== 0) return;
      if (d.type === 'signage:model') applyModel(d.model);
      else if (d.type === 'signage:ping') postToParent({ type: 'signage:ready' });
    });

    // clic en una zona -> avisa al Estudio para que abra ese panel
    [['#mount-cabecera', 'cabecera'], ['#mount-visualizador', 'visualizador'], ['#mount-horario', 'horario']]
      .forEach(function (pair) {
        var node = $(pair[0]);
        if (node) node.addEventListener('click', function () { postToParent({ type: 'signage:zone-click', zone: pair[1] }); });
      });

    // el horario/calendario reales dan realismo; layout/media vendrán por mensaje
    Promise.all([loadHorario(), loadCalendario()]).then(function () {
      push();
      hideBoot();
      postToParent({ type: 'signage:ready' });
      setInterval(function () { loadHorario().then(push); }, CFG.poll.horario);
      setInterval(function () { loadCalendario().then(push); }, CFG.poll.calendario);
    });
  }

  /* ---- carga suelta en web: sin consultas, solo un aviso ---- */
  function bootWeb() {
    $('#boot').hidden = true;
    $('#no-autorizado').hidden = false;
  }

  /* ---- común ---- */
  function boot() {
    document.documentElement.classList.toggle('is-preview', PREVIEW);
    if (MODE === 'web') { bootWeb(); return; }
    applyGrid();
    cab.start(); vis.start(); hor.start();
    setInterval(applyReposo, 20000);
    window.addEventListener('resize', function () { applyGrid(); hor.relayout(); });
    if (PREVIEW) bootPreview(); else bootPlayer();
  }

  window.addEventListener('error', function (e) { console.error('[win]', e.message); });
  boot();
})();
