/**
 * GlamSpaces · Sprint 7 · Diseño de dos paneles de las pantallas de acceso.
 *
 * Es el mismo del login (Figma PROYECTO--PWA, Admin 01): panel vino con la marca a la izquierda
 * y el formulario a la derecha; en móvil, una sola columna con la marca arriba.
 *
 * Lo usan Iniciar sesión, Registrarse como cliente y Registrar tu salón, para que las tres se
 * vean iguales. Antes cada registro tenía su propio diseño viejo.
 */

import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Marca from "./Marca";
import BotonRegresar from "./BotonRegresar";
import { estilos } from "../screens/Login/Login.styles";

const LOGO = require("../assets/admin/logo-destello.svg");

// Desde este ancho se ve el panel de la marca al lado del formulario.
export const CORTE_DOS_PANELES = 900;

const TEXTO_MARCA =
  "Encuentra y reserva el salón para tu evento, o gestiona las solicitudes, la disponibilidad y la información de tu salón en un solo lugar.";

export default function LayoutAcceso({ children, navigation, respaldoRegresar = "Login", textoMarca = TEXTO_MARCA }) {
  const { width } = useWindowDimensions();
  const escritorio = width >= CORTE_DOS_PANELES;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={estilos.division}>
        {escritorio ? (
          <View style={estilos.panelMarca}>
            <View style={estilos.logoCirculo}>
              <Image source={LOGO} style={{ width: 22, height: 22 }} accessibilityIgnoresInvertColors />
            </View>
            <Text style={estilos.panelMarcaNombre}>GLAMSPACES</Text>
            <Text style={estilos.panelMarcaTexto}>{textoMarca}</Text>
          </View>
        ) : null}

        <ScrollView contentContainerStyle={estilos.ladoFormulario} keyboardShouldPersistTaps="handled">
          <View style={estilos.formulario}>
            {navigation ? <BotonRegresar navigation={navigation} respaldo={respaldoRegresar} /> : null}
            {escritorio ? null : <Marca />}
            {children}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
