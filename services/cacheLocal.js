/**
 * GlamSpaces · Caché local de datos de la API (HU-21, la reutiliza la HU-22).
 *
 * El service worker solo guarda la app (HTML, JS, íconos, fotos). Los datos de la API
 * son POST y la Cache API no los guarda, así que se guardan aquí, en AsyncStorage
 * (localStorage en web). Uso:
 *
 *   const llave = llaveCache(usuarioId, "busqueda", zona);
 *   await guardarCache(llave, respuesta);
 *   const g = await leerCache(llave); // → { datos, guardadoEn } | null
 *
 * Al cerrar sesión, sesionStorage.cerrarSesion() llama a borrarCacheCompleta().
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { conRespaldo, crearCacheLocal } from "./cacheLocal.nucleo";

export { llaveCache } from "./cacheLocal.nucleo";

const cache = crearCacheLocal(AsyncStorage);

export const guardarCache = cache.guardar;
export const leerCache = cache.leer;
export const borrarCache = cache.borrar;
export const borrarCacheCompleta = cache.borrarTodo;

// HU-22 · Pide a la API y guarda; sin conexión regresa lo guardado → { datos, desactualizado, guardadoEn }.
// En Android/iOS navigator.onLine no existe: ahí decide el error "red" de la petición.
export function conRespaldoLocal(llave, pedir) {
  const enLinea = typeof navigator === "undefined" || navigator.onLine !== false;
  return conRespaldo({ pedir, enLinea, leer: () => leerCache(llave), guardar: (datos) => guardarCache(llave, datos) });
}
