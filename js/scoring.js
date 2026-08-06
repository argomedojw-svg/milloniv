/* ==========================================================================
   MCMI-IV — Motor de corrección
   Implementa el procedimiento del capítulo 2 del manual:
     1. Puntuaciones directas ponderadas (prototípico = 2, no prototípico = 1)
     2. Conversión a tasas base (Anexo D.1 / D.3 / D.4)
     3. Ajuste por escala X (Sinceridad)
     4. Ajuste por escalas A (Ansiedad) y CC (Depresión mayor)
     5. Percentiles (Anexo D.2)
     6. Reglas de inventario impuntuable, escala impuntuable y perfil inválido
     7. Código de puntuaciones máximas y respuestas significativas

   NOTA DE TRANSPARENCIA
   ---------------------
   El manual español describe la DIRECCIÓN de los ajustes por X y por A/CC
   pero NO publica las tablas numéricas (son propiedad del corrector online de
   Pearson). Los pasos 3 y 4 usan por tanto un modelo explícito y auditable,
   definido en CONFIG.adjustments, que respeta las reglas publicadas:
     · X < 21  → incrementa TB de 1–P y A–PP
     · X > 60  → decrementa TB de 1–P y A–PP
     · Σ(A−75)+(CC−75) → decrementa TB de 2B, 8B, C, 2A y S
   Ambos ajustes son desactivables y el informe muestra siempre la TB sin
   ajustar junto a la ajustada.
   ========================================================================== */
