/**
 * GlamSpaces · Paleta de colores compartida por todas las pantallas.
 *
 * Desde el Sprint 6 es la paleta del Figma "PROYECTO--PWA" (ver theme/disenoPwa.js). Los nombres
 * (morado, dorado, …) se conservan para no tocar cada pantalla; el valor de cada uno es el de Figma.
 */

import { elegirTema } from "./tema";

// Cada color es [claro, oscuro]. Claro = Figma "PROYECTO--PWA"; oscuro = fondo carbón, tarjetas un
// tono arriba y dorado champaña de acento (el vino sobre negro pierde contraste), con texto oscuro
// sobre el acento. theme/tema.js decide cuál se usa al arrancar.
const PALETA = {
  morado: ["#6b2942", "#d4b06a"], // Tawny Port · acción principal
  moradoOscuro: ["#2b1f24", "#f1e9e4"], // Thunder · títulos y fondos oscuros
  moradoClaro: ["#fbf7f2", "#151012"], // White Linen · fondo de página
  dorado: ["#c9a15a", "#d4b06a"], // Sundance · precios y acentos (fondos, bordes y cifras grandes)
  doradoTexto: ["#8a6508", "#e3c27a"], // Sundance oscurecido: precios en texto chico con contraste AA (4.5:1)
  texto: ["#2b1f24", "#f1e9e4"], // Thunder
  muted: ["#7c6b70", "#b5a7ab"], // Spicy Pink
  error: ["#a63446", "#f08a9b"], // Stiletto
  ok: ["#4c7a5d", "#8fc9a3"], // Como
  borde: ["#e8dfd9", "#3a3034"], // Pearl Bush
  fondoInput: ["#ffffff", "#241d21"],
  placeholder: ["#a9989d", "#857479"], // Dusty Gray
  esqueleto: ["#d9c5a0", "#3a3034"], // Pavlova · espacio de la foto del salón y bloques de carga
  ocupadoFondo: ["#f6dadd", "#3d2026"], // We Peep · fecha reservada en el calendario (HU-13)
  ocupadoTexto: ["#a63446", "#f08a9b"], // Stiletto
  // Estado de una solicitud (HU-16)
  pendienteFondo: ["#fceed2", "#3d3220"], // Double Pearl Lusta
  pendienteTexto: ["#8a6508", "#e3c27a"], // Hot Toddy oscurecido para contraste AA en texto chico
  confirmadaFondo: ["#dceee1", "#1f3327"], // Harp
  confirmadaTexto: ["#446e53", "#8fc9a3"], // Como oscurecido para contraste AA en texto chico (4.8:1 sobre confirmadaFondo)
  rechazadaFondo: ["#f6dadd", "#3d2026"], // We Peep
  rechazadaTexto: ["#a63446", "#f08a9b"], // Stiletto
  // Papeles que antes compartían valor con otro color (ver theme/tema.js): en claro valen lo mismo
  // que en el Figma; en oscuro cada uno toma el suyo.
  superficie: ["#ffffff", "#1f191c"], // tarjetas, paneles y botones con fondo blanco
  sobreMorado: ["#ffffff", "#151012"], // texto e íconos sobre un botón relleno de acento
  moradoActivo: ["#2b1f24", "#e6c88c"], // botón relleno de acento con el puntero encima
  errorActivo: ["#8c2b3a", "#f4a5b2"], // botón de peligro con el puntero encima
  panelMarca: ["#6b2942", "#0f0b0d"], // panel de la marca en login y registros
};

export const COLORES = elegirTema(PALETA);
