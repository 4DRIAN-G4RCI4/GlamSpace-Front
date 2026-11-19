/**
 * GlamSpaces · Deslizar con el dedo para cambiar de foto (solo gestos horizontales).
 * Lo usan la galería del detalle y su visor de pantalla completa. Regresa los panHandlers,
 * o {} si hay una sola foto.
 */

import { useMemo } from "react";
import { PanResponder } from "react-native";
import { moverIndice, pasoPorDeslizamiento } from "./carrusel.logica";

export default function useDeslizarFotos(activa, total, onElegir) {
  const responder = useMemo(
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
  return total > 1 ? responder.panHandlers : {};
}
