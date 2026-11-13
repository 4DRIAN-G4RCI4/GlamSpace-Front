/**
 * GlamSpaces · Detalle de un salón (HU-13, diseño Figma PROYECTO--PWA)
 *
 * Escritorio (≥ 1024 px), dos columnas:
 *   - Izquierda: galería, nombre, ubicación, chips, pestañas Información / Paquetes /
 *     Disponibilidad (llevan a cada sección), descripción, paquetes seleccionables y calendario.
 *   - Derecha: tarjeta fija con "Desde $X", Fecha, Paquete, Invitados y "Solicitar reservación".
 * Móvil y tablet: una columna con la galería arriba y una barra fija abajo con "Desde $X" y el botón.
 * Lo elegido aquí llega ya llenado a la reserva (Cliente 04).
 *
 *   - DetalleSalonScreen.js        → pantalla (JSX)   [este archivo]
 *   - GaleriaDetalle.js            → foto grande + miniaturas
 *   - TarjetaReserva.js            → tarjeta fija y barra móvil
 *   - CalendarioDisponibilidad.js  → calendario del mes
 *   - DetalleSalon.styles.js       → estilos
 *   - useDetalleSalon.js           → lógica / estado del salón, la galería y lo elegido
 *   - useDisponibilidad.js         → lógica / estado del calendario
 *   - detalleSalon.validaciones.js → reglas para elegir la fecha
 */

