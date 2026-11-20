/**
 * GlamSpaces · Sprint 7 · Botón "Regresar" de las pantallas internas (HU-28: círculo con flecha).
 *
 * Vuelve a la pantalla anterior usando el historial del navegador, así que hace lo mismo que
 * el botón Atrás y no rompe el historial. Si se entró directo por la URL (no hay a dónde
 * volver dentro de la app), va a la pantalla de respaldo que indica navegacion.logica.js:
 * nunca a una pantalla en blanco ni al login.
 *
 * Círculo de 44 px con borde vino; con el puntero encima (o al presionarlo) se rellena de vino y
 * la flecha queda blanca. Accesibilidad: objetivo táctil de 44 px, foco visible y nombre claro.
 */

import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";
import { conFuentes } from "../theme/disenoPwa";
import { ESPACIO } from "../theme/espaciado";

export default function BotonRegresar({ navigation, respaldo, texto = "Regresar", estilo }) {
  if (!navigation) return null;

  const regresar = () => {
    if (navigation.regresar) navigation.regresar(respaldo);
    else if (respaldo) navigation.navigate(respaldo);
  };

  return (
    <View style={[estilos.contenedor, estilo]}>
      <Pressable
        onPress={regresar}
        accessibilityRole="button"
        accessibilityLabel={`${texto} a la pantalla anterior`}
        style={({ hovered, focused, pressed }) => [
          estilos.boton,
          (hovered || pressed) && estilos.botonActivo,
          focused && estilos.foco,
        ]}
      >
        {({ hovered, pressed }) => <Text style={[estilos.flecha, (hovered || pressed) && estilos.flechaActiva]}>←</Text>}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create(conFuentes({
  contenedor: { alignSelf: "flex-start", marginBottom: ESPACIO.md },
  boton: {
    width: 44, // objetivo táctil
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORES.morado,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  botonActivo: { backgroundColor: COLORES.morado },
  flecha: { fontSize: 20, lineHeight: 22, fontWeight: "700", color: COLORES.morado },
  flechaActiva: { color: COLORES.sobreMorado },
  foco: {
    outlineWidth: 2,
    outlineColor: COLORES.dorado,
    outlineStyle: "solid",
    outlineOffset: 2,
  },
}));
