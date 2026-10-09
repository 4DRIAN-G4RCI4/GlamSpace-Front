/**
 * GlamSpaces · HU-07 · Estilos de la pantalla de publicación de salón.
 * (En React Native los "CSS" son objetos StyleSheet; este archivo cumple ese papel.)
 * Lo común viene de theme/estilosComunes; aquí solo lo propio de esta pantalla.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    botonPublicar: { marginTop: 8 },

    // Lista de paquetes ya agregados
    itemLista: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: COLORES.moradoClaro,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 8,
    },
    itemTextoContenedor: { flex: 1, marginRight: 10 },
    itemTitulo: { fontSize: 13.5, fontWeight: "700", color: COLORES.texto },
    itemDetalle: { fontSize: 12, color: COLORES.muted, marginTop: 2 },
    itemEnviado: { fontSize: 11.5, color: COLORES.ok, fontWeight: "700" },
    botonQuitar: { paddingHorizontal: 8, paddingVertical: 4 },
    botonQuitarTexto: { color: COLORES.error, fontWeight: "700", fontSize: 12.5 },

    // Formulario de un paquete nuevo
    bloquePaquete: {
      borderWidth: 1.4,
      borderColor: COLORES.borde,
      borderStyle: "dashed",
      borderRadius: 14,
      padding: 14,
      marginTop: 6,
    },
    bloquePaqueteInvalido: { borderColor: COLORES.error },
    botonAgregarPaquete: {
      borderWidth: 1.5,
      borderColor: COLORES.morado,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    botonAgregarPaqueteTexto: { color: COLORES.morado, fontSize: 14.5, fontWeight: "700" },
    errorSeccion: { fontSize: 12.5, color: COLORES.error, marginBottom: 8, fontWeight: "600" },

    enlaceVolver: { textAlign: "center", fontSize: 12.5, color: COLORES.muted, marginTop: 18 },
  }),
};
