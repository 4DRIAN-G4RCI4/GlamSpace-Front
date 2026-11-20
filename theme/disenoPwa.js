/**
 * GlamSpaces · Tokens del diseño "PROYECTO--PWA" de Figma (pantallas de administrador).
 *
 * Los nombres entre paréntesis son los estilos del archivo de Figma. Las pantallas
 * que siguen ese diseño (por ahora el panel de administrador, HU-19) usan SOLO estos
 * valores en lugar de números o colores sueltos.
 */

import { MODO_OSCURO } from "./tema";

const CLARO = {
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
  // Papeles que antes compartían valor con otro color (ver theme/tema.js).
  lateral: "#2b1f24", // fondo de la barra lateral, el encabezado móvil del admin, el globo y la tarjeta del perfil
  sobreOscuro: "#fbf7f2", // texto sobre ese fondo oscuro
  sobreVino: "#fbf7f2", // texto sobre un relleno de acento
  inicialesSobreVino: "#f3e4c8", // iniciales del avatar sobre el acento
  chip: "#f3e4c8", // fondo de chips y del espacio de las fotos
};

// Modo oscuro (mismos tonos que COLORES en theme/colores.js).
const OSCURO = {
  fondo: "#151012",
  superficie: "#1f191c",
  oscuro: "#f1e9e4", // títulos y contornos de foco
  vino: "#d4b06a", // acento: dorado champaña
  crema: "#f3e4c8",
  texto: "#f1e9e4",
  textoSecundario: "#b5a7ab",
  textoTenue: "#857479",
  navInactivo: "#b5a7ab",
  borde: "#3a3034",
  bordeOscuro: "rgba(255,255,255,0.08)",
  peligro: "#e8899a",
  pendienteFondo: "#3d3220",
  pendienteTexto: "#e3c27a",
  confirmadaFondo: "#1f3327",
  confirmadaTexto: "#8fc9a3",
  rechazadaFondo: "#3d2026",
  sombra: "rgba(0,0,0,0.35)",
  lateral: "#0f0b0d",
  sobreOscuro: "#f1e9e4",
  sobreVino: "#151012",
  inicialesSobreVino: "#151012",
  chip: "#3a3024",
};

export const PWA = MODO_OSCURO ? OSCURO : CLARO;

// Playfair Display para títulos y cifras; Inter para todo lo demás.
export const FUENTE = {
  titulo: "Playfair Display",
  texto: "Inter",
};

// Pone la fuente del diseño a cada estilo con texto que no la tenga: Playfair a los títulos (las
// claves de `titulos`, o texto de 20 px o más en negritas) e Inter al resto.
// Uso: StyleSheet.create(conFuentes({ ... }, ["titulo"]))
export function conFuentes(estilos, titulos = []) {
  const resultado = {};
  for (const [clave, estilo] of Object.entries(estilos)) {
    const conTexto = estilo && typeof estilo === "object" && estilo.fontSize !== undefined && !estilo.fontFamily;
    if (!conTexto) {
      resultado[clave] = estilo;
      continue;
    }
    const esTitulo = titulos.includes(clave) || (estilo.fontSize >= 20 && Number(estilo.fontWeight) >= 700);
    resultado[clave] = { ...estilo, fontFamily: esTitulo ? FUENTE.titulo : FUENTE.texto };
  }
  return resultado;
}

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
