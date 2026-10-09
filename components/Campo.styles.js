import { StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";

export const estilos = StyleSheet.create({
  campo: { marginBottom: 16 },
  etiqueta: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORES.moradoOscuro,
    marginBottom: 6,
  },
  contenedorInput: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORES.texto,
    backgroundColor: COLORES.fondoInput,
  },
  inputMultilinea: { minHeight: 84, textAlignVertical: "top" },
  inputInvalido: { borderColor: COLORES.error },
  botonToggle: { position: "absolute", right: 10, padding: 6 },
  pista: { fontSize: 11.5, color: COLORES.muted, marginTop: 4 },
  error: { fontSize: 12, color: COLORES.error, marginTop: 4 },
});
