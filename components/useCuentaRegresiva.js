/**
 * GlamSpaces · Sprint 10 · Cuenta regresiva en segundos (para "Reenviar código").
 * → { restantes, reiniciar } · `restantes` baja de 1 en 1 hasta 0.
 */

import { useEffect, useState } from "react";

export default function useCuentaRegresiva(segundos) {
  const [restantes, setRestantes] = useState(segundos);

  useEffect(() => {
    if (restantes <= 0) return undefined;
    const t = setTimeout(() => setRestantes((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restantes]);

  return { restantes, reiniciar: () => setRestantes(segundos) };
}
