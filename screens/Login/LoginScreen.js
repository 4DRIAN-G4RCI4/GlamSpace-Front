/**
 * GlamSpaces · HU-04 Inicio y cierre de sesión (Sprint 1)
 * Historia de Alexis — frontend armado por Erick.
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - LoginScreen.js            → pantalla (JSX)            [este archivo]
 *   - PanelSesion.js            → panel con sesión activa
 *   - Login.styles.js           → estilos
 *   - useLogin.js               → lógica / estado / acciones
 *   - login.validaciones.js     → reglas de validación
 *   - ../../services/usuariosApi.js → llamada a la API
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Campo from "../../components/Campo";
import Marca from "../../components/Marca";
import PanelSesion from "./PanelSesion";
import useLogin from "./useLogin";
import { estilos } from "./Login.styles";

export default function LoginScreen({ navigation }) {
  const f = useLogin();

  if (f.cargandoSesion) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color="#6b2a7a" size="large" />
      </View>
    );
  }

  if (f.sesion) {
    return (
      <PanelSesion
        sesion={f.sesion}
        onCerrarSesion={f.manejarCerrarSesion}
        onPublicarSalon={() => navigation && navigation.navigate("PublicarSalon")}
        onBuscarSalones={() => navigation && navigation.navigate("BusquedaSalones")}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
        <Marca />

        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Inicia sesión</Text>
          <Text style={estilos.subtitulo}>
            Entra con tu correo y contraseña, ya seas cliente o administrador.
          </Text>

          <Campo
            etiqueta="Correo electrónico"
            valor={f.correo}
            onCambiar={f.setCorreo}
            placeholder="tucorreo@ejemplo.com"
            error={f.errores.correo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Campo
            etiqueta="Contraseña"
            valor={f.password}
            onCambiar={f.setPassword}
            placeholder="Tu contraseña"
            error={f.errores.password}
            secureTextEntry={!f.mostrarPassword}
            conToggle
            mostrarPassword={f.mostrarPassword}
            onToggle={f.alternarPassword}
          />

          <TouchableOpacity
            style={[estilos.boton, estilos.botonLogin, f.enviando && estilos.botonDeshabilitado]}
            onPress={f.manejarLogin}
            disabled={f.enviando}
            activeOpacity={0.85}
          >
            {f.enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.botonTexto}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          {f.mensaje ? (
            <Text
              style={[
                estilos.mensajeGeneral,
                f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail,
              ]}
            >
              {f.mensaje.texto}
            </Text>
          ) : null}

          <TouchableOpacity onPress={() => navigation && navigation.navigate("RegistroCliente")}>
            <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
              ¿No tienes cuenta?{" "}
              <Text style={estilos.enlaceResaltado}>Regístrate como cliente</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation && navigation.navigate("RegistroAdministrador")}
          >
            <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
              ¿Tienes un salón?{" "}
              <Text style={estilos.enlaceResaltado}>Regístrate como administrador</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation && navigation.navigate("BusquedaSalones")}>
            <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
              <Text style={estilos.enlaceResaltado}>← Ver salones sin iniciar sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={estilos.pie}>HU-04 · Inicio y cierre de sesión · Sprint 1 · GlamSpaces</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
