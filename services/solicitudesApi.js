/**
 * GlamSpaces · Servicio de solicitudes de reservación (API de HU-15, usado por HU-16).
 *
 * Es el ÚNICO archivo que sabe cómo se llaman los endpoints de solicitudes y qué
 * forma tienen sus JSON. Todos son POST.
 *
 * Mientras no hay JWT, el clienteId (el `id` que regresa el login) va en el body.
 * El nombre de contacto no se manda: la API lo toma de la cuenta del cliente.
 *
 * Códigos que regresa la API (además de los generales):
 *   1001 datos inválidos (campo vacío, fecha pasada, invitados ≤ 0 o > capacidad)
 *   4002 la fecha ya no está disponible      4004 ya hay una pendiente para ese salón y fecha
 *   4001 la solicitud no existe              4005 la solicitud no es de ese cliente
 */

import { postJson, postPaginado } from "./api";

const RUTAS = {
  crear: "/solicitudes/crear",
  obtener: "/solicitudes/obtener",
  listar: "/solicitudes/listar",
};

export const CODIGOS_SOLICITUD = {
  datosInvalidos: 1001,
  fechaNoDisponible: 4002,
  solicitudDuplicada: 4004,
};

// La API regresa las fechas como "2026-12-05T00:00:00"; la app usa "2026-12-05".
function armarSolicitud(s) {
  return { ...s, fechaEvento: String(s.fechaEvento).slice(0, 10) };
}

// → la solicitud creada, en estado "pendiente"
export async function crearSolicitud(clienteId, solicitud) {
  const creada = await postJson(RUTAS.crear, {
    clienteId,
    salonId: solicitud.salonId,
    paqueteId: solicitud.paqueteId || null,
    fechaEvento: solicitud.fecha,
    tipoEvento: solicitud.tipoEvento.trim(),
    numeroInvitados: solicitud.numeroInvitados,
    telefonoContacto: solicitud.telefono.trim(),
    comentarios: solicitud.comentarios.trim() || null,
  });
  return armarSolicitud(creada);
}

// → { id, nombreSalon, fechaEvento, tipoEvento, numeroInvitados, nombrePaquete, estado, ... }
//   estado: "pendiente" | "confirmada" | "rechazada"
export async function obtenerSolicitud(clienteId, solicitudId) {
  return armarSolicitud(await postJson(RUTAS.obtener, { id: solicitudId, clienteId }));
}

// → { datos: [solicitudes, más recientes primero], pagina, totalPaginas, totalRegistros, mensaje }
export async function listarSolicitudes(clienteId, { pagina = 1, tamanoPagina = 10 } = {}) {
  const r = await postPaginado(RUTAS.listar, { clienteId, pagina, tamanoPagina });
  return { ...r, datos: r.datos.map(armarSolicitud) };
}
