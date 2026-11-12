/**
 * GlamSpaces · HU-21 · Service worker (cuerpo). posexport.js arma dist/sw.js anteponiendo:
 *   VERSION        → hash del contenido de dist (cambia en cada build con cambios)
 *   PRECACHE       → lista real de archivos de dist
 *   estrategiaPara → copia de scripts/swEstrategia.js
 * No editar dist/sw.js a mano: se regenera con `npm run build:web`.
 */

var CACHE_APP = "glamspaces-app-" + VERSION; // shell + estáticos de esta versión
var CACHE_MEDIOS = "glamspaces-medios"; // fotos de salones y fuentes (no dependen de la versión)
var MAX_MEDIOS = 150; // para no llenar el almacenamiento del teléfono con fotos
var ESPERA_RED_MS = 3000; // con red lenta, la navegación cae al index.html guardado

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches
      .open(CACHE_APP)
      .then(function (cache) { return cache.addAll(PRECACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

// Borra las cachés de versiones anteriores y toma el control de las pestañas abiertas.
self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches
      .keys()
      .then(function (nombres) {
        return Promise.all(
          nombres
            .filter(function (n) { return n.indexOf("glamspaces-") === 0 && n !== CACHE_APP && n !== CACHE_MEDIOS; })
            .map(function (n) { return caches.delete(n); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (evento) {
  var r = evento.request;
  var estrategia = estrategiaPara({ metodo: r.method, url: r.url, modo: r.mode, destino: r.destination }, self.location.origin);
  if (!estrategia) return; // POST, API y lo desconocido van directo a la red

  if (estrategia === "cache-primero") evento.respondWith(cachePrimero(r));
  else if (estrategia === "stale-while-revalidate") evento.respondWith(staleWhileRevalidate(r, evento));
  else evento.respondWith(redPrimero(r));
});

// Guarda una copia en la caché de la app sin hacer esperar la respuesta.
// Si no se puede guardar (por ejemplo, almacenamiento lleno) la app sigue funcionando igual.
function guardarCopia(llave, resp) {
  var copia = resp.clone();
  return caches
    .open(CACHE_APP)
    .then(function (c) { return c.put(llave, copia); })
    .catch(function () { return undefined; });
}

function cachePrimero(peticion) {
  return caches.match(peticion).then(function (guardada) {
    return guardada || fetch(peticion).then(function (resp) {
      if (resp.ok) void guardarCopia(peticion, resp);
      return resp;
    });
  });
}

function staleWhileRevalidate(peticion, evento) {
  return caches.open(CACHE_MEDIOS).then(function (cache) {
    return cache.match(peticion).then(function (guardada) {
      var deRed = fetch(peticion)
        .then(function (resp) {
          // Las fotos de otros dominios llegan "opaque" (status 0): también sirven sin conexión.
          if (resp.ok || resp.type === "opaque") {
            return cache.put(peticion, resp.clone()).then(function () { return recortar(cache); }).then(function () { return resp; });
          }
          return resp;
        })
        .catch(function () { return guardada || Response.error(); });
      evento.waitUntil(deRed.catch(function () {}));
      return guardada || deRed;
    });
  });
}

function recortar(cache) {
  return cache.keys().then(function (llaves) {
    var sobran = llaves.length - MAX_MEDIOS;
    return Promise.all(llaves.slice(0, Math.max(0, sobran)).map(function (l) { return cache.delete(l); }));
  });
}

// Navegación y archivos sin hash: la red manda; si falla o tarda más de ESPERA_RED_MS,
// se responde con lo guardado (para navegaciones, el index.html guardado como "/": la app abre sin conexión).
function redPrimero(peticion) {
  var esNavegacion = peticion.mode === "navigate";
  var deCache = function () {
    return caches.match(esNavegacion ? "/" : peticion).then(function (g) { return g || Response.error(); });
  };
  var deRed = fetch(peticion).then(function (resp) {
    if (resp.ok) void guardarCopia(esNavegacion ? "/" : peticion, resp);
    return resp;
  });

  return new Promise(function (resolver) {
    var resuelto = false;
    var usarCache = function () {
      if (resuelto) return;
      deCache()
        .then(function (g) {
          if (resuelto) return;
          if (g.type !== "error") { resuelto = true; resolver(g); }
        })
        .catch(function () { return undefined; }); // sin copia guardada: se sigue esperando a la red
    };
    var temporizador = setTimeout(usarCache, ESPERA_RED_MS);
    deRed
      .then(function (resp) { clearTimeout(temporizador); if (!resuelto) { resuelto = true; resolver(resp); } })
      .catch(function () {
        clearTimeout(temporizador);
        var responder = function (g) { if (!resuelto) { resuelto = true; resolver(g); } };
        deCache().then(responder, function () { responder(Response.error()); });
      });
  });
}
