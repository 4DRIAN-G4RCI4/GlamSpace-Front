/**
 * GlamSpaces · Sprint 7 · La sesión guardada, para las pantallas que solo necesitan saber
 * quién entró (por ejemplo, para decidir si se muestra la invitación a ser administrador).
 *
 * → { sesion, cargando }
 */

import { useEffect, useState } from "react";
import { obtenerSesionActiva } from "../services/sesionStorage";

export default function useSesion() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const guardada = await obtenerSesionActiva();
      if (!vivo) return;
      setSesion(guardada);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  return { sesion, cargando };
}
