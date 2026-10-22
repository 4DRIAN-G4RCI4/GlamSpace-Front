/**
 * GlamSpaces · Lógica del detalle de un salón (destino de las tarjetas de HU-10, HU-13).
 * Consulta POST /api/salones/obtener con el id que recibe la pantalla. El calendario
 * de disponibilidad vive en useDisponibilidad.js.
 */

import { useEffect, useState } from "react";
import { obtenerSalon } from "../../services/salonesApi";
import { textoDeErrorApi } from "../../services/api";
import useDisponibilidad from "./useDisponibilidad";

export default function useDetalleSalon(salonId) {
  const [salon, setSalon] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fotoActiva, setFotoActiva] = useState(0); // galería: índice de la foto grande
  const calendario = useDisponibilidad(salonId);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setSalon(await obtenerSalon(salonId));
      setFotoActiva(0);
    } catch (e) {
      setError(textoDeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  // Paquetes del más barato al más caro, igual que el "precio desde" de la búsqueda.
  const paquetes = salon ? [...salon.paquetes].sort((a, b) => a.precio - b.precio) : [];
  const fotos = (salon && salon.fotos) || [];

  return { salon, paquetes, fotos, fotoActiva, setFotoActiva, calendario, cargando, error, reintentar: cargar };
}
