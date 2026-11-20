/**
 * GlamSpaces · Navegación del panel de administrador (Figma PROYECTO--PWA: Admin 02, 04 y 05).
 * Escritorio: barra lateral oscura. Móvil: encabezado oscuro con pestañas.
 * La usan el Panel de solicitudes (HU-19) y Mi salón (Publicar salón).
 *
 * Junto a la cuenta van dos íconos: "Cambiar a cliente" (lleva a Buscar salones, donde ve la app
 * como cliente) y "Cerrar sesión" (pide confirmar antes de salir).
 */

import React, { useState } from "react";
import { Image, Pressable, Text, View, useWindowDimensions } from "react-native";
import { MEDIDA } from "../../theme/disenoPwa";
import { iniciales } from "./panelAdministrador.logica";
import { inicialesDe } from "../../components/navegacion.logica";
import { estilos } from "./PanelAdministrador.styles";
import DialogoConfirmacion from "../../components/DialogoConfirmacion";
import { cerrarSesion } from "../../services/sesionStorage";

const LOGO = require("../../assets/admin/logo-destello.svg");
const ICONO_CAMBIAR = require("../../assets/admin/icono-cambiar.svg");
const ICONO_SALIR = require("../../assets/admin/icono-salir.svg");

// Ícono de 40 px (objetivo táctil) sobre fondo oscuro, con fondo tenue al pasar el puntero.
function IconoCuenta({ fuente, etiqueta, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ hovered, focused, pressed }) => [estilos.iconoCuenta, (hovered || focused || pressed) && estilos.navEnlaceFoco]}
    >
      <Image source={fuente} style={{ width: 19, height: 19 }} accessibilityIgnoresInvertColors />
    </Pressable>
  );
}

function IconosCuenta({ onCambiar, onSalir }) {
  return (
    <View style={estilos.iconosCuenta}>
      <IconoCuenta fuente={ICONO_CAMBIAR} etiqueta="Cambiar a cliente: buscar salones" onPress={onCambiar} />
      <IconoCuenta fuente={ICONO_SALIR} etiqueta="Cerrar sesión" onPress={onSalir} />
    </View>
  );
}

export const SECCIONES = [
  { clave: "solicitudes", texto: "Solicitudes" },
  { clave: "calendario", texto: "Calendario" },
  { clave: "salon", texto: "Mis salones" },
];

function BarraLateral({ pestana, onElegir, nombreAdmin, onCuenta, onCambiar, onSalir }) {
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

      <View style={estilos.pieLateral}>
        <Pressable
          onPress={onCuenta}
          accessibilityRole="button"
          accessibilityLabel="Ver mi cuenta"
          style={({ hovered, focused }) => [estilos.pieCuenta, (hovered || focused) && { opacity: 0.85 }]}
        >
          <View style={estilos.avatar}>
            <Text style={estilos.avatarTexto}>{inicialesDe(nombreAdmin)}</Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            {/* El pie identifica a la PERSONA que entró, nunca el título de la pantalla. */}
            <Text style={estilos.pieNombre} numberOfLines={1}>{nombreAdmin || "Mi cuenta"}</Text>
            <Text style={estilos.pieRol}>Administrador</Text>
          </View>
        </Pressable>
        <IconosCuenta onCambiar={onCambiar} onSalir={onSalir} />
      </View>
    </View>
  );
}

function EncabezadoMovil({ pestana, onElegir, nombreSalon, nombreAdmin, onCuenta, onCambiar, onSalir }) {
  return (
    <View>
      <View style={estilos.encabezadoMovil}>
        <View>
          <Text style={estilos.encabezadoNombre}>{nombreSalon}</Text>
          <Text style={estilos.encabezadoRol}>Panel de administrador</Text>
        </View>
        <View style={estilos.iconosCuenta}>
          <IconosCuenta onCambiar={onCambiar} onSalir={onSalir} />
          <Pressable onPress={onCuenta} accessibilityRole="button" accessibilityLabel="Ver mi cuenta" style={estilos.avatarMovil}>
            <Text style={estilos.avatarMovilTexto}>{inicialesDe(nombreAdmin)}</Text>
          </Pressable>
        </View>
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
export default function LayoutAdmin({ seccion, onElegir, nombreSalon, nombreAdmin, onCuenta, navigation, children }) {
  const { width } = useWindowDimensions();
  const movil = width < MEDIDA.corteEscritorio;
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  const cuenta = {
    nombreSalon,
    nombreAdmin,
    onCuenta,
    onCambiar: () => navigation && navigation.navigate("BusquedaSalones"),
    onSalir: () => setConfirmarSalida(true),
  };
  const salir = async () => {
    setConfirmarSalida(false);
    await cerrarSesion();
    if (navigation) navigation.navigate("Login");
  };

  return (
    <>
      {movil ? (
        <View style={estilos.pantalla}>
          <EncabezadoMovil pestana={seccion} onElegir={onElegir} {...cuenta} />
          {children}
        </View>
      ) : (
        <View style={estilos.fila}>
          <BarraLateral pestana={seccion} onElegir={onElegir} {...cuenta} />
          <View style={{ flex: 1 }}>{children}</View>
        </View>
      )}
      <DialogoConfirmacion
        visible={confirmarSalida}
        titulo="¿Cerrar sesión?"
        mensaje="Saldrás de tu cuenta en este dispositivo. Para volver tendrás que iniciar sesión otra vez."
        textoConfirmar="Sí, cerrar sesión"
        destructiva
        onConfirmar={salir}
        onCancelar={() => setConfirmarSalida(false)}
      />
    </>
  );
}
