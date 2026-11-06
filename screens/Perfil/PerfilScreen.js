/**
 * GlamSpaces · Perfil (Sprint 6)
 *
 * Datos de la cuenta en sesión, accesos rápidos y cerrar sesión, con un menú lateral deslizante
 * (botón ☰ o el avatar). Diseño en el lenguaje del Figma "PROYECTO--PWA": encabezado blanco,
 * tarjeta oscura de la cuenta, listas blancas y barra inferior Buscar · Solicitudes · Perfil.
 *
 *   - PerfilScreen.js  → pantalla (JSX)   [este archivo]
 *   - Perfil.styles.js → estilos
 *   - usePerfil.js     → sesión guardada y cerrar sesión
 */

import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import useFuentesWeb from "../../theme/fuentesWeb";
import { PWA } from "../../theme/disenoPwa";
import { ANCHO_MENU, estilos } from "./Perfil.styles";
import usePerfil from "./usePerfil";

const LOGO = require("../../assets/admin/logo-destello.svg");
const ICONOS = {
  buscar: require("../../assets/cliente/icono-buscar.svg"),
  solicitudes: require("../../assets/cliente/icono-solicitudes.svg"),
  perfil: require("../../assets/cliente/icono-perfil.svg"),
};

// "María López García" → "MG"
function iniciales(nombre) {
  const partes = String(nombre || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return `${partes[0][0]}${partes.length > 1 ? partes[partes.length - 1][0] : ""}`.toUpperCase();
}

function Fila({ etiqueta, valor, onPress, proximamente, primera }) {
  const contenido = (
    <>
      {valor !== undefined ? (
        <View style={estilos.filaDato}>
          <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
          <Text style={estilos.filaValor}>{valor}</Text>
        </View>
      ) : (
        <Text style={estilos.filaTexto}>{etiqueta}</Text>
      )}
      {proximamente ? (
        <View style={estilos.proximamente}>
          <Text style={estilos.proximamenteTexto}>Próximamente</Text>
        </View>
      ) : onPress ? (
        <Text style={estilos.filaFlecha}>›</Text>
      ) : null}
    </>
  );

  if (!onPress || proximamente) {
    return (
      <View
        style={[estilos.fila, !primera && estilos.filaSeparador, proximamente && estilos.filaDeshabilitada]}
        accessibilityState={proximamente ? { disabled: true } : undefined}
      >
        {contenido}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ hovered, focused, pressed }) => [estilos.fila, !primera && estilos.filaSeparador, (hovered || focused || pressed) && estilos.filaFoco]}
    >
      {contenido}
    </Pressable>
  );
}

