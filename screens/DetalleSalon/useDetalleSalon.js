/**
 * GlamSpaces · Lógica del detalle de un salón (destino de las tarjetas de HU-10, HU-13).
 * Consulta POST /api/salones/obtener con el id que recibe la pantalla. El calendario
 * de disponibilidad vive en useDisponibilidad.js.
 *
 * Lo que el cliente elige aquí (fecha, paquete e invitados) pasa ya llenado a la reserva.
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
  const [paqueteId, setPaqueteId] = useState(null);
  const [invitados, setInvitados] = useState("");
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
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  // Paquetes del más barato al más caro, igual que el "precio desde" de la búsqueda.
  const paquetes = salon ? [...salon.paquetes].sort((a, b) => a.precio - b.precio) : [];
  // `fotos` son las URL; `fotosDetalle` trae lo mismo con su id (HU-07 fotos).
  const fotos = (salon && (salon.fotos || (salon.fotosDetalle || []).map((f) => f.url))) || [];

  return {
    salon,
    paquetes,
    fotos,
    fotoActiva,
    setFotoActiva,
    calendario,
    fecha: calendario.fechaElegida,
    paqueteId,
    paqueteElegido: paquetes.find((p) => p.id === paqueteId) || null,
    elegirPaquete: (id) => setPaqueteId((actual) => (actual === id ? null : id)),
    invitados,
    setInvitados: (texto) => setInvitados(texto.replace(/\D/g, "")),
    precioDesde: paquetes.length > 0 ? paquetes[0].precio : null,
    cargando,
    error,
    reintentar: cargar,
  };
}
