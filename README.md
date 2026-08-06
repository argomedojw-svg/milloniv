# MCMI-IV — Aplicación y corrección offline

Aplicación web autónoma (HTML + CSS + JavaScript, sin backend y sin dependencias) para
administrar los 195 ítems del Inventario Clínico Multiaxial de Millon-IV, corregirlo con los
baremos españoles y generar un informe interpretativo.

## Uso

Abre `index.html` con doble clic. No requiere servidor, `npm install` ni conexión a internet.
Todo el procesamiento ocurre en el navegador; ninguna respuesta sale del dispositivo.

- **Nueva aplicación** → datos del sujeto → 195 ítems → corrección automática.
- El progreso se autoguarda en `localStorage`; se puede cerrar y continuar después.
- **Exportar JSON** guarda la sesión completa (reimportable); **Exportar CSV** guarda las
  puntuaciones; **Imprimir** genera el informe en PDF con formato clínico.
- **Diagnóstico** muestra la autocomprobación de integridad y el historial local.

## Archivos

```
index.html          Interfaz y vistas
css/styles.css      Diseño (tema claro/oscuro, estilos de impresión)
js/items.js         Los 195 ítems (Anexo A)
js/scales.js        Composición de escalas, facetas, índices de validez (Anexos B y C)
js/norms.js         Tablas de conversión D.1, D.2, D.3 y D.4
js/interpret.js     Corpus interpretativo (cap. 1, tablas 3.1, 3.3, 4.1, cap. 4)
js/scoring.js       Motor de corrección
js/report.js        Generación del informe en tres fases
js/selftest.js      Autocomprobación de integridad de datos
js/app.js           Controlador de la aplicación
```

## Qué es exacto y qué no

Esto importa para el uso clínico. Se ha implementado literalmente todo lo que el manual publica,
y se señala explícitamente lo que el manual **no** publica.

### Exacto (transcrito del manual)

| Elemento | Fuente |
|---|---|
| 195 ítems | Anexo A y cuadernillo |
| Composición de las 25 escalas y las 45 facetas | Anexo B |
| Ítems prototípicos (peso 2) frente a no prototípicos (peso 1) | Anexo C |
| Puntuación directa → tasa base (escalas 1–PP) | Anexo D.1 |
| Tasa base ajustada → percentil | Anexo D.2 |
| Índices modificadores X, Y, Z | Anexo D.3 |
| Facetas de Grossman → TB y percentil | Anexo D.4 |
| Escala V (3 ítems), escala W (25 pares) y sus puntos de corte | Anexo B, tabla 5.1 |
| Clasificación del estilo de respuesta por X | Tabla 5.2 |
| Reglas de inventario impuntuable, escala impuntuable y resultado inválido | Cap. 2 |
| Umbrales de TB 60 / 75 / 85 y su lectura | Cap. 4 |
| 13 categorías de respuestas significativas y sus mínimos | Anexo B |

La autocomprobación (pantalla **Diagnóstico**) verifica 28 invariantes, entre ellas que la
puntuación directa máxima que produce la ponderación coincide con la publicada en el Anexo B
**para las 25 escalas**, y que la escala X es exactamente la unión de los ítems de las escalas 1–8B.

### Derivado (no publicado en el manual)

**1. Dirección de puntuación V/F de cada ítem.** El Anexo B lista qué ítems componen cada escala
pero no si puntúan en «Verdadero» o en «Falso». Los ítems inversos se han derivado del contenido
y validado contra una restricción cuantitativa del propio manual: en el capítulo 4 se afirma que
los ítems inversos suponen el **22 %** de las escalas 4A, 5 y 7. Esta codificación produce 10
ítems inversos de 46 en esas tres escalas = 21,7 %. La coincidencia es un control externo fuerte
del criterio empleado, pero no es una fuente oficial.

**2. Magnitud del ajuste por la escala X.** El manual establece la dirección —con PD < 21 el
sistema *aumenta* las tasas base de 1–P y A–PP; con PD > 60 las *disminuye*— pero la tabla
numérica pertenece al corrector online de Pearson. Se aplica un modelo lineal explícito
(pendiente 1,0 por debajo de 21; 0,26 por encima de 60; tope ±14 puntos de TB), definido en
`MCMI_SCORING.CONFIG.adjustments.x` y documentado en cada informe.

**3. Magnitud del ajuste por A/CC.** Igual situación: el manual indica que la suma de los puntos
de TB de A y CC que exceden de 75 *disminuye* las TB de 2B, 8B, C, 2A y S, sin publicar la tabla.
Se aplica un decremento graduado con pesos decrecientes en ese mismo orden.

**4. Imputación de ítems omitidos.** El manual asigna «la respuesta típica de la muestra de
tipificación» cuando faltan de 1 a 4 ítems en una escala; ese vector no se publica. Aquí los
ítems omitidos no puntúan y se listan explícitamente en el informe.

Por estas razones el informe **siempre muestra la tasa base sin ajustar junto a la ajustada**, y
los ajustes se pueden desactivar con un interruptor en la pantalla de resultados. Cualquier
conclusión puede así reconstruirse sin ellos.

## Cualificación y límites

El MCMI-IV requiere nivel de cualificación C: titulación superior en psicología o psiquiatría y
experiencia profesional en diagnóstico clínico. Está baremado con 889 pacientes españoles y es
aplicable a adultos desde 18 años que buscan o reciben atención psicológica. No es un instrumento
de evaluación de la personalidad para población general ni es apropiado para adolescentes.

Esta herramienta reproduce el procedimiento de corrección descrito en el manual con fines de
apoyo clínico personal. No está afiliada a Pearson ni a DICANDRIEN, Inc. y no sustituye a la
plataforma oficial de corrección. MCMI y Millon son marcas registradas por DICANDRIEN, Inc.;
adaptación española © 2018 DICANDRIEN, Inc., distribuida por Pearson Educación, S.A.
