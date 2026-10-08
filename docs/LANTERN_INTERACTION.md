# Miga Y El Farol

## Alcance

Primera interaccion ambiental diferenciada, posterior a la base visual de ramas y luz. Se conserva el ID persistente `can`, tipo `lantern`, su posicion x=164, las zonas de toque y todos los assets aprobados. No se modifica ningun sprite ni clip de Miga, paleta editable, necesidad, recompensa, dependencia o esquema de guardado.

## Comportamiento

- La IA conserva su seleccion autonoma de objetivos. Tocar el farol tambien usa la misma ruta de investigacion.
- Desde cada lado, Miga llega a 25 pixeles del centro del farol, gira hacia el objeto y se detiene. Se conserva la tolerancia de llegada existente, menor de 0.1 pixel.
- La inspeccion del farol dura 6.5 segundos de simulacion de noche. De dia, al atardecer y ante los demas objetos siguen siendo 4.5 segundos.
- Se reutiliza el clip aprobado `inspect`. Al terminar, se registra el descubrimiento y la IA vuelve a decidir, con las mismas recompensas anteriores.
- El toque y la energia baja pueden interrumpir la observacion. La respuesta visual pierde intensidad gradualmente; no prolonga ni impide el descanso.

## Respuesta De La Llama

`src/world/LanternInteraction.js` contiene la duracion, condiciones de atencion y respuesta continua compartidas por la IA y el renderer. Solo se activa al inspeccionar el farol correcto, de noche, mirando hacia el y a la distancia prevista.

El renderer usa el frame original `rest` del farol como base estable. Sobre los tokens existentes del vidrio y llama se mezcla el color claro de la misma paleta, con entrada y salida suaves y una oscilacion pequena. No se alternan siluetas de llama en el mundo. Los dos frames originales del asset siguen disponibles en el laboratorio y no cambian sus fuentes, exports o tiempos.

La mascara nativa se crea una vez y se reutiliza. No hay halos, desenfoque, particulas, cambios de tamano, lectura del framebuffer ni regeneracion de atlas durante la animacion. El tinte ambiental del suelo conserva el alcance aprobado y no pulsa con esta interaccion.

La intensidad vive solo en el renderer. El objetivo, duracion y tiempo de inspeccion usan los campos de guardado existentes. No se inventan reacciones o descubrimientos durante el progreso offline. La pausa del visor y el ajuste de movimiento ambiental congelan la respuesta.

## Visor

`biome-lab.html` incorpora un boton de llama, con nombre accesible y tooltip `Observar farol`. Ejecuta la IA real en la vida temporal del visor, sin acceder a la partida. El selector de Miga refleja caminar u observar y vuelve a la pose anterior al acabar. Cambiar manualmente posicion o pose cancela el ensayo; la pausa lo conserva. De dia y al atardecer se observa sin respuesta adicional de luz.

## Verificacion

- 117 pruebas del motor y build de las tres vistas. Doce regresiones nuevas cubren fases, llegada desde ambos lados, parada, orientacion, condiciones de activacion, continuidad, easing a 30/60/120 Hz, pausa, interrupcion y guardados.
- Renderer de produccion fuera del navegador: solo 53 pixeles existentes del vidrio cambian; incremento maximo de dos niveles RGB entre fotogramas consecutivos a 60 Hz. Atlas y fallback producen los mismos pixeles; no hay respuesta adicional diurna o vespertina. Desactivar el movimiento conserva exactamente la imagen.
- SHA-256: los 178 archivos de assets previos permanecen intactos, incluido el kit completo de Miga y la biblioteca ambiental.
- Capturas reales del visor en navegador a 1280 x 720 y 320 x 720, con observacion nocturna y diurna. Llegada desde la izquierda y final de inspeccion comprobados. Pausa y controles sin desbordamiento horizontal. Toque del farol comprobado tambien en el mundo autonomo diurno.
- El GIF de 180 frames usa la IA y el renderer de produccion fuera del navegador. El objetivo inicial es el farol; luego se ejecutan llegada, inspeccion y nueva decision. No es una captura de navegador ni una medicion de rendimiento.

Pendientes: Android fisico, rendimiento y consumo prolongados, repetir la desconexion real, y revisar el comportamiento nocturno prolongado en una partida autonoma. Los tests de 60 Hz no certifican el framerate real del navegador o del telefono.
