/**
 * GlamSpaces · Modo oscuro de toda la app (web / PWA).
 *
 * La preferencia se guarda en el dispositivo (localStorage). Se lee UNA vez al cargar la app, antes
 * de crear los estilos: theme/colores.js y theme/disenoPwa.js eligen con MODO_OSCURO la paleta clara
 * (la del Figma) o la oscura (carbón con dorado champaña de acento). Por eso al cambiar el
 * interruptor del Perfil se guarda y la página se recarga.
 *
 * public/tema.js pone data-tema="oscuro" en <html> antes del primer pintado para que el fondo de
 * la página (index.html) ya salga oscuro y no haya destello claro.
 *
 * En Android/iOS nativo siempre es claro (la app se usa como PWA).
 */

export const LLAVE_TEMA = "glamspaces_tema";

function leerPreferencia() {
  try {
    return typeof window !== "undefined" && !!window.localStorage && window.localStorage.getItem(LLAVE_TEMA) === "oscuro";
  } catch (e) {
    return false; // sin almacenamiento (modo privado): claro
  }
}

/** Tema con el que arrancó la app (no cambia sin recargar). */
export const MODO_OSCURO = leerPreferencia();

/** De una paleta { nombre: [claro, oscuro] } regresa { nombre: color } del tema actual. */
export function elegirTema(paleta) {
  return Object.fromEntries(Object.entries(paleta).map(([nombre, [claro, oscuro]]) => [nombre, MODO_OSCURO ? oscuro : claro]));
}

/** ¿Está activo el modo oscuro? */
export function esModoOscuro() {
  return MODO_OSCURO;
}

/** Guarda el tema en este dispositivo y recarga para pintar toda la app con la otra paleta. */
export function cambiarModoOscuro(oscuro) {
  try {
    if (oscuro) window.localStorage.setItem(LLAVE_TEMA, "oscuro");
    else window.localStorage.removeItem(LLAVE_TEMA);
  } catch (e) {
    return; // sin almacenamiento no se puede recordar: se queda como está
  }
  window.location.reload();
}
