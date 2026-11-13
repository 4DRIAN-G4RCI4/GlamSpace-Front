// Mejora de HU-07/HU-08 · El campo "Nombre del salón" NUNCA debe traer el correo (node --test).
import test from "node:test";
import assert from "node:assert";
import { esNombreDeNegocio, nombreDeNegocio } from "../../services/sesion.logica.js";

// El error: si la cuenta no tenía nombre_salon se caía al nombre del usuario, y en varias
// cuentas ese "nombre" es el propio correo. Así aparecía el correo en "Nombre del salón".
test("una cuenta con nombre de salón de verdad sí lo sugiere", () => {
  const sesion = { id: 7, nombre: "Adrian García", correo: "adrian@correo.com", nombre_salon: "Jardín Villa Esmeralda" };
  assert.strictEqual(nombreDeNegocio(sesion), "Jardín Villa Esmeralda");
});

test("si el nombre del salón es un correo, el campo queda vacío", () => {
  const sesion = { id: 7, nombre: "adrian@correo.com", correo: "adrian@correo.com", nombre_salon: "adrian@correo.com" };
  assert.strictEqual(nombreDeNegocio(sesion), "");
});

test("sin nombre de salón el campo queda vacío (no usa el nombre del usuario)", () => {
  const sesion = { id: 7, nombre: "Adrian García", correo: "adrian@correo.com", nombre_salon: null };
  assert.strictEqual(nombreDeNegocio(sesion), "");
});

test("sin nombre de salón tampoco usa el correo de la cuenta", () => {
  const sesion = { id: 7, nombre: "adrian@correo.com", correo: "adrian@correo.com" };
  const resultado = nombreDeNegocio(sesion);
  assert.strictEqual(resultado, "");
  assert.ok(!resultado.includes("@"), "el campo nunca debe traer un correo");
});

test("nombreDeNegocio aguanta una sesión vacía", () => {
  assert.strictEqual(nombreDeNegocio(null), "");
  assert.strictEqual(nombreDeNegocio(undefined), "");
  assert.strictEqual(nombreDeNegocio({}), "");
});

test("nombreDeNegocio quita los espacios de sobra", () => {
  assert.strictEqual(nombreDeNegocio({ nombre_salon: "  Salón Real  " }), "Salón Real");
  assert.strictEqual(nombreDeNegocio({ nombre_salon: "   " }), "");
});

test("esNombreDeNegocio distingue un nombre de un correo", () => {
  assert.strictEqual(esNombreDeNegocio("Jardín Villa Esmeralda"), true);
  assert.strictEqual(esNombreDeNegocio("Salón 24/7"), true);
  assert.strictEqual(esNombreDeNegocio("adrian@correo.com"), false);
  assert.strictEqual(esNombreDeNegocio("  ana@glam.mx "), false);
  assert.strictEqual(esNombreDeNegocio(""), false);
  assert.strictEqual(esNombreDeNegocio(null), false);
});
