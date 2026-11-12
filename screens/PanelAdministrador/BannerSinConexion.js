/**
 * GlamSpaces · HU-22 · Aviso de modo sin conexión (panel del administrador y fotos del salón).
 * Se anuncia a lectores de pantalla sin interrumpir (aria-live). `accion` dice qué necesita conexión.
 */

import React from "react";
import { Pressable, Text, View } from "react-native";
import { formatearFechaHora } from "../../utils/fechas";
import { estilos } from "./PanelAdministrador.styles";

export default function BannerSinConexion({
  enLinea,
  guardadoEn,
  onReintentar,
  accion = "Para aceptar o rechazar solicitudes necesitas conexión.",
}) {
  if (enLinea && !guardadoEn) return null;
  return (
    <View style={estilos.sinConexion} role="status" aria-live="polite">
      <View style={estilos.sinConexionTextos}>
        <Text style={estilos.sinConexionTitulo}>
          {guardadoEn
            ? `Modo sin conexión · mostrando la última información guardada (actualizado: ${formatearFechaHora(guardadoEn)})`
            : "Modo sin conexión"}
        </Text>
        <Text style={estilos.sinConexionTexto}>{accion}</Text>
      </View>
      {enLinea && onReintentar ? (
        <Pressable
          onPress={onReintentar}
          accessibilityRole="button"
          style={({ hovered, focused }) => [estilos.botonCancelar, estilos.sinConexionBoton, (hovered || focused) && estilos.botonFoco]}
        >
          <Text style={estilos.botonCancelarTexto}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
