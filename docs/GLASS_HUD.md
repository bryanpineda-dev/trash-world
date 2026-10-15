# Interfaz De Cristal Y Contacto

Revision del 2026-10-15 implementada y probada en sandbox, preparada para entrega local y versionado por solicitud del usuario. Etiqueta propuesta: `v0.1.10`, sin crear automaticamente. No se redibujan Miga ni el bioma.

## Contacto Con El Sendero

El renderer anterior dibujaba un rectangulo verde opaco del ancho de la pose. Se retira. `GroundContact` toma las dos filas cercanas al ancla de cada frame y encuentra tramos separados: pies apoyados o piezas del descanso. La sombra ocupa dos filas nativas debajo del apoyo, con alpha 0.16 y 0.06, y se refleja con la direccion del personaje.

El sendero tenia el ancla en la fila 8, con 227 columnas transparentes de 560. El ancla pasa a `[0,12]`; filas 11 y 12 son opacas en todo el ancho. Los pies permanecen en el suelo logico Y=0, sin desplazar el rig, las poses, los toques ni las trayectorias aprobadas. Ningun PNG cambia.

## Cristal Y Distribucion

El canvas del mundo ocupa toda la pantalla. Encabezado y pie dejan de reservar bandas solidas. Nombre y controles forman dos superficies de cristal separadas, y los stats quedan en un grupo pequeno abajo a la izquierda. El reloj queda abajo a la derecha.

Tinte gris carbon, borde fino y blur de 12 px con saturacion 1.12 solo detras de las superficies. El pixel art fuera de ellas sigue nitido. Existe un respaldo oscuro neutro cuando `backdrop-filter` no esta disponible y una variante sin blur para preferencia de transparencia reducida. Las barras no transicionan con movimiento reducido.

No se modifica la escala de pixeles ni el algoritmo de camara. Al ocupar el alto completo, el canvas dispone de mas espacio vertical. El HUD tiene composicion compacta para ventanas bajas y respeta safe-area; el comportamiento con una muesca fisica sigue pendiente de dispositivo real.

## Estados Y Reservas

| Estado | Color | Identificacion adicional |
| --- | --- | --- |
| Reposo | Gris salvia | Pausa y Descansando |
| Caminar | Verde suave | Huellas y Explorando |
| Mirar / inspeccionar | Celeste | Ojo o lupa y nombre del estado |
| Dormir | Lavanda | Luna y Durmiendo |
| Despertar | Dorado | Amanecer y Despertando |
| Sorpresa | Coral | Destello y Sorprendida |
| Alegria | Rosa | Corazon y Contenta |

Energia, saciedad y animo muestran valores 0-100 y barras accesibles con rol meter. Hasta 25 se usa coral; hasta 55, ambar; por encima, verde. Saciedad alta es buena, no hambre alta. Colores siempre acompanados de nombre, icono o valor: no son la unica informacion.

El HUD lee datos de la simulacion. No cambia necesidades, decisiones, recompensas, reloj, persistencia o reglas del juego. El guardado correcto se representa por un check discreto; un fallo o formato incompatible mantiene texto e icono de aviso visibles.

## Reloj Orbital

Dial de 24 horas con zonas de dia, atardecer y noche. Sol y luna se mantienen opuestos y sus glifos quedan derechos. La hora HH:MM y la fase permanecen en el centro. Arriba corresponde al mediodia, abajo a medianoche, izquierda al amanecer y derecha al atardecer.

La rotacion usa el tiempo transcurrido del mundo y no se reinicia al pasar de 23:59 a 00:00. No hay un bucle CSS que pueda desincronizarse. Un dia conserva la duracion original de 24 minutos reales; el contador de dias conserva `WorldTime.day`. Desactivar movimiento ambiental no detiene esta informacion funcional del reloj.

## Comprobaciones

- 170 pruebas y build correctos; 12 regresiones nuevas de modelo de HUD, reloj, sombras y ancla.
- Renderer offline: 432 casos, 289 980 pixeles opacos de Miga sin alteracion, atlas/fallback iguales, pausa ambiental exacta y piso opaco continuo.
- 254 archivos protegidos conservan SHA-256: arte, kit de Miga, logica, persistencia, camara y dependencias. El unico cambio ambiental de datos es el ancla del sendero.
- Navegador: mundo autonomo real y vistas controladas que importan el mismo renderer/HUD. En estas ultimas se prueban horas, poses y reservas sin acceder al guardado. La herramienta de revision es local y externa al proyecto; no forma parte del build.
- Capturas nuevas del juego, vista nocturna controlada y movil. La lamina de apoyo es offline, no evidencia de FPS o navegador.

Pendientes: Android fisico, coste de composicion del blur, pruebas prolongadas de bateria y una nueva prueba de desconexion real. No se extrapolan las cifras del panel de diagnostico a un benchmark. Preparar la entrega no equivale a crear un commit, etiqueta o publicacion.
