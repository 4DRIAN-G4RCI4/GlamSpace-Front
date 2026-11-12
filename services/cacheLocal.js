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
import { crearCacheLocal } from "./cacheLocal.nucleo";

export { llaveCache } from "./cacheLocal.nucleo";

const cache = crearCacheLocal(AsyncStorage);

export const guardarCache = cache.guardar;
export const leerCache = cache.leer;
export const borrarCache = cache.borrar;
export const borrarCacheCompleta = cache.borrarTodo;
