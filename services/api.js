/**
 * GlamSpaces · Cliente HTTP base para hablar con la API.
 *
 * La URL viene de la variable de entorno EXPO_PUBLIC_API_URL (archivo .env en
 * local, secret de GitHub Actions en producción). Nunca va escrita en el código.
 *
 * Formato de la API (Sprint 2.5 del backend): TODAS las respuestas, éxito o error, son
 *   { "codigo": 0, "mensaje": "...", "datos": { ... }, "exito": true }
 * y los listados agregan { pagina, tamanoPagina, totalRegistros, totalPaginas }.
 * Todos los endpoints son POST.
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(tipo, estado, mensaje, codigo) {
    super(tipo);
    this.tipo = tipo; // "config" | "red" | "http"
    this.estado = estado || null;
    this.mensaje = mensaje || null; // mensaje de negocio en español, si la API lo mandó
    this.codigo = codigo || null; // número del catálogo de errores de la API (ej. 2003)
  }
}

// Regresa la respuesta COMPLETA de la API ({ codigo, mensaje, datos, ... }).
async function enviar(ruta, cuerpo) {
  if (!API_URL) {
    throw new ApiError("config");
  }

  let resp;
  try {
    resp = await fetch(`${API_URL}${ruta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
  } catch (e) {
    throw new ApiError("red");
  }

  let data = null;
  try {
    data = await resp.json();
  } catch (e) {
    // la respuesta no traía JSON; no pasa nada
  }

  if (!resp.ok || (data && data.exito === false)) {
    throw new ApiError("http", resp.status, data && data.mensaje, data && data.codigo);
  }
  return data || {};
}

// Para operaciones normales: regresa solo lo que viene en "datos".
export async function postJson(ruta, cuerpo) {
  const respuesta = await enviar(ruta, cuerpo);
  return respuesta.datos;
}

// Para listados: regresa { datos, pagina, tamanoPagina, totalRegistros, totalPaginas, mensaje }.
export async function postPaginado(ruta, cuerpo) {
  const { datos, pagina, tamanoPagina, totalRegistros, totalPaginas, mensaje } = await enviar(ruta, cuerpo);
  return { datos: datos || [], pagina, tamanoPagina, totalRegistros, totalPaginas, mensaje };
}

// Mensaje para el usuario según el tipo de fallo.
// (No usa instanceof a propósito: se revisa la propiedad `tipo`.)
export function textoDeErrorApi(error) {
  if (!error || !error.tipo) {
    return "Ocurrió un error, intenta de nuevo.";
  }
  if (error.tipo === "config") {
    return "La app no tiene configurada la URL de la API (EXPO_PUBLIC_API_URL).";
  }
  if (error.tipo === "red") {
    return "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
  }
  // La API ya manda el motivo en español para reglas de negocio: se muestra tal cual.
  if (error.mensaje) {
    return error.mensaje;
  }
  if (error.estado === 400) {
    return "La API rechazó los datos. Revisa el formulario.";
  }
  if (error.estado === 401 || error.estado === 403) {
    return "No tienes permiso para realizar esta acción con esta cuenta.";
  }
  if (error.estado === 404) {
    return "No se encontró lo que se buscaba. Es posible que ya no exista.";
  }
  return "Ocurrió un error, intenta de nuevo.";
}
