# Miga: personaje estable

El diseno de esqueleto sin accesorios fue aprobado por el usuario. Reemplaza a la antigua Miga con capa en el mundo y en el visor; el ID activo sigue siendo `miga`, sin cambiar identidades de guardado ni descubrimientos.

## Anatomia y movimiento

- Rig `skeleton-v2`: 64 x 64 px, ancla [32, 61]. La silueta frontal aprobada mantiene sus proporciones.
- Cinco fuentes originales: `skull`, `ribs`, `pelvis`, `arm`, `leg`. Siete slots separan ambas extremidades.
- Frontal para reposo y expresiones; craneo de perfil compacto de 15 x 15 px dentro de la pieza de 20 x 22, siguiendo la ultima referencia del usuario. Corona de 7 px, ojo de 2 x 4 y dientes de anchos desiguales, con un pequeno cuello bajo la parte posterior.
- El torax es asimetrico: su borde posterior queda fijo mientras el frente se ensancha de 6 a 8 y 10 px hacia abajo. El orden del perfil es brazo lejano, torax, brazo cercano. Las costillas ocultan parte del humero lejano; el cercano queda por fuera y visible desde el hombro. Reflejar la figura para caminar a la izquierda conserva esa profundidad relativa.
- Ocho fases de caminata alternan contacto, descenso, paso y subida en ambos lados. Las piernas conservan los dos segmentos del reposo (muslo y pierna), unidos en la rodilla. Los tubos usan el mismo trazo escalonado de 4 px, con 2 px interiores y contorno de 1 px por lado. Se conservan exactamente las posiciones de cadera, rodilla, tobillo y suela, los offsets, los pies con volumen y los ocho tiempos de 120 ms aprobados. El pie de apoyo permanece en el suelo.
- Los brazos tienen dos segmentos (humero y antebrazo), separados solo en el codo, como en reposo. Ambos usan el trazo de 4 px del reposo. La mano se ensancha desde la misma seccion de muneca, sin raya negra ni articulacion adicional.
- Los hombros del perfil quedan anclados en [30, 27] y [32, 27], mas el rebote vertical del torax. Cinco posiciones por plano mueven el codo de lado a lado y el antebrazo acompana el pendulo; no se limita el giro a un codo fijo. La longitud del humero varia menos de medio pixel por el redondeo de la cuadricula. El brazo lejano usa variantes `far-swing-*` con recorrido invertido antes del espejo, para contrabalancear de verdad en coordenadas del mundo.
- El brazo y la pierna lejanos usan sombras de la misma paleta para separar la profundidad. El brazo cercano cruza el borde del torax en primer plano, manteniendo visible la mayor parte de las costillas.
- Dormir tiene catorce fases: ojos pesados, bostezo, cierre de boca, flexion gradual de rodillas, liberacion de brazos, caida escalonada y aterrizaje. Los pies conservan sus suelas y apoyo durante la flexion. Las extremidades caidas usan `sleep-folded` y `sleep-folded-air`: cada brazo conserva dos segmentos unidos en el codo y cada pierna se dobla en la rodilla, en lugar de dividirse en grupos de huesos.
- Las costillas y la pelvis del descanso se dibujan delante de las cuatro extremidades. La pelvis se separa horizontalmente del torax para conservar ambos disenos completos. El brazo lejano queda mas alto y las piernas se reflejan para distinguir sus siluetas dobladas. Un pie sobresale a la derecha de las costillas, con una columna transparente antes del craneo. No se modifica el dibujo de las costillas, de la pelvis ni del craneo.
- El torax caido baja 3 px y se desplaza 3 px hacia la izquierda: su contorno termina en el suelo del rig (y = 61), sin penetrarlo en el impacto. Conserva un pequeno rebote de 1 px antes de volver al apoyo; el pie visible tambien mantiene su suela sobre el suelo.
- La cabeza aterriza despues que las piernas y rebota 4, 2 y finalmente 1 px, conservando su volumen y sin rotar la figura completa. Su recorrido y los tiempos de todas las fases se mantienen. La entrada dura 1420 ms, se reproduce una sola vez y `loopFrom: 13` mantiene el descanso inmovil.
- Despertar comienza en esa misma composicion y reconstruye la anatomia. Las poses de huesos caidos heredan las siluetas y capas nuevas; sus tiempos no cambian. Termina en reposo frontal y mantiene su ultimo frame.
- Boquita de tres posiciones y saludo de un solo brazo. Sin audio.

