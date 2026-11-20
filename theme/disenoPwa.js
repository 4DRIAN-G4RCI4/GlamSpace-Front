/**
 * GlamSpaces · Tokens del diseño "PROYECTO--PWA" de Figma (pantallas de administrador).
 *
 * Los nombres entre paréntesis son los estilos del archivo de Figma. Las pantallas
 * que siguen ese diseño (por ahora el panel de administrador, HU-19) usan SOLO estos
 * valores en lugar de números o colores sueltos.
 */

import { elegirTema } from "./tema";

// Cada color es [claro, oscuro]. Claro = Figma "PROYECTO--PWA"; oscuro = fondo carbón, tarjetas un
// tono arriba y dorado champaña de acento (el vino sobre negro pierde contraste), con texto oscuro
// sobre el acento. theme/tema.js decide cuál se usa al arrancar.
const PALETA = {
  fondo: ["#fbf7f2", "#151012"], // White Linen
  superficie: ["#ffffff", "#1f191c"], // White
  oscuro: ["#2b1f24", "#f1e9e4"], // Thunder · barra lateral y títulos
  vino: ["#6b2942", "#d4b06a"], // Tawny Port · acción principal y elemento activo
  crema: ["#f3e4c8", "#f3e4c8"], // Albescent White · logo e iniciales sobre fondo oscuro
  texto: ["#2b1f24", "#f1e9e4"], // Thunder
  textoSecundario: ["#7c6b70", "#b5a7ab"], // Spicy Pink
  textoTenue: ["#a9989d", "#857479"], // Dusty Gray
  navInactivo: ["#c7b9bc", "#b5a7ab"], // Pink Swan · enlaces de la barra lateral
  borde: ["#e8dfd9", "#3a3034"], // Pearl Bush
  bordeOscuro: ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.08)"], // White 8% · separador en la barra lateral
  peligro: ["#a63446", "#e8899a"], // Stiletto · rechazar y fecha reservada
  pendienteFondo: ["#fceed2", "#3d3220"], // Double Pearl Lusta
  pendienteTexto: ["#b8860b", "#e3c27a"], // Hot Toddy · también el borde de "solicitud pendiente"
  confirmadaFondo: ["#dceee1", "#1f3327"], // Harp
  confirmadaTexto: ["#4c7a5d", "#8fc9a3"], // Como
  rechazadaFondo: ["#f6dadd", "#3d2026"], // We Peep · etiqueta "Rechazada"
  sombra: ["rgba(43,31,36,0.05)", "rgba(0,0,0,0.35)"],
  // Papeles que antes compartían valor con otro color (ver theme/tema.js).
  lateral: ["#2b1f24", "#0f0b0d"], // fondo de la barra lateral, el encabezado móvil del admin, el globo y la tarjeta del perfil
  sobreOscuro: ["#fbf7f2", "#f1e9e4"], // texto sobre ese fondo oscuro
  sobreVino: ["#fbf7f2", "#151012"], // texto sobre un relleno de acento
  inicialesSobreVino: ["#f3e4c8", "#151012"], // iniciales del avatar sobre el acento
  chip: ["#f3e4c8", "#3a3024"], // fondo de chips y del espacio de las fotos
};

export const PWA = elegirTema(PALETA);

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
