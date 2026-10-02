/**
 * GlamSpaces · HU-04 Inicio y cierre de sesión (Sprint 1)
 * Historia de Alexis — armada aquí por Erick para ayudar a completar el
 * frontend del Sprint 1 (misma lógica y estilo que las otras 2 pantallas).
 *
 * Cubre lo que pide la HU-04:
 *  - Formulario de login con correo y contraseña, válido para cliente y
 *    administrador.
 *  - Redirige a un panel distinto según el tipo de cuenta.
 *  - Mensaje de error genérico si el correo o la contraseña fallan (no dice
 *    cuál de los dos fue).
 *  - Permite cerrar sesión desde cualquier pantalla.
 *  - La sesión se mantiene activa si se cierra y se vuelve a abrir la app
 *    sin cerrar sesión explícitamente (persistida en AsyncStorage).
 *  - Después de 3 intentos fallidos seguidos, muestra una advertencia
 *    adicional (sin bloquear la cuenta, tal como pide la HU).
 *
 * NOTA DE INTEGRACIÓN:
 * Ya conectado al API real (POST /api/usuarios/login) usando
 * EXPO_PUBLIC_API_URL. La sesión activa se sigue guardando localmente en
 * AsyncStorage (eso es independiente de la base de datos real).
 */

import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LLAVE_SESION = "glamspaces_sesion";
const INTENTOS_PARA_ADVERTENCIA = 3;

