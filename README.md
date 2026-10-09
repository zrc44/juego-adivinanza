# 🎲 Adivina el Número

Un juego sencillo que corre en el navegador. La compu "piensa" un número
entre **1 y 1000**, y vos tenés que descubrirlo. Después de cada intento el
juego te dice si el número secreto es **más alto** o **más bajo**.

Este proyecto es ideal para aprender: es chico, se ve todo de una sola vez y
no necesita instalar nada.

---

## 🕹️ Cómo jugar

1. Escribí un número del 1 al 1000 en el casillero.
2. Apretá **Adivinar** (o la tecla Enter).
3. Leé la pista:
   - **Muy bajo 👇** → el número secreto es más grande.
   - **Muy alto 👆** → el número secreto es más chico.
   - **¡Correcto! 🎉** → ¡ganaste!
4. El marcador cuenta tus **intentos** y guarda tu **mejor partida**.
5. Apretá **Jugar de nuevo** para empezar otra ronda.

---

## ▶️ Cómo abrirlo en tu computadora

Estás en Windows con WSL2, así que tenés dos caminos fáciles.

### Opción A — La más simple (abrir el archivo)

En la terminal, parado en la carpeta del proyecto, escribí:

```bash
cmd.exe /c start "" "$(wslpath -w index.html)"
```

Se va a abrir el juego en tu navegador de Windows. Listo. 🎉

> **¿Por qué no usar `explorer.exe index.html`?** Cuando lanzás un programa de
> Windows desde WSL, el "directorio actual" queda como una ruta de red
> (`\\wsl.localhost\...`). Windows no acepta eso como carpeta actual, así que
> no encuentra el archivo relativo y falla. `wslpath -w` traduce la ruta a una
> ruta de Windows absoluta, y con eso sí lo abre.
>
> Si preferís explorar la carpeta a mano: `explorer.exe .` te abre el
> Explorador en el proyecto, y después hacés doble clic en `index.html`.

### Opción B — Con un "servidor" local (más profesional)

```bash
python3 -m http.server 8000
```

Después abrí en el navegador de Windows:

```
http://localhost:8000
```

Para cortar el servidor, apretá `Ctrl + C` en la terminal.

---

## 🧠 ¿Cómo funciona? (explicado simple)

Un juego de navegador son **tres amigos** que trabajan juntos:

| Archivo | ¿Qué rol cumple? | Analogía |
|---|---|---|
| `index.html` | La **estructura**: qué cosas hay (título, casillero, botones). | El esqueleto de una casa. |
| `styles.css` | El **estilo**: colores, tamaños, espacios. | La pintura y la decoración. |
| `game.js` | La **lógica**: piensa, compara y decide. | El cerebro que juega. |

El `README.md` (este archivo) es la **explicación** para humanos.

El navegador es como un teatro:

1. Lee el `index.html` y arma la escena.
2. Aplica el `styles.css` para que quede linda.
3. Ejecuta el `game.js`, que se queda "escuchando" hasta que vos apretás
   un botón.

### El corazón de `game.js`

```js
// Elige un número al azar entre 1 y 1000
secreto = Math.floor(Math.random() * (MAXIMO - MINIMO + 1)) + MINIMO;
```

- `Math.random()` da un número decimal al azar entre 0 y 1 (ej: `0.42`).
- Lo multiplicamos por 1000 para que quede entre 0 y 1000.
- `Math.floor()` corta los decimales (redondea para abajo).
- Sumamos `MINIMO` para que nunca dé 0.

Después, en `revisarIntento`, comparamos:

```js
if (numero < secreto)      { /* Muy bajo */ }
else if (numero > secreto) { /* Muy alto */ }
else                       { /* ¡Correcto! */ }
```

---

## 📁 Estructura del proyecto

```
juego-adivinanza/
├── index.html    → estructura del juego
├── styles.css    → estilos y colores
├── game.js       → lógica del juego
├── README.md     → esta explicación
└── .gitignore    → archivos que git debe ignorar
```

---

## 🪜 Las 5 fases (el orden en que se construyó)

Pensar un proyecto en **fases** es una de las mejores costumbres que podés
adoptar. Este juego se armó así:

1. **Fase 0 — Preparar:** crear la carpeta, `git init` y el `.gitignore`.
2. **Fase 1 — Estructura:** `index.html` con el título, el campo y los botones.
3. **Fase 2 — Estilo:** `styles.css` para que se vea ordenado y con colores.
4. **Fase 3 — Lógica:** `game.js` para que piense, compare y responda.
5. **Fase 4 — Verificar y guardar:** probar en el navegador y hacer el commit.

> Regla de oro: **una fase, una cosa**. Así los errores son fáciles de encontrar.

---

## 🧪 Cosas para probar y aprender

Abrí los archivos y cambiá algo chiquito. ¡Es la mejor forma de aprender!

- **Cambiar el rango:** tocá solo `MAXIMO` en `game.js` (por ejemplo `MAXIMO = 50`).
  El HTML se ajusta solo, porque el rango vive en un único lugar.
- **Cambiar los colores:** en `styles.css`, cambiá los valores de `:root`
  (por ejemplo, `--color-principal` a `#e11d48` para un violeta rosado).
- **Agregar pistas de "caliente/frío":** si el intento está a menos de 10 del
  secreto, mostrá "¡Caliente! 🔥".
- **Guardar las mejores partidas:** investigá `localStorage` para que el
  récord sobreviva aunque cierres el navegador.

---

## 💾 Guardar tu progreso con Git

Git es como una **máquina del tiempo** para tu código.

```bash
git status                 # ver qué cambió
git add .                  # preparar TODOS los cambios
git commit -m "mi mensaje" # guardar una "foto" con una descripción
git log --oneline          # ver el historial de fotos
```

Cada `commit` es un punto de guardado al que siempre podés volver.

---

## 📚 Glosario chiquito

- **HTML:** el esqueleto de la página.
- **CSS:** la ropa y los colores.
- **JavaScript:** el cerebro que hace cosas.
- **Navegador:** Chrome, Firefox, Edge… el programa que muestra la página.
- **Commit:** una "foto" de tus archivos guardada en git.
- **README:** el archivo que explica un proyecto (¡este!).

---

Hecho con curiosidad y un poquito de código. 🚀
