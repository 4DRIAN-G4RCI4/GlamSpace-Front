/**
 * GlamSpaces · Galería del detalle del salón (Figma: foto grande con bordes redondeados y fila de
 * 4 miniaturas; si hay más de 4, la última muestra "+N"). Solo presentación.
 *
 * Se navega con las miniaturas, con las flechas sobre la foto (teclado) y deslizando en móvil.
 * Sin fotos: el espacio de la maqueta con la inicial del salón.
 */

import React, { useMemo } from "react";
import { View, Text, Pressable, PanResponder } from "react-native";
import FotoSalon from "../../components/FotoSalon";
import { MINIATURAS_GALERIA, moverIndice, pasoPorDeslizamiento, resumenMiniaturas } from "../../components/carrusel.logica";
import { estilos } from "./DetalleSalon.styles";

function Flecha({ texto, etiqueta, onPress, lado }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ hovered, focused }) => [estilos.galeriaFlecha, lado, (hovered || focused) && estilos.galeriaFlechaFoco]}
    >
      <Text style={estilos.galeriaFlechaTexto}>{texto}</Text>
    </Pressable>
  );
}

export default function GaleriaDetalle({ fotos, activa, onElegir, nombre }) {
  const total = fotos.length;
  const { visibles, extra } = resumenMiniaturas(total);

  // Deslizar con el dedo sobre la foto grande cambia de foto (solo gestos horizontales).
  const deslizar = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          const paso = pasoPorDeslizamiento(g.dx);
          if (paso) onElegir(moverIndice(activa, total, paso));
        },
      }),
    [activa, total, onElegir],
  );

  return (
    <View>
      <View style={estilos.galeriaPrincipal} {...(total > 1 ? deslizar.panHandlers : {})}>
        <FotoSalon uri={fotos[activa]} nombre={nombre} style={estilos.fotoGrande} tamanoInicial={72} />
        {total > 1 ? (
          <>
            <Flecha texto="‹" etiqueta="Foto anterior" onPress={() => onElegir(moverIndice(activa, total, -1))} lado={estilos.galeriaFlechaIzq} />
            <Flecha texto="›" etiqueta="Foto siguiente" onPress={() => onElegir(moverIndice(activa, total, 1))} lado={estilos.galeriaFlechaDer} />
            <View style={estilos.galeriaContador} accessibilityLiveRegion="polite">
              <Text style={estilos.galeriaContadorTexto}>
                {activa + 1} / {total}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {total > 1 ? (
        <View style={estilos.miniaturas}>
          {Array.from({ length: MINIATURAS_GALERIA }, (_, i) => {
            if (i >= visibles) return <View key={i} style={estilos.miniaturaHueco} />;
            const conMas = extra > 0 && i === visibles - 1;
            const destino = conMas ? visibles : i; // "+N" abre la primera foto que no cabe
            const elegida = activa === i || (conMas && activa >= i);
            return (
              <Pressable
                key={fotos[i] + i}
                onPress={() => onElegir(destino)}
                accessibilityRole="button"
                accessibilityLabel={conMas ? `Ver ${extra} fotos más` : `Ver foto ${i + 1} de ${total}`}
                accessibilityState={{ selected: elegida }}
                style={({ hovered, focused }) => [estilos.miniatura, (elegida || hovered || focused) && estilos.miniaturaActiva]}
              >
                <FotoSalon uri={fotos[i]} nombre={nombre} style={estilos.miniaturaFoto} tamanoInicial={20} />
                {conMas ? (
                  <View style={estilos.miniaturaMas}>
                    <Text style={estilos.miniaturaMasTexto}>+{extra}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
