// HU-21 · Pruebas de las funciones puras del service worker (node --test, sin dependencias).
const test = require("node:test");
const assert = require("node:assert");
const { estrategiaPara } = require("../swEstrategia");
const { listarArchivos, listaDePrecache, versionDeCache, armarServiceWorker } = require("../posexport");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SITIO = "https://glamspaces.example";
const get = (url, extra = {}) => ({ metodo: "GET", url, modo: "cors", destino: "", ...extra });

test("nunca intercepta POST (la API y cualquier otro)", () => {
  assert.strictEqual(estrategiaPara({ ...get("https://api.example/api/salones/buscar"), metodo: "POST" }, SITIO), null);
  assert.strictEqual(estrategiaPara({ ...get(SITIO + "/"), metodo: "POST" }, SITIO), null);
});

test("nunca intercepta rutas de la API aunque sean GET", () => {
  assert.strictEqual(estrategiaPara(get("https://api.example/api/salones/listar"), SITIO), null);
  assert.strictEqual(estrategiaPara(get(SITIO + "/api/algo"), SITIO), null);
});

test("navegación del sitio → red primero (con respaldo al index.html)", () => {
  assert.strictEqual(estrategiaPara(get(SITIO + "/", { modo: "navigate", destino: "document" }), SITIO), "red-primero");
  assert.strictEqual(estrategiaPara(get("https://otro.example/", { modo: "navigate" }), SITIO), null);
});

test("estáticos con hash → caché primero", () => {
  assert.strictEqual(estrategiaPara(get(SITIO + "/_expo/static/js/web/AppEntry-abc123.js", { destino: "script" }), SITIO), "cache-primero");
  assert.strictEqual(estrategiaPara(get(SITIO + "/assets/assets/cliente/icono-buscar.c3ba8a.svg", { destino: "image" }), SITIO), "cache-primero");
});

test("archivos sin hash del sitio → red primero; sw.js nunca", () => {
  assert.strictEqual(estrategiaPara(get(SITIO + "/manifest.json", { destino: "manifest" }), SITIO), "red-primero");
  assert.strictEqual(estrategiaPara(get(SITIO + "/icons/icon-192.png", { destino: "image" }), SITIO), "red-primero");
  assert.strictEqual(estrategiaPara(get(SITIO + "/sw.js"), SITIO), null);
});

test("fotos de salones y fuentes → stale-while-revalidate", () => {
  assert.strictEqual(estrategiaPara(get("https://upload.wikimedia.org/a/b/salon.jpg", { modo: "no-cors", destino: "image" }), SITIO), "stale-while-revalidate");
  assert.strictEqual(estrategiaPara(get("https://fonts.googleapis.com/css2?family=Inter", { destino: "style" }), SITIO), "stale-while-revalidate");
  assert.strictEqual(estrategiaPara(get("https://fonts.gstatic.com/s/inter/v1/a.woff2", { destino: "font" }), SITIO), "stale-while-revalidate");
});

test("otros GET de otros dominios no se interceptan", () => {
  assert.strictEqual(estrategiaPara(get("https://otro.example/datos.json"), SITIO), null);
});

test("precache: archivos reales sin sw.js, metadata.json ni mapas, ordenados", () => {
  const lista = listaDePrecache(["sw.js", "metadata.json", "index.html", "_expo/static/js/web/a.js", "_expo/static/js/web/a.js.map", "icons/icon-192.png"]);
  assert.deepStrictEqual(lista, ["/", "/_expo/static/js/web/a.js", "/icons/icon-192.png"]);
});

test("versión: igual con el mismo contenido, distinta si algo cambia", () => {
  const a = [{ ruta: "/index.html", contenido: "uno" }, { ruta: "/a.js", contenido: "x" }];
  const mismoEnOtroOrden = [a[1], a[0]];
  const cambiado = [{ ruta: "/index.html", contenido: "dos" }, a[1]];
  assert.strictEqual(versionDeCache(a), versionDeCache(mismoEnOtroOrden));
  assert.notStrictEqual(versionDeCache(a), versionDeCache(cambiado));
  assert.match(versionDeCache(a), /^[0-9a-f]{12}$/);
});

test("el sw.js generado es JavaScript válido y trae versión y precache", () => {
  const codigo = armarServiceWorker("abc123", ["/index.html"], "var listo = true;");
  assert.doesNotThrow(() => new Function(codigo));
  assert.match(codigo, /var VERSION = "abc123";/);
  assert.match(codigo, /"\/index.html"/);
  assert.match(codigo, /function estrategiaPara/);
});

test("listarArchivos recorre las subcarpetas y usa / en las rutas", () => {
  // Carpeta temporal con la forma de dist: archivos en la raíz y en subcarpetas.
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "glamspaces-dist-"));
  try {
    fs.mkdirSync(path.join(base, "_expo", "static", "js"), { recursive: true });
    fs.mkdirSync(path.join(base, "icons"));
    fs.writeFileSync(path.join(base, "index.html"), "<html></html>");
    fs.writeFileSync(path.join(base, "_expo", "static", "js", "AppEntry-abc123.js"), "x");
    fs.writeFileSync(path.join(base, "icons", "icon-192.png"), "y");

    const rutas = listarArchivos(base).sort();
    assert.deepStrictEqual(rutas, [
      "_expo/static/js/AppEntry-abc123.js",
      "icons/icon-192.png",
      "index.html",
    ]);
    // Siempre con "/", nunca con el separador de Windows.
    for (const r of rutas) assert.ok(!r.includes("\\\\"), r);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("listarArchivos de una carpeta vacía regresa lista vacía", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "glamspaces-vacio-"));
  try {
    assert.deepStrictEqual(listarArchivos(base), []);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});