function BarraInferior({ esAdministrador, navigation }) {
  const pestanas = [
    { clave: "buscar", texto: "Buscar", destino: "BusquedaSalones" },
    { clave: "solicitudes", texto: "Solicitudes", destino: esAdministrador ? "PanelAdministrador" : "MisSolicitudes" },
    { clave: "perfil", texto: "Perfil", destino: null },
  ];
  return (
    <View style={estilos.barraInferior}>
      <View style={estilos.barraInferiorContenido} accessibilityRole="tablist">
      {pestanas.map((p) => {
        const activa = p.clave === "perfil";
        return (
          <Pressable
            key={p.clave}
            onPress={() => p.destino && navigation.navigate(p.destino)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            accessibilityLabel={p.texto}
            style={estilos.pestana}
          >
            {/* Los íconos de Figma vienen en gris; la pestaña activa se pinta en vino */}
            <Image
              source={ICONOS[p.clave]}
              style={{ width: 20, height: 20, tintColor: activa ? PWA.vino : PWA.textoTenue }}
              accessibilityIgnoresInvertColors
            />
            <Text style={activa ? estilos.pestanaTextoActiva : estilos.pestanaTexto}>{p.texto}</Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

export default function PerfilScreen({ navigation }) {
  useFuentesWeb();
  const { usuario, cargando, cerrarSesion } = usePerfil();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const translateX = useRef(new Animated.Value(-ANCHO_MENU)).current;
  const esAdministrador = !!usuario && usuario.tipo_cuenta === "administrador";

  // Animación de apertura/cierre del menú (en web no hay driver nativo)
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: menuAbierto ? 0 : -ANCHO_MENU,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [menuAbierto, translateX]);

  const ir = (pantalla) => {
    setMenuAbierto(false);
    navigation.navigate(pantalla);
  };

  const salir = async () => {
    setMenuAbierto(false);
    await cerrarSesion();
    navigation.navigate("Login");
  };

  const solicitudes = esAdministrador
    ? { texto: "Panel de solicitudes", pantalla: "PanelAdministrador" }
    : { texto: "Mis solicitudes", pantalla: "MisSolicitudes" };

  const enlacesMenu = [
    { texto: "Buscar salones", pantalla: "BusquedaSalones" },
    solicitudes,
    ...(esAdministrador ? [{ texto: "Publicar mi salón", pantalla: "PublicarSalon" }] : []),
    { texto: "Mi perfil", pantalla: null },
  ];

  return (
    <View style={estilos.container}>
      <View style={estilos.encabezado}>
        <Pressable
          onPress={() => setMenuAbierto(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir el menú"
          style={({ hovered, focused }) => [estilos.botonMenu, (hovered || focused) && estilos.botonMenuFoco]}
        >
          <View style={estilos.rayaMenu} />
          <View style={estilos.rayaMenu} />
          <View style={estilos.rayaMenu} />
        </Pressable>
        <Text style={estilos.tituloPantalla} accessibilityRole="header">
          Mi perfil
        </Text>
      </View>

      <ScrollView style={estilos.cuerpo} contentContainerStyle={estilos.contenido}>
        {cargando ? null : !usuario ? (
          <View style={estilos.sinSesion}>
            <Text style={estilos.sinSesionTitulo}>Aún no has iniciado sesión</Text>
            <Text style={estilos.sinSesionTexto}>Inicia sesión para ver tu perfil, tus solicitudes y tus datos.</Text>
            <Pressable
              onPress={() => navigation.navigate("Login", { volverA: { nombre: "Perfil", params: {} } })}
              accessibilityRole="button"
              style={({ hovered, focused }) => [estilos.botonPrincipal, (hovered || focused) && estilos.botonFoco]}
            >
              <Text style={estilos.botonPrincipalTexto}>Iniciar sesión</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={estilos.tarjetaCuenta}>
              <Pressable onPress={() => setMenuAbierto(true)} accessibilityRole="button" accessibilityLabel="Abrir el menú desde el avatar">
                {usuario.avatar ? (
                  <Image source={{ uri: usuario.avatar }} style={estilos.avatarImagen} />
                ) : (
                  <View style={estilos.avatar}>
                    <Text style={estilos.avatarTexto}>{iniciales(usuario.nombre)}</Text>
                  </View>
                )}
              </Pressable>
              <Text style={estilos.nombre}>{usuario.nombre}</Text>
              <Text style={estilos.correo}>{usuario.correo}</Text>
              <View style={estilos.rol}>
                <Text style={estilos.rolTexto}>{esAdministrador ? "ADMINISTRADOR" : "CLIENTE"}</Text>
              </View>
            </View>

            <View style={estilos.seccion}>
              <Text style={estilos.tituloSeccion} accessibilityRole="header">Mi cuenta</Text>
              <View style={estilos.lista}>
                <Fila primera etiqueta="Nombre completo" valor={usuario.nombre} />
                <Fila etiqueta="Correo" valor={usuario.correo} />
                {esAdministrador && usuario.nombre_salon ? <Fila etiqueta="Salón" valor={usuario.nombre_salon} /> : null}
              </View>
            </View>

            <View style={estilos.seccion}>
              <Text style={estilos.tituloSeccion} accessibilityRole="header">Accesos</Text>
              <View style={estilos.lista}>
                <Fila primera etiqueta={solicitudes.texto} onPress={() => ir(solicitudes.pantalla)} />
                {esAdministrador ? <Fila etiqueta="Publicar mi salón" onPress={() => ir("PublicarSalon")} /> : null}
                <Fila etiqueta="Editar perfil" proximamente />
                <Fila etiqueta="Cambiar contraseña" proximamente />
                <Fila etiqueta="Preferencias" proximamente />
              </View>
            </View>

            <Pressable
              onPress={salir}
              accessibilityRole="button"
              style={({ hovered, focused }) => [estilos.botonSalir, (hovered || focused) && estilos.botonFoco]}
            >
              <Text style={estilos.botonSalirTexto}>Cerrar sesión</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {usuario ? <BarraInferior esAdministrador={esAdministrador} navigation={navigation} /> : null}

      {/* Menú lateral deslizante */}
      {menuAbierto ? (
        <Pressable style={estilos.fondoMenu} onPress={() => setMenuAbierto(false)} accessibilityLabel="Cerrar el menú" />
      ) : null}
      <Animated.View
        style={[estilos.menu, { transform: [{ translateX }] }]}
        pointerEvents={menuAbierto ? "auto" : "none"}
        accessibilityElementsHidden={!menuAbierto}
        importantForAccessibility={menuAbierto ? "auto" : "no-hide-descendants"}
      >
        <View style={estilos.marca}>
          <View style={estilos.marcaIcono}>
            <Image source={LOGO} style={{ width: 16, height: 16 }} accessibilityIgnoresInvertColors />
          </View>
          <Text style={estilos.marcaTexto}>GLAMSPACES</Text>
        </View>

        <View style={estilos.menuLista}>
          {enlacesMenu.map((e) => {
            const activo = e.pantalla === null;
            return (
              <Pressable
                key={e.texto}
                onPress={() => (activo ? setMenuAbierto(false) : ir(e.pantalla))}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                style={({ hovered, focused }) => [
                  estilos.menuItem,
                  activo && estilos.menuItemActivo,
                  !activo && (hovered || focused) && estilos.menuItemFoco,
                ]}
              >
                <Text style={activo ? estilos.menuTextoActivo : estilos.menuTexto}>{e.texto}</Text>
              </Pressable>
            );
          })}
        </View>

        {usuario ? (
          <View style={estilos.menuPie}>
            <Pressable
              onPress={salir}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión desde el menú"
              style={({ hovered, focused }) => [estilos.menuItem, (hovered || focused) && estilos.menuItemFoco]}
            >
              <Text style={estilos.menuSalir}>Cerrar sesión</Text>
            </Pressable>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}
