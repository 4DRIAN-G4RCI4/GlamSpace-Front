import { StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";

export const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: COLORES.moradoOscuro,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  foto: { width: "100%", height: 160, backgroundColor: COLORES.moradoClaro },
  fotoVacia: { alignItems: "center", justifyContent: "center", backgroundColor: COLORES.moradoOscuro },
  fotoVaciaTexto: { color: COLORES.dorado, fontSize: 48, fontWeight: "700" },
  cuerpo: { padding: 14 },
  nombre: { fontSize: 16.5, fontWeight: "700", color: COLORES.texto },
  zona: { fontSize: 12.5, color: COLORES.muted, marginTop: 3 },
  filaInferior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  capacidad: { fontSize: 13, color: COLORES.texto },
  precio: { fontSize: 16, fontWeight: "700", color: COLORES.morado },
  precioDesde: { fontSize: 12, fontWeight: "400", color: COLORES.muted },
});
