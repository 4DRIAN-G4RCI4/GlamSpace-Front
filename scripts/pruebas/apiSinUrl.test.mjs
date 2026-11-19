// Cobertura · Sin EXPO_PUBLIC_API_URL la app no llama a nada y avisa con un error "config".
// Va en su propio archivo porque node --test corre cada archivo en un proceso aparte.
import { test } from "node:test";
import assert from "node:assert/strict";

delete process.env.EXPO_PUBLIC_API_URL;
globalThis.fetch = () => assert.fail("no debe llamar a la red");
const api = await import("../../services/api.js");

test("sin URL de la API, postJson y postFormulario fallan con tipo config", async () => {
  assert.equal(api.API_URL, undefined);
  await assert.rejects(api.postJson("/salones/crear", {}), (e) => e.tipo === "config");
  await assert.rejects(api.postFormulario("/salones/subirFoto", null), (e) => e.tipo === "config");
});
