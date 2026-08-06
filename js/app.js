/* ==========================================================================
   MCMI-IV — Controlador de la aplicación
   Sin dependencias externas. Funciona abriendo index.html directamente
   (protocolo file://) y sin conexión a internet.
   ========================================================================== */
(function (global) {
  'use strict';

  var ITEMS = global.MCMI_ITEMS;
  var STORE_KEY = 'mcmi4.session.v1';
  var ARCHIVE_KEY = 'mcmi4.archive.v1';

  var state = {
    meta: {},
    answers: new Array(195).fill(null),
    page: 0,
    pageSize: 1,
    startedAt: null,
    finishedAt: null,
    result: null,
    adjustments: true
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------ */
  /* Persistencia                                                        */
  /* ------------------------------------------------------------------ */
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        meta: state.meta, answers: state.answers, page: state.page,
        pageSize: state.pageSize, startedAt: state.startedAt,
        finishedAt: state.finishedAt, adjustments: state.adjustments
      }));
      flashSaved();
    } catch (e) { /* almacenamiento no disponible: la app sigue funcionando */ }
  }

  var savedTimer = null;
  function flashSaved() {
    var el = $('#saveFlag');
    if (!el) return;
    el.classList.add('on');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { el.classList.remove('on'); }, 1200);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !Array.isArray(d.answers) || d.answers.length !== 195) return null;
      return d;
    } catch (e) { return null; }
  }

  function clearSession() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  }

  function archiveCurrent() {
    try {
      var arch = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');
      arch.unshift({
        id: Date.now(),
        meta: state.meta,
        answers: state.answers,
        finishedAt: state.finishedAt,
        adjustments: state.adjustments
      });
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(arch.slice(0, 40)));
    } catch (e) {}
  }

  function getArchive() {
    try { return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]'); } catch (e) { return []; }
  }

  /* ------------------------------------------------------------------ */
  /* Navegación entre vistas                                             */
  /* ------------------------------------------------------------------ */
  function show(viewId) {
    $$('.view').forEach(function (v) { v.classList.toggle('active', v.id === viewId); });
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }

  /* ------------------------------------------------------------------ */
  /* Formulario de datos                                                 */
  /* ------------------------------------------------------------------ */
  var PROBLEMS = ['Conyugal o familiar', 'Cambios de humor', 'Alcohol', 'Comportamiento antisocial',
    'Laboral o académico', 'Confianza en mí mismo', 'Drogas', 'Soledad',
    'Enfermedad o cansancio', 'Sexualidad', 'Otro'];

  function readMeta() {
    var m = {
      name: $('#f-name').value.trim(),
      birth: $('#f-birth').value,
      age: $('#f-age').value.trim(),
      sex: $('#f-sex').value,
      education: $('#f-education').value,
      civil: $('#f-civil').value,
      code: $('#f-code').value.trim(),
      examiner: $('#f-examiner').value.trim(),
      date: $('#f-date').value,
      setting: $('#f-setting').value,
      episode: $('#f-episode').value,
      problems: $$('#f-problems input:checked').map(function (i) { return i.value; })
    };
    return m;
  }

  function writeMeta(m) {
    if (!m) return;
    $('#f-name').value = m.name || '';
    $('#f-birth').value = m.birth || '';
    $('#f-age').value = m.age || '';
    $('#f-sex').value = m.sex || '';
    $('#f-education').value = m.education || '';
    $('#f-civil').value = m.civil || '';
    $('#f-code').value = m.code || '';
    $('#f-examiner').value = m.examiner || '';
    $('#f-date').value = m.date || '';
    $('#f-setting').value = m.setting || '';
    $('#f-episode').value = m.episode || '';
    $$('#f-problems input').forEach(function (i) {
      i.checked = (m.problems || []).indexOf(i.value) >= 0;
    });
  }

  function buildProblems() {
    var wrap = $('#f-problems');
    wrap.innerHTML = PROBLEMS.map(function (p) {
      return '<label class="chk"><input type="checkbox" value="' + p + '"><span>' + p + '</span></label>';
    }).join('');
    wrap.addEventListener('change', function () {
      var checked = $$('#f-problems input:checked');
      if (checked.length > 2) checked[0].checked = false;
    });
  }

  function ageFromBirth() {
    var b = $('#f-birth').value;
    if (!b) return;
    var d = new Date(b);
    if (isNaN(d)) return;
    var now = new Date();
    var a = now.getFullYear() - d.getFullYear();
    var mm = now.getMonth() - d.getMonth();
    if (mm < 0 || (mm === 0 && now.getDate() < d.getDate())) a--;
    if (a >= 0 && a < 130) $('#f-age').value = a;
  }

  /* ------------------------------------------------------------------ */
  /* Administración de ítems                                             */
  /* ------------------------------------------------------------------ */
  function totalPages() { return Math.ceil(195 / state.pageSize); }

  function answeredCount() {
    return state.answers.filter(function (a) { return a === true || a === false; }).length;
  }

  function renderProgress() {
    var n = answeredCount();
    var pct = Math.round((n / 195) * 100);
    $('#progressBar').style.width = pct + '%';
    $('#progressText').textContent = n + ' de 195 respondidos · ' + pct + '%';
    $('#pageInfo').textContent = 'Página ' + (state.page + 1) + ' de ' + totalPages();
    $('#btnFinish').classList.toggle('ready', n === 195);
  }

  function renderItems() {
    var start = state.page * state.pageSize;
    var end = Math.min(195, start + state.pageSize);
    var host = $('#itemList');
    var big = state.pageSize === 1;
    var html = [];

    for (var i = start; i < end; i++) {
      var a = state.answers[i];
      html.push(
        '<div class="item' + (big ? ' item-big' : '') + (a === null ? ' item-pending' : '') + '" data-idx="' + i + '">' +
        '<div class="item-num">' + (i + 1) + '</div>' +
        '<p class="item-text">' + MCMI_REPORT.esc(ITEMS[i]) + '</p>' +
        '<div class="item-opts">' +
        '<button type="button" class="opt opt-v' + (a === true ? ' sel' : '') + '" data-val="V">' +
        '<span class="opt-key">V</span> Verdadero</button>' +
        '<button type="button" class="opt opt-f' + (a === false ? ' sel' : '') + '" data-val="F">' +
        '<span class="opt-key">F</span> Falso</button>' +
        '</div></div>');
    }
    host.innerHTML = html.join('');

    $('#btnPrev').disabled = state.page === 0;
    $('#btnNext').disabled = state.page >= totalPages() - 1;
    renderProgress();
  }

  function setAnswer(idx, val) {
    state.answers[idx] = val;
    save();
    var card = $('.item[data-idx="' + idx + '"]');
    if (card) {
      card.classList.remove('item-pending');
      $$('.opt', card).forEach(function (b) {
        b.classList.toggle('sel', (b.dataset.val === 'V') === (val === true));
      });
    }
    renderProgress();

    // Avance automático en modo de un ítem por página
    if (state.pageSize === 1 && state.page < totalPages() - 1) {
      setTimeout(function () { goPage(state.page + 1); }, 170);
    }
  }

  function goPage(p) {
    state.page = Math.max(0, Math.min(totalPages() - 1, p));
    save();
    renderItems();
  }

  function firstUnanswered() {
    for (var i = 0; i < 195; i++) if (state.answers[i] === null) return i;
    return -1;
  }

  /* ------------------------------------------------------------------ */
  /* Resultados                                                          */
  /* ------------------------------------------------------------------ */
  function computeAndShow() {
    state.result = global.MCMI_SCORING.score(state.answers, { adjustments: state.adjustments });
    state.meta = Object.keys(state.meta).length ? state.meta : readMeta();
    $('#reportHost').innerHTML = global.MCMI_REPORT.build(state.result, state.meta);
    $('#chkAdjust').checked = state.adjustments;
    show('view-results');
  }

  function exportJSON() {
    var payload = {
      instrument: 'MCMI-IV', format: 'mcmi4-session', version: 1,
      exportedAt: new Date().toISOString(),
      meta: state.meta, answers: state.answers,
      adjustments: state.adjustments
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var name = 'MCMI-IV_' + (state.meta.code || state.meta.name || 'sesion').replace(/[^\w\-]+/g, '_') +
      '_' + new Date().toISOString().slice(0, 10) + '.json';
    downloadBlob(blob, name);
  }

  function exportCSV() {
    if (!state.result) return;
    var r = state.result, lines = [];
    lines.push('escala;nombre;grupo;pd;pd_max;tb_sin_ajustar;tb_ajustada;percentil');
    global.MCMI_SCALES.forEach(function (d) {
      var s = r.scales[d.code];
      lines.push([s.code, s.name, s.group, s.raw, s.maxRaw, s.brUnadjusted, s.br, s.pct].join(';'));
    });
    lines.push('');
    lines.push('faceta;nombre;escala;pd;pd_max;tb;percentil');
    r.facets.forEach(function (f) {
      lines.push([f.code, f.name, f.parent, f.raw, f.maxRaw, f.br, f.pct].join(';'));
    });
    lines.push('');
    lines.push('indice;pd;tb;clasificacion');
    ['V', 'W', 'X', 'Y', 'Z'].forEach(function (k) {
      var v = r.validity[k];
      lines.push([k, v.raw, v.br === undefined || v.br === null ? '' : v.br, v.classification || ''].join(';'));
    });
    var blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, 'MCMI-IV_puntuaciones_' + new Date().toISOString().slice(0, 10) + '.csv');
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function importJSON(file) {
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var d = JSON.parse(rd.result);
        if (!d || !Array.isArray(d.answers) || d.answers.length !== 195) {
          throw new Error('El archivo no contiene 195 respuestas.');
        }
        state.answers = d.answers.map(function (a) {
          return a === true || a === false ? a : null;
        });
        state.meta = d.meta || {};
        state.adjustments = d.adjustments !== false;
        state.page = 0;
        writeMeta(state.meta);
        save();
        if (answeredCount() === 195) computeAndShow();
        else { renderItems(); show('view-test'); }
      } catch (e) {
        alert('No se pudo importar el archivo: ' + e.message);
      }
    };
    rd.readAsText(file);
  }

  /* ------------------------------------------------------------------ */
  /* Diagnóstico                                                         */
  /* ------------------------------------------------------------------ */
  function renderSelfTest() {
    var res = global.MCMI_SELFTEST.run();
    var host = $('#selftestHost');
    var html = ['<div class="alert ' + (res.allPass ? 'alert-ok' : 'alert-danger') + '">' +
      '<h3>' + res.passed + ' de ' + res.total + ' comprobaciones superadas</h3>' +
      '<p>' + (res.allPass
        ? 'La codificación interna reproduce exactamente las cifras publicadas en los anexos del manual.'
        : 'Hay discrepancias: revise el detalle antes de utilizar los resultados con fines clínicos.') +
      '</p></div><table class="tbl"><thead><tr><th></th><th>Comprobación</th><th>Detalle</th></tr></thead><tbody>'];
    res.checks.forEach(function (c) {
      html.push('<tr class="' + (c.pass ? '' : 'sev-3-row') + '"><td class="num">' +
        (c.pass ? '<span class="tick ok">✓</span>' : '<span class="tick bad">✕</span>') + '</td>' +
        '<td>' + MCMI_REPORT.esc(c.name) + '</td><td class="small muted">' +
        MCMI_REPORT.esc(c.detail) + '</td></tr>');
    });
    html.push('</tbody></table>');
    host.innerHTML = html.join('');
  }

  function renderArchive() {
    var arch = getArchive();
    var host = $('#archiveHost');
    if (!arch.length) {
      host.innerHTML = '<p class="note">Todavía no hay aplicaciones guardadas en este dispositivo.</p>';
      return;
    }
    host.innerHTML = '<table class="tbl"><thead><tr><th>Sujeto</th><th>Código</th><th>Fecha</th><th></th></tr></thead><tbody>' +
      arch.map(function (a) {
        return '<tr><td>' + MCMI_REPORT.esc(a.meta.name || '—') + '</td>' +
          '<td>' + MCMI_REPORT.esc(a.meta.code || '—') + '</td>' +
          '<td class="small muted">' + MCMI_REPORT.esc(a.finishedAt ? new Date(a.finishedAt).toLocaleString('es-ES') : '—') + '</td>' +
          '<td><button class="btn btn-ghost btn-sm" data-open="' + a.id + '">Abrir</button></td></tr>';
      }).join('') + '</tbody></table>';

    $$('[data-open]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        var rec = getArchive().filter(function (x) { return String(x.id) === b.dataset.open; })[0];
        if (!rec) return;
        state.answers = rec.answers.slice();
        state.meta = rec.meta || {};
        state.adjustments = rec.adjustments !== false;
        writeMeta(state.meta);
        computeAndShow();
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Arranque                                                            */
  /* ------------------------------------------------------------------ */
  function bind() {
    // Inicio
    $('#btnNew').addEventListener('click', function () {
      state.answers = new Array(195).fill(null);
      state.meta = {}; state.page = 0; state.startedAt = Date.now(); state.finishedAt = null;
      writeMeta({});
      $('#f-date').value = new Date().toISOString().slice(0, 10);
      clearSession(); save();
      show('view-datos');
    });
    $('#btnResume').addEventListener('click', function () {
      renderItems();
      var u = firstUnanswered();
      if (u >= 0) goPage(Math.floor(u / state.pageSize));
      show('view-test');
    });
    $('#btnImport').addEventListener('click', function () { $('#fileImport').click(); });
    $('#fileImport').addEventListener('change', function (e) {
      if (e.target.files[0]) importJSON(e.target.files[0]);
      e.target.value = '';
    });
    $('#btnDiag').addEventListener('click', function () { renderSelfTest(); renderArchive(); show('view-diag'); });
    $$('[data-goto="home"]').forEach(function (b) {
      b.addEventListener('click', function () { refreshHome(); show('view-home'); });
    });

    // Datos
    $('#f-birth').addEventListener('change', ageFromBirth);
    $('#btnStartTest').addEventListener('click', function () {
      state.meta = readMeta();
      var age = parseInt(state.meta.age, 10);
      if (!isNaN(age) && age < 18) {
        if (!confirm('El MCMI-IV está validado y baremado solo para adultos de 18 años o más. ' +
          'Con menos de 18 años el inventario se considera impuntuable.\n\n¿Continuar de todos modos?')) return;
      }
      save();
      state.page = 0;
      renderItems();
      show('view-test');
    });
    $('#btnSkipData').addEventListener('click', function () {
      state.meta = readMeta(); save(); state.page = 0; renderItems(); show('view-test');
    });

    // Test
    $('#itemList').addEventListener('click', function (e) {
      var btn = e.target.closest('.opt');
      if (!btn) return;
      var idx = parseInt(btn.closest('.item').dataset.idx, 10);
      setAnswer(idx, btn.dataset.val === 'V');
    });
    $('#btnPrev').addEventListener('click', function () { goPage(state.page - 1); });
    $('#btnNext').addEventListener('click', function () { goPage(state.page + 1); });
    $('#selPageSize').addEventListener('change', function () {
      var first = state.page * state.pageSize;
      state.pageSize = parseInt(this.value, 10);
      state.page = Math.floor(first / state.pageSize);
      save(); renderItems();
    });
    $('#btnGotoPending').addEventListener('click', function () {
      var u = firstUnanswered();
      if (u < 0) { alert('No quedan ítems sin responder.'); return; }
      goPage(Math.floor(u / state.pageSize));
    });
    $('#btnFinish').addEventListener('click', function () {
      var pending = 195 - answeredCount();
      if (pending > 0) {
        var msg = 'Quedan ' + pending + ' ítems sin responder.\n\n';
        msg += pending >= 14
          ? 'Con 14 o más ítems sin respuesta el inventario es IMPUNTUABLE según el manual.'
          : 'El manual recomienda pedir al sujeto que complete los ítems omitidos antes de corregir.';
        msg += '\n\n¿Corregir de todos modos?';
        if (!confirm(msg)) return;
      }
      state.finishedAt = Date.now();
      save(); archiveCurrent();
      computeAndShow();
    });

    // Teclado
    document.addEventListener('keydown', function (e) {
      if (!$('#view-test').classList.contains('active')) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      var k = e.key.toLowerCase();
      if (state.pageSize === 1) {
        var idx = state.page;
        if (k === 'v' || k === '1') { setAnswer(idx, true); e.preventDefault(); }
        if (k === 'f' || k === '2') { setAnswer(idx, false); e.preventDefault(); }
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { goPage(state.page + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { goPage(state.page - 1); e.preventDefault(); }
    });

    // Resultados
    $('#btnPrint').addEventListener('click', function () {
      // Despliega todas las secciones plegadas para que aparezcan en el PDF
      $$('#reportHost details').forEach(function (d) { d.open = true; });
      window.print();
    });
    $('#btnExportJSON').addEventListener('click', exportJSON);
    $('#btnExportCSV').addEventListener('click', exportCSV);
    $('#btnBackTest').addEventListener('click', function () { renderItems(); show('view-test'); });
    $('#chkAdjust').addEventListener('change', function () {
      state.adjustments = this.checked;
      save();
      computeAndShow();
    });

    // Tema
    $('#btnTheme').addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('mcmi4.theme', next); } catch (e) {}
    });
  }

  function refreshHome() {
    var d = load();
    var has = d && d.answers.some(function (a) { return a !== null; });
    $('#btnResume').style.display = has ? '' : 'none';
    if (has) {
      var n = d.answers.filter(function (a) { return a !== null; }).length;
      $('#resumeInfo').textContent = n + ' de 195 ítems respondidos' +
        (d.meta && d.meta.name ? ' · ' + d.meta.name : '');
      $('#resumeInfo').style.display = '';
    } else {
      $('#resumeInfo').style.display = 'none';
    }
  }

  function init() {
    try {
      var t = localStorage.getItem('mcmi4.theme');
      if (t) document.documentElement.dataset.theme = t;
    } catch (e) {}

    buildProblems();
    bind();

    var d = load();
    if (d) {
      state.meta = d.meta || {};
      state.answers = d.answers;
      state.page = d.page || 0;
      state.pageSize = d.pageSize || 1;
      state.startedAt = d.startedAt || null;
      state.adjustments = d.adjustments !== false;
      $('#selPageSize').value = String(state.pageSize);
      writeMeta(state.meta);
    }
    if (!$('#f-date').value) $('#f-date').value = new Date().toISOString().slice(0, 10);

    // Aviso silencioso si la autocomprobación falla
    var st = global.MCMI_SELFTEST.run();
    var badge = $('#integrityBadge');
    badge.textContent = st.allPass
      ? 'Integridad de datos: ' + st.passed + '/' + st.total + ' ✓'
      : 'Integridad de datos: ' + st.passed + '/' + st.total + ' ✕';
    badge.className = 'badge ' + (st.allPass ? 'badge-ok' : 'badge-bad');

    refreshHome();
    show('view-home');
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
