/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Validaciones de "Editar salón" (y crear).
 * Funciones puras: reciben los datos del formulario y regresan los errores por campo,
 * con el mensaje en español que se pinta debajo de cada uno.
 *
 * Reutiliza las reglas que ya existían para publicar (publicarSalon.validaciones.js) y añade
 * las que la pantalla de edición necesita: descripción, largo de la zona y publicar sin paquetes.
 */

import { aNumero } from "../../utils/validadores";
import { validarPaquete, validarSalon } from "../PublicarSalon/publicarSalon.validaciones";
import { LARGO_MAXIMO_ZONA } from "../../services/ubicacion.logica";
import { ESTADO_PUBLICADO } from "./misSalones.logica";

export { validarPaquete };

export const LARGO_MAXIMO_NOMBRE = 150;
export const LARGO_MAXIMO_DESCRIPCION = 1000;
export const CAPACIDAD_MAXIMA = 100000;

/**
 * Datos del salón en la pantalla de editar o crear.
 * Son las reglas de publicar más los límites que impone la base de datos.
 */
export function validarDatosSalon({ nombre, zona, capacidad, descripcion }) {
  const errores = validarSalon({ nombre, zona, capacidad });

  if (!errores.nombre && String(nombre).trim().length > LARGO_MAXIMO_NOMBRE) {
    errores.nombre = `El nombre no puede pasar de ${LARGO_MAXIMO_NOMBRE} caracteres.`;
  }

  if (!errores.zona && String(zona).trim().length > LARGO_MAXIMO_ZONA) {
    errores.zona = `La zona no puede pasar de ${LARGO_MAXIMO_ZONA} caracteres.`;
  }

  if (!errores.capacidad && aNumero(capacidad) > CAPACIDAD_MAXIMA) {
    errores.capacidad = `La capacidad no puede pasar de ${CAPACIDAD_MAXIMA.toLocaleString("es-MX")} personas.`;
  }

  if (descripcion && String(descripcion).trim().length > LARGO_MAXIMO_DESCRIPCION) {
    errores.descripcion = `La descripción no puede pasar de ${LARGO_MAXIMO_DESCRIPCION} caracteres.`;
  }

  return errores;
}

/**
 * Antes de guardar. Si el salón va a quedar publicado, la API exige al menos un paquete (2003):
 * se avisa aquí para no mandar una petición que ya sabemos que va a fallar.
 */
export function validarGuardado({ nombre, zona, capacidad, descripcion, estado, paquetes = [] }) {
  const errores = validarDatosSalon({ nombre, zona, capacidad, descripcion });

  if (estado === ESTADO_PUBLICADO && paquetes.length === 0) {
    errores.paquetes = "Agrega al menos un paquete para publicar tu salón.";
  }

  return errores;
}

/** Para el botón de publicar o pasar a borrador: ¿puede publicarse ya? */
export function puedePublicar({ paquetes = [] } = {}) {
  return paquetes.length > 0;
}

export function motivoNoPublicable({ paquetes = [] } = {}) {
  return paquetes.length === 0 ? "Agrega al menos un paquete para poder publicar este salón." : null;
}

/**
 * Quitar un paquete de un salón PUBLICADO cuando es el último: la API lo rechaza (3002).
 * En borrador sí se puede quedar sin paquetes.
 */
export function puedeQuitarPaquete({ estado, paquetes = [] }) {
  if (estado === ESTADO_PUBLICADO && paquetes.length <= 1) {
    return {
      permitido: false,
      motivo: "Un salón publicado necesita al menos un paquete. Pásalo a borrador o agrega otro paquete antes de quitar este.",
    };
  }
  return { permitido: true, motivo: null };
}
