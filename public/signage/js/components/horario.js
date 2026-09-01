/* ═══════════════════════════════════════════════════════════════════════
   Componente: Horario (sidebar)
   Props (update): { layout, hoy:[fila], manana:[fila] }
     fila = { hora_inicio, hora_fin, clase_nombre, instrumento, salon_nombre,
              maestro_nombre, origen }
   Agrupa las clases que empiezan a la misma hora bajo una sola etiqueta.
   HOY + MAÑANA en una columna; comprime (--fit) hasta que entra.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SIG = window.SIG;
  var T = SIG.time;

  SIG.Horario = function (root) {
    root.innerHTML =
      '<aside class="hor" data-hor>' +
        '<div class="hor__scroll" data-scroll><div data-list></div></div>' +
      '</aside>';

    var r = {
      host: SIG.$('[data-hor]', root),
      scroll: SIG.$('[data-scroll]', root),
      list: SIG.$('[data-list]', root),
    };

    var data = { hoy: [], manana: [] };
    var layout = {};
    var scrollTimer = null;

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

    function grupoHTML(g, manana) {
      var now = T.nowMins();
      var ini = T.mins(g.inicio), fin = T.mins(g.fin);
      var cls = 'hgroup';
      var mark = '';
      if (manana) {
        cls += ' hgroup--manana';
      } else if (now >= ini && now < fin) {
        cls += ' hgroup--now'; mark = '<span class="hgroup__dot"></span>';
      } else if (now >= fin) {
        cls += ' hgroup--past';
      } else if (ini - now <= 20 && ini - now > 0) {
        cls += ' hgroup--soon'; mark = '<span class="hgroup__ring"></span>';
      }
      return (
        '<div class="' + cls + '">' +
          '<div class="hgroup__time">' + T.hhmm(g.inicio) + '</div>' +
          '<div class="hgroup__items">' + g.clases.map(itemHTML).join('') + '</div>' +
          '<div class="hgroup__mark">' + mark + '</div>' +
        '</div>'
      );
    }

    function secHead(nombre, count, manana) {
      return (
        '<div class="hor__sec-head' + (manana ? ' hor__sec--manana' : '') + '">' +
          '<span class="hor__sec-name">' + nombre + '</span>' +
          '<span class="hor__sec-count">' + count + '</span>' +
        '</div>'
      );
    }

    function fit() {
      if (scrollTimer) { clearInterval(scrollTimer); scrollTimer = null; }
      r.host.style.setProperty('--fit', '1');
      requestAnimationFrame(function () {
        var f = 1, guard = 0;
        while (r.list.scrollHeight > r.scroll.clientHeight + 2 && f > 0.58 && guard < 24) {
          f -= 0.04; guard++;
          r.host.style.setProperty('--fit', f.toFixed(2));
        }
        if (r.list.scrollHeight > r.scroll.clientHeight + 2) {
          r.scroll.scrollTop = 0;
          var dir = 1;
          scrollTimer = setInterval(function () {
            var max = r.list.scrollHeight - r.scroll.clientHeight;
            if (max <= 2) return;
            r.scroll.scrollTop += dir * 0.4;
            if (r.scroll.scrollTop >= max) dir = -1;
            else if (r.scroll.scrollTop <= 0) dir = 1;
          }, 45);
        }
      });
    }

    function render() {
      var byTime = function (a, b) { return T.mins(a.hora_inicio) - T.mins(b.hora_inicio); };
      var hoy = (layout.hoy === false) ? [] : data.hoy.slice().sort(byTime);
      var man = (layout.manana === false) ? [] : data.manana.slice().sort(byTime);

      var html = '';
      if (layout.hoy !== false) {
        html += secHead('Hoy', hoy.length, false);
        html += hoy.length
          ? agrupar(hoy).map(function (g) { return grupoHTML(g, false); }).join('')
          : '<div class="hor__empty">Hoy no hay clases.</div>';
      }
      if (layout.manana !== false && man.length) {
        html += secHead('Mañana', man.length, true);
        html += agrupar(man).map(function (g) { return grupoHTML(g, true); }).join('');
      }
      r.list.innerHTML = html;
      fit();
    }

    return {
      update: function (p) {
        p = p || {};
        layout = (p.layout && p.layout.horario) || {};
        r.host.hidden = layout.visible === false;
        data.hoy = p.hoy || [];
        data.manana = p.manana || [];
        render();
      },
      start: function () { this._t = setInterval(render, 60000); },
      stop: function () { clearInterval(this._t); if (scrollTimer) clearInterval(scrollTimer); },
      relayout: fit,
    };
  };
})();
