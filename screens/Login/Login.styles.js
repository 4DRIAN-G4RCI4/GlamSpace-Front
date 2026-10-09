/**
 * GlamSpaces · HU-04 · Estilos de Login y del panel de sesión activa.
 * Lo común viene de theme/estilosComunes; aquí solo lo propio.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    // Botón principal del login pegado un poco más arriba que en los registros
    botonLogin: { marginTop: 4 },
    enlaceLogin: { marginTop: 14 },

    // Panel de sesión activa
    panelContenedor: {
      flex: 1,
      backgroundColor: COLORES.moradoClaro,
      alignItems: "center",
      paddingBottom: 32,
    },
    infoSesion: {
      backgroundColor: COLORES.moradoClaro,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    infoLinea: { fontSize: 13, color: COLORES.texto, marginBottom: 4 },
    notaPanel: { fontSize: 12.5, color: COLORES.muted, lineHeight: 18, marginBottom: 6 },
  }),
};
