/**
 * GlamSpaces · Lógica del detalle de un salón (destino de las tarjetas de HU-10).
 * Consulta POST /api/salones/obtener con el id que recibe la pantalla.
 */

import { useEffect, useState } from "react";
import { obtenerSalon } from "../../services/salonesApi";
import { textoDeErrorApi } from "../../services/api";

export default function useDetalleSalon(salonId) {
  const [salon, setSalon] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setSalon(await obtenerSalon(salonId));
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

  return { salon, paquetes, cargando, error, reintentar: cargar };
}
