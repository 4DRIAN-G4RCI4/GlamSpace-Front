/**
 * Tarjeta de un salón en los resultados de búsqueda (HU-10):
 * foto, nombre, zona, capacidad y "precio desde". Solo presentación.
 */

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { formatearPrecio } from "../utils/formato";
import { estilos } from "./TarjetaSalon.styles";

export default function TarjetaSalon({ salon, onPress }) {
  return (
    <TouchableOpacity
      style={estilos.tarjeta}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${salon.nombre}, ${salon.capacidad} personas, desde ${formatearPrecio(salon.precioDesde)}`}
    >
      {salon.fotoPrincipal ? (
        <Image source={{ uri: salon.fotoPrincipal }} style={estilos.foto} resizeMode="cover" />
      ) : (
        <View style={[estilos.foto, estilos.fotoVacia]}>
          <Text style={estilos.fotoVaciaTexto}>{salon.nombre.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={estilos.cuerpo}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {salon.nombre}
        </Text>
        <Text style={estilos.zona} numberOfLines={1}>
          📍 {salon.zona}
        </Text>

        <View style={estilos.filaInferior}>
          <Text style={estilos.capacidad}>👥 {salon.capacidad} personas</Text>
          <Text style={estilos.precio}>
            <Text style={estilos.precioDesde}>Desde </Text>
            {formatearPrecio(salon.precioDesde)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
