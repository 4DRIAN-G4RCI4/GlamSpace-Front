/**
 * GlamSpaces · Etiqueta del estado de una solicitud (pendiente · confirmada · rechazada), con los
 * colores del tema (texto oscurecido para contraste AA). La comparten el panel del admin,
 * "Mis solicitudes" y el detalle de una solicitud.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORES } from "../theme/colores";
import { FUENTE } from "../theme/disenoPwa";

const ESTADOS = {
  pendiente: { fondo: COLORES.pendienteFondo, texto: COLORES.pendienteTexto, etiqueta: "Pendiente" },
  confirmada: { fondo: COLORES.confirmadaFondo, texto: COLORES.confirmadaTexto, etiqueta: "Confirmada" },
  rechazada: { fondo: COLORES.rechazadaFondo, texto: COLORES.rechazadaTexto, etiqueta: "Rechazada" },
};

export default function EtiquetaEstado({ estado, texto }) {
  const e = ESTADOS[estado] || { fondo: COLORES.borde, texto: COLORES.muted, etiqueta: estado };
  return (
    <View style={[estilos.etiqueta, { backgroundColor: e.fondo }]}>
      <Text style={[estilos.texto, { color: e.texto }]}>{texto || e.etiqueta}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  texto: { fontFamily: FUENTE.texto, fontSize: 12, fontWeight: "600" },
});
