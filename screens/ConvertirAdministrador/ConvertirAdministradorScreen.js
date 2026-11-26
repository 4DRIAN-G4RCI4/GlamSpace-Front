/**
 * GlamSpaces · "Conviértete en administrador" (antes un diálogo; ahora una pantalla como el login).
 *
 *   - ConvertirAdministradorScreen.js → pantalla (JSX)   [este archivo]
 *   - useConvertirAdministrador.js    → los dos pasos: verificar identidad y confirmar
 *   - ../../services/convertirAdmin.logica.js → textos y reglas (probadas)
 *
 * Mismo diseño de dos paneles que el login (components/LayoutAcceso, estilos de Login.styles).
 */

import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import CamposAcceso from "../../components/CamposAcceso";
import LayoutAcceso from "../../components/LayoutAcceso";
import BotonAcceso from "../../components/BotonAcceso";
import { COLORES } from "../../theme/colores";
import { TEXTOS_CONVERSION, puedeConvertirse } from "../../services/convertirAdmin.logica";
import { estilos } from "../Login/Login.styles";
import useConvertirAdministrador from "./useConvertirAdministrador";

function Cancelar({ navigation }) {
  return (
    <Pressable
      onPress={() => navigation && navigation.regresar ? navigation.regresar("Perfil") : navigation.navigate("Perfil")}
      accessibilityRole="button"
      style={({ hovered, pressed }) => [estilos.botonSecundario, (hovered || pressed) && estilos.botonSecundarioActivo]}
    >
      {({ hovered, pressed }) => (
        <Text style={[estilos.botonSecundarioTexto, (hovered || pressed) && estilos.botonSecundarioTextoActivo]}>Cancelar</Text>
      )}
    </Pressable>
  );
}

export default function ConvertirAdministradorScreen({ navigation }) {
  const ir = navigation && (navigation.reemplazar || navigation.navigate);
  const f = useConvertirAdministrador(() => ir && ir("MisSalones"));

  if (f.cargando) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color={COLORES.morado} size="large" />
      </View>
    );
  }

  let contenido;
  if (!puedeConvertirse(f.sesion)) {
    contenido = (
      <>
        <Text style={estilos.tituloLogin} accessibilityRole="header">{TEXTOS_CONVERSION.titulo}</Text>
        <Text style={estilos.subtitulo}>
          {f.sesion ? "Tu cuenta ya es de administrador." : "Inicia sesión con tu cuenta de cliente para continuar."}
        </Text>
        <BotonAcceso
          texto={f.sesion ? "Ir a mis salones" : "Iniciar sesión"}
          onPress={() => ir && ir(f.sesion ? "MisSalones" : "Login", f.sesion ? {} : { volverA: { nombre: "ConvertirAdministrador", params: {} } })}
        />
      </>
    );
  } else if (f.paso === "verificar") {
    contenido = (
      <>
        <Text style={estilos.tituloLogin} accessibilityRole="header">{TEXTOS_CONVERSION.titulo}</Text>
        <Text style={estilos.subtitulo}>{TEXTOS_CONVERSION.explicacion}</Text>
        <CamposAcceso f={f} />
        <BotonAcceso texto={TEXTOS_CONVERSION.botonVerificar} onPress={f.verificar} enviando={f.enviando} />
        {f.mensaje ? <Text style={[estilos.mensajeGeneral, estilos.mensajeFail]} role="status">{f.mensaje}</Text> : null}
        <Cancelar navigation={navigation} />
      </>
    );
  } else {
    contenido = (
      <>
        <View style={estilos.verificada} role="status" aria-live="polite">
          <Text style={estilos.verificadaIcono}>✓</Text>
          <Text style={estilos.verificadaTexto}>{TEXTOS_CONVERSION.verificada}</Text>
        </View>
        <Text style={estilos.tituloLogin} accessibilityRole="header">{TEXTOS_CONVERSION.pregunta}</Text>
        <View style={estilos.condiciones}>
          {TEXTOS_CONVERSION.condiciones.map((c) => (
            <View key={c} style={estilos.condicion}>
              <Text style={estilos.condicionPunto}>•</Text>
              <Text style={estilos.condicionTexto}>{c}</Text>
            </View>
          ))}
        </View>
        <BotonAcceso texto={TEXTOS_CONVERSION.boton} onPress={f.convertir} enviando={f.enviando} />
        {f.mensaje ? <Text style={[estilos.mensajeGeneral, estilos.mensajeFail]} role="status">{f.mensaje}</Text> : null}
        <Cancelar navigation={navigation} />
      </>
    );
  }

  return (
    <LayoutAcceso navigation={navigation} respaldoRegresar="Perfil">
      {contenido}
    </LayoutAcceso>
  );
}
