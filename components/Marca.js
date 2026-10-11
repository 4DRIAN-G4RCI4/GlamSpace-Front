/**
 * Encabezado con el logo y el nombre de GlamSpaces. Solo presentación.
 * `claro` lo pinta para fondos oscuros (logo dorado, nombre en blanco).
 */

import React from "react";
import { View, Text } from "react-native";
import { estilos } from "./Marca.styles";

export default function Marca({ claro }) {
  return (
    <View style={estilos.marca} accessibilityRole="header">
      <View style={[estilos.logo, claro && estilos.logoClaro]}>
        <Text style={[estilos.logoTexto, claro && estilos.logoTextoClaro]}>G</Text>
      </View>
      <Text style={[estilos.nombreMarca, claro && estilos.nombreMarcaClaro]}>GlamSpaces</Text>
    </View>
  );
}
