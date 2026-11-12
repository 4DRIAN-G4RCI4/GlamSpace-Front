// HU-21 · Pruebas de services/cacheLocal.nucleo.js con un almacenamiento falso en memoria.
import test from "node:test";
import assert from "node:assert";
import { crearCacheLocal, llaveCache, ESQUEMA, PREFIJO } from "../../services/cacheLocal.nucleo.js";

function almacenFalso({ capacidad = Infinity } = {}) {
  const datos = new Map();
  const tamano = () => [...datos.values()].reduce((t, v) => t + v.length, 0);
  return {
    datos,
    async getItem(k) { return datos.has(k) ? datos.get(k) : null; },
    async setItem(k, v) {
      const sinEsta = tamano() - (datos.get(k) || "").length;
      if (sinEsta + v.length > capacidad) { const e = new Error("QuotaExceededError"); e.name = "QuotaExceededError"; throw e; }
      datos.set(k, v);
    },
    async removeItem(k) { datos.delete(k); },
    async getAllKeys() { return [...datos.keys()]; },
    async multiRemove(ks) { ks.forEach((k) => datos.delete(k)); },
  };
}

const FECHA = new Date("2026-11-11T18:30:00.000Z");

test("llaves por usuario y por partes; sin usuario → publico", () => {
  assert.strictEqual(llaveCache(7, "solicitudes", 3, "2026-11", "pendiente"), "glamspaces_cache:7:solicitudes:3:2026-11:pendiente");
  assert.strictEqual(llaveCache(null, "busqueda", "Tula", null, 5000), "glamspaces_cache:publico:busqueda:Tula::5000");
});

test("guardar y leer regresa los datos con la fecha de guardado", async () => {
  const cache = crearCacheLocal(almacenFalso(), () => FECHA);
  assert.deepStrictEqual(await cache.guardar("glamspaces_cache:1:x", { a: 1 }), { ok: true });
  const g = await cache.leer("glamspaces_cache:1:x");
  assert.deepStrictEqual(g.datos, { a: 1 });
  assert.strictEqual(g.guardadoEn.toISOString(), FECHA.toISOString());
});

test("leer algo que no existe → null", async () => {
  assert.strictEqual(await crearCacheLocal(almacenFalso()).leer("glamspaces_cache:1:nada"), null);
});

test("una entrada de otro esquema o dañada se descarta y se borra", async () => {
  const almacen = almacenFalso();
  const cache = crearCacheLocal(almacen);
  almacen.datos.set("glamspaces_cache:1:viejo", JSON.stringify({ esquema: ESQUEMA - 1, guardadoEn: FECHA, datos: 1 }));
  almacen.datos.set("glamspaces_cache:1:roto", "{no es json");
  assert.strictEqual(await cache.leer("glamspaces_cache:1:viejo"), null);
  assert.strictEqual(await cache.leer("glamspaces_cache:1:roto"), null);
  assert.strictEqual(almacen.datos.size, 0);
});

test("borrar quita solo esa llave", async () => {
  const almacen = almacenFalso();
  const cache = crearCacheLocal(almacen);
  await cache.guardar("glamspaces_cache:1:a", 1);
  await cache.guardar("glamspaces_cache:1:b", 2);
  await cache.borrar("glamspaces_cache:1:a");
  assert.deepStrictEqual([...almacen.datos.keys()], ["glamspaces_cache:1:b"]);
});

test("borrarTodo quita toda la caché y deja la sesión y lo demás", async () => {
  const almacen = almacenFalso();
  const cache = crearCacheLocal(almacen);
  almacen.datos.set("glamspaces_sesion", "{}");
  await cache.guardar(llaveCache(1, "a"), 1);
  await cache.guardar(llaveCache(null, "b"), 2);
  assert.strictEqual(await cache.borrarTodo(), true);
  assert.deepStrictEqual([...almacen.datos.keys()], ["glamspaces_sesion"]);
});

test("almacenamiento lleno: libera la caché propia y vuelve a intentar", async () => {
  const almacen = almacenFalso({ capacidad: 200 });
  const cache = crearCacheLocal(almacen, () => FECHA);
  await cache.guardar(PREFIJO + "1:viejo", "x".repeat(60));
  const r = await cache.guardar(PREFIJO + "1:nuevo", "y".repeat(60));
  assert.deepStrictEqual(r, { ok: true });
  assert.deepStrictEqual([...almacen.datos.keys()], [PREFIJO + "1:nuevo"]);
});

test("si ni liberando cabe, regresa { ok:false, motivo:'lleno' } sin lanzar", async () => {
  const cache = crearCacheLocal(almacenFalso({ capacidad: 50 }));
  assert.deepStrictEqual(await cache.guardar(PREFIJO + "1:enorme", "z".repeat(500)), { ok: false, motivo: "lleno" });
});

test("cualquier otro error del almacenamiento no rompe la app", async () => {
  const roto = { ...almacenFalso(), setItem: async () => { throw new Error("disco"); }, getItem: async () => { throw new Error("disco"); } };
  const cache = crearCacheLocal(roto);
  assert.deepStrictEqual(await cache.guardar(PREFIJO + "1:a", 1), { ok: false, motivo: "error" });
  assert.strictEqual(await cache.leer(PREFIJO + "1:a"), null);
});