async function iniciarSesion(correo, password) {
  const resp = await fetch(`${API_URL}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: correo.trim(),
      password,
    }),
  });

  if (!resp.ok) {
    // La API regresa 401 genérico tanto si falla el correo como la contraseña.
    throw new Error("credenciales_invalidas");
  }

  const usuario = await resp.json();

  const sesion = {
    nombre: usuario.nombreCompleto,
    correo: usuario.correo,
    tipo_cuenta: usuario.tipoCuenta,
    nombre_salon: usuario.nombreSalon || null,
  };

  await AsyncStorage.setItem(LLAVE_SESION, JSON.stringify(sesion));
  return sesion;
}

async function obtenerSesionActiva() {
  try {
    const data = await AsyncStorage.getItem(LLAVE_SESION);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

async function cerrarSesion() {
  await AsyncStorage.removeItem(LLAVE_SESION);
}

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    // HU-04: si ya había una sesión activa, al reabrir la app se mantiene.
    (async () => {
      const sesionGuardada = await obtenerSesionActiva();
      setSesion(sesionGuardada);
      setCargandoSesion(false);
    })();
  }, []);

  function validarFormulario() {
    const nuevosErrores = {};

    if (!correo.trim()) {
      nuevosErrores.correo = "Escribe tu correo electrónico.";
    } else if (!REGEX_CORREO.test(correo.trim())) {
      nuevosErrores.correo = "El formato del correo no es válido.";
    }

    if (!password) {
      nuevosErrores.password = "Escribe tu contraseña.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarLogin() {
    setMensaje(null);

    if (!validarFormulario()) {
      setMensaje({ tipo: "fail", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    setEnviando(true);
    try {
      const nuevaSesion = await iniciarSesion(correo, password);
      setSesion(nuevaSesion);
      setIntentosFallidos(0);
      setPassword("");
      setMensaje(null);
    } catch (error) {
      const nuevosIntentos = intentosFallidos + 1;
      setIntentosFallidos(nuevosIntentos);

      // Mensaje genérico a propósito: no dice si falló el correo o la contraseña.
      let texto = "Correo o contraseña incorrectos.";
      if (nuevosIntentos >= INTENTOS_PARA_ADVERTENCIA) {
        texto += " Revisa bien tus datos antes de intentar de nuevo.";
      }
      setMensaje({ tipo: "fail", texto });
    } finally {
      setEnviando(false);
    }
  }

  async function manejarCerrarSesion() {
    await cerrarSesion();
    setSesion(null);
    setCorreo("");
    setPassword("");
    setIntentosFallidos(0);
    setMensaje(null);
  }

  if (cargandoSesion) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color="#6b2a7a" size="large" />
      </View>
    );
  }

  if (sesion) {
    return <PanelSesionActiva sesion={sesion} onCerrarSesion={manejarCerrarSesion} />;
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
          <Text style={estilos.titulo}>Inicia sesión</Text>
          <Text style={estilos.subtitulo}>
            Entra con tu correo y contraseña, ya seas cliente o administrador.
          </Text>

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
            etiqueta="Contraseña"
            valor={password}
            onCambiar={setPassword}
            placeholder="Tu contraseña"
            error={errores.password}
            secureTextEntry={!mostrarPassword}
            conToggle
            mostrarPassword={mostrarPassword}
            onToggle={() => setMostrarPassword((v) => !v)}
          />

          <TouchableOpacity
            style={[estilos.boton, enviando && estilos.botonDeshabilitado]}
            onPress={manejarLogin}
            disabled={enviando}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.botonTexto}>Iniciar sesión</Text>
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
              ¿No tienes cuenta?{" "}
              <Text style={estilos.enlaceResaltado}>Regístrate como cliente</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation && navigation.navigate("RegistroAdministrador")}
          >
            <Text style={estilos.enlaceCambio}>
              ¿Tienes un salón?{" "}
              <Text style={estilos.enlaceResaltado}>Regístrate como administrador</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={estilos.pie}>HU-04 · Inicio y cierre de sesión · Sprint 1 · GlamSpaces</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PanelSesionActiva({ sesion, onCerrarSesion }) {
  const esAdministrador = sesion.tipo_cuenta === "administrador";
  return (
    <View style={estilos.panelContenedor}>
      <View style={estilos.marca}>
        <View style={estilos.logo}>
          <Text style={estilos.logoTexto}>G</Text>
        </View>
        <Text style={estilos.nombreMarca}>GlamSpaces</Text>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>
          {esAdministrador ? "Panel de administrador" : "Panel de cliente"}
        </Text>
        <Text style={estilos.subtitulo}>
          Bienvenido/a, {sesion.nombre.split(" ")[0]}
          {esAdministrador && sesion.nombre_salon
            ? ` — ${sesion.nombre_salon}`
            : ""}
          .
        </Text>

        <View style={estilos.infoSesion}>
          <Text style={estilos.infoLinea}>Correo: {sesion.correo}</Text>
          <Text style={estilos.infoLinea}>
            Tipo de cuenta: {esAdministrador ? "Administrador" : "Cliente"}
          </Text>
        </View>

        <Text style={estilos.notaPanel}>
          {esAdministrador
            ? "Aquí irá la lista de tus salones y solicitudes (siguientes sprints)."
            : "Aquí irá la búsqueda de salones y tus reservaciones (siguientes sprints)."}
        </Text>

        <TouchableOpacity style={estilos.botonSecundario} onPress={onCerrarSesion} activeOpacity={0.85}>
          <Text style={estilos.botonSecundarioTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={estilos.pie}>HU-04 · Sesión activa · GlamSpaces</Text>
    </View>
  );
}

function Campo({
  etiqueta,
  valor,
  onCambiar,
  placeholder,
  error,
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
  cargandoContenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_MORADO_CLARO,
  },
  pagina: {
    flexGrow: 1,
    backgroundColor: COLOR_MORADO_CLARO,
    paddingBottom: 32,
    alignItems: "center",
  },
  panelContenedor: {
    flex: 1,
    backgroundColor: COLOR_MORADO_CLARO,
    alignItems: "center",
    paddingBottom: 32,
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
  error: { fontSize: 12, color: COLOR_ERROR, marginTop: 4 },
  boton: {
    backgroundColor: COLOR_MORADO,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "700" },
  botonSecundario: {
    borderWidth: 1.5,
    borderColor: COLOR_MORADO,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 22,
  },
  botonSecundarioTexto: { color: COLOR_MORADO, fontSize: 15, fontWeight: "700" },
  mensajeGeneral: { textAlign: "center", fontSize: 13.5, marginTop: 14, fontWeight: "600" },
  mensajeOk: { color: COLOR_OK },
  mensajeFail: { color: COLOR_ERROR },
  enlaceCambio: { textAlign: "center", fontSize: 12.5, color: COLOR_MUTED, marginTop: 14 },
  enlaceResaltado: { color: COLOR_MORADO, fontWeight: "700" },
  infoSesion: {
    backgroundColor: COLOR_MORADO_CLARO,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoLinea: { fontSize: 13, color: COLOR_TEXTO, marginBottom: 4 },
  notaPanel: { fontSize: 12.5, color: COLOR_MUTED, lineHeight: 18, marginBottom: 6 },
  pie: { fontSize: 11, color: COLOR_MUTED, opacity: 0.7, marginTop: 18 },
});