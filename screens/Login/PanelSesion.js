/**
 * GlamSpaces · HU-04 · Panel que se muestra cuando hay una sesión activa.
 * Es distinto para cliente y para administrador. Solo presentación.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Marca from "../../components/Marca";
import { estilos } from "./Login.styles";

export default function PanelSesion({ sesion, onCerrarSesion, onPublicarSalon }) {
  const esAdministrador = sesion.tipo_cuenta === "administrador";

  return (
    <View style={estilos.panelContenedor}>
      <Marca />

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>
          {esAdministrador ? "Panel de administrador" : "Panel de cliente"}
        </Text>
        <Text style={estilos.subtitulo}>
          Bienvenido/a, {sesion.nombre.split(" ")[0]}
          {esAdministrador && sesion.nombre_salon ? ` — ${sesion.nombre_salon}` : ""}.
        </Text>

        <View style={estilos.infoSesion}>
          <Text style={estilos.infoLinea}>Correo: {sesion.correo}</Text>
          <Text style={estilos.infoLinea}>
            Tipo de cuenta: {esAdministrador ? "Administrador" : "Cliente"}
          </Text>
        </View>

        <Text style={estilos.notaPanel}>
          {esAdministrador
            ? "Aquí irá la lista de tus salones y solicitudes (siguientes sprints)."
            : "Aquí irá la búsqueda de salones y tus reservaciones (siguientes sprints)."}
        </Text>

        {esAdministrador && onPublicarSalon ? (
          <TouchableOpacity style={estilos.boton} onPress={onPublicarSalon} activeOpacity={0.85}>
            <Text style={estilos.botonTexto}>Publicar mi salón</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={estilos.botonSecundario}
          onPress={onCerrarSesion}
          activeOpacity={0.85}
        >
          <Text style={estilos.botonSecundarioTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={estilos.pie}>HU-04 · Sesión activa · GlamSpaces</Text>
    </View>
  );
}
