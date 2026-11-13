/**
 * GlamSpaces · HU-04 · Estilos de Login (Figma PROYECTO--PWA, Admin 01 · Iniciar sesión).
 * Lo común viene de theme/estilosComunes; aquí solo lo propio.
 */

import { StyleSheet } from "react-native";
import { conFuentes } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";

export const estilos = {
  ...comunes,
  ...StyleSheet.create(conFuentes({
    division: { flex: 1, flexDirection: "row", backgroundColor: COLORES.moradoClaro },

    // Panel de la marca (solo escritorio)
    panelMarca: {
      flex: 1,
      backgroundColor: COLORES.morado,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 48,
      gap: 18,
    },
    logoCirculo: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 1,
      borderColor: COLORES.dorado,
      alignItems: "center",
      justifyContent: "center",
    },
// Botón secundario del login: mismo ancho que el principal, borde vino.
botonSecundario: {
  minHeight: 48,
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: COLORES.morado,
  backgroundColor: "transparent",
  marginTop: 14,
},
botonSecundarioTexto: { fontSize: 14.5, fontWeight: "700", color: COLORES.morado },
    panelMarcaNombre: { fontSize: 20, fontWeight: "400", letterSpacing: 4, color: "#f3e4c8" },
    panelMarcaTexto: { fontSize: 13.5, lineHeight: 22, color: "#e8d6dc", textAlign: "center", maxWidth: 320 },

    // Formulario
    ladoFormulario: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingVertical: 32, paddingHorizontal: 20 },
    formulario: { width: "100%", maxWidth: 380 },
    tituloLogin: { fontSize: 24, fontWeight: "700", color: COLORES.texto, marginBottom: 4 },
    botonLogin: { marginTop: 8 },
    enlaceLogin: { marginTop: 14 },
  }, ["tituloLogin", "panelMarcaNombre"])),
};
