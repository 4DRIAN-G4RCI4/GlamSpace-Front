/**
 * Encabezado con el logo y el nombre de GlamSpaces. Solo presentación.
 */

import React from "react";
import { View, Text } from "react-native";
import { estilos } from "./Marca.styles";

export default function Marca() {
  return (
    <View style={estilos.marca}>
      <View style={estilos.logo}>
        <Text style={estilos.logoTexto}>G</Text>
      </View>
      <Text style={estilos.nombreMarca}>GlamSpaces</Text>
    </View>
  );
}