import React, { useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { Bloque } from "../../components/Esqueleto";
import { formatearPrecio } from "../../utils/formato";
import { MEDIDA } from "../../theme/disenoPwa";
import { ESPACIO } from "../../theme/espaciado";
import useDetalleSalon from "./useDetalleSalon";
import GaleriaDetalle from "./GaleriaDetalle";
import TarjetaReserva, { BarraReservaMovil } from "./TarjetaReserva";
import CalendarioDisponibilidad from "./CalendarioDisponibilidad";
import { estilos } from "./DetalleSalon.styles";

const PESTANAS = [
  { clave: "informacion", texto: "Información" },
  { clave: "paquetes", texto: "Paquetes" },
  { clave: "disponibilidad", texto: "Disponibilidad" },
];

function DetalleEsqueleto() {
  return (
    <View accessibilityLabel="Cargando salón" aria-busy>
      <Bloque style={estilos.fotoGrande} />
      <Bloque style={{ height: 28, width: "55%", marginTop: ESPACIO.xl }} />
      <Bloque style={{ height: 14, width: "35%", marginTop: ESPACIO.md }} />
      <Bloque style={{ height: 64, marginTop: ESPACIO.xl }} />
      <Bloque style={{ height: 64, marginTop: ESPACIO.md }} />
    </View>
  );
}

function Pestanas({ activa, onElegir }) {
  return (
    <View style={estilos.pestanas} accessibilityRole="tablist">
      {PESTANAS.map((p) => {
        const elegida = p.clave === activa;
        return (
          <Pressable
            key={p.clave}
            onPress={() => onElegir(p.clave)}
            accessibilityRole="tab"
            accessibilityState={{ selected: elegida }}
            style={({ hovered, focused }) => [estilos.pestana, elegida && estilos.pestanaActiva, (hovered || focused) && estilos.pestanaFoco]}
          >
            <Text style={[estilos.pestanaTexto, elegida && estilos.pestanaTextoActiva]}>{p.texto}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Paquete seleccionable (radio): el elegido se marca con borde vino, como en la maqueta.
function TarjetaPaquete({ paquete, elegido, onPress, ancho }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: elegido }}
      aria-checked={elegido}
      accessibilityLabel={`${paquete.nombrePaquete}, ${formatearPrecio(paquete.precio)}`}
      style={({ hovered, focused }) => [
        estilos.paqueteTarjeta,
        { width: ancho },
        elegido && estilos.paqueteElegido,
        (hovered || focused) && estilos.paqueteFoco,
      ]}
    >
      <Text style={estilos.paqueteNombre}>{paquete.nombrePaquete}</Text>
      {paquete.descripcion ? <Text style={estilos.paqueteDescripcion}>{paquete.descripcion}</Text> : null}
      <Text style={estilos.paquetePrecio}>{formatearPrecio(paquete.precio)}</Text>
    </Pressable>
  );
}

export default function DetalleSalonScreen({ navigation, route }) {
  const salonId = route && route.params ? route.params.salonId : null;
  const d = useDetalleSalon(salonId);
  const { width } = useWindowDimensions();
  const escritorio = width >= MEDIDA.corteEscritorio;
  const scroll = useRef(null);
  const posiciones = useRef({ contenido: 0 });
  const [pestana, setPestana] = useState("informacion");
  const ir = (pantalla, params) => navigation && navigation.navigate(pantalla, params);

  const guardarPosicion = (clave) => (e) => {
    posiciones.current[clave] = e.nativeEvent.layout.y;
  };

  // Pestañas y cajas de la tarjeta: llevan a su sección dentro de la misma página.
  function irASeccion(clave) {
    setPestana(clave);
    const y = posiciones.current.contenido + (posiciones.current[clave] || 0) - ESPACIO.md;
    if (scroll.current) scroll.current.scrollTo({ y: Math.max(y, 0), animated: true });
  }

  function solicitar() {
    ir("SolicitudReservacion", {
      salonId,
      borrador: { fecha: d.fecha, paqueteId: d.paqueteId, invitados: d.invitados },
    });
  }

  const nombre = d.salon ? d.salon.nombre : "Salón";
  const migas = [
    { texto: "Inicio", onPress: () => ir("BusquedaSalones") },
    { texto: "Salones", onPress: () => ir("BusquedaSalones") },
    { texto: nombre },
  ];

  let columnaIzquierda;
  if (d.cargando) {
    columnaIzquierda = <DetalleEsqueleto />;
  } else if (d.error || !d.salon) {
    columnaIzquierda = (
      <View style={estilos.tarjetaError}>
        <Text style={estilos.nombre}>No se pudo abrir el salón</Text>
        <Text style={estilos.descripcion}>{d.error || "El salón no existe."}</Text>
        <Pressable style={estilos.boton} onPress={d.reintentar} accessibilityRole="button">
          <Text style={estilos.botonTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  } else {
    const anchoPaquete = width >= 600 ? "48.5%" : "100%";
    columnaIzquierda = (
      <>
        <GaleriaDetalle fotos={d.fotos} activa={d.fotoActiva} onElegir={d.setFotoActiva} nombre={d.salon.nombre} />

        <Text style={estilos.nombre} accessibilityRole="header" aria-level={1}>
          {d.salon.nombre}
        </Text>
        <Text style={estilos.ubicacion}>{d.salon.zona}</Text>
        <View style={estilos.chips}>
          <View style={estilos.chip}>
            <Text style={estilos.chipTexto}>Hasta {d.salon.capacidad} invitados</Text>
          </View>
        </View>

        <Pestanas activa={pestana} onElegir={irASeccion} />

        <View onLayout={guardarPosicion("informacion")}>
          <Text style={estilos.descripcion}>{d.salon.descripcion || "El salón todavía no agrega una descripción."}</Text>
        </View>

        <View onLayout={guardarPosicion("paquetes")}>
          <Text style={estilos.tituloSeccion} accessibilityRole="header" aria-level={2}>
            Paquetes disponibles
          </Text>
          {d.paquetes.length === 0 ? (
            <Text style={estilos.textoSecundario}>Este salón todavía no publica paquetes.</Text>
          ) : (
            <View style={estilos.paquetes} accessibilityRole="radiogroup">
              {d.paquetes.map((p) => (
                <TarjetaPaquete key={p.id} paquete={p} elegido={p.id === d.paqueteId} onPress={() => d.elegirPaquete(p.id)} ancho={anchoPaquete} />
              ))}
            </View>
          )}
        </View>

        <View onLayout={guardarPosicion("disponibilidad")}>
          <Text style={estilos.tituloSeccion} accessibilityRole="header" aria-level={2}>
            Disponibilidad
          </Text>
          <CalendarioDisponibilidad c={d.calendario} />
        </View>
      </>
    );
  }

  const listo = !d.cargando && !d.error && !!d.salon;

  return (
    <View style={estilos.raiz}>
      <BarraNavegacion navigation={navigation} pantalla="DetalleSalon" migas={migas} volverA={{ nombre: "DetalleSalon", params: { salonId } }} />
      <ScrollView ref={scroll} style={estilos.raiz} contentContainerStyle={estilos.pantalla}>
        <View
          style={[estilos.contenido, escritorio && estilos.contenidoEscritorio]}
          onLayout={(e) => {
            posiciones.current.contenido = e.nativeEvent.layout.y;
          }}
        >
          <View style={estilos.columnaIzquierda}>{columnaIzquierda}</View>
          {escritorio && listo ? (
            <View style={estilos.columnaDerecha}>
              <View style={estilos.fija}>
                <TarjetaReserva d={d} onIrA={irASeccion} onSolicitar={solicitar} />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
      {!escritorio && listo ? <BarraReservaMovil d={d} onSolicitar={solicitar} /> : null}
    </View>
  );
}
