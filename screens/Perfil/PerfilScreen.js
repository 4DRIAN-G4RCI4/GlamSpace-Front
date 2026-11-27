/**
 * GlamSpaces · Perfil (Sprint 6; ajuste de usabilidad Sprint 7)
 *
 * Datos de la cuenta en sesión, accesos y cerrar sesión, en el lenguaje del Figma "PROYECTO--PWA".
 *  - Escritorio (≥ 1024 px): dos columnas. Tarjeta de identidad (avatar, nombre, correo y rol) y
 *    "Cerrar sesión" a la izquierda; "Mi cuenta" y "Accesos" a la derecha, lado a lado.
 *  - Tablet: la identidad arriba y las dos tarjetas lado a lado.
 *  - Teléfono: una columna y la barra inferior Buscar · Solicitudes · Perfil (Figma Cliente 06 móvil).
 * La navegación es la barra superior compartida (components/BarraNavegacion). Solo se muestran los
 * datos que trae la sesión (la API todavía no tiene un endpoint de perfil).
 *
 *   - PerfilScreen.js  → pantalla (JSX)   [este archivo]
 *   - Perfil.styles.js → estilos
 *   - usePerfil.js     → sesión guardada y cerrar sesión
 */

import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import useFuentesWeb from "../../theme/fuentesWeb";
import { MEDIDA, PWA } from "../../theme/disenoPwa";
import BarraNavegacion from "../../components/BarraNavegacion";
import { esTelefono, inicialesDe } from "../../components/navegacion.logica";
import { estilos } from "./Perfil.styles";
import InvitacionAdmin from "../../components/InvitacionAdmin";
import usePerfil from "./usePerfil";
import { ESCALA_TEXTO, OPCIONES_TEXTO, OPCIONES_ZOOM, ZOOM, cambiarEscalaTexto, cambiarModoOscuro, cambiarZoom, esModoOscuro } from "../../theme/tema";

const ICONOS = {
  buscar: require("../../assets/cliente/icono-buscar.svg"),
  solicitudes: require("../../assets/cliente/icono-solicitudes.svg"),
  perfil: require("../../assets/cliente/icono-perfil.svg"),
};

