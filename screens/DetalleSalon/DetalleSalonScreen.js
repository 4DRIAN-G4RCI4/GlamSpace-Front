/**
 * GlamSpaces · Detalle de un salón y calendario de disponibilidad (Sprint 4 · HU-13)
 *
 * Destino de las tarjetas de la búsqueda (HU-10). Muestra la galería de fotos, datos
 * del salón, sus paquetes y el calendario del mes con las fechas ocupadas (HU-12).
 * Al confirmar una fecha disponible lleva a la solicitud de reservación con esa fecha.
 *
 *   - DetalleSalonScreen.js        → pantalla (JSX)   [este archivo]
 *   - CalendarioDisponibilidad.js  → calendario del mes (JSX)
 *   - DetalleSalon.styles.js       → estilos
 *   - useDetalleSalon.js           → lógica / estado del salón y la galería
 *   - useDisponibilidad.js         → lógica / estado del calendario
 *   - detalleSalon.validaciones.js → reglas para elegir la fecha
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import FotoSalon from "../../components/FotoSalon";
import { Bloque } from "../../components/Esqueleto";
import { formatearPrecio } from "../../utils/formato";
import { formatearFechaLarga } from "../../utils/fechas";
import { ESPACIO } from "../../theme/espaciado";
import useDetalleSalon from "./useDetalleSalon";
import CalendarioDisponibilidad from "./CalendarioDisponibilidad";
import { estilos } from "./DetalleSalon.styles";

function BarraSuperior({ onVolver }) {
  return (
    <View style={estilos.barraSuperior}>
      <View style={estilos.barraContenido}>
        <Pressable
          onPress={onVolver}
          accessibilityRole="button"
          accessibilityLabel="Volver a la búsqueda"
          style={({ hovered, focused }) => [estilos.botonVolver, (hovered || focused) && estilos.botonVolverFoco]}
        >
          <Text style={estilos.botonVolverTexto}>← Volver a la búsqueda</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetalleEsqueleto() {
  return (
    <View style={estilos.tarjetaDetalle} accessibilityLabel="Cargando salón">
      <Bloque style={[estilos.foto, { borderRadius: 0 }]} />
      <View style={estilos.cuerpo}>
        <Bloque style={{ height: 24, width: "60%" }} />
        <Bloque style={{ height: 14, width: "40%", marginTop: ESPACIO.md }} />
        <Bloque style={{ height: 28, width: "35%", marginTop: ESPACIO.xl }} />
        <Bloque style={{ height: 64, marginTop: ESPACIO.xl }} />
        <Bloque style={{ height: 64, marginTop: ESPACIO.md }} />
      </View>
    </View>
  );
}

// Foto grande + miniaturas para cambiarla (solo si hay más de una).
function Galeria({ fotos, activa, onElegir, nombre }) {
  return (
    <View>
      <FotoSalon uri={fotos[activa]} nombre={nombre} style={estilos.foto} tamanoInicial={72} />
      {fotos.length > 1 ? (
        <ScrollView horizontal contentContainerStyle={estilos.miniaturas} showsHorizontalScrollIndicator={false}>
          {fotos.map((uri, i) => (
            <Pressable
              key={uri + i}
              onPress={() => onElegir(i)}
              accessibilityRole="button"
              accessibilityLabel={`Ver foto ${i + 1} de ${fotos.length}`}
              accessibilityState={{ selected: i === activa }}
              style={({ hovered, focused }) => [
                estilos.miniatura,
                (i === activa || hovered || focused) && estilos.miniaturaActiva,
              ]}
            >
              <FotoSalon uri={uri} nombre={nombre} style={estilos.miniaturaFoto} tamanoInicial={20} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function Paquete({ paquete, masBarato }) {
  return (
    <View style={[estilos.paquete, masBarato && estilos.paqueteMasBarato]}>
      <View style={estilos.paqueteFila}>
        <Text style={estilos.paqueteNombre}>{paquete.nombrePaquete}</Text>
        <Text style={estilos.paquetePrecio}>{formatearPrecio(paquete.precio)}</Text>
      </View>
      {paquete.descripcion ? <Text style={estilos.paqueteDescripcion}>{paquete.descripcion}</Text> : null}
      {masBarato ? <Text style={estilos.etiquetaBarato}>★ El más económico</Text> : null}
    </View>
  );
}

// Criterio 3: confirma la fecha elegida y pasa a la solicitud con la fecha precargada.
function ConfirmarFecha({ fecha, onConfirmar }) {
  return (
    <View style={estilos.confirmar}>
      <Text style={estilos.confirmarTexto}>
        {fecha ? `Fecha elegida: ${formatearFechaLarga(fecha)}` : "Elige una fecha disponible en el calendario."}
      </Text>
      <Pressable
        onPress={onConfirmar}
        disabled={!fecha}
        accessibilityRole="button"
        accessibilityState={{ disabled: !fecha }}
        style={[estilos.boton, !fecha && estilos.botonDeshabilitado]}
      >
        <Text style={estilos.botonTexto}>Solicitar reservación</Text>
      </Pressable>
    </View>
  );
}

export default function DetalleSalonScreen({ navigation, route }) {
  const salonId = route && route.params ? route.params.salonId : null;
  const f = useDetalleSalon(salonId);
  const volver = () => navigation && navigation.navigate("BusquedaSalones");

  let contenido;
  if (f.cargando) {
    contenido = <DetalleEsqueleto />;
  } else if (f.error || !f.salon) {
    contenido = (
      <View style={[estilos.tarjetaDetalle, estilos.cuerpo]}>
        <Text style={estilos.nombre}>No se pudo abrir el salón</Text>
        <Text style={estilos.descripcion}>{f.error || "El salón no existe."}</Text>
        <Pressable style={estilos.boton} onPress={f.reintentar} accessibilityRole="button">
          <Text style={estilos.botonTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  } else {
    const { salon, paquetes, calendario } = f;
    const solicitar = () =>
      navigation &&
      navigation.navigate("SolicitudReservacion", { salonId, nombreSalon: salon.nombre, paquetes, fecha: calendario.fechaElegida });

    contenido = (
      <View style={estilos.tarjetaDetalle}>
        <Galeria fotos={f.fotos} activa={f.fotoActiva} onElegir={f.setFotoActiva} nombre={salon.nombre} />

        <View style={estilos.cuerpo}>
          <Text style={estilos.nombre} accessibilityRole="header">
            {salon.nombre}
          </Text>
          <View style={estilos.filaDatos}>
            <View style={estilos.pastilla}>
              <Text style={estilos.pastillaTexto}>📍 {salon.zona}</Text>
            </View>
            <View style={estilos.pastilla}>
              <Text style={estilos.pastillaTexto}>👪 Hasta {salon.capacidad} personas</Text>
            </View>
          </View>

          {paquetes.length > 0 ? (
            <View style={estilos.bloquePrecio}>
              <Text style={estilos.precioEtiqueta}>Desde</Text>
              <Text style={estilos.precio}>{formatearPrecio(paquetes[0].precio)}</Text>
            </View>
          ) : null}

          {salon.descripcion ? <Text style={estilos.descripcion}>{salon.descripcion}</Text> : null}

          <Text style={estilos.tituloSeccion} accessibilityRole="header">
            Paquetes ({paquetes.length})
          </Text>
          {paquetes.map((p, i) => (
            <Paquete key={p.id} paquete={p} masBarato={i === 0 && paquetes.length > 1} />
          ))}

          <Text style={estilos.tituloSeccion} accessibilityRole="header">
            Disponibilidad
          </Text>
          <CalendarioDisponibilidad c={calendario} />
          <ConfirmarFecha fecha={calendario.fechaElegida} onConfirmar={solicitar} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <BarraSuperior onVolver={volver} />
      <View style={estilos.contenido}>{contenido}</View>
      <Text style={estilos.pie}>Detalle del salón · Sprint 4 · GlamSpaces</Text>
    </ScrollView>
  );
}
