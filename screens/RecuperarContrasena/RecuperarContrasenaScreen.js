/**
 * GlamSpaces · Sprint 10 · "¿Olvidaste tu contraseña?" → código por correo → nueva contraseña.
 * Mismo diseño de dos paneles que el login (components/LayoutAcceso).
 *
 *   - RecuperarContrasenaScreen.js → pantalla (JSX)   [este archivo]
 *   - useRecuperarContrasena.js    → los tres pasos
 *   - ../../services/correo.logica.js → contrato con la API, textos y reglas (probadas)
 *
 * route.params.correo (opcional): el que ya estaba escrito en el login.
 */

import React from "react";
import { Pressable, Text } from "react-native";
import BotonAcceso from "../../components/BotonAcceso";
import Campo from "../../components/Campo";
import CampoCodigo from "../../components/CampoCodigo";
import LayoutAcceso from "../../components/LayoutAcceso";
import { TEXTOS_CORREO } from "../../services/correo.logica";
import { estilos } from "../Login/Login.styles";
import useRecuperarContrasena from "./useRecuperarContrasena";

function Enlace({ pregunta, accion, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
        {pregunta} <Text style={estilos.enlaceResaltado}>{accion}</Text>
      </Text>
    </Pressable>
  );
}

export default function RecuperarContrasenaScreen({ navigation, route }) {
  const f = useRecuperarContrasena((route && route.params && route.params.correo) || "");
  const irALogin = () => navigation && navigation.navigate("Login");

  let contenido;
  if (f.paso === "listo") {
    contenido = (
      <>
        <Text style={estilos.tituloLogin} accessibilityRole="header">{TEXTOS_CORREO.listoTitulo}</Text>
        <Text style={estilos.subtitulo}>{TEXTOS_CORREO.listoTexto}</Text>
        <BotonAcceso texto="Iniciar sesión" onPress={irALogin} />
      </>
    );
  } else if (f.paso === "restablecer") {
    contenido = (
      <>
        <Text style={estilos.tituloLogin} accessibilityRole="header">{TEXTOS_CORREO.restablecerTitulo}</Text>
        <Text style={estilos.subtitulo}>{TEXTOS_CORREO.restablecerTexto(f.correo)}</Text>
        <CampoCodigo
          valor={f.codigo}
          onCambiar={f.setCodigo}
          error={f.errores.codigo}
          restantes={f.restantes}
          reenviando={f.reenviando}
          onReenviar={f.reenviar}
        />
        <Campo
          etiqueta="Nueva contraseña"
          valor={f.password}
          onCambiar={f.setPassword}
          placeholder="Mínimo 8 caracteres"
          error={f.errores.password}
          secureTextEntry={!f.mostrarPassword}
          conToggle
          mostrarPassword={f.mostrarPassword}
          onToggle={f.alternarPassword}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Campo
          etiqueta="Confirma la nueva contraseña"
          valor={f.password2}
          onCambiar={f.setPassword2}
          placeholder="Escríbela otra vez"
          error={f.errores.password2}
          secureTextEntry={!f.mostrarPassword}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <BotonAcceso texto={TEXTOS_CORREO.restablecerBoton} onPress={f.restablecer} enviando={f.enviando} />
        <Enlace pregunta="¿Escribiste mal el correo?" accion="Cambiarlo" onPress={f.cambiarCorreo} />
      </>
    );
  } else {
    contenido = (
      <>
        <Text style={estilos.tituloLogin} accessibilityRole="header">{TEXTOS_CORREO.recuperarTitulo}</Text>
        <Text style={estilos.subtitulo}>{TEXTOS_CORREO.recuperarTexto}</Text>
        <Campo
          etiqueta="Correo electrónico"
          valor={f.correo}
          onCambiar={f.setCorreo}
          placeholder="tucorreo@ejemplo.com"
          error={f.errores.correo}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <BotonAcceso texto={TEXTOS_CORREO.recuperarBoton} onPress={f.pedirCodigo} enviando={f.enviando} />
        <Enlace pregunta="¿Ya la recordaste?" accion="Inicia sesión" onPress={irALogin} />
      </>
    );
  }

  return (
    <LayoutAcceso navigation={navigation} respaldoRegresar="Login">
      {contenido}
      {f.mensaje ? (
        <Text style={[estilos.mensajeGeneral, f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail]} role="status">
          {f.mensaje.texto}
        </Text>
      ) : null}
    </LayoutAcceso>
  );
}
