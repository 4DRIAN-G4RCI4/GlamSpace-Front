import { StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";
import { ESPACIO, RADIO } from "../theme/espaciado";

export const estilos = StyleSheet.create({
  tarjeta: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  tarjetaResaltada: { borderColor: COLORES.morado },
  tarjetaFoco: { borderWidth: 2, borderColor: COLORES.dorado },
  tarjetaPresionada: { opacity: 0.9 },

  foto: { width: "100%", aspectRatio: 16 / 9, backgroundColor: COLORES.moradoClaro },
  cuerpo: { padding: ESPACIO.lg },
  nombre: { fontSize: 16, fontWeight: "700", color: COLORES.texto },
  zona: { fontSize: 13, color: COLORES.muted, marginTop: ESPACIO.xs },
  separador: { height: 1, backgroundColor: COLORES.borde, marginVertical: ESPACIO.md },
  filaInferior: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  capacidad: { fontSize: 13, color: COLORES.texto },
  bloquePrecio: { alignItems: "flex-end" },
  precioDesde: { fontSize: 11, color: COLORES.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  precio: { fontSize: 18, fontWeight: "700", color: COLORES.morado },
});
