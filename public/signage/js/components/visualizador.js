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
    var attempts = 0;       // intentos seguidos de next() sin que nada llegue a pantalla

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

    function segundos(m) {
      return (m && m.duracion_seg && m.duracion_seg > 0)
        ? m.duracion_seg
        : (SIG.cfg.slideDefaultSeconds || 12);
    }

    /* Construye el nodo DOM para un medio. Devuelve null si el player no puede
       renderizarlo (tipo desconocido, build sin soporte de slides, sin fuente):
       next() lo saltará en vez de dejar la pantalla en blanco o romper. */
    function crearNodo(m) {
      if (m.tipo === 'video') {
        var v = document.createElement('video');
        v.src = m.storage_path ? SIG.STORAGE_PUBLIC + m.storage_path : (m.youtube_url || '');
        if (!v.src) { console.warn('[vis] vídeo sin fuente, se omite', m.id); return null; }
        v.muted = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
        v.onended = advance;
        v.onloadeddata = function () { attempts = 0; };
        v.onerror = function () { console.warn('[vis] no cargó el vídeo', v.src); advance(); };
        timer = setTimeout(advance, (SIG.cfg.videoMaxSeconds || 240) * 1000);
        return v;
      }
      if (m.tipo === 'slide') {
        if (typeof SIG.slideHTML !== 'function') {
          console.warn('[vis] llegó una diapositiva pero este player no tiene soporte de slides ' +
            '(build desactualizado: falta js/components/slide.js). Se omite.');
          return null;
        }
        var tmp = document.createElement('div');
        tmp.innerHTML = SIG.slideHTML(m.contenido || m.slide || {});
        var s = tmp.firstElementChild;
        if (!s) { console.warn('[vis] diapositiva sin contenido renderizable, se omite', m.id); return null; }
        if (items.length > 1) timer = setTimeout(advance, segundos(m) * 1000);
        return s;
      }
      if (m.tipo === 'imagen') {
        if (!m.storage_path) { console.warn('[vis] imagen sin storage_path, se omite', m.id); return null; }
        var img = document.createElement('img');
        img.src = SIG.STORAGE_PUBLIC + m.storage_path;
        img.onload = function () { attempts = 0; };
        img.onerror = function () { console.warn('[vis] no cargó la imagen', m.storage_path); advance(); };
        // con un solo elemento no hace falta temporizador: se queda fijo
        if (items.length > 1) timer = setTimeout(advance, segundos(m) * 1000);
        return img;
      }
      console.warn('[vis] tipo de medio no soportado: "' + m.tipo + '" — se omite. ' +
        '¿Player desactualizado respecto al panel de control?');
      return null;
    }

    function next() {
      Array.prototype.slice.call(r.stage.children).forEach(function (n) {
        if (n !== live) {
          if (n.tagName === 'VIDEO') { try { n.pause(); } catch (e) {} }
          n.parentNode.removeChild(n);
        }
      });

      // Cortafuegos: si ninguno de los ítems llega a pantalla (tipo no soportado,
      // build viejo, todas las imágenes 404) no girar en bucle infinito.
      attempts++;
      if (attempts > items.length) {
        clearTimer();
        var aviso = 'ningún medio del listado (' + items.length + ') se pudo mostrar' +
          (typeof SIG.slideHTML !== 'function' ? ' — player sin soporte de diapositivas (build viejo)' : '');
        console.warn('[vis] ' + aviso + '. Rotación en pausa hasta el próximo cambio del listado.');
        SIG.visWarn = aviso;
        running = false;
        if (!live) r.wm.style.display = 'flex';
        return;
      }

      idx = (idx + 1) % items.length;
      var m = items[idx];
      var node = crearNodo(m);

      if (!node) {
        // Ítem no renderizable: probar el siguiente sin dejar la pantalla en blanco.
        clearTimer();
        return next();
      }

      r.stage.appendChild(node);
      if (m.tipo === 'slide' && SIG.fitCanvasArt) {
        SIG.fitCanvasArt(node);
        requestAnimationFrame(function () { SIG.fitCanvasArt(node); });
      }
      var activado = false;
      function activar() {
        if (activado) return;
        activado = true;
        // las diapositivas se dibujan sincrónicamente; img/vídeo reinician el
        // cortafuegos en su propio onload/onloadeddata.
        if (m.tipo === 'slide') attempts = 0;
        SIG.visWarn = null;
        node.classList.add('is-live');
        if (m.tipo === 'slide' && SIG.fitCanvasArt) SIG.fitCanvasArt(node);
        var prev = live;
        live = node;
        if (prev && prev !== node) {
          prev.classList.remove('is-live');
          setTimeout(function () {
            if (prev.parentNode) {
              if (prev.tagName === 'VIDEO') { try { prev.pause(); } catch (e) {} }
              prev.parentNode.removeChild(prev);
            }
          }, 800);
        }
      }
      requestAnimationFrame(function () { requestAnimationFrame(activar); });
      setTimeout(activar, 120);   // red de seguridad si rAF está frenado
      pintarPie(m);
    }
    function advance() { clearTimer(); next(); }

    function detener() {
      clearTimer();
      running = false;
      idx = -1;
      attempts = 0;
      while (r.stage.firstChild) r.stage.removeChild(r.stage.firstChild);
      live = null;
    }

    function arrancar() {
      clearTimer();
      idx = -1;
      attempts = 0;
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
      relayout: function () { if (live && SIG.fitCanvasArt) SIG.fitCanvasArt(live.parentNode || document); },
    };
  };
})();
