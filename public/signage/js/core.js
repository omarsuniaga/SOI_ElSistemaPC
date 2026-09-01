/* ═══════════════════════════════════════════════════════════════════════
   core.js — utilidades compartidas por los componentes. Sin dependencias.
   Expone window.SIG.*
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var CFG = window.SIGNAGE_CONFIG;
  var SIG = (window.SIG = window.SIG || {});

  SIG.cfg = CFG;

  SIG.$ = function (sel, root) { return (root || document).querySelector(sel); };

  SIG.el = function (html) {
    var t = document.createElement('template');
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  };

  SIG.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* ---- red ---- */
  var REST = CFG.supabaseUrl + '/rest/v1/';
  SIG.STORAGE_PUBLIC = CFG.supabaseUrl + '/storage/v1/object/public/signage/';
  var HDRS = { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey };

  SIG.api = function (path) {
    var ctrl = new AbortController();
    var to = setTimeout(function () { ctrl.abort(); }, 15000);
    return fetch(REST + path, { headers: HDRS, signal: ctrl.signal })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .finally(function () { clearTimeout(to); });
  };

  /* ---- caché local ---- */
  SIG.cache = {
    put: function (k, v) { try { localStorage.setItem('sig:' + k, JSON.stringify(v)); } catch (e) {} },
    get: function (k) { try { return JSON.parse(localStorage.getItem('sig:' + k)); } catch (e) { return null; } },
  };

  /* ---- tiempo (zona horaria de la config) ---- */
  var TZ = CFG.timezone;
  SIG.time = {
    hm: function () {
      return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    },
    dateLong: function () {
      var s = new Intl.DateTimeFormat('es-DO', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .format(new Date()).replace(',', '');
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    dayMonth: function (d) {
      return new Intl.DateTimeFormat('es-DO', { timeZone: TZ, day: 'numeric', month: 'long' }).format(new Date(d));
    },
    isoDate: function (d) {
      return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d ? new Date(d) : new Date());
    },
    localHour: function () {
      return parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(new Date()), 10);
    },
    hhmm: function (t) { return t ? String(t).slice(0, 5) : ''; },
    mins: function (t) { var p = String(t || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); },
    nowMins: function () { var p = SIG.time.hm().split(':'); return (+p[0]) * 60 + (+p[1]); },
  };

  /* ---- merge de layout ---- */
  SIG.mergeLayout = function (dbLayout) {
    var d = JSON.parse(JSON.stringify(CFG.defaultLayout));
    if (dbLayout && typeof dbLayout === 'object') {
      Object.keys(d).forEach(function (z) {
        if (dbLayout[z] && typeof dbLayout[z] === 'object') {
          Object.keys(dbLayout[z]).forEach(function (k) { d[z][k] = dbLayout[z][k]; });
        }
      });
    }
    return d;
  };
})();
