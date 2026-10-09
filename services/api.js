/**
 * GlamSpaces · Cliente HTTP base para hablar con la API.
 *
 * La URL viene de la variable de entorno EXPO_PUBLIC_API_URL (archivo .env en
 * local, secret de GitHub Actions en producción). Nunca va escrita en el código.
 *
 * Formato de errores de la API:
 *   - Reglas de negocio (400 / 403): { "mensaje": "texto en español" }
 *   - 404 y JSON con tipo incorrecto: formato estándar de ASP.NET (inglés, sin "mensaje")
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(tipo, estado, mensaje) {
    super(tipo);
    this.tipo = tipo; // "config" | "red" | "http"
    this.estado = estado || null;
    this.mensaje = mensaje || null; // mensaje de negocio en español, si la API lo mandó
  }
}

async function enviarJson(metodo, ruta, cuerpo) {
  if (!API_URL) {
    throw new ApiError("config");
  }

  let resp;
  try {
    resp = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
  } catch (e) {
    throw new ApiError("red");
  }

  if (!resp.ok) {
    let mensaje = null;
    try {
      const data = await resp.json();
      mensaje = data.mensaje || data.message || null;
    } catch (e) {
      // la respuesta de error no traía JSON; no pasa nada
    }
    throw new ApiError("http", resp.status, mensaje);
  }

  try {
    return await resp.json();
  } catch (e) {
    return {};
  }
}

export function postJson(ruta, cuerpo) {
  return enviarJson("POST", ruta, cuerpo);
}

export function putJson(ruta, cuerpo) {
  return enviarJson("PUT", ruta, cuerpo);
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
