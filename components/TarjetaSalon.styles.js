import { StyleSheet } from "react-native";
import { conFuentes } from "../theme/disenoPwa";
import { COLORES } from "../theme/colores";

// Medidas de la tarjeta de Figma (Cliente 02 · Búsqueda): 282 × 188, foto de 133 px de alto.
export const estilos = StyleSheet.create(conFuentes({
  tarjeta: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  tarjetaResaltada: { borderColor: COLORES.morado },
  tarjetaFoco: { borderWidth: 2, borderColor: COLORES.morado },
  tarjetaPresionada: { opacity: 0.9 },

  foto: { width: "100%", aspectRatio: 282 / 133, backgroundColor: COLORES.esqueleto },
  cuerpo: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 6 },
  filaSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  nombre: { flex: 1, fontSize: 16.5, fontWeight: "700", color: COLORES.texto },
  precio: { fontSize: 12.5, fontWeight: "700", color: COLORES.dorado, marginTop: 2 },
  detalle: { fontSize: 12, color: COLORES.muted },
}, ["nombre"]));
