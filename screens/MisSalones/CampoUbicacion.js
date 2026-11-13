/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Campo "Zona o dirección" con ayuda de ubicación.
 *
 * Se escribe una dirección o un código postal:
 *   - 5 dígitos → colonias de ese CP (api.zippopotam.us, sin clave)
 *   - texto     → sugerencias de OpenStreetMap (Nominatim), con 600 ms de espera y 1 petición/s
 * Al elegir una, el campo queda con "Colonia, Municipio, Estado, CP 00000".
 *
 * Si las APIs fallan o no hay conexión, el campo se sigue escribiendo a mano y NUNCA bloquea
 * guardar. Las sugerencias se recorren con el teclado y se anuncian a lectores de pantalla.
 */

import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Campo from "../../components/Campo";
import { COLORES } from "../../theme/colores";
import { ATRIBUCION_OSM } from "../../services/ubicacion.logica";
import useUbicacion from "./useUbicacion";
import { estilos } from "./MisSalones.styles";

export default function CampoUbicacion({ valor, onCambiar, error, deshabilitado }) {
  const u = useUbicacion(valor, (zona) => onCambiar(zona));

  return (
    <View style={estilos.ubicacionCaja}>
      <Campo
        etiqueta="Zona o dirección"
        valor={valor}
        onCambiar={onCambiar}
        placeholder="Escribe la dirección o el código postal (ej. 42800)"
        error={error}
        editable={!deshabilitado}
        aria-autocomplete="list"
        aria-expanded={u.abierto}
      />

      {u.buscando ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: -8, marginBottom: 12 }}>
          <ActivityIndicator size="small" color={COLORES.morado} />
          <Text style={estilos.ubicacionPista}>Buscando ubicaciones…</Text>
        </View>
      ) : null}

      {u.abierto && u.sugerencias.length > 0 ? (
        <View
          style={estilos.sugerencias}
          role="listbox"
          accessibilityLabel="Ubicaciones sugeridas"
        >
          {u.sugerencias.map((s) => (
            <Pressable
              key={s.id || s.zona}
              onPress={() => u.elegir(s)}
              accessibilityRole="button"
              accessibilityLabel={`Usar ${s.zona}`}
              style={({ hovered, focused, pressed }) => [
                estilos.sugerencia,
                (hovered || focused || pressed) && estilos.sugerenciaActiva,
                focused && estilos.foco,
              ]}
            >
              <Text style={estilos.sugerenciaTexto} numberOfLines={1}>{s.zona}</Text>
              {s.etiqueta && s.etiqueta !== s.zona ? (
                <Text style={estilos.sugerenciaDetalle} numberOfLines={1}>{s.etiqueta}</Text>
              ) : null}
            </Pressable>
          ))}
          {/* La licencia de OpenStreetMap pide dar el crédito donde se muestran sus datos. */}
          <Text style={[estilos.atribucion, { padding: 8 }]}>{ATRIBUCION_OSM}</Text>
        </View>
      ) : null}

      {u.aviso ? (
        <Text style={estilos.ubicacionAviso} role="status" aria-live="polite">{u.aviso}</Text>
      ) : (
        <Text style={estilos.ubicacionPista}>
          Escribe el código postal para elegir la colonia, o la dirección para buscarla. También puedes escribirla a mano.
        </Text>
      )}
    </View>
  );
}
