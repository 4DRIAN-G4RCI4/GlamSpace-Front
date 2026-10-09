/**
 * GlamSpaces · HU-03 Registro de administrador de salón (Sprint 1)
 * Historia de Adrian — frontend armado por Erick.
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - RegistroAdministradorScreen.js          → pantalla (JSX)   [este archivo]
 *   - RegistroAdministrador.styles.js         → estilos
 *   - useRegistroAdministrador.js             → lógica / estado / acciones
 *   - registroAdministrador.validaciones.js   → reglas de validación
 *   - ../../services/usuariosApi.js           → llamada a la API
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
import useRegistroAdministrador from "./useRegistroAdministrador";
import { estilos } from "./RegistroAdministrador.styles";

export default function RegistroAdministradorScreen({ navigation }) {
  const f = useRegistroAdministrador();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
        <Marca />

        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Registra tu salón</Text>
          <Text style={estilos.subtitulo}>
            Crea tu cuenta de administrador para publicar tu espacio en GlamSpaces.
          </Text>

          <Campo
            etiqueta="Nombre completo"
            valor={f.nombre}
            onCambiar={f.setNombre}
            placeholder="Ej. Adrian García Jiménez"
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
            etiqueta="Nombre del salón"
            valor={f.nombreSalon}
            onCambiar={f.setNombreSalon}
            placeholder="Ej. Salón Jardín Las Rosas"
            error={f.errores.nombreSalon}
            autoCapitalize="words"
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
              <Text style={estilos.botonTexto}>Crear cuenta de administrador</Text>
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
            <Text style={estilos.enlaceCambio}>
              ¿Buscas salones para tu evento?{" "}
              <Text style={estilos.enlaceResaltado}>Regístrate como cliente</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={estilos.pie}>HU-03 · Registro de administrador · Sprint 1 · GlamSpaces</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
