import { StyleSheet } from "react-native";
import { conFuentes } from "../theme/disenoPwa";
import { COLORES } from "../theme/colores";

// Campos del diseño Figma PROYECTO--PWA: etiqueta chica gris y caja blanca con borde Pearl Bush.
export const estilos = StyleSheet.create(conFuentes({
  campo: { marginBottom: 16 },
  etiqueta: {
    fontSize: 12,
    color: COLORES.muted,
    marginBottom: 6,
  },
  contenedorInput: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORES.texto,
    backgroundColor: COLORES.fondoInput,
  },
  inputMultilinea: { minHeight: 84, textAlignVertical: "top" },
  inputInvalido: { borderColor: COLORES.error },
  botonToggle: { position: "absolute", right: 10, padding: 6 },
  textoToggle: { fontSize: 12, fontWeight: "600", color: COLORES.morado },
  pista: { fontSize: 11.5, color: COLORES.muted, marginTop: 4 },
  error: { fontSize: 12, color: COLORES.error, marginTop: 4 },
}));
