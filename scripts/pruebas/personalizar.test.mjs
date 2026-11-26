// Personalizar (Perfil): tamaño de letra y zoom.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ESCALA_TEXTO, OPCIONES_TEXTO, OPCIONES_ZOOM, ZOOM, escalarTexto } from "../../theme/tema.js";

test("escalarTexto multiplica fontSize y lineHeight y deja lo demás igual", () => {
  const r = escalarTexto({ a: { fontSize: 14, lineHeight: 20, color: "red" }, b: { padding: 8 }, c: null }, 1.15);
  assert.deepEqual(r, { a: { fontSize: 16.1, lineHeight: 23, color: "red" }, b: { padding: 8 }, c: null });
});

test("sin preferencia guardada arranca en tamaño y zoom normales, y ambas listas incluyen el normal", () => {
  assert.equal(ESCALA_TEXTO, 1);
  assert.equal(ZOOM, 1);
  assert.ok(OPCIONES_TEXTO.some((o) => o.valor === 1));
  assert.ok(OPCIONES_ZOOM.some((o) => o.valor === 1));
});
