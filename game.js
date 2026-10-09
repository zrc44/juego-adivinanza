// ============================================================
//  game.js — La "cabeza" del juego: piensa y decide.
//  El navegador ejecuta este archivo después de mostrar el HTML.
// ============================================================

/* --- 1. Buscamos los elementos del HTML para poder usarlos --- */
const form = document.getElementById("form");
const entrada = document.getElementById("entrada");
const botonAdivinar = document.getElementById("botonAdivinar");
const botonReiniciar = document.getElementById("botonReiniciar");
const feedback = document.getElementById("feedback");
const textoIntentos = document.getElementById("intentos");
const textoMejor = document.getElementById("mejor");
const tarjeta = document.getElementById("juego");

/* --- 2. Datos del juego --- */
const MINIMO = 1;
const MAXIMO = 1000;
const CLAVE_MEJOR = "juego-adivinanza/mejor"; // dónde guardamos el récord

let secreto;      // el número que hay que adivinar
let intentos;     // cuántos intentos llevamos en esta partida
let mejor = null; // la mejor partida (menos intentos); null = todavía no hay récord
let terminado;    // true cuando ya se acertó

/* --- 2b. El rango vive SOLO acá: se lo pasamos al HTML --- */
// Así index.html no repite el número; todo sale de MINIMO y MAXIMO.
document.getElementById("rangoMin").textContent = MINIMO;
document.getElementById("rangoMax").textContent = MAXIMO;
entrada.min = MINIMO;
entrada.max = MAXIMO;
entrada.placeholder = `${MINIMO} al ${MAXIMO}`;

/* --- 2c. El récord vive en el navegador (localStorage) --- */
// Así la mejor partida sobrevive aunque cierres la pestaña.
function cargarMejor() {
  try {
    const guardado = Number(localStorage.getItem(CLAVE_MEJOR));
    return Number.isInteger(guardado) && guardado > 0 ? guardado : null;
  } catch (e) {
    return null; // si el navegador bloquea el almacenamiento, seguimos sin récord
  }
}

function guardarMejor() {
  try {
    localStorage.setItem(CLAVE_MEJOR, String(mejor));
  } catch (e) {
    // sin almacenamiento disponible: el récord dura solo esta sesión
  }
}

mejor = cargarMejor();
textoMejor.textContent = mejor === null ? "—" : mejor;

/* --- 3. Función: arranca una partida nueva --- */
function nuevaPartida() {
  // Número al azar entre MINIMO y MAXIMO (ambos incluidos).
  secreto = Math.floor(Math.random() * (MAXIMO - MINIMO + 1)) + MINIMO;

  intentos = 0;
  terminado = false;

  textoIntentos.textContent = "0";
  feedback.textContent = "Esperando tu primer intento…";
  feedback.className = "juego__feedback";
  entrada.value = "";
  entrada.disabled = false;
  botonAdivinar.disabled = false;

  entrada.focus(); // el cursor queda listo para escribir
}

/* --- 4. Función: revisa el número que escribió la persona --- */
function revisarIntento(evento) {
  evento.preventDefault(); // evita que la página se recargue al enviar

  if (terminado) return;

  const numero = Number(entrada.value);
  feedback.className = "juego__feedback";

  // Validación: tiene que ser un entero dentro del rango (MINIMO..MAXIMO).
  if (!Number.isInteger(numero) || numero < MINIMO || numero > MAXIMO) {
    feedback.textContent = `Escribí un número entero entre ${MINIMO} y ${MAXIMO}.`;
    feedback.classList.add("es-error");
    return;
  }

  intentos += 1;
  textoIntentos.textContent = intentos;

  // Comparamos el intento con el número secreto.
  if (numero < secreto) {
    feedback.textContent = "Muy bajo 👇 El número es más grande.";
    feedback.classList.add("es-bajo");
  } else if (numero > secreto) {
    feedback.textContent = "Muy alto 👆 El número es más chico.";
    feedback.classList.add("es-alto");
  } else {
    feedback.textContent =
      `¡Correcto! 🎉 Lo adivinaste en ${intentos} ` +
      `${intentos === 1 ? "intento" : "intentos"}.`;
    feedback.classList.add("es-acierto");
    ganar();
  }

  entrada.value = "";
  entrada.focus();
}

/* --- 5. Función: cuando la persona acierta --- */
function ganar() {
  terminado = true;
  entrada.disabled = true;
  botonAdivinar.disabled = true;

  // Guardamos la mejor partida (la de menos intentos).
  if (mejor === null || intentos < mejor) {
    mejor = intentos;
    textoMejor.textContent = mejor;
    guardarMejor(); // y la dejamos guardada para la próxima visita
  }

  // Pequeña animación de la tarjeta.
  tarjeta.classList.add("ganado");
  setTimeout(() => tarjeta.classList.remove("ganado"), 500);
}

/* --- 6. Escuchamos lo que hace la persona --- */
form.addEventListener("submit", revisarIntento);
botonReiniciar.addEventListener("click", nuevaPartida);

/* --- 7. ¡Que empiece el juego! --- */
nuevaPartida();
