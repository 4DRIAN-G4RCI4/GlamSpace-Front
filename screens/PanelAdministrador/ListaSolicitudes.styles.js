/**
 * GlamSpaces · Estilos de la lista de solicitudes del admin (Figma PROYECTO--PWA, Admin 02):
 * chips de filtro, tarjetas blancas con borde y la etiqueta de estado a la derecha.
 */

import { StyleSheet } from "react-native";
import { FUENTE, MEDIDA, PWA } from "../../theme/disenoPwa";

const texto = (tamano, peso = "400", color = PWA.texto) => ({ fontFamily: FUENTE.texto, fontSize: tamano, fontWeight: peso, color });

export const estilos = StyleSheet.create({
  seccion: { gap: 14 },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  titulo: { fontFamily: FUENTE.titulo, fontSize: 18, fontWeight: "700", color: PWA.texto },
  controles: { gap: 10 },
  grupo: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  grupoMovil: { flexDirection: "row", alignItems: "center", gap: 8 },
  grupoEtiqueta: texto(12.5, "600", PWA.textoSecundario),
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

  rejilla: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  tarjeta: {
    backgroundColor: PWA.superficie,
    borderWidth: 1,
    borderColor: PWA.borde,
    borderRadius: MEDIDA.radioTarjeta,
    padding: 18,
    gap: 6,
    minHeight: 44,
  },
  tarjetaPendiente: { borderLeftWidth: 4, borderLeftColor: PWA.pendienteTexto },
  filaArriba: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  cliente: { fontFamily: FUENTE.titulo, fontSize: 16, fontWeight: "700", color: PWA.texto, flexShrink: 1 },
  fecha: texto(13.5, "600", PWA.texto),
  detalle: texto(13, "400", PWA.textoSecundario),
  salon: texto(12.5, "400", PWA.textoSecundario),
  verDetalle: { ...texto(13, "600", PWA.vino), alignSelf: "flex-end", marginTop: 4 },

  vacio: { backgroundColor: PWA.superficie, borderWidth: 1, borderColor: PWA.borde, borderRadius: MEDIDA.radioTarjeta, padding: 24, alignItems: "center", gap: 8 },
  vacioTitulo: { fontFamily: FUENTE.titulo, fontSize: 15, fontWeight: "700", color: PWA.texto },
  vacioTexto: { ...texto(13), color: PWA.textoSecundario, textAlign: "center" },
  boton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    borderRadius: MEDIDA.radioBoton,
    borderWidth: 1,
    borderColor: PWA.vino,
    backgroundColor: PWA.superficie,
  },
  botonTexto: texto(13.5, "600", PWA.vino),
  contador: texto(12.5, "400", PWA.textoSecundario),

  foco: { outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.vino, outlineOffset: 2 },
  hover: { borderColor: PWA.vino },
});
