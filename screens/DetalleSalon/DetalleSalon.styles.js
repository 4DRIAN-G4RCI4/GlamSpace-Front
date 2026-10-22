/**
 * GlamSpaces · Estilos del detalle de un salón.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO } from "../../theme/espaciado";

const ANCHO_DETALLE = 760;

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    pantalla: { flexGrow: 1, backgroundColor: COLORES.moradoClaro, alignItems: "center", paddingBottom: ESPACIO.xxl },

    barraSuperior: { width: "100%", backgroundColor: COLORES.moradoOscuro, alignItems: "center" },
    barraContenido: {
      width: "100%",
      maxWidth: ANCHO_DETALLE,
      paddingHorizontal: ESPACIO.lg,
      paddingVertical: ESPACIO.md,
      flexDirection: "row",
      alignItems: "center",
    },
    botonVolver: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: ESPACIO.sm,
      paddingHorizontal: ESPACIO.md,
      borderRadius: RADIO.pill,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.5)",
    },
    botonVolverFoco: { borderColor: COLORES.dorado, borderWidth: 2 },
    botonVolverTexto: { color: "#fff", fontWeight: "600", fontSize: 14 },

    contenido: { width: "100%", maxWidth: ANCHO_DETALLE, paddingHorizontal: ESPACIO.lg, marginTop: ESPACIO.lg },
    tarjetaDetalle: {
      backgroundColor: "#fff",
      borderRadius: RADIO.md,
      borderWidth: 1,
      borderColor: COLORES.borde,
      overflow: "hidden",
    },
    foto: { width: "100%", aspectRatio: 16 / 9, maxHeight: 380, backgroundColor: COLORES.moradoClaro },
    cuerpo: { padding: ESPACIO.xl },

    nombre: { fontSize: 24, fontWeight: "700", color: COLORES.moradoOscuro },
    filaDatos: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.sm, marginTop: ESPACIO.md },
    pastilla: {
      backgroundColor: COLORES.moradoClaro,
      borderRadius: RADIO.pill,
      paddingHorizontal: ESPACIO.md,
      paddingVertical: ESPACIO.xs + 2,
    },
    pastillaTexto: { fontSize: 13, color: COLORES.texto, fontWeight: "600" },

    bloquePrecio: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: ESPACIO.lg,
      paddingTop: ESPACIO.lg,
      borderTopWidth: 1,
      borderTopColor: COLORES.borde,
    },
    precioEtiqueta: { fontSize: 13, color: COLORES.muted, marginRight: ESPACIO.sm, textTransform: "uppercase", letterSpacing: 0.5 },
    precio: { fontSize: 26, fontWeight: "700", color: COLORES.morado },

    descripcion: { fontSize: 15, color: COLORES.texto, lineHeight: 22, marginTop: ESPACIO.lg },

    tituloSeccion: { fontSize: 17, fontWeight: "700", color: COLORES.moradoOscuro, marginTop: ESPACIO.xl, marginBottom: ESPACIO.md },
    paquete: {
      borderWidth: 1,
      borderColor: COLORES.borde,
      borderRadius: RADIO.sm,
      padding: ESPACIO.lg,
      marginBottom: ESPACIO.md,
    },
    paqueteMasBarato: { borderColor: COLORES.dorado, backgroundColor: "#fffbf0" },
    paqueteFila: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    paqueteNombre: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORES.texto, marginRight: ESPACIO.md },
    paquetePrecio: { fontSize: 16, fontWeight: "700", color: COLORES.morado },
    paqueteDescripcion: { fontSize: 13.5, color: COLORES.muted, marginTop: ESPACIO.xs, lineHeight: 19 },
    etiquetaBarato: { fontSize: 11, color: "#8a6d00", fontWeight: "700", marginTop: ESPACIO.sm, textTransform: "uppercase", letterSpacing: 0.5 },

    // Galería (HU-13)
    miniaturas: { gap: ESPACIO.sm, paddingHorizontal: ESPACIO.xl, paddingTop: ESPACIO.md },
    miniatura: { borderRadius: RADIO.sm, borderWidth: 2, borderColor: "transparent", overflow: "hidden" },
    miniaturaActiva: { borderColor: COLORES.dorado },
    miniaturaFoto: { width: 72, height: 48 },

    // Calendario de disponibilidad (HU-13)
    calendario: { borderWidth: 1, borderColor: COLORES.borde, borderRadius: RADIO.sm, padding: ESPACIO.md },
    calendarioEncabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: ESPACIO.sm },
    calendarioMes: { fontSize: 16, fontWeight: "700", color: COLORES.moradoOscuro },
    calendarioError: { paddingVertical: ESPACIO.lg },
    botonMes: {
      width: 36,
      height: 36,
      borderRadius: RADIO.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORES.moradoClaro,
    },
    botonMesFoco: { borderWidth: 2, borderColor: COLORES.dorado },
    botonMesTexto: { fontSize: 20, fontWeight: "700", color: COLORES.morado, lineHeight: 22 },

    semana: { flexDirection: "row" },
    celda: { width: "14.2857%", height: 46, alignItems: "center", justifyContent: "center" },
    diaSemana: { fontSize: 12, fontWeight: "700", color: COLORES.muted },
    dia: {
      width: 40,
      height: 40,
      maxWidth: "100%",
      borderRadius: RADIO.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    dia_disponible: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLORES.borde },
    dia_ocupado: { backgroundColor: COLORES.ocupadoFondo },
    dia_pasado: {},
    dia_elegido: { backgroundColor: COLORES.morado },
    diaHoy: { borderWidth: 1.5, borderColor: COLORES.dorado },
    diaFoco: { borderColor: COLORES.morado, borderWidth: 2 },
    diaTexto: { fontSize: 14, fontWeight: "600" },
    diaTexto_disponible: { color: COLORES.texto },
    diaTexto_ocupado: { color: COLORES.ocupadoTexto, textDecorationLine: "line-through" },
    diaTexto_pasado: { color: COLORES.placeholder },
    diaTexto_elegido: { color: "#fff", fontWeight: "700" },

    leyenda: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.lg, marginTop: ESPACIO.md, justifyContent: "center" },
    leyendaItem: { flexDirection: "row", alignItems: "center" },
    leyendaMuestra: { width: 14, height: 14, borderRadius: RADIO.pill, marginRight: ESPACIO.xs + 2 },
    leyendaTexto: { fontSize: 12.5, color: COLORES.muted },

    confirmar: { marginTop: ESPACIO.lg },
    confirmarTexto: { fontSize: 14.5, color: COLORES.texto, fontWeight: "600", textAlign: "center" },
  }),
};
