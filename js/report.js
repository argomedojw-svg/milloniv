/* ==========================================================================
   MCMI-IV — Generación del informe interpretativo
   Sigue la secuencia de tres fases del capítulo 4 del manual:
     Fase 1 · Validez, respuestas significativas y estilo de respuesta
     Fase 2 · Elevaciones por separado, en conjunto y su configuración
     Fase 3 · Integración con datos adicionales y conclusiones
   ========================================================================== */
(function (global) {
  'use strict';

  var I = global.MCMI_INTERPRET;
  var GROUPS = global.MCMI_GROUP_LABELS;
  var SCALES = global.MCMI_SCALES;
  var ITEMS = global.MCMI_ITEMS;

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scaleLabel(code) {
    var s = SCALES.filter(function (x) { return x.code === code; })[0];
    return s ? code + ' ' + s.name : code;
  }

  /* ------------------------------------------------------------------ */
  /* Gráfico de perfil (SVG)                                             */
  /* ------------------------------------------------------------------ */
  function profileChart(result, groupKeys, title) {
    var rows = SCALES.filter(function (s) { return groupKeys.indexOf(s.group) >= 0; })
      .map(function (s) { return result.scales[s.code]; });

    var rowH = 26, padL = 176, padR = 56, padT = 34, padB = 26;
    var w = 760, plotW = w - padL - padR;
    var h = padT + rows.length * rowH + padB;
    var x = function (br) { return padL + (Math.max(0, Math.min(115, br)) / 115) * plotW; };

    var svg = ['<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(title) + '">'];
    svg.push('<title>' + esc(title) + '</title>');

    // Bandas de fondo
    svg.push('<rect x="' + x(0) + '" y="' + padT + '" width="' + (x(60) - x(0)) + '" height="' + (rows.length * rowH) + '" class="band band-0"/>');
    svg.push('<rect x="' + x(60) + '" y="' + padT + '" width="' + (x(75) - x(60)) + '" height="' + (rows.length * rowH) + '" class="band band-1"/>');
    svg.push('<rect x="' + x(75) + '" y="' + padT + '" width="' + (x(85) - x(75)) + '" height="' + (rows.length * rowH) + '" class="band band-2"/>');
    svg.push('<rect x="' + x(85) + '" y="' + padT + '" width="' + (x(115) - x(85)) + '" height="' + (rows.length * rowH) + '" class="band band-3"/>');

    [0, 60, 75, 85, 115].forEach(function (t) {
      svg.push('<line class="grid' + (t === 75 || t === 85 ? ' grid-key' : '') + '" x1="' + x(t) + '" y1="' + padT + '" x2="' + x(t) + '" y2="' + (padT + rows.length * rowH) + '"/>');
      svg.push('<text class="axis" x="' + x(t) + '" y="' + (padT - 12) + '" text-anchor="middle">' + t + '</text>');
    });

    rows.forEach(function (s, i) {
      var y = padT + i * rowH;
      var cls = I.BAND_CLASS[I.band(s.br, s.group)];
      svg.push('<text class="lbl" x="' + (padL - 10) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end">' +
        esc(s.code + ' · ' + s.name) + '</text>');
      svg.push('<rect class="bar ' + cls + '" x="' + x(0) + '" y="' + (y + 5) + '" width="' +
        Math.max(1, x(s.br) - x(0)) + '" height="' + (rowH - 12) + '" rx="3"><title>' +
        esc(s.name + ': TB ' + s.br + ', percentil ' + s.pct) + '</title></rect>');
      svg.push('<text class="val" x="' + (x(s.br) + 7) + '" y="' + (y + rowH / 2 + 4) + '">' + s.br + '</text>');
    });

    svg.push('</svg>');
    return svg.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Tabla de puntuaciones                                               */
  /* ------------------------------------------------------------------ */
  function scoreTable(result, groupKey) {
    var rows = SCALES.filter(function (s) { return s.group === groupKey; });
    var html = ['<table class="tbl"><thead><tr>',
      '<th>Escala</th><th class="num">PD</th><th class="num">PD máx.</th>',
      '<th class="num">TB sin ajustar</th><th class="num">TB ajustada</th>',
      '<th class="num">Percentil</th><th>Nivel</th></tr></thead><tbody>'];
    rows.forEach(function (def) {
      var s = result.scales[def.code];
      var b = I.band(s.br, s.group);
      html.push('<tr class="' + I.BAND_CLASS[b] + '-row">' +
        '<td><strong>' + esc(s.code) + '</strong> ' + esc(s.name) +
        (s.unscorable ? ' <span class="warn-inline">impuntuable</span>' : '') + '</td>' +
        '<td class="num">' + s.raw + '</td>' +
        '<td class="num muted">' + s.maxRaw + '</td>' +
        '<td class="num muted">' + s.brUnadjusted + '</td>' +
        '<td class="num strong">' + s.br + '</td>' +
        '<td class="num">' + s.pct + '</td>' +
        '<td><span class="pill ' + I.BAND_CLASS[b] + '">' + esc(I.BAND_LABEL[b]) + '</span></td></tr>');
    });
    html.push('</tbody></table>');
    return html.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Fase 1 — Validez                                                    */
  /* ------------------------------------------------------------------ */
  function validitySection(result) {
    var v = result.validity, st = result.status;
    var h = ['<section class="rep-section"><h2>Fase 1 · Validez del protocolo y circunstancias especiales</h2>'];

    if (st.unscorable) {
      h.push('<div class="alert alert-danger"><h3>Inventario impuntuable</h3><ul>' +
        st.unscorableReasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') +
        '</ul><p>Según el capítulo 2 del manual, no puede garantizarse la validez de las puntuaciones. ' +
        'Si se recuperan las respuestas que faltan, el inventario vuelve a ser puntuable.</p></div>');
    }
    if (st.invalid) {
      h.push('<div class="alert alert-danger"><h3>Resultados inválidos</h3><ul>' +
        st.invalidReasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') +
        '</ul><p>Cuando los resultados son inválidos <strong>no debe llevarse a cabo la interpretación del perfil</strong>. ' +
        'El manual recomienda investigar la causa y, si procede, volver a aplicar el inventario pidiendo al sujeto ' +
        'que responda con la mayor sinceridad posible.</p></div>');
    }
    if (!st.unscorable && !st.invalid) {
      h.push('<div class="alert alert-ok"><h3>Protocolo puntuable e interpretable</h3>' +
        '<p>No concurre ninguno de los criterios de inventario impuntuable ni de resultado inválido ' +
        'descritos en el capítulo 2 del manual.</p></div>');
    }
    if (st.questionable.length) {
      h.push('<div class="alert alert-warn"><h3>Advertencias sobre el estilo de respuesta</h3><ul>' +
        st.questionable.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>');
    }

    h.push('<table class="tbl"><thead><tr><th>Índice</th><th class="num">PD</th><th class="num">TB</th>' +
      '<th>Clasificación / lectura</th></tr></thead><tbody>');
    h.push('<tr><td><strong>V</strong> Invalidez</td><td class="num">' + v.V.raw + '</td><td class="num muted">—</td><td>' +
      esc(v.V.classification) + (v.V.endorsed.length ? ' · ítems afirmados: ' + v.V.endorsed.join(', ') : '') + '</td></tr>');
    h.push('<tr><td><strong>W</strong> Inconsistencia</td><td class="num">' + v.W.raw + '</td><td class="num muted">—</td><td>' +
      esc(v.W.classification) + ' (aceptable 0–8 · cuestionable 9–19 · inválido ≥ 20)</td></tr>');
    h.push('<tr><td><strong>X</strong> Sinceridad</td><td class="num">' + v.X.raw + '</td><td class="num">' +
      (v.X.br === null ? '—' : v.X.br) + '</td><td>' + esc(v.X.classification) + '</td></tr>');
    h.push('<tr><td><strong>Y</strong> Deseabilidad social</td><td class="num">' + v.Y.raw + '</td><td class="num">' + v.Y.br + '</td><td>' +
      (v.Y.br >= 75 ? 'TB ≥ 75: tendencia a mostrar una imagen de sí mismo positiva e interesante; cuanto más alta, más probable que haya ocultado dificultades psicológicas o interpersonales.' : 'Dentro del rango esperable.') + '</td></tr>');
    h.push('<tr><td><strong>Z</strong> Devaluación</td><td class="num">' + v.Z.raw + '</td><td class="num">' + v.Z.br + '</td><td>' +
      (v.Z.br >= 75 ? 'TB ≥ 75: tendencia a menospreciarse manifestando más problemas de los que un análisis posterior pueda reflejar, o bien petición de ayuda ante un malestar intenso.' : 'Dentro del rango esperable.') + '</td></tr>');
    h.push('</tbody></table>');

    // Configuración X/Y/Z (cap. 4)
    var cfgMsg = null;
    if (v.X.raw <= 20 && v.Y.br < 75 && v.Z.br >= 75) {
      cfgMsg = 'Puntuaciones bajas en X e Y con Z alta: sugiere una exageración moderada de problemas emocionales actuales, probablemente ya resueltos en buena medida. El manual indica que esta configuración no afecta a la validez interpretativa.';
    } else if (v.X.raw <= 20 && v.Y.br >= 75 && v.Z.br >= 75) {
      cfgMsg = 'X baja con Y y Z altas: el sujeto ha respondido afirmativamente a ítems que reflejan síntomas y características antitéticas. Esta configuración debe hacer dudar de la validez del perfil; puede darse en trastornos depresivos graves acompañados de agitación.';
    } else if (v.X.raw <= 20 && v.Y.br >= 75) {
      cfgMsg = 'X baja con Y alta: patrón compatible con un perfil «falseado-bueno». Los estudios previos señalan que estos sujetos tienden a elevar Dependiente, Narcisista y Compulsivo sin elevar las escalas centradas en síntomas. Distinguir un falseamiento de un perfil válido con esos rasgos reales requiere datos externos.';
    } else if (v.X.raw > 60 && v.Z.br >= 75) {
      cfgMsg = 'X y Z elevadas: patrón compatible con un perfil de «petición de ayuda», en el que el estilo de respuesta hace parecer al sujeto más alterado psicológicamente de lo que realmente está. Suele acompañarse de elevaciones en las escalas de patología grave.';
    }
    if (cfgMsg) h.push('<p class="note"><strong>Configuración de los índices modificadores.</strong> ' + esc(cfgMsg) + '</p>');

    if (result.adjustmentsEnabled) {
      var a = result.adjustmentInfo;
      var bits = [];
      if (a.x.applied) {
        bits.push('Ajuste por <strong>X (Sinceridad)</strong>: PD = ' + a.x.xRaw + ' → ' +
          (a.x.delta > 0 ? '+' : '') + a.x.delta + ' puntos de TB en todas las escalas 1–P y A–PP.');
      } else {
        bits.push('Ajuste por <strong>X (Sinceridad)</strong>: no procede (PD dentro del rango 21–60).');
      }
      if (a.acc.applied) {
        var det = Object.keys(a.acc.details).map(function (c) {
          return scaleLabel(c) + ' ' + a.acc.details[c];
        }).join(' · ');
        bits.push('Ajuste por <strong>A / CC</strong>: exceso acumulado sobre TB 75 = ' + a.acc.excess +
          ' → ' + esc(det) + '.');
      } else {
        bits.push('Ajuste por <strong>A / CC</strong>: no procede (ni A ni CC superan TB 75).');
      }
      h.push('<div class="note"><p><strong>Ajustes aplicados.</strong></p><ul><li>' + bits.join('</li><li>') + '</li></ul></div>');
    } else {
      h.push('<p class="note"><strong>Ajustes desactivados.</strong> Se muestran las tasas base directas, sin corrección por X ni por A/CC.</p>');
    }

    if (result.missing.length) {
      h.push('<p class="note"><strong>Ítems sin respuesta (' + result.missing.length + '):</strong> ' +
        result.missing.join(', ') + '. Con la opción actual, los ítems omitidos no puntúan.</p>');
    }

    h.push('</section>');
    return h.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Respuestas significativas                                           */
  /* ------------------------------------------------------------------ */
  function significantSection(result) {
    var flagged = result.significant.filter(function (c) { return c.flagged; });
    var h = ['<section class="rep-section"><h2>Respuestas significativas</h2>',
      '<p class="lead">Ítems cuya respuesta afirmativa alerta de contenidos que requieren atención especial ' +
      'al interpretar o que pueden exigir intervención clínica inmediata (Anexo B).</p>'];

    if (!flagged.length) {
      h.push('<p class="note">Ninguna categoría alcanza el número mínimo de respuestas afirmativas requerido.</p>');
    } else {
      var priority = flagged.filter(function (c) { return c.priority; });
      if (priority.length) {
        h.push('<div class="alert alert-danger"><h3>Atención clínica prioritaria</h3><ul>');
        priority.forEach(function (c) {
          h.push('<li><strong>' + esc(c.name) + '</strong> — ' + c.count + ' de ' + c.total +
            ' ítems afirmados (mínimo ' + c.min + '): ' + c.endorsed.join(', ') +
            (c.note ? '. ' + esc(c.note) : '') + '</li>');
        });
        h.push('</ul></div>');
      }
      h.push('<table class="tbl"><thead><tr><th>Categoría</th><th class="num">Afirmados</th>' +
        '<th class="num">Mínimo</th><th>Ítems</th></tr></thead><tbody>');
      flagged.forEach(function (c) {
        h.push('<tr class="' + (c.priority ? 'sev-3-row' : 'sev-1-row') + '"><td><strong>' + esc(c.name) + '</strong>' +
          (c.note ? '<br><span class="muted small">' + esc(c.note) + '</span>' : '') + '</td>' +
          '<td class="num strong">' + c.count + '</td><td class="num muted">' + c.min + '</td>' +
          '<td class="small">' + c.endorsed.join(', ') + '</td></tr>');
      });
      h.push('</tbody></table>');
    }

    var notFlagged = result.significant.filter(function (c) { return !c.flagged && c.count > 0; });
    if (notFlagged.length) {
      h.push('<details><summary>Categorías con respuestas afirmativas por debajo del umbral (' + notFlagged.length + ')</summary><ul class="plain">');
      notFlagged.forEach(function (c) {
        h.push('<li>' + esc(c.name) + ': ' + c.count + '/' + c.min + ' — ítems ' + c.endorsed.join(', ') + '</li>');
      });
      h.push('</ul></details>');
    }
    h.push('</section>');
    return h.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Fase 2 — Escalas de personalidad                                    */
  /* ------------------------------------------------------------------ */
  function scaleNarrative(result, s) {
    var b = I.band(s.br, s.group);
    var h = ['<article class="scale-card ' + I.BAND_CLASS[b] + '-row">'];
    h.push('<header><h3>' + esc(s.code + ' · ' + s.name) + '</h3>' +
      '<span class="pill ' + I.BAND_CLASS[b] + '">' + esc(I.BAND_LABEL[b]) + '</span></header>');
    h.push('<p class="metrics">PD ' + s.raw + '/' + s.maxRaw + ' · TB sin ajustar ' + s.brUnadjusted +
      ' · <strong>TB ' + s.br + '</strong> · percentil ' + s.pct + '</p>');

    if (I.SPECTRUM[s.code]) {
      var sp = I.SPECTRUM[s.code];
      var level = b === 'trastorno' ? sp.disorder : (b === 'tipo' ? sp.abnormal : sp.normal);
      h.push('<p><strong>Espectro evolutivo (tabla 3.1):</strong> ' + esc(sp.normal) + ' → ' +
        esc(sp.abnormal) + ' → ' + esc(sp.disorder) +
        '. En esta elevación el manual sitúa el funcionamiento en el nivel <em>' + esc(level) + '</em>.</p>');
    }
    h.push('<p>' + esc(I.DESCRIPTIONS[s.code] || '') + '</p>');
    h.push('<p class="interp">' + esc(I.elevationSentence(s)) + '</p>');

    if (I.POLARITIES[s.code]) {
      var p = I.POLARITIES[s.code];
      h.push('<p class="small muted"><strong>Polaridades (tabla 4.1):</strong> ' +
        'Existencia placer-dolor ' + esc(p.existencia) + ' · Adaptación pasivo-activo ' + esc(p.adaptacion) +
        ' · Replicación uno mismo-otros ' + esc(p.replicacion) + '.</p>');
    }
    if (I.DOMAINS[s.code]) {
      var d = I.DOMAINS[s.code];
      h.push('<details><summary>Dominios funcionales y estructurales (tabla 3.3)</summary><ul class="plain small">');
      I.DOMAIN_LABELS.forEach(function (lab, i) {
        h.push('<li><strong>' + esc(lab) + ':</strong> ' + esc(d[i]) + '</li>');
      });
      h.push('</ul></details>');
    }

    if (I.CURVILINEAR.indexOf(s.code) >= 0 && s.br >= 60 && s.br < 85) {
      h.push('<p class="note small">El manual advierte que las escalas 4A, 5 y 7 tienen una relación ' +
        'curvilínea con la patología: en niveles moderados pueden reflejar puntos fuertes ' +
        '(sociabilidad, autoestima, prudencia) en lugar de patología. Cuanto más alta es la TB, ' +
        'más probable es la lectura patológica; la presencia de síndromes clínicos elevados o de ' +
        'patología grave de la personalidad apoya la lectura patológica.</p>');
    }
    h.push('</article>');
    return h.join('');
  }

  function personalitySection(result) {
    var h = ['<section class="rep-section"><h2>Fase 2 · Análisis de las elevaciones y su configuración</h2>'];

    // 2.1 Patología grave primero (orden que prescribe el manual)
    var severe = ['S', 'C', 'P'].map(function (c) { return result.scales[c]; });
    var severeElev = severe.filter(function (s) { return s.br >= 60; })
      .sort(function (a, b) { return b.br - a.br; });

    h.push('<h3 class="sub">1 · Patología grave de la personalidad (S, C, P)</h3>');
    if (!severeElev.length) {
      h.push('<p class="note">Ninguna escala de patología grave alcanza TB 60. El manual permite omitir este paso: ' +
        'las elevaciones inferiores a 60 pueden ser ideográficamente útiles pero no se consideran fiables ni ' +
        'válidas para fines diagnósticos.</p>');
    } else {
      severeElev.forEach(function (s) { h.push(scaleNarrative(result, s)); });
      var top = result.topPersonality[0];
      severeElev.forEach(function (s) {
        var si = I.SEVERE_INTEGRATION[s.code];
        if (!si) return;
        var isTop = top && top.code === s.code;
        h.push('<p class="interp"><strong>Efecto configural de ' + esc(s.code) + ':</strong> ' + esc(si.text) +
          (isTop
            ? ' Al ser la elevación más alta del perfil, esta estructura domina la lectura del resto de escalas.'
            : ' Al no ser la elevación más alta del perfil, su función es <em>matizar</em> el resto de las escalas de personalidad; se concede más relevancia a la escala con TB superior.') +
          '</p>');
      });
    }

    // 2.2 Patrones clínicos
    h.push('<h3 class="sub">2 · Patrones clínicos de la personalidad (1–8B)</h3>');
    if (!result.maxCode.length) {
      h.push('<div class="alert alert-warn"><p>Ninguna escala de los patrones clínicos alcanza TB 60. ' +
        'Conforme al capítulo 2, el protocolo se considera inválido a efectos diagnósticos.</p></div>');
    } else {
      h.push('<p class="lead"><strong>Código de puntuaciones máximas:</strong> ' +
        result.maxCode.map(function (s) { return esc(s.code) + ' (' + s.br + ')'; }).join(' — ') +
        '. El manual recomienda centrar la interpretación en las tres o cuatro elevaciones más destacadas.</p>');

      var elevated = SCALES.filter(function (d) { return d.group === 'personalidad'; })
        .map(function (d) { return result.scales[d.code]; })
        .filter(function (s) { return s.br >= 60; })
        .sort(function (a, b) { return b.br - a.br; });
      elevated.forEach(function (s) { h.push(scaleNarrative(result, s)); });

      // Interpretación configural de las dos escalas más altas
      if (result.maxCode.length >= 2) {
        var a = result.maxCode[0], b2 = result.maxCode[1];
        var pa = I.POLARITIES[a.code], pb = I.POLARITIES[b2.code];
        h.push('<div class="config-box"><h4>Configuración ' + esc(a.code) + '–' + esc(b2.code) + '</h4>');
        h.push('<p>El manual insiste en que la incorporación de una segunda escala elevada altera ' +
          'significativamente la imagen de la personalidad: una elevación ' + esc(a.name.toLowerCase()) + '–' +
          esc(b2.name.toLowerCase()) + ' es cualitativamente distinta de cualquiera de las dos por separado. ' +
          'Cada personalidad es una estructura de covarianza de los ocho dominios, de modo que la presencia de ' +
          'una característica implica la de otras asociadas.</p>');
        h.push('<table class="tbl compact"><thead><tr><th>Polaridad</th><th>' + esc(a.code) + '</th><th>' + esc(b2.code) + '</th></tr></thead><tbody>' +
          '<tr><td>Existencia (placer-dolor)</td><td>' + esc(pa.existencia) + '</td><td>' + esc(pb.existencia) + '</td></tr>' +
          '<tr><td>Adaptación (pasivo-activo)</td><td>' + esc(pa.adaptacion) + '</td><td>' + esc(pb.adaptacion) + '</td></tr>' +
          '<tr><td>Replicación (uno mismo-otros)</td><td>' + esc(pa.replicacion) + '</td><td>' + esc(pb.replicacion) + '</td></tr>' +
          '</tbody></table>');

        var conflicts = [];
        ['existencia', 'adaptacion', 'replicacion'].forEach(function (k) {
          var A = pa[k], B = pb[k];
          if (A !== B) conflicts.push(k);
        });
        h.push('<p>' + (conflicts.length
          ? 'Las dos elevaciones <strong>difieren</strong> en ' + conflicts.length +
            ' de las tres polaridades (' + conflicts.join(', ') + '). Cuando dos tendencias divergentes coinciden ' +
            'en una misma personalidad, el resultado puede ir desde el reequilibrio de ambas hasta el choque ' +
            'motivacional psíquico: conviene explorar si el sujeto queda «atascado» entre dos estrategias de ' +
            'afrontamiento incompatibles.'
          : 'Las dos elevaciones comparten la misma estructura de polaridades, lo que sugiere un patrón ' +
            'motivacional coherente y reforzado más que un conflicto interno entre estrategias.') + '</p>');

        // Dominios en conflicto
        h.push('<table class="tbl compact"><thead><tr><th>Dominio</th><th>' + esc(a.code) + '</th><th>' + esc(b2.code) + '</th></tr></thead><tbody>');
        I.DOMAIN_LABELS.forEach(function (lab, i) {
          h.push('<tr><td>' + esc(lab) + '</td><td>' + esc(I.DOMAINS[a.code][i]) + '</td><td>' +
            esc(I.DOMAINS[b2.code][i]) + '</td></tr>');
        });
        h.push('</tbody></table>');
        h.push('<p class="small muted">Cuando dos escalas presentan elevaciones muy similares, todos los ' +
          'atributos de ambos prototipos se convierten en hipótesis sobre el paciente: cabe integrarlos o bien ' +
          'recurrir a más atributos de uno que del otro, apoyándose en los ítems prototípicos, en la entrevista ' +
          'y en información de terceros.</p>');
        h.push('</div>');
      }
    }
    h.push('</section>');
    return h.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Facetas de Grossman                                                 */
  /* ------------------------------------------------------------------ */
  function facetSection(result) {
    var h = ['<section class="rep-section"><h2>Facetas de Grossman</h2>',
      '<p class="lead">Cada escala de personalidad se descompone en tres facetas extraídas de los dominios ' +
      'funcionales y estructurales. Solo se interpretan las facetas de escalas con TB ≥ 60, y por lo general ' +
      'solo se consideran significativas las facetas con TB ≥ 75.</p>'];

    if (!result.topPersonality.length) {
      h.push('<p class="note">Ninguna escala de personalidad alcanza TB 60, por lo que no procede interpretar facetas.</p></section>');
      return h.join('');
    }

    h.push('<h3 class="sub">Facetas de las tres escalas de personalidad más elevadas</h3>');
    result.topPersonality.forEach(function (p) {
      var fs = result.facets.filter(function (f) { return f.parent === p.code; })
        .sort(function (a, b) { return b.br - a.br; });
      h.push('<div class="facet-block"><h4>' + esc(p.code + ' · ' + p.name) + ' <span class="muted">(TB ' + p.br + ')</span></h4>');
      fs.forEach(function (f) {
        var sig = f.br >= 75;
        h.push('<div class="facet ' + (sig ? 'facet-sig' : '') + '">' +
          '<div class="facet-head"><span class="facet-code">' + esc(f.code) + '</span> ' +
          '<strong>' + esc(f.name) + '</strong>' +
          '<span class="facet-score">PD ' + f.raw + '/' + f.maxRaw + ' · TB ' + f.br + ' · Pc ' + f.pct + '</span></div>' +
          '<div class="facet-bar"><span style="width:' + Math.min(100, f.br) + '%"></span></div>' +
          '<p class="small">' + esc(I.FACET_DESC[f.code] || '') + '</p>' +
          (sig ? '<p class="small interp">Faceta significativa (TB ≥ 75): constituye uno de los dominios más ' +
            'relevantes y problemáticos cuando el paciente afronta problemas psíquicos, y es una diana ' +
            'preferente para la planificación del tratamiento.</p>' : '') +
          '</div>');
      });
      h.push('</div>');
    });

    // Dominios coincidentes entre las escalas altas
    if (result.topPersonality.length >= 2) {
      var byDomain = {};
      result.topPersonality.forEach(function (p) {
        result.facets.filter(function (f) { return f.parent === p.code && f.br >= 75; })
          .forEach(function (f) {
            var key = f.name.split(' ')[0].toLowerCase();
            (byDomain[key] = byDomain[key] || []).push(f);
          });
      });
      var overlaps = Object.keys(byDomain).filter(function (k) { return byDomain[k].length > 1; });
      if (overlaps.length) {
        h.push('<div class="config-box"><h4>Dominios coincidentes</h4><p>Varias escalas elevadas comparten ' +
          'facetas del mismo dominio. El manual propone decidir cuál describe mejor el estilo del paciente ' +
          'atendiendo a: (1) cuál de las escalas principales está más elevada y cuán sobresaliente es; ' +
          '(2) si las facetas se matizan entre sí; (3) las elevaciones relativas de las facetas coincidentes; ' +
          '(4) la información de otras medidas y las impresiones clínicas.</p><ul>');
        overlaps.forEach(function (k) {
          h.push('<li>' + byDomain[k].map(function (f) {
            return '<strong>' + esc(f.code) + '</strong> ' + esc(f.name) + ' (TB ' + f.br + ')';
          }).join(' vs. ') + '</li>');
        });
        h.push('</ul></div>');
      }
    }

    h.push('<details><summary>Tabla completa de las 45 facetas</summary>' +
      '<table class="tbl compact"><thead><tr><th>Faceta</th><th>Escala</th>' +
      '<th class="num">PD</th><th class="num">TB</th><th class="num">Pc</th></tr></thead><tbody>');
    result.facets.forEach(function (f) {
      h.push('<tr' + (f.br >= 75 ? ' class="sev-2-row"' : '') + '><td><strong>' + esc(f.code) + '</strong> ' +
        esc(f.name) + '</td><td class="muted">' + esc(f.parent) + '</td><td class="num">' + f.raw + '/' + f.maxRaw +
        '</td><td class="num strong">' + f.br + '</td><td class="num">' + f.pct + '</td></tr>');
    });
    h.push('</tbody></table></details></section>');
    return h.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Síndromes clínicos                                                  */
  /* ------------------------------------------------------------------ */
  function syndromeSection(result) {
    var h = ['<section class="rep-section"><h2>Fase 2 (cont.) · Escalas psicopatológicas</h2>',
      '<p class="lead">El manual recomienda interpretar primero los síndromes clínicos graves, porque pueden ' +
      'matizar la lectura de los síndromes clínicos de gravedad moderada.</p>'];

    ['sindromesGraves', 'sindromes'].forEach(function (g) {
      var list = SCALES.filter(function (d) { return d.group === g; })
        .map(function (d) { return result.scales[d.code]; })
        .filter(function (s) { return s.br >= 60; })
        .sort(function (a, b) { return b.br - a.br; });
      h.push('<h3 class="sub">' + esc(GROUPS[g]) + '</h3>');
      if (!list.length) {
        h.push('<p class="note">Ninguna escala de este grupo alcanza TB 60.</p>');
      } else {
        list.forEach(function (s) { h.push(scaleNarrative(result, s)); });
      }
    });

    // Combinaciones destacadas
    var combos = [];
    var sc = result.scales;
    if (sc.CC.br >= 75 && sc.D.br >= 75) {
      combos.push('<strong>Doble depresión.</strong> Coelevación de CC (Depresión mayor, TB ' + sc.CC.br +
        ') y D (Depresión persistente, TB ' + sc.D.br + '). La literatura clínica considera este fenómeno ' +
        'cualitativa y cuantitativamente distinto de cualquiera de los dos síndromes por separado, y conlleva ' +
        'vulnerabilidades concretas como la tendencia a evitar o retrasar el tratamiento, ya que el paciente ' +
        'con depresión persistente tiende a aceptar el empeoramiento como algo inevitable.');
    }
    if (sc.A.br >= 75 && sc.D.br >= 75) {
      combos.push('<strong>Ansiedad y depresión persistente.</strong> Comorbilidad frecuente (A = ' + sc.A.br +
        ', D = ' + sc.D.br + '); debe interpretarse la configuración conjunta y no cada escala de forma aislada.');
    }
    if (sc.B.br >= 75 && sc.T.br >= 75) {
      combos.push('<strong>Consumo de alcohol y de drogas simultáneamente elevados</strong> (B = ' + sc.B.br +
        ', T = ' + sc.T.br + '). Nota metodológica del manual: ambas escalas presentan un efecto suelo ' +
        'considerable —una o dos respuestas afirmativas ya sitúan la TB en 60—, por lo que solo deben ' +
        'considerarse indicativas a partir de TB 75.');
    } else if (sc.B.br >= 60 || sc.T.br >= 60) {
      combos.push('<strong>Nota sobre B y T.</strong> El manual advierte de un efecto suelo considerable en ' +
        'estas dos escalas: una o dos respuestas afirmativas bastan para alcanzar TB 60, la puntuación ' +
        'promedio de la muestra de tipificación. Aplicar estrictamente el umbral de 75.');
    }
    if (sc.SS.br >= 75 || sc.PP.br >= 75) {
      combos.push('<strong>Escalas del espectro psicótico elevadas.</strong> El manual recuerda que la mayor ' +
        'especificidad de A, SS y PP en la adaptación española implica que el paciente ha tenido que reconocer ' +
        'un número mayor de síntomas para alcanzar esta elevación.');
    }
    if (combos.length) {
      h.push('<div class="config-box"><h4>Combinaciones clínicamente relevantes</h4><ul><li>' +
        combos.join('</li><li>') + '</li></ul></div>');
    }

    h.push('</section>');
    return h.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Fase 3 — Síntesis                                                   */
  /* ------------------------------------------------------------------ */
  function synthesisSection(result, meta) {
    var h = ['<section class="rep-section"><h2>Fase 3 · Síntesis e integración clínica</h2>'];

    var sc = result.scales;
    var topP = result.topPersonality;
    var elevSyn = SCALES.filter(function (d) { return d.group === 'sindromes' || d.group === 'sindromesGraves'; })
      .map(function (d) { return sc[d.code]; })
      .filter(function (s) { return s.br >= 75; })
      .sort(function (a, b) { return b.br - a.br; });

    h.push('<h3 class="sub">Formulación integrada</h3>');

    if (!topP.length) {
      h.push('<p>El perfil no ofrece un patrón de personalidad interpretable (ninguna escala 1–P alcanza TB 60), ' +
        'por lo que no puede construirse la formulación configural que propone el manual.</p>');
    } else {
      var main = topP[0];
      var sentence = 'La estructura de personalidad que organiza el cuadro es predominantemente <strong>' +
        esc(main.name.toLowerCase()) + '</strong> (escala ' + esc(main.code) + ', TB ' + main.br + ')';
      if (topP.length > 1) {
        sentence += ', con una configuración ' + topP.map(function (s) { return esc(s.name.toLowerCase()); }).join('–') +
          ' (' + topP.map(function (s) { return esc(s.code) + ' ' + s.br; }).join(' · ') + ')';
      }
      sentence += '.';
      h.push('<p>' + sentence + '</p>');

      h.push('<p>Conforme al modelo multiaxial que el MCMI-IV mantiene deliberadamente, la personalidad opera ' +
        'como el «sistema inmunitario psíquico» que media entre los estresores psicosociales y la producción de ' +
        'síntomas. Por tanto, los síndromes clínicos presentes deben leerse como ampliaciones o distorsiones de ' +
        'este estilo básico y no como entidades independientes.</p>');

      if (elevSyn.length) {
        h.push('<p>Los síndromes que alcanzan el umbral de presencia son: ' +
          elevSyn.map(function (s) {
            return '<strong>' + esc(s.name) + '</strong> (' + esc(s.code) + ', TB ' + s.br + ')';
          }).join(', ') + '. La redacción del informe clínico no debería limitarse a enumerarlos, sino a ' +
          'explicar cómo el patrón de personalidad descrito determina la forma concreta en que el paciente ' +
          'experimenta, expresa y gestiona esa sintomatología.</p>');
      } else {
        h.push('<p>Ninguna escala de síndromes clínicos alcanza el umbral de presencia (TB 75). El cuadro se ' +
          'define, por tanto, fundamentalmente en el eje de la personalidad.</p>');
      }

      // Amplitud de la patología
      var over75 = SCALES.filter(function (d) { return d.group === 'personalidad' || d.group === 'patologiaGrave'; })
        .map(function (d) { return sc[d.code]; }).filter(function (s) { return s.br >= 75; });
      h.push('<p><strong>Amplitud de la patología de la personalidad.</strong> ' + over75.length +
        ' escala(s) de personalidad alcanzan o superan TB 75' +
        (over75.length ? ' (' + over75.map(function (s) { return esc(s.code); }).join(', ') + ')' : '') +
        '. Como regla general del manual, cuantas más escalas superan 75, más amplia es la patología; solo ' +
        'deben considerarse principales las dos o tres más elevadas, y el resto se interpretan como estilos ' +
        'que el paciente probablemente muestre en algunos contextos y ocasiones.</p>');

      h.push('<p><strong>Las tres características diferenciales de la patología</strong> que el manual propone ' +
        'valorar para situar al paciente en el continuo normalidad-patología son: (1) la <em>frágil estabilidad</em> ' +
        'ante el estrés subjetivo, con retroalimentación positiva que amplifica los problemas adaptativos; ' +
        '(2) la <em>inflexibilidad adaptativa</em>, con pocas estrategias alternativas aplicadas de forma rígida; ' +
        'y (3) la <em>tendencia a fomentar círculos viciosos</em>, generando y perpetuando dilemas y activando ' +
        'secuencias autodestructivas con los demás. Conviene contrastar explícitamente estos tres puntos con ' +
        'la historia y la conducta observada del paciente.</p>');
    }

    // Motivos de consulta declarados
    if (meta && meta.problems && meta.problems.length) {
      h.push('<h3 class="sub">Concordancia con los problemas declarados</h3>');
      h.push('<p>El sujeto señaló como principales motivos de preocupación: <strong>' +
        meta.problems.map(esc).join('</strong>, <strong>') + '</strong>. Conviene valorar explícitamente si ' +
        'el perfil obtenido converge o diverge de esta autopercepción: el manual señala que, incluso cuando ' +
        'los resultados coinciden con las predicciones del profesional, suele obtenerse más información de los ' +
        'aspectos divergentes.</p>');
    }

    h.push('<h3 class="sub">Recomendaciones de procedimiento</h3><ul>');
    h.push('<li>Integrar estos resultados con la entrevista clínica, el historial psicosocial, la conducta ' +
      'observada y otros instrumentos. El MCMI-IV es un instrumento autoinformado y constituye solo un aspecto ' +
      'de la evaluación completa.</li>');
    h.push('<li>Al comunicar los resultados, exponer primero la discrepancia observada y dejar que sea el ' +
      'paciente quien verbalice el efecto del conflicto, en lugar de dar énfasis a las etiquetas diagnósticas ' +
      'desde el principio.</li>');
    h.push('<li>Advertir siempre de las limitaciones de las puntuaciones al comunicarlas, conforme a las ' +
      'directrices de la APA sobre comunicación de información de evaluación.</li>');
    if (elevSyn.length && topP.length) {
      h.push('<li>Si persiste la duda diagnóstica en alguna escala, revisar las respuestas del sujeto a sus ' +
        'ítems prototípicos y comprobar si los criterios del DSM-5 se reflejan en ellos.</li>');
    }
    h.push('</ul>');

    h.push('<div class="alert alert-warn"><p><strong>Uso profesional.</strong> El MCMI-IV requiere nivel de ' +
      'cualificación C: titulación superior en psicología o psiquiatría y experiencia en diagnóstico clínico. ' +
      'Está baremado para adultos desde 18 años que buscan o reciben atención psicológica; no es un ' +
      'instrumento de evaluación de la personalidad general para población no clínica ni es apropiado para ' +
      'adolescentes.</p></div>');

    h.push('</section>');
    return h.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Metodología                                                         */
  /* ------------------------------------------------------------------ */
  function methodSection(result) {
    var c = result.config;
    return '<section class="rep-section"><h2>Nota metodológica y trazabilidad</h2>' +
      '<p>La corrección aplica el procedimiento del capítulo 2 del manual con los baremos españoles ' +
      '(muestra de tipificación: 889 pacientes).</p>' +
      '<ul>' +
      '<li><strong>Puntuaciones directas:</strong> ponderación oficial —ítem prototípico 2 puntos, no ' +
      'prototípico 1 punto (Anexo C). La autocomprobación verifica que la PD máxima resultante coincide ' +
      'con la publicada en el Anexo B para las 25 escalas.</li>' +
      '<li><strong>Tasas base:</strong> tablas de conversión del Anexo D.1 (escalas 1–PP), D.3 (índices X, Y, Z) ' +
      'y D.4 (facetas de Grossman), transcritas íntegramente.</li>' +
      '<li><strong>Percentiles:</strong> Anexo D.2, sobre la tasa base ajustada.</li>' +
      '<li><strong>Ajuste por X:</strong> el manual establece que con PD &lt; 21 el sistema <em>aumenta</em> ' +
      'las TB de 1–P y A–PP, y con PD &gt; 60 las <em>disminuye</em>, pero no publica la tabla numérica. ' +
      'Se aplica un modelo lineal explícito y auditable (pendiente ' + c.adjustments.x.lowSlope + ' por debajo de 21, ' +
      c.adjustments.x.highSlope + ' por encima de 60, tope ±' + c.adjustments.x.cap + ' puntos de TB).</li>' +
      '<li><strong>Ajuste por A/CC:</strong> el manual establece que la suma de los puntos de TB de A y CC que ' +
      'exceden de 75 <em>disminuye</em> las TB de 2B, 8B, C, 2A y S, sin publicar la tabla. Se aplica un ' +
      'decremento graduado (pendiente ' + c.adjustments.acc.slope + ', tope de suma ' + c.adjustments.acc.sumCap +
      ', pesos 2B ' + c.adjustments.acc.weights['2B'] + ' · 8B ' + c.adjustments.acc.weights['8B'] +
      ' · C ' + c.adjustments.acc.weights['C'] + ' · 2A ' + c.adjustments.acc.weights['2A'] +
      ' · S ' + c.adjustments.acc.weights['S'] + ').</li>' +
      '<li><strong>Claves de respuesta V/F:</strong> el Anexo B lista los ítems de cada escala pero no su ' +
      'dirección de puntuación. Los ítems inversos se han derivado del contenido y validado con la propia ' +
      'restricción del manual: los ítems inversos suponen el 22 % de las escalas 4A, 5 y 7 (10 de 46 ítems ' +
      'en esta codificación).</li>' +
      '<li><strong>Ítems omitidos:</strong> el manual imputa «la respuesta típica de la muestra de ' +
      'tipificación», vector no publicado. Aquí los ítems omitidos no puntúan y se listan explícitamente.</li>' +
      '</ul>' +
      '<p class="note">Los dos ajustes son desactivables desde la pantalla de resultados; el informe muestra ' +
      'siempre la tasa base sin ajustar junto a la ajustada, de modo que cualquier conclusión pueda ' +
      'reconstruirse sin ellos.</p></section>';
  }

  /* ------------------------------------------------------------------ */
  /* Respuestas a los ítems                                              */
  /* ------------------------------------------------------------------ */
  function answersSection(result) {
    var h = ['<section class="rep-section"><h2>Respuestas a los ítems</h2>',
      '<details><summary>Mostrar las 195 respuestas</summary><div class="answers-grid">'];
    for (var i = 0; i < 195; i++) {
      var a = result.answers[i];
      var mark = a === true ? 'V' : (a === false ? 'F' : '—');
      var cls = a === true ? 'ans-v' : (a === false ? 'ans-f' : 'ans-n');
      h.push('<div class="ans ' + cls + '" title="' + esc(ITEMS[i]) + '"><span>' + (i + 1) + '</span><b>' + mark + '</b></div>');
    }
    h.push('</div></details></section>');
    return h.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Informe completo                                                    */
  /* ------------------------------------------------------------------ */
  function build(result, meta) {
    meta = meta || {};
    var h = [];

    h.push('<div class="report">');
    h.push('<header class="rep-header">' +
      '<div><h1>Informe MCMI-IV</h1>' +
      '<p class="sub">Inventario Clínico Multiaxial de Millon-IV · Baremos españoles</p></div>' +
      '<div class="rep-meta">' +
      (meta.name ? '<div><span>Sujeto</span><strong>' + esc(meta.name) + '</strong></div>' : '') +
      (meta.code ? '<div><span>Código</span><strong>' + esc(meta.code) + '</strong></div>' : '') +
      (meta.age ? '<div><span>Edad</span><strong>' + esc(meta.age) + '</strong></div>' : '') +
      (meta.sex ? '<div><span>Sexo</span><strong>' + esc(meta.sex) + '</strong></div>' : '') +
      (meta.civil ? '<div><span>Estado civil</span><strong>' + esc(meta.civil) + '</strong></div>' : '') +
      (meta.education ? '<div><span>Nivel educativo</span><strong>' + esc(meta.education) + '</strong></div>' : '') +
      (meta.setting ? '<div><span>Situación actual</span><strong>' + esc(meta.setting) + '</strong></div>' : '') +
      (meta.episode ? '<div><span>Episodio más reciente</span><strong>' + esc(meta.episode) + '</strong></div>' : '') +
      (meta.examiner ? '<div><span>Examinador</span><strong>' + esc(meta.examiner) + '</strong></div>' : '') +
      (meta.date ? '<div><span>Fecha de aplicación</span><strong>' + esc(meta.date) + '</strong></div>' : '') +
      '</div></header>');

    h.push(validitySection(result));

    var blocked = result.status.invalid || result.status.unscorable;
    if (blocked) {
      h.push('<div class="alert alert-danger big"><h3>Informe abreviado</h3>' +
        '<p>Cuando los resultados son inválidos o el inventario es impuntuable, el manual indica que se genere ' +
        'un informe breve que señale el motivo de la falta de validez <strong>sin generar el perfil de las ' +
        'puntuaciones</strong>. A continuación se muestran las puntuaciones solo con fines de revisión ' +
        'técnica; <strong>no deben interpretarse clínicamente</strong>.</p></div>');
    }

    h.push('<section class="rep-section"><h2>Resumen de puntuaciones y perfil</h2>');
    if (result.maxCode.length) {
      h.push('<p class="lead"><strong>Código de puntuaciones máximas:</strong> ' +
        result.maxCode.map(function (s) { return esc(s.code + ' ' + s.name) + ' (TB ' + s.br + ')'; }).join(' · ') + '</p>');
    }
    h.push('<h3 class="sub">Patrones de la personalidad</h3>');
    h.push(profileChart(result, ['personalidad', 'patologiaGrave'], 'Perfil de personalidad'));
    h.push(scoreTable(result, 'personalidad'));
    h.push(scoreTable(result, 'patologiaGrave'));
    h.push('<h3 class="sub">Síndromes clínicos</h3>');
    h.push(profileChart(result, ['sindromes', 'sindromesGraves'], 'Perfil de síndromes clínicos'));
    h.push(scoreTable(result, 'sindromes'));
    h.push(scoreTable(result, 'sindromesGraves'));
    h.push('<p class="small muted">Bandas: TB &lt; 60 no elevada · 60–74 estilo/subumbral · 75–84 tipo o ' +
      'síndrome presente · ≥ 85 trastorno o síndrome prominente.</p>');
    h.push('</section>');

    h.push(significantSection(result));

    if (!blocked) {
      h.push(personalitySection(result));
      h.push(facetSection(result));
      h.push(syndromeSection(result));
      h.push(synthesisSection(result, meta));
    }

    h.push(methodSection(result));
    h.push(answersSection(result));

    h.push('<footer class="rep-footer"><p>Generado el ' +
      esc(new Date().toLocaleString('es-ES')) +
      ' · Documento clínico confidencial. MCMI-IV © 2015 DICANDRIEN, Inc.; adaptación española © 2018 ' +
      'DICANDRIEN, Inc., distribuida por Pearson Educación, S.A. Esta herramienta no está afiliada a Pearson.</p></footer>');
    h.push('</div>');
    return h.join('');
  }

  global.MCMI_REPORT = { build: build, profileChart: profileChart, esc: esc };
})(window);
