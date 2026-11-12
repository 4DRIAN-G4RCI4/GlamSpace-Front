/**
 * Tarjeta de un salón en los resultados de búsqueda (HU-10), con el diseño Figma PROYECTO--PWA
 * (Cliente 02): foto, nombre y "Desde $X" en dorado, y abajo zona · capacidad.
 * Pressable para tener foco visible con teclado y estado "hover" en web.
 *
 * HU-07 (fotos): con mouse, la foto se vuelve un carrusel de `fotosPreview` (hasta 5) con
 * puntos y flechas. Las flechas son hermanas del botón de la tarjeta (no anidadas), así que
 * no abren el detalle; el hover lo avisan la tarjeta y las flechas. La lógica vive en useCarrusel.js y carrusel.logica.js.
 */

import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import FotoSalon from "./FotoSalon";
import useCarrusel from "./useCarrusel";
import { fotosDeTarjeta } from "./carrusel.logica";
import { formatearPrecio } from "../utils/formato";
import { estilos } from "./TarjetaSalon.styles";

const DURACION_DESLIZAR = 450;

// Fila de fotos que se desliza en horizontal; solo pinta las ya cargadas (las demás, el fondo
// de la maqueta). Antes de medir el ancho solo hay una foto.
function Carrusel({ fotos, nombre, c }) {
  const [ancho, setAncho] = useState(0);
  const desplazamiento = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(desplazamiento, {
      toValue: -c.indice * ancho,
      duration: c.menosMovimiento ? 0 : DURACION_DESLIZAR,
      useNativeDriver: false,
    }).start();
  }, [c.indice, ancho, c.menosMovimiento, desplazamiento]);

  return (
    <View style={estilos.foto} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      {ancho > 0 ? (
        <Animated.View style={[estilos.tira, { width: ancho * fotos.length, transform: [{ translateX: desplazamiento }] }]}>
          {fotos.map((uri, i) => (
            <View key={uri + i} style={{ width: ancho, height: "100%" }}>
              {c.cargadas.includes(i) ? (
                <FotoSalon uri={uri} nombre={nombre} style={estilos.fotoCarrusel} />
              ) : (
                <View style={[estilos.fotoCarrusel, estilos.fotoPendiente]} />
              )}
            </View>
          ))}
        </Animated.View>
      ) : (
        <FotoSalon uri={fotos[0]} nombre={nombre} style={estilos.fotoCarrusel} />
      )}

      {c.activo ? (
        <View style={estilos.puntos} pointerEvents="none" aria-hidden>
          {fotos.map((uri, i) => (
            <View key={uri + i} style={[estilos.punto, i === c.indice && estilos.puntoActivo]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Flecha({ texto, etiqueta, onPress, c }) {
  return (
    <Pressable
      onPress={(e) => {
        if (e && e.stopPropagation) e.stopPropagation(); // no abre el detalle
        onPress();
      }}
      onFocus={c.enfocar}
      onBlur={c.desenfocar}
      onHoverIn={c.entrar}
      onHoverOut={c.salir}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ hovered, focused }) => [estilos.flecha, (hovered || focused) && estilos.flechaFoco]}
    >
      <Text style={estilos.flechaTexto}>{texto}</Text>
    </Pressable>
  );
}

export default function TarjetaSalon({ salon, onPress }) {
  const fotos = fotosDeTarjeta(salon);
  const c = useCarrusel(fotos);

  return (
    <View style={estilos.envoltura}>
      <Pressable
        onPress={onPress}
        onHoverIn={c.entrar}
        onHoverOut={c.salir}
        onFocus={c.enfocar}
        onBlur={c.desenfocar}
        accessibilityRole="button"
        accessibilityLabel={`${salon.nombre}, ${salon.zona}, hasta ${salon.capacidad} personas, desde ${formatearPrecio(salon.precioDesde)}. Ver detalle`}
        style={({ pressed, hovered, focused }) => [
          estilos.tarjeta,
          (hovered || focused) && estilos.tarjetaResaltada,
          focused && estilos.tarjetaFoco,
          pressed && estilos.tarjetaPresionada,
        ]}
      >
        {c.habilitado ? (
          <Carrusel fotos={fotos} nombre={salon.nombre} c={c} />
        ) : (
          <FotoSalon uri={fotos[0]} nombre={salon.nombre} style={estilos.foto} />
        )}

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

      {c.activo ? (
        <View style={estilos.controles} pointerEvents="box-none">
          <Flecha texto="‹" etiqueta={`Foto anterior de ${salon.nombre}`} onPress={c.anterior} c={c} />
          <Flecha texto="›" etiqueta={`Foto siguiente de ${salon.nombre}`} onPress={c.siguiente} c={c} />
        </View>
      ) : null}
    </View>
  );
}
