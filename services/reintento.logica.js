/**
 * GlamSpaces · HU-25/HU-28 · Un reintento automático para las consultas de lectura.
 *
 * Cuando la API de Azure lleva un rato sin uso, la primera petición la "despierta" y puede
 * responder 5xx o cortarse. Para que el usuario no vea el error, las LECTURAS se reintentan
 * una sola vez tras una espera corta. Las escrituras (crear, aceptar, eliminar…) nunca se
 * reintentan: repetirlas podría duplicar datos.
 */

export const ESPERA_REINTENTO_MS = 1500;

// Rutas que solo leen: /salones/buscar, /salones/obtener, /solicitudes/listar,
// /solicitudes/listarPorSalon, /salones/disponibilidad…
const LECTURA = /\/(buscar|obtener|listar|listarPorSalon|disponibilidad)$/;

export function esLectura(ruta) {
  return LECTURA.test(String(ruta ?? "").split("?")[0]);
}

// Solo vale la pena reintentar si el problema fue del servidor o de la red, no de los datos.
export function debeReintentar(error) {
  if (!error) return false;
  if (error.tipo === "red") return true;
  return error.tipo === "http" && Number(error.estado) >= 500;
}

const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

// Corre la operación; si es una lectura y falla por red o 5xx, la repite UNA vez.
export async function conReintento(ruta, operacion, { espera = ESPERA_REINTENTO_MS } = {}) {
  try {
    return await operacion();
  } catch (error) {
    if (!esLectura(ruta) || !debeReintentar(error)) throw error;
    await esperar(espera);
    return operacion();
  }
}
