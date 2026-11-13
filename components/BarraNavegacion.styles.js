/**
 * GlamSpaces · Estilos de la barra superior (Figma PROYECTO--PWA, Cliente 01/02/06): blanca, marca a
 * la izquierda, enlaces en texto (el activo en vino) y avatar o botones de cuenta a la derecha.
 */

import { StyleSheet } from "react-native";
import { conFuentes, FUENTE, MEDIDA, PWA } from "../theme/disenoPwa";
import { ESPACIO, ANCHO_MAXIMO } from "../theme/espaciado";

export const ALTO_FILA = 64;

export const estilos = StyleSheet.create(conFuentes({
  // zIndex: el menú del teléfono y el del avatar se despliegan por encima del contenido.
  barra: { width: "100%", backgroundColor: PWA.superficie, borderBottomWidth: 0.8, borderBottomColor: PWA.borde, alignItems: "center", zIndex: 20 },
  fila: {
    width: "100%",
    maxWidth: ANCHO_MAXIMO,
    minHeight: ALTO_FILA,
    paddingHorizontal: ESPACIO.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ESPACIO.md,
  },
  enlaces: { flexDirection: "row", alignItems: "center", gap: ESPACIO.xs, flexShrink: 1 },
  enlace: { minHeight: 44, justifyContent: "center", paddingHorizontal: ESPACIO.md, borderBottomWidth: 2, borderBottomColor: "transparent" },
  enlaceActivo: { borderBottomColor: PWA.vino },
  enlaceTexto: { fontSize: 13.5, color: PWA.texto },
  enlaceTextoActivo: { fontSize: 13.5, fontWeight: "600", color: PWA.vino },
  derecha: { flexDirection: "row", alignItems: "center", gap: ESPACIO.sm + 2 },

  botonCuenta: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: PWA.vino, borderRadius: MEDIDA.radioBoton, paddingHorizontal: ESPACIO.lg },
  botonCuentaTexto: { color: PWA.vino, fontWeight: "600", fontSize: 13 },
  botonRegistro: { minHeight: 44, justifyContent: "center", backgroundColor: PWA.vino, borderRadius: MEDIDA.radioBoton, paddingHorizontal: ESPACIO.lg },
  botonRegistroTexto: { color: PWA.fondo, fontWeight: "600", fontSize: 13 },

  // Avatar con iniciales (Figma Cliente 06) y su menú de usuario
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: PWA.crema, alignItems: "center", justifyContent: "center" },
  avatarActivo: { borderWidth: 2, borderColor: PWA.vino },
  avatarTexto: { fontFamily: FUENTE.texto, fontSize: 13, fontWeight: "700", color: PWA.oscuro },
  menuUsuario: {
    position: "absolute",
    top: ALTO_FILA - 6,
    right: ESPACIO.lg,
    minWidth: 220,
    backgroundColor: PWA.superficie,
    borderWidth: 1,
    borderColor: PWA.borde,
    borderRadius: MEDIDA.radioTarjeta,
    paddingVertical: ESPACIO.xs,
    shadowColor: PWA.oscuro,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  menuUsuarioNombre: { fontSize: 13, fontWeight: "700", color: PWA.texto, paddingHorizontal: ESPACIO.lg, paddingTop: ESPACIO.sm },
  menuUsuarioRol: { fontSize: 12, color: PWA.textoSecundario, paddingHorizontal: ESPACIO.lg, paddingBottom: ESPACIO.sm },

  // Teléfono: botón hamburguesa y panel con los accesos
  hamburguesa: { width: 44, height: 44, alignItems: "center", justifyContent: "center", gap: 4, borderRadius: MEDIDA.radioBoton },
  raya: { width: 20, height: 2, borderRadius: 1, backgroundColor: PWA.texto },
  panel: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: PWA.superficie,
    borderBottomWidth: 1,
    borderBottomColor: PWA.borde,
    paddingVertical: ESPACIO.sm,
    shadowColor: PWA.oscuro,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  opcion: { minHeight: 48, justifyContent: "center", paddingHorizontal: ESPACIO.xl, borderLeftWidth: 3, borderLeftColor: "transparent" },
  opcionActiva: { borderLeftColor: PWA.vino, backgroundColor: PWA.fondo },
  opcionTexto: { fontSize: 15, color: PWA.texto },
  opcionTextoActiva: { fontSize: 15, fontWeight: "700", color: PWA.vino },
  opcionSalir: { fontSize: 15, fontWeight: "600", color: PWA.peligro },
  separador: { height: 1, backgroundColor: PWA.borde, marginVertical: ESPACIO.sm, marginHorizontal: ESPACIO.xl },
  panelBotones: { flexDirection: "row", gap: ESPACIO.sm, paddingHorizontal: ESPACIO.xl, paddingVertical: ESPACIO.sm },

  // Migas de pan (detalle y reserva), en su propio renglón debajo
  // Sprint 7: renglón del botón "← Regresar" de las pantallas internas.
  renglonRegresar: { width: "100%", maxWidth: ANCHO_MAXIMO, paddingHorizontal: ESPACIO.lg, paddingBottom: ESPACIO.xs },
  renglonMigas: { width: "100%", maxWidth: ANCHO_MAXIMO, paddingHorizontal: ESPACIO.lg, paddingBottom: ESPACIO.sm + 2 },
  migas: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", flexShrink: 1, minWidth: 0 },
  miga: { flexDirection: "row", alignItems: "center", flexShrink: 1, minWidth: 0 },
  migaTexto: { fontSize: 12, color: PWA.textoSecundario },
  migaActual: { color: PWA.texto, fontWeight: "600" },
  migaSeparador: { fontSize: 12, color: PWA.textoTenue, marginHorizontal: ESPACIO.sm },
  migaFoco: { borderBottomWidth: 1, borderBottomColor: PWA.vino },

  foco: { outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.vino, outlineOffset: 2 },
  hover: { opacity: 0.85 },
}));
