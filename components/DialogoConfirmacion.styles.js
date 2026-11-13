import { StyleSheet } from "react-native";
import { conFuentes } from "../theme/disenoPwa";
import { COLORES } from "../theme/colores";
import { ESPACIO, RADIO } from "../theme/espaciado";

// Diálogo de confirmación con la paleta del Figma PROYECTO--PWA.
// Botones de 44 px de alto (objetivo táctil en móvil) y foco visible con anillo dorado.
export const estilos = StyleSheet.create(conFuentes({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(43, 31, 36, 0.55)", // Thunder translúcido
    alignItems: "center",
    justifyContent: "center",
    padding: ESPACIO.lg,
  },
  tarjeta: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: RADIO.lg,
    padding: ESPACIO.xl,
    borderWidth: 1,
    borderColor: COLORES.borde,
    // Sombra suave para despegarlo del fondo.
    shadowColor: COLORES.moradoOscuro,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES.texto,
    marginBottom: ESPACIO.sm,
  },
  mensaje: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.muted,
    marginBottom: ESPACIO.xl,
  },
  botones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: ESPACIO.md,
  },
  boton: {
    minHeight: 44, // objetivo táctil
    minWidth: 120,
    paddingHorizontal: ESPACIO.lg,
    borderRadius: RADIO.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  botonCancelar: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  botonCancelarActivo: { backgroundColor: COLORES.moradoClaro },
  botonCancelarTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORES.texto,
  },
  botonPrincipal: { backgroundColor: COLORES.morado },
  botonPrincipalActivo: { backgroundColor: COLORES.moradoOscuro },
  botonPeligro: { backgroundColor: COLORES.error },
  botonPeligroActivo: { backgroundColor: "#8c2b3a" }, // Stiletto oscurecido
  botonPrincipalTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  botonInactivo: { opacity: 0.6 },
  foco: {
    outlineWidth: 2,
    outlineColor: COLORES.dorado,
    outlineStyle: "solid",
    outlineOffset: 2,
  },
}));
