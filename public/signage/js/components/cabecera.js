/* ═══════════════════════════════════════════════════════════════════════
   Componente: Cabecera
   Props (update):
     { marca:{institucion,siglas}, layout, eventos:[{titulo,cuando,lugar}] }
   Mantiene su propio reloj y la rotación del "próximo evento".
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SIG = window.SIG;

  SIG.Cabecera = function (root) {
    root.innerHTML =
      '<header class="cab">' +
        '<div class="cab__brand" data-brand>' +
          '<div class="cab__logo">✳</div>' +
          '<div>' +
            '<div class="cab__inst" data-inst>—</div>' +
            '<div class="cab__siglas" data-siglas></div>' +
          '</div>' +
        '</div>' +
        '<div class="cab__event" data-event hidden>' +
          '<div class="cab__event-ico">▤</div>' +
          '<div class="cab__event-body" data-ev-body>' +
            '<div class="cab__event-label">Próximo evento</div>' +
            '<div class="cab__event-title" data-ev-title>—</div>' +
          '</div>' +
        '</div>' +
        '<div class="cab__clock" data-clock>' +
          '<div class="cab__date" data-date>—</div>' +
          '<div class="cab__time" data-time>--:--</div>' +
        '</div>' +
      '</header>';

    var r = {
      host: SIG.$('.cab', root),
      brand: SIG.$('[data-brand]', root),
      inst: SIG.$('[data-inst]', root),
      siglas: SIG.$('[data-siglas]', root),
      event: SIG.$('[data-event]', root),
      evBody: SIG.$('[data-ev-body]', root),
      evTitle: SIG.$('[data-ev-title]', root),
      clock: SIG.$('[data-clock]', root),
      date: SIG.$('[data-date]', root),
      time: SIG.$('[data-time]', root),
    };

    var eventos = [];
    var evIdx = 0;
    var tClock = null;
    var tRota = null;

    function tick() {
      r.time.textContent = SIG.time.hm();
      r.date.textContent = SIG.time.dateLong();
    }

    function pintarEvento() {
      if (!eventos.length) {
        r.evTitle.textContent = 'Sin eventos programados';
        return;
      }
      var e = eventos[evIdx % eventos.length];
      var txt = e.titulo + (e.cuando ? ' · ' + e.cuando : '') + (e.lugar ? ' · ' + e.lugar : '');
      r.evBody.style.opacity = '0';
      setTimeout(function () {
        r.evTitle.textContent = txt;
        r.evBody.style.opacity = '1';
      }, 380);
    }
    function rota() {
      if (eventos.length < 2) return;
      evIdx = (evIdx + 1) % eventos.length;
      pintarEvento();
    }

    return {
      update: function (p) {
        p = p || {};
        var L = (p.layout && p.layout.cabecera) || {};
        r.host.hidden = L.visible === false;
        r.brand.hidden = L.marca === false;
        r.clock.hidden = !(L.reloj !== false || L.fecha !== false);
        r.time.hidden = L.reloj === false;
        r.date.hidden = L.fecha === false;

        var m = p.marca || {};
        r.inst.textContent = m.institucion || '';
        r.siglas.textContent = m.siglas || '';

        if (L.evento === false) {
          r.event.hidden = true;
        } else {
          eventos = p.eventos || [];
          r.event.hidden = eventos.length === 0;
          evIdx = 0;
          pintarEvento();
        }
      },
      start: function () {
        tick();
        tClock = setInterval(tick, 15000);
        tRota = setInterval(rota, (SIG.cfg.eventoRotaSeconds || 10) * 1000);
      },
      stop: function () { clearInterval(tClock); clearInterval(tRota); },
    };
  };
})();
