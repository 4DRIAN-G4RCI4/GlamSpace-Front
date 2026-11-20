// GlamSpaces · Aplica el modo oscuro guardado antes del primer pintado (sin destello claro).
// La misma llave la usa theme/tema.js al cambiar el interruptor del Perfil.
try {
  if (localStorage.getItem("glamspaces_tema") === "oscuro") document.documentElement.dataset.tema = "oscuro";
} catch (e) {
  // Sin almacenamiento (modo privado): se queda en claro.
}
