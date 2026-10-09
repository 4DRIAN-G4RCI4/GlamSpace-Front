/**
 * GlamSpaces · HU-02 Registro de cliente (Sprint 1)
 * Responsable: Erick Trejo Reséndiz — capa FRONTEND (React Native / Expo)
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - RegistroClienteScreen.js          → pantalla (JSX)   [este archivo]
 *   - RegistroCliente.styles.js         → estilos
 *   - useRegistroCliente.js             → lógica / estado / acciones
 *   - registroCliente.validaciones.js   → reglas de validación
 *   - ../../services/usuariosApi.js     → llamada a la API
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
import useRegistroCliente from "./useRegistroCliente";
import { estilos } from "./RegistroCliente.styles";

export default function RegistroClienteScreen({ navigation }) {
  const f = useRegistroCliente();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
        <Marca />

        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Crea tu cuenta</Text>
          <Text style={estilos.subtitulo}>
            Regístrate para buscar y reservar salones de fiestas en tu zona.
          </Text>

          <Campo
            etiqueta="Nombre completo"
            valor={f.nombre}
            onCambiar={f.setNombre}
            placeholder="Ej. Erick Trejo Reséndiz"
            error={f.errores.nombre}
            autoCapitalize="words"
          />

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
            placeholder="Mínimo 8 caracteres"
            error={f.errores.password}
            secureTextEntry={!f.mostrarPassword}
            pistaExtra="Usa al menos 8 caracteres."
            conToggle
            mostrarPassword={f.mostrarPassword}
            onToggle={f.alternarPassword}
          />

          <Campo
            etiqueta="Confirmar contraseña"
            valor={f.password2}
            onCambiar={f.setPassword2}
            placeholder="Repite tu contraseña"
            error={f.errores.password2}
            secureTextEntry={!f.mostrarPassword}
          />

          <TouchableOpacity
            style={estilos.filaCheckbox}
            onPress={f.alternarTerminos}
            activeOpacity={0.7}
          >
            <View style={[estilos.checkbox, f.aceptaTerminos && estilos.checkboxActivo]}>
              {f.aceptaTerminos ? <Text style={estilos.checkboxMarca}>✓</Text> : null}
            </View>
            <Text style={estilos.textoCheckbox}>
              Acepto los términos y el aviso de privacidad de GlamSpaces
            </Text>
          </TouchableOpacity>
          {f.errores.terminos ? <Text style={estilos.error}>{f.errores.terminos}</Text> : null}

          <TouchableOpacity
            style={[estilos.boton, f.enviando && estilos.botonDeshabilitado]}
            onPress={f.manejarRegistro}
            disabled={f.enviando}
            activeOpacity={0.85}
          >
            {f.enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.botonTexto}>Crear mi cuenta</Text>
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

          <TouchableOpacity
            onPress={() => navigation && navigation.navigate("RegistroAdministrador")}
          >
            <Text style={estilos.enlaceCambio}>
              ¿Tienes un salón que quieres publicar?{" "}
              <Text style={estilos.enlaceResaltado}>Regístrate como administrador</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={estilos.pie}>HU-02 · Registro de cliente · Sprint 1 · GlamSpaces</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
