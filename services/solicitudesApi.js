/**
 * GlamSpaces · Servicio de solicitudes de reservación (API de HU-15 y HU-18, usado por HU-16 y HU-19).
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
 *   2002 el salón no es de ese administrador  4006 la solicitud ya fue atendida (HU-18)
 */

import { postJson, postPaginado } from "./api";
import { conRespaldoLocal, llaveCache } from "./cacheLocal";
import { armarSolicitudParaApi } from "./solicitudes.logica";

const RUTAS = {
  crear: "/solicitudes/crear",
  obtener: "/solicitudes/obtener",
  listar: "/solicitudes/listar",
  // HU-18 · panel del administrador (HU-19)
  listarPorSalon: "/solicitudes/listarPorSalon",
  aceptar: "/solicitudes/aceptar",
  rechazar: "/solicitudes/rechazar",
};

export const CODIGOS_SOLICITUD = {
  datosInvalidos: 1001,
  noEsDueno: 2002,
  fechaNoDisponible: 4002,
  solicitudDuplicada: 4004,
  yaAtendida: 4006,
};

// La API regresa las fechas como "2026-12-05T00:00:00"; la app usa "2026-12-05".
function armarSolicitud(s) {
  return { ...s, fechaEvento: String(s.fechaEvento).slice(0, 10) };
}

// borrador: { salonId, paqueteId, fecha, tipoEvento, invitados, telefono, comentarios }
// (el body lo arma solicitudes.logica.js) → la solicitud creada, en estado "pendiente"
export async function crearSolicitud(clienteId, borrador) {
  const creada = await postJson(RUTAS.crear, armarSolicitudParaApi(clienteId, borrador));
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

// ---------- HU-18 · administrador del salón (lo usa el panel de la HU-19) ----------
// Mientras no hay JWT, el adminId (el `id` que regresa el login) va en el body.
// Solo el administrador dueño del salón puede listar o atender sus solicitudes (si no, 2002).

// Solicitudes de un salón ordenadas por fecha del evento (las más próximas primero).
// estado: "pendiente" (lo que regresa la API si no se manda), "confirmada", "rechazada" o "todas".
// → { datos: [{ id, nombreCliente, fechaEvento, tipoEvento, numeroInvitados, nombrePaquete,
//              precioPaquete, estado, ... }], pagina, totalPaginas, totalRegistros, mensaje }
export async function listarSolicitudesDeSalon(adminId, salonId, { estado = "pendiente", pagina = 1, tamanoPagina = 100 } = {}) {
  const r = await postPaginado(RUTAS.listarPorSalon, { adminId, salonId, estado, pagina, tamanoPagina });
  return { ...r, datos: r.datos.map(armarSolicitud) };
}

// HU-22 · Igual, pero sin conexión regresa lo último guardado (por admin, salón y estado)
// → { datos: <lo mismo que listarSolicitudesDeSalon>, desactualizado, guardadoEn }
export function listarSolicitudesDeSalonConRespaldo(adminId, salonId, opciones = {}) {
  const llave = llaveCache(adminId, "solicitudes", salonId, opciones.estado || "pendiente");
  return conRespaldoLocal(llave, () => listarSolicitudesDeSalon(adminId, salonId, opciones));
}

// Confirma la solicitud: la API bloquea la fecha y rechaza las demás pendientes de ese día (HU-17).
// → { ...solicitud, estado: "confirmada", solicitudesRechazadas }
export async function aceptarSolicitud(adminId, solicitudId) {
  return armarSolicitud(await postJson(RUTAS.aceptar, { id: solicitudId, adminId }));
}

// → { ...solicitud, estado: "rechazada", solicitudesRechazadas: 0 }. La fecha sigue disponible.
export async function rechazarSolicitud(adminId, solicitudId) {
  return armarSolicitud(await postJson(RUTAS.rechazar, { id: solicitudId, adminId }));
}
