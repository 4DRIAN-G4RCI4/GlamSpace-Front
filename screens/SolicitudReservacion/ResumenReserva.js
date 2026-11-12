/**
 * GlamSpaces · HU-16 · Tarjeta de resumen de la reserva (Figma: "Resumen" en Cliente 04 y
 * "Resumen de tu solicitud" en Cliente 05): filas etiqueta/valor, línea y "Total estimado".
 * Solo presentación; `children` va debajo (botón y notas).
 */

import React from "react";
import { View, Text } from "react-native";
import { formatearPrecio } from "../../utils/formato";
import { estilos } from "./SolicitudReservacion.styles";

export default function ResumenReserva({ titulo, filas, total, children, estilo }) {
  return (
    <View style={[estilos.resumen, estilo]} accessibilityRole="summary">
      <Text style={estilos.resumenTitulo} accessibilityRole="header" aria-level={2}>
        {titulo}
      </Text>
      {filas.map((f) => (
        <View key={f.etiqueta} style={estilos.resumenFila}>
          <Text style={estilos.resumenEtiqueta}>{f.etiqueta}</Text>
          <Text style={[estilos.resumenValor, !f.valor && estilos.resumenVacio]} numberOfLines={2}>
            {f.valor || "—"}
          </Text>
        </View>
      ))}
      <View style={estilos.resumenLinea} />
      <View style={estilos.resumenFila}>
        <Text style={estilos.resumenTotalEtiqueta}>Total estimado</Text>
        <Text style={estilos.resumenTotal}>{total != null ? formatearPrecio(total) : "—"}</Text>
      </View>
      {children}
    </View>
  );
}
