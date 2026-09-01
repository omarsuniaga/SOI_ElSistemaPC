/* ═══════════════════════════════════════════════════════════════════════
   slide.js — diapositivas nativas (creadas en el Estudio, sin Canva).
   SIG.slideHTML(contenido) -> string HTML para el <div> del visualizador.

   contenido = {
     plantilla: 'titulo' | 'evento' | 'aviso' | 'cita',
     titulo, subtitulo, cuerpo, fecha, lugar, hora, autor, icono,
     fondo: { tipo: 'gradiente' | 'color', valor }
   }
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

  function fondoStyle(f) {
    f = f || {};
    if (f.tipo === 'color' && /^#[0-9a-fA-F]{3,8}$/.test(f.valor || '')) {
      return 'background:' + f.valor + ';';
    }
    return 'background:' + (GRADIENTES[f.valor] || GRADIENTES.oscuro) + ';';
  }

  function b(cls, txt) {
    return txt ? '<div class="' + cls + '">' + esc(txt) + '</div>' : '';
  }

  function tpl_titulo(c) {
    return b('slide__title', c.titulo) + b('slide__subtitle', c.subtitulo);
  }

  function tpl_evento(c) {
    var meta = [c.lugar, c.hora].filter(Boolean).map(esc).join(' · ');
    return (
      b('slide__eyebrow', 'Próximo evento') +
      b('slide__date', c.fecha) +
      b('slide__title', c.titulo) +
      (meta ? '<div class="slide__meta">' + meta + '</div>' : '')
    );
  }

  function tpl_aviso(c) {
    return (
      (c.icono ? '<div class="slide__icon">' + esc(c.icono) + '</div>' : '') +
      b('slide__title', c.titulo) +
      b('slide__body', c.cuerpo)
    );
  }

  function tpl_cita(c) {
    return (
      '<div class="slide__quote-mark">“</div>' +
      b('slide__quote', c.cuerpo || c.titulo) +
      b('slide__author', c.autor ? '— ' + c.autor : '')
    );
  }

  var PLANTILLAS = { titulo: tpl_titulo, evento: tpl_evento, aviso: tpl_aviso, cita: tpl_cita };

  SIG.slideHTML = function (contenido) {
    var c = contenido || {};
    var fn = PLANTILLAS[c.plantilla] || tpl_titulo;
    return (
      '<div class="slide slide--' + (c.plantilla || 'titulo') + '" style="' + fondoStyle(c.fondo) + '">' +
        '<div class="slide__inner">' + fn(c) + '</div>' +
      '</div>'
    );
  };
})();
