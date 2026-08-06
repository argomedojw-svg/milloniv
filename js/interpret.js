/* ==========================================================================
   MCMI-IV — Corpus interpretativo
   Contenido literal o parafraseado del Manual MCMI-IV (adaptación española):
     · Cap. 1  «Descripción de las escalas» y «Facetas de Grossman»
     · Tabla 3.1  Niveles funcionales en el espectro evolutivo
     · Tabla 3.3  Dominios funcionales y estructurales
     · Tabla 4.1  Estructura de polaridades
     · Cap. 4  Umbrales de tasa base y lógica configural
   ========================================================================== */
(function (global) {
  'use strict';

  /* Tabla 3.1 — Niveles funcionales del espectro */
  var SPECTRUM = {
    '1':  { normal: 'apático',           abnormal: 'asocial',       disorder: 'esquizoide' },
    '2A': { normal: 'tímido',            abnormal: 'retraído',      disorder: 'evitativo' },
    '2B': { normal: 'desanimado',        abnormal: 'abatido',       disorder: 'melancólico' },
    '3':  { normal: 'deferente',         abnormal: 'apegado',       disorder: 'dependiente' },
    '4A': { normal: 'sociable',          abnormal: 'complaciente',  disorder: 'histriónico' },
    '4B': { normal: 'entusiasta',        abnormal: 'eufórico',      disorder: 'tempestuoso' },
    '5':  { normal: 'seguro de sí mismo', abnormal: 'egotista',     disorder: 'narcisista' },
    '6A': { normal: 'engrandecedor',     abnormal: 'taimado',       disorder: 'antisocial' },
    '6B': { normal: 'firme',             abnormal: 'denigrante',    disorder: 'sádico' },
    '7':  { normal: 'fiable',            abnormal: 'constreñido',   disorder: 'compulsivo' },
    '8A': { normal: 'descontento',       abnormal: 'resentido',     disorder: 'negativista' },
    '8B': { normal: 'sacrificado',       abnormal: 'agraviado',     disorder: 'masoquista' },
    'S':  { normal: 'excéntrico',        abnormal: 'esquizotípico', disorder: 'esquizofrénico' },
    'C':  { normal: 'inestable',         abnormal: 'límite',        disorder: 'ciclofrénico' },
    'P':  { normal: 'desconfiado',       abnormal: 'paranoide',     disorder: 'parafrénico' }
  };

  /* Tabla 4.1 — Estructura de polaridades */
  var POLARITIES = {
    '1':  { existencia: 'Débil-Débil',                adaptacion: 'Fuerte-Débil',            replicacion: 'Medio-Débil' },
    '2A': { existencia: 'Débil-Fuerte',               adaptacion: 'Débil-Fuerte',            replicacion: 'Medio-Medio' },
    '2B': { existencia: 'Débil-Fuerte',               adaptacion: 'Fuerte-Medio',            replicacion: 'Medio-Medio' },
    '3':  { existencia: 'Medio-Medio',                adaptacion: 'Fuerte-Débil',            replicacion: 'Débil-Fuerte' },
    '4A': { existencia: 'Medio-Medio',                adaptacion: 'Débil-Fuerte',            replicacion: 'Medio-Fuerte' },
    '4B': { existencia: 'Fuerte-Débil',               adaptacion: 'Débil-Fuerte',            replicacion: 'Medio-Medio' },
    '5':  { existencia: 'Medio-Medio',                adaptacion: 'Fuerte-Débil',            replicacion: 'Fuerte-Débil' },
    '6A': { existencia: 'Medio-Débil',                adaptacion: 'Débil-Fuerte',            replicacion: 'Fuerte-Débil' },
    '6B': { existencia: 'Medio-Fuerte (invertida)',   adaptacion: 'Débil-Fuerte',            replicacion: 'Medio-Débil' },
    '7':  { existencia: 'Débil-Medio',                adaptacion: 'Fuerte-Débil',            replicacion: 'Débil-Medio (conflictiva)' },
    '8A': { existencia: 'Débil-Medio',                adaptacion: 'Medio-Fuerte',            replicacion: 'Medio-Débil (conflictiva)' },
    '8B': { existencia: 'Débil-Fuerte (invertida)',   adaptacion: 'Fuerte-Medio',            replicacion: 'Débil-Medio' },
    'S':  { existencia: 'Débil-Débil (vacilante)',    adaptacion: 'Débil-Débil (vacilante)', replicacion: 'Débil-Débil (vacilante)' },
    'C':  { existencia: 'Medio-Medio (conflictiva)',  adaptacion: 'Medio-Medio (conflictiva)', replicacion: 'Medio-Medio (conflictiva)' },
    'P':  { existencia: 'Medio-Medio (inalterable)',  adaptacion: 'Medio-Medio (inalterable)', replicacion: 'Medio-Medio (inalterable)' }
  };

  /* Tabla 3.3 — Atributos por dominio */
  var DOMAIN_LABELS = ['Expresión emocional', 'Comportamiento interpersonal', 'Estilo cognitivo',
    'Dinámicas intrapsíquicas', 'Autoimagen', 'Contenido intrapsíquico',
    'Arquitectura intrapsíquica', 'Estado de ánimo/temperamento'];

  var DOMAINS = {
    '1':  ['imperturbable', 'desvinculado', 'empobrecido', 'intelectualización', 'displicente', 'escaso', 'indiferenciada', 'apático'],
    '2A': ['intranquila', 'aversivo', 'distraído', 'fantasía', 'alienada', 'vejatorio', 'frágil', 'angustiado'],
    '2B': ['abatida', 'indefenso', 'fatalista', 'ascetismo', 'inútil', 'abandonado', 'mermada', 'afligido'],
    '3':  ['pueril', 'sumiso', 'ingenuo', 'introyección', 'inepta', 'inmaduro', 'incompleta', 'pacífico'],
    '4A': ['dramática', 'buscador de atención', 'frívolo', 'disociación', 'sociable', 'superficial', 'inconexa', 'inconstante'],
    '4B': ['impetuosa', 'eufórico', 'disperso', 'magnificación', 'sobreestimada', 'diseminado', 'inconsistente', 'voluble'],
    '5':  ['arrogante', 'explotador', 'expansivo', 'racionalización', 'admirable', 'artificioso', 'aparente', 'despreocupado'],
    '6A': ['impulsiva', 'irresponsable', 'inconformista', 'irreflexión (paso al acto)', 'autónoma', 'degradado', 'incontrolable', 'insensible'],
    '6B': ['precipitada', 'desagradable', 'dogmático', 'aislamiento', 'combativa', 'pernicioso', 'eruptiva', 'hostil'],
    '7':  ['disciplinada', 'respetuoso', 'constreñido', 'formación reactiva', 'responsable', 'oculto', 'compartimentada', 'contenido'],
    '8A': ['resentida', 'no cooperador', 'cínico', 'desplazamiento', 'descontenta', 'fluctuante', 'divergente', 'irritable'],
    '8B': ['abstinente', 'condescendiente', 'inseguro', 'exageración', 'desmerecedora', 'devaluado', 'invertida', 'disfórico'],
    'S':  ['peculiar', 'reservado', 'circunstancial', 'anulación', 'disociada', 'caótico', 'fragmentada', 'aturdido/inanimado'],
    'C':  ['explosiva', 'paradójico', 'vacilante', 'regresión', 'inestable', 'incompatible', 'disgregada', 'lábil'],
    'P':  ['defensiva', 'provocador', 'desconfiado', 'proyección', 'inviolable', 'inalterable', 'rígida', 'irascible']
  };

  /* Cap. 1 — Descripción de las escalas */
  var DESCRIPTIONS = {
    '1': 'Los sujetos esquizoides se caracterizan por su falta de deseo y su incapacidad para sentir placer o dolor intenso; se muestran indiferentes a las relaciones sociales y tienden a ser apáticos, distantes y asociales. Sus emociones y necesidades afectivas son mínimas y actúan como observadores pasivos, desligados del beneficio y del afecto que aportan las relaciones humanas.',
    '2A': 'Los sujetos evitativos experimentan pocos refuerzos positivos procedentes de sí mismos o de los demás y están siempre alerta, preparados para distanciarse de las experiencias dolorosas. Su estrategia adaptativa refleja miedo y desconfianza. Mantienen una vigilancia constante para evitar que su anhelo de afecto acabe repitiendo el dolor experimentado con otras personas; pese a desear relacionarse, han aprendido que es mejor negar esos sentimientos y mantener la distancia.',
    '2B': 'A diferencia de esquizoides y evitativos, los sujetos melancólicos experimentan el dolor como un estado permanente en el que el placer ya no se considera posible. Algunos presentan una predisposición biológica hacia el pesimismo y el desánimo; otros muestran un estilo de desesperanza ante las pérdidas importantes determinado por la experiencia.',
    '3': 'Los sujetos dependientes destacan por su falta de iniciativa y autonomía. Han aprendido a recurrir a los demás para obtener afecto, cuidados y seguridad, y a esperar pasivamente a que sean ellos quienes los dirijan. Asumen un rol pasivo en las relaciones y se someten voluntariamente a los deseos de los demás a fin de conservar su afecto.',
    '4A': 'Los sujetos histriónicos, al igual que los dependientes, recurren a los demás, pero maximizan la atención y los favores que reciben manipulando los hechos de forma superficial y entusiasta. Su comportamiento social, inteligente y a menudo ingenioso, transmite confianza; bajo esa apariencia subyace el miedo a la autonomía real y la necesidad de señales recurrentes de aceptación y aprobación.',
    '4B': 'Los sujetos tempestuosos son muy alegres y animados, pero su persistente euforia, entrometimiento y volubilidad puede resultar irritante. Aunque apasionados y entusiastas, se aburren con facilidad y carecen de la regularidad necesaria para llevar a término sus planes. Sin control, su conducta puede volverse extrema, temeraria y errática; con frecuencia este patrón tipo maníaco conduce al agotamiento depresivo.',
    '5': 'Los sujetos narcisistas destacan por su egocentrismo egotista y por sentir placer simplemente centrándose en sí mismos. Sus sentimientos de superioridad pueden no basarse en logros reales; conservan un aire arrogante de seguridad y, sin pretenderlo conscientemente, explotan a los demás en beneficio propio. Su confianza extrema hace que no se sientan motivados a implicarse en las interacciones sociales ordinarias.',
    '6A': 'Los sujetos antisociales destacan por su desconfianza hacia los demás, su deseo de autonomía y su anhelo de venganza por lo que consideran injusticias del pasado. Para contrarrestar el daño que prevén, se comportan de forma engañosa o cometen actos ilegales en beneficio propio. Son irresponsables e impulsivos y justifican estas cualidades porque consideran que los demás son desleales.',
    '6B': 'Los sujetos sádicos, a diferencia de los antisociales, pueden buscar placer y satisfacción personal humillando a otras personas y dejando a un lado sus derechos y sentimientos. Son hostiles y sumamente combativos, y las consecuencias destructivas de su conducta les son indiferentes o les satisfacen.',
    '7': 'Los sujetos compulsivos han sido intimidados y coaccionados para que acepten las exigencias que los demás les imponen. Su prudencia, control y perfeccionismo derivan de un conflicto entre la hostilidad hacia los demás y el miedo a la desaprobación social. Resuelven esta ambivalencia suprimiendo su resentimiento y exigiéndose mucho a sí mismos y a los demás.',
    '8A': 'Los sujetos negativistas se debaten entre aceptar las gratificaciones que otros les ofrecen o perseguir sus propios deseos. Vacilan entre la deferencia y el desafío y se enfrentan a interminables disputas y decepciones. Su conducta se caracteriza por un patrón errático de ira explosiva o resistencia, mezclado con periodos de culpa y vergüenza.',
    '8B': 'Los sujetos masoquistas se relacionan de forma servil y autosacrificada y permiten que se abuse de ellos, quizá incluso lo alientan. Muchos sostienen que merecen ser avergonzados y humillados. Rememoran activa y reiteradamente sus desgracias del pasado y, ante situaciones afortunadas, esperan que el resultado sea problemático.',
    'S': 'Los sujetos esquizotípicos prefieren el aislamiento social y los vínculos mínimos. Su funcionamiento cognitivo tiende a ser desorganizado, piensan tangencialmente y a menudo parecen absortos en sí mismos. Se distinguen por sus excentricidades. Si su patrón básico es activo muestran desconfianza ansiosa e hipersensibilidad; si es pasivo, aplanamiento emocional y afecto deficiente.',
    'C': 'Los sujetos límite se caracterizan por su inestabilidad y labilidad afectiva. Experimentan estados de ánimo endógenos intensos, con periodos recurrentes de abatimiento y apatía intercalados con periodos de ira, ansiedad o euforia. Muchos presentan pensamientos recurrentes de autolesión y suicidio, están extremadamente preocupados por conservar el afecto de los demás y tienen dificultades para mantener el sentido de su propia identidad.',
    'P': 'Los sujetos paranoides se muestran desconfiados y en alerta, tensos y a la defensiva ante posibles críticas y engaños. Presentan una irritabilidad desabrida y tienden a hacer que los demás se exasperen. Se distinguen por la inmutabilidad de sus sentimientos y la inflexibilidad de su pensamiento, y expresan miedo a perder la independencia, lo que los lleva a resistirse al control externo.',
    'A': 'La mayoría de los pacientes ansiosos muestran un estado generalizado de tensión que se manifiesta en la incapacidad de relajarse, en movimientos nerviosos y en una tendencia a sobresaltarse fácilmente. A menudo se quejan de molestias físicas inespecíficas. Es característica la inquietud por problemas que creen inminentes, un estado de alerta excesivo y una irritabilidad generalizada.',
    'H': 'Los pacientes con síntomas somáticos están frecuentemente preocupados por su mala salud y por dolores desmesurados pero inespecíficos. Interpretan la fatiga persistente o las molestias leves como indicadores de enfermedades graves y tienden a sobrevalorar la enfermedad real pese a que los médicos les tranquilicen. Normalmente utilizan los problemas somáticos para llamar la atención.',
    'N': 'Los pacientes que experimentan desde síntomas ciclotímicos hasta síntomas bipolares de mayor gravedad pueden pasar por periodos de euforia superficial, autoestima exagerada, hiperactividad y falta de atención, con nerviosismo, presión del habla, impulsividad e irritabilidad. Planifican en exceso objetivos poco realistas, necesitan dormir menos y presentan fugas de ideas y cambios de humor rápidos e inestables.',
    'D': 'Los pacientes con depresión persistente participan de la vida diaria pero durante años han estado angustiados, con sentimientos de desánimo o culpa, falta de iniciativa, apatía y baja autoestima. Expresan sentimientos de inutilidad y hacen comentarios autodenigrantes. Durante los periodos depresivos puede haber llanto, ideación suicida, visión pesimista del futuro, aislamiento social, alteraciones del apetito, fatiga crónica y falta de concentración.',
    'B': 'Los pacientes con puntuación alta probablemente tienen una historia de alcoholismo recurrente o reciente y han tratado de superar el problema con poco éxito. Consecuentemente se sienten muy mal en el ámbito familiar y laboral.',
    'T': 'Los pacientes con puntuación alta probablemente tienen una historia de drogadicción recurrente o reciente y suelen tener dificultades para reprimir sus impulsos o mantenerlos dentro de los límites sociales convencionales. En muchos casos son incapaces de gestionar las consecuencias personales de su conducta.',
    'R': 'Los pacientes con estrés postraumático han vivido o presenciado un acontecimiento relacionado con la muerte o con lesiones graves que les ha causado miedo intenso, impotencia u horror. Estos acontecimientos se reviven a través de sueños, pesadillas o recuerdos que producen mucho malestar. Pueden mostrar activación ansiosa, sobresaltos exagerados e hipervigilancia, y se esfuerzan por evitar lo que asocian con el trauma.',
    'SS': 'Los pacientes del espectro esquizofrénico pueden mostrar periódicamente conductas incongruentes, desorganizadas o regresivas. A menudo parecen confusos y desorientados; a veces muestran afectos inapropiados, alucinaciones aisladas y delirios no sistemáticos. Sus pensamientos pueden estar fragmentados y sus sentimientos aplanados. Pueden sentirse aislados e incomprendidos y mostrar conductas retraídas y reservadas.',
    'CC': 'Los pacientes con depresión mayor suelen ser incapaces de funcionar en un entorno normal y tienen una visión pesimista del futuro, ideación suicida y un sentimiento generalizado de resignación sin esperanza. Presentan miedos repetitivos y son meditabundos. Físicamente, algunos muestran deterioro motor y otros inquietud; pueden sufrir insomnio, cansancio intenso y cambios de peso.',
    'PP': 'Los pacientes delirantes habitualmente se encuentran en un estado paranoide agudo y periódicamente pueden mostrar agresividad y expresar delirios irracionales pero interconectados, de temática celosa, persecutoria o de grandeza. Pueden presentar alteración del pensamiento e ideas de referencia, así como recelo y vigilancia constante ante una posible traición. Su estado de ánimo suele ser hostil y se sienten acosados y maltratados.'
  };

  /* Cap. 1 — Facetas de Grossman */
  var FACET_DESC = {
    '1.1': 'Se mantienen indiferentes y distantes y rara vez muestran una respuesta a las acciones o sentimientos de los demás. Prefieren las actividades solitarias y tienen mínimo interés por el resto de las personas.',
    '1.2': 'Carecen notablemente de representaciones objetales interiorizadas. Las pocas que tienen están mínimamente articuladas y les faltan percepciones y recuerdos de sus relaciones con los demás.',
    '1.3': 'No se alteran emocionalmente y muestran insensibilidad intrínseca y frialdad. Refieren pocas necesidades afectivas o sexuales y casi nunca manifiestan sentimientos intensos.',
    '2A.1': 'Evitan las actividades que suponen relaciones personales estrechas y refieren un historial de ansiedad social y desconfianza. Buscan la aceptación pero no se implican salvo que tengan certeza de agradar.',
    '2A.2': 'Se ven a sí mismos como socialmente ineptos, incompetentes e inferiores, lo que justifica su aislamiento. Se sienten poco atractivos, subestiman sus logros y refieren una persistente sensación de vacío.',
    '2A.3': 'Sus representaciones interiorizadas se componen de recuerdos de relaciones tempranas problemáticas, intensos y conflictivos, que se reactivan fácilmente y limitan las opciones de satisfacción.',
    '2B.1': 'Su actitud ante prácticamente todo es derrotista y fatalista. Ven el lado más adverso de las cosas y esperan siempre lo peor; sienten que las cosas nunca mejorarán.',
    '2B.2': 'Consideran que no valen nada, que son insignificantes e irrelevantes. El menor error puede sumirles en un estado grave de desánimo y creen que deberían ser criticados y menospreciados.',
    '2B.3': 'Están apenados, tristes y malhumorados; su estado de ánimo se intensifica por su tendencia a preocuparse y a sentirse culpables. Su abatimiento casi permanente mina su capacidad de disfrutar.',
    '3.1': 'Se desvinculan de las responsabilidades adultas. Son dóciles y pasivos, evitan ser asertivos, tienden a parecer indefensos y buscan afecto, atención y protección de manera infantil.',
    '3.2': 'Se someten a figuras más fuertes y protectoras, sin las cuales pueden sentirse angustiadamente solos. Necesitan consejos y seguridad de forma desmesurada; son obedientes y conciliadores.',
    '3.3': 'Se ven a sí mismos como débiles, frágiles e incompetentes. Menosprecian sus capacidades; gran parte de este autodesprecio funciona como estrategia para conseguir apoyo de los demás.',
    '4A.1': 'Reaccionan exageradamente y son volubles, provocadores y cautivadores. No toleran fracasos ni retrasos y reaccionan de forma impulsiva, teatral y sumamente emocional.',
    '4A.2': 'Buscan o exigen activamente que los elogien y manipulan a los demás para conseguir seguridad, atención y aprobación. Son exigentes, coquetos y seductoramente exhibicionistas.',
    '4A.3': 'Muy sensibles emocionalmente, muestran sentimientos que cambian con facilidad inusual. Pasan de la alegría al enfado o al aburrimiento; alta activación y bajo umbral de reactividad autónoma.',
    '4B.1': 'Enérgicos, decididos, emocionalmente excitables e intensamente entusiastas. Su espíritu incansable no siempre se traduce en logros efectivos y pueden volverse obstinados o cáusticos.',
    '4B.2': 'Socialmente muy optimistas y animados, intentan atraer a los demás con entusiasmo contagioso; bajo presión pueden volverse entrometidos, autoritarios e innecesariamente insistentes.',
    '4B.3': 'Se ven como una fuerza imponente e inspiradora cuya energía activa a los demás. Tienden a creerse invencibles y capaces de lograr más de lo objetivamente posible.',
    '5.1': 'Se sienten con privilegios, carecen de empatía y esperan favores especiales a cambio de nada. No valoran a los demás y los utilizan para satisfacer sus propios deseos.',
    '5.2': 'Imaginación desbocada centrada en fantasías de éxito, belleza o amor. La realidad objetiva los limita poco; hacen su propia interpretación de los hechos y a menudo mienten para sostener sus fantasías.',
    '5.3': 'Creen que son elogiables, especiales, únicos y dignos de admiración. Actúan con grandiosidad y seguridad, a menudo sin motivo, y mantienen la autoestima muy alta pese a la opinión ajena.',
    '6A.1': 'A menudo son desleales, incumplen o eluden deliberadamente sus obligaciones y no respetan los derechos de los demás. Sus conductas engañosas transgreden los códigos sociales establecidos.',
    '6A.2': 'Se perciben libres de las restricciones de las normas sociales y de la obligación de lealtad. Valoran la libertad y disfrutan sintiéndose sin responsabilidades ni rutinas.',
    '6A.3': 'Evitan las tensiones internas expresando sin límite pensamientos ofensivos y llevando a cabo acciones malintencionadas, por lo general sin culpa ni remordimiento. Se ven a sí mismos como víctimas.',
    '6B.1': 'Carecen de sensibilidad hacia los demás, les gusta polemizar y reaccionan con arrebatos repentinos e injustificados. Impávidos ante el dolor, actúan por venganza si se sienten ofendidos.',
    '6B.2': 'Encuentran placer al intimidar, coaccionar, humillar o menospreciar a los demás. Tienden a ser ofensivos verbalmente y posiblemente agresivos física o sexualmente.',
    '6B.3': 'Acumulan internamente una energía agresiva que acaba manifestándose en arrebatos impetuosos que amenazan con aniquilar su autocontrol, habitualmente efectivo.',
    '7.1': 'Llevan una vida muy estructurada y estrictamente organizada. Estrictos y responsables, necesitan mantener sus emociones bajo control; su perfeccionismo puede dificultarles completar tareas.',
    '7.2': 'Construyen el mundo en términos de reglas, normas y jerarquías. Se disgustan ante lo no familiar, son inflexibles respecto a las normas y ante la incertidumbre acaban bloqueados.',
    '7.3': 'Se ven como eficientes, disciplinados y diligentes. Se consagran al trabajo y restan importancia al ocio; su temor a ser vistos como irresponsables les lleva a sobrevalorar la disciplina y la prudencia.',
    '8A.1': 'Se resisten a cumplir las expectativas de los demás; actúan con procrastinación e ineficiencia y se muestran obstinados, oposicionistas e irritantes.',
    '8A.2': 'Se ven como incomprendidos, desafortunados y menospreciados. Reconocen estar resentidos, insatisfechos y desilusionados con la vida, y muestran envidia hacia quienes creen que la tienen más fácil.',
    '8A.3': 'Malhumorados y obstinados, se molestan con facilidad y tienden a replegarse enfurruñados. Baja tolerancia a la frustración; impacientes e inquietos salvo que las cosas salgan como quieren.',
    '8B.1': 'Se humillan a sí mismos y se consideran merecedores de deshonras y reproches. Ante elogios los consideran erróneos; ante expectativas incumplidas sienten que merecen consecuencias dolorosas.',
    '8B.2': 'Tienden a sentir placer cuando la reacción adecuada sería el dolor, y dolor cuando lo adecuado sería el placer. Esta transposición de la gratificación da lugar a frustración y a autosabotaje.',
    '8B.3': 'A veces ansiosos e inquietos, a veces apenados y tristes. Se sienten angustiados y pueden mostrarse deliberadamente quejumbrosos para provocar culpabilidad y malestar en los demás.',
    'S.1': 'Mezclan la comunicación social con irrelevancias personales, lenguaje circunstancial e ideas de referencia. Presentan a veces pensamiento mágico, ilusiones corporales y creencias raras.',
    'S.2': 'Se sienten confusos respecto a sí mismos y perplejos respecto a la sociedad; tienen experiencias aisladas de despersonalización y pensamientos recurrentes sobre el vacío y el sinsentido de la vida.',
    'S.3': 'Sus representaciones interiorizadas son una maraña de recuerdos diversos e impulsos erráticos, con canales desorganizados de regulación de la tensión y mediación de conflictos.',
    'C.1': 'Experimentan confusión por un sentido de identidad inmaduro o fluctuante, con sentimientos subyacentes de vacío. Intentan redimir sus actos impulsivos con remordimiento y conductas autopunitivas.',
    'C.2': 'Su estructura psíquica es inconsistente e incongruente, con elementos segmentados. Los niveles de conciencia pueden cambiar de repente, con episodios minipsicóticos transitorios ligados al estrés.',
    'C.3': 'Emocionalmente inestables; su desánimo y apatía crónicos se intercalan con periodos breves de ira, euforia o ansiedad, y con arrebatos impulsivos de ira o resentimiento.',
    'P.1': 'Siempre en alerta, actúan con cautela y extremada desconfianza para protegerse de engaños. Se resisten al control externo y saltan ante la más mínima ofensa real o percibida.',
    'P.2': 'Desconfían de las intenciones ajenas e interpretan erróneamente acciones inofensivas como pruebas de hipocresía o conspiración. Magnifican y distorsionan cualquier detalle para confirmar sus expectativas.',
    'P.3': 'No aceptan sus cualidades e intenciones despreciables y las atribuyen a los demás. Ciegos a sus propios rasgos indeseables, advierten los defectos más intrascendentes de los otros.'
  };

  /* Cap. 4 — Integración de la patología grave con los patrones clínicos */
  var SEVERE_INTEGRATION = {
    'S': { pairs: ['1', '2A'], text: 'Las variantes más disfuncionales de las personalidades esquizoide y evitativa se integran a menudo con la personalidad esquizotípica. Una elevación en S introduce una difusión generalizada que afecta a toda la estructura de polaridades: las metas motivacionales se vuelven más difusas y el pensamiento más alejado del mundo real.' },
    'C': { pairs: ['8B', '6B', '3', '4A', '7', '8A'], text: 'Las variantes más disfuncionales de las personalidades masoquista y sádica, dependiente e histriónica, y compulsiva y negativista, pueden integrarse con la personalidad límite. Una elevación en C introduce un efecto conflictivo generalizado en las tres polaridades: el resto del perfil debe leerse como marcado por la ambivalencia y la labilidad.' },
    'P': { pairs: ['5', '6A', '8B', '6B', '7', '8A'], text: 'Las variantes más disfuncionales de las personalidades narcisista y antisocial —y también masoquista, sádica, compulsiva y negativista— pueden integrarse con la personalidad paranoide. Una elevación en P tiende a inmovilizar y restringir todas las dimensiones de la estructura de polaridades: el patrón dominante se expresa con mayor rigidez, defensividad e inflexibilidad.' }
  };

  /* Escalas 4A, 5 y 7: posible lectura como fortalezas (cap. 4). */
  var CURVILINEAR = ['4A', '5', '7'];

  /* ------------------------------------------------------------------ */
  /* Funciones de banda y de redacción                                   */
  /* ------------------------------------------------------------------ */

  function band(br, group) {
    var clinical = (group === 'sindromes' || group === 'sindromesGraves');
    if (br >= 85) return clinical ? 'prominente' : 'trastorno';
    if (br >= 75) return clinical ? 'presente' : 'tipo';
    if (br >= 60) return clinical ? 'subumbral' : 'estilo';
    return 'no elevada';
  }

  var BAND_LABEL = {
    'trastorno': 'TB ≥ 85 · Trastorno de la personalidad',
    'tipo': 'TB 75–84 · Tipo de personalidad clínicamente significativo',
    'estilo': 'TB 60–74 · Estilo de personalidad',
    'prominente': 'TB ≥ 85 · Síndrome prominente',
    'presente': 'TB 75–84 · Síndrome presente',
    'subumbral': 'TB 60–74 · Sintomatología subumbral',
    'no elevada': 'TB < 60 · No elevada'
  };

  var BAND_CLASS = {
    'trastorno': 'sev-3', 'prominente': 'sev-3',
    'tipo': 'sev-2', 'presente': 'sev-2',
    'estilo': 'sev-1', 'subumbral': 'sev-1',
    'no elevada': 'sev-0'
  };

  /* Redacción de la implicación clínica de una elevación concreta. */
  function elevationSentence(scale) {
    var b = band(scale.br, scale.group);
    var n = scale.name.toLowerCase();
    switch (b) {
      case 'trastorno':
        return 'Con una tasa base de ' + scale.br + ', la elevación alcanza el umbral que el manual asocia a una patología suficientemente generalizada como para considerar un trastorno de la personalidad de tipo ' + n + '.';
      case 'tipo':
        return 'Con una tasa base de ' + scale.br + ', se sitúa en el rango de tipo de personalidad clínicamente significativo: es probable que presente rasgos problemáticos del constructo ' + n + ', potencialmente incapacitantes en determinados contextos, sin que ello equivalga por sí solo a un trastorno.';
      case 'estilo':
        return 'Con una tasa base de ' + scale.br + ', refleja un estilo de personalidad ' + n + ': rasgos posiblemente adaptativos con problemas moderados u ocasionales en áreas específicas.';
      case 'prominente':
        return 'Con una tasa base de ' + scale.br + ', el manual considera que el síndrome sobresale o es prominente en el cuadro clínico actual.';
      case 'presente':
        return 'Con una tasa base de ' + scale.br + ', el manual considera que el síndrome está presente.';
      case 'subumbral':
        return 'Con una tasa base de ' + scale.br + ', sugiere sintomatología de esta escala sin alcanzar el umbral de presencia (75); solo resulta indicativa si figura entre las puntuaciones más altas de esta sección del perfil.';
      default:
        return 'Tasa base de ' + scale.br + ': no alcanza el umbral de 60 y no se considera fiable ni válida para fines diagnósticos.';
    }
  }

  global.MCMI_INTERPRET = {
    SPECTRUM: SPECTRUM,
    POLARITIES: POLARITIES,
    DOMAIN_LABELS: DOMAIN_LABELS,
    DOMAINS: DOMAINS,
    DESCRIPTIONS: DESCRIPTIONS,
    FACET_DESC: FACET_DESC,
    SEVERE_INTEGRATION: SEVERE_INTEGRATION,
    CURVILINEAR: CURVILINEAR,
    band: band,
    BAND_LABEL: BAND_LABEL,
    BAND_CLASS: BAND_CLASS,
    elevationSentence: elevationSentence
  };
})(window);
