/**
 * GlamSpaces · Estilos de la solicitud de reservación.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO } from "../../theme/espaciado";

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    contenedor: { width: "100%", alignItems: "center", marginTop: ESPACIO.xl },

    etiqueta: { fontSize: 13, fontWeight: "700", color: COLORES.moradoOscuro, marginBottom: ESPACIO.xs + 2 },
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
    fechaTexto: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORES.texto, marginRight: ESPACIO.md },

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
  }),
};
