import { StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";

export const estilos = StyleSheet.create({
  marca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 48,
    paddingBottom: 16,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORES.moradoOscuro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoTexto: { color: COLORES.dorado, fontWeight: "700", fontSize: 18 },
  nombreMarca: { fontWeight: "700", fontSize: 20, color: COLORES.moradoOscuro },
});
