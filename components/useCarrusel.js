/**
 * GlamSpaces · Estado del carrusel de la tarjeta de salón (HU-07 fotos).
 *
 *  - Solo con puntero fino (mouse) y conexión; en táctil o sin conexión la tarjeta no cambia.
 *  - Al entrar el mouse avanza solo cada 1.5 s (salvo prefers-reduced-motion: solo flechas).
 *  - Carga diferida: las fotos extra se piden hasta el primer hover, y siempre la siguiente.
 *  - Al salir el mouse (y sin foco de teclado) regresa a la primera foto.
 */

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import useConexion from "../utils/useConexion";
import { INTERVALO_CARRUSEL, conPrecarga, moverIndice, tieneCarrusel } from "./carrusel.logica";

const ES_WEB = Platform.OS === "web" && typeof window !== "undefined" && !!window.matchMedia;

function coincide(consulta) {
  return ES_WEB && window.matchMedia(consulta).matches;
}

export default function useCarrusel(fotos) {
  const total = fotos.length;
  const enLinea = useConexion();
  const [punteroFino] = useState(() => coincide("(hover: hover) and (pointer: fine)"));
  const [menosMovimiento] = useState(() => coincide("(prefers-reduced-motion: reduce)"));

  const [indice, setIndice] = useState(0);
  const [cargadas, setCargadas] = useState([0]);
  const [sobre, setSobre] = useState(false); // mouse encima
  const [foco, setFoco] = useState(false); // foco de teclado en la tarjeta o en las flechas
  const quitarFoco = useRef(null);
  const quitarSobre = useRef(null);
  // Copias para los temporizadores (siempre el valor más reciente)
  const sobreActual = useRef(false);
  const focoActual = useRef(false);

  const habilitado = punteroFino && enLinea && tieneCarrusel(fotos);
  const activo = habilitado && (sobre || foco);

  const indiceActual = useRef(0); // el temporizador lee siempre el índice más reciente

  function ir(paso) {
    const nuevo = moverIndice(indiceActual.current, total, paso);
    indiceActual.current = nuevo;
    setIndice(nuevo);
    setCargadas((c) => conPrecarga(c, nuevo, total));
  }

  function reiniciar() {
    indiceActual.current = 0;
    setIndice(0);
  }

  // Avance automático solo mientras el mouse está encima.
  useEffect(() => {
    if (!habilitado || !sobre || menosMovimiento) return undefined;
    const temporizador = setInterval(() => ir(1), INTERVALO_CARRUSEL);
    return () => clearInterval(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado, sobre, menosMovimiento, total]);

  useEffect(
    () => () => {
      clearTimeout(quitarFoco.current);
      clearTimeout(quitarSobre.current);
    },
    [],
  );

  function ponerSobre(valor) {
    sobreActual.current = valor;
    setSobre(valor);
  }

  function ponerFoco(valor) {
    focoActual.current = valor;
    setFoco(valor);
  }

  return {
    habilitado,
    activo,
    indice,
    cargadas,
    total,
    menosMovimiento,
    // Tarjeta y flechas avisan entrar/salir; al pasar de una a otra se espera un momento para
    // que el carrusel no se reinicie.
    entrar: () => {
      if (!habilitado) return;
      clearTimeout(quitarSobre.current);
      if (!sobreActual.current) setCargadas((c) => conPrecarga(c, indiceActual.current, total));
      ponerSobre(true);
    },
    salir: () => {
      clearTimeout(quitarSobre.current);
      quitarSobre.current = setTimeout(() => {
        ponerSobre(false);
        if (!focoActual.current) reiniciar();
      }, 80);
    },
    // El foco pasa de la tarjeta a sus flechas: se espera un momento antes de ocultarlas.
    enfocar: () => {
      if (!habilitado) return;
      clearTimeout(quitarFoco.current);
      if (!focoActual.current) setCargadas((c) => conPrecarga(c, indiceActual.current, total));
      ponerFoco(true);
    },
    desenfocar: () => {
      clearTimeout(quitarFoco.current);
      quitarFoco.current = setTimeout(() => {
        ponerFoco(false);
        if (!sobreActual.current) reiniciar();
      }, 0);
    },
    anterior: () => ir(-1),
    siguiente: () => ir(1),
  };
}
