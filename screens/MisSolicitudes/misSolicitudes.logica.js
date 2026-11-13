/**
 * GlamSpaces · Sprint 7 · Reglas de "Mis solicitudes" del cliente. Funciones puras.
 *
 * El cliente ve sus solicitudes en tarjetas con los mismos filtros que el administrador
 * (Todas / Pendientes / Confirmadas / Rechazadas, con contadores del TOTAL, no de la página)
 * y paginación de 10 en 10.
 *
 * La foto del salón viene en la propia respuesta de POST /api/solicitudes/listar
 * (`fotoPrincipal`, string o null), así que no se pide el salón de cada solicitud: una sola
 * llamada trae todo. Si una solicitud no tiene foto, o su URL falla, la tarjeta pinta el
 * marcador de posición.
 */

import { contarPorEstado as contarEstados, FILTROS_ESTADO } from "../PanelAdministrador/panelAdministrador.logica.js";

// Los mismos filtros que el panel del administrador.
export { FILTROS_ESTADO };

export const ORDENES_CLIENTE = [
  { clave: "recientes", texto: "Más recientes" },
  { clave: "proximas", texto: "Fecha del evento" },
];

/** Cuántas solicitudes hay de cada estado. Siempre del total, nunca de la página que se ve. */
export function contarPorEstado(solicitudes) {
  return contarEstados(Array.isArray(solicitudes) ? solicitudes : []);
}

/**
 * Filtra por estado ("todas" no filtra) y ordena.
 * "recientes": la solicitud más nueva primero (es lo que espera el cliente).
 * "proximas": por fecha del evento, la más próxima primero.
 */
export function listaDeMisSolicitudes(solicitudes, estado = "todas", orden = "recientes") {
  const todas = Array.isArray(solicitudes) ? solicitudes : [];
  const filtradas = estado === "todas" ? [...todas] : todas.filter((s) => s.estado === estado);
  return orden === "proximas"
    ? filtradas.sort((a, b) => String(a.fechaEvento).localeCompare(String(b.fechaEvento)) || a.id - b.id)
    : filtradas.sort((a, b) => String(b.fechaCreacion).localeCompare(String(a.fechaCreacion)) || b.id - a.id);
}

/**
 * Lo que necesita pintar una tarjeta. `fotoPrincipal` es opcional: si el salón no tiene fotos
 * (la API manda null) o la URL da 404, la tarjeta usa el marcador de posición.
 * → { id, salonId, nombreSalon, estado, fotoPrincipal, nombrePaquete, numeroInvitados, fechaEvento }
 */
export function tarjetaDeSolicitud(solicitud) {
  const s = solicitud || {};
  return {
    // Se conserva todo lo que mandó la API (tipoEvento, comentarios, teléfono…) y encima se
    // normaliza lo que la tarjeta necesita sí o sí.
    ...s,
    id: s.id,
    salonId: s.salonId,
    nombreSalon: s.nombreSalon || "Salón",
    estado: s.estado,
    fotoPrincipal: s.fotoPrincipal || null,
    nombrePaquete: s.nombrePaquete || null,
    numeroInvitados: Number(s.numeroInvitados) || 0,
    fechaEvento: s.fechaEvento,
    fechaCreacion: s.fechaCreacion,
  };
}

export function tarjetasDeSolicitudes(solicitudes) {
  return (Array.isArray(solicitudes) ? solicitudes : []).map(tarjetaDeSolicitud);
}

/** Texto del estado vacío según el filtro, para no dejar la pantalla en blanco. */
export function textoSinResultados(estado) {
  switch (estado) {
    case "pendiente":
      return "No tienes solicitudes pendientes.";
    case "confirmada":
      return "Todavía no tienes solicitudes confirmadas.";
    case "rechazada":
      return "No tienes solicitudes rechazadas.";
    default:
      return "Todavía no has enviado ninguna solicitud.";
  }
}
