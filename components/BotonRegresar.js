/**
 * GlamSpaces · Sprint 7 · Botón "← Regresar" de las pantallas internas.
 *
 * Vuelve a la pantalla anterior usando el historial del navegador, así que hace lo mismo que
 * el botón Atrás y no rompe el historial. Si se entró directo por la URL (no hay a dónde
 * volver dentro de la app), va a la pantalla de respaldo que indica navegacion.logica.js:
 * nunca a una pantalla en blanco ni al login.
 *
 * Accesibilidad: objetivo táctil de 44 px, foco visible y nombre claro.
 */

import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";
import { conFuentes } from "../theme/disenoPwa";
import { ESPACIO, RADIO } from "../theme/espaciado";

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
        <Text style={estilos.texto}>← {texto}</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create(conFuentes({
  contenedor: { alignSelf: "flex-start", marginBottom: ESPACIO.md },
  boton: {
    minHeight: 44, // objetivo táctil
    justifyContent: "center",
    paddingHorizontal: ESPACIO.md,
    paddingVertical: ESPACIO.sm,
    borderRadius: RADIO.sm,
  },
  botonActivo: { backgroundColor: COLORES.moradoClaro },
  texto: { fontSize: 14, fontWeight: "600", color: COLORES.morado },
  foco: {
    outlineWidth: 2,
    outlineColor: COLORES.dorado,
    outlineStyle: "solid",
    outlineOffset: 2,
  },
}));
