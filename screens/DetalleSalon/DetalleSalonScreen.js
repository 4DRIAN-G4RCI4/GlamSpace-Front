/**
 * GlamSpaces · Detalle de un salón (Sprint 3)
 *
 * Destino de las tarjetas de la búsqueda (HU-10, criterio 4). Muestra foto, datos
 * del salón, "precio desde" y sus paquetes. La pantalla completa de detalle
 * (galería, reservar, etc.) queda para su propia historia.
 *
 *   - DetalleSalonScreen.js   → pantalla (JSX)   [este archivo]
 *   - DetalleSalon.styles.js  → estilos
 *   - useDetalleSalon.js      → lógica / estado
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import FotoSalon from "../../components/FotoSalon";
import { Bloque } from "../../components/Esqueleto";
import { formatearPrecio } from "../../utils/formato";
import { ESPACIO } from "../../theme/espaciado";
import useDetalleSalon from "./useDetalleSalon";
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
    const { salon, paquetes } = f;
    contenido = (
      <View style={estilos.tarjetaDetalle}>
        <FotoSalon uri={salon.fotos && salon.fotos[0]} nombre={salon.nombre} style={estilos.foto} tamanoInicial={72} />

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
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <BarraSuperior onVolver={volver} />
      <View style={estilos.contenido}>{contenido}</View>
      <Text style={estilos.pie}>Detalle del salón · Sprint 3 · GlamSpaces</Text>
    </ScrollView>
  );
}
