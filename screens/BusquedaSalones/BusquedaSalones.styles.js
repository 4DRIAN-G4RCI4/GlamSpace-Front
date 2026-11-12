/**
 * GlamSpaces · HU-10 · Estilos de la pantalla de búsqueda de salones.
 * Lo común viene de theme/estilosComunes; espaciado y esquinas de theme/espaciado.
 */

import { StyleSheet } from "react-native";
import { conFuentes } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO, ANCHO_MAXIMO } from "../../theme/espaciado";

const contenedor = { width: "100%", maxWidth: ANCHO_MAXIMO, paddingHorizontal: ESPACIO.lg };

export const estilos = {
  ...comunes,
  ...StyleSheet.create(conFuentes({
    pantalla: { flexGrow: 1, backgroundColor: COLORES.moradoClaro, alignItems: "center", paddingBottom: ESPACIO.xxl },

    // ---------- Barra superior (Figma Cliente 02) ----------
    navbar: { width: "100%", backgroundColor: "#fff", borderBottomWidth: 0.8, borderBottomColor: COLORES.borde, alignItems: "center" },
    navbarContenido: { ...contenedor, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: ESPACIO.md + 2, gap: ESPACIO.md },
    navbarAcciones: { flexDirection: "row", alignItems: "center", gap: ESPACIO.sm + 2 },
    botonCuenta: { borderWidth: 1, borderColor: COLORES.morado, borderRadius: 9, paddingHorizontal: ESPACIO.lg, paddingVertical: ESPACIO.sm + 2 },
    botonCuentaTexto: { color: COLORES.morado, fontWeight: "600", fontSize: 13 },
    botonRegistro: { backgroundColor: COLORES.morado, borderRadius: 9, paddingHorizontal: ESPACIO.lg, paddingVertical: ESPACIO.sm + 3 },
    botonRegistroTexto: { color: COLORES.moradoClaro, fontWeight: "600", fontSize: 13 },

    // Título, barra de búsqueda y chips sobre el fondo claro
    franjaContenido: { ...contenedor, marginTop: ESPACIO.xl + 4 },
    tituloInicio: { fontSize: 26, fontWeight: "700", color: COLORES.texto, marginBottom: ESPACIO.lg },

    // Barra de búsqueda
    barra: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: RADIO.md,
      borderWidth: 1,
      borderColor: COLORES.borde,
      paddingLeft: ESPACIO.lg,
      overflow: "hidden",
    },
    barraIcono: { width: 16, height: 16, marginRight: ESPACIO.sm },
    barraInput: { flex: 1, paddingVertical: ESPACIO.md, fontSize: 14, color: COLORES.texto },
    barraBoton: { backgroundColor: COLORES.morado, paddingHorizontal: ESPACIO.xl, alignSelf: "stretch", justifyContent: "center" },
    barraBotonTexto: { color: COLORES.moradoClaro, fontWeight: "600", fontSize: 13 },

    // Chips
    filaChips: { flexDirection: "row", flexWrap: "wrap", marginTop: ESPACIO.md, gap: ESPACIO.sm + 2 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: COLORES.borde,
      borderRadius: 9,
      paddingHorizontal: ESPACIO.md,
      minHeight: 34,
    },
    chipActivo: { borderColor: COLORES.morado, backgroundColor: COLORES.ocupadoFondo },
    chipAbierto: { borderColor: COLORES.morado },
    chipFoco: { borderColor: COLORES.morado },
    chipBoton: { flexDirection: "row", alignItems: "center", paddingVertical: ESPACIO.sm },
    chipTexto: { color: COLORES.texto, fontWeight: "600", fontSize: 12.5 },
    chipTextoActivo: { color: COLORES.morado },
    chipFlecha: { color: COLORES.muted, fontSize: 9, marginLeft: ESPACIO.xs },
    chipFlechaActiva: { color: COLORES.morado },
    chipQuitar: { marginLeft: ESPACIO.sm, paddingVertical: ESPACIO.sm, paddingLeft: ESPACIO.xs },
    chipQuitarTexto: { color: COLORES.morado, fontWeight: "700", fontSize: 12.5 },

    // Panel del filtro abierto
    panel: { backgroundColor: "#fff", borderRadius: RADIO.md, borderWidth: 1, borderColor: COLORES.borde, padding: ESPACIO.lg, marginTop: ESPACIO.md },
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
    resumen: { fontSize: 13, color: COLORES.muted },
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
    foco: { borderColor: COLORES.morado, borderWidth: 2 },
  })),
};
