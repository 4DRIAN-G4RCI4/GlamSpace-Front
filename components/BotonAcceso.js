/**
 * GlamSpaces · Botón principal de las pantallas de acceso (convertir a administrador, verificar el
 * correo y recuperar la cuenta). Con el puntero encima cambia al tono activo; mientras envía muestra
 * el indicador de carga.
 */

import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { COLORES } from "../theme/colores";
import { estilos } from "../screens/Login/Login.styles";

export default function BotonAcceso({ texto, onPress, enviando }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={enviando}
      accessibilityRole="button"
      style={({ hovered, pressed }) => [
        estilos.boton,
        estilos.botonLogin,
        (hovered || pressed) && { backgroundColor: COLORES.moradoActivo },
        enviando && estilos.botonDeshabilitado,
      ]}
    >
      {enviando ? <ActivityIndicator color={COLORES.sobreMorado} /> : <Text style={estilos.botonTexto}>{texto}</Text>}
    </Pressable>
  );
}
