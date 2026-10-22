/**
 * GlamSpaces · Solicitud de reservación (destino de HU-13, criterio 3)
 *
 * Llega desde el detalle del salón con la fecha elegida en el calendario ya precargada.
 * "Cambiar fecha" regresa al calendario. El envío se conecta cuando la API tenga el
 * endpoint para crear reservaciones (la tabla ya existe, HU-11).
 *
 *   - SolicitudReservacionScreen.js   → pantalla (JSX)   [este archivo]
 *   - SolicitudReservacion.styles.js  → estilos
 *   - useSolicitudReservacion.js      → lógica / estado
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { formatearPrecio } from "../../utils/formato";
import { formatearFechaLarga } from "../../utils/fechas";
import useSolicitudReservacion from "./useSolicitudReservacion";
import { estilos } from "./SolicitudReservacion.styles";

export default function SolicitudReservacionScreen({ navigation, route }) {
  const f = useSolicitudReservacion(route && route.params);
  const volverAlCalendario = () => navigation && navigation.navigate("DetalleSalon", { salonId: f.salonId });

  return (
    <ScrollView contentContainerStyle={estilos.pagina}>
      <View style={estilos.contenedor}>
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Solicitud de reservación
          </Text>
          <Text style={estilos.subtitulo}>{f.nombreSalon}</Text>

          <Text style={estilos.etiqueta}>Fecha del evento</Text>
          <View style={estilos.fecha}>
            <Text style={estilos.fechaTexto}>{f.fecha ? formatearFechaLarga(f.fecha) : "Sin fecha"}</Text>
            <Pressable onPress={volverAlCalendario} accessibilityRole="button" accessibilityLabel="Cambiar fecha">
              <Text style={estilos.enlaceResaltado}>Cambiar</Text>
            </Pressable>
          </View>

          {f.paquetes.length > 0 ? (
            <>
              <Text style={estilos.etiqueta}>Paquete (opcional)</Text>
              {f.paquetes.map((p) => {
                const activo = p.id === f.paqueteId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => f.elegirPaquete(activo ? null : p.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: activo }}
                    style={[estilos.opcion, activo && estilos.opcionActiva]}
                  >
                    <View style={[estilos.checkbox, activo && estilos.checkboxActivo]}>
                      {activo ? <Text style={estilos.checkboxMarca}>✓</Text> : null}
                    </View>
                    <Text style={estilos.opcionTexto}>{p.nombrePaquete}</Text>
                    <Text style={estilos.opcionPrecio}>{formatearPrecio(p.precio)}</Text>
                  </Pressable>
                );
              })}
            </>
          ) : null}

          <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} style={[estilos.boton, estilos.botonDeshabilitado]}>
            <Text style={estilos.botonTexto}>Enviar solicitud</Text>
          </Pressable>
        </View>
      </View>
      <Text style={estilos.pie}>Solicitud de reservación · GlamSpaces</Text>
    </ScrollView>
  );
}
