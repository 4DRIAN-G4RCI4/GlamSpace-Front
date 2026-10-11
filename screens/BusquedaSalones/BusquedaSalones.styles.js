/**
 * GlamSpaces · HU-10 · Estilos de la pantalla de búsqueda de salones.
 * Lo común viene de theme/estilosComunes; espaciado y esquinas de theme/espaciado.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO, ANCHO_MAXIMO } from "../../theme/espaciado";

const contenedor = { width: "100%", maxWidth: ANCHO_MAXIMO, paddingHorizontal: ESPACIO.lg };

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    pantalla: { flexGrow: 1, backgroundColor: COLORES.moradoClaro, alignItems: "center", paddingBottom: ESPACIO.xxl },

    // ---------- Franja superior ----------
    franja: { width: "100%", backgroundColor: COLORES.moradoOscuro, alignItems: "center", paddingBottom: ESPACIO.xl },
    franjaContenido: contenedor,
    encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    botonCuenta: {
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.5)",
      borderRadius: RADIO.pill,
      paddingHorizontal: ESPACIO.lg,
      paddingVertical: ESPACIO.sm,
      marginTop: ESPACIO.xxl,
    },
    botonCuentaTexto: { color: "#fff", fontWeight: "600", fontSize: 13 },
    tituloInicio: { fontSize: 26, fontWeight: "700", color: "#fff", marginTop: ESPACIO.sm },
    tituloAcento: { color: COLORES.dorado },
    subtituloInicio: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: ESPACIO.xs, marginBottom: ESPACIO.lg },

    // Barra de búsqueda
    barra: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: RADIO.md,
      paddingLeft: ESPACIO.lg,
      overflow: "hidden",
    },
    barraIcono: { fontSize: 16, marginRight: ESPACIO.sm },
    barraInput: { flex: 1, paddingVertical: ESPACIO.md + 2, fontSize: 15, color: COLORES.texto },
    barraBoton: { backgroundColor: COLORES.dorado, paddingHorizontal: ESPACIO.xl, alignSelf: "stretch", justifyContent: "center" },
    barraBotonTexto: { color: COLORES.moradoOscuro, fontWeight: "700", fontSize: 14 },

    // Chips
    filaChips: { flexDirection: "row", flexWrap: "wrap", marginTop: ESPACIO.md, gap: ESPACIO.sm },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.5)",
      borderRadius: RADIO.pill,
      paddingLeft: ESPACIO.md,
      paddingRight: ESPACIO.md,
      minHeight: 36,
    },
    chipActivo: { backgroundColor: "#fff", borderColor: "#fff" },
    chipAbierto: { borderColor: COLORES.dorado, borderWidth: 2 },
    chipFoco: { borderColor: COLORES.dorado, borderWidth: 2 },
    chipBoton: { flexDirection: "row", alignItems: "center", paddingVertical: ESPACIO.sm },
    chipTexto: { color: "#fff", fontWeight: "600", fontSize: 13 },
    chipTextoActivo: { color: COLORES.moradoOscuro },
    chipFlecha: { color: "rgba(255,255,255,0.7)", fontSize: 10, marginLeft: ESPACIO.xs },
    chipFlechaActiva: { color: COLORES.muted },
    chipQuitar: { marginLeft: ESPACIO.sm, paddingVertical: ESPACIO.sm, paddingLeft: ESPACIO.xs },
    chipQuitarTexto: { color: COLORES.moradoOscuro, fontWeight: "700", fontSize: 13 },

    // Panel del filtro abierto
    panel: { backgroundColor: "#fff", borderRadius: RADIO.md, padding: ESPACIO.lg, marginTop: ESPACIO.md },
    panelPregunta: { fontSize: 14, fontWeight: "700", color: COLORES.moradoOscuro, marginBottom: ESPACIO.md },
    filaSugerencias: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.sm, marginBottom: ESPACIO.md },
    sugerencia: {
      borderWidth: 1,
      borderColor: COLORES.borde,
      backgroundColor: COLORES.moradoClaro,
      borderRadius: RADIO.pill,
      paddingHorizontal: ESPACIO.md,
      paddingVertical: ESPACIO.sm - 2,
    },
    sugerenciaResaltada: { borderColor: COLORES.morado },
    sugerenciaTexto: { color: COLORES.morado, fontWeight: "600", fontSize: 13 },
    panelFila: { flexDirection: "row", alignItems: "flex-start", gap: ESPACIO.sm },
    panelInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORES.borde,
      borderRadius: RADIO.sm,
      paddingHorizontal: ESPACIO.md,
      paddingVertical: ESPACIO.sm + 2,
      fontSize: 15,
      color: COLORES.texto,
      backgroundColor: COLORES.fondoInput,
    },
    panelInputInvalido: { borderColor: COLORES.error },
    panelAplicar: { backgroundColor: COLORES.morado, borderRadius: RADIO.sm, paddingHorizontal: ESPACIO.lg, paddingVertical: ESPACIO.sm + 3 },
    panelAplicarTexto: { color: "#fff", fontWeight: "700", fontSize: 14 },
    panelCancelar: { alignSelf: "flex-end", marginTop: ESPACIO.sm, padding: ESPACIO.xs },
    panelCancelarTexto: { color: COLORES.muted, fontWeight: "600", fontSize: 13 },

    // ---------- Resultados ----------
    resultados: { ...contenedor, marginTop: ESPACIO.xl },
    filaResumen: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: ESPACIO.md },
    resumen: { fontSize: 14, color: COLORES.texto, fontWeight: "600" },
    enlaceLimpiar: { fontSize: 13, color: COLORES.morado, fontWeight: "700", padding: ESPACIO.xs },

    // La cuadrícula usa márgenes negativos + relleno en cada celda para el espacio entre tarjetas.
    cuadricula: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -ESPACIO.sm },
    celda: { paddingHorizontal: ESPACIO.sm, marginBottom: ESPACIO.lg },

    estado: {
      backgroundColor: "#fff",
      borderRadius: RADIO.md,
      borderWidth: 1,
      borderColor: COLORES.borde,
      paddingVertical: ESPACIO.xxl,
      paddingHorizontal: ESPACIO.xl,
      alignItems: "center",
    },
    estadoIcono: { fontSize: 36, marginBottom: ESPACIO.md },
    estadoTitulo: { fontSize: 16, fontWeight: "700", color: COLORES.moradoOscuro, textAlign: "center" },
    estadoTexto: { fontSize: 14, color: COLORES.muted, textAlign: "center", marginTop: ESPACIO.sm, lineHeight: 20, maxWidth: 420 },
    estadoBoton: {
      borderWidth: 1.5,
      borderColor: COLORES.morado,
      borderRadius: RADIO.sm,
      paddingHorizontal: ESPACIO.xl,
      paddingVertical: ESPACIO.sm + 2,
      marginTop: ESPACIO.lg,
    },
    estadoBotonTexto: { color: COLORES.morado, fontWeight: "700", fontSize: 14 },

    botonMas: {
      alignSelf: "center",
      borderWidth: 1.5,
      borderColor: COLORES.morado,
      borderRadius: RADIO.sm,
      paddingHorizontal: ESPACIO.xl,
      paddingVertical: ESPACIO.md,
      minWidth: 220,
      alignItems: "center",
      marginTop: ESPACIO.sm,
    },
    botonMasTexto: { color: COLORES.morado, fontWeight: "700", fontSize: 14 },
    foco: { borderColor: COLORES.dorado, borderWidth: 2 },
  }),
};