(function (global) {
  'use strict';

  var SCALES = global.MCMI_SCALES;
  var FACETS = global.MCMI_FACETS;
  var VAL = global.MCMI_VALIDITY;
  var NORMS = global.MCMI_NORMS;
  var SIGNIF = global.MCMI_SIGNIFICANT;

  var CONFIG = {
    /* Imputación de ítems omitidos (1–4 por escala).
       'none'  → no puntúan (opción por defecto, conservadora y auditable)
       El manual imputa «la respuesta típica de la muestra de tipificación»,
       vector que no se publica. */
    imputation: 'none',

    adjustments: {
      enabled: true,
      /* Ajuste por Sinceridad (escala X). */
      x: {
        lowThreshold: 21,   // por debajo → el sujeto minimiza  → subir TB
        highThreshold: 60,  // por encima → el sujeto exagera   → bajar TB
        lowSlope: 1.0,      // puntos de TB por punto directo de desviación
        highSlope: 0.26,
        cap: 14             // máximo de puntos de TB desplazados
      },
      /* Ajuste por Ansiedad / Depresión mayor. */
      acc: {
        anchor: 75,         // TB a partir de la cual se acumula el exceso
        sumCap: 40,
        slope: 0.35,
        weights: { '2B': 1.00, '8B': 0.90, 'C': 0.80, '2A': 0.70, 'S': 0.60 }
      }
    },

    thresholds: { style: 60, type: 75, disorder: 85 }
  };

  /* ------------------------------------------------------------------ */
  /* Utilidades                                                          */
  /* ------------------------------------------------------------------ */

  function clampBR(v) { return Math.max(0, Math.min(115, Math.round(v))); }

  function itemAnswered(answers, n) {
    var a = answers[n - 1];
    return a === true || a === false;
  }

  /* Devuelve true si la respuesta coincide con la clave del ítem firmado. */
  function itemScores(answers, signed) {
    var n = Math.abs(signed);
    var a = answers[n - 1];
    if (a !== true && a !== false) return false;
    return signed > 0 ? a === true : a === false;
  }

  function missingIn(answers, signedItems) {
    var m = [];
    for (var i = 0; i < signedItems.length; i++) {
      var n = Math.abs(signedItems[i]);
      if (!itemAnswered(answers, n)) m.push(n);
    }
    return m;
  }

  /* ------------------------------------------------------------------ */
  /* Índices de validez                                                  */
  /* ------------------------------------------------------------------ */

  function scoreValidity(answers) {
    var out = {};

    // V — Invalidez
    var vRaw = 0, vItems = [];
    VAL.V.items.forEach(function (n) {
      if (answers[n - 1] === true) { vRaw++; vItems.push(n); }
    });
    out.V = { raw: vRaw, endorsed: vItems, max: VAL.V.maxRaw };
    out.V.classification = vRaw === 0 ? 'Aceptable' : (vRaw === 1 ? 'Cuestionable' : 'Inválido');

    // W — Inconsistencia
    var wRaw = 0, wPairs = [];
    VAL.W.pairs.forEach(function (p) {
      var a = answers[p[0] - 1], b = answers[p[1] - 1];
      if ((a === true || a === false) && (b === true || b === false) && a !== b) {
        wRaw++; wPairs.push(p);
      }
    });
    out.W = { raw: wRaw, discordant: wPairs, max: VAL.W.maxRaw };
    out.W.classification = wRaw <= 8 ? 'Aceptable' : (wRaw <= 19 ? 'Cuestionable' : 'Inválido');

    // X — Sinceridad (nº de respuestas V entre los 121 ítems de 1–8B)
    var xRaw = 0;
    VAL.X.items.forEach(function (n) { if (answers[n - 1] === true) xRaw++; });
    out.X = { raw: xRaw, max: VAL.X.maxRaw, br: NORMS.xRawToBR[xRaw] };
    if (xRaw < 7) out.X.classification = 'Inválido (minimización extrema)';
    else if (xRaw <= 20) out.X.classification = 'Posible minimización de los síntomas';
    else if (xRaw <= 60) out.X.classification = 'Aceptable';
    else if (xRaw <= 114) out.X.classification = 'Posible exageración de los síntomas';
    else out.X.classification = 'Inválido (exageración extrema)';

    // Y — Deseabilidad social
    var yRaw = 0;
    VAL.Y.items.forEach(function (s) { if (itemScores(answers, s)) yRaw++; });
    out.Y = { raw: yRaw, max: VAL.Y.maxRaw, br: NORMS.yRawToBR[yRaw] };

    // Z — Devaluación
    var zRaw = 0;
    VAL.Z.items.forEach(function (s) { if (itemScores(answers, s)) zRaw++; });
    out.Z = { raw: zRaw, max: VAL.Z.maxRaw, br: NORMS.zRawToBR[zRaw] };

    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Escalas principales                                                 */
  /* ------------------------------------------------------------------ */

  function scoreScales(answers) {
    var result = {};
    SCALES.forEach(function (sc) {
      var protoSet = {};
      sc.proto.forEach(function (n) { protoSet[n] = true; });

      var raw = 0;
      sc.items.forEach(function (signed) {
        if (itemScores(answers, signed)) raw += protoSet[Math.abs(signed)] ? 2 : 1;
      });

      var missing = missingIn(answers, sc.items);
      var unscorable = missing.length >= 5;
      var table = NORMS.rawToBR[sc.code];
      var br = table[Math.min(raw, table.length - 1)];

      result[sc.code] = {
        code: sc.code, name: sc.name, group: sc.group,
        raw: raw, maxRaw: sc.maxRaw,
        brUnadjusted: br, br: br,
        missing: missing, unscorable: unscorable,
        adjustments: []
      };
    });
    return result;
  }

  /* ------------------------------------------------------------------ */
  /* Ajustes                                                             */
  /* ------------------------------------------------------------------ */

  function applyXAdjustment(scales, validity) {
    var cfg = CONFIG.adjustments.x;
    var raw = validity.X.raw, delta = 0;

    if (raw < cfg.lowThreshold) {
      delta = Math.min(cfg.cap, Math.round((cfg.lowThreshold - raw) * cfg.lowSlope));
    } else if (raw > cfg.highThreshold) {
      delta = -Math.min(cfg.cap, Math.round((raw - cfg.highThreshold) * cfg.highSlope));
    }
    if (delta === 0) return { applied: false, delta: 0 };

    Object.keys(scales).forEach(function (code) {
      var s = scales[code];
      s.br = clampBR(s.br + delta);
      s.adjustments.push({ source: 'X', delta: delta });
    });
    return { applied: true, delta: delta, xRaw: raw };
  }

  function applyACCAdjustment(scales, opts) {
    var cfg = CONFIG.adjustments.acc;
    var brA = scales.A.br, brCC = scales.CC.br;
    var excess = Math.max(0, brA - cfg.anchor) + Math.max(0, brCC - cfg.anchor);
    if (excess <= 0) return { applied: false, excess: 0, details: {} };

    var base = Math.min(excess, cfg.sumCap) * cfg.slope;
    var details = {};
    Object.keys(cfg.weights).forEach(function (code) {
      var d = -Math.round(base * cfg.weights[code]);
      if (d === 0 || !scales[code]) return;
      scales[code].br = clampBR(scales[code].br + d);
      scales[code].adjustments.push({ source: 'A/CC', delta: d });
      details[code] = d;
    });
    return { applied: true, excess: excess, details: details };
  }

  /* ------------------------------------------------------------------ */
  /* Facetas de Grossman                                                 */
  /* ------------------------------------------------------------------ */

  function scoreFacets(answers, scales) {
    return FACETS.map(function (f) {
      var raw = 0;
      f.items.forEach(function (signed) { if (itemScores(answers, signed)) raw++; });
      var missing = missingIn(answers, f.items);
      var norm = NORMS.facetNorms[f.code];
      var idx = Math.min(raw, norm.length - 1);
      return {
        code: f.code, parent: f.parent, name: f.name,
        raw: raw, maxRaw: f.items.length,
        br: norm[idx][0], pct: norm[idx][1],
        missing: missing,
        unscorable: missing.length >= 5,
        parentBR: scales[f.parent] ? scales[f.parent].br : null
      };
    });
  }

  /* ------------------------------------------------------------------ */
  /* Respuestas significativas                                           */
  /* ------------------------------------------------------------------ */

  function scoreSignificant(answers) {
    return SIGNIF.map(function (cat) {
      var endorsed = cat.items.filter(function (n) { return answers[n - 1] === true; });
      return {
        name: cat.name, min: cat.min, priority: !!cat.priority, note: cat.note || '',
        endorsed: endorsed, count: endorsed.length,
        total: cat.items.length,
        flagged: endorsed.length >= cat.min
      };
    });
  }

  /* ------------------------------------------------------------------ */
  /* Corrección completa                                                 */
  /* ------------------------------------------------------------------ */

  function score(answers, options) {
    options = options || {};
    var useAdjust = options.adjustments !== undefined
      ? options.adjustments : CONFIG.adjustments.enabled;

    var missingAll = [];
    for (var i = 1; i <= 195; i++) if (!itemAnswered(answers, i)) missingAll.push(i);

    var validity = scoreValidity(answers);
    var scales = scoreScales(answers);

    var adjInfo = { x: { applied: false, delta: 0 }, acc: { applied: false, excess: 0 } };
    if (useAdjust) {
      adjInfo.x = applyXAdjustment(scales, validity);
      adjInfo.acc = applyACCAdjustment(scales);
    }

    // Percentiles sobre la TB ajustada
    Object.keys(scales).forEach(function (code) {
      scales[code].pct = NORMS.brToPct[code][clampBR(scales[code].br)];
    });

    var facets = scoreFacets(answers, scales);

    /* --- Reglas de puntuabilidad y validez (cap. 2 del manual) --- */
    var unscorableInventory = missingAll.length >= 14;
    var unscorableScales = Object.keys(scales).filter(function (c) { return scales[c].unscorable; });

    var personalityCodes = SCALES.filter(function (s) {
      return s.group === 'personalidad';
    }).map(function (s) { return s.code; });
    var allBelow60 = personalityCodes.every(function (c) { return scales[c].br < 60; });

    var invalidReasons = [];
    if (validity.V.raw > 1) invalidReasons.push('La puntuación directa de la escala V (Invalidez) es ' + validity.V.raw + ' (> 1): probable respuesta aleatoria.');
    if (validity.W.raw > 19) invalidReasons.push('La puntuación directa de la escala W (Inconsistencia) es ' + validity.W.raw + ' (> 19): respuestas contradictorias en pares de contenido similar.');
    if (validity.X.raw < 7) invalidReasons.push('La puntuación directa de la escala X (Sinceridad) es ' + validity.X.raw + ' (< 7): minimización extrema de los síntomas.');
    if (validity.X.raw > 114) invalidReasons.push('La puntuación directa de la escala X (Sinceridad) es ' + validity.X.raw + ' (> 114): exageración extrema de los síntomas.');
    if (allBelow60) invalidReasons.push('Todas las tasas base de las escalas 1 a 8B son inferiores a 60: los datos no reflejan un patrón de personalidad claro.');

    var unscorableReasons = [];
    if (missingAll.length >= 14) unscorableReasons.push('Hay ' + missingAll.length + ' ítems sin respuesta o con doble marca (≥ 14).');
    if (unscorableScales.length) unscorableReasons.push('Escalas con 5 o más ítems sin respuesta: ' + unscorableScales.join(', ') + '.');

    var questionable = [];
    if (validity.V.raw === 1) questionable.push('Escala V = 1: protocolo cuestionable por posible respuesta aleatoria.');
    if (validity.W.raw >= 9 && validity.W.raw <= 19) questionable.push('Escala W = ' + validity.W.raw + ': protocolo cuestionable por inconsistencia (rango 9–19).');
    if (validity.X.raw >= 7 && validity.X.raw <= 20) questionable.push('Escala X = ' + validity.X.raw + ': posible minimización de los síntomas.');
    if (validity.X.raw >= 61 && validity.X.raw <= 114) questionable.push('Escala X = ' + validity.X.raw + ': posible exageración de los síntomas.');
    if (validity.Y.br >= 75) questionable.push('Escala Y (Deseabilidad social) TB = ' + validity.Y.br + ' (≥ 75): tendencia a ofrecer una imagen positiva de sí mismo.');
    if (validity.Z.br >= 75) questionable.push('Escala Z (Devaluación) TB = ' + validity.Z.br + ' (≥ 75): tendencia a menospreciarse o a una petición de ayuda.');

    /* --- Código de puntuaciones máximas: 3 escalas más altas de 1–8B con TB ≥ 60 --- */
    var maxCode = personalityCodes
      .map(function (c) { return scales[c]; })
      .filter(function (s) { return s.br >= 60; })
      .sort(function (a, b) { return b.br - a.br; })
      .slice(0, 3);

    /* --- Tres escalas de personalidad (1–P) más altas: base de las facetas --- */
    var allPersonality = SCALES.filter(function (s) {
      return s.group === 'personalidad' || s.group === 'patologiaGrave';
    }).map(function (s) { return scales[s.code]; });

    var topPersonality = allPersonality.slice()
      .filter(function (s) { return s.br >= 60; })
      .sort(function (a, b) { return b.br - a.br; })
      .slice(0, 3);

    return {
      answers: answers.slice(),
      missing: missingAll,
      validity: validity,
      scales: scales,
      facets: facets,
      significant: scoreSignificant(answers),
      adjustmentInfo: adjInfo,
      adjustmentsEnabled: useAdjust,
      maxCode: maxCode,
      topPersonality: topPersonality,
      status: {
        unscorable: unscorableInventory || unscorableScales.length > 0,
        unscorableInventory: unscorableInventory,
        unscorableScales: unscorableScales,
        unscorableReasons: unscorableReasons,
        invalid: invalidReasons.length > 0,
        invalidReasons: invalidReasons,
        questionable: questionable
      },
      config: JSON.parse(JSON.stringify(CONFIG))
    };
  }

  global.MCMI_SCORING = { score: score, CONFIG: CONFIG, clampBR: clampBR };
})(window);
