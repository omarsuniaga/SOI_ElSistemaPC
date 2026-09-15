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

  var CLIP_SHAPES = {
    circle:  'circle(50% at 50% 50%)',
    hex:     'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    star:    'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
  };

  /* ---------- lienzo libre ---------- */
  function px(n) { return (Number(n) || 0) + 'px'; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function elHTML(el) {
    var base = 'position:absolute;left:' + px(el.x) + ';top:' + px(el.y) +
      ';width:' + px(el.w) + ';height:' + px(el.h) + ';box-sizing:border-box;';
    if (el.opacidad != null) base += 'opacity:' + el.opacidad + ';';
    var sx = el.flipH ? -1 : 1;
    var sy = el.flipV ? -1 : 1;
    if (sx !== 1 || sy !== 1) base += 'transform:scale(' + sx + ',' + sy + ');';

    if (el.tipo === 'imagen') {
      var src = el.storage_path ? (SIG.STORAGE_PUBLIC + el.storage_path) : (el.dataUrl || '');
      if (!src) return '';
      var imgStyle = 'width:100%;height:100%;display:block;object-fit:' + (el.ajuste === 'cover' ? 'cover' : 'contain') + ';';
      if (el.borderRadius) imgStyle += 'border-radius:' + px(el.borderRadius) + ';';
      if (el.bordeAncho) imgStyle += 'border:' + el.bordeAncho + 'px ' + (el.bordeStyle || 'solid') + ' ' + (el.bordeColor || '#ffffff') + ';';
      if (el.sombra) imgStyle += 'box-shadow:0 12px 36px rgba(0,0,0,.6);';
      if (el.clipShape && CLIP_SHAPES[el.clipShape]) imgStyle += 'clip-path:' + CLIP_SHAPES[el.clipShape] + ';';
      var fparts = [];
      if (el.filterBrightness != null && el.filterBrightness !== 100) fparts.push('brightness(' + el.filterBrightness + '%)');
      if (el.filterContrast != null && el.filterContrast !== 100) fparts.push('contrast(' + el.filterContrast + '%)');
      if (el.filterGrayscale) fparts.push('grayscale(' + el.filterGrayscale + '%)');
      if (el.filterBlur) fparts.push('blur(' + el.filterBlur + 'px)');
      if (fparts.length) imgStyle += 'filter:' + fparts.join(' ') + ';';
      return '<div class="cel cel--imagen" style="' + base + '"><img style="' + imgStyle + '" src="' + esc(src) + '" alt=""></div>';
    }

    if (el.tipo === 'forma') {
      var shapeStyle = 'width:100%;height:100%;background:' + (el.color || 'rgba(255,255,255,0.08)') + ';';
      if (el.formaTipo === 'card') {
        shapeStyle += 'border-radius:18px;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);box-shadow:0 16px 40px rgba(0,0,0,0.4);';
      } else if (el.formaTipo === 'banner') {
        shapeStyle += 'border-radius:8px;border-left:8px solid #fbbf24;box-shadow:0 8px 24px rgba(0,0,0,0.35);';
      } else if (el.formaTipo === 'circle') {
        shapeStyle += 'border-radius:50%;';
      } else if (el.formaTipo === 'line') {
        shapeStyle += 'border-radius:2px;';
      } else {
        shapeStyle += 'border-radius:' + (el.borderRadius || 8) + 'px;';
        if (el.bordeAncho) shapeStyle += 'border:' + el.bordeAncho + 'px ' + (el.bordeStyle || 'solid') + ' ' + (el.bordeColor || '#fff') + ';';
        if (el.sombra) shapeStyle += 'box-shadow:0 10px 30px rgba(0,0,0,.5);';
      }
      return '<div class="cel cel--forma" style="' + base + '"><div style="' + shapeStyle + '"></div></div>';
    }

    if (el.tipo === 'countdown') {
      var diff = Math.max(0, new Date(el.targetDate || Date.now()) - Date.now());
      var cd = Math.floor(diff / 86400000);
      var ch = Math.floor((diff % 86400000) / 3600000);
      var cm = Math.floor((diff % 3600000) / 60000);
      var cs = Math.floor((diff % 60000) / 1000);
      var rem = (cd > 0 ? (cd + 'd ' + pad(ch) + 'h ' + pad(cm) + 'm') : (pad(ch) + ':' + pad(cm) + ':' + pad(cs)));
      return '<div class="cel cel--countdown" style="' + base + 'display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:' + px(el.tamano || 72) + ';font-weight:800;color:' + (el.color || '#fff') + ';text-shadow:0 2px 20px rgba(0,0,0,.8);text-align:center;">' +
        '<div>' + rem + '</div>' +
        (el.label ? '<div style="font-size:' + px(Math.round((el.tamano || 72) * 0.3)) + ';opacity:.75;margin-top:6px;">' + esc(el.label) + '</div>' : '') +
      '</div>';
    }

    // texto
    var textShadow = el.sombra ? 'text-shadow:0 2px ' + px(el.sombraBlur || 14) + ' ' + (el.sombraColor || 'rgba(0,0,0,.75)') + ';' : '';
    var textStroke = (el.textStroke && el.textStrokeWidth) ? '-webkit-text-stroke:' + px(el.textStrokeWidth) + ' ' + (el.textStrokeColor || '#000') + ';' : '';
    var bgFill = el.fondoColor ? 'background:' + el.fondoColor + ';padding:6px 14px;border-radius:8px;' : '';
    var fontStyle = el.italic ? 'font-style:italic;' : '';
    var textDec = el.underline ? 'text-decoration:underline;' : '';
    var textTrans = el.transform ? 'text-transform:' + el.transform + ';' : '';
    var letterSp = el.letterSpacing ? 'letter-spacing:' + px(el.letterSpacing) + ';' : '';

    var st = base +
      'font-size:' + px(el.tamano || 48) + ';' +
      'line-height:' + (el.lineHeight || 1.15) + ';' +
      'color:' + (el.color || '#ffffff') + ';' +
      'font-weight:' + (el.peso || 700) + ';' +
      'text-align:' + (el.align || 'left') + ';' +
      'font-family:' + (FUENTES[el.fuente] || FUENTES.sans) + ';' +
      'display:flex;flex-direction:column;justify-content:center;' +
      'white-space:pre-wrap;overflow:hidden;' +
      textShadow + textStroke + bgFill + fontStyle + textDec + textTrans + letterSp;

    var inner = esc(el.texto || '');
    if (el.textGradient && el.textGradientStart && el.textGradientEnd) {
      inner = '<span style="background:linear-gradient(' + (el.textGradientAngle || 135) + 'deg,' + el.textGradientStart + ',' + el.textGradientEnd + ');-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;">' + inner + '</span>';
    }
    return '<div class="cel cel--texto" style="' + st + '">' + inner + '</div>';
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
    if (pendiente && (_try || 0) < 60) {
      setTimeout(function () { SIG.fitCanvasArt(root, (_try || 0) + 1); }, 90);
    }
  };
})();
