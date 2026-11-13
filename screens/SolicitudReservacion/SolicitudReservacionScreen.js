/**
 * GlamSpaces · Solicitud de reservación (HU-16, diseño Figma PROYECTO--PWA)
 *
 * Llega desde el detalle del salón con lo que el cliente ya eligió (fecha, paquete, invitados).
 *   paso "elegir"     → Cliente 04 · Solicitar reservación (PasoElegir.js)
 *   paso "confirmar"  → Cliente 05 · Confirmar datos de contacto (PasoConfirmar.js)
 *   paso "enviada"    → confirmación con el estado de la solicitud
 *
 *   - SolicitudReservacionScreen.js          → pantalla (JSX)   [este archivo]
 *   - PasoElegir.js · PasoConfirmar.js        → cada paso
 *   - ResumenReserva.js                       → tarjeta de resumen
 *   - SolicitudReservacion.styles.js          → estilos
 *   - useSolicitudReservacion.js              → lógica / estado
 *   - solicitudReservacion.validaciones.js    → reglas de validación
 *   - ../../services/solicitudes.logica.js    → armado del envío y mensajes de error
 */

import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import TarjetaSolicitud from "../../components/TarjetaSolicitud";
import { COLORES } from "../../theme/colores";
import useSolicitudReservacion from "./useSolicitudReservacion";
import PasoElegir from "./PasoElegir";
import PasoConfirmar from "./PasoConfirmar";
import { estilos } from "./SolicitudReservacion.styles";

function Boton({ texto, onPress, secundario }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ hovered, focused }) => [
        secundario ? estilos.botonSecundarioPaso : estilos.botonPrincipal,
        (hovered || focused) && (secundario ? estilos.botonSecundarioPasoFoco : estilos.botonPrincipalFoco),
      ]}
    >
      <Text style={secundario ? estilos.botonSecundarioPasoTexto : estilos.botonPrincipalTexto}>{texto}</Text>
    </Pressable>
  );
}

// La solicitud quedó registrada: resumen con su estado y el camino a "Mis solicitudes".
function Confirmacion({ solicitud, ir }) {
  return (
    <View style={estilos.confirmacion}>
      <Text style={estilos.confirmacionIcono} accessibilityElementsHidden importantForAccessibility="no">
        ✓
      </Text>
      <Text style={[estilos.tituloPaso, estilos.centrado]} accessibilityRole="header" aria-level={1} accessibilityLiveRegion="polite">
        ¡Solicitud enviada!
      </Text>
      <Text style={[estilos.textoSecundario, estilos.centrado, estilos.confirmacionTexto]}>
        El salón responde en menos de 24 hrs. Consulta el estado cuando quieras en "Mis solicitudes".
      </Text>
      <TarjetaSolicitud solicitud={solicitud} />
      <Boton texto="Ver mis solicitudes" onPress={() => ir("MisSolicitudes")} />
      <Boton texto="Seguir buscando salones" onPress={() => ir("BusquedaSalones")} secundario />
    </View>
  );
}

export default function SolicitudReservacionScreen({ navigation, route }) {
  const params = (route && route.params) || {};
  const f = useSolicitudReservacion(params, navigation);
  const ir = (nombre, p) => navigation && navigation.navigate(nombre, p);

  const nombreSalon = f.salon ? f.salon.nombre : "Salón";
  const migas = [
    { texto: "Inicio", onPress: () => ir("BusquedaSalones") },
    { texto: "Salones", onPress: () => ir("BusquedaSalones") },
    { texto: nombreSalon, onPress: () => ir("DetalleSalon", { salonId: f.salonId }) },
    { texto: { elegir: "Reservar", confirmar: "Confirmar", enviada: "Enviada" }[f.paso] || "Reservar" },
  ];

  let contenido;
  if (f.cargando) {
    contenido = <ActivityIndicator color={COLORES.morado} size="large" style={estilos.cargando} accessibilityLabel="Cargando" />;
  } else if (f.paso === "enviada" && f.enviada) {
    contenido = <Confirmacion solicitud={f.enviada} ir={ir} />;
  } else if (f.errorSalon || !f.salon) {
    contenido = (
      <View style={estilos.confirmacion}>
        <Text style={[estilos.tituloPaso, estilos.centrado]}>No se pudo cargar el salón</Text>
        <Text style={[estilos.textoSecundario, estilos.centrado]}>{f.errorSalon || "El salón no existe."}</Text>
        <Boton texto="Reintentar" onPress={f.reintentarSalon} />
        <Boton texto="Volver a la búsqueda" onPress={() => ir("BusquedaSalones")} secundario />
      </View>
    );
  } else if (f.paso === "confirmar") {
    contenido = <PasoConfirmar f={f} ir={ir} />;
  } else {
    contenido = <PasoElegir f={f} />;
  }

  return (
    <KeyboardAvoidingView style={estilos.raiz} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <BarraNavegacion
          navigation={navigation}
          pantalla="SolicitudReservacion"
          migas={migas}
          volverA={{ nombre: "SolicitudReservacion", params: { salonId: f.salonId, paso: f.paso === "enviada" ? "elegir" : f.paso, borrador: { fecha: f.fecha, paqueteId: f.paqueteId, invitados: f.invitados, tipoEvento: f.tipoEvento, telefono: f.telefono, comentarios: f.comentarios } } }}
        />
      <ScrollView style={estilos.raiz} contentContainerStyle={estilos.pantalla} keyboardShouldPersistTaps="handled">
        <View style={estilos.contenido}>{contenido}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
