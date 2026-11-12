/**
 * GlamSpaces · HU-04 Inicio y cierre de sesión (Sprint 1)
 * Historia de Alexis — frontend armado por Erick. Diseño: Figma PROYECTO--PWA, Admin 01 · Iniciar sesión
 * (panel vino con la marca a la izquierda y el formulario a la derecha; en móvil solo el formulario).
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - LoginScreen.js            → pantalla (JSX)            [este archivo]
 *   - Login.styles.js           → estilos
 *   - useLogin.js               → lógica / estado / acciones
 *   - login.validaciones.js     → reglas de validación
 *   - ../../services/usuariosApi.js → llamada a la API
 *
 * Con sesión activa no se muestra nada aquí: el administrador va a su Panel de solicitudes y el
 * cliente a su Perfil (o a la pantalla que mandó a iniciar sesión).
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Campo from "../../components/Campo";
import Marca from "../../components/Marca";
import { COLORES } from "../../theme/colores";
import useLogin from "./useLogin";
import { estilos } from "./Login.styles";

const LOGO = require("../../assets/admin/logo-destello.svg");

export default function LoginScreen({ navigation, route }) {
  const f = useLogin();
  const { width } = useWindowDimensions();
  const escritorio = width >= 900;

  // Si otra pantalla mandó aquí para iniciar sesión (ej. la solicitud de reservación),
  // al entrar se regresa a ella con sus mismos datos; si no, a su panel o a su perfil.
  const volverA = route && route.params ? route.params.volverA : null;
  useEffect(() => {
    if (!f.sesion || !navigation) return;
    const ir = navigation.reemplazar || navigation.navigate;
    if (volverA) ir(volverA.nombre, volverA.params);
    else ir(f.sesion.tipo_cuenta === "administrador" ? "PanelAdministrador" : "Perfil");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.sesion]);

  if (f.cargandoSesion || f.sesion) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color={COLORES.morado} size="large" />
      </View>
    );
  }

  const formulario = (
    <View style={estilos.formulario}>
      {escritorio ? null : <Marca />}
      <Text style={estilos.tituloLogin} accessibilityRole="header">Inicia sesión</Text>
      <Text style={estilos.subtitulo}>Entra con tu correo y contraseña, ya seas cliente o administrador.</Text>

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
        accessibilityRole="button"
      >
        {f.enviando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>Iniciar sesión</Text>}
      </TouchableOpacity>

      {f.mensaje ? (
        <Text style={[estilos.mensajeGeneral, f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail]}>
          {f.mensaje.texto}
        </Text>
      ) : null}

      <TouchableOpacity onPress={() => navigation && navigation.navigate("RegistroCliente")}>
        <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
          ¿No tienes cuenta? <Text style={estilos.enlaceResaltado}>Regístrate como cliente</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation && navigation.navigate("RegistroAdministrador")}>
        <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
          ¿Tu salón aún no está en GlamSpaces? <Text style={estilos.enlaceResaltado}>Regístralo</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation && navigation.navigate("BusquedaSalones")}>
        <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
          <Text style={estilos.enlaceResaltado}>← Ver salones sin iniciar sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={estilos.division}>
        {escritorio ? (
          <View style={estilos.panelMarca}>
            <View style={estilos.logoCirculo}>
              <Image source={LOGO} style={{ width: 22, height: 22 }} accessibilityIgnoresInvertColors />
            </View>
            <Text style={estilos.panelMarcaNombre}>GLAMSPACES</Text>
            <Text style={estilos.panelMarcaTexto}>
              Encuentra y reserva el salón para tu evento, o gestiona las solicitudes, la disponibilidad y la
              información de tu salón en un solo lugar.
            </Text>
          </View>
        ) : null}
        <ScrollView contentContainerStyle={estilos.ladoFormulario} keyboardShouldPersistTaps="handled">
          {formulario}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
