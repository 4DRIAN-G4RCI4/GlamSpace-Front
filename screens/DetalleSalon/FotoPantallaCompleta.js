/**
 * GlamSpaces · HU-28 · Visor de las fotos del salón en pantalla completa.
 *
 * Fondo negro, la foto completa (sin recortar), flechas, contador y botón cerrar. Se navega con las
 * flechas, deslizando en móvil o con ← y → del teclado; Esc (o el botón atrás de Android) lo cierra.
 */

import React, { useEffect } from "react";
import { Modal, View, Text, Pressable, Platform, StyleSheet } from "react-native";
import FotoSalon from "../../components/FotoSalon";
import useDeslizarFotos from "../../components/useDeslizarFotos";
import { moverIndice } from "../../components/carrusel.logica";

function Boton({ texto, etiqueta, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={8}
      style={({ hovered, focused }) => [estilos.boton, style, (hovered || focused) && estilos.botonFoco]}
    >
      <Text style={estilos.botonTexto}>{texto}</Text>
    </Pressable>
  );
}

export default function FotoPantallaCompleta({ visible, fotos, activa, onElegir, onCerrar, nombre }) {
  const total = fotos.length;
  const mover = (paso) => onElegir(moverIndice(activa, total, paso));

  // Teclado en web: ← → cambian de foto y Esc cierra.
  useEffect(() => {
    if (!visible || Platform.OS !== "web" || typeof window === "undefined") return undefined;
    const alTeclear = (e) => {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowLeft" && total > 1) mover(-1);
      else if (e.key === "ArrowRight" && total > 1) mover(1);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  const deslizar = useDeslizarFotos(activa, total, onElegir);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onCerrar} statusBarTranslucent>
      <View style={estilos.fondo} {...deslizar} accessibilityViewIsModal>
        <FotoSalon uri={fotos[activa]} nombre={nombre} style={estilos.foto} tamanoInicial={96} resizeMode="contain" />
        <Boton texto="✕" etiqueta="Cerrar pantalla completa" onPress={onCerrar} style={estilos.cerrar} />
        {total > 1 ? (
          <>
            <Boton texto="‹" etiqueta="Foto anterior" onPress={() => mover(-1)} style={estilos.izq} />
            <Boton texto="›" etiqueta="Foto siguiente" onPress={() => mover(1)} style={estilos.der} />
            <View style={estilos.contador} accessibilityLiveRegion="polite">
              <Text style={estilos.contadorTexto}>
                {activa + 1} / {total}
              </Text>
            </View>
          </>
        ) : null}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#0d0a0b", alignItems: "center", justifyContent: "center" },
  foto: { width: "100%", height: "100%" },
  boton: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  botonFoco: { backgroundColor: "rgba(255,255,255,0.32)" },
  botonTexto: { color: "#ffffff", fontSize: 26, lineHeight: 30 },
  cerrar: { top: 20, right: 20 },
  izq: { left: 16, top: "50%", marginTop: -24 },
  der: { right: 16, top: "50%", marginTop: -24 },
  contador: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  contadorTexto: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
});
