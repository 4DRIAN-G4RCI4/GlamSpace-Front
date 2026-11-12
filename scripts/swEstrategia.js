/**
 * GlamSpaces · HU-21 · Qué estrategia de caché usa el service worker para cada petición.
 *
 * Es una función pura: posexport.js copia su código tal cual dentro de dist/sw.js y las
 * pruebas (scripts/pruebas) la llaman directo. Por eso no puede usar nada de fuera.
 *
 * Regresa:
 *   null                    → el SW NO intercepta (POST, API y cualquier otra cosa desconocida)
 *   "red-primero"           → navegaciones y archivos sin hash del propio sitio
 *   "cache-primero"         → estáticos con hash en el nombre (nunca cambian)
 *   "stale-while-revalidate"→ imágenes de salones y fuentes
 */
function estrategiaPara(peticion, origenSitio) {
  // La Cache API no guarda POST, y los datos de la API van por la capa local (services/cacheLocal.js).
  if (peticion.metodo !== "GET") return null;

  var url = new URL(peticion.url);
  var mismoSitio = url.origin === origenSitio;
  if (url.pathname.indexOf("/api/") !== -1) return null;

  if (peticion.modo === "navigate") return mismoSitio ? "red-primero" : null;

  if (mismoSitio) {
    // Expo les pone hash al bundle (_expo/static) y a los assets: si cambian, cambia el nombre.
    if (url.pathname.indexOf("/_expo/static/") === 0 || url.pathname.indexOf("/assets/") === 0) return "cache-primero";
    if (url.pathname === "/sw.js") return null;
    return "red-primero"; // manifest.json, íconos, index.html
  }

  var esFuente = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (peticion.destino === "image" || peticion.destino === "font" || esFuente) return "stale-while-revalidate";
  return null;
}

module.exports = { estrategiaPara };
