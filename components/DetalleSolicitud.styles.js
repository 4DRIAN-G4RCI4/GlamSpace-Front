/**
 * GlamSpaces · Estilos del detalle de una solicitud (Figma PROYECTO--PWA, Admin 03): encabezado con
 * "Solicitud #N" y estado; tarjetas blancas (Detalle del evento, Comentarios, Datos del cliente) y
 * la tarjeta del salón con su galería.
 */

import { StyleSheet } from "react-native";
import { FUENTE, MEDIDA, PWA } from "../theme/disenoPwa";

const texto = (tamano, peso = "400", color = PWA.texto) => ({ fontFamily: FUENTE.texto, fontSize: tamano, fontWeight: peso, color });
const titulo = (tamano, peso = "700", color = PWA.texto) => ({ fontFamily: FUENTE.titulo, fontSize: tamano, fontWeight: peso, color });

export const estilos = StyleSheet.create({
  contenedor: { gap: 20 },
  encabezado: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 },
  volver: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PWA.borde,
    backgroundColor: PWA.superficie,
    alignItems: "center",
    justifyContent: "center",
  },
  volverTexto: texto(18, "600", PWA.texto),
  titulo: { ...titulo(24), flexShrink: 1 },
  tituloNumero: titulo(24, "400", PWA.textoSecundario),
  estado: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, marginLeft: "auto" },
  recibida: texto(12.5, "400", PWA.textoSecundario),

  columnas: { flexDirection: "row", alignItems: "flex-start", gap: 24 },
  columnaPrincipal: { flex: 1.6, gap: 16, minWidth: 0 },
  columnaLateral: { flex: 1, gap: 16, minWidth: 0 },
  apilado: { gap: 16 },

  tarjeta: { backgroundColor: PWA.superficie, borderWidth: 1, borderColor: PWA.borde, borderRadius: MEDIDA.radioTarjeta, padding: 20, gap: 14 },
  tarjetaTitulo: titulo(16),
  rejilla: { flexDirection: "row", flexWrap: "wrap", rowGap: 14 },
  dato: { width: "50%", paddingRight: 12, gap: 3 },
  datoMovil: { width: "100%", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  datoEtiqueta: texto(12.5, "400", PWA.textoSecundario),
  datoValor: texto(13.5, "600", PWA.texto),
  datoValorMovil: { ...texto(13.5, "600", PWA.texto), textAlign: "right", flexShrink: 1 },
  parrafo: { ...texto(13.5, "400", PWA.texto), lineHeight: 20 },
  parrafoTenue: { ...texto(13.5, "400", PWA.textoSecundario), lineHeight: 20 },
  filaCliente: { flexDirection: "row", alignItems: "center", gap: 10 },
  icono: texto(14, "400", PWA.vino),

  salonNombre: titulo(18),
  salonZona: texto(13, "400", PWA.textoSecundario),
  chip: { alignSelf: "flex-start", backgroundColor: PWA.pendienteFondo, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  chipTexto: texto(12, "600", PWA.texto),
  verSalon: {
    minHeight: 44,
    borderRadius: MEDIDA.radioBoton,
    borderWidth: 1,
    borderColor: PWA.vino,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  verSalonTexto: texto(13.5, "600", PWA.vino),
  cargando: texto(13, "400", PWA.textoSecundario),
  error: texto(13, "600", PWA.peligro),
  reintentar: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 16, borderRadius: MEDIDA.radioBoton, borderWidth: 1, borderColor: PWA.borde },
  reintentarTexto: texto(13, "600", PWA.textoSecundario),

  foco: { outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.vino, outlineOffset: 2 },
  hover: { opacity: 0.85 },
});
