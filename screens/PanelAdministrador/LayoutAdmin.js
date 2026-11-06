/**
 * GlamSpaces · Navegación del panel de administrador (Figma PROYECTO--PWA: Admin 02, 04 y 05).
 * Escritorio: barra lateral oscura. Móvil: encabezado oscuro con pestañas.
 * La usan el Panel de solicitudes (HU-19) y Mi salón (Publicar salón).
 */

import React from "react";
import { Image, Pressable, Text, View, useWindowDimensions } from "react-native";
import { MEDIDA } from "../../theme/disenoPwa";
import { iniciales } from "./panelAdministrador.logica";
import { estilos } from "./PanelAdministrador.styles";

const LOGO = require("../../assets/admin/logo-destello.svg");

export const SECCIONES = [
  { clave: "solicitudes", texto: "Solicitudes" },
  { clave: "calendario", texto: "Calendario" },
  { clave: "salon", texto: "Mi salón" },
];

function BarraLateral({ pestana, onElegir, nombreSalon, onCuenta }) {
  return (
    <View style={estilos.barraLateral}>
      <View style={estilos.marca}>
        <View style={estilos.marcaIcono}>
          <Image source={LOGO} style={{ width: 16, height: 16 }} accessibilityIgnoresInvertColors />
        </View>
        <Text style={estilos.marcaTexto}>GLAMSPACES</Text>
      </View>

      <View style={estilos.nav} accessibilityRole="menu">
        {SECCIONES.map((s) => {
          const activa = s.clave === pestana;
          return (
            <Pressable
              key={s.clave}
              onPress={() => onElegir(s.clave)}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: activa }}
              style={({ hovered, focused }) => [
                estilos.navEnlace,
                activa && estilos.navEnlaceActivo,
                !activa && (hovered || focused) && estilos.navEnlaceFoco,
              ]}
            >
              <Text style={activa ? estilos.navTextoActivo : estilos.navTexto}>{s.texto}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onCuenta}
        accessibilityRole="button"
        accessibilityLabel="Ver mi cuenta y cerrar sesión"
        style={({ hovered, focused }) => [estilos.pieLateral, (hovered || focused) && { opacity: 0.85 }]}
      >
        <View style={estilos.avatar}>
          <Text style={estilos.avatarTexto}>{iniciales(nombreSalon)}</Text>
        </View>
        <View>
          <Text style={estilos.pieNombre} numberOfLines={1}>{nombreSalon}</Text>
          <Text style={estilos.pieRol}>Administrador</Text>
        </View>
      </Pressable>
    </View>
  );
}

function EncabezadoMovil({ pestana, onElegir, nombreSalon, onCuenta }) {
  return (
    <View>
      <View style={estilos.encabezadoMovil}>
        <View>
          <Text style={estilos.encabezadoNombre}>{nombreSalon}</Text>
          <Text style={estilos.encabezadoRol}>Panel de administrador</Text>
        </View>
        <Pressable onPress={onCuenta} accessibilityRole="button" accessibilityLabel="Ver mi cuenta y cerrar sesión" style={estilos.avatarMovil}>
          <Text style={estilos.avatarMovilTexto}>{iniciales(nombreSalon)}</Text>
        </Pressable>
      </View>
      <View style={estilos.pestanas} accessibilityRole="tablist">
        {SECCIONES.map((s) => {
          const activa = s.clave === pestana;
          return (
            <Pressable
              key={s.clave}
              onPress={() => onElegir(s.clave)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              style={[estilos.pestana, activa && estilos.pestanaActiva]}
            >
              <Text style={activa ? estilos.pestanaTextoActiva : estilos.pestanaTexto}>{s.texto}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}


// Pantalla del administrador con su navegación. `seccion`: "solicitudes" | "calendario" | "salon".
export default function LayoutAdmin({ seccion, onElegir, nombreSalon, onCuenta, children }) {
  const { width } = useWindowDimensions();
  const movil = width < MEDIDA.corteEscritorio;
  return movil ? (
    <View style={estilos.pantalla}>
      <EncabezadoMovil pestana={seccion} onElegir={onElegir} nombreSalon={nombreSalon} onCuenta={onCuenta} />
      {children}
    </View>
  ) : (
    <View style={estilos.fila}>
      <BarraLateral pestana={seccion} onElegir={onElegir} nombreSalon={nombreSalon} onCuenta={onCuenta} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
