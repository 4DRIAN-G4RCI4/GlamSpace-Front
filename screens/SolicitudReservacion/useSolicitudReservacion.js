/**
 * GlamSpaces · Lógica de la solicitud de reservación (destino de HU-13).
 * Recibe del detalle el salón, sus paquetes y la fecha ya elegida en el calendario.
 * El envío queda pendiente: la API todavía no tiene endpoint para crear reservaciones.
 */

import { useState } from "react";

export default function useSolicitudReservacion(params) {
  const { salonId = null, nombreSalon = "", paquetes = [], fecha = null } = params || {};
  const [paqueteId, setPaqueteId] = useState(null); // opcional, como PaqueteId en la tabla (HU-11)

  return { salonId, nombreSalon, paquetes, fecha, paqueteId, elegirPaquete: setPaqueteId };
}
