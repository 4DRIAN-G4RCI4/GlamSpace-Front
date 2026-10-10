/**
 * GlamSpaces · Detalle de un salón (Sprint 3)
 *
 * Destino de las tarjetas de la búsqueda (HU-10, criterio 4). Versión básica:
 * foto, datos del salón y sus paquetes con precio. La pantalla completa de
 * detalle (galería, reservar, etc.) queda para su propia historia.
 *
 *   - DetalleSalonScreen.js   → pantalla (JSX)   [este archivo]
 *   - DetalleSalon.styles.js  → estilos
 *   - useDetalleSalon.js      → lógica / estado
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Marca from "../../components/Marca";
import { COLORES } from "../../theme/colores";
import { formatearPrecio } from "../../utils/formato";
import useDetalleSalon from "./useDetalleSalon";
import { estilos } from "./DetalleSalon.styles";

export default function DetalleSalonScreen({ navigation, route }) {
  const salonId = route && route.params ? route.params.salonId : null;
  const f = useDetalleSalon(salonId);
  const volver = () => navigation && navigation.navigate("BusquedaSalones");

  if (f.cargando) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color={COLORES.morado} size="large" />
      </View>
    );
  }

  if (f.error || !f.salon) {
    return (
      <ScrollView contentContainerStyle={estilos.pagina}>
        <Marca />
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>No se pudo abrir el salón</Text>
          <Text style={estilos.subtitulo}>{f.error || "El salón no existe."}</Text>
          <TouchableOpacity style={estilos.boton} onPress={f.reintentar} activeOpacity={0.85}>
            <Text style={estilos.botonTexto}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botonSecundario} onPress={volver} activeOpacity={0.85}>
            <Text style={estilos.botonSecundarioTexto}>Volver a la búsqueda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const { salon } = f;
  const foto = salon.fotos && salon.fotos.length > 0 ? salon.fotos[0] : null;

  return (
    <ScrollView contentContainerStyle={estilos.pagina}>
      <Marca />

      <View style={[estilos.tarjeta, estilos.tarjetaSinRelleno]}>
        {foto ? (
          <Image source={{ uri: foto }} style={estilos.foto} resizeMode="cover" />
        ) : (
          <View style={[estilos.foto, estilos.fotoVacia]}>
            <Text style={estilos.fotoVaciaTexto}>{salon.nombre.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={estilos.cuerpo}>
          <Text style={estilos.titulo}>{salon.nombre}</Text>
          <Text style={estilos.dato}>📍 {salon.zona}</Text>
          <Text style={estilos.dato}>👥 Hasta {salon.capacidad} personas</Text>
          {salon.descripcion ? <Text style={estilos.descripcion}>{salon.descripcion}</Text> : null}

          <View style={estilos.separador} />
          <Text style={estilos.seccion}>Paquetes</Text>

          {f.paquetes.map((p) => (
            <View key={p.id} style={estilos.paquete}>
              <View style={estilos.paqueteFila}>
                <Text style={estilos.paqueteNombre}>{p.nombrePaquete}</Text>
                <Text style={estilos.paquetePrecio}>{formatearPrecio(p.precio)}</Text>
              </View>
              {p.descripcion ? <Text style={estilos.paqueteDescripcion}>{p.descripcion}</Text> : null}
            </View>
          ))}

          <TouchableOpacity onPress={volver}>
            <Text style={estilos.enlaceVolver}>
              <Text style={estilos.enlaceResaltado}>← Volver a la búsqueda</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={estilos.pie}>Detalle del salón · Sprint 3 · GlamSpaces</Text>
    </ScrollView>
  );
}
