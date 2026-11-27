// GlamSpaces · Aplica el modo oscuro y el zoom guardados antes del primer pintado (sin destello).
// Las mismas llaves las usa theme/tema.js al cambiarlos en el Perfil.
try {
  if (localStorage.getItem("glamspaces_tema") === "oscuro") document.documentElement.dataset.tema = "oscuro";
  var zoom = localStorage.getItem("glamspaces_zoom");
  if (["0.9", "1.1", "1.25"].indexOf(zoom) >= 0) document.documentElement.style.zoom = zoom;
} catch (e) {
  // Sin almacenamiento (modo privado): se queda en claro.
}
