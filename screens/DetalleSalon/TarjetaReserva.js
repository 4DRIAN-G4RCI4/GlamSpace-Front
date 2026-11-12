/**
 * GlamSpaces · Tarjeta de reserva del detalle (Figma, columna derecha y fija): "Desde $X",
 * Fecha, Paquete, Invitados, "Solicitar reservación" y el texto de la maqueta.
 * En móvil se usa BarraReservaMovil (abajo, fija) con "Desde $X" y el botón. Solo presentación.
 */

import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { formatearPrecio } from "../../utils/formato";
import { formatearFechaCorta } from "../../utils/fechas";
import { COLORES } from "../../theme/colores";
import { estilos } from "./DetalleSalon.styles";

// Caja con etiqueta chica en mayúsculas (FECHA, PAQUETE, INVITADOS). Con onPress lleva a la sección.
function Caja({ etiqueta, valor, vacio, onPress, accesible }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accesible}
      style={({ hovered, focused }) => [estilos.caja, (hovered || focused) && estilos.cajaFoco]}
    >
      <Text style={estilos.cajaEtiqueta}>{etiqueta}</Text>
      <Text style={[estilos.cajaValor, vacio && estilos.cajaVacia]} numberOfLines={1}>
        {valor}
      </Text>
    </Pressable>
  );
}

export function PrecioDesde({ precio, compacto }) {
  if (precio == null) return <Text style={estilos.desdeEtiqueta}>Sin paquetes publicados</Text>;
  return (
    <View>
      <Text style={estilos.desdeEtiqueta}>Desde</Text>
      <Text style={compacto ? estilos.desdePrecioCompacto : estilos.desdePrecio}>{formatearPrecio(precio)}</Text>
    </View>
  );
}

export default function TarjetaReserva({ d, onIrA, onSolicitar }) {
  const paquete = d.paqueteElegido;
  return (
    <View style={estilos.tarjetaReserva}>
      <PrecioDesde precio={d.precioDesde} />

      <View style={estilos.cajas}>
        <Caja
          etiqueta="FECHA"
          valor={d.fecha ? formatearFechaCorta(d.fecha) : "Elige en el calendario"}
          vacio={!d.fecha}
          onPress={() => onIrA("disponibilidad")}
          accesible={d.fecha ? `Fecha: ${formatearFechaCorta(d.fecha)}. Cambiar en el calendario` : "Elegir fecha en el calendario"}
        />
        {d.paquetes.length > 0 ? (
          <Caja
            etiqueta="PAQUETE"
            valor={paquete ? `${paquete.nombrePaquete} — ${formatearPrecio(paquete.precio)}` : "Elige un paquete"}
            vacio={!paquete}
            onPress={() => onIrA("paquetes")}
            accesible={paquete ? `Paquete: ${paquete.nombrePaquete}. Cambiar` : "Elegir paquete"}
          />
        ) : null}
        <View style={estilos.caja}>
          <Text style={estilos.cajaEtiqueta} nativeID="etiqueta-invitados">
            INVITADOS
          </Text>
          <View style={estilos.cajaFila}>
            <TextInput
              value={d.invitados}
              onChangeText={d.setInvitados}
              placeholder="Ej. 120"
              placeholderTextColor={COLORES.placeholder}
              keyboardType="number-pad"
              maxLength={5}
              accessibilityLabel={`Invitados, hasta ${d.salon.capacidad} personas`}
              aria-labelledby="etiqueta-invitados"
              style={estilos.cajaEntrada}
            />
            <Text style={estilos.cajaSufijo}>personas</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onSolicitar}
        accessibilityRole="button"
        style={({ hovered, focused }) => [estilos.botonReservar, (hovered || focused) && estilos.botonReservarFoco]}
      >
        <Text style={estilos.botonReservarTexto}>Solicitar reservación</Text>
      </Pressable>
      <Text style={estilos.notaReserva}>Respuesta del salón en menos de 24 hrs · Sin cargo por consultar</Text>
    </View>
  );
}

// Móvil: barra fija abajo (no hay frame móvil en Figma; así se acordó).
export function BarraReservaMovil({ d, onSolicitar }) {
  return (
    <View style={estilos.barraMovil}>
      <PrecioDesde precio={d.precioDesde} compacto />
      <Pressable
        onPress={onSolicitar}
        accessibilityRole="button"
        style={({ hovered, focused }) => [estilos.botonReservar, estilos.botonReservarMovil, (hovered || focused) && estilos.botonReservarFoco]}
      >
        <Text style={estilos.botonReservarTexto}>Solicitar reservación</Text>
      </Pressable>
    </View>
  );
}
