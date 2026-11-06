import { StyleSheet } from "react-native";
import { FUENTE, PWA } from "../theme/disenoPwa";

export const estilos = StyleSheet.create({
  marca: { paddingTop: 48, paddingBottom: 20, alignItems: "center" },
  marcaCompacta: { paddingTop: 0, paddingBottom: 0 },
  nombreMarca: { fontFamily: FUENTE.titulo, fontSize: 20, fontWeight: "700", letterSpacing: 2, color: PWA.vino },
  nombreMarcaClaro: { color: PWA.crema, fontWeight: "400" },
});
