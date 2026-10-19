# Identidad Y Vida Ambiental

Nota de inventario del 2026-10-19: se retiran los exports de los dos bosques sustituidos, conservando sus originales. La biblioteca actual tiene 29 recursos, no las 31 entradas de la revision historica descrita abajo. Ver [limpieza y comprobaciones](ASSET_CLEANUP.md).

Revision del 2026-10-15, en sandbox para revision del usuario. La primera ampliacion repetia iglesias, tumbas y arboles entre zonas. Esta pasada sustituye esas copias por hitos propios y movimiento ambiental acotado. No toca Miga, el HUD, los limites del mundo o las reglas de simulacion.

Actualizacion del 2026-10-16: [Luz y profundidad](DAYLIGHT.md) es la especificacion vigente de paleta, cielo, oclusion y transiciones. La evidencia numerica al final de esta guia corresponde a la pasada artistica anterior; los resultados actuales estan en [Verificacion](VERIFICATION.md).

## Mapa Artistico

| Zona | Hitos propios | Materiales y flora |
| --- | --- | --- |
| Oeste, -560 a 0 | Roble seco, angel de pie, ciudadela con puente/cascada, tumba con rosas, obelisco y cruz rota | Marmol claro, granito oscuro, espigas secas, flores rosadas/azules y hierbas |
| Centro, 0 a 560 | Una iglesia, dos robles distintos, dintel y las tres tumbas originales | Piedra con musgo, sotobosque y hongos originales |
| Este, 560 a 1120 | Fresno plateado, grupo de cipreses, torre rota, un mausoleo, losa con flores, angel reclinado y urna | Corteza clara, terracota, piedra expuesta y hongos ocres/marfil/lilas |

Cada hito, monumento y arbol protagonista se coloca una sola vez en todo el recorrido. Las regresiones verifican tanto los IDs de composicion como las llamadas de dibujo en una observacion general. Los modulos de suelo/verja y la vegetacion central anterior siguen reutilizandose: no se afirma que cada pixel de la escena sea exclusivo.

Las franjas florales del oeste y de hongos del este son distintas y tienen una sola colocacion cada una. No se copian debajo del suelo. Se reduce su escala a 0.8 para que las flores no alcancen la altura de Miga. La tumba clara se separa del centro del encuadre oeste para mejorar el contraste del personaje.

## Dibujo Y Profundidad

Doce assets nuevos de ImageGen integrado; 31 recursos en la biblioteca, con originales intactos y PNG nativos de alpha binario. Los dibujos nuevos no se presentan como pixel art manual. Los dos fondos anteriores permanecen disponibles, pero no se dibujan en el mundo activo. Procedencia y prompts en [Generacion](../assets/reference-biome/IDENTITY_GENERATION.md).

El QA visual detecta que la primera normalizacion estiraba las copas horizontalmente. Los fondos se corrigen conservando la relacion de aspecto del contenido: bosque lejano de 1600 x 220 y franja intermedia de 900 x 213, sin mosaico. El bosque lejano cubre las vistas normales de caminar; en una observacion ultraancha la franja intermedia es un cinturon finito, no un fondo estirado para llenar todo el ancho.

Un unico origen de camara: bosque lejano 0.12, ciudadela 0.22, intermedio 0.34, torre 0.56, cipreses 0.68, mausoleo 0.86 y elementos del sendero 1.0. La ciudadela usa escala 0.58 y queda detras del bosque intermedio. Un suelo forestal irregular cierra los huecos de cielo bajo las capas. No se agrega niebla horizontal, blur global ni seguimiento independiente por plano.

La cascada forma parte del dibujo de la ciudadela y es estatica. Los arboles tampoco se deforman. Animar agua u hojas de las copas queda fuera de esta pasada.

## Movimiento

`AmbientLife` es una capa de presentacion pura. No lee guardados, no modifica necesidades y no depende del reloj real ni de azar por fotograma. Sus muestras dependen de camara, iluminacion horaria continua y tiempo ambiental del renderer.

- Noche: hasta ocho luciernagas visibles, nucleo nativo de 1 x 1, halo de 3 x 3 con alpha maximo menor de 0.05. Brillo independiente y gradual; trayectorias locales alrededor de seis habitats del mundo.
- Atardecer y amanecer: trayectorias iguales, intensidad progresiva segun oscuridad. De dia no se dibujan luciernagas.
- Dia: dos mariposas pequenas, cada una vinculada a una zona floral y con trayectoria y aleteo propios. Hojas de dos arboles caen durante nueve segundos de ciclos mas largos; hay intervalos sin hojas.
- Las particulas se dibujan detras de Miga. Desactivar movimiento ambiental conserva trayectorias, aleteo y variacion del brillo; la iluminacion solar sigue activa y determina gradualmente que especies aparecen. No hay un temporizador aparte para mover particulas.

## Evidencia Y Pendientes

202 pruebas y build correctos. Veinte regresiones nuevas cubren identidad, fondos y movimiento. El renderer offline pasa 504 casos y coteja 321 384 pixeles opacos de Miga, con atlas/fallback iguales y pausa exacta. Los 31 PNG suman 1 335 322 pixeles con alpha 0/255. Se conservan 280 archivos protegidos por SHA-256, incluidos los 19 dibujos previos, logica, persistencia, camara, HUD y dependencias.

Las muestras animadas son WebP lossless offline, con doce segundos de tiempo representado. El encoder puede fusionar fotogramas identicos manteniendo la duracion; no se equipara su cantidad a FPS reales. Se verifica el primer fotograma contra el buffer original sin perdida.

El control de navegador no respondio ni al recuperar la pestana ni al abrir una nueva. La apertura del visor mediante la app quedo en cola. No hay nuevas capturas reales de navegador en esta revision ni se reutilizan capturas anteriores como si lo fueran. Las laminas, vistas moviles y animaciones nuevas son renders offline claramente identificados.

Pendientes: revision artistica, comprobacion en navegador, recorrido prolongado, Android fisico, rendimiento/consumo y desconexion real del build. No se copia esta propuesta a Desktop ni se ejecutan acciones de escritura de Git sin aprobacion.
