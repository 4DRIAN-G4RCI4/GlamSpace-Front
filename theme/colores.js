/**
 * GlamSpaces · Paleta de colores compartida por todas las pantallas.
 *
 * Desde el Sprint 6 es la paleta del Figma "PROYECTO--PWA" (ver theme/disenoPwa.js). Los nombres
 * (morado, dorado, …) se conservan para no tocar cada pantalla; el valor de cada uno es el de Figma.
 */

import { MODO_OSCURO } from "./tema";

const CLARO = {
  morado: "#6b2942", // Tawny Port · acción principal
  moradoOscuro: "#2b1f24", // Thunder · títulos y fondos oscuros
  moradoClaro: "#fbf7f2", // White Linen · fondo de página
  dorado: "#c9a15a", // Sundance · precios y acentos (fondos, bordes y cifras grandes)
  doradoTexto: "#8a6508", // Sundance oscurecido: precios en texto chico con contraste AA (4.5:1)
  texto: "#2b1f24", // Thunder
  muted: "#7c6b70", // Spicy Pink
  error: "#a63446", // Stiletto
  ok: "#4c7a5d", // Como
  borde: "#e8dfd9", // Pearl Bush
  fondoInput: "#ffffff",
  placeholder: "#a9989d", // Dusty Gray
  esqueleto: "#d9c5a0", // Pavlova · espacio de la foto del salón y bloques de carga
  ocupadoFondo: "#f6dadd", // We Peep · fecha reservada en el calendario (HU-13)
  ocupadoTexto: "#a63446", // Stiletto
  // Estado de una solicitud (HU-16)
  pendienteFondo: "#fceed2", // Double Pearl Lusta
  pendienteTexto: "#8a6508", // Hot Toddy oscurecido para contraste AA en texto chico
  confirmadaFondo: "#dceee1", // Harp
  confirmadaTexto: "#446e53", // Como oscurecido para contraste AA en texto chico (4.8:1 sobre confirmadaFondo)
  rechazadaFondo: "#f6dadd", // We Peep
  rechazadaTexto: "#a63446", // Stiletto
  // Papeles que antes compartían valor con otro color (ver theme/tema.js): en claro valen lo mismo
  // que en el Figma; en oscuro cada uno toma el suyo.
  superficie: "#ffffff", // tarjetas, paneles y botones con fondo blanco
  sobreMorado: "#ffffff", // texto e íconos sobre un botón relleno de acento
  moradoActivo: "#2b1f24", // botón relleno de acento con el puntero encima
  errorActivo: "#8c2b3a", // botón de peligro con el puntero encima
  panelMarca: "#6b2942", // panel de la marca en login y registros
};

// Modo oscuro: fondo carbón, tarjetas un tono arriba y dorado champaña como acento (el vino
// sobre negro pierde contraste). El texto sobre el acento es oscuro.
const OSCURO = {
  morado: "#d4b06a",
  moradoOscuro: "#f1e9e4", // títulos
  moradoClaro: "#151012", // fondo de página
  dorado: "#d4b06a",
  doradoTexto: "#e3c27a",
  texto: "#f1e9e4",
  muted: "#b5a7ab",
  error: "#f08a9b",
  ok: "#8fc9a3",
  borde: "#3a3034",
  fondoInput: "#241d21",
  placeholder: "#857479",
  esqueleto: "#3a3034",
  ocupadoFondo: "#3d2026",
  ocupadoTexto: "#f08a9b",
  pendienteFondo: "#3d3220",
  pendienteTexto: "#e3c27a",
  confirmadaFondo: "#1f3327",
  confirmadaTexto: "#8fc9a3",
  rechazadaFondo: "#3d2026",
  rechazadaTexto: "#f08a9b",
  superficie: "#1f191c",
  sobreMorado: "#151012",
  moradoActivo: "#e6c88c",
  errorActivo: "#f4a5b2",
  panelMarca: "#0f0b0d",
};

export const COLORES = MODO_OSCURO ? OSCURO : CLARO;
