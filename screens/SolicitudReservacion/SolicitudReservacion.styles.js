/**
 * GlamSpaces · Estilos de la solicitud de reservación (Figma Cliente 04 y Cliente 05).
 * Medidas que no salen de la maqueta: tokens de theme/disenoPwa.js y theme/espaciado.js.
 */

import { Platform, StyleSheet } from "react-native";
import { conFuentes, MEDIDA, PWA } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO, ANCHO_MAXIMO } from "../../theme/espaciado";

const ANCHO_RESUMEN = 300;
const ANCHO_CONFIRMAR = 720;

const tarjetaBase = {
  backgroundColor: PWA.superficie,
  borderRadius: MEDIDA.radioTarjeta,
  borderWidth: 1,
  borderColor: PWA.borde,
};

export const estilos = {
  ...comunes,
  ...StyleSheet.create(conFuentes({
    raiz: { flex: 1, backgroundColor: PWA.fondo },
    pantalla: { flexGrow: 1, backgroundColor: PWA.fondo, alignItems: "center", paddingBottom: ESPACIO.xxl * 2 },
    contenido: { width: "100%", maxWidth: ANCHO_MAXIMO, paddingHorizontal: ESPACIO.lg, marginTop: ESPACIO.xl },
    cargando: { marginTop: ESPACIO.xxl * 2 },
    centrado: { textAlign: "center" },
    centradoFila: { alignItems: "center" },
    textoSecundario: { fontSize: 13.5, color: PWA.textoSecundario, lineHeight: 19 },
    error: { fontSize: 12, color: PWA.peligro, marginTop: ESPACIO.xs + 2 },

    tituloPaso: { fontSize: 26, fontWeight: "700", color: PWA.texto, marginBottom: ESPACIO.lg },

    // ---------- Paso 1 · Cliente 04 ----------
    dosColumnas: { gap: ESPACIO.xxl },
    dosColumnasEscritorio: { flexDirection: "row", alignItems: "stretch" },
    columnaPrincipal: { flex: 1, minWidth: 0 },
    columnaResumen: { width: ANCHO_RESUMEN },
    resumenFijo: Platform.OS === "web" ? { position: "sticky", top: ESPACIO.xl } : {},
    resumenAbajo: { marginTop: ESPACIO.xl },

    tarjetaSalon: { ...tarjetaBase, flexDirection: "row", alignItems: "center", gap: ESPACIO.lg, padding: ESPACIO.md },
    tarjetaSalonFoto: { width: 60, height: 60, borderRadius: RADIO.md, backgroundColor: COLORES.esqueleto },
    tarjetaSalonTextos: { flex: 1, minWidth: 0, gap: 2 },
    tarjetaSalonNombre: { fontSize: 14.5, fontWeight: "600", color: PWA.texto },
    tarjetaSalonZona: { fontSize: 12.5, color: PWA.textoSecundario },

    seccionPaso: { marginTop: ESPACIO.xl + 4 },
    seccionTitulo: { fontSize: 16, fontWeight: "700", color: PWA.texto, marginBottom: ESPACIO.md },
    seccionOpcional: { fontSize: 13, fontWeight: "400", color: PWA.textoSecundario },

    opciones: { gap: ESPACIO.md },
    opcion: { ...tarjetaBase, flexDirection: "row", alignItems: "center", gap: ESPACIO.md, padding: ESPACIO.lg, minHeight: 56 },
    opcionActiva: { borderColor: PWA.vino, backgroundColor: COLORES.moradoClaro },
    opcionFoco: { borderColor: PWA.vino },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: PWA.textoTenue, alignItems: "center", justifyContent: "center" },
    radioActivo: { borderColor: PWA.vino },
    radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: PWA.vino },
    opcionTextos: { flex: 1, minWidth: 0, gap: 2 },
    opcionNombre: { fontSize: 14, fontWeight: "600", color: PWA.texto },
    opcionDescripcion: { fontSize: 12, color: PWA.textoSecundario },
    opcionPrecio: { fontSize: 14, fontWeight: "700", color: COLORES.doradoTexto },

    sugerencias: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIO.sm, marginTop: -ESPACIO.sm, marginBottom: ESPACIO.lg },
    sugerencia: {
      minHeight: 36,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: PWA.borde,
      borderRadius: RADIO.pill,
      paddingHorizontal: ESPACIO.md,
      backgroundColor: PWA.superficie,
    },
    sugerenciaActiva: { backgroundColor: PWA.vino, borderColor: PWA.vino },
    sugerenciaFoco: { borderColor: PWA.vino },
    sugerenciaTexto: { fontSize: 12.5, color: PWA.texto, fontWeight: "500" },
    sugerenciaTextoActiva: { color: PWA.fondo },

    filaCampos: {},
    filaCamposDos: { flexDirection: "row", gap: ESPACIO.md },
    campoMitad: { flex: 1, minWidth: 0 },

    // ---------- Resumen (Cliente 04 y 05) ----------
    resumen: { ...tarjetaBase, padding: ESPACIO.xl, gap: ESPACIO.md - 2 },
    resumenTitulo: { fontSize: 16, fontWeight: "700", color: PWA.texto, marginBottom: ESPACIO.xs },
    resumenFila: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: ESPACIO.md },
    resumenEtiqueta: { fontSize: 12.5, color: PWA.textoSecundario },
    resumenValor: { flexShrink: 1, fontSize: 12.5, fontWeight: "600", color: PWA.texto, textAlign: "right" },
    resumenVacio: { color: PWA.textoSecundario, fontWeight: "400" },
    resumenLinea: { height: 1, backgroundColor: PWA.borde, marginVertical: ESPACIO.xs },
    resumenTotalEtiqueta: { fontSize: 13.5, fontWeight: "600", color: PWA.texto },
    resumenTotal: { fontSize: 14, fontWeight: "700", color: COLORES.doradoTexto },
    faltan: { fontSize: 12, color: PWA.textoSecundario, marginTop: ESPACIO.xs },
    notaResumen: { fontSize: 11.5, color: PWA.textoSecundario, textAlign: "center" },

    botonPrincipal: {
      backgroundColor: PWA.vino,
      borderRadius: RADIO.md,
      minHeight: 46,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: ESPACIO.xl,
      marginTop: ESPACIO.md,
    },
    botonPrincipalFoco: { opacity: 0.88, outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.oscuro, outlineOffset: 2 },
    botonPrincipalTexto: { color: PWA.fondo, fontSize: 14, fontWeight: "600" },
    botonSecundarioPaso: {
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: PWA.vino,
      borderRadius: RADIO.md,
      paddingHorizontal: ESPACIO.lg,
      marginTop: ESPACIO.md,
    },
    botonSecundarioPasoFoco: { backgroundColor: COLORES.moradoClaro, borderWidth: 2 },
    botonSecundarioPasoTexto: { color: PWA.vino, fontSize: 13.5, fontWeight: "600" },

    // ---------- Paso 2 · Cliente 05 ----------
    confirmarContenedor: { width: "100%", maxWidth: ANCHO_CONFIRMAR, alignSelf: "center" },
    confirmarFila: { gap: ESPACIO.xl, marginTop: ESPACIO.md },
    confirmarFilaLado: { flexDirection: "row", alignItems: "flex-start" },
    resumenConfirmar: { flex: 1, minWidth: 0 },
    contacto: { flex: 1, minWidth: 0 },
    contactoTitulo: { fontSize: 15, fontWeight: "700", color: PWA.texto, marginBottom: ESPACIO.md },
    filaTerminos: { marginTop: ESPACIO.xl, minHeight: 44, alignItems: "center", gap: ESPACIO.xs },
    terminosFoco: { outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.vino, outlineOffset: 2, borderRadius: 4 },
    botonEnviar: { alignSelf: "center", minWidth: 220, marginTop: ESPACIO.lg },
    errorEnvio: {
      marginTop: ESPACIO.lg,
      padding: ESPACIO.lg,
      borderRadius: RADIO.md,
      backgroundColor: PWA.rechazadaFondo,
      alignItems: "center",
    },
    errorEnvioTexto: { fontSize: 13.5, color: PWA.peligro, fontWeight: "600", textAlign: "center" },

    // ---------- Enviada ----------
    confirmacion: { width: "100%", maxWidth: 560, alignSelf: "center", ...tarjetaBase, padding: ESPACIO.xl },
    confirmacionTexto: { marginBottom: ESPACIO.lg },
    confirmacionIcono: {
      alignSelf: "center",
      width: 56,
      height: 56,
      lineHeight: 56,
      borderRadius: 28,
      backgroundColor: PWA.confirmadaFondo,
      color: PWA.confirmadaTexto,
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      overflow: "hidden",
      marginBottom: ESPACIO.md,
    },
  }, ["tituloPaso", "seccionTitulo", "resumenTitulo", "contactoTitulo"])),
};
