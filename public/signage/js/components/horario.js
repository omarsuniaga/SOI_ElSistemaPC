/* ═══════════════════════════════════════════════════════════════════════
   Componente: Horario (sidebar)
   Props (update): { layout, hoy:[fila], manana:[fila] }
     fila = { hora_inicio, hora_fin, clase_nombre, instrumento, salon_nombre,
              maestro_nombre, origen }
   Agrupa las clases que empiezan a la misma hora bajo una sola etiqueta.

   HOY y MAÑANA son dos paneles independientes que se reparten la columna:
   - solo uno activo  → ocupa todo el alto
   - ambos activos    → el alto se divide segun cuanto contenido tiene cada uno
                        (flex proporcional al nº de grupos); cada panel hace
                        scroll de su sobrante por separado.
   Antes de scrollear, --fit comprime todo hasta donde puede.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SIG = window.SIG;
  var T = SIG.time;

  SIG.Horario = function (root) {
    root.innerHTML =
      '<aside class="hor" data-hor>' +
        '<div class="hor__col" data-col>' +
          '<section class="hor__pane" data-pane-hoy hidden>' +
            '<div class="hor__sec-head" data-head-hoy></div>' +
            '<div class="hor__pane-scroll" data-scroll-hoy><div data-list-hoy></div></div>' +
          '</section>' +
          '<section class="hor__pane hor__pane--manana" data-pane-man hidden>' +
            '<div class="hor__sec-head hor__sec--manana" data-head-man></div>' +
            '<div class="hor__pane-scroll" data-scroll-man><div data-list-man></div></div>' +
          '</section>' +
        '</div>' +
      '</aside>';

    var r = {
      host: SIG.$('[data-hor]', root),
      col: SIG.$('[data-col]', root),
      hoy: {
        pane: SIG.$('[data-pane-hoy]', root),
        head: SIG.$('[data-head-hoy]', root),
        scroll: SIG.$('[data-scroll-hoy]', root),
        list: SIG.$('[data-list-hoy]', root),
      },
      man: {
        pane: SIG.$('[data-pane-man]', root),
        head: SIG.$('[data-head-man]', root),
        scroll: SIG.$('[data-scroll-man]', root),
        list: SIG.$('[data-list-man]', root),
      },
    };

    var data = { hoy: [], manana: [] };
    var layout = {};
    var scrollTimers = [];
    var sig = null;          // firma de (layout + datos) para no reconstruir en balde

    /* agrupa por hora_inicio, preservando orden cronológico */
    function agrupar(filas) {
      var map = {};
      var orden = [];
      filas.forEach(function (f) {
        var k = T.hhmm(f.hora_inicio) || '—';
        if (!map[k]) { map[k] = { inicio: f.hora_inicio, fin: f.hora_fin, clases: [] }; orden.push(k); }
        map[k].clases.push(f);
        if (T.mins(f.hora_fin) > T.mins(map[k].fin)) map[k].fin = f.hora_fin;
      });
      return orden.sort(function (a, b) { return T.mins(map[a].inicio) - T.mins(map[b].inicio); })
        .map(function (k) { return map[k]; });
    }

    function itemHTML(f) {
      var chip = (layout.instrumento && f.instrumento)
        ? '<span class="hrow__chip">' + SIG.esc(f.instrumento) + '</span>' : '';
      var emg = f.origen === 'emergente' ? '<span class="hrow__chip hrow__chip--emg">emergente</span>' : '';
      var meta = '';
      if (layout.meta) {
        var mp = [];
        if (f.salon_nombre) mp.push(SIG.esc(f.salon_nombre));
        if (f.maestro_nombre) mp.push(SIG.esc(f.maestro_nombre));
        if (mp.length) meta = '<span class="hitem__meta">' + mp.join(' · ') + '</span>';
      }
      return '<div class="hitem">' + SIG.esc(f.clase_nombre || 'Clase') + chip + emg + meta + '</div>';
    }

    function estadoDe(ini, fin) {
      var now = T.nowMins();
      if (now >= ini && now < fin) return 'now';
      if (now >= fin) return 'past';
      if (ini - now <= 20 && ini - now > 0) return 'soon';
      return '';
    }
    function markDe(estado) {
      if (estado === 'now') return '<span class="hgroup__dot"></span>';
      if (estado === 'soon') return '<span class="hgroup__ring"></span>';
      return '';
    }

    function grupoHTML(g, manana) {
      var ini = T.mins(g.inicio), fin = T.mins(g.fin);
      var estado = manana ? 'manana' : estadoDe(ini, fin);
      return (
        '<div class="hgroup' + (estado ? ' hgroup--' + estado : '') + '" data-ini="' + ini + '" data-fin="' + fin + '">' +
          '<div class="hgroup__time">' + T.hhmm(g.inicio) + '</div>' +
          '<div class="hgroup__items">' + g.clases.map(itemHTML).join('') + '</div>' +
          '<div class="hgroup__mark">' + markDe(manana ? '' : estado) + '</div>' +
        '</div>'
      );
    }

    /* re-evalúa "en curso / pasada / próxima" sin reconstruir el DOM ni resetear el scroll */
    function refreshEstado() {
      var grupos = r.hoy.list.querySelectorAll('.hgroup');
      Array.prototype.forEach.call(grupos, function (el) {
        var e = estadoDe(+el.getAttribute('data-ini'), +el.getAttribute('data-fin'));
        el.className = 'hgroup' + (e ? ' hgroup--' + e : '');
        var mk = el.querySelector('.hgroup__mark');
        if (mk) mk.innerHTML = markDe(e);
      });
    }

    function headHTML(nombre, count) {
      return '<span class="hor__sec-name">' + nombre + '</span>' +
             '<span class="hor__sec-count">' + count + '</span>';
    }

    function clearScrollTimers() {
      scrollTimers.forEach(function (t) { clearInterval(t); });
      scrollTimers = [];
    }

    /* marquee vertical de ida y vuelta para el sobrante de un panel */
    function marquee(scrollEl, listEl) {
      scrollEl.scrollTop = 0;
      var dir = 1;
      return setInterval(function () {
        var max = listEl.scrollHeight - scrollEl.clientHeight;
        if (max <= 2) return;
        scrollEl.scrollTop += dir * 0.4;
        if (scrollEl.scrollTop >= max) dir = -1;
        else if (scrollEl.scrollTop <= 0) dir = 1;
      }, 45);
    }

    function overflowsAlguno() {
      var o = false;
      if (!r.hoy.pane.hidden && r.hoy.list.scrollHeight > r.hoy.scroll.clientHeight + 2) o = true;
      if (!r.man.pane.hidden && r.man.list.scrollHeight > r.man.scroll.clientHeight + 2) o = true;
      return o;
    }

    function fitCore() {
      clearScrollTimers();
      r.host.style.setProperty('--fit', '1');
      void r.col.offsetHeight;                       // fuerza reflow
      var f = 1, guard = 0;
      while (overflowsAlguno() && f > 0.58 && guard < 24) {
        f -= 0.04; guard++;
        r.host.style.setProperty('--fit', f.toFixed(2));
        void r.col.offsetHeight;
      }
      // lo que aun no entra, se scrollea (por panel, independiente)
      if (!r.hoy.pane.hidden && r.hoy.list.scrollHeight > r.hoy.scroll.clientHeight + 2) {
        scrollTimers.push(marquee(r.hoy.scroll, r.hoy.list));
      }
      if (!r.man.pane.hidden && r.man.list.scrollHeight > r.man.scroll.clientHeight + 2) {
        scrollTimers.push(marquee(r.man.scroll, r.man.list));
      }
    }

    function fit() {
      clearScrollTimers();
      // el reparto flex de los dos paneles puede tardar uno o dos ticks en asentarse
      requestAnimationFrame(function () { requestAnimationFrame(fitCore); });
      setTimeout(fitCore, 160);
    }

    function render() {
      var byTime = function (a, b) { return T.mins(a.hora_inicio) - T.mins(b.hora_inicio); };
      var showHoy = layout.hoy !== false;
      var hoyGr = showHoy ? agrupar(data.hoy.slice().sort(byTime)) : [];

      var manRaw = (layout.manana === false) ? [] : data.manana.slice().sort(byTime);
      var manGr = agrupar(manRaw);
      var showMan = layout.manana !== false && manGr.length > 0;

      // ── panel HOY ──
      r.hoy.pane.hidden = !showHoy;
      if (showHoy) {
        r.hoy.head.innerHTML = headHTML('Hoy', hoyGr.length);
        r.hoy.list.innerHTML = hoyGr.length
          ? hoyGr.map(function (g) { return grupoHTML(g, false); }).join('')
          : '<div class="hor__empty">Hoy no hay clases.</div>';
      }

      // ── panel MAÑANA ──
      r.man.pane.hidden = !showMan;
      if (showMan) {
        r.man.head.innerHTML = headHTML('Mañana', manGr.length);
        r.man.list.innerHTML = manGr.map(function (g) { return grupoHTML(g, true); }).join('');
      }

      // reparto del alto: proporcional al "peso" del contenido de cada panel
      // (nº de lineas ~= 1 por hora + 1 por clase). flex-basis:0 + flex-grow
      // reparte el alto completo sin colapsar. Con un solo panel visible es el
      // unico hijo flex → 100%.
      var peso = function (grupos) {
        return grupos.reduce(function (s, g) { return s + 1 + Math.max(1, g.clases.length); }, 0);
      };
      r.hoy.pane.style.flexGrow = String(showHoy ? Math.max(3, peso(hoyGr)) : 1);
      r.man.pane.style.flexGrow = String(showMan ? Math.max(3, peso(manGr)) : 1);

      fit();
    }

    function firma() {
      var d = function (list) {
        return list.map(function (f) {
          return [f.hora_inicio, f.hora_fin, f.clase_nombre, f.origen].join('~');
        }).join('|');
      };
      return JSON.stringify([layout.hoy, layout.manana, layout.instrumento, layout.meta]) +
        '::' + d(data.hoy) + '::' + d(data.manana);
    }

    return {
      update: function (p) {
        p = p || {};
        layout = (p.layout && p.layout.horario) || {};
        r.host.hidden = layout.visible === false;
        data.hoy = p.hoy || [];
        data.manana = p.manana || [];
        var nueva = firma();
        if (nueva !== sig) { sig = nueva; render(); }   // solo reconstruye si algo cambió
        else refreshEstado();                            // si no, solo re-evalúa el estado
      },
      start: function () { this._t = setInterval(refreshEstado, 30000); },
      stop: function () { clearInterval(this._t); clearScrollTimers(); },
      relayout: fit,
    };
  };
})();
