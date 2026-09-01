/* ═══════════════════════════════════════════════════════════════════════
   slide.js — diapositivas nativas (creadas en el Estudio, sin Canva).
   SIG.slideHTML(contenido) -> string HTML para el <div> del visualizador.

   Dos formas de `contenido`:
   1) Plantilla (legado):
      { plantilla:'titulo'|'evento'|'aviso'|'cita', titulo, subtitulo, ... fondo }
   2) Lienzo libre:
      { tipo:'canvas', w:1280, h:720, fondo:{tipo,valor,storage_path},
        elementos:[ {id,tipo:'texto',x,y,w,h,texto,tamano,color,peso,align,fuente},
                    {id,tipo:'imagen',x,y,w,h,storage_path,ajuste} ] }
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SIG = window.SIG;
  var esc = SIG.esc;

  var GRADIENTES = {
    oscuro: 'linear-gradient(135deg, #10192b 0%, #0b0e17 75%)',
    dorado: 'linear-gradient(135deg, #2a2312 0%, #0b0e17 72%)',
    azul:   'linear-gradient(135deg, #0a1b2e 0%, #0b0e17 78%)',
    verde:  'linear-gradient(135deg, #10241c 0%, #0b0e17 78%)',
  };
  var FUENTES = {
    sans:  'var(--sans)',
    serif: 'var(--serif)',
  };

  function fondoStyle(f) {
    f = f || {};
    if (f.tipo === 'imagen' && f.storage_path) {
      return 'background:#0b0e17 center/cover no-repeat url(' + SIG.STORAGE_PUBLIC + f.storage_path + ');';
    }
    if (f.tipo === 'color' && /^#[0-9a-fA-F]{3,8}$/.test(f.valor || '')) {
      return 'background:' + f.valor + ';';
    }
    return 'background:' + (GRADIENTES[f.valor] || GRADIENTES.oscuro) + ';';
  }

  /* ---------- plantillas legado ---------- */
  function b(cls, txt) { return txt ? '<div class="' + cls + '">' + esc(txt) + '</div>' : ''; }
  function tpl_titulo(c) { return b('slide__title', c.titulo) + b('slide__subtitle', c.subtitulo); }
  function tpl_evento(c) {
    var meta = [c.lugar, c.hora].filter(Boolean).map(esc).join(' · ');
    return b('slide__eyebrow', 'Próximo evento') + b('slide__date', c.fecha) + b('slide__title', c.titulo) +
      (meta ? '<div class="slide__meta">' + meta + '</div>' : '');
  }
  function tpl_aviso(c) {
    return (c.icono ? '<div class="slide__icon">' + esc(c.icono) + '</div>' : '') +
      b('slide__title', c.titulo) + b('slide__body', c.cuerpo);
  }
  function tpl_cita(c) {
    return '<div class="slide__quote-mark">“</div>' + b('slide__quote', c.cuerpo || c.titulo) +
      b('slide__author', c.autor ? '— ' + c.autor : '');
  }
  var PLANTILLAS = { titulo: tpl_titulo, evento: tpl_evento, aviso: tpl_aviso, cita: tpl_cita };

  /* ---------- lienzo libre ---------- */
  function px(n) { return (Number(n) || 0) + 'px'; }

  function elHTML(el) {
    var base = 'position:absolute;left:' + px(el.x) + ';top:' + px(el.y) +
      ';width:' + px(el.w) + ';height:' + px(el.h) + ';';
    if (el.tipo === 'imagen') {
      if (!el.storage_path) return '';
      return '<img class="cel cel--imagen" style="' + base +
        'object-fit:' + (el.ajuste === 'cover' ? 'cover' : 'contain') + '" src="' +
        SIG.STORAGE_PUBLIC + el.storage_path + '" alt="">';
    }
    // texto
    var st = base +
      'font-size:' + px(el.tamano || 48) + ';' +
      'line-height:1.15;' +
      'color:' + (/^#[0-9a-fA-F]{3,8}$/.test(el.color || '') ? el.color : '#ffffff') + ';' +
      'font-weight:' + (el.peso || 700) + ';' +
      'text-align:' + (el.align || 'left') + ';' +
      'font-family:' + (FUENTES[el.fuente] || FUENTES.sans) + ';' +
      'display:flex;flex-direction:column;justify-content:' +
        (el.vAlign === 'center' ? 'center' : el.vAlign === 'end' ? 'flex-end' : 'flex-start') + ';' +
      'white-space:pre-wrap;overflow:hidden;' +
      (el.sombra ? 'text-shadow:0 2px 12px rgba(0,0,0,.55);' : '');
    return '<div class="cel cel--texto" style="' + st + '">' + esc(el.texto || '') + '</div>';
  }

  function slideCanvas(c) {
    var w = c.w || 1280, h = c.h || 720;
    var els = (c.elementos || []).map(elHTML).join('');
    return (
      '<div class="slide slide--canvas" style="' + fondoStyle(c.fondo) + '">' +
        '<div class="canvas-fit" data-cw="' + w + '" data-ch="' + h + '">' +
          '<div class="canvas-art" style="width:' + px(w) + ';height:' + px(h) + '">' + els + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  SIG.slideHTML = function (contenido) {
    var c = contenido || {};
    if (c.tipo === 'canvas') return slideCanvas(c);
    var fn = PLANTILLAS[c.plantilla] || tpl_titulo;
    return (
      '<div class="slide slide--' + (c.plantilla || 'titulo') + '" style="' + fondoStyle(c.fondo) + '">' +
        '<div class="slide__inner">' + fn(c) + '</div>' +
      '</div>'
    );
  };

  /* Escala el artboard 1280×720 para caber en su contenedor. Idempotente.
     Si el contenedor todavía no tiene tamaño, reintenta en el próximo frame. */
  SIG.fitCanvasArt = function (root, _try) {
    var fits = (root || document).querySelectorAll('.canvas-fit');
    var pendiente = false;
    Array.prototype.forEach.call(fits, function (fit) {
      var art = fit.firstElementChild;
      if (!art) return;
      var cw = +fit.getAttribute('data-cw') || 1280;
      var ch = +fit.getAttribute('data-ch') || 720;
      var r = fit.getBoundingClientRect();
      var s = Math.min(r.width / cw, r.height / ch);
      if (!isFinite(s) || s <= 0) { pendiente = true; return; }
      art.style.transform = 'scale(' + s + ')';
    });
    if (pendiente && (_try || 0) < 30) {
      requestAnimationFrame(function () { SIG.fitCanvasArt(root, (_try || 0) + 1); });
    }
  };
})();
