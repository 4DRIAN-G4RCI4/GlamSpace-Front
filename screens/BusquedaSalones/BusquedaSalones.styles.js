/**
 * GlamSpaces · HU-10 · Estilos de la pantalla de búsqueda de salones.
 * Lo común viene de theme/estilosComunes; aquí solo lo propio de esta pantalla.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    contenido: { width: "90%", maxWidth: 720 },

    encabezado: {
      width: "90%",
      maxWidth: 720,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    botonCuenta: {
      borderWidth: 1.5,
      borderColor: COLORES.morado,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginTop: 32,
    },
    botonCuentaTexto: { color: COLORES.morado, fontWeight: "700", fontSize: 13 },

    tituloInicio: { fontSize: 24, fontWeight: "700", color: COLORES.moradoOscuro, marginBottom: 4 },
    subtituloInicio: { fontSize: 13.5, color: COLORES.muted, marginBottom: 16 },

    // Barra de búsqueda
    barra: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 14,
      borderWidth: 1.4,
      borderColor: COLORES.borde,
      paddingLeft: 14,
      overflow: "hidden",
    },
    barraIcono: { fontSize: 16, marginRight: 8 },
    barraInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORES.texto },
    barraBoton: { backgroundColor: COLORES.morado, paddingHorizontal: 18, paddingVertical: 14 },
    barraBotonTexto: { color: "#fff", fontWeight: "700", fontSize: 14 },

    // Chips de filtro
    filaChips: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.4,
      borderColor: COLORES.morado,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: "#fff",
    },
    chipActivo: { backgroundColor: COLORES.morado },
    chipAbierto: { borderColor: COLORES.dorado, borderWidth: 2 },
    chipTexto: { color: COLORES.morado, fontWeight: "600", fontSize: 13 },
    chipTextoActivo: { color: "#fff" },
    chipQuitar: { color: "#fff", fontWeight: "700", fontSize: 13, marginLeft: 8 },

    // Editor del chip abierto
    editorChip: {
      backgroundColor: "#fff",
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1.4,
      borderColor: COLORES.borde,
    },
    editorEtiqueta: { fontSize: 13, fontWeight: "700", color: COLORES.moradoOscuro, marginBottom: 8 },
    editorInput: {
      borderWidth: 1.4,
      borderColor: COLORES.borde,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: COLORES.texto,
      backgroundColor: COLORES.fondoInput,
    },
    editorInputInvalido: { borderColor: COLORES.error },
    editorBotones: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
    editorCancelar: { paddingHorizontal: 14, paddingVertical: 9, marginRight: 6 },
    editorCancelarTexto: { color: COLORES.muted, fontWeight: "700", fontSize: 13.5 },
    editorAplicar: { backgroundColor: COLORES.morado, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
    editorAplicarTexto: { color: "#fff", fontWeight: "700", fontSize: 13.5 },

    // Resultados
    filaResumen: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 12,
    },
    resumen: { fontSize: 13, color: COLORES.muted, fontWeight: "600" },
    enlaceLimpiar: { fontSize: 13, color: COLORES.morado, fontWeight: "700" },

    estadoVacio: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      marginTop: 8,
    },
    estadoVacioIcono: { fontSize: 36, marginBottom: 8 },
    estadoVacioTitulo: { fontSize: 15.5, fontWeight: "700", color: COLORES.moradoOscuro, textAlign: "center" },
    estadoVacioTexto: { fontSize: 13, color: COLORES.muted, textAlign: "center", marginTop: 6, lineHeight: 18 },

    cargandoLista: { paddingVertical: 40 },
  }),
};
