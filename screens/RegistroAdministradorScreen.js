/**
 * GlamSpaces · HU-03 Registro de administrador de salón (Sprint 1)
 * Historia de Adrian — armada aquí por Erick para ayudar a completar el
 * frontend del Sprint 1 (misma lógica y estilo que RegistroClienteScreen.js).
 *
 * Cubre lo que pide la HU-03:
 *  - Formulario de registro con nombre completo, correo, contraseña y
 *    nombre del salón que representan.
 *  - Validación del formato de correo y de la longitud mínima de contraseña.
 *  - La cuenta creada queda marcada como tipo "administrador".
 *
 * NOTA DE INTEGRACIÓN:
 * Ya conectado al API real (POST /api/usuarios/registro) usando
 * EXPO_PUBLIC_API_URL, mandando tipoCuenta: "administrador" y nombreSalon.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MIN_PASSWORD = 8;

async function guardarUsuario(usuario) {
  const resp = await fetch(`${API_URL}/usuarios/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombreCompleto: usuario.nombre,
      correo: usuario.correo,
      password: usuario.password,
      tipoCuenta: "administrador",
      nombreSalon: usuario.nombre_salon,
    }),
  });

  if (resp.status === 409) {
    throw new Error("correo_duplicado");
  }
  if (!resp.ok) {
    throw new Error("error_registro");
  }
  return resp.json();
}

export default function RegistroAdministradorScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [nombreSalon, setNombreSalon] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  function validarFormulario() {
    const nuevosErrores = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = "Escribe tu nombre completo.";
    }

    if (!correo.trim()) {
      nuevosErrores.correo = "Escribe tu correo electrónico.";
    } else if (!REGEX_CORREO.test(correo.trim())) {
      nuevosErrores.correo = "El formato del correo no es válido.";
    }

    if (!nombreSalon.trim()) {
      nuevosErrores.nombreSalon = "Escribe el nombre de tu salón.";
    }

    if (!password) {
      nuevosErrores.password = "Escribe una contraseña.";
    } else if (password.length < LONGITUD_MIN_PASSWORD) {
      nuevosErrores.password = `La contraseña debe tener al menos ${LONGITUD_MIN_PASSWORD} caracteres.`;
    }

    if (!password2 || password2 !== password) {
      nuevosErrores.password2 = "Las contraseñas no coinciden.";
    }

    if (!aceptaTerminos) {
      nuevosErrores.terminos = "Debes aceptar los términos para continuar.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarRegistro() {
    setMensaje(null);

    if (!validarFormulario()) {
      setMensaje({ tipo: "fail", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    const usuario = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      password,
      tipo_cuenta: "administrador",
      nombre_salon: nombreSalon.trim(),
      fecha_registro: new Date().toISOString(),
    };

    setEnviando(true);
    try {
      await guardarUsuario(usuario);
      setMensaje({
        tipo: "ok",
        texto: `¡Cuenta creada! Ya puedes publicar "${usuario.nombre_salon}".`,
      });
      setNombre("");
      setCorreo("");
      setNombreSalon("");
      setPassword("");
      setPassword2("");
      setAceptaTerminos(false);
      setErrores({});
    } catch (error) {
      if (error.message === "correo_duplicado") {
        setErrores((prev) => ({ ...prev, correo: "Ya existe una cuenta con este correo." }));
        setMensaje({ tipo: "fail", texto: "No se pudo crear la cuenta." });
      } else {
        setMensaje({ tipo: "fail", texto: "Ocurrió un error, intenta de nuevo." });
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
        <View style={estilos.marca}>
          <View style={estilos.logo}>
            <Text style={estilos.logoTexto}>G</Text>
          </View>
          <Text style={estilos.nombreMarca}>GlamSpaces</Text>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Registra tu salón</Text>
          <Text style={estilos.subtitulo}>
            Crea tu cuenta de administrador para publicar tu espacio en GlamSpaces.
          </Text>

          <Campo
            etiqueta="Nombre completo"
            valor={nombre}
            onCambiar={setNombre}
            placeholder="Ej. Adrian García Jiménez"
            error={errores.nombre}
            autoCapitalize="words"
          />

          <Campo
            etiqueta="Correo electrónico"
            valor={correo}
            onCambiar={setCorreo}
            placeholder="tucorreo@ejemplo.com"
            error={errores.correo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Campo
            etiqueta="Nombre del salón"
            valor={nombreSalon}
            onCambiar={setNombreSalon}
            placeholder="Ej. Salón Jardín Las Rosas"
            error={errores.nombreSalon}
            autoCapitalize="words"
          />

          <Campo
            etiqueta="Contraseña"
            valor={password}
            onCambiar={setPassword}
            placeholder="Mínimo 8 caracteres"
            error={errores.password}
            secureTextEntry={!mostrarPassword}
            pistaExtra="Usa al menos 8 caracteres."
            conToggle
            mostrarPassword={mostrarPassword}
            onToggle={() => setMostrarPassword((v) => !v)}
          />

          <Campo
            etiqueta="Confirmar contraseña"
            valor={password2}
            onCambiar={setPassword2}
            placeholder="Repite tu contraseña"
            error={errores.password2}
            secureTextEntry={!mostrarPassword}
          />

          <TouchableOpacity
            style={estilos.filaCheckbox}
            onPress={() => setAceptaTerminos((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[estilos.checkbox, aceptaTerminos && estilos.checkboxActivo]}>
              {aceptaTerminos ? <Text style={estilos.checkboxMarca}>✓</Text> : null}
            </View>
            <Text style={estilos.textoCheckbox}>
              Acepto los términos y el aviso de privacidad de GlamSpaces
            </Text>
          </TouchableOpacity>
          {errores.terminos ? <Text style={estilos.error}>{errores.terminos}</Text> : null}

          <TouchableOpacity
            style={[estilos.boton, enviando && estilos.botonDeshabilitado]}
            onPress={manejarRegistro}
            disabled={enviando}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.botonTexto}>Crear cuenta de administrador</Text>
            )}
          </TouchableOpacity>

          {mensaje ? (
            <Text
              style={[
                estilos.mensajeGeneral,
                mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail,
              ]}
            >
              {mensaje.texto}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={() => navigation && navigation.navigate("RegistroCliente")}
          >
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

function Campo({
  etiqueta,
  valor,
  onCambiar,
  placeholder,
  error,
  pistaExtra,
  conToggle,
  mostrarPassword,
  onToggle,
  ...propsExtra
}) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={estilos.contenedorInput}>
        <TextInput
          style={[estilos.input, error && estilos.inputInvalido]}
          value={valor}
          onChangeText={onCambiar}
          placeholder={placeholder}
          placeholderTextColor="#b7a7bd"
          {...propsExtra}
        />
        {conToggle ? (
          <TouchableOpacity style={estilos.botonToggle} onPress={onToggle}>
            <Text>{mostrarPassword ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {pistaExtra ? <Text style={estilos.pista}>{pistaExtra}</Text> : null}
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const COLOR_MORADO = "#6b2a7a";
const COLOR_MORADO_OSCURO = "#4b1d57";
const COLOR_MORADO_CLARO = "#f4ecf7";
const COLOR_DORADO = "#d4af37";
const COLOR_TEXTO = "#2b1830";
const COLOR_MUTED = "#7a6a80";
const COLOR_ERROR = "#c0392b";
const COLOR_OK = "#2e7d32";

const estilos = StyleSheet.create({
  pagina: {
    flexGrow: 1,
    backgroundColor: COLOR_MORADO_CLARO,
    paddingBottom: 32,
    alignItems: "center",
  },
  marca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 48,
    paddingBottom: 16,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLOR_MORADO_OSCURO,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoTexto: { color: COLOR_DORADO, fontWeight: "700", fontSize: 18 },
  nombreMarca: { fontWeight: "700", fontSize: 20, color: COLOR_MORADO_OSCURO },
  tarjeta: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 20,
    padding: 24,
    shadowColor: COLOR_MORADO_OSCURO,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  titulo: { fontSize: 22, fontWeight: "700", color: COLOR_MORADO_OSCURO, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: COLOR_MUTED, marginBottom: 20, lineHeight: 18 },
  campo: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: "600", color: COLOR_MORADO_OSCURO, marginBottom: 6 },
  contenedorInput: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: "#e4d9e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLOR_TEXTO,
    backgroundColor: "#fdfcfe",
  },
  inputInvalido: { borderColor: COLOR_ERROR },
  botonToggle: { position: "absolute", right: 10, padding: 6 },
  pista: { fontSize: 11.5, color: COLOR_MUTED, marginTop: 4 },
  error: { fontSize: 12, color: COLOR_ERROR, marginTop: 4 },
  filaCheckbox: { flexDirection: "row", alignItems: "flex-start", marginTop: 4, marginBottom: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLOR_MORADO,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActivo: { backgroundColor: COLOR_MORADO },
  checkboxMarca: { color: "#fff", fontSize: 13, fontWeight: "700" },
  textoCheckbox: { flex: 1, fontSize: 12.5, color: COLOR_TEXTO },
  boton: {
    backgroundColor: COLOR_MORADO,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "700" },
  mensajeGeneral: { textAlign: "center", fontSize: 13.5, marginTop: 14, fontWeight: "600" },
  mensajeOk: { color: COLOR_OK },
  mensajeFail: { color: COLOR_ERROR },
  enlaceCambio: { textAlign: "center", fontSize: 12.5, color: COLOR_MUTED, marginTop: 20 },
  enlaceResaltado: { color: COLOR_MORADO, fontWeight: "700" },
  pie: { fontSize: 11, color: COLOR_MUTED, opacity: 0.7, marginTop: 18 },
});