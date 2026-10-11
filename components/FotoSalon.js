/**
 * Foto de un salón con respaldo: si no hay URL o la imagen no carga (404, sin red),
 * muestra la inicial del salón en vez de un recuadro vacío. Solo presentación.
 */

import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORES } from "../theme/colores";

export default function FotoSalon({ uri, nombre, style, tamanoInicial = 48 }) {
  const [fallo, setFallo] = useState(false);

  // Si cambia la foto (otro salón), se vuelve a intentar.
  useEffect(() => setFallo(false), [uri]);

  if (!uri || fallo) {
    return (
      <View style={[style, estilos.vacia]}>
        <Text style={[estilos.inicial, { fontSize: tamanoInicial }]}>
          {(nombre || "?").charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFallo(true)} />;
}

const estilos = StyleSheet.create({
  vacia: { alignItems: "center", justifyContent: "center", backgroundColor: COLORES.esqueleto },
  inicial: { color: COLORES.morado, fontWeight: "700" },
});
