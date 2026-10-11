/**
 * Tarjeta de un salón en los resultados de búsqueda (HU-10):
 * foto, nombre, zona, capacidad y "precio desde". Solo presentación.
 * Pressable para tener foco visible con teclado y estado "hover" en web.
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import FotoSalon from "./FotoSalon";
import { formatearPrecio } from "../utils/formato";
import { estilos } from "./TarjetaSalon.styles";

export default function TarjetaSalon({ salon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${salon.nombre}, ${salon.zona}, hasta ${salon.capacidad} personas, desde ${formatearPrecio(salon.precioDesde)}. Ver detalle`}
      style={({ pressed, hovered, focused }) => [
        estilos.tarjeta,
        (hovered || focused) && estilos.tarjetaResaltada,
        focused && estilos.tarjetaFoco,
        pressed && estilos.tarjetaPresionada,
      ]}
    >
      <FotoSalon uri={salon.fotoPrincipal} nombre={salon.nombre} style={estilos.foto} />

      <View style={estilos.cuerpo}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {salon.nombre}
        </Text>
        <Text style={estilos.zona} numberOfLines={1}>
          📍 {salon.zona}
        </Text>

        <View style={estilos.separador} />

        <View style={estilos.filaInferior}>
          <Text style={estilos.capacidad}>👪 Hasta {salon.capacidad}</Text>
          <View style={estilos.bloquePrecio}>
            <Text style={estilos.precioDesde}>Desde</Text>
            <Text style={estilos.precio}>{formatearPrecio(salon.precioDesde)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
