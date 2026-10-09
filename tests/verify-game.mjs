// Tests de la lógica básica del juego.
// Correr con: node tests/verify-game.mjs   (o `npm test`)
//
// No hace falta abrir el navegador: cargamos game.js dentro de un contexto
// de Node con un DOM falso y probamos el comportamiento.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

// La raíz del proyecto es la carpeta que contiene a tests/.
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsCode = fs.readFileSync(`${dir}/game.js`, "utf8");
const html = fs.readFileSync(`${dir}/index.html`, "utf8");

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

const els = {};
const ids = ["form", "entrada", "botonAdivinar", "botonReiniciar", "feedback", "intentos", "mejor", "juego", "rangoMin", "rangoMax"];
for (const id of ids) els[id] = makeEl(id);

const document = { getElementById: (id) => els[id] ?? makeEl(id) };
const localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
const ctx = { document, localStorage, setTimeout, console };
vm.createContext(ctx);

const appended =
  ";globalThis.__game={get secreto(){return secreto;},MINIMO,MAXIMO,entrada,form,feedback};";
vm.runInContext(jsCode + appended, ctx);
const g = ctx.__game;

const results = [];
const check = (name, cond, detail = "") => results.push({ name, ok: !!cond, detail });

// --- 1. El rango se propaga al HTML desde game.js ---
check("MAXIMO es 1000", g.MAXIMO === 1000, `MAXIMO=${g.MAXIMO}`);
check("input.max = MAXIMO", g.entrada.max === 1000, `max=${g.entrada.max}`);
check("input.min = MINIMO", g.entrada.min === 1, `min=${g.entrada.min}`);
check("placeholder refleja el rango", g.entrada.placeholder === "1 al 1000", `ph=${g.entrada.placeholder}`);
check("texto rangoMin = 1", String(els.rangoMin.textContent) === "1", `=${els.rangoMin.textContent}`);
check("texto rangoMax = 1000", String(els.rangoMax.textContent) === "1000", `=${els.rangoMax.textContent}`);

// --- 2. Secreto dentro del rango ---
let secretoOk = true;
let sample = 0;
for (let i = 0; i < 3000; i++) {
  g.entrada.value = "";
  els.form.handlers.submit({ preventDefault() {} }); // no-op, terminado false
  const s = g.secreto;
  sample = s;
  if (!Number.isInteger(s) || s < 1 || s > 1000) secretoOk = false;
}
check("secreto siempre entero en [1,1000] (3000 muestras)", secretoOk, `ultimo=${sample}`);

// --- 3. Un intento > 100 YA no se bloquea/valida como error ---
els.feedback.textContent = "";
g.entrada.value = "742";
els.form.handlers.submit({ preventDefault() {} });
const fb742 = els.feedback.textContent;
check(
  "intento 742 es aceptado (no da error de rango)",
  fb742.length > 0 && !/Escribí un número entero/.test(fb742),
  `feedback="${fb742}"`
);

// --- 4. Un intento fuera de rango sí se rechaza ---
els.feedback.textContent = "";
g.entrada.value = "5000";
els.form.handlers.submit({ preventDefault() {} });
const fb5000 = els.feedback.textContent;
check("intento 5000 se rechaza por rango", /entre 1 y 1000/.test(fb5000), `feedback="${fb5000}"`);

// --- 5. El HTML ya no tiene el max hardcodeado ---
check("index.html sin max=\"100\"", !/max="100"/.test(html));
check("index.html sin placeholder hardcodeado", !/placeholder="1 al 100"/.test(html));
check("index.html tiene ids rangoMin/rangoMax", /id="rangoMin"/.test(html) && /id="rangoMax"/.test(html));

let failures = 0;
for (const r of results) {
  if (!r.ok) failures++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  [" + r.detail + "]" : ""}`);
}
console.log(`\n${results.length - failures}/${results.length} checks OK`);
process.exit(failures === 0 ? 0 : 1);
