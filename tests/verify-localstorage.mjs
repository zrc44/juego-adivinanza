// Tests de la persistencia del récord (localStorage).
// Correr con: node tests/verify-localstorage.mjs   (o `npm test`)
//
// Cargamos game.js con un DOM falso y un localStorage falso para probar:
// guardar, cargar y no romperse cuando el almacenamiento está bloqueado.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

// La raíz del proyecto es la carpeta que contiene a tests/.
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsCode = fs.readFileSync(`${dir}/game.js`, "utf8");
const CLAVE = "juego-adivinanza/mejor";

function makeEl(id) {
  const handlers = {};
  return {
    id, textContent: "", className: "", value: "", disabled: false,
    placeholder: "", min: "", max: "",
    classList: { add() {}, remove() {} },
    focus() {},
    addEventListener(type, cb) { handlers[type] = cb; },
    handlers,
  };
}

function makeLocalStorage(inicial = {}) {
  const store = { ...inicial };
  return {
    _store: store,
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
  };
}

// Carga game.js en un contexto nuevo. `inicial` = contenido del localStorage;
// `lsFactory` permite simular un localStorage que falla (bloqueado).
function cargar(inicial = {}, lsFactory = makeLocalStorage) {
  const els = {};
  const ids = ["form", "entrada", "botonAdivinar", "botonReiniciar", "feedback",
    "intentos", "mejor", "juego", "rangoMin", "rangoMax"];
  for (const id of ids) els[id] = makeEl(id);

  const localStorage = lsFactory(inicial);
  const document = { getElementById: (id) => els[id] ?? makeEl(id) };
  const ctx = { document, localStorage, setTimeout, console };
  vm.createContext(ctx);

  const appended =
    ";globalThis.__game={get secreto(){return secreto;},set secreto(v){secreto=v;}," +
    "get mejor(){return mejor;},MINIMO,MAXIMO,entrada,form,feedback,textoMejor,localStorage};";
  vm.runInContext(jsCode + appended, ctx);
  return { g: ctx.__game, els, localStorage };
}

// Simula una secuencia de intentos (el último puede ser el acierto).
function jugar(g, els, ...numeros) {
  for (const n of numeros) {
    g.entrada.value = String(n);
    els.form.handlers.submit({ preventDefault() {} });
  }
}

const results = [];
const check = (name, cond, detail = "") => results.push({ name, ok: !!cond, detail });

// A. Al abrir, carga el récord guardado y lo muestra.
{
  const { g, els } = cargar({ [CLAVE]: "7" });
  check("A1 carga el récord guardado (7)", g.mejor === 7, `mejor=${g.mejor}`);
  check("A2 el marcador muestra 7", String(els.mejor.textContent) === "7", `texto=${els.mejor.textContent}`);
}

// B. Al ganar, guarda el récord en localStorage.
{
  const { g, els, localStorage } = cargar({});
  g.secreto = 42;
  jugar(g, els, 42); // acierto en 1 intento
  check("B1 mejor en memoria = 1", g.mejor === 1, `mejor=${g.mejor}`);
  check("B2 persiste en localStorage", localStorage.getItem(CLAVE) === "1", `ls=${localStorage.getItem(CLAVE)}`);
}

// C. Un acierto peor NO pisa el récord.
{
  const { g, els, localStorage } = cargar({ [CLAVE]: "1" });
  g.secreto = 42;
  jugar(g, els, 9, 99, 42); // 3 intentos, peor que 1
  check("C1 el récord sigue siendo 1", g.mejor === 1, `mejor=${g.mejor}`);
  check("C2 localStorage sigue 1", localStorage.getItem(CLAVE) === "1", `ls=${localStorage.getItem(CLAVE)}`);
}

// D. Un acierto mejor SÍ actualiza el récord.
{
  const { g, els, localStorage } = cargar({ [CLAVE]: "5" });
  g.secreto = 42;
  jugar(g, els, 42); // 1 intento, mejor que 5
  check("D1 el récord ahora es 1", g.mejor === 1, `mejor=${g.mejor}`);
  check("D2 localStorage actualizado a 1", localStorage.getItem(CLAVE) === "1", `ls=${localStorage.getItem(CLAVE)}`);
}

// E. Un valor corrupto se ignora (no rompe el marcador).
{
  const { g, els } = cargar({ [CLAVE]: "no-es-un-numero" });
  check("E1 valor corrupto → mejor null", g.mejor === null, `mejor=${g.mejor}`);
  check("E2 marcador muestra —", String(els.mejor.textContent) === "—", `texto=${els.mejor.textContent}`);
}

// F. Valores 0 o negativos se ignoran.
{
  const { g } = cargar({ [CLAVE]: "0" });
  const { g: gNeg } = cargar({ [CLAVE]: "-3" });
  check("F1 el 0 se ignora", g.mejor === null, `mejor=${g.mejor}`);
  check("F2 el negativo se ignora", gNeg.mejor === null, `mejor=${gNeg.mejor}`);
}

// G. Si el navegador bloquea localStorage, el juego NO se rompe.
{
  let ok = true;
  let detalle = "";
  try {
    const lsRota = () => ({ getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } });
    const { g, els } = cargar({}, lsRota);
    g.secreto = 42;
    jugar(g, els, 42);
    ok = g.mejor === 1;
  } catch (e) {
    ok = false;
    detalle = e.message;
  }
  check("G localStorage bloqueado no rompe el juego", ok, detalle);
}

let failures = 0;
for (const r of results) {
  if (!r.ok) failures++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  [" + r.detail + "]" : ""}`);
}
console.log(`\n${results.length - failures}/${results.length} checks OK`);
process.exit(failures === 0 ? 0 : 1);
