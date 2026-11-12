/**
 * Marca de GlamSpaces: la palabra GLAMSPACES en Playfair Display (diseño Figma PROYECTO--PWA).
 * Solo presentación. `claro` la pinta para fondos oscuros.
 */

import React from "react";
import { View, Text } from "react-native";
import { estilos } from "./Marca.styles";

export default function Marca({ claro, compacta }) {
  return (
    <View style={[estilos.marca, compacta && estilos.marcaCompacta]} accessibilityRole="header">
      <Text style={[estilos.nombreMarca, claro && estilos.nombreMarcaClaro]}>GLAMSPACES</Text>
    </View>
  );
}
