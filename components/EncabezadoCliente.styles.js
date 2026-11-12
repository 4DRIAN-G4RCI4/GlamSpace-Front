import { StyleSheet } from "react-native";
import { conFuentes, MEDIDA, PWA } from "../theme/disenoPwa";
import { ESPACIO, ANCHO_MAXIMO } from "../theme/espaciado";

// Misma barra que la búsqueda (Figma Cliente 02), con las migas de pan del detalle y la reserva.
export const estilos = StyleSheet.create(conFuentes({
  barra: { width: "100%", backgroundColor: PWA.superficie, borderBottomWidth: 0.8, borderBottomColor: PWA.borde, alignItems: "center" },
  contenido: {
    width: "100%",
    maxWidth: ANCHO_MAXIMO,
    paddingHorizontal: ESPACIO.lg,
    paddingVertical: ESPACIO.md + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ESPACIO.md,
  },
  izquierda: { flexDirection: "row", alignItems: "center", gap: ESPACIO.xl, flexShrink: 1, minWidth: 0 },
  acciones: { flexDirection: "row", alignItems: "center", gap: ESPACIO.sm + 2 },

  migas: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", flexShrink: 1, minWidth: 0 },
  miga: { flexDirection: "row", alignItems: "center", flexShrink: 1, minWidth: 0 },
  migaTexto: { fontSize: 12, color: PWA.textoSecundario },
  migaActual: { color: PWA.texto, fontWeight: "600" },
  migaSeparador: { fontSize: 12, color: PWA.textoTenue, marginHorizontal: ESPACIO.sm },
  migaFoco: { borderBottomWidth: 1, borderBottomColor: PWA.vino },
  renglonMigas: { width: "100%", maxWidth: ANCHO_MAXIMO, paddingHorizontal: ESPACIO.lg, paddingBottom: ESPACIO.sm + 2 },

  botonCuenta: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PWA.vino,
    borderRadius: MEDIDA.radioBoton,
    paddingHorizontal: ESPACIO.lg,
  },
  botonCuentaTexto: { color: PWA.vino, fontWeight: "600", fontSize: 13 },
  botonRegistro: { minHeight: 44, justifyContent: "center", backgroundColor: PWA.vino, borderRadius: MEDIDA.radioBoton, paddingHorizontal: ESPACIO.lg },
  botonRegistroTexto: { color: PWA.fondo, fontWeight: "600", fontSize: 13 },
  foco: { opacity: 0.85, outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.vino, outlineOffset: 2 },
}));
