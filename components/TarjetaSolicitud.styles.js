import { StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";
import { ESPACIO, RADIO } from "../theme/espaciado";

export const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIO.lg,
    marginBottom: ESPACIO.md,
  },
  encabezado: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: ESPACIO.md },
  salon: { flex: 1, fontSize: 16, fontWeight: "700", color: COLORES.moradoOscuro },
  estadoDetalle: { fontSize: 13, color: COLORES.muted, marginTop: ESPACIO.xs, marginBottom: ESPACIO.sm },

  estado: { borderRadius: RADIO.pill, paddingHorizontal: ESPACIO.md, paddingVertical: ESPACIO.xs },
  estado_pendiente: { backgroundColor: COLORES.pendienteFondo },
  estado_confirmada: { backgroundColor: COLORES.confirmadaFondo },
  estado_rechazada: { backgroundColor: COLORES.rechazadaFondo },
  estadoTexto: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  estadoTexto_pendiente: { color: COLORES.pendienteTexto },
  estadoTexto_confirmada: { color: COLORES.confirmadaTexto },
  estadoTexto_rechazada: { color: COLORES.rechazadaTexto },

  dato: { flexDirection: "row", marginTop: ESPACIO.xs + 2 },
  datoEtiqueta: { width: 72, fontSize: 13, color: COLORES.muted },
  datoValor: { flex: 1, fontSize: 13.5, color: COLORES.texto, fontWeight: "600" },

  accion: {
    alignSelf: "flex-start",
    marginTop: ESPACIO.md,
    paddingVertical: ESPACIO.xs + 2,
    paddingHorizontal: ESPACIO.md,
    borderRadius: RADIO.pill,
    borderWidth: 1,
    borderColor: COLORES.borde,
    minWidth: 120,
    alignItems: "center",
  },
  accionFoco: { borderColor: COLORES.morado },
  accionTexto: { fontSize: 13, fontWeight: "700", color: COLORES.morado },
});
