/**
 * GlamSpaces · HU-16 · Validaciones del formulario de solicitud de reservación.
 * Funciones puras (sin React, sin red): reciben datos y devuelven errores.
 */

import { aNumero } from "../../utils/validadores";

export const LIMITE_COMENTARIOS = 500; // NVARCHAR(500) en la BD
const MIN_DIGITOS_TELEFONO = 10;
const MAX_DIGITOS_TELEFONO = 15;
const REGEX_CARACTERES_TELEFONO = /^[\d\s()+-]+$/;

// Nombre corto de cada campo para el aviso general "Revisa: ...".
const NOMBRES_CAMPOS = {
  fecha: "fecha",
  tipoEvento: "tipo de evento",
  invitados: "número de invitados",
  nombre: "nombre",
  telefono: "teléfono",
  comentarios: "comentarios",
};

export function validarTelefono(telefono) {
  const texto = telefono.trim();
  if (!texto) {
    return "Escribe un teléfono de contacto.";
  }
  const digitos = texto.replace(/\D/g, "").length;
  if (!REGEX_CARACTERES_TELEFONO.test(texto) || digitos < MIN_DIGITOS_TELEFONO || digitos > MAX_DIGITOS_TELEFONO) {
    return "Escribe un teléfono válido de 10 dígitos (puede llevar lada).";
  }
  return null;
}

// Regla de negocio: nombre y teléfono son obligatorios para enviar la solicitud.
export function validarSolicitud({ fecha, tipoEvento, invitados, capacidad, nombre, telefono, comentarios }) {
  const errores = {};

  if (!fecha) {
    errores.fecha = "Elige la fecha del evento en el calendario.";
  }

  if (!tipoEvento.trim()) {
    errores.tipoEvento = "Escribe o elige el tipo de evento.";
  }

  if (!String(invitados).trim()) {
    errores.invitados = "Escribe cuántos invitados esperas.";
  } else {
    const n = aNumero(invitados);
    if (!Number.isInteger(n) || n <= 0) {
      errores.invitados = "El número de invitados debe ser un entero mayor a 0.";
    } else if (capacidad && n > capacidad) {
      errores.invitados = `El salón recibe hasta ${capacidad} personas.`;
    }
  }

  if (!nombre || !nombre.trim()) {
    errores.nombre = "Tu cuenta no tiene nombre. Inicia sesión de nuevo.";
  }

  const errorTelefono = validarTelefono(telefono);
  if (errorTelefono) {
    errores.telefono = errorTelefono;
  }

  if (comentarios.length > LIMITE_COMENTARIOS) {
    errores.comentarios = `Máximo ${LIMITE_COMENTARIOS} caracteres.`;
  }

  return errores;
}

// Criterio 2: dice qué falta antes de enviar. { tipoEvento, telefono } → "Revisa: tipo de evento y teléfono."
export function resumenErrores(errores) {
  const campos = Object.keys(errores).map((c) => NOMBRES_CAMPOS[c] || c);
  if (campos.length === 0) return null;
  const lista = campos.length === 1 ? campos[0] : `${campos.slice(0, -1).join(", ")} y ${campos[campos.length - 1]}`;
  return `Revisa: ${lista}.`;
}
