/**
 * GlamSpaces · Servicio de salones y paquetes (API de HU-06, usado por HU-07).
 *
 * Es el ÚNICO archivo que sabe cómo se llaman los endpoints de salones y qué
 * forma tienen sus JSON.
 *
 * Flujo de publicación (la API no publica al crear). Todos son POST:
 *   1. /api/salones/crear       → crea el salón como "no_publicado"
 *   2. /api/paquetes/crear      → uno por paquete (salonId en el body)
 *   3. /api/salones/actualizar  → estado "publicado" (exige ≥ 1 paquete)
 *
 * Mientras no hay JWT, el adminId (el `id` que regresa el login) va en el body.
 * "actualizar" REEMPLAZA todo: siempre hay que mandar todos los campos, o se borran.
 */

import { postJson } from "./api";

const RUTAS = {
  crearSalon: "/salones/crear",
  actualizarSalon: "/salones/actualizar",
  crearPaquete: "/paquetes/crear",
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

function armarPaquete(salonId, adminId, paquete) {
  return {
    salonId,
    adminId,
    nombrePaquete: paquete.nombre,
    descripcion: paquete.descripcion,
    precio: paquete.precio,
  };
}

// → { id, adminId, nombre, zona, capacidad, descripcion, estado, paquetes, fotos, ... }
export function crearSalon(salon) {
  return postJson(RUTAS.crearSalon, armarSalon(salon));
}

// → { id, salonId, nombrePaquete, descripcion, precio }
export function crearPaquete(salonId, adminId, paquete) {
  return postJson(RUTAS.crearPaquete, armarPaquete(salonId, adminId, paquete));
}

// → el salón completo. Error 2003 si no tiene paquetes (el salón no se modifica).
export function publicarSalon(salonId, salon) {
  return postJson(RUTAS.actualizarSalon, { id: salonId, ...armarSalon(salon), estado: "publicado" });
}
