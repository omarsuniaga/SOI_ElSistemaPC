/* ═══════════════════════════════════════════════════════════════════════
   Componente: Visualizador (reproductor/visor del área central)
   Props (update): { layout, items:[{id,tipo,storage_path,youtube_url,titulo,credito,duracion_seg}] }
   Rota imágenes/vídeos con crossfade y pinta el pie de foto del elemento actual.

   IMPORTANTE: update() NO reinicia la rotación si la lista de medios no cambió
   (los refrescos de datos cada 2-3 min no deben "volver al primero").
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
    var sig = null;         // firma de la lista actual (para detectar cambios)
    var idx = -1;
    var live = null;
    var timer = null;
    var running = false;
    var layout = {};

    function firma(list) {
      return list.map(function (m) {
        return [m.id || m.storage_path || m.youtube_url, m.tipo, m.duracion_seg || 0].join('~');
      }).join('|');
    }

    function pintarPie(m) {
      if (layout.pie === false) { r.caption.hidden = true; return; }
      var fijo = (layout.pieTexto || '').trim();
      if (fijo) {
        r.capTitle.textContent = fijo;
        r.capDetail.textContent = '';
        r.caption.hidden = false;
        return;
      }
      var has = m && (m.titulo || m.credito);
      r.caption.hidden = !has;
      if (has) {
        r.capTitle.textContent = m.titulo || '';
        r.capDetail.textContent = m.credito || '';
      }
    }

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    function next() {
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
      } else if (m.tipo === 'slide') {
        var tmp = document.createElement('div');
        tmp.innerHTML = SIG.slideHTML(m.contenido || m.slide || {});
        node = tmp.firstElementChild || document.createElement('div');
        if (items.length > 1) {
          var secsS = (m.duracion_seg && m.duracion_seg > 0) ? m.duracion_seg : (SIG.cfg.slideDefaultSeconds || 12);
          timer = setTimeout(advance, secsS * 1000);
        }
      } else {
        node = document.createElement('img');
        node.src = SIG.STORAGE_PUBLIC + m.storage_path;
        node.onerror = function () { advance(); };
        // con un solo elemento no hace falta temporizador: se queda fijo
        if (items.length > 1) {
          var secs = (m.duracion_seg && m.duracion_seg > 0) ? m.duracion_seg : (SIG.cfg.slideDefaultSeconds || 12);
          timer = setTimeout(advance, secs * 1000);
        }
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

    function detener() {
      clearTimer();
      running = false;
      idx = -1;
      while (r.stage.firstChild) r.stage.removeChild(r.stage.firstChild);
      live = null;
    }

    function arrancar() {
      clearTimer();
      idx = -1;
      running = true;
      next();
    }

    return {
      update: function (p) {
        p = p || {};
        var nuevoLayout = (p.layout && p.layout.visualizador) || {};
        var pieCambio = nuevoLayout.pie !== layout.pie || (nuevoLayout.pieTexto || '') !== (layout.pieTexto || '');
        layout = nuevoLayout;
        r.host.hidden = layout.visible === false;
        r.host.classList.toggle('vis--cover', layout.ajuste === 'cover');

        var nuevos = (p.items || []).slice();
        var nuevaSig = firma(nuevos);
        var visible = nuevos.length > 0 && layout.visible !== false;
        r.wm.style.display = visible ? 'none' : 'flex';

        if (!visible) {
          if (running || live) detener();
          pintarPie(null);
          return;
        }

        items = nuevos;

        if (nuevaSig !== sig) {
          // la lista cambió (o es la primera vez): reinicia desde el principio
          sig = nuevaSig;
          arrancar();
        } else if (!running) {
          // misma lista pero no estaba corriendo
          arrancar();
        } else if (pieCambio) {
          // misma lista, sigue corriendo: solo refresca el pie del elemento actual
          pintarPie(items[idx] || null);
        }
      },
      start: function () {},
      stop: function () { clearTimer(); },
    };
  };
})();
