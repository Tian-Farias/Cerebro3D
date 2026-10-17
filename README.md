# Atlas 3D del Cerebro

> **Demo creada con inteligencia artificial.** El modelo 3D, la interfaz y los textos de estudio fueron generados con ayuda de Claude (Anthropic) bajo la dirección de [Cristian Farías](https://www.linkedin.com/in/cristianfarias/). Material didáctico, no de diagnóstico.

**Versión publicada:** https://tian-farias.github.io/Cerebro3D/

Atlas 3D interactivo del encéfalo humano para estudiantes de Psicología. Un único archivo, **`cerebro.html`**, que funciona sin conexión: se abre con doble clic en cualquier navegador moderno (Chrome, Firefox, Edge, Safari) y también en el móvil.

## Qué incluye

- **~60 estructuras** en 10 grupos: lóbulos, áreas funcionales (Broca, Wernicke, motora, prefrontal, orbitofrontal, fusiforme…), giros y surcos, áreas de Brodmann, sistema límbico, diencéfalo, ganglios basales, tronco (incluidos ATV, locus coeruleus y rafe), cerebelo, sustancia blanca (cuerpo calloso, fascículo arqueado, cápsula interna), ventrículos y nervios.
- **Fichas** con ubicación, funciones, relevancia en psicología, tabla lesión → síntoma, conexiones, neurotransmisores, pruebas neuropsicológicas, dato para recordar y capítulo donde ampliar en Carlson, Kandel y Kolb-Whishaw.
- **Exploración**: girar, separar las piezas, opacidad de la corteza, aislar/resaltar/extraer, vistas estándar, planos de corte libres y cortes clásicos, etiquetas 3D, color de atlas o real, tema claro/oscuro.
- **13 recorridos guiados** con flechas de flujo (Papez, recompensa, lenguaje, estrés, visión, movimiento, neurotransmisores, memoria, miedo, audición, sueño, lateralización, atención).
- **Autoevaluación** en tres modos (encuéntrala, ¿qué estructura es?, caso clínico con 28 casos), por grupo, con resumen y lista de repaso.
- **Glosario** de ~60 términos, guía de estudio, enlace compartible a cualquier vista, captura PNG e impresión de fichas o del resumen completo.

## Publicación

El flujo [`.github/workflows/pages.yml`](.github/workflows/pages.yml) regenera `cerebro.html` y lo publica en GitHub Pages en cada *push* a `main` (también se puede lanzar a mano desde la pestaña *Actions*). La primera vez, el propio flujo activa Pages; si el repositorio lo impide, actívalo en *Settings → Pages → Source: GitHub Actions*.

## Estructura del proyecto

```
cerebro.html          ← archivo final, autocontenido (se genera; no editar a mano)
src/
  build.py            ← genera cerebro.html
  index.html          ← esqueleto HTML
  css/style.css
  js/content.js       ← grupos, estructuras (PARTS), autoría y licencias
  js/info1-3.js       ← fichas (INFO)
  js/tours.js         ← recorridos, casos clínicos, glosario, cortes clásicos
  js/geometry.js      ← forma del cerebro, surcos, clasificación de regiones
  js/scene.js         ← Three.js: construcción del modelo, estado, selección, cámara
  js/ui.js            ← interfaz
  js/study.js         ← recorridos y quiz
  js/main.js          ← arranque
  vendor/             ← Three.js r147 + OrbitControls (MIT)
```

## Editar y regenerar

1. Edita los archivos de `src/` (para cambiar textos: `js/info*.js`, `js/tours.js`).
2. Ejecuta `python3 src/build.py` (solo necesita Python 3, sin dependencias).
3. Abre `cerebro.html`.

Para añadir una estructura: entrada en `PARTS` (`content.js`), ficha en `INFO` (`info*.js`), geometría en `buildDeep()` o región en `regionsOf()` (`geometry.js`) y, si procede, desplazamiento en `EXPLODE` (`scene.js`).

## Opciones de URL

- `?calidad=baja` / `?calidad=alta`: fuerza la resolución del modelo.
- `?sinaviso`: no muestra el aviso de bienvenida de la demo.
- El fragmento `#…` guarda la vista actual (estructura, cámara, corte, capas); el menú ⋯ → «Copiar enlace» lo copia.

## Licencias

- **Contenido** (textos, fichas, recorridos, casos clínicos, glosario y modelo 3D): [Creative Commons Atribución-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/deed.es) — ver [`LICENSE-CONTENT.txt`](LICENSE-CONTENT.txt). Puedes copiarlo, adaptarlo y redistribuirlo citando a Cristian Farías y manteniendo la misma licencia.
- **Código** (todo lo que hay en `src/` salvo `vendor/`, y el flujo de publicación): [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) — ver [`LICENSE`](LICENSE).
- **Bibliotecas de terceros**: Three.js y OrbitControls, licencia MIT (© three.js authors).

🄯 2026 [Cristian Farías](https://www.linkedin.com/in/cristianfarias/)

## Aviso

Modelo didáctico simplificado: las formas se generan por código y la localización de áreas, giros y áreas de Brodmann es orientativa. Material de estudio, no de diagnóstico.
