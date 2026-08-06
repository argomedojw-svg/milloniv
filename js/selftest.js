/* ==========================================================================
   MCMI-IV — Autocomprobación de integridad de los datos
   Verifica que la codificación interna reproduce exactamente las cifras
   publicadas en los Anexos A, B, C y D del manual.
   Se ejecuta al cargar y su resultado es consultable desde «Diagnóstico».
   ========================================================================== */
(function (global) {
  'use strict';

  function run() {
    var checks = [];
    var SCALES = global.MCMI_SCALES,
        FACETS = global.MCMI_FACETS,
        VAL = global.MCMI_VALIDITY,
        NORMS = global.MCMI_NORMS,
        ITEMS = global.MCMI_ITEMS;

    function ok(name, pass, detail) {
      checks.push({ name: name, pass: !!pass, detail: detail || '' });
    }

    /* 1. Banco de ítems */
    ok('Banco de 195 ítems', ITEMS.length === 195, ITEMS.length + ' ítems cargados');
    ok('Ningún ítem vacío', ITEMS.every(function (t) { return t && t.length > 10; }));

    /* 2. Rango válido de todos los ítems referenciados */
    var badRefs = [];
    function checkRefs(label, list) {
      list.forEach(function (s) {
        var n = Math.abs(s);
        if (!(n >= 1 && n <= 195)) badRefs.push(label + ' → ' + s);
      });
    }
    SCALES.forEach(function (s) { checkRefs('Escala ' + s.code, s.items); });
    FACETS.forEach(function (f) { checkRefs('Faceta ' + f.code, f.items); });
    ['V', 'X', 'Y', 'Z'].forEach(function (k) { checkRefs('Escala ' + k, VAL[k].items); });
    VAL.W.pairs.forEach(function (p) { checkRefs('Par W', p); });
    ok('Todas las referencias de ítem están en 1–195', badRefs.length === 0, badRefs.join('; '));

    /* 3. Ítems prototípicos contenidos en su escala */
    var protoErr = [];
    SCALES.forEach(function (s) {
      var set = {};
      s.items.forEach(function (x) { set[Math.abs(x)] = true; });
      s.proto.forEach(function (p) { if (!set[p]) protoErr.push(s.code + ':' + p); });
    });
    ok('Ítems prototípicos pertenecen a su escala', protoErr.length === 0, protoErr.join(', '));

    /* 4. Puntuación directa máxima = Anexo B (prototípico ×2 + resto ×1) */
    var maxErr = [];
    SCALES.forEach(function (s) {
      var computed = s.items.length + s.proto.length; // 1 pt cada ítem + 1 extra por prototípico
      if (computed !== s.maxRaw) maxErr.push(s.code + ': calculado ' + computed + ' ≠ manual ' + s.maxRaw);
    });
    ok('PD máxima coincide con el Anexo B en las 25 escalas', maxErr.length === 0, maxErr.join(' | '));

    /* 5. Longitud de las tablas D.1 = maxRaw + 1 */
    var tblErr = [];
    SCALES.forEach(function (s) {
      var t = NORMS.rawToBR[s.code];
      if (!t) { tblErr.push(s.code + ': sin tabla'); return; }
      if (t.length !== s.maxRaw + 1) tblErr.push(s.code + ': ' + t.length + ' filas ≠ ' + (s.maxRaw + 1));
      if (t[t.length - 1] < 90) tblErr.push(s.code + ': TB máxima ' + t[t.length - 1] + ' inesperadamente baja');
    });
    ok('Tabla D.1 completa y monotónica para cada escala', tblErr.length === 0, tblErr.join(' | '));

    var monoErr = [];
    Object.keys(NORMS.rawToBR).forEach(function (c) {
      var t = NORMS.rawToBR[c];
      for (var i = 1; i < t.length; i++) if (t[i] < t[i - 1]) monoErr.push(c + '@' + i);
    });
    ok('D.1 no decreciente', monoErr.length === 0, monoErr.join(', '));

    /* 6. Facetas: 45, tabla D.4 con maxRaw + 1 entradas */
    ok('45 facetas de Grossman', FACETS.length === 45, FACETS.length + ' facetas');
    var fErr = [];
    FACETS.forEach(function (f) {
      var n = NORMS.facetNorms[f.code];
      if (!n) { fErr.push(f.code + ': sin baremo'); return; }
      if (n.length !== f.items.length + 1) {
        fErr.push(f.code + ': baremo ' + n.length + ' ≠ ítems+1 ' + (f.items.length + 1));
      }
    });
    ok('Baremos D.4 alineados con el nº de ítems de cada faceta', fErr.length === 0, fErr.join(' | '));

    var fParent = FACETS.filter(function (f) {
      return !SCALES.some(function (s) { return s.code === f.parent; });
    });
    ok('Cada faceta apunta a una escala existente', fParent.length === 0,
       fParent.map(function (f) { return f.code; }).join(', '));

    /* 7. Índices de validez */
    ok('Escala V: 3 ítems', VAL.V.items.length === 3);
    ok('Escala W: 25 pares', VAL.W.pairs.length === 25, VAL.W.pairs.length + ' pares');
    var wFlat = [];
    VAL.W.pairs.forEach(function (p) { wFlat.push(p[0], p[1]); });
    ok('Escala W: 50 ítems distintos (sin repetición)',
       new Set(wFlat).size === 50, new Set(wFlat).size + ' únicos');
    ok('Escala X: 121 ítems', VAL.X.items.length === 121, VAL.X.items.length + ' ítems');
    ok('Escala Y: 24 ítems', VAL.Y.items.length === 24, VAL.Y.items.length + ' ítems');
    ok('Escala Z: 30 ítems', VAL.Z.items.length === 30, VAL.Z.items.length + ' ítems');

    /* 8. X debe ser la unión exacta de los ítems de 1–8B */
    var union = {};
    SCALES.filter(function (s) { return s.group === 'personalidad'; })
      .forEach(function (s) { s.items.forEach(function (x) { union[Math.abs(x)] = true; }); });
    var unionArr = Object.keys(union).map(Number).sort(function (a, b) { return a - b; });
    var xArr = VAL.X.items.slice().sort(function (a, b) { return a - b; });
    ok('Escala X = unión de los ítems de las escalas 1–8B',
       JSON.stringify(unionArr) === JSON.stringify(xArr),
       'unión ' + unionArr.length + ' vs X ' + xArr.length);

    /* 9. Baremos de los índices modificadores */
    ok('D.3 · escala Y: 25 filas (PD 0–24)', NORMS.yRawToBR.length === 25);
    ok('D.3 · escala Z: 31 filas (PD 0–30)', NORMS.zRawToBR.length === 31);
    ok('D.3 · escala X: PD < 7 sin TB', NORMS.xRawToBR[6] === null && NORMS.xRawToBR[7] === 0);
    ok('D.3 · escala X: PD 99–114 → TB 100', NORMS.xRawToBR[99] === 100 && NORMS.xRawToBR[114] === 100);

    /* 10. D.2 completa para las 25 escalas */
    var pctErr = [];
    SCALES.forEach(function (s) {
      var p = NORMS.brToPct[s.code];
      if (!p || p.length !== 116) { pctErr.push(s.code); return; }
      for (var i = 1; i < 116; i++) if (p[i] < p[i - 1]) pctErr.push(s.code + '@' + i);
    });
    ok('Tabla D.2 (TB → percentil) completa y no decreciente', pctErr.length === 0, pctErr.join(', '));

    /* 11. Prueba funcional del motor: protocolo todo-Falso y todo-Verdadero */
    var allFalse = new Array(195).fill(false);
    var allTrue = new Array(195).fill(true);
    var rF = global.MCMI_SCORING.score(allFalse, { adjustments: false });
    var rT = global.MCMI_SCORING.score(allTrue, { adjustments: false });

    ok('Protocolo todo-Falso: X = 0 y se marca inválido',
       rF.validity.X.raw === 0 && rF.status.invalid,
       'X=' + rF.validity.X.raw);
    ok('Protocolo todo-Verdadero: X = 121 y se marca inválido',
       rT.validity.X.raw === 121 && rT.status.invalid,
       'X=' + rT.validity.X.raw);
    ok('Protocolo todo-Verdadero: V = 3 (los 3 ítems improbables)',
       rT.validity.V.raw === 3);
    ok('Protocolo homogéneo: W = 0 (ningún par discordante)',
       rT.validity.W.raw === 0 && rF.validity.W.raw === 0);

    var rangeErr = [];
    Object.keys(rT.scales).forEach(function (c) {
      var s = rT.scales[c];
      if (s.raw < 0 || s.raw > s.maxRaw) rangeErr.push(c + ' PD=' + s.raw);
      if (s.br < 0 || s.br > 115) rangeErr.push(c + ' TB=' + s.br);
    });
    Object.keys(rF.scales).forEach(function (c) {
      var s = rF.scales[c];
      if (s.raw < 0 || s.raw > s.maxRaw) rangeErr.push(c + ' PD=' + s.raw);
    });
    ok('Puntuaciones dentro de rango en protocolos extremos', rangeErr.length === 0, rangeErr.join(', '));

    /* 12. Cobertura: ítems que no puntúan en ninguna escala ni índice */
    var used = {};
    SCALES.forEach(function (s) { s.items.forEach(function (x) { used[Math.abs(x)] = true; }); });
    ['V', 'X', 'Y', 'Z'].forEach(function (k) { VAL[k].items.forEach(function (x) { used[Math.abs(x)] = true; }); });
    global.MCMI_SIGNIFICANT.forEach(function (c) { c.items.forEach(function (n) { used[n] = true; }); });
    var orphan = [];
    for (var i = 1; i <= 195; i++) if (!used[i]) orphan.push(i);
    ok('Todos los ítems contribuyen a alguna escala, índice o categoría', orphan.length === 0,
       orphan.length ? 'huérfanos: ' + orphan.join(', ') : '');

    var passed = checks.filter(function (c) { return c.pass; }).length;
    return { checks: checks, passed: passed, total: checks.length, allPass: passed === checks.length };
  }

  global.MCMI_SELFTEST = { run: run };
})(window);
