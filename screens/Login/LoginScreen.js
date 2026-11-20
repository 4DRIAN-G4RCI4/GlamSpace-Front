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
import { View, Text, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import CamposAcceso from "../../components/CamposAcceso";
import LayoutAcceso from "../../components/LayoutAcceso";
import { COLORES } from "../../theme/colores";
import useLogin from "./useLogin";
import { estilos } from "./Login.styles";

export default function LoginScreen({ navigation, route }) {
  const f = useLogin();

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
    <>
      <Text style={estilos.tituloLogin} accessibilityRole="header">Inicia sesión</Text>
      <Text style={estilos.subtitulo}>Entra con tu correo y contraseña, ya seas cliente o administrador.</Text>

      <CamposAcceso f={f} />

      <TouchableOpacity
        style={[estilos.boton, estilos.botonLogin, f.enviando && estilos.botonDeshabilitado]}
        onPress={f.manejarLogin}
        disabled={f.enviando}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        {f.enviando ? <ActivityIndicator color={COLORES.sobreMorado} /> : <Text style={estilos.botonTexto}>Iniciar sesión</Text>}
      </TouchableOpacity>

      {f.mensaje ? (
        <Text style={[estilos.mensajeGeneral, f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail]}>
          {f.mensaje.texto}
        </Text>
      ) : null}

      <TouchableOpacity onPress={() => navigation && navigation.navigate("RegistroCliente")}>
        <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
          ¿No tienes cuenta? <Text style={estilos.enlaceResaltado}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation && navigation.navigate("RegistroAdministrador")}>
        <Text style={[estilos.enlaceCambio, estilos.enlaceLogin]}>
          ¿Tu salón aún no está en GlamSpaces? <Text style={estilos.enlaceResaltado}>Regístralo</Text>
        </Text>
      </TouchableOpacity>
      {/* Botón secundario (no un enlace): mismo ancho que el principal, con borde vino. */}
      {/* HU-28: con el puntero encima (o al presionarlo) se rellena de vino y el texto queda blanco. */}
      <Pressable
        onPress={() => navigation && navigation.navigate("BusquedaSalones")}
        accessibilityRole="button"
        accessibilityLabel="Ver salones sin iniciar sesión"
        style={({ hovered, pressed }) => [estilos.botonSecundario, (hovered || pressed) && estilos.botonSecundarioActivo]}
      >
        {({ hovered, pressed }) => (
          <Text style={[estilos.botonSecundarioTexto, (hovered || pressed) && estilos.botonSecundarioTextoActivo]}>
            ← Ver salones sin iniciar sesión
          </Text>
        )}
      </Pressable>
    </>
  );

  // Mismo diseño de dos paneles que los registros (components/LayoutAcceso), con el círculo de
  // "Regresar" arriba: si no hay a dónde volver, va a la búsqueda de salones.
  return (
    <LayoutAcceso navigation={navigation} respaldoRegresar="BusquedaSalones">
      {formulario}
    </LayoutAcceso>
  );
}
