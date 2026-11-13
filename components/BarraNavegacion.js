/**
 * GlamSpaces · Barra superior de navegación (ajuste de usabilidad, HU-19 / navegación).
 * Figma PROYECTO--PWA, Cliente 01/02/06: marca, accesos principales y cuenta.
 *
 *  - Escritorio y tablet (≥ 768 px): enlaces visibles; el activo en vino con aria-current; avatar
 *    con menú de usuario (Mi perfil · Cerrar sesión). Sin sesión: Iniciar sesión · Registra tu salón.
 *  - Teléfono (< 768 px): marca y menú hamburguesa con los mismos accesos (opciones de 48 px).
 *
 * Cada pantalla la pone FUERA de su ScrollView, así queda fija arriba y nunca tapa el contenido
 * ni se encima con la tarjeta fija del detalle o los avisos. Es un landmark <nav>.
 *
 * `pantalla`: nombre de la pantalla actual (marca el acceso activo).
 * `migas`: [{ texto, onPress? }] de la ruta (detalle y reserva); la última es la página actual.
 * `volverA`: a dónde regresa el login al entrar.
 */

import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View, useWindowDimensions } from "react-native";
import Marca from "./Marca";
import { cerrarSesion, obtenerSesionActiva } from "../services/sesionStorage";
import { accesosPara, claveActiva, esTelefono, inicialesDe } from "./navegacion.logica";
import { estilos } from "./BarraNavegacion.styles";

const ES_WEB = Platform.OS === "web" && typeof document !== "undefined";

function Migas({ migas }) {
  return (
    <View style={estilos.migas} role="navigation" aria-label="Ruta">
      {migas.map((m, i) => {
        const ultima = i === migas.length - 1;
        return (
          <View key={m.texto + i} style={estilos.miga}>
            {ultima || !m.onPress ? (
              <Text style={[estilos.migaTexto, ultima && estilos.migaActual]} numberOfLines={1} aria-current={ultima ? "page" : undefined}>
                {m.texto}
              </Text>
            ) : (
              <Pressable onPress={m.onPress} accessibilityRole="link" style={({ hovered, focused }) => [(hovered || focused) && estilos.migaFoco]}>
                <Text style={estilos.migaTexto}>{m.texto}</Text>
              </Pressable>
            )}
            {ultima ? null : <Text style={estilos.migaSeparador}>/</Text>}
          </View>
        );
      })}
    </View>
  );
}

