/**
 * GlamSpaces · Servicio de salones y paquetes (API de HU-06, usado por HU-07).
 *
 * Es el ÚNICO archivo que sabe cómo se llaman los endpoints de salones y qué
 * forma tienen sus JSON.
 *
 * Flujo de publicación (la API no publica al crear):
 *   1. POST /api/salones                 → crea el salón como "no_publicado"
 *   2. POST /api/salones/{id}/paquetes   → uno por paquete
 *   3. PUT  /api/salones/{id}            → estado "publicado" (exige ≥ 1 paquete)
 *
 * Mientras no hay JWT, el adminId (el `id` que regresa el login) va en el body.
 * El PUT REEMPLAZA todo: siempre hay que mandar todos los campos, o se borran.
 */

import { postJson, putJson } from "./api";

const RUTAS = {
  salones: "/salones",
  salon: (salonId) => `/salones/${salonId}`,
  paquetes: (salonId) => `/salones/${salonId}/paquetes`,
};

function armarSalon(salon) {
  return {
    adminId: salon.adminId,
    nombre: salon.nombre,
    zona: salon.zona,
    capacidad: salon.capacidad,
    descripcion: salon.descripcion,
  };
}

function armarPaquete(adminId, paquete) {
  return {
    adminId,
    nombrePaquete: paquete.nombre,
    descripcion: paquete.descripcion,
    precio: paquete.precio,
  };
}

// 201 → { id, adminId, nombre, zona, capacidad, descripcion, estado, paquetes, fotos, ... }
export function crearSalon(salon) {
  return postJson(RUTAS.salones, armarSalon(salon));
}

// 201 → { id, salonId, nombrePaquete, descripcion, precio }
export function crearPaquete(salonId, adminId, paquete) {
  return postJson(RUTAS.paquetes(salonId), armarPaquete(adminId, paquete));
}

// 200 → el salón completo. 400 si no tiene paquetes (el salón no se modifica).
export function publicarSalon(salonId, salon) {
  return putJson(RUTAS.salon(salonId), { ...armarSalon(salon), estado: "publicado" });
}
