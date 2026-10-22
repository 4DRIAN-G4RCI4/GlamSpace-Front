/**
 * GlamSpaces · HU-13 · Lógica del calendario de disponibilidad del detalle.
 * Consulta POST /api/salones/disponibilidad (HU-12) por cada mes que se muestra.
 */

import { useEffect, useRef, useState } from "react";
import { obtenerDisponibilidad } from "../../services/salonesApi";
import { textoDeErrorApi } from "../../services/api";
import { fechaHoy, sumarMeses } from "../../utils/fechas";
import { validarFechaEvento } from "./detalleSalon.validaciones";

export default function useDisponibilidad(salonId) {
  const hoy = fechaHoy();
  const [mes, setMes] = useState({ anio: hoy.anio, mes: hoy.mes }); // abre en el mes actual
  const [ocupadas, setOcupadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fechaElegida, setFechaElegida] = useState(null);
  const [aviso, setAviso] = useState(null);

  // Si se cambia de mes rápido, solo cuenta la respuesta de la última consulta.
  const ultimaConsulta = useRef(0);

  async function cargar() {
    const consulta = ++ultimaConsulta.current;
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerDisponibilidad(salonId, mes.anio, mes.mes);
      if (consulta === ultimaConsulta.current) setOcupadas((datos && datos.fechasOcupadas) || []);
    } catch (e) {
      if (consulta === ultimaConsulta.current) setError(textoDeErrorApi(e));
    } finally {
      if (consulta === ultimaConsulta.current) setCargando(false);
    }
  }

  useEffect(() => {
    if (salonId) void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, mes.anio, mes.mes]);

  function cambiarMes(paso) {
    setAviso(null);
    setMes(sumarMeses(mes, paso));
  }

  // Criterio 4: una fecha ocupada (o pasada) no se elige; se explica por qué.
  function elegir(clave) {
    if (cargando || error) return; // sin la disponibilidad del mes no se sabe si está libre
    const motivo = validarFechaEvento(clave, { hoy: hoy.clave, ocupadas });
    if (motivo) {
      setAviso(motivo);
      return;
    }
    setAviso(null);
    setFechaElegida(clave);
  }

  return {
    mes,
    hoy: hoy.clave,
    ocupadas,
    cargando,
    error,
    fechaElegida,
    aviso,
    puedeRetroceder: mes.anio * 12 + mes.mes > hoy.anio * 12 + hoy.mes, // no hay meses pasados
    mesAnterior: () => cambiarMes(-1),
    mesSiguiente: () => cambiarMes(1),
    elegir,
    reintentar: cargar,
  };
}
