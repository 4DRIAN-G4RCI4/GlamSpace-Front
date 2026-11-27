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
 *
 * Personalizar (Perfil): tamaño de letra y zoom de pantalla, guardados igual que el tema.
 *  - Letra: theme/escalaTexto.js multiplica fontSize y lineHeight de todos los StyleSheet.create.
 *  - Zoom: public/tema.js pone `zoom` en <html> antes del primer pintado.
 */

export const LLAVE_TEMA = "glamspaces_tema";
export const LLAVE_TEXTO = "glamspaces_texto";
export const LLAVE_ZOOM = "glamspaces_zoom";

export const OPCIONES_TEXTO = [
  { valor: 0.9, etiqueta: "Chica" },
  { valor: 1, etiqueta: "Normal" },
  { valor: 1.15, etiqueta: "Grande" },
  { valor: 1.3, etiqueta: "Muy grande" },
];
export const OPCIONES_ZOOM = [
  { valor: 0.9, etiqueta: "90%" },
  { valor: 1, etiqueta: "100%" },
  { valor: 1.1, etiqueta: "110%" },
  { valor: 1.25, etiqueta: "125%" },
];

function leer(llave) {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(llave) : null;
  } catch (e) {
    return null; // sin almacenamiento (modo privado): valores por omisión
  }
}

/** Valor guardado si es una de las opciones; si no, 1 (normal). */
function leerEscala(llave, opciones) {
  const guardado = Number(leer(llave));
  return opciones.some((o) => o.valor === guardado) ? guardado : 1;
}

/** Tema con el que arrancó la app (no cambia sin recargar). */
export const MODO_OSCURO = leer(LLAVE_TEMA) === "oscuro";
/** Escala del texto y zoom con los que arrancó la app. */
export const ESCALA_TEXTO = leerEscala(LLAVE_TEXTO, OPCIONES_TEXTO);
export const ZOOM = leerEscala(LLAVE_ZOOM, OPCIONES_ZOOM);

/** De una paleta { nombre: [claro, oscuro] } regresa { nombre: color } del tema actual. */
export function elegirTema(paleta) {
  return Object.fromEntries(Object.entries(paleta).map(([nombre, [claro, oscuro]]) => [nombre, MODO_OSCURO ? oscuro : claro]));
}

/** ¿Está activo el modo oscuro? */
export function esModoOscuro() {
  return MODO_OSCURO;
}

/** Guarda una preferencia (null la borra) y recarga para pintar toda la app con ella. */
function guardarYRecargar(llave, valor) {
  try {
    if (valor === null) window.localStorage.removeItem(llave);
    else window.localStorage.setItem(llave, String(valor));
  } catch (e) {
    return; // sin almacenamiento no se puede recordar: se queda como está
  }
  window.location.reload();
}

/** Guarda el tema en este dispositivo y recarga para pintar toda la app con la otra paleta. */
export function cambiarModoOscuro(oscuro) {
  guardarYRecargar(LLAVE_TEMA, oscuro ? "oscuro" : null);
}

export function cambiarEscalaTexto(valor) {
  guardarYRecargar(LLAVE_TEXTO, valor === 1 ? null : valor);
}

export function cambiarZoom(valor) {
  guardarYRecargar(LLAVE_ZOOM, valor === 1 ? null : valor);
}

/** Multiplica fontSize y lineHeight numéricos de un objeto de estilos de StyleSheet.create. */
export function escalarTexto(estilos, escala) {
  const escalarEstilo = (e) => {
    if (!e || typeof e !== "object") return e;
    const copia = { ...e };
    for (const campo of ["fontSize", "lineHeight"]) {
      if (typeof copia[campo] === "number") copia[campo] = Math.round(copia[campo] * escala * 10) / 10;
    }
    return copia;
  };
  return Object.fromEntries(Object.entries(estilos).map(([nombre, e]) => [nombre, escalarEstilo(e)]));
}
