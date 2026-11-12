/**
 * GlamSpaces · HU-07 (fotos) · Estilos de "Fotos del salón" (Figma PROYECTO--PWA, Admin 05).
 * Escritorio: mosaicos de 165 × 165 y un mosaico "+" punteado. Móvil: 2 por fila (162 × 140) y
 * un botón "+ Agregar foto" punteado a lo ancho (46 px).
 */

import { StyleSheet } from "react-native";
import { FUENTE, MEDIDA, PWA } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";

const texto = (tamano, peso = "400", color = PWA.texto) => ({ fontFamily: FUENTE.texto, fontSize: tamano, fontWeight: peso, color });

export const estilos = StyleSheet.create({
  seccion: { gap: 12, marginBottom: 20 },
  titulo: { fontFamily: FUENTE.titulo, fontSize: 16, fontWeight: "700", color: PWA.texto },
  ayuda: texto(12.5, "400", PWA.textoSecundario),
  contador: texto(12.5, "600", PWA.textoSecundario),

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipsMovil: { flexDirection: "row", gap: 8 }, // en móvil, una fila con scroll horizontal (como el panel)
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PWA.borde,
    backgroundColor: PWA.superficie,
  },
  chipActivo: { backgroundColor: PWA.vino, borderColor: PWA.vino },
  chipTexto: texto(13, "600", PWA.textoSecundario),
  chipTextoActivo: texto(13, "600", PWA.fondo),

  rejilla: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  rejillaMovil: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },

  mosaico: { width: 165, gap: 6 }, // el ancho real se calcula con el ancho de la columna (2 a 4 por fila)
  mosaicoMovil: { width: "48.5%", gap: 6 },
  marco: { width: "100%", aspectRatio: 1, borderRadius: 12, overflow: "hidden", backgroundColor: COLORES.esqueleto },
  marcoMovil: { aspectRatio: 162 / 140 },
  imagen: { width: "100%", height: "100%" },

  // Franja de estado sobre la foto (texto blanco sobre oscuro: contraste AA)
  franja: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    backgroundColor: "rgba(43,31,36,0.82)",
  },
  franjaTexto: texto(11.5, "600", PWA.superficie),
  barra: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" },
  barraLlena: { height: 4, backgroundColor: PWA.crema },

  acciones: { flexDirection: "row", gap: 6 },
  boton: {
    flex: 1,
    minHeight: 44,
    borderRadius: MEDIDA.radioBoton,
    borderWidth: 1,
    borderColor: PWA.borde,
    backgroundColor: PWA.superficie,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  botonTexto: texto(12.5, "600", PWA.textoSecundario),
  botonPeligro: { borderColor: PWA.peligro },
  botonPeligroTexto: texto(12.5, "600", PWA.peligro),
  botonPeligroLleno: { backgroundColor: PWA.peligro, borderColor: PWA.peligro },
  botonPeligroLlenoTexto: texto(12.5, "600", PWA.superficie),
  botonPrincipal: { backgroundColor: PWA.vino, borderColor: PWA.vino },
  botonPrincipalTexto: texto(12.5, "600", PWA.fondo),
  deshabilitado: { opacity: 0.5 },
  foco: { outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.oscuro, outlineOffset: 2 },
  confirmarTexto: texto(12, "600", PWA.texto),
  errorFoto: texto(11.5, "600", PWA.peligro),

  // Agregar: mosaico punteado (escritorio) o botón punteado a lo ancho (móvil). Borde y "+" en el
  // dorado de la maqueta; el texto en el dorado oscurecido del tema para contraste AA.
  agregarMosaico: {
    width: 165,
    aspectRatio: 1,
    alignSelf: "flex-start", // cuadrado aunque las fotos de su fila lleven botones abajo
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORES.dorado,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  agregarBoton: {
    width: "100%",
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORES.dorado,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  agregarMas: { fontSize: 22, lineHeight: 24, color: COLORES.dorado, fontFamily: FUENTE.texto },
  agregarTexto: texto(13.5, "600", COLORES.pendienteTexto),

  aviso: { ...texto(12.5, "600", PWA.peligro) },
  cargando: texto(12.5, "400", PWA.textoSecundario),
});
