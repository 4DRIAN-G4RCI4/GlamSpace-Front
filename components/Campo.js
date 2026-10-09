/**
 * Campo de formulario reutilizable: etiqueta + input + pista + error.
 * Opcionalmente trae el botón de mostrar/ocultar contraseña (conToggle)
 * o un cuadro de varias líneas (multilinea). Sin lógica de negocio.
 */

import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { COLORES } from "../theme/colores";
import { estilos } from "./Campo.styles";

export default function Campo({
  etiqueta,
  valor,
  onCambiar,
  placeholder,
  error,
  pistaExtra,
  multilinea,
  conToggle,
  mostrarPassword,
  onToggle,
  ...propsExtra
}) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={estilos.contenedorInput}>
        <TextInput
          style={[
            estilos.input,
            multilinea && estilos.inputMultilinea,
            error && estilos.inputInvalido,
          ]}
          value={valor}
          onChangeText={onCambiar}
          placeholder={placeholder}
          placeholderTextColor={COLORES.placeholder}
          multiline={!!multilinea}
          {...propsExtra}
        />
        {conToggle ? (
          <TouchableOpacity style={estilos.botonToggle} onPress={onToggle}>
            <Text>{mostrarPassword ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {pistaExtra ? <Text style={estilos.pista}>{pistaExtra}</Text> : null}
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}
