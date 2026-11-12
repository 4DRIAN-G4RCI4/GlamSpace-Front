/**
 * GlamSpaces · Estilos del formulario de solicitud de reservación.
 */

import { StyleSheet } from "react-native";
import { conFuentes } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO } from "../../theme/espaciado";

export const estilos = {
  ...comunes,
  ...StyleSheet.create(conFuentes({
    contenedor: { width: "100%", alignItems: "center", marginTop: ESPACIO.xl },
    centrado: { textAlign: "center" },

    etiqueta: { fontSize: 13, fontWeight: "600", color: COLORES.moradoOscuro, marginBottom: ESPACIO.xs + 2 },
    fecha: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: COLORES.moradoClaro,
      borderRadius: RADIO.sm,
      paddingVertical: ESPACIO.md,
      paddingHorizontal: ESPACIO.lg,
      marginBottom: ESPACIO.lg,
    },
    fechaInvalida: { borderWidth: 1.4, borderColor: COLORES.error, marginBottom: 0 },
    fechaTexto: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORES.texto, marginRight: ESPACIO.md },
    errorFecha: { marginBottom: ESPACIO.lg },

    sugerencias: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.sm, marginTop: -ESPACIO.sm, marginBottom: ESPACIO.lg },
    sugerencia: {
      borderWidth: 1,
      borderColor: COLORES.borde,
      borderRadius: RADIO.pill,
      paddingHorizontal: ESPACIO.md,
      paddingVertical: ESPACIO.xs + 2,
      backgroundColor: "#fff",
    },
    sugerenciaActiva: { backgroundColor: COLORES.morado, borderColor: COLORES.morado },
    sugerenciaFoco: { borderColor: COLORES.morado },
    sugerenciaTexto: { fontSize: 13, color: COLORES.texto, fontWeight: "600" },
    sugerenciaTextoActiva: { color: "#fff" },

    opcion: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORES.borde,
      borderRadius: RADIO.sm,
      padding: ESPACIO.md,
      marginBottom: ESPACIO.sm,
    },
    opcionActiva: { borderColor: COLORES.morado, backgroundColor: COLORES.moradoClaro },
    opcionTexto: { flex: 1, fontSize: 14, color: COLORES.texto },
    opcionPrecio: { fontSize: 14, fontWeight: "700", color: COLORES.morado },

    confirmacionIcono: {
      alignSelf: "center",
      width: 56,
      height: 56,
      lineHeight: 56,
      borderRadius: RADIO.pill,
      backgroundColor: COLORES.confirmadaFondo,
      color: COLORES.confirmadaTexto,
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      overflow: "hidden",
      marginBottom: ESPACIO.md,
    },
  })),
};
