/**
 * GlamSpaces · Modo oscuro de toda la app (web / PWA).
 *
 * La preferencia se guarda en el dispositivo (localStorage, misma llave que lee public/index.html
 * antes del primer pintado, así no hay destello claro al abrir). El modo oscuro es un filtro CSS
 * sobre <html> (data-tema="oscuro"): invierte los colores claros y las fotos se vuelven a invertir
 * para que se vean normales. Las reglas viven en public/index.html.
 *
 * En Android/iOS nativo no hace nada (la app se usa como PWA).
 */

export const LLAVE_TEMA = "glamspaces_tema";

const raiz = () => (typeof document === "undefined" ? null : document.documentElement);

/** ¿Está activo el modo oscuro? */
export function esModoOscuro() {
  const html = raiz();
  return !!html && html.dataset.tema === "oscuro";
}

/** Activa o quita el modo oscuro y lo recuerda en este dispositivo. */
export function cambiarModoOscuro(oscuro) {
  const html = raiz();
  if (!html) return;
  if (oscuro) html.dataset.tema = "oscuro";
  else delete html.dataset.tema;
  try {
    if (oscuro) window.localStorage.setItem(LLAVE_TEMA, "oscuro");
    else window.localStorage.removeItem(LLAVE_TEMA);
  } catch (e) {
    // Sin almacenamiento (modo privado): el tema dura solo esta visita.
  }
}
