/**
 * GlamSpaces · HU-16 · Armado del envío a POST /api/solicitudes/crear y mensajes de sus errores.
 * Funciones puras (sin React, sin red), probadas con node --test.
 *
 * La API (HU-15) guarda: clienteId, salonId, paqueteId?, fechaEvento, tipoEvento, numeroInvitados,
 * telefonoContacto, comentarios?. El nombre lo toma de la cuenta del cliente y el correo no lo
 * guarda: por eso no se mandan.
 */

import { aNumero } from "../utils/validadores.js";

// borrador: { salonId, paqueteId, fecha, tipoEvento, invitados, telefono, comentarios }
export function armarSolicitudParaApi(clienteId, borrador) {
  const comentarios = String(borrador.comentarios || "").trim();
  return {
    clienteId, // TODO: tomar clienteId del JWT cuando exista la autenticación
    salonId: borrador.salonId,
    paqueteId: borrador.paqueteId || null,
    fechaEvento: borrador.fecha,
    tipoEvento: String(borrador.tipoEvento || "").trim(),
    numeroInvitados: aNumero(borrador.invitados),
    telefonoContacto: String(borrador.telefono || "").replace(/\D/g, ""),
    comentarios: comentarios || null,
  };
}

// Qué hacer después de cada error: regresar al calendario, a los paquetes, a "Mis solicitudes"
// o volver a iniciar sesión. null: solo mostrar el mensaje.
const ERRORES = {
  1005: { texto: "Tu cuenta ya no existe. Inicia sesión de nuevo.", accion: "sesion" },
  2001: { texto: "Este salón ya no está disponible para reservar.", accion: null },
  3001: { texto: "El paquete elegido ya no está disponible. Elige otro paquete.", accion: "paquete" },
  4002: { texto: "Esa fecha se acaba de ocupar. Elige otra fecha disponible.", accion: "fecha" },
  4003: { texto: "Solo las cuentas de cliente pueden enviar solicitudes.", accion: "sesion" },
  4004: { texto: "Ya tienes una solicitud pendiente para este salón en esa fecha.", accion: "misSolicitudes" },
};

// error: el ApiError de services/api.js → { texto, accion }
export function mensajeDeErrorSolicitud(error) {
  if (error && error.tipo === "red") {
    return { texto: "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.", accion: null };
  }
  if (error && error.tipo === "config") {
    return { texto: "La app no tiene configurada la URL de la API (EXPO_PUBLIC_API_URL).", accion: null };
  }
  const conocido = error && ERRORES[error.codigo];
  if (conocido) return { ...conocido };
  if (error && error.codigo === 1001) {
    // 1001: la API dice qué dato rechazó; si es la fecha, se sugiere elegir otra.
    const texto = error.mensaje || "Revisa los datos de tu solicitud.";
    return { texto, accion: /fecha/i.test(texto) ? "fecha" : null };
  }
  return { texto: (error && error.mensaje) || "No se pudo enviar tu solicitud. Intenta de nuevo.", accion: null };
}
