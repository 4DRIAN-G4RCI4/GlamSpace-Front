/**
 * GlamSpaces · Tokens del diseño "PROYECTO--PWA" de Figma (pantallas de administrador).
 *
 * Los nombres entre paréntesis son los estilos del archivo de Figma. Las pantallas
 * que siguen ese diseño (por ahora el panel de administrador, HU-19) usan SOLO estos
 * valores en lugar de números o colores sueltos.
 */

export const PWA = {
  fondo: "#fbf7f2", // White Linen
  superficie: "#ffffff", // White
  oscuro: "#2b1f24", // Thunder · barra lateral y títulos
  vino: "#6b2942", // Tawny Port · acción principal y elemento activo
  crema: "#f3e4c8", // Albescent White · logo e iniciales sobre fondo oscuro
  texto: "#2b1f24", // Thunder
  textoSecundario: "#7c6b70", // Spicy Pink
  textoTenue: "#a9989d", // Dusty Gray
  navInactivo: "#c7b9bc", // Pink Swan · enlaces de la barra lateral
  borde: "#e8dfd9", // Pearl Bush
  bordeOscuro: "rgba(255,255,255,0.08)", // White 8% · separador en la barra lateral
  peligro: "#a63446", // Stiletto · rechazar y fecha reservada
  pendienteFondo: "#fceed2", // Double Pearl Lusta
  pendienteTexto: "#b8860b", // Hot Toddy · también el borde de "solicitud pendiente"
  confirmadaFondo: "#dceee1", // Harp
  confirmadaTexto: "#4c7a5d", // Como
  rechazadaFondo: "#f6dadd", // We Peep · etiqueta "Rechazada"
  sombra: "rgba(43,31,36,0.05)",
};

// Playfair Display para títulos y cifras; Inter para todo lo demás.
export const FUENTE = {
  titulo: "Playfair Display",
  texto: "Inter",
};

// Medidas del diseño de escritorio (1440 px) y del móvil (390 px).
export const MEDIDA = {
  barraLateral: 260,
  radioTarjeta: 16,
  radioBoton: 9,
  radioBotonMovil: 11,
  radioEtiqueta: 10,
  altoBoton: 38,
  altoBotonMovil: 46,
  corteEscritorio: 1024,
};