export default function BarraNavegacion({ navigation, pantalla, migas = [], volverA }) {
  const { width } = useWindowDimensions();
  const telefono = esTelefono(width);
  const [sesion, setSesion] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false); // hamburguesa (teléfono)
  const [menuUsuario, setMenuUsuario] = useState(false); // avatar (escritorio)
  const primeraOpcion = useRef(null);
  const barra = useRef(null);

  useEffect(() => {
    void obtenerSesionActiva().then(setSesion);
  }, []);

  // Esc cierra cualquiera de los dos menús.
  useEffect(() => {
    if (!ES_WEB || (!menuAbierto && !menuUsuario)) return undefined;
    const alTeclear = (e) => {
      if (e.key === "Escape") {
        setMenuAbierto(false);
        setMenuUsuario(false);
      }
    };
    // Un clic fuera de la barra también cierra el menú.
    const alTocarFuera = (e) => {
      if (barra.current && barra.current.contains && !barra.current.contains(e.target)) {
        setMenuAbierto(false);
        setMenuUsuario(false);
      }
    };
    document.addEventListener("keydown", alTeclear);
    document.addEventListener("mousedown", alTocarFuera);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("mousedown", alTocarFuera);
    };
  }, [menuAbierto, menuUsuario]);

  // Al abrir el menú del teléfono, el foco pasa a la primera opción.
  useEffect(() => {
    if (menuAbierto && primeraOpcion.current && primeraOpcion.current.focus) primeraOpcion.current.focus();
  }, [menuAbierto]);

  // Si se pasa de teléfono a escritorio con el menú abierto, se cierra.
  useEffect(() => {
    if (!telefono) setMenuAbierto(false);
  }, [telefono]);

  const accesos = accesosPara(sesion);
  const activa = claveActiva(pantalla);
  const ir = (destino, params) => {
    setMenuAbierto(false);
    setMenuUsuario(false);
    if (navigation) navigation.navigate(destino, params || {});
  };
  const salir = async () => {
    setMenuAbierto(false);
    setMenuUsuario(false);
    await cerrarSesion();
    setSesion(null);
    if (navigation) navigation.navigate("Login");
  };
  const iniciarSesion = () => ir("Login", volverA ? { volverA } : {});
  const esAdmin = !!sesion && sesion.tipo_cuenta === "administrador";

  const marca = (
    <Pressable onPress={() => ir("BusquedaSalones")} accessibilityRole="link" accessibilityLabel="GlamSpaces, ir al inicio"
      style={({ focused }) => [focused && estilos.foco]}>
      <Marca compacta />
    </Pressable>
  );

  let fila;
  if (telefono) {
    fila = (
      <View style={estilos.fila}>
        {marca}
        <Pressable
          onPress={() => setMenuAbierto(!menuAbierto)}
          accessibilityRole="button"
          accessibilityLabel={menuAbierto ? "Cerrar el menú" : "Abrir el menú"}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          style={({ hovered, focused }) => [estilos.hamburguesa, hovered && estilos.hover, focused && estilos.foco]}
        >
          <View style={estilos.raya} />
          <View style={estilos.raya} />
          <View style={estilos.raya} />
        </Pressable>
      </View>
    );
  } else {
    fila = (
      <View style={estilos.fila}>
        {marca}
        <View style={estilos.enlaces}>
          {accesos.filter((a) => a.clave !== "perfil").map((a) => {
            const esActiva = a.clave === activa;
            return (
              <Pressable
                key={a.clave}
                onPress={() => ir(a.destino, a.params)}
                accessibilityRole="link"
                aria-current={esActiva ? "page" : undefined}
                style={({ hovered, focused }) => [estilos.enlace, esActiva && estilos.enlaceActivo, hovered && estilos.hover, focused && estilos.foco]}
              >
                <Text style={esActiva ? estilos.enlaceTextoActivo : estilos.enlaceTexto}>{a.texto}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={estilos.derecha}>
          {sesion ? (
            <Pressable
              onPress={() => setMenuUsuario(!menuUsuario)}
              accessibilityRole="button"
              accessibilityLabel={`Menú de ${sesion.nombre}`}
              aria-expanded={menuUsuario}
              aria-controls="menu-usuario"
              style={({ hovered, focused }) => [estilos.avatar, activa === "perfil" && estilos.avatarActivo, hovered && estilos.hover, focused && estilos.foco]}
            >
              <Text style={estilos.avatarTexto}>{inicialesDe(sesion.nombre)}</Text>
            </Pressable>
          ) : (
            <>
              <Pressable onPress={iniciarSesion} accessibilityRole="button" style={({ hovered, focused }) => [estilos.botonCuenta, hovered && estilos.hover, focused && estilos.foco]}>
                <Text style={estilos.botonCuentaTexto}>Iniciar sesión</Text>
              </Pressable>
              <Pressable onPress={() => ir("RegistroAdministrador")} accessibilityRole="button" style={({ hovered, focused }) => [estilos.botonRegistro, hovered && estilos.hover, focused && estilos.foco]}>
                <Text style={estilos.botonRegistroTexto}>Registra tu salón</Text>
              </Pressable>
            </>
          )}
        </View>
        {sesion && menuUsuario ? (
          <View style={estilos.menuUsuario} nativeID="menu-usuario" role="menu">
            <Text style={estilos.menuUsuarioNombre} numberOfLines={1}>{sesion.nombre}</Text>
            <Text style={estilos.menuUsuarioRol}>{esAdmin ? "Administrador" : "Cliente"}</Text>
            <View style={estilos.separador} />
            <Pressable onPress={() => ir("Perfil")} role="menuitem" aria-current={activa === "perfil" ? "page" : undefined}
              style={({ hovered, focused }) => [estilos.opcion, activa === "perfil" && estilos.opcionActiva, hovered && estilos.hover, focused && estilos.foco]}>
              <Text style={activa === "perfil" ? estilos.opcionTextoActiva : estilos.opcionTexto}>Mi perfil</Text>
            </Pressable>
            <Pressable onPress={salir} role="menuitem" style={({ hovered, focused }) => [estilos.opcion, hovered && estilos.hover, focused && estilos.foco]}>
              <Text style={estilos.opcionSalir}>Cerrar sesión</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View ref={barra} style={estilos.barra} role="navigation" aria-label="Principal">
      {fila}
      {migas.length > 0 ? <View style={estilos.renglonMigas}><Migas migas={migas} /></View> : null}
      {telefono && menuAbierto ? (
        <View style={estilos.panel} nativeID="menu-principal">
          {accesos.map((a, i) => {
            const esActiva = a.clave === activa;
            return (
              <Pressable
                key={a.clave}
                ref={i === 0 ? primeraOpcion : undefined}
                onPress={() => ir(a.destino, a.params)}
                accessibilityRole="link"
                aria-current={esActiva ? "page" : undefined}
                style={({ hovered, focused }) => [estilos.opcion, esActiva && estilos.opcionActiva, hovered && estilos.hover, focused && estilos.foco]}
              >
                <Text style={esActiva ? estilos.opcionTextoActiva : estilos.opcionTexto}>{a.texto}</Text>
              </Pressable>
            );
          })}
          <View style={estilos.separador} />
          {sesion ? (
            <Pressable onPress={salir} accessibilityRole="button" style={({ hovered, focused }) => [estilos.opcion, hovered && estilos.hover, focused && estilos.foco]}>
              <Text style={estilos.opcionSalir}>Cerrar sesión</Text>
            </Pressable>
          ) : (
            <View style={estilos.panelBotones}>
              <Pressable onPress={iniciarSesion} accessibilityRole="button" style={({ focused }) => [estilos.botonCuenta, { flex: 1, alignItems: "center" }, focused && estilos.foco]}>
                <Text style={estilos.botonCuentaTexto}>Iniciar sesión</Text>
              </Pressable>
              <Pressable onPress={() => ir("RegistroAdministrador")} accessibilityRole="button" style={({ focused }) => [estilos.botonRegistro, { flex: 1, alignItems: "center" }, focused && estilos.foco]}>
                <Text style={estilos.botonRegistroTexto}>Registra tu salón</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
