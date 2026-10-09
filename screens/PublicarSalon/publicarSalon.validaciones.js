/**
 * GlamSpaces · HU-07 · Validaciones del formulario de publicación de salón.
 * Funciones puras (sin React, sin red): reciben datos y devuelven errores.
 */

import { aNumero } from "../../utils/validadores";

export function validarSalon({ nombre, zona, capacidad }) {
  const errores = {};

  if (!nombre.trim()) {
    errores.nombre = "Escribe el nombre del salón.";
  }

  if (!zona.trim()) {
    errores.zona = "Escribe la zona o dirección del salón.";
  }

  if (!String(capacidad).trim()) {
    errores.capacidad = "Escribe la capacidad del salón.";
  } else {
    const n = aNumero(capacidad);
    if (!Number.isInteger(n) || n <= 0) {
      errores.capacidad = "La capacidad debe ser un número entero mayor a 0.";
    }
  }

  return errores;
}

// Criterio 3: precio cero o negativo se rechaza ANTES de ir a la API.
export function validarPaquete({ nombre, precio }) {
  const errores = {};

  if (!nombre.trim()) {
    errores.nombre = "Escribe el nombre del paquete.";
  }

  if (!String(precio).trim()) {
    errores.precio = "Escribe el precio del paquete.";
  } else {
    const n = aNumero(precio);
    if (!Number.isFinite(n) || n <= 0) {
      errores.precio = "El precio debe ser un número mayor a 0.";
    }
  }

  return errores;
}

// Criterio 2: sin paquetes no se puede publicar.
export function validarPublicacion({ nombre, zona, capacidad, paquetes, borradorConDatos }) {
  const errores = validarSalon({ nombre, zona, capacidad });

  if (paquetes.length === 0) {
    errores.paquetes = borradorConDatos
      ? 'Pulsa "Agregar paquete" para incluir el paquete que escribiste.'
      : "Agrega al menos un paquete para publicar tu salón.";
  }

  return errores;
}
