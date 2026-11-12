/**
 * Tarjeta de un salón en los resultados de búsqueda (HU-10), con el diseño Figma PROYECTO--PWA
 * (Cliente 02): foto, nombre y "Desde $X" en dorado, y abajo zona · capacidad. Solo presentación.
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
        <View style={estilos.filaSuperior}>
          <Text style={estilos.nombre} numberOfLines={1}>
            {salon.nombre}
          </Text>
          <Text style={estilos.precio}>Desde {formatearPrecio(salon.precioDesde)}</Text>
        </View>
        <Text style={estilos.detalle} numberOfLines={1}>
          {salon.zona} · Hasta {salon.capacidad} invitados
        </Text>
      </View>
    </Pressable>
  );
}
