# Trash World

A tiny autonomous creature living inside your phone. A mobile-first pixel world built with Canvas, JavaScript, and curiosity.

## V0.1: The Creature

Miga vive en un pequeno mundo, explora objetos, descansa, duerme y despierta por su cuenta. Tiene necesidades y personalidad. Tocar la criatura, mantener el toque o tocar el entorno produce distintas reacciones. Su vida se guarda en el dispositivo.

Esta version incluye Canvas 2D, reloj del mundo, planta que puede investigar y comer, limites del mundo, memoria de descubrimientos, guardado versionado, progreso offline resumido, panel de depuracion y PWA. Miga es un esqueleto sin accesorios; el farol y la runa comparten un kit original de pixel art modular.

## Kit de assets

Paleta fija de 16 colores, personaje de 64 x 64 px construido con cinco piezas y siete slots independientes, diez clips y dos objetos animados. El fondo procedural conserva por ahora su arte de V0.1.

`assets/source/` guarda los originales editables. `npm run assets` produce un atlas PNG transparente, metadata JSON, una hoja comparativa y los iconos de la app. `npm run assets:check` valida el contrato del kit. Los archivos generados se incluyen junto a sus fuentes.

El visor esta en `/asset-lab.html`, tanto en desarrollo como en el build. Ver [guia de estilo](docs/ASSET_STYLE.md) y [flujo de trabajo](docs/ASSET_WORKFLOW.md).

La calaverita aprobada es el unico personaje activo, `miga`. Camina con ocho fases, craneo compacto de perfil y dientes desiguales; el torax se ensancha hacia abajo y oculta parte de los brazos. Al dormir sus huesos se separan y descansan junto a la cabeza; al despertar se reconstruye. La boquita y el saludo siguen disponibles en el visor, sin audio. Ver [contrato del personaje](docs/CHARACTER.md). Los estudios descartados se retiraron del kit activo; se conserva un respaldo local previo a la promocion.

## Desarrollo

Node.js 22.12 o posterior.

```sh
npm ci
npm run dev
```

La terminal muestra la URL disponible. El servidor usa otro puerto si el predeterminado esta ocupado.

```sh
npm test
npm run build
npm run preview
```

`dist/` es la aplicacion estatica lista para servir. No necesita backend, cuenta, analitica ni servicios remotos. `node_modules/` y `dist/` no se suben al repositorio.

## Android

Para probar el desarrollo desde un telefono en la misma red:

```sh
npm run dev -- --host 0.0.0.0
```

Abrir `http://IP-DE-LA-PC:5173` usando la IP local de la PC y el puerto que indique Vite. Windows puede solicitar permitir el acceso a la red local. Un navegador Android antiguo debe probarse con el build de produccion, porque el servidor de desarrollo usa funciones web recientes.

La instalacion PWA y el service worker requieren HTTPS o localhost. Una IP de red local por HTTP permite probar la escena, pero no ofrece cache offline ni instalacion PWA. Para la prueba completa en Android, servir `dist/` desde HTTPS o usar un tunel localhost con depuracion USB.

El cache offline se genera al compilar y se registra solo en produccion. Abrir la app una vez con conexion y esperar su carga; despues puede reabrirse sin red. Los datos permanecen asociados al origen y al perfil del navegador: cambiar el puerto, navegador o dominio crea una vida separada.

## Guardado

Se guarda cada cinco segundos, al interactuar y al ocultar la app. Los datos estan en `localStorage`, bajo `trash-world.save`. Los guardados danados se conservan como respaldo antes de iniciar otro mundo. Una version futura se protege contra sobrescritura. Si el almacenamiento esta bloqueado o lleno, la escena sigue funcionando y muestra que no esta guardando.

Al volver se resumen hasta ocho horas: necesidades, ciclos de descanso y reloj. No se reconstruyen todos los fotogramas ni se inventan descubrimientos. El boton de reinicio del panel requiere confirmacion y borra la vida actual en este origen.

## Siguiente etapa

V0.2 incorporara inclinacion, sacudidas, rotacion, calibracion y vibracion. En V0.1 `SensorManager` entrega valores neutros y no pide permisos. El audio, varios dispositivos, APK y carcasa fisica quedan para etapas posteriores.

Ver `docs/ARCHITECTURE.md` y `docs/ROADMAP.md`. Herramienta de desarrollo: [Vite](https://vite.dev/guide/).
