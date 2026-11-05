/**
 * GlamSpaces · Estilos de "Mis solicitudes".
 */

import { StyleSheet } from "react-native";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO } from "../../theme/espaciado";

const ANCHO_LISTA = 760;

export const estilos = {
  ...comunes,
  ...StyleSheet.create({
    pantalla: { flexGrow: 1, backgroundColor: COLORES.moradoClaro, alignItems: "center", paddingBottom: ESPACIO.xxl },

    barraSuperior: { width: "100%", backgroundColor: COLORES.moradoOscuro, alignItems: "center" },
    barraContenido: {
      width: "100%",
      maxWidth: ANCHO_LISTA,
      paddingHorizontal: ESPACIO.lg,
      paddingVertical: ESPACIO.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    botonBarra: {
      paddingVertical: ESPACIO.sm,
      paddingHorizontal: ESPACIO.md,
      borderRadius: RADIO.pill,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.5)",
    },
    botonBarraFoco: { borderColor: COLORES.dorado, borderWidth: 2 },
    botonBarraTexto: { color: "#fff", fontWeight: "600", fontSize: 14 },

    contenido: { width: "100%", maxWidth: ANCHO_LISTA, paddingHorizontal: ESPACIO.lg, marginTop: ESPACIO.lg },

    aviso: {
      backgroundColor: "#fff",
      borderRadius: RADIO.md,
      borderWidth: 1,
      borderColor: COLORES.borde,
      padding: ESPACIO.xl,
      alignItems: "stretch",
    },
    avisoTitulo: { fontSize: 17, fontWeight: "700", color: COLORES.moradoOscuro, textAlign: "center" },
    avisoTexto: { fontSize: 14, color: COLORES.muted, textAlign: "center", marginTop: ESPACIO.sm, lineHeight: 20 },
    avisoEstado: { fontSize: 12.5, color: COLORES.muted, marginTop: -ESPACIO.sm, marginBottom: ESPACIO.md, marginLeft: ESPACIO.xs },
  }),
};
