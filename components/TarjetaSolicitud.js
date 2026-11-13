/**
 * Resumen de una solicitud de reservación con su estado (HU-16): salón, fecha,
 * tipo de evento, invitados y paquete. Lo usan la confirmación del envío y
 * "Mis solicitudes". Solo presentación; `accion` es un botón opcional al pie y `onVerDetalle`
 * agrega el enlace "Ver detalle →" (Figma Cliente 06).
 */

import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { formatearFechaLarga } from "../utils/fechas";
import { COLORES } from "../theme/colores";
import { estilos } from "./TarjetaSolicitud.styles";

const ESTADOS = {
  pendiente: { texto: "Pendiente", detalle: "El salón todavía no responde." },
  confirmada: { texto: "Confirmada", detalle: "¡El salón confirmó tu fecha!" },
  rechazada: { texto: "Rechazada", detalle: "El salón no pudo aceptar esta solicitud." },
};

export function EstadoSolicitud({ estado }) {
  const info = ESTADOS[estado] || { texto: estado };
  return (
    <View style={[estilos.estado, estilos[`estado_${estado}`]]} accessibilityLabel={`Estado: ${info.texto}`}>
      <Text style={[estilos.estadoTexto, estilos[`estadoTexto_${estado}`]]}>{info.texto}</Text>
    </View>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <View style={estilos.dato}>
      <Text style={estilos.datoEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.datoValor}>{valor}</Text>
    </View>
  );
}

export default function TarjetaSolicitud({ solicitud, accion, onVerDetalle }) {
  const info = ESTADOS[solicitud.estado];
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.encabezado}>
        <Text style={estilos.salon} numberOfLines={2}>
          {solicitud.nombreSalon}
        </Text>
        <EstadoSolicitud estado={solicitud.estado} />
      </View>
      {info ? <Text style={estilos.estadoDetalle}>{info.detalle}</Text> : null}

      <Dato etiqueta="Fecha" valor={formatearFechaLarga(solicitud.fechaEvento)} />
      <Dato etiqueta="Evento" valor={`${solicitud.tipoEvento} · ${solicitud.numeroInvitados} invitados`} />
      <Dato etiqueta="Paquete" valor={solicitud.nombrePaquete || "Sin paquete"} />
      {solicitud.telefonoContacto ? <Dato etiqueta="Teléfono" valor={solicitud.telefonoContacto} /> : null}

      {onVerDetalle ? (
        <Pressable
          onPress={onVerDetalle}
          accessibilityRole="link"
          accessibilityLabel={`Ver detalle de la solicitud en ${solicitud.nombreSalon}`}
          style={({ hovered, focused }) => [estilos.verDetalle, (hovered || focused) && estilos.accionFoco]}
        >
          <Text style={estilos.verDetalleTexto}>Ver detalle →</Text>
        </Pressable>
      ) : null}
      {accion ? (
        <Pressable
          onPress={accion.onPress}
          disabled={accion.cargando}
          accessibilityRole="button"
          accessibilityLabel={accion.etiqueta}
          style={({ hovered, focused }) => [estilos.accion, (hovered || focused) && estilos.accionFoco]}
        >
          {accion.cargando ? (
            <ActivityIndicator color={COLORES.morado} size="small" />
          ) : (
            <Text style={estilos.accionTexto}>{accion.texto}</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