function Fila({ etiqueta, valor, onPress, proximamente, primera, interruptor }) {
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
      {interruptor !== undefined ? (
        <View style={[estilos.interruptor, interruptor && estilos.interruptorActivo]}>
          <View style={[estilos.interruptorBola, interruptor && estilos.interruptorBolaActiva]} />
        </View>
      ) : proximamente ? (
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
      accessibilityRole={interruptor !== undefined ? "switch" : "link"}
      aria-checked={interruptor}
      style={({ hovered, focused, pressed }) => [estilos.fila, !primera && estilos.filaSeparador, (hovered || focused || pressed) && estilos.filaFoco]}
    >
      {contenido}
    </Pressable>
  );
}

// Fila con opciones de un toque (tamaño de letra, zoom). Elegir una guarda y recarga la app.
function FilaOpciones({ etiqueta, opciones, valor, onCambiar }) {
  return (
    <View style={[estilos.fila, estilos.filaSeparador, estilos.filaOpciones]}>
      <Text style={estilos.filaTexto}>{etiqueta}</Text>
      <View style={estilos.opciones} role="radiogroup" aria-label={etiqueta}>
        {opciones.map((o) => {
          const activa = o.valor === valor;
          return (
            <Pressable
              key={o.valor}
              onPress={() => !activa && onCambiar(o.valor)}
              accessibilityRole="radio"
              aria-checked={activa}
              style={({ hovered, focused }) => [estilos.opcion, activa && estilos.opcionActiva, !activa && (hovered || focused) && estilos.filaFoco]}
            >
              <Text style={activa ? estilos.opcionTextoActiva : estilos.opcionTexto}>{o.etiqueta}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Solo en el teléfono (Figma Cliente 06 móvil). En tablet y escritorio manda la barra superior.
function BarraInferior({ esAdministrador, navigation }) {
  const pestanas = [
    { clave: "buscar", texto: "Buscar", destino: "BusquedaSalones" },
    { clave: "solicitudes", texto: "Solicitudes", destino: esAdministrador ? "PanelAdministrador" : "MisSolicitudes" },
    { clave: "perfil", texto: "Perfil", destino: null },
  ];
  return (
    <View style={estilos.barraInferior} role="navigation" aria-label="Accesos rápidos">
      <View style={estilos.barraInferiorContenido}>
        {pestanas.map((p) => {
          const activa = p.clave === "perfil";
          return (
            <Pressable
              key={p.clave}
              onPress={() => p.destino && navigation.navigate(p.destino)}
              accessibilityRole="link"
              aria-current={activa ? "page" : undefined}
              accessibilityLabel={p.texto}
              style={estilos.pestana}
            >
              {/* Los íconos de Figma vienen en gris; la pestaña activa se pinta en vino */}
              <Image
                source={ICONOS[p.clave]}
                style={{ width: 20, height: 20, tintColor: activa ? PWA.vino : PWA.textoSecundario }}
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
  const [oscuro, setOscuro] = useState(esModoOscuro);
  const alternarOscuro = () => {
    cambiarModoOscuro(!oscuro);
    setOscuro(!oscuro);
  };
  const { width } = useWindowDimensions();
  const telefono = esTelefono(width);
  const escritorio = width >= MEDIDA.corteEscritorio;
  const esAdministrador = !!usuario && usuario.tipo_cuenta === "administrador";
  const ir = (pantalla, params) => navigation.navigate(pantalla, params);

  const salir = async () => {
    await cerrarSesion();
    navigation.navigate("Login");
  };

  const solicitudes = esAdministrador
    ? { texto: "Panel de solicitudes", pantalla: "PanelAdministrador" }
    : { texto: "Mis solicitudes", pantalla: "MisSolicitudes" };

  let cuerpo = null;
  if (!cargando && !usuario) {
    cuerpo = (
      <View style={estilos.sinSesion}>
        <Text style={estilos.sinSesionTitulo} accessibilityRole="header" aria-level={1}>Aún no has iniciado sesión</Text>
        <Text style={estilos.sinSesionTexto}>Inicia sesión para ver tu perfil, tus solicitudes y tus datos.</Text>
        <Pressable
          onPress={() => ir("Login", { volverA: { nombre: "Perfil", params: {} } })}
          accessibilityRole="button"
          style={({ hovered, focused }) => [estilos.botonPrincipal, (hovered || focused) && estilos.botonFoco]}
        >
          <Text style={estilos.botonPrincipalTexto}>Iniciar sesión</Text>
        </Pressable>
      </View>
    );
  } else if (usuario) {
    const identidad = (
      <View style={estilos.tarjetaCuenta}>
        {usuario.avatar ? (
          <Image source={{ uri: usuario.avatar }} style={estilos.avatarImagen} />
        ) : (
          <View style={estilos.avatar}>
            <Text style={estilos.avatarTexto}>{inicialesDe(usuario.nombre)}</Text>
          </View>
        )}
        <Text style={estilos.nombre} accessibilityRole="header" aria-level={1}>{usuario.nombre}</Text>
        <Text style={estilos.correo}>{usuario.correo}</Text>
        <View style={estilos.rol}>
          <Text style={estilos.rolTexto}>{esAdministrador ? "ADMINISTRADOR" : "CLIENTE"}</Text>
        </View>
      </View>
    );

    const botonSalir = (
      <Pressable
        onPress={salir}
        accessibilityRole="button"
        style={({ hovered, focused }) => [estilos.botonSalir, (hovered || focused) && estilos.botonFoco]}
      >
        <Text style={estilos.botonSalirTexto}>Cerrar sesión</Text>
      </Pressable>
    );

    const miCuenta = (
      <View style={[estilos.seccion, !telefono && estilos.mitad]}>
        <Text style={estilos.tituloSeccion} accessibilityRole="header" aria-level={2}>Mi cuenta</Text>
        <View style={estilos.lista}>
          <Fila primera etiqueta="Nombre completo" valor={usuario.nombre} />
          <Fila etiqueta="Correo" valor={usuario.correo} />
          <Fila etiqueta="Tipo de cuenta" valor={esAdministrador ? "Administrador de salón" : "Cliente"} />
          {esAdministrador && usuario.nombre_salon ? <Fila etiqueta="Salón" valor={usuario.nombre_salon} /> : null}
        </View>
      </View>
    );

    const accesos = (
      <View style={[estilos.seccion, !telefono && estilos.mitad]}>
        <Text style={estilos.tituloSeccion} accessibilityRole="header" aria-level={2}>Accesos</Text>
        <View style={estilos.lista}>
          <Fila primera etiqueta="Buscar salones" onPress={() => ir("BusquedaSalones")} />
          <Fila etiqueta={solicitudes.texto} onPress={() => ir(solicitudes.pantalla)} />
          {esAdministrador ? <Fila etiqueta="Mis salones y fotos" onPress={() => ir("MisSalones")} /> : null}
          <Fila etiqueta="Editar perfil" proximamente />
          <Fila etiqueta="Cambiar contraseña" proximamente />
        </View>
      </View>
    );

    const personalizar = (
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion} accessibilityRole="header" aria-level={2}>Personalizar</Text>
        <View style={estilos.lista}>
          <Fila primera etiqueta="Modo oscuro" interruptor={oscuro} onPress={alternarOscuro} />
          <FilaOpciones etiqueta="Tamaño de letra" opciones={OPCIONES_TEXTO} valor={ESCALA_TEXTO} onCambiar={cambiarEscalaTexto} />
          <FilaOpciones etiqueta="Zoom de pantalla" opciones={OPCIONES_ZOOM} valor={ZOOM} onCambiar={cambiarZoom} />
        </View>
      </View>
    );

    const secciones = (
      <View style={estilos.rejillaSecciones}>
        <View style={telefono ? estilos.rejillaSecciones : estilos.rejillaDos}>{miCuenta}{accesos}</View>
        {personalizar}
      </View>
    );

    cuerpo = escritorio ? (
      <>
      <InvitacionAdmin sesion={usuario} navigation={navigation} />
      <View style={estilos.columnas}>
        <View style={estilos.columnaIdentidad}>
          {identidad}
          {botonSalir}
        </View>
        <View style={estilos.columnaSecciones}>{secciones}</View>
      </View>
      </>
    ) : (
      <View style={estilos.apilado}>
        <InvitacionAdmin sesion={usuario} navigation={navigation} />
        {identidad}
        {secciones}
        {botonSalir}
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <BarraNavegacion navigation={navigation} pantalla="Perfil" volverA={{ nombre: "Perfil", params: {} }} />
      <ScrollView style={estilos.cuerpo} contentContainerStyle={[estilos.contenido, !telefono && estilos.contenidoAncho]}>
        {cuerpo}
      </ScrollView>
      {telefono && usuario ? <BarraInferior esAdministrador={esAdministrador} navigation={navigation} /> : null}
    </View>
  );
}
