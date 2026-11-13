/**
 * GlamSpaces · HU-21 · Posproceso del export web. Se corre después de `expo export -p web`
 * (ver "build:web" en package.json; el workflow de despliegue usa el mismo script).
 *
 * Genera dist/sw.js en la raíz con:
 *   - PRECACHE: los archivos reales de dist (HTML, bundle con hash, assets, íconos, manifest)
 *   - VERSION:  hash del contenido de esos archivos → cambia en cada build con cambios, y el
 *               navegador instala el SW nuevo y borra la caché anterior.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { estrategiaPara } = require("./swEstrategia");

const DIST = path.join(__dirname, "..", "dist");
const FUERA_DE_PRECACHE = new Set(["sw.js", "metadata.json"]);

function listarArchivos(carpeta, base = carpeta) {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(carpeta, e.name);
    return e.isDirectory() ? listarArchivos(ruta, base) : [path.relative(base, ruta).split(path.sep).join("/")];
  });
}

// Rutas relativas de dist → URLs del precache ("index.html" va como "/": el respaldo offline, sin redirecciones del servidor).
function listaDePrecache(rutas) {
  return rutas
    .filter((r) => !FUERA_DE_PRECACHE.has(r) && !r.endsWith(".map"))
    .map((r) => (r === "index.html" ? "/" : "/" + r))
    .sort();
}

// Hash corto del contenido: el mismo build da la misma versión; cualquier cambio da otra.
function versionDeCache(archivos) {
  const hash = crypto.createHash("sha256");
  for (const { ruta, contenido } of [...archivos].sort((a, b) => (a.ruta < b.ruta ? -1 : 1))) {
    hash.update(ruta).update("\0").update(contenido).update("\0");
  }
  return hash.digest("hex").slice(0, 12);
}

function armarServiceWorker(version, precache, cuerpo) {
  return [
    "/* GlamSpaces · service worker generado por scripts/posexport.js — no editar a mano. */",
    `var VERSION = ${JSON.stringify(version)};`,
    `var PRECACHE = ${JSON.stringify(precache, null, 2)};`,
    estrategiaPara.toString(),
    cuerpo,
  ].join("\n");
}

function main() {
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    console.error("posexport: no existe dist/index.html. Corre primero `npx expo export -p web`.");
    process.exit(1);
  }
  const precache = listaDePrecache(listarArchivos(DIST));
  const version = versionDeCache(precache.map((u) => ({ ruta: u, contenido: fs.readFileSync(path.join(DIST, u === "/" ? "index.html" : u)) })));
  const cuerpo = fs.readFileSync(path.join(__dirname, "sw.base.js"), "utf8");
  fs.writeFileSync(path.join(DIST, "sw.js"), armarServiceWorker(version, precache, cuerpo));
  console.log(`posexport: dist/sw.js · versión ${version} · ${precache.length} archivos en precaché`);
}

if (require.main === module) main();

module.exports = { listarArchivos, listaDePrecache, versionDeCache, armarServiceWorker };
