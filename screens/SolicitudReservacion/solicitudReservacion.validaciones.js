/**
 * GlamSpaces · HU-16 · Validaciones del flujo de solicitud de reservación (Cliente 04 y 05).
 * Funciones puras (sin React, sin red): reciben datos y devuelven el mensaje de error o null.
 */

import { aNumero, esCorreoValido } from "../../utils/validadores.js";
import { validarFechaEvento } from "../DetalleSalon/detalleSalon.validaciones.js";

export const LIMITE_COMENTARIOS = 500; // NVARCHAR(500) en la BD
export const DIGITOS_TELEFONO = 10;
const REGEX_CARACTERES_TELEFONO = /^[\d\s().-]+$/;

export const TIPOS_EVENTO = ["Boda", "XV años", "Cumpleaños", "Bautizo", "Graduación", "Evento empresarial"];

// Nombre corto de cada campo para el aviso general junto al botón.
const NOMBRES_CAMPOS = {
  fecha: "fecha",
  tipoEvento: "tipo de evento",
  invitados: "invitados",
  telefono: "teléfono",
  comentarios: "comentarios",
  nombre: "nombre",
  correo: "correo",
  terminos: "términos",
  detalles: "detalles del evento", // en el paso 2, si algo del paso 1 quedó mal
};

// "771 123-4567" → "7711234567"
export function soloDigitos(texto) {
  return String(texto || "").replace(/\D/g, "");
}

// Fecha requerida, futura (a partir de mañana) y no ocupada.
export function validarFecha(fecha, { hoy, ocupadas = [] }) {
  if (!fecha) return "Elige la fecha del evento en el calendario.";
  return validarFechaEvento(fecha, { hoy, ocupadas });
}

export function validarTipoEvento(tipoEvento) {
  return String(tipoEvento || "").trim() ? null : "Elige o escribe el tipo de evento.";
}

// Entero mayor a 0 y hasta la capacidad del salón.
export function validarInvitados(invitados, capacidad) {
  if (!String(invitados || "").trim()) return "Escribe cuántos invitados esperas.";
  const n = aNumero(invitados);
  if (!Number.isInteger(n) || n <= 0) return "El número de invitados debe ser un entero mayor a 0.";
  if (capacidad && n > capacidad) return `El salón recibe hasta ${capacidad} personas.`;
  return null;
}

// 10 dígitos; se aceptan espacios, guiones, puntos y paréntesis.
export function validarTelefono(telefono) {
  const texto = String(telefono || "").trim();
  if (!texto) return "Escribe un teléfono de contacto.";
  if (!REGEX_CARACTERES_TELEFONO.test(texto) || soloDigitos(texto).length !== DIGITOS_TELEFONO) {
    return "Escribe un teléfono de 10 dígitos.";
  }
  return null;
}

export function validarComentarios(comentarios) {
  return String(comentarios || "").length > LIMITE_COMENTARIOS ? `Máximo ${LIMITE_COMENTARIOS} caracteres.` : null;
}

export function validarNombre(nombre) {
  return String(nombre || "").trim() ? null : "Escribe tu nombre completo.";
}

export function validarCorreo(correo) {
  if (!String(correo || "").trim()) return "Escribe tu correo electrónico.";
  return esCorreoValido(correo) ? null : "Escribe un correo válido, por ejemplo tucorreo@ejemplo.com.";
}

export function validarTerminos(aceptados) {
  return aceptados ? null : "Acepta los términos y el aviso de privacidad para enviar.";
}

// Quita los campos sin error: { a: null, b: "x" } → { b: "x" }
function soloErrores(errores) {
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));
}

// Paso 1 · Cliente 04: fecha, tipo de evento, invitados, teléfono y comentarios.
export function validarPasoElegir({ fecha, hoy, ocupadas, tipoEvento, invitados, capacidad, telefono, comentarios }) {
  return soloErrores({
    fecha: validarFecha(fecha, { hoy, ocupadas }),
    tipoEvento: validarTipoEvento(tipoEvento),
    invitados: validarInvitados(invitados, capacidad),
    telefono: validarTelefono(telefono),
    comentarios: validarComentarios(comentarios),
  });
}

// Paso 2 · Cliente 05: datos de contacto y términos.
export function validarPasoConfirmar({ nombre, telefono, correo, terminos }) {
  return soloErrores({
    nombre: validarNombre(nombre),
    telefono: validarTelefono(telefono),
    correo: validarCorreo(correo),
    terminos: validarTerminos(terminos),
  });
}

// Aviso junto al botón deshabilitado: { tipoEvento, telefono } → "Falta completar: tipo de evento y teléfono."
export function resumenErrores(errores) {
  const campos = Object.keys(errores).map((c) => NOMBRES_CAMPOS[c] || c);
  if (campos.length === 0) return null;
  const lista = campos.length === 1 ? campos[0] : `${campos.slice(0, -1).join(", ")} y ${campos[campos.length - 1]}`;
  return `Falta completar: ${lista}.`;
}
