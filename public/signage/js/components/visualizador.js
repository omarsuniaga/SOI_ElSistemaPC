/* ═══════════════════════════════════════════════════════════════════════
   Componente: Visualizador (reproductor/visor del área central)
   Props (update): { layout, items:[{tipo,storage_path,youtube_url,titulo,credito,duracion_seg}] }
   Rota imágenes/vídeos con crossfade y pinta el pie de foto del elemento actual.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SIG = window.SIG;

  SIG.Visualizador = function (root) {
    root.innerHTML =
      '<div class="vis" data-vis>' +
        '<div class="vis__watermark">✳</div>' +
        '<div class="vis__stage" data-stage></div>' +
        '<div class="vis__caption" data-caption hidden>' +
          '<div class="vis__caption-title" data-cap-title></div>' +
          '<div class="vis__caption-detail" data-cap-detail></div>' +
        '</div>' +
      '</div>';

    var r = {
      host: SIG.$('[data-vis]', root),
      wm: SIG.$('.vis__watermark', root),
      stage: SIG.$('[data-stage]', root),
      caption: SIG.$('[data-caption]', root),
      capTitle: SIG.$('[data-cap-title]', root),
      capDetail: SIG.$('[data-cap-detail]', root),
    };

    var items = [];
    var idx = -1;
    var live = null;
    var timer = null;
    var layout = {};

    function pieFijo() {
      var t = (layout.pieTexto || '').trim();
      if (!t) { r.caption.hidden = true; return; }
      r.capTitle.textContent = t;
      r.capDetail.textContent = '';
      r.caption.hidden = false;
    }

    function pintarPie(m) {
      if (layout.pie === false) { r.caption.hidden = true; return; }
      if ((layout.pieTexto || '').trim()) { pieFijo(); return; }
      var has = m && (m.titulo || m.credito);
      r.caption.hidden = !has;
      if (has) {
        r.capTitle.textContent = m.titulo || '';
        r.capDetail.textContent = m.credito || '';
      }
    }

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    function next() {
      // limpia cualquier nodo que no sea el que está en pantalla
      Array.prototype.slice.call(r.stage.children).forEach(function (n) {
        if (n !== live) {
          if (n.tagName === 'VIDEO') { try { n.pause(); } catch (e) {} }
          n.parentNode.removeChild(n);
        }
      });
      idx = (idx + 1) % items.length;
      var m = items[idx];
      var node;
      if (m.tipo === 'video') {
        node = document.createElement('video');
        node.src = m.storage_path ? SIG.STORAGE_PUBLIC + m.storage_path : m.youtube_url;
        node.muted = true; node.autoplay = true; node.playsInline = true; node.preload = 'auto';
        node.onended = advance;
        node.onerror = function () { advance(); };
        timer = setTimeout(advance, (SIG.cfg.videoMaxSeconds || 240) * 1000);
      } else {
        node = document.createElement('img');
        node.src = SIG.STORAGE_PUBLIC + m.storage_path;
        node.onerror = function () { advance(); };
        var secs = (m.duracion_seg && m.duracion_seg > 0) ? m.duracion_seg : (SIG.cfg.slideDefaultSeconds || 12);
        timer = setTimeout(advance, secs * 1000);
      }
      r.stage.appendChild(node);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          node.classList.add('is-live');
          var prev = live;
          live = node;
          if (prev) {
            prev.classList.remove('is-live');
            setTimeout(function () {
              if (prev.parentNode) {
                if (prev.tagName === 'VIDEO') { try { prev.pause(); } catch (e) {} }
                prev.parentNode.removeChild(prev);
              }
            }, 800);
          }
        });
      });
      pintarPie(m);
    }
    function advance() { clearTimer(); next(); }

    function restart() {
      clearTimer();
      idx = -1;
      var on = items.length > 0 && layout.visible !== false;
      r.wm.style.display = on ? 'none' : 'flex';
      if (!on) {
        while (r.stage.firstChild) r.stage.removeChild(r.stage.firstChild);
        live = null;
        pintarPie(null);
        return;
      }
      next();
    }

    return {
      update: function (p) {
        p = p || {};
        layout = (p.layout && p.layout.visualizador) || {};
        r.host.hidden = layout.visible === false;
        r.host.classList.toggle('vis--cover', layout.ajuste === 'cover');
        items = (p.items || []).slice();
        restart();
      },
      start: function () {},
      stop: function () { clearTimer(); },
    };
  };
})();
