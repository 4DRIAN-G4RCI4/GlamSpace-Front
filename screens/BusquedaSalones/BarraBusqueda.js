/**
 * GlamSpaces · HU-10 · Barra de búsqueda por zona. Solo presentación.
 */

import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { COLORES } from "../../theme/colores";
import { estilos } from "./BusquedaSalones.styles";

export default function BarraBusqueda({ valor, onCambiar, onBuscar }) {
  return (
    <View style={estilos.barra}>
      <Text style={estilos.barraIcono} accessibilityElementsHidden importantForAccessibility="no">
        🔍
      </Text>
      <TextInput
        style={estilos.barraInput}
        value={valor}
        onChangeText={onCambiar}
        onSubmitEditing={onBuscar}
        placeholder="¿Dónde es tu evento? Ej. Tula"
        placeholderTextColor={COLORES.placeholder}
        returnKeyType="search"
        accessibilityLabel="Buscar salones por zona"
      />
      <Pressable
        style={({ pressed }) => [estilos.barraBoton, pressed && { opacity: 0.85 }]}
        onPress={onBuscar}
        accessibilityRole="button"
        accessibilityLabel="Buscar"
      >
        <Text style={estilos.barraBotonTexto}>Buscar</Text>
      </Pressable>
    </View>
  );
}
