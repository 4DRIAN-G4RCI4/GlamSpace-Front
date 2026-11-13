/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Consulta de ubicación para el campo "Zona o dirección".
 *
 * Dos servicios públicos y SIN clave (no se guarda ninguna credencial en el repo):
 *   - https://api.zippopotam.us/mx/{cp}        → colonias de un código postal
 *   - https://nominatim.openstreetmap.org/...  → búsqueda por texto libre (OpenStreetMap)
 *
 * Reglas que se respetan:
 *   - Solo se consulta al escribir o al elegir, nunca en bucle ni al cargar la pantalla.
 *   - Nominatim pide máximo 1 petición por segundo: aquí se espacian (ESPERA_ENTRE_PETICIONES_MS).
 *   - No se manda ningún dato personal, solo lo que el administrador escribió en el campo.
 *   - Si falla, se avisa y el campo se sigue escribiendo a mano: nunca bloquea guardar.
 *   - El service worker no cachea estas rutas (ver scripts/swEstrategia.js y su prueba).
 *
 * Las respuestas se interpretan en services/ubicacion.logica.js (funciones puras y probadas).
 */

import {
  ESPERA_ENTRE_PETICIONES_MS,
  coloniasDesdeCodigoPostal,
  sugerenciasDesdeDireccion,
} from "./ubicacion.logica";

const URL_CP = "https://api.zippopotam.us/mx/";
const URL_DIRECCION = "https://nominatim.openstreetmap.org/search";
const MAXIMO_SUGERENCIAS = 6;

// Momento en que se hizo la última consulta, para no pasar de 1 por segundo.
let ultimaConsulta = 0;

function esperar(ms) {
  return new Promise((listo) => setTimeout(listo, ms));
}

async function respetarLimite() {
  const desde = Date.now() - ultimaConsulta;
  if (desde < ESPERA_ENTRE_PETICIONES_MS) {
    await esperar(ESPERA_ENTRE_PETICIONES_MS - desde);
  }
  ultimaConsulta = Date.now();
}

// `senal` (AbortSignal) permite cancelar la consulta anterior cuando se sigue escribiendo.
async function pedirJson(url, senal) {
  let respuesta;
  try {
    respuesta = await fetch(url, { method: "GET", signal: senal, headers: { Accept: "application/json" } });
  } catch (error) {
    if (error && error.name === "AbortError") throw error;
    const fallo = new Error("ubicacion");
    fallo.tipo = "red";
    throw fallo;
  }

  // Zippopotam contesta 404 cuando el código postal no existe: no es un error, no hay colonias.
  if (respuesta.status === 404) return null;
  if (!respuesta.ok) {
    const fallo = new Error("ubicacion");
    fallo.tipo = "http";
    fallo.estado = respuesta.status;
    throw fallo;
  }
  return respuesta.json();
}

/**
 * Colonias de un código postal mexicano (5 dígitos).
 * → [{ colonia, municipio, estado, cp, zona }] · lista vacía si el CP no existe.
 */
export async function buscarPorCodigoPostal(cp, { senal } = {}) {
  await respetarLimite();
  const datos = await pedirJson(`${URL_CP}${encodeURIComponent(cp)}`, senal);
  return coloniasDesdeCodigoPostal(datos, cp);
}

/**
 * Sugerencias para un texto libre (calle, colonia, municipio).
 * → [{ id, etiqueta, colonia, municipio, estado, cp, zona }]
 */
export async function buscarPorDireccion(texto, { senal } = {}) {
  await respetarLimite();
  const parametros = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "mx",
    limit: String(MAXIMO_SUGERENCIAS),
    q: texto,
  });
  const datos = await pedirJson(`${URL_DIRECCION}?${parametros.toString()}`, senal);
  return sugerenciasDesdeDireccion(datos).slice(0, MAXIMO_SUGERENCIAS);
}
