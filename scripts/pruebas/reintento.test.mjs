// HU-25/HU-28 · Reintento automático de las lecturas cuando la API recién despierta.
import { test } from "node:test";
import assert from "node:assert/strict";
import { esLectura, debeReintentar, conReintento } from "../../services/reintento.logica.js";

const red = { tipo: "red" };
const http = (estado) => ({ tipo: "http", estado });

test("solo las consultas de lectura se reintentan", () => {
  for (const r of ["/salones/buscar", "/salones/obtener", "/salones/listar", "/salones/disponibilidad",
                   "/solicitudes/listar", "/solicitudes/listarPorSalon", "/usuarios/obtener"]) {
    assert.equal(esLectura(r), true, r);
  }
  for (const r of ["/solicitudes/crear", "/solicitudes/aceptar", "/solicitudes/rechazar", "/salones/eliminar",
                   "/usuarios/login", "/usuarios/registro", "/usuarios/convertirAAdministrador", "/salones/subirFoto", "", null]) {
    assert.equal(esLectura(r), false, String(r));
  }
});

test("se reintenta por red o 5xx, no por errores de datos", () => {
  assert.equal(debeReintentar(red), true);
  assert.equal(debeReintentar(http(500)), true);
  assert.equal(debeReintentar(http(503)), true);
  for (const e of [http(400), http(401), http(404), http(409), { tipo: "config" }, null]) {
    assert.equal(debeReintentar(e), false, JSON.stringify(e));
  }
});

test("una lectura que falla con 500 se repite una vez y regresa el segundo resultado", async () => {
  let llamadas = 0;
  const r = await conReintento("/salones/buscar", async () => {
    llamadas += 1;
    if (llamadas === 1) throw http(500);
    return "ok";
  }, { espera: 0 });
  assert.equal(r, "ok");
  assert.equal(llamadas, 2);
});

test("si el reintento también falla, se muestra el error (solo 2 intentos)", async () => {
  let llamadas = 0;
  await assert.rejects(conReintento("/salones/buscar", async () => { llamadas += 1; throw red; }, { espera: 0 }), (e) => e === red);
  assert.equal(llamadas, 2);
});

test("las escrituras y los errores de datos no se repiten", async () => {
  for (const [ruta, error] of [["/solicitudes/crear", http(500)], ["/salones/buscar", http(404)]]) {
    let llamadas = 0;
    await assert.rejects(conReintento(ruta, async () => { llamadas += 1; throw error; }, { espera: 0 }));
    assert.equal(llamadas, 1, ruta);
  }
});

test("si la primera vez funciona, no hay espera ni segunda llamada", async () => {
  let llamadas = 0;
  assert.equal(await conReintento("/salones/buscar", async () => { llamadas += 1; return 7; }), 7);
  assert.equal(llamadas, 1);
});
