/* ==========================================================================
   MCMI-IV — Composición de escalas, facetas de Grossman, índices de validez
   y categorías de «respuestas significativas».
   Fuente: Manual MCMI-IV (adaptación española), Anexos B y C.

   NOTACIÓN DE ÍTEMS
   -----------------
   Cada escala lista sus ítems como enteros con signo:
       n  → se puntúa cuando la respuesta es VERDADERO (ítem directo)
      -n  → se puntúa cuando la respuesta es FALSO      (ítem inverso)

   PESOS
   -----
   Escalas de patrones de personalidad y de síndromes clínicos:
      ítem prototípico     → 2 puntos   (Anexo C)
      ítem no prototípico  → 1 punto
   Facetas de Grossman e índices de validez: sin ponderación (1 punto).
   El módulo js/selftest.js verifica que la puntuación directa máxima
   resultante coincide con la publicada en el Anexo B para las 25 escalas.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------------------
     1. ESCALAS DE PATRONES DE PERSONALIDAD Y SÍNDROMES CLÍNICOS
     --------------------------------------------------------------------- */
  var SCALES = [
    /* ---- Patrones clínicos de la personalidad (1 – 8B) ---- */
    { code: '1', name: 'Esquizoide', group: 'personalidad', maxRaw: 23,
      items: [6, 15, 17, 24, -30, 43, 70, 90, 92, 119, 139, 149, -154, 180, 190],
      proto: [6, 15, 43, 90, 119, 139, 149, 180] },

    { code: '2A', name: 'Evitativo', group: 'personalidad', maxRaw: 24,
      items: [5, 12, 23, 24, 26, -46, 52, -67, 92, 93, 99, 112, 135, -154, 178, 184, 193, 195],
      proto: [5, 12, 26, 99, 135, 195] },

    { code: '2B', name: 'Melancólico', group: 'personalidad', maxRaw: 28,
      items: [17, 22, 23, 39, 51, -53, 59, 70, 71, 90, 93, 111, 126, 169, 170, 175, 178, 184, 193],
      proto: [23, 51, 71, 93, 111, 169, 175, 184, 193] },

    { code: '3', name: 'Dependiente', group: 'personalidad', maxRaw: 23,
      items: [4, 5, 23, 42, 60, -67, 72, 77, 109, 133, 162, 173, 175, 194],
      proto: [4, 42, 60, 77, 109, 133, 162, 173, 194] },

    { code: '4A', name: 'Histriónico', group: 'personalidad', maxRaw: 24,
      items: [-6, 8, 10, -15, -24, -26, 30, 46, 75, 84, 117, -139, 154, 155, 171, -178, -195],
      proto: [10, 30, 46, 84, 117, 154, 171] },

    { code: '4B', name: 'Tempestuoso', group: 'personalidad', maxRaw: 25,
      items: [8, 20, -26, 30, 46, 53, 67, 75, 84, -120, 129, 142, 154, 155, 174, -178, 185],
      proto: [8, 20, 53, 75, 129, 155, 174, 185] },

    { code: '5', name: 'Narcisista', group: 'personalidad', maxRaw: 26,
      items: [10, 19, 29, 38, 54, 67, 83, 87, 106, 117, 132, 142, 159, 171, 189, 191],
      proto: [29, 38, 54, 67, 87, 106, 132, 142, 159, 189] },

    { code: '6A', name: 'Antisocial', group: 'personalidad', maxRaw: 21,
      items: [11, 19, 36, 38, -48, 65, 83, 105, 147, 152, -158, 159, 183, 191],
      proto: [11, 19, 65, 83, 147, 183, 191] },

    { code: '6B', name: 'Sádico', group: 'personalidad', maxRaw: 22,
      items: [9, 11, 16, 21, 50, 66, 74, 97, 103, 115, 141, 145, 152, 172],
      proto: [9, 50, 66, 97, 103, 115, 141, 152] },

    { code: '7', name: 'Compulsivo', group: 'personalidad', maxRaw: 23,
      items: [2, 35, 48, 63, 73, -83, 128, 140, -147, -152, 158, 179, 188],
      proto: [2, 35, 48, 63, 73, 128, 140, 158, 179, 188] },

    { code: '8A', name: 'Negativista', group: 'personalidad', maxRaw: 26,
      items: [17, 21, 32, 37, 52, 79, 82, 88, 96, 97, 100, 122, 137, 167, 168, 172, 184, 187],
      proto: [17, 32, 82, 96, 122, 137, 167, 187] },

    { code: '8B', name: 'Masoquista', group: 'personalidad', maxRaw: 25,
      items: [4, 12, -20, 23, 39, 59, 70, -75, 85, 93, 100, 126, 156, 164, 166, 178, 192, 195],
      proto: [39, 59, 85, 100, 126, 166, 192] },

    /* ---- Patología grave de la personalidad (S, C, P) ---- */
    { code: 'S', name: 'Esquizotípico', group: 'patologiaGrave', maxRaw: 29,
      items: [13, 18, 24, 44, 58, 70, 90, 92, 93, 112, 121, 123, 126, 148, 156, 163, 165, 167, 172, 190, 195],
      proto: [13, 24, 44, 92, 112, 156, 165, 190] },

    { code: 'C', name: 'Límite', group: 'patologiaGrave', maxRaw: 27,
      items: [4, 16, 18, 37, 59, 70, 80, 82, 93, 100, 111, 126, 134, 137, 156, 164, 166, 178, 192, 193],
      proto: [16, 18, 37, 70, 134, 164, 178] },

    { code: 'P', name: 'Paranoide', group: 'patologiaGrave', maxRaw: 24,
      items: [13, 21, 24, 52, 68, 79, 88, 96, 104, 136, 148, 153, 167, 172, 180, 195],
      proto: [21, 52, 79, 88, 104, 136, 153, 172] },

    /* ---- Síndromes clínicos (A – R) ---- */
    { code: 'A', name: 'Ansiedad generalizada', group: 'sindromes', maxRaw: 19,
      items: [31, 33, 41, 44, 51, 72, 89, 91, 108, 109, 113, 123, 143],
      proto: [31, 72, 89, 113, 123, 143] },

    { code: 'H', name: 'Síntomas somáticos', group: 'sindromes', maxRaw: 15,
      items: [1, 7, -20, 28, 41, 57, 113, 118, 120, 146],
      proto: [7, 28, 41, 120, 146] },

    { code: 'N', name: 'Espectro bipolar', group: 'sindromes', maxRaw: 19,
      items: [3, 27, 37, 50, 54, 56, 82, 83, 105, 108, 155, 163, 177],
      proto: [3, 27, 56, 108, 163, 177] },

    { code: 'D', name: 'Depresión persistente', group: 'sindromes', maxRaw: 27,
      items: [14, 17, 28, 34, 39, 51, 64, 71, -75, 77, 85, 93, 101, 111, 114, 118, 120, 151, 170, 178, 193],
      proto: [14, 34, 64, 118, 151, 170] },

    { code: 'B', name: 'Consumo de alcohol', group: 'sindromes', maxRaw: 13,
      items: [25, 45, 65, 83, 94, 126, 130, 161],
      proto: [25, 45, 94, 130, 161] },

    { code: 'T', name: 'Consumo de drogas', group: 'sindromes', maxRaw: 18,
      items: [11, 36, 61, 65, 81, 105, 116, 124, 144, 152, -158],
      proto: [36, 61, 81, 105, 116, 124, 144] },

    { code: 'R', name: 'Estrés postraumático', group: 'sindromes', maxRaw: 19,
      items: [44, 47, 57, 62, 74, 76, 89, 91, 110, 113, 125, 143, 150, 157],
      proto: [62, 76, 91, 125, 150] },

    /* ---- Síndromes clínicos graves (SS, CC, PP) ---- */
    { code: 'SS', name: 'Espectro esquizofrénico', group: 'sindromesGraves', maxRaw: 27,
      items: [18, 24, 33, 52, 58, 80, 82, 89, 92, 95, 104, 121, 123, 131, 136, 138, 148, 156, 165, 172, 182],
      proto: [33, 58, 80, 121, 131, 138] },

    { code: 'CC', name: 'Depresión mayor', group: 'sindromesGraves', maxRaw: 24,
      items: [1, 22, 28, 41, 57, 59, 64, 70, 78, 80, 101, 107, 111, 114, 118, 120, 170],
      proto: [1, 22, 57, 78, 101, 107, 114] },

    { code: 'PP', name: 'Delirante', group: 'sindromesGraves', maxRaw: 19,
      items: [13, 54, 68, 79, 88, 95, 112, 121, 127, 136, 148, 172, 182, 189],
      proto: [68, 95, 127, 148, 182] }
  ];

  var GROUP_LABELS = {
    personalidad: 'Patrones clínicos de la personalidad',
    patologiaGrave: 'Patología grave de la personalidad',
    sindromes: 'Síndromes clínicos',
    sindromesGraves: 'Síndromes clínicos graves'
  };

  /* ---------------------------------------------------------------------
     2. FACETAS DE GROSSMAN (45 facetas, sin ponderación)
     --------------------------------------------------------------------- */
  var FACETS = [
    { code: '1.1', parent: '1', name: 'Interpersonalmente desvinculado', items: [12, 15, 24, 104, 149, -154, 180, -185, 190] },
    { code: '1.2', parent: '1', name: 'Contenido escaso', items: [26, -30, -46, -67, 99, 139, 175, 178, 195] },
    { code: '1.3', parent: '1', name: 'Temperamentalmente apático', items: [6, 17, 43, 70, 90, 92, 111, 118, 119] },

    { code: '2A.1', parent: '2A', name: 'Interpersonalmente aversivo', items: [15, 26, -30, -46, -84, 99, 139, -154] },
    { code: '2A.2', parent: '2A', name: 'Autoimagen alienada', items: [23, 58, -67, 111, 135, 156, 178, 192, 193] },
    { code: '2A.3', parent: '2A', name: 'Contenido vejatorio', items: [5, 12, 24, 52, 92, 93, 112, 184, 195] },

    { code: '2B.1', parent: '2B', name: 'Cognitivamente fatalista', items: [17, 23, 33, 51, 52, 71, 89, 126, 184] },
    { code: '2B.2', parent: '2B', name: 'Autoimagen inútil', items: [39, 59, 93, 112, 169, 175, 178, 192, 195] },
    { code: '2B.3', parent: '2B', name: 'Temperamentalmente afligido', items: [22, -53, 70, 90, 101, 107, 111, 170, 193] },

    { code: '3.1', parent: '3', name: 'Expresivamente pueril', items: [4, 5, 23, 51, 72, 99, 109, 135, 184] },
    { code: '3.2', parent: '3', name: 'Interpersonalmente sumiso', items: [26, 60, 162, 169, 173, -185, 194] },
    { code: '3.3', parent: '3', name: 'Autoimagen inepta', items: [42, -53, -67, 77, 85, 93, 133, 151, 175] },

    { code: '4A.1', parent: '4A', name: 'Expresivamente dramático', items: [10, 38, 83, 117, 132, 142, 171] },
    { code: '4A.2', parent: '4A', name: 'Interpersonalmente buscador de atención', items: [-6, -15, -24, -26, 30, 46, 84, -139, 154, -195] },
    { code: '4A.3', parent: '4A', name: 'Temperamentalmente inconstante', items: [8, 20, 27, 53, 67, 75, -135, 155, -170, 174, -178, 185] },

    { code: '4B.1', parent: '4B', name: 'Expresivamente impetuoso', items: [8, 20, 53, 75, 129, 155, 174, 185] },
    { code: '4B.2', parent: '4B', name: 'Interpersonalmente eufórico', items: [-5, 10, -26, 30, 46, 84, 117, -149, 154] },
    { code: '4B.3', parent: '4B', name: 'Autoimagen sobreestimada', items: [-14, 67, -93, -120, 142, -156, -175, -178] },

    { code: '5.1', parent: '5', name: 'Interpersonalmente explotador', items: [10, 19, 38, 83, 117, 132, 159, 171, 183] },
    { code: '5.2', parent: '5', name: 'Cognitivamente expansivo', items: [8, 67, 75, -93, 142, 154, 155, 174, -178, 185] },
    { code: '5.3', parent: '5', name: 'Autoimagen admirable', items: [29, 54, 79, 87, 106, 180, 189, 191] },

    { code: '6A.1', parent: '6A', name: 'Interpersonalmente irresponsable', items: [10, 38, 83, 103, 159, 171, 183, -188] },
    { code: '6A.2', parent: '6A', name: 'Autoimagen autónoma', items: [11, 19, -48, -73, 147, 152, 153, -158, 168, 191] },
    { code: '6A.3', parent: '6A', name: 'Dinámicas de irreflexión (paso al acto)', items: [25, 36, 61, -63, 65, 85, 105, 126, 130, 144] },

    { code: '6B.1', parent: '6B', name: 'Expresivamente precipitado', items: [9, 11, 65, 66, 88, 103, 152, 153, 159, 172, 191] },
    { code: '6B.2', parent: '6B', name: 'Interpersonalmente desagradable', items: [19, 21, 50, 97, 141, 166, 187] },
    { code: '6B.3', parent: '6B', name: 'Arquitectura eruptiva', items: [16, 37, 74, 115, 137, 145, 168] },

    { code: '7.1', parent: '7', name: 'Expresivamente disciplinado', items: [2, 20, 35, 63, -85, -118, 174, 188] },
    { code: '7.2', parent: '7', name: 'Cognitivamente constreñido', items: [23, 44, 51, 52, 99, 128, 131, 135, 137, 140, 169, 179] },
    { code: '7.3', parent: '7', name: 'Autoimagen responsable', items: [-19, 48, 73, -83, -147, -152, 158, -183, -191] },

    { code: '8A.1', parent: '8A', name: 'Expresivamente resentido', items: [21, 32, 79, 88, 96, 100, 122, 167, 172] },
    { code: '8A.2', parent: '8A', name: 'Autoimagen descontenta', items: [12, 17, 24, 34, 39, 51, 52, 59, -75, 153, 184] },
    { code: '8A.3', parent: '8A', name: 'Temperamentalmente irritable', items: [9, 37, 74, 82, 97, 115, 137, 145, 168, 187] },

    { code: '8B.1', parent: '8B', name: 'Autoimagen desmerecedora', items: [4, 12, 23, 39, 52, 59, 70, 93, 164, 178, 192, 195] },
    { code: '8B.2', parent: '8B', name: 'Arquitectura invertida', items: [17, 40, 85, 100, 126, 156, 166, 167, 184] },
    { code: '8B.3', parent: '8B', name: 'Temperamentalmente disfórico', items: [-20, -53, -67, -75, 92, 107, -154, -155, 170] },

    { code: 'S.1', parent: 'S', name: 'Cognitivamente circunstancial', items: [18, 33, 44, 89, 92, 121, 123, 131, 163] },
    { code: 'S.2', parent: 'S', name: 'Autoimagen disociada', items: [5, 58, 70, 90, 93, 111, 126, -154, 156, 165, 195] },
    { code: 'S.3', parent: 'S', name: 'Contenido caótico', items: [13, 24, 68, 79, 88, 106, 112, 148, 167, 172, 190] },

    { code: 'C.1', parent: 'C', name: 'Autoimagen inestable', items: [14, 70, 101, 111, 151, 156, 170, 178] },
    { code: 'C.2', parent: 'C', name: 'Arquitectura disgregada', items: [4, 17, 39, 59, 93, 100, 126, 134, 166, 192, 193] },
    { code: 'C.3', parent: 'C', name: 'Temperamentalmente lábil', items: [16, 18, 37, 74, 80, 82, 115, 137, 164, 187] },

    { code: 'P.1', parent: 'P', name: 'Expresivamente defensivo', items: [12, 15, 21, 24, 104, 149, 153, 180, 195] },
    { code: 'P.2', parent: 'P', name: 'Cognitivamente desconfiado', items: [17, 52, 79, 88, 172, 182, 184] },
    { code: 'P.3', parent: 'P', name: 'Dinámicas de proyección', items: [13, 32, 68, 96, 106, 112, 122, 136, 148, 167] }
  ];

  /* ---------------------------------------------------------------------
     3. ÍNDICES DE VALIDEZ
     --------------------------------------------------------------------- */

  /* Escala V (Invalidez): 3 ítems de contenido sumamente improbable.
     Puntuación directa = nº de respuestas VERDADERO. Máx. 3. */
  var SCALE_V = { code: 'V', name: 'Invalidez', maxRaw: 3, items: [49, 98, 160] };

  /* Escala W (Inconsistencia): 25 pares semánticamente equivalentes.
     Puntuación directa = nº de pares con respuesta discordante. Máx. 25. */
  var SCALE_W = {
    code: 'W', name: 'Inconsistencia', maxRaw: 25,
    pairs: [
      [22, 170], [125, 143], [47, 157], [40, 181], [81, 116],
      [85, 126], [76, 150], [25, 94], [44, 121], [39, 59],
      [17, 184], [33, 89], [78, 164], [38, 171], [74, 115],
      [46, 154], [26, 99], [20, 174], [32, 122], [13, 112],
      [55, 110], [173, 194], [95, 127], [60, 162], [15, 149]
    ]
  };

  /* Escala X (Sinceridad): 121 ítems (unión de las escalas 1–8B).
     Puntuación directa = nº de respuestas que indican aceptación del
     síntoma/rasgo, es decir respuestas VERDADERO. Máx. 121. */
  var SCALE_X = {
    code: 'X', name: 'Sinceridad', maxRaw: 121,
    items: [2, 4, 5, 6, 8, 9, 10, 11, 12, 15, 16, 17, 19, 20, 21, 22, 23, 24, 26, 29,
      30, 32, 35, 36, 37, 38, 39, 42, 43, 46, 48, 50, 51, 52, 53, 54, 59, 60, 63, 65,
      66, 67, 70, 71, 72, 73, 74, 75, 77, 79, 82, 83, 84, 85, 87, 88, 90, 92, 93, 96,
      97, 99, 100, 103, 105, 106, 109, 111, 112, 115, 117, 119, 120, 122, 126, 128,
      129, 132, 133, 135, 137, 139, 140, 141, 142, 145, 147, 149, 152, 154, 155, 156,
      158, 159, 162, 164, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 178, 179,
      180, 183, 184, 185, 187, 188, 189, 190, 191, 192, 193, 194, 195]
  };

  /* Escala Y (Deseabilidad social): 24 ítems de contenido autoenaltecedor. */
  var SCALE_Y = {
    code: 'Y', name: 'Deseabilidad social', maxRaw: 24,
    items: [2, 3, 8, 20, 30, 46, -65, 67, -71, 73, 75, 84, -90, -99, 154, 155, 158,
      -159, -162, 173, 174, 185, -187, 188]
  };

  /* Escala Z (Devaluación): 30 ítems de contenido autodenigrante. */
  var SCALE_Z = {
    code: 'Z', name: 'Devaluación', maxRaw: 30,
    items: [1, 14, 16, 17, 18, 22, 28, 31, 32, 34, 37, 39, 41, 44, 51, 64, 74, 78, 80,
      101, 107, 109, 112, 113, 120, 151, 164, 170, 178, 193]
  };

  /* ---------------------------------------------------------------------
     4. RESPUESTAS SIGNIFICATIVAS (Anexo B)
     Se activan con respuesta VERDADERO. `min` = nº mínimo de respuestas
     afirmativas para que la categoría se considere significativa.
     --------------------------------------------------------------------- */
  var SIGNIFICANT = [
    { name: 'TDAH', min: 4, items: [56, 63, 77, 82, 92, 108],
      note: 'Realizar diagnóstico diferencial cuidadoso frente a las escalas 1, S, A y R.' },
    { name: 'Espectro autista', min: 4, items: [92, 119, 138, 163, 165, 179, 190],
      note: 'Realizar diagnóstico diferencial cuidadoso frente a las escalas 1, S, A y R.' },
    { name: 'Maltrato infantil', min: 1, items: [47, 157] },
    { name: 'Trastorno de la conducta alimentaria', min: 1, items: [69, 86, 102, 186] },
    { name: 'Falta de control emocional', min: 2, items: [27, 36, 45, 56, 72, 80, 127, 177] },
    { name: 'Explosiones de ira', min: 2, items: [11, 74, 115, 145, 168, 191] },
    { name: 'Preocupación por su salud', min: 2, items: [7, 41, 57, 113, 120, 146] },
    { name: 'Alienación interpersonal', min: 1, items: [4, 104, 182, 190] },
    { name: 'Abuso de la medicación', min: 1, items: [124, 176] },
    { name: 'Potencial conducta autodestructiva', min: 2, priority: true,
      items: [14, 32, 34, 39, 59, 78, 101, 107, 114, 126, 151, 164],
      note: 'Explorar activamente ideación y planificación suicida.' },
    { name: 'Conductas/tendencias autolesivas', min: 1, priority: true, items: [40, 181],
      note: 'Explorar historia de autolesión y riesgo actual.' },
    { name: 'Lesión cerebral', min: 1, items: [55, 110],
      note: 'Considerar derivación a evaluación neuropsicológica.' },
    { name: 'Tendencias vengativas', min: 2, items: [22, 37, 100, 103, 111, 136, 167, 178, 192] }
  ];

  /* Ítems críticos que exigen revisión inmediata sea cual sea el perfil. */
  var CRITICAL_ITEMS = [78, 134, 164, 40, 181, 127, 95];

  global.MCMI_SCALES = SCALES;
  global.MCMI_GROUP_LABELS = GROUP_LABELS;
  global.MCMI_FACETS = FACETS;
  global.MCMI_VALIDITY = { V: SCALE_V, W: SCALE_W, X: SCALE_X, Y: SCALE_Y, Z: SCALE_Z };
  global.MCMI_SIGNIFICANT = SIGNIFICANT;
  global.MCMI_CRITICAL_ITEMS = CRITICAL_ITEMS;
})(window);
