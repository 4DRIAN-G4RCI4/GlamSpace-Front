// PerfilScreen – pantalla de perfil con menú hamburguesa deslizante
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Platform,
} from "react-native";
import { estilos } from "./Perfil.styles";
import usePerfil from "./usePerfil"; // datos de la sesión y cerrar sesión

// Opciones que todavía no tienen pantalla: se muestran deshabilitadas.
function OpcionProximamente({ texto, estilo, estiloTexto }) {
  return (
    <View style={[estilo, estilos.deshabilitada]} accessibilityState={{ disabled: true }}>
      <Text style={estiloTexto}>
        {texto} <Text style={estilos.proximamente}>(próximamente)</Text>
      </Text>
    </View>
  );
}

// "Ana María López" → "AL"
function iniciales(nombre) {
  const partes = String(nombre || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return `${partes[0][0]}${partes.length > 1 ? partes[partes.length - 1][0] : ""}`.toUpperCase();
}

export default function PerfilScreen({ navigation }) {
  const { usuario, cargando, cerrarSesion } = usePerfil();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const translateX = useRef(new Animated.Value(-250)).current; // ancho del menú
  const esAdministrador = !!usuario && usuario.tipo_cuenta === "administrador";

  // Animación de apertura/cierre del menú (en web no hay driver nativo)
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: menuAbierto ? 0 : -250,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [menuAbierto, translateX]);

  const salir = async () => {
    setMenuAbierto(false);
    await cerrarSesion();
    navigation.navigate("Login");
  };

  // Sin sesión no hay perfil que mostrar.
  if (!cargando && !usuario) {
    return (
      <SafeAreaView style={estilos.container}>
        <View style={estilos.cuerpo}>
          <Text style={estilos.nombre}>Mi perfil</Text>
          <Text style={estilos.email}>Inicia sesión para ver tu perfil.</Text>
          <TouchableOpacity style={estilos.opcion} onPress={() => navigation.navigate("Login", { volverA: { nombre: "Perfil", params: {} } })}>
            <Text style={estilos.opcionTexto}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      {/* Menú hamburger */}
      <Animated.View
        style={[estilos.menu, { transform: [{ translateX }] }]}
        pointerEvents={menuAbierto ? "auto" : "none"}
      >
        <OpcionProximamente texto="Editar perfil" estilo={estilos.menuItem} estiloTexto={estilos.menuTexto} />
        <OpcionProximamente texto="Cambiar contraseña" estilo={estilos.menuItem} estiloTexto={estilos.menuTexto} />
        <TouchableOpacity style={estilos.menuItem} onPress={salir} accessibilityRole="button">
          <Text style={[estilos.menuTexto, { color: "#FF3B30" }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Contenido principal */}
      <View style={estilos.cuerpo}>
        {/* Avatar circular – abre el menú */}
        <TouchableOpacity
          onPress={() => setMenuAbierto(!menuAbierto)}
          style={estilos.avatarWrapper}
          accessibilityRole="button"
          accessibilityLabel={menuAbierto ? "Cerrar el menú" : "Abrir el menú"}
        >
          {usuario?.avatar ? (
            <Image source={{ uri: usuario.avatar }} style={estilos.avatar} />
          ) : (
            <View style={[estilos.avatar, estilos.avatarIniciales]}>
              <Text style={estilos.avatarInicialesTexto}>{iniciales(usuario?.nombre)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Datos del usuario */}
        <Text style={estilos.nombre}>{usuario?.nombre || ""}</Text>
        <Text style={estilos.email}>{usuario?.correo || ""}</Text>

        {/* Opciones extra */}
        <View style={estilos.opciones}>
          <TouchableOpacity
            style={estilos.opcion}
            onPress={() => navigation.navigate(esAdministrador ? "PanelAdministrador" : "MisSolicitudes")}
            accessibilityRole="button"
          >
            <Text style={estilos.opcionTexto}>{esAdministrador ? "Panel de solicitudes" : "Mis reservas"}</Text>
          </TouchableOpacity>
          <OpcionProximamente texto="Preferencias" estilo={estilos.opcion} estiloTexto={estilos.opcionTexto} />
        </View>
      </View>
    </SafeAreaView>
  );
}
