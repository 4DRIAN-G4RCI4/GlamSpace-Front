/**
 * GlamSpaces · HU-16 · Paso 2 de la reserva (Figma "Desktop — Cliente 05 · Confirmar datos de
 * contacto"): resumen de la solicitud, datos de contacto prellenados de la sesión, términos y
 * "Enviar solicitud". Sin sesión pide entrar (y regresa aquí con lo elegido). Solo presentación.
 */

import React from "react";
import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import Campo from "../../components/Campo";
import BannerSinConexion from "../PanelAdministrador/BannerSinConexion";
import ResumenReserva from "./ResumenReserva";
import { formatearFechaLarga } from "../../utils/fechas";
import { COLORES } from "../../theme/colores";
import { estilos } from "./SolicitudReservacion.styles";

function BotonSecundario({ texto, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ hovered, focused }) => [estilos.botonSecundarioPaso, (hovered || focused) && estilos.botonSecundarioPasoFoco]}
    >
      <Text style={estilos.botonSecundarioPasoTexto}>{texto}</Text>
    </Pressable>
  );
}

// Error de la API con el siguiente paso sugerido (otra fecha, otro paquete, mis solicitudes, entrar).
function ErrorEnvio({ error, f, ir }) {
  const acciones = {
    fecha: { texto: "Elegir otra fecha", onPress: f.volverAElegir },
    paquete: { texto: "Elegir otro paquete", onPress: f.volverAElegir },
    misSolicitudes: { texto: "Ver mis solicitudes", onPress: () => ir("MisSolicitudes") },
    sesion: { texto: "Iniciar sesión", onPress: f.iniciarSesion },
  };
  const accion = acciones[error.accion];
  return (
    <View style={estilos.errorEnvio} accessibilityLiveRegion="assertive" role="alert">
      <Text style={estilos.errorEnvioTexto}>{error.texto}</Text>
      {accion ? <BotonSecundario texto={accion.texto} onPress={accion.onPress} /> : null}
    </View>
  );
}

function AvisoSesion({ f, onVolver }) {
  const esAdministrador = !!f.sesion && f.sesion.tipo_cuenta === "administrador";
  return (
    <View style={estilos.contacto}>
      <Text style={estilos.contactoTitulo} accessibilityRole="header" aria-level={2}>
        {esAdministrador ? "Necesitas una cuenta de cliente" : "Inicia sesión para continuar"}
      </Text>
      <Text style={estilos.textoSecundario}>
        {esAdministrador
          ? "Las solicitudes de reservación solo se envían con una cuenta de cliente."
          : "Al entrar regresas aquí con la fecha, el paquete y los detalles que ya elegiste."}
      </Text>
      {esAdministrador ? null : (
        <Pressable onPress={f.iniciarSesion} accessibilityRole="button" style={({ hovered, focused }) => [estilos.botonPrincipal, (hovered || focused) && estilos.botonPrincipalFoco]}>
          <Text style={estilos.botonPrincipalTexto}>Iniciar sesión</Text>
        </Pressable>
      )}
      <BotonSecundario texto="← Cambiar detalles" onPress={onVolver} />
    </View>
  );
}

export default function PasoConfirmar({ f, ir }) {
  const { width } = useWindowDimensions();
  const lado = width >= 760;

  const resumen = (
    <ResumenReserva
      titulo="Resumen de tu solicitud"
      filas={[
        { etiqueta: "Salón", valor: f.salon.nombre },
        { etiqueta: "Fecha", valor: f.fecha ? formatearFechaLarga(f.fecha) : null },
        { etiqueta: "Paquete", valor: f.paqueteElegido ? f.paqueteElegido.nombrePaquete : "Sin paquete" },
        { etiqueta: "Evento", valor: f.tipoEvento || null },
        { etiqueta: "Invitados", valor: f.invitados || null },
      ]}
      total={f.total}
      estilo={estilos.resumenConfirmar}
    />
  );

  return (
    <View style={estilos.confirmarContenedor}>
      <Text style={[estilos.tituloPaso, estilos.centrado]} accessibilityRole="header" aria-level={1}>
        Confirma tus datos
      </Text>

      <BannerSinConexion enLinea={f.enLinea} accion="Para enviar tu solicitud necesitas conexión. Lo que elegiste se conserva." />

      <View style={[estilos.confirmarFila, lado && estilos.confirmarFilaLado]}>
        {resumen}
        {f.esCliente ? (
          <View style={estilos.contacto}>
            <Text style={estilos.contactoTitulo} accessibilityRole="header" aria-level={2}>
              Datos de contacto
            </Text>
            <Campo
              etiqueta="Nombre completo"
              valor={f.nombre}
              onCambiar={f.setNombre}
              onBlur={f.tocar("nombre")}
              placeholder="Ej. María López García"
              error={f.erroresConfirmar.nombre}
              pistaExtra="El salón verá el nombre de tu cuenta."
              autoComplete="name"
            />
            <Campo
              etiqueta="Teléfono"
              valor={f.telefono}
              onCambiar={f.setTelefono}
              onBlur={f.tocar("telefono")}
              placeholder="771 123 4567"
              error={f.erroresConfirmar.telefono}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={16}
            />
            <Campo
              etiqueta="Correo electrónico"
              valor={f.correo}
              onCambiar={f.setCorreo}
              onBlur={f.tocar("correo")}
              placeholder="tucorreo@ejemplo.com"
              error={f.erroresConfirmar.correo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        ) : (
          <AvisoSesion f={f} onVolver={f.volverAElegir} />
        )}
      </View>

      {f.esCliente ? (
        <>
          <Pressable
            onPress={f.alternarTerminos}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: f.terminos }}
            aria-checked={f.terminos}
            style={({ focused }) => [estilos.filaCheckbox, estilos.filaTerminos, focused && estilos.terminosFoco]}
          >
            <View style={[estilos.checkbox, f.terminos && estilos.checkboxActivo]}>
              {f.terminos ? <Text style={estilos.checkboxMarca}>✓</Text> : null}
            </View>
            <Text style={estilos.textoCheckbox}>Acepto los términos y condiciones y el aviso de privacidad de GlamSpaces.</Text>
          </Pressable>
          {f.erroresConfirmar.terminos ? (
            <Text style={[estilos.error, estilos.centrado]} accessibilityLiveRegion="polite">
              {f.erroresConfirmar.terminos}
            </Text>
          ) : null}

          <Pressable
            onPress={f.enviar}
            disabled={!f.puedeEnviar}
            accessibilityRole="button"
            accessibilityState={{ disabled: !f.puedeEnviar, busy: f.enviando }}
            style={({ hovered, focused }) => [
              estilos.botonPrincipal,
              estilos.botonEnviar,
              !f.puedeEnviar && estilos.botonDeshabilitado,
              (hovered || focused) && f.puedeEnviar && estilos.botonPrincipalFoco,
            ]}
          >
            {f.enviando ? <ActivityIndicator color={COLORES.moradoClaro} /> : <Text style={estilos.botonPrincipalTexto}>Enviar solicitud</Text>}
          </Pressable>
          {!f.enviando && f.faltanConfirmar ? (
            <Text style={[estilos.faltan, estilos.centrado]} accessibilityLiveRegion="polite">
              {f.faltanConfirmar}
            </Text>
          ) : null}
          {f.errorEnvio ? <ErrorEnvio error={f.errorEnvio} f={f} ir={ir} /> : null}
          <View style={estilos.centradoFila}>
            <BotonSecundario texto="← Cambiar detalles" onPress={f.volverAElegir} />
          </View>
        </>
      ) : null}
    </View>
  );
}