Las rotaciones de 90 grados son por pieza para las costillas y la pelvis del monton; no sustituyen el dibujo de una vista nueva. Los limites visibles se exportan por frame y controlan el area de toque y la posicion de los simbolos. El margen del mundo es de 32 px para que los huesos tampoco se recorten en los extremos. Los guardados existentes mantienen su vida; un estado SLEEP con tiempo avanzado abre directamente el descanso, sin repetir la caida.

## Revision

El visor `/asset-lab.html?character=miga&clip=walk` abre la caminata. Cambiar a Dormir o Despertar y comprobar ambas direcciones. `assets/generated/animation-review.png` es una hoja estatica de ocho poses; `miga.png` muestra el saludo ampliado con transparencia. El atlas PNG/JSON contiene las animaciones reutilizables.

Los estudios anteriores y las versiones previas tienen respaldos locales fuera de la carpeta activa, en `work/archive/skeleton-promotion/`, `work/archive/animation-refinement/`, `work/archive/walking-reference/`, `work/archive/walking-profile-detail/`, `work/archive/walking-shoulder-swing/`, `work/archive/walking-arm-depth/`, `work/archive/sleep-staging/`, `work/archive/sleep-layout/` y `work/archive/sleep-ground-contact/` del espacio de trabajo. No forman parte del kit ni se cargan en el juego.

## Referencias de movimiento

- [Skeleton Sprite, r0ar](https://opengameart.org/content/skeleton-sprite): fuente del autor con caminata, huesos independientes y colapso. CC0. Referencia conceptual, no se incorporaron sus sprites.
- [Pixel art skeleton, tbbk](https://opengameart.org/content/pixel-art-skeleton): hoja del autor de 32 x 32 con cuatro pasos. CC0. Referencia de lectura a baja resolucion, sin importar sus pixeles.
- [ThePixelGame: Skeleton Animations](https://thepixelgame.itch.io/fantasy-rpg-16x16-skeleton-animations/devlog/1081335/new-pixel-art-skeleton-animations-are-here-new-release): su descripcion de colapso en huesos inspira el descanso de Miga, no una muerte. El GIF enlazado por la pagina no pudo abrirse; no se copio arte del paquete.
- [SpriteKitchen: Walk Cycle](https://spritekitchen.com/blog/how-to-animate-pixel-art-walk-cycle/): contacto/paso, pie de apoyo y verificacion a velocidad real. Se adaptaron estos principios al ciclo de ocho fases.

## Pruebas de esta iteracion

- 66 tests de fuentes, atlas, rotaciones independientes, bucles con entrada, profundidad, area de toque, guardado y simulacion. Las regresiones fijan los pixeles de todos los clips ajenos a dormir y sus poses compartidas con despertar, incluyendo caminar. Se conservan todos los tiempos de todos los clips y los primeros cinco fotogramas de la entrada. Se verifican tambien el bostezo, el apoyo de las suelas durante la flexion, las fases de aterrizaje, el rebote amortiguado y que ningun hueso penetre el suelo.
- Una regresion nueva comprueba el contacto real del contorno del torax con el suelo y su rebote de 1 px. El pie debe conservar al menos cuatro columnas visibles y cuatro pixeles interiores, ademas de una suela apoyada y separacion del craneo, en ambas direcciones.
- Las cuatro variantes nuevas de extremidades tienen una sola silueta conectada y una articulacion reconocible. Se comprueba pixel por pixel que las piezas caidas no tapen las costillas ni la pelvis, incluso al reflejar la figura, y que estas dos piezas permanezcan separadas. Dormir y despertar comparten exactamente su pose de descanso.
- Las pruebas previas de caminata siguen cubriendo las trayectorias de rodillas, tobillos y suelas, el anclaje del hombro, el codo movil, el contrabalanceo y la muneca continua. Se comprueba pixel por pixel la profundidad de ambos brazos en las ocho fases y sus reflejos.
- La hoja y el GIF de dormir muestran las catorce fases fuente; el GIF muestra ambas direcciones. Su repeticion sirve para revisar la entrada: en el juego el desarme ocurre una sola vez.
- La composicion final apoyada se comprobo en el visor real en ambas direcciones, con la linea de suelo activada. Se guardaron una comparacion antes/despues y capturas reales. La hoja fuente y el GIF cubren las catorce fases; no se presenta esta revision como una captura del visor para cada fase ni como una nueva validacion movil.
- El atlas exportado se verifica pixel por pixel contra todas las fuentes, sin tolerancia. Los relojes de las miniaturas permanecen independientes del bucle seleccionado.
