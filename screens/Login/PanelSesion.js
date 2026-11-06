/**
 * GlamSpaces · HU-04 · Panel que se muestra cuando hay una sesión activa.
 * Es distinto para cliente y para administrador. Solo presentación.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Marca from "../../components/Marca";
import { estilos } from "./Login.styles";

export default function PanelSesion({ sesion, onCerrarSesion, onPublicarSalon, onBuscarSalones, onMisSolicitudes, onPanelSolicitudes, onPerfil }) {
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

        {esAdministrador && onPanelSolicitudes ? (
          <TouchableOpacity style={estilos.boton} onPress={onPanelSolicitudes} activeOpacity={0.85}>
            <Text style={estilos.botonTexto}>Panel de solicitudes</Text>
          </TouchableOpacity>
        ) : null}

        {esAdministrador && onPublicarSalon ? (
          <TouchableOpacity style={estilos.botonSecundario} onPress={onPublicarSalon} activeOpacity={0.85}>
            <Text style={estilos.botonSecundarioTexto}>Publicar mi salón</Text>
          </TouchableOpacity>
        ) : null}

        {!esAdministrador && onBuscarSalones ? (
          <TouchableOpacity style={estilos.boton} onPress={onBuscarSalones} activeOpacity={0.85}>
            <Text style={estilos.botonTexto}>Buscar salones</Text>
          </TouchableOpacity>
        ) : null}

        {!esAdministrador && onMisSolicitudes ? (
          <TouchableOpacity style={estilos.botonSecundario} onPress={onMisSolicitudes} activeOpacity={0.85}>
            <Text style={estilos.botonSecundarioTexto}>Mis solicitudes</Text>
          </TouchableOpacity>
        ) : null}

        {onPerfil ? (
          <TouchableOpacity style={estilos.botonSecundario} onPress={onPerfil} activeOpacity={0.85}>
            <Text style={estilos.botonSecundarioTexto}>Mi perfil</Text>
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

      <Text style={estilos.pie}>Sesión activa · GlamSpaces</Text>
    </View>
  );
}
