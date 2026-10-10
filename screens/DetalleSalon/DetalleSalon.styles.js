/**
 * GlamSpaces · Estilos del detalle de un salón.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    tarjetaSinRelleno: { padding: 0, overflow: "hidden" }, // se usa junto con `tarjeta`
    foto: { width: "100%", height: 220, backgroundColor: COLORES.moradoClaro },
    fotoVacia: { alignItems: "center", justifyContent: "center", backgroundColor: COLORES.moradoOscuro },
    fotoVaciaTexto: { color: COLORES.dorado, fontSize: 64, fontWeight: "700" },
    cuerpo: { padding: 22 },

    dato: { fontSize: 14, color: COLORES.texto, marginBottom: 6 },
    descripcion: { fontSize: 13.5, color: COLORES.muted, lineHeight: 20, marginTop: 6 },

    paquete: {
      backgroundColor: COLORES.moradoClaro,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    paqueteFila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    paqueteNombre: { flex: 1, fontSize: 14.5, fontWeight: "700", color: COLORES.texto, marginRight: 10 },
    paquetePrecio: { fontSize: 15, fontWeight: "700", color: COLORES.morado },
    paqueteDescripcion: { fontSize: 12.5, color: COLORES.muted, marginTop: 4 },

    enlaceVolver: { textAlign: "center", fontSize: 13, color: COLORES.muted, marginTop: 20 },
  }),
};
