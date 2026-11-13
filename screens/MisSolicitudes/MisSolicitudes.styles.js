/**
 * GlamSpaces · Estilos de "Mis solicitudes".
 */

import { StyleSheet } from "react-native";
import { conFuentes } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import { comunes } from "../../theme/estilosComunes";
import { ESPACIO, RADIO } from "../../theme/espaciado";

const ANCHO_LISTA = 760;

export const estilos = {
  ...comunes,
  ...StyleSheet.create(conFuentes({
    pantalla: { flexGrow: 1, backgroundColor: COLORES.moradoClaro, alignItems: "center", paddingBottom: ESPACIO.xxl },

    raiz: { flex: 1, backgroundColor: COLORES.moradoClaro },
    encabezadoLista: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: ESPACIO.md, flexWrap: "wrap" },
    contenidoDetalle: { width: "100%", maxWidth: 1080, paddingHorizontal: ESPACIO.lg, marginTop: ESPACIO.lg },

    botonBarra: {
      minHeight: 44,
      justifyContent: "center",
      paddingVertical: ESPACIO.sm,
      paddingHorizontal: ESPACIO.md,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: COLORES.morado,
    },
    botonBarraFoco: { borderWidth: 2 },
    botonBarraTexto: { color: COLORES.morado, fontWeight: "600", fontSize: 13 },

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
  })),
};
