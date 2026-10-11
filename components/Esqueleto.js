/**
 * Bloques de carga ("skeleton"): muestran la forma del contenido mientras llega
 * de la API, en lugar de un spinner. Solo presentación.
 */

import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";
import { ESPACIO, RADIO } from "../theme/espaciado";

// Un bloque gris que "respira" (opacidad 1 ↔ 0.5).
export function Bloque({ style }) {
  const opacidad = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 0.5, duration: 700, useNativeDriver: false }),
        Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: false }),
      ])
    );
    animacion.start();
    return () => animacion.stop();
  }, [opacidad]);

  return <Animated.View style={[estilos.bloque, style, { opacity: opacidad }]} />;
}

// Misma silueta que TarjetaSalon.
export function TarjetaSalonEsqueleto() {
  return (
    <View style={estilos.tarjeta}>
      <Bloque style={estilos.foto} />
      <View style={estilos.cuerpo}>
        <Bloque style={{ height: 16, width: "70%" }} />
        <Bloque style={{ height: 12, width: "45%", marginTop: ESPACIO.sm }} />
        <View style={estilos.fila}>
          <Bloque style={{ height: 12, width: "30%" }} />
          <Bloque style={{ height: 20, width: "25%" }} />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  bloque: { backgroundColor: COLORES.esqueleto, borderRadius: RADIO.sm },
  tarjeta: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  foto: { width: "100%", aspectRatio: 16 / 9, borderRadius: 0 },
  cuerpo: { padding: ESPACIO.lg },
  fila: { flexDirection: "row", justifyContent: "space-between", marginTop: ESPACIO.xl },
});
