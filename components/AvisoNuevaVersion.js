/**
 * GlamSpaces · HU-21 · Registra el service worker (dist/sw.js) y avisa cuando hay versión nueva.
 *
 * Solo en web y solo en producción: con `expo start` (__DEV__) no se registra nada, para que
 * el SW no sirva código viejo mientras se desarrolla.
 *
 * El SW nuevo se activa solo (skipWaiting + clients.claim) y borra la caché anterior; cuando
 * toma el control de una página que ya tenía SW, aquí se ofrece recargar para usar la versión nueva.
 */

import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { FUENTE, MEDIDA, PWA } from "../theme/disenoPwa";

function useServiceWorker() {
  const [hayVersionNueva, setHayVersionNueva] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || __DEV__ || typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return undefined;
    }
    const sw = navigator.serviceWorker;
    const alCambiarControlador = async () => {
      // Si el bundle de ESTA página está en el precache del sw.js publicado, la página ya es la
      // versión actual (primera visita, o se abrió después de publicar): no hay nada que avisar.
      const miBundle = document.querySelector('script[src*="/_expo/static/js/"]');
      if (!miBundle) return;
      const swPublicado = await fetch("/sw.js", { cache: "no-store" }).then((r) => r.text()).catch(() => null);
      if (swPublicado && !swPublicado.includes(new URL(miBundle.src).pathname)) setHayVersionNueva(true);
    };
    sw.addEventListener("controllerchange", alCambiarControlador);

    let registro = null;
    sw.register("/sw.js").then((r) => { registro = r; }).catch(() => {});

    // La app instalada puede quedarse abierta días: al volver a ella se revisa si hay versión nueva.
    const alVolver = () => document.visibilityState === "visible" && registro && registro.update().catch(() => {});
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      sw.removeEventListener("controllerchange", alCambiarControlador);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, []);

  return hayVersionNueva;
}

export default function AvisoNuevaVersion() {
  const hayVersionNueva = useServiceWorker();
  const { width } = useWindowDimensions();
  if (!hayVersionNueva) return null;

  // En el teléfono hay barras fijas abajo (Perfil y la reserva del detalle): el aviso va encima de ellas.
  return (
    <View style={[estilos.contenedor, width < 768 && estilos.contenedorTelefono]} pointerEvents="box-none">
      <View style={estilos.aviso} role="status" aria-live="polite">
        <Text style={estilos.texto}>Hay una versión nueva disponible</Text>
        <Pressable
          style={({ hovered, focused }) => [estilos.boton, (hovered || focused) && estilos.botonFoco, focused && estilos.foco]}
          onPress={() => window.location.reload()}
          accessibilityRole="button"
          accessibilityLabel="Actualizar a la versión nueva"
        >
          <Text style={estilos.botonTexto}>Actualizar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  // Flota abajo, sobre el contenido; #root ya respeta las áreas seguras del teléfono.
  contenedor: { position: "absolute", left: 16, right: 16, bottom: 16, alignItems: "center" },
  contenedorTelefono: { bottom: 96 },
  aviso: {
    width: "100%",
    maxWidth: 560,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: PWA.superficie,
    borderWidth: 1,
    borderColor: PWA.borde,
    borderRadius: MEDIDA.radioTarjeta,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: PWA.oscuro,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  texto: { flexShrink: 1, fontFamily: FUENTE.texto, fontSize: 14, fontWeight: "600", color: PWA.texto },
  boton: {
    minHeight: 44,
    borderRadius: MEDIDA.radioBotonMovil,
    backgroundColor: PWA.vino,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  botonFoco: { opacity: 0.85 },
  foco: { outlineStyle: "solid", outlineWidth: 2, outlineColor: PWA.oscuro, outlineOffset: 2 },
  botonTexto: { fontFamily: FUENTE.texto, fontSize: 13.5, fontWeight: "600", color: PWA.fondo },
});
