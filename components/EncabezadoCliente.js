/**
 * GlamSpaces · Barra superior de las pantallas del cliente (Figma PROYECTO--PWA: detalle,
 * Cliente 04 y Cliente 05): marca, migas de pan ("Inicio / Salones / Jardín…") y, a la
 * derecha, "Iniciar sesión" o "Mi cuenta" y "Registra tu salón". Solo presentación.
 *
 * `migas`: [{ texto, onPress? }]; la última es la pantalla actual (sin enlace).
 * `volverA`: a dónde regresa el login al entrar (misma pantalla con lo que ya se eligió).
 */

import React, { useEffect, useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import Marca from "./Marca";
import { obtenerSesionActiva } from "../services/sesionStorage";
import { estilos } from "./EncabezadoCliente.styles";

const ANCHO_MIGAS = 700; // debajo, las migas pasan a su propio renglón
const ANCHO_REGISTRO = 520; // debajo, solo cabe el botón de cuenta (igual que la búsqueda)

export default function EncabezadoCliente({ navigation, migas = [], volverA }) {
  const { width } = useWindowDimensions();
  const [sesion, setSesion] = useState(null);
  const ir = (pantalla, params) => navigation && navigation.navigate(pantalla, params);

  useEffect(() => {
    void obtenerSesionActiva().then(setSesion);
  }, []);

  const Migas = (
    <View style={estilos.migas} accessibilityRole="navigation" aria-label="Ruta">
      {migas.map((m, i) => {
        const ultima = i === migas.length - 1;
        return (
          <View key={m.texto + i} style={estilos.miga}>
            {ultima || !m.onPress ? (
              <Text style={[estilos.migaTexto, ultima && estilos.migaActual]} numberOfLines={1} aria-current={ultima ? "page" : undefined}>
                {m.texto}
              </Text>
            ) : (
              <Pressable onPress={m.onPress} accessibilityRole="link" style={({ hovered, focused }) => [(hovered || focused) && estilos.migaFoco]}>
                <Text style={estilos.migaTexto}>{m.texto}</Text>
              </Pressable>
            )}
            {ultima ? null : <Text style={estilos.migaSeparador}>/</Text>}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={estilos.barra}>
      <View style={estilos.contenido}>
        <View style={estilos.izquierda}>
          <Pressable onPress={() => ir("BusquedaSalones")} accessibilityRole="link" accessibilityLabel="GlamSpaces, ir al inicio">
            <Marca compacta />
          </Pressable>
          {width >= ANCHO_MIGAS ? Migas : null}
        </View>
        <View style={estilos.acciones}>
          <Pressable
            onPress={() => (sesion ? ir("Perfil") : ir("Login", volverA ? { volverA } : {}))}
            accessibilityRole="button"
            style={({ hovered, focused }) => [estilos.botonCuenta, (hovered || focused) && estilos.foco]}
          >
            <Text style={estilos.botonCuentaTexto}>{sesion ? "Mi cuenta" : "Iniciar sesión"}</Text>
          </Pressable>
          {width >= ANCHO_REGISTRO ? (
            <Pressable
              onPress={() => ir("RegistroAdministrador")}
              accessibilityRole="button"
              style={({ hovered, focused }) => [estilos.botonRegistro, (hovered || focused) && estilos.foco]}
            >
              <Text style={estilos.botonRegistroTexto}>Registra tu salón</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {width < ANCHO_MIGAS && migas.length > 0 ? <View style={estilos.renglonMigas}>{Migas}</View> : null}
    </View>
  );
}
