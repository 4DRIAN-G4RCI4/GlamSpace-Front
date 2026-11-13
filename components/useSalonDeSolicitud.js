/**
 * GlamSpaces · El salón de una solicitud (fotos, descripción, zona y capacidad) para su detalle.
 * Usa obtener salón con la caché local de HU-22: sin conexión muestra lo último guardado.
 */

import { useEffect, useState } from "react";
import { obtenerSalonConRespaldo } from "../services/salonesApi";
import { textoDeErrorApi } from "../services/api";

export default function useSalonDeSolicitud(usuarioId, salonId) {
  const [salon, setSalon] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!salonId) return undefined;
    let vigente = true;
    setCargando(true);
    setError(null);
    obtenerSalonConRespaldo(usuarioId, salonId)
      .then((r) => vigente && setSalon(r.datos))
      .catch((e) => vigente && setError(e && e.sinDatosGuardados ? "Sin conexión y sin datos guardados de este salón." : textoDeErrorApi(e)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [usuarioId, salonId, intento]);

  return { salon, cargando, error, reintentar: () => setIntento((n) => n + 1) };
}
