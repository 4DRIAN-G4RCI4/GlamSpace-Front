import { StyleSheet } from "react-native";
import { conFuentes } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import { ESPACIO, RADIO } from "../../theme/espaciado";

// "Mis salones" y "Editar salón" con la paleta y el layout del Figma PROYECTO--PWA (Admin 05).
export const estilos = StyleSheet.create(conFuentes({
  // ---------- Página ----------
  contenido: { padding: ESPACIO.xl, paddingBottom: 48 },
  contenidoMovil: { padding: ESPACIO.lg, paddingBottom: 72 },

  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: ESPACIO.md,
    marginBottom: ESPACIO.xs,
  },
  titulo: { fontSize: 24, fontWeight: "700", color: COLORES.texto },
  subtitulo: { fontSize: 14, color: COLORES.muted, marginBottom: ESPACIO.xl },

  // ---------- Rejilla de fichas ----------
  rejilla: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.lg },
  ficha: {
    backgroundColor: "#fff",
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  fichaFoto: { width: "100%", height: 150, backgroundColor: COLORES.esqueleto },
  fichaSinFoto: {
    width: "100%",
    height: 150,
    backgroundColor: COLORES.esqueleto,
    alignItems: "center",
    justifyContent: "center",
  },
  fichaSinFotoTexto: { fontSize: 12, color: COLORES.moradoOscuro, opacity: 0.75 },
  fichaCuerpo: { padding: ESPACIO.lg, gap: ESPACIO.xs },
  fichaTituloFila: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: ESPACIO.sm,
  },
  fichaNombre: { fontSize: 16, fontWeight: "700", color: COLORES.texto, flexShrink: 1 },
  fichaZona: { fontSize: 13, color: COLORES.muted },
  fichaResumen: { fontSize: 12.5, color: COLORES.muted, marginTop: ESPACIO.xs },

  etiqueta: {
    paddingHorizontal: ESPACIO.sm,
    paddingVertical: 3,
    borderRadius: RADIO.pill,
    alignSelf: "flex-start",
  },
  etiquetaPublicado: { backgroundColor: COLORES.confirmadaFondo },
  etiquetaBorrador: { backgroundColor: COLORES.pendienteFondo },
  etiquetaTexto: { fontSize: 11.5, fontWeight: "700" },
  etiquetaTextoPublicado: { color: COLORES.confirmadaTexto },
  etiquetaTextoBorrador: { color: COLORES.pendienteTexto },

  fichaBotones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACIO.sm,
    marginTop: ESPACIO.md,
    paddingTop: ESPACIO.md,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },

  // ---------- Botones ----------
  boton: {
    minHeight: 44,
    paddingHorizontal: ESPACIO.lg,
    borderRadius: RADIO.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  botonChico: { minHeight: 44, paddingHorizontal: ESPACIO.md, flexGrow: 1, flexBasis: 90 },
  botonPrincipal: { backgroundColor: COLORES.morado },
  botonPrincipalTexto: { fontSize: 14, fontWeight: "700", color: "#fff" },
  botonSecundario: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLORES.borde },
  botonSecundarioTexto: { fontSize: 13.5, fontWeight: "600", color: COLORES.texto },
  botonPeligroTexto: { fontSize: 13.5, fontWeight: "600", color: COLORES.error },
  botonInactivo: { opacity: 0.5 },
  foco: { outlineWidth: 2, outlineColor: COLORES.dorado, outlineStyle: "solid", outlineOffset: 2 },

  // ---------- Estado vacío ----------
  vacio: {
    backgroundColor: "#fff",
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderStyle: "dashed",
    padding: ESPACIO.xxl,
    alignItems: "center",
    gap: ESPACIO.md,
  },
  vacioTitulo: { fontSize: 18, fontWeight: "700", color: COLORES.texto, textAlign: "center" },
  vacioTexto: { fontSize: 14, color: COLORES.muted, textAlign: "center", maxWidth: 420 },

  // ---------- Avisos ----------
  mensaje: {
    padding: ESPACIO.md,
    borderRadius: RADIO.sm,
    marginBottom: ESPACIO.lg,
    fontSize: 13.5,
  },
  mensajeOk: { backgroundColor: COLORES.confirmadaFondo, color: COLORES.confirmadaTexto },
  mensajeFail: { backgroundColor: COLORES.rechazadaFondo, color: COLORES.rechazadaTexto },
  cargandoCaja: { padding: 48, alignItems: "center" },

  // ---------- Editar salón ----------
  // Dos columnas como en la maqueta (Admin 05). flexShrink deja que la de paquetes se
  // encoja en pantallas justas en vez de salirse del ancho.
  columnas: { flexDirection: "row", gap: ESPACIO.xl, alignItems: "flex-start" },
  columnaDatos: { flex: 1, minWidth: 0 },
  columnaPaquetes: { flexGrow: 0, flexShrink: 1, flexBasis: 360, minWidth: 280 },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIO.xl,
    marginBottom: ESPACIO.lg,
  },
  seccion: { fontSize: 15.5, fontWeight: "700", color: COLORES.texto, marginBottom: ESPACIO.md },
  seccionFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: ESPACIO.md,
  },

  // Paquetes existentes
  paquete: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIO.md,
    padding: ESPACIO.lg,
    marginBottom: ESPACIO.md,
    gap: ESPACIO.xs,
  },
  paqueteCabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ESPACIO.sm,
  },
  paqueteNombre: { fontSize: 14, fontWeight: "600", color: COLORES.texto, flexShrink: 1 },
  paquetePrecio: { fontSize: 14, fontWeight: "700", color: COLORES.doradoTexto },
  paqueteDetalle: { fontSize: 12.5, color: COLORES.muted },
  bloqueNuevoPaquete: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORES.dorado,
    borderRadius: RADIO.md,
    padding: ESPACIO.lg,
    marginTop: ESPACIO.sm,
  },
  errorSeccion: { fontSize: 12.5, color: COLORES.error, marginBottom: ESPACIO.sm },

  // Zona de peligro
  zonaPeligro: {
    borderWidth: 1,
    borderColor: COLORES.rechazadaFondo,
    backgroundColor: COLORES.rechazadaFondo,
    borderRadius: RADIO.md,
    padding: ESPACIO.lg,
    marginTop: ESPACIO.lg,
    gap: ESPACIO.sm,
  },
  zonaPeligroTitulo: { fontSize: 14, fontWeight: "700", color: COLORES.rechazadaTexto },
  zonaPeligroTexto: { fontSize: 12.5, color: COLORES.rechazadaTexto },
  botonEliminar: {
    minHeight: 44,
    paddingHorizontal: ESPACIO.lg,
    borderRadius: RADIO.sm,
    borderWidth: 1,
    borderColor: COLORES.error,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  // Barra de acciones de la pantalla de editar
  barraAcciones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACIO.md,
    alignItems: "center",
  },

  // ---------- Autocompletado de ubicación ----------
  ubicacionCaja: { position: "relative", zIndex: 10 },
  sugerencias: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIO.sm,
    backgroundColor: "#fff",
    marginTop: -ESPACIO.sm,
    marginBottom: ESPACIO.md,
    overflow: "hidden",
  },
  sugerencia: {
    paddingHorizontal: ESPACIO.md,
    paddingVertical: ESPACIO.md,
    minHeight: 44,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORES.borde,
  },
  sugerenciaActiva: { backgroundColor: COLORES.moradoClaro },
  sugerenciaTexto: { fontSize: 13.5, color: COLORES.texto },
  sugerenciaDetalle: { fontSize: 11.5, color: COLORES.muted, marginTop: 2 },
  ubicacionPista: { fontSize: 11.5, color: COLORES.muted, marginTop: -ESPACIO.sm, marginBottom: ESPACIO.md },
  ubicacionAviso: { fontSize: 12, color: COLORES.doradoTexto, marginTop: -ESPACIO.sm, marginBottom: ESPACIO.md },
  atribucion: { fontSize: 11, color: COLORES.muted, marginTop: ESPACIO.xs },
}));
