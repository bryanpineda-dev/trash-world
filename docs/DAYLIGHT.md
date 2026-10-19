# Luz Y Profundidad

Revision del 2026-10-16 en sandbox. Corrige la lectura de distancia, el suelo entre bosque y verja y la presentacion horaria. No modifica los PNG originales, a Miga, el HUD, los guardados ni la duracion del dia.

## Planos

La ciudadela occidental se reduce a escala 0.58, con parallax 0.22 y base 71 pixeles por encima del sendero. Se dibuja despues del bosque lejano (0.12) y antes del intermedio (0.34): este ultimo oculta parte del puente y de la construccion. Ya no es un edificio grande delante de arboles supuestamente lejanos. La cascada sigue siendo estatica.

La franja clara combinaba mezcla atmosferica excesiva, relleno plano y huecos de cielo bajo las siluetas. Un suelo forestal oscuro y cromatico, con horizonte irregular y sotobosque, cierra esos huecos. Las sombras no se sustituyen por una banda de niebla. Se conserva el detalle de los PNG y se reduce la mezcla con el color del aire, especialmente en verja y arquitectura.

## Ciclo Continuo

`Daylight.js` recibe la hora de `WorldTime`, la misma del reloj del HUD. La simulacion mantiene un dia de 1440 segundos. Los limites de sus fases no cambian; la presentacion ya no usa esas etiquetas para cambiar bruscamente de paleta.

| Hora | Presentacion |
| --- | --- |
| 00:00 a 04:30 | Noche azul profunda |
| 04:30 a 06:30 | Salida gradual de la noche hacia el amanecer |
| 06:30 a 09:00 | Amanecer hacia cielo azul y vegetacion iluminada |
| 09:00 a 15:00 | Dia luminoso |
| 15:00 a 18:00 | Luz dorada progresiva |
| 18:00 a 19:30 | Crepusculo |
| 19:30 a 21:00 | Entrada continua en la noche |

Cinco grados de color reutilizables, interpolados con smoothstep. Las superficies se cachean por asset, grado y profundidad, no por hora ni fotograma. Se dibujan ambas muestras sobre la misma mascara opaca: la silueta no se disuelve durante la mezcla. No se recolorean todos los pixeles de los fondos en cada frame. El primer uso de un grado todavia tiene coste de preparacion; falta medir rendimiento en navegador y dispositivos fisicos.

Se preserva el croma verde de la vegetacion y el azul de la distancia. Una curva suave en las altas luces evita convertir el marmol claro en una masa blanca sin textura. La piedra con reflejos calidos no es una fuente emisiva; no recibe halos ni animaciones de luz. El cristal de la iglesia si tiene una mascara emisiva: frio durante el dia, ambar gradual al anochecer y variacion tenue de vela sin apagados intermitentes.

## Cielo Y Vida

Campo fijo de 840 estrellas distribuidas en el espacio del mundo, de un pixel nativo. Solo se dibujan las que entran en la vista; copas y arquitectura las ocultan porque el cielo se pinta primero. El brillo y su variacion son discretos, y su aparicion sigue el crepusculo. La luna conserva su color original, se eleva para mejorar su lectura y sigue detras del paisaje. Luna y mascara de vela se dibujan una sola vez, evitando duplicar su opacidad durante la mezcla de materiales.

Las luciernagas aparecen y desaparecen con la oscuridad, sin cambiar sus habitats o trayectorias. Mariposas y hojas se atenuan al atardecer y regresan por la manana. Las posiciones y el aleteo siguen el tiempo ambiental; el ciclo solar sigue la simulacion aunque se desactive el movimiento ambiental.

El visor del bioma incluye un control de hora continuo y presets de amanecer, dia, atardecer, crepusculo y noche. Acepta `?zone=west&hour=12&paused=1`. No lee ni escribe la partida.

## Evidencia

Las nuevas imagenes `daylight-*` son renders offline del renderer de produccion, no capturas de navegador. La animacion de ciclo comprime un dia de 24 minutos en 20 segundos (72x); no representa FPS ni velocidad del juego. Las muestras moviles solo validan el canvas, no el HUD ni un telefono real.

Pruebas: continuidad de cielo/luces/particulas, medianoche y antiguos limites de fase, mezcla de superficies, claves de cache acotadas, estrellas, mascaras alpha, altas luces, suelo y orden/escala de la ciudadela. Ademas se mantiene la bateria del motor, persistencia y Miga. Resultados finales en [Verificacion](VERIFICATION.md).

El control automatizado del navegador no respondio en esta pasada. Quedan pendientes QA real de navegador, rendimiento/consumo, movil fisico, desconexion y aprobacion artistica antes de pasar a la carpeta estable.
