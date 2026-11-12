/**
 * GlamSpaces · HU-19 · Reglas del panel del administrador. Funciones puras (sin React ni API).
 *
 * Las solicitudes llegan de POST /api/solicitudes/listarPorSalon con estado "todas"; aquí se
 * separan en pendientes (para atender) e historial, y se calculan las cifras de las tarjetas.
 * Las fechas son texto "yyyy-MM-dd", así que se comparan directo.
 */

import { formatearFechaCorta } from "../../utils/fechas";

// Criterio 1: pendientes ordenadas por fecha del evento (las más próximas primero).
export function solicitudesPendientes(solicitudes) {
  return solicitudes
    .filter((s) => s.estado === "pendiente")
    .sort((a, b) => a.fechaEvento.localeCompare(b.fechaEvento) || a.id - b.id);
}

// Ya atendidas (confirmadas o rechazadas), de la más reciente a la más vieja.
export function historialReciente(solicitudes, limite = 5) {
  const atendidas = solicitudes
    .filter((s) => s.estado !== "pendiente")
    .sort((a, b) => String(b.fechaCreacion).localeCompare(String(a.fechaCreacion)) || b.id - a.id);
  return limite ? atendidas.slice(0, limite) : atendidas;
}

// Cifras de las tarjetas: pendientes, aceptadas con evento en el mes actual y lo que suman sus paquetes.
export function estadisticas(solicitudes, hoyClave) {
  const mesActual = hoyClave.slice(0, 7); // "2026-11"
  const aceptadasMes = solicitudes.filter((s) => s.estado === "confirmada" && s.fechaEvento.startsWith(mesActual));
  return {
    pendientes: solicitudes.filter((s) => s.estado === "pendiente").length,
    aceptadasMes: aceptadasMes.length,
    ingresosMes: aceptadasMes.reduce((total, s) => total + (Number(s.precioPaquete) || 0), 0),
  };
}

// Próximas reservas confirmadas del calendario (de hoy en adelante, en orden).
export function proximasConfirmadas(solicitudes, hoyClave, limite = 5) {
  return solicitudes
    .filter((s) => s.estado === "confirmada" && s.fechaEvento >= hoyClave)
    .sort((a, b) => a.fechaEvento.localeCompare(b.fechaEvento))
    .slice(0, limite);
}

// Fechas con alguna solicitud pendiente (borde dorado en el calendario).
export function fechasConPendientes(solicitudes) {
  return new Set(solicitudes.filter((s) => s.estado === "pendiente").map((s) => s.fechaEvento));
}

// Otras pendientes del mismo día que se rechazarán solas si se acepta esta (HU-17).
export function pendientesEnConflicto(solicitudes, solicitud) {
  return solicitudes.filter(
    (s) => s.estado === "pendiente" && s.id !== solicitud.id && s.fechaEvento === solicitud.fechaEvento,
  ).length;
}

// "Vie 11 sep 2026 · Paquete Completo · 120 inv."
export function detalleSolicitud(s) {
  return `${formatearFechaCorta(s.fechaEvento)} · ${s.nombrePaquete || "Sin paquete"} · ${s.numeroInvitados} inv.`;
}

// "María López García" → "ML"   ·   "Jardín Villa Esmeralda" → "JV"
export function iniciales(nombre) {
  return String(nombre || "")
    .replace(/[[\]()]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 0 && p[0] === p[0].toUpperCase() && /\p{L}/u.test(p[0]))
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || (String(nombre || "").match(/[\p{L}\d]/u) || ["G"])[0].toUpperCase();
}

export const ETIQUETA_ESTADO = { pendiente: "Pendiente", confirmada: "Confirmada", rechazada: "Rechazada" };
