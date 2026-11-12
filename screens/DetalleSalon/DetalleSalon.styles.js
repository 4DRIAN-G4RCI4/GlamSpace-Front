/**
 * GlamSpaces · Estilos del detalle de un salón (Figma PROYECTO--PWA, escritorio) y del calendario
 * de disponibilidad, que también usa el paso "1. Elige la fecha" de la reserva.
 * Medidas que no salen de la maqueta: tokens de theme/disenoPwa.js y theme/espaciado.js.
 */

import { Platform, StyleSheet } from "react-native";
import { conFuentes, MEDIDA, PWA } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO, ANCHO_MAXIMO } from "../../theme/espaciado";

const ANCHO_TARJETA_RESERVA = 340;
const ALTO_CELDA = 46; // objetivo táctil de 44 px + 2 de aire

export const estilos = {
  ...comunes,
  ...StyleSheet.create(conFuentes({
    raiz: { flex: 1, backgroundColor: PWA.fondo },
    pantalla: { flexGrow: 1, backgroundColor: PWA.fondo, alignItems: "center", paddingBottom: ESPACIO.xxl * 3 },

    contenido: { width: "100%", maxWidth: ANCHO_MAXIMO, paddingHorizontal: ESPACIO.lg, marginTop: ESPACIO.xl, gap: ESPACIO.xxl },
    contenidoEscritorio: { flexDirection: "row", alignItems: "stretch" },
    columnaIzquierda: { flex: 1, minWidth: 0 },
    columnaDerecha: { width: ANCHO_TARJETA_RESERVA },
    // Tarjeta fija al hacer scroll (web); en Android/iOS queda en su lugar.
    fija: Platform.OS === "web" ? { position: "sticky", top: ESPACIO.xl } : {},

    tarjetaError: {
      backgroundColor: PWA.superficie,
      borderRadius: MEDIDA.radioTarjeta,
      borderWidth: 1,
      borderColor: PWA.borde,
      padding: ESPACIO.xl,
    },

    // ---------- Galería ----------
    galeriaPrincipal: { width: "100%", borderRadius: MEDIDA.radioTarjeta, overflow: "hidden" },
    fotoGrande: { width: "100%", aspectRatio: 532 / 293, borderRadius: MEDIDA.radioTarjeta, backgroundColor: COLORES.esqueleto },
    galeriaFlecha: {
      position: "absolute",
      top: "50%",
      marginTop: -22,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.92)",
      borderWidth: 1,
      borderColor: PWA.borde,
    },
    galeriaFlechaIzq: { left: ESPACIO.md },
    galeriaFlechaDer: { right: ESPACIO.md },
    galeriaFlechaFoco: { borderColor: PWA.vino, borderWidth: 2 },
    galeriaFlechaTexto: { fontSize: 24, lineHeight: 26, fontWeight: "700", color: PWA.vino },
    galeriaContador: {
      position: "absolute",
      bottom: ESPACIO.md,
      right: ESPACIO.md,
      backgroundColor: "rgba(43,31,36,0.72)",
      borderRadius: MEDIDA.radioEtiqueta,
      paddingHorizontal: ESPACIO.sm + 2,
      paddingVertical: ESPACIO.xs,
    },
    galeriaContadorTexto: { color: PWA.superficie, fontSize: 12, fontWeight: "600" },

    miniaturas: { flexDirection: "row", gap: ESPACIO.md + 4, marginTop: ESPACIO.lg + 4 },
    miniatura: { flex: 1, borderRadius: RADIO.md, borderWidth: 2, borderColor: "transparent", overflow: "hidden" },
    miniaturaHueco: { flex: 1 },
    miniaturaActiva: { borderColor: PWA.vino },
    miniaturaFoto: { width: "100%", aspectRatio: 125 / 70, backgroundColor: PWA.crema },
    miniaturaMas: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(43,31,36,0.66)",
      alignItems: "center",
      justifyContent: "center",
    },
    miniaturaMasTexto: { color: PWA.superficie, fontSize: 18, fontWeight: "700" },

    // ---------- Encabezado del salón ----------
    nombre: { fontSize: 30, fontWeight: "700", color: PWA.texto, marginTop: ESPACIO.xl + 4 },
    ubicacion: { fontSize: 13.5, color: PWA.textoSecundario, marginTop: ESPACIO.sm },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.sm, marginTop: ESPACIO.md },
    chip: { backgroundColor: PWA.crema, borderRadius: RADIO.pill, paddingHorizontal: ESPACIO.md, paddingVertical: ESPACIO.xs + 2 },
    chipTexto: { fontSize: 12, fontWeight: "600", color: PWA.texto },

    pestanas: { flexDirection: "row", gap: ESPACIO.xl, borderBottomWidth: 1, borderBottomColor: PWA.borde, marginTop: ESPACIO.xl },
    pestana: { minHeight: 44, justifyContent: "center", borderBottomWidth: 2, borderBottomColor: "transparent", marginBottom: -1 },
    pestanaActiva: { borderBottomColor: PWA.vino },
    pestanaFoco: { outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.vino, outlineOffset: 2 },
    pestanaTexto: { fontSize: 13.5, color: PWA.textoSecundario },
    pestanaTextoActiva: { color: PWA.vino, fontWeight: "600" },

    descripcion: { fontSize: 14.5, color: PWA.texto, lineHeight: 23, marginTop: ESPACIO.xl },
    textoSecundario: { fontSize: 13.5, color: PWA.textoSecundario },
    tituloSeccion: { fontSize: 20, fontWeight: "700", color: PWA.texto, marginTop: ESPACIO.xxl, marginBottom: ESPACIO.lg },

    // ---------- Paquetes (seleccionables) ----------
    paquetes: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: ESPACIO.md },
    paqueteTarjeta: {
      backgroundColor: PWA.superficie,
      borderRadius: MEDIDA.radioTarjeta,
      borderWidth: 1,
      borderColor: PWA.borde,
      padding: ESPACIO.lg + 2,
      gap: ESPACIO.sm,
    },
    paqueteElegido: { borderColor: PWA.vino, backgroundColor: COLORES.moradoClaro },
    paqueteFoco: { borderColor: PWA.vino },
    paqueteNombre: { fontSize: 14.5, fontWeight: "700", color: PWA.texto },
    paqueteDescripcion: { fontSize: 12, color: PWA.textoSecundario, lineHeight: 17 },
    paquetePrecio: { fontSize: 22, fontWeight: "700", color: COLORES.doradoTexto, marginTop: ESPACIO.sm },

    // ---------- Tarjeta de reserva (derecha, fija) ----------
    tarjetaReserva: {
      backgroundColor: PWA.superficie,
      borderRadius: MEDIDA.radioTarjeta,
      borderWidth: 1,
      borderColor: PWA.borde,
      padding: ESPACIO.xl,
      shadowColor: PWA.oscuro,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    desdeEtiqueta: { fontSize: 12, color: PWA.textoSecundario },
    desdePrecio: { fontSize: 24, fontWeight: "700", color: PWA.vino, marginTop: 2 },
    desdePrecioCompacto: { fontSize: 20, fontWeight: "700", color: PWA.vino },
    cajas: { gap: ESPACIO.md, marginTop: ESPACIO.lg },
    caja: {
      borderWidth: 1,
      borderColor: PWA.borde,
      borderRadius: RADIO.md,
      paddingHorizontal: ESPACIO.md,
      paddingVertical: ESPACIO.sm + 2,
      minHeight: 44,
    },
    cajaFoco: { borderColor: PWA.vino },
    cajaEtiqueta: { fontSize: 10, fontWeight: "600", color: PWA.textoSecundario, letterSpacing: 0.6 },
    cajaValor: { fontSize: 13.5, color: PWA.texto, marginTop: 3 },
    cajaVacia: { color: PWA.textoSecundario },
    cajaFila: { flexDirection: "row", alignItems: "center", gap: ESPACIO.xs + 2 },
    cajaEntrada: { flex: 1, minWidth: 0, fontSize: 13.5, color: PWA.texto, paddingVertical: 2, marginTop: 1 },
    cajaSufijo: { fontSize: 13.5, color: PWA.textoSecundario },
    botonReservar: {
      backgroundColor: PWA.vino,
      borderRadius: RADIO.md,
      minHeight: 46,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACIO.lg,
      marginTop: ESPACIO.lg,
    },
    botonReservarMovil: { marginTop: 0, flexShrink: 1 },
    botonReservarFoco: { opacity: 0.88, outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.oscuro, outlineOffset: 2 },
    botonReservarTexto: { color: PWA.fondo, fontSize: 14, fontWeight: "600" },
    notaReserva: { fontSize: 11.5, color: PWA.textoSecundario, textAlign: "center", marginTop: ESPACIO.md, lineHeight: 16 },

    // Barra fija abajo en móvil y tablet
    barraMovil: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ESPACIO.md,
      backgroundColor: PWA.superficie,
      borderTopWidth: 1,
      borderTopColor: PWA.borde,
      paddingHorizontal: ESPACIO.lg,
      paddingVertical: ESPACIO.md,
    },

    // ---------- Calendario de disponibilidad (HU-13; también el paso 1 de la reserva) ----------
    calendario: {
      backgroundColor: PWA.superficie,
      borderWidth: 1,
      borderColor: PWA.borde,
      borderRadius: MEDIDA.radioTarjeta,
      padding: ESPACIO.lg,
    },
    calendarioEncabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: ESPACIO.sm },
    calendarioMes: { fontSize: 14, fontWeight: "600", color: PWA.texto },
    calendarioError: { paddingVertical: ESPACIO.lg },
    botonMes: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    botonMesFoco: { backgroundColor: COLORES.moradoClaro, borderWidth: 1, borderColor: PWA.vino },
    botonMesTexto: { fontSize: 20, fontWeight: "600", color: PWA.textoSecundario, lineHeight: 22 },

    semana: { flexDirection: "row" },
    celda: { width: "14.2857%", height: ALTO_CELDA, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
    diaSemana: { fontSize: 11, fontWeight: "600", color: PWA.textoSecundario },
    dia: { width: "100%", maxWidth: 76, height: 40, borderRadius: RADIO.sm, alignItems: "center", justifyContent: "center" },
    dia_disponible: {},
    dia_ocupado: { backgroundColor: PWA.peligro },
    dia_pasado: {},
    dia_elegido: { backgroundColor: PWA.vino },
    diaHoy: { borderWidth: 1.5, borderColor: COLORES.dorado },
    diaFoco: { backgroundColor: COLORES.moradoClaro, borderWidth: 1, borderColor: PWA.vino },
    diaTexto: { fontSize: 13.5, fontWeight: "500" },
    diaTexto_disponible: { color: PWA.texto },
    diaTexto_ocupado: { color: PWA.superficie, textDecorationLine: "line-through" },
    diaTexto_pasado: { color: PWA.textoTenue },
    diaTexto_elegido: { color: PWA.superficie, fontWeight: "700" },

    leyenda: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.lg, marginTop: ESPACIO.md, justifyContent: "center" },
    leyendaItem: { flexDirection: "row", alignItems: "center" },
    leyendaMuestra: { width: 14, height: 14, borderRadius: 4, marginRight: ESPACIO.xs + 2, borderWidth: 1, borderColor: PWA.borde },
    leyendaTexto: { fontSize: 12, color: PWA.textoSecundario },
  }, ["nombre", "tituloSeccion", "desdePrecio", "desdePrecioCompacto", "paquetePrecio"])),
};
