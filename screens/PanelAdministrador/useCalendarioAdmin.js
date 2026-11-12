/**
 * GlamSpaces · HU-19 · Calendario del salón en el panel del administrador.
 * Consulta POST /api/salones/disponibilidad (HU-12, con solicitudes confirmadas desde la HU-17)
 * por cada mes que se muestra, y vuelve a consultar cuando cambia `version` (tras aceptar o rechazar).
 * HU-22 · Cada mes consultado se guarda; sin conexión se muestra el último guardado de ese mes.
 */

import { useEffect, useRef, useState } from "react";
import { obtenerDisponibilidadConRespaldo } from "../../services/salonesApi";
import { mensajeDeError } from "./usePanelAdministrador";
import { fechaHoy, sumarMeses } from "../../utils/fechas";

export default function useCalendarioAdmin(adminId, salonId, version, mesInicial) {
  const hoy = fechaHoy();
  const [mes, setMes] = useState(mesInicial || { anio: hoy.anio, mes: hoy.mes });
  const [ocupadas, setOcupadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Si se cambia de mes rápido, solo cuenta la respuesta de la última consulta.
  const ultimaConsulta = useRef(0);

  async function cargar() {
    const consulta = ++ultimaConsulta.current;
    setCargando(true);
    setError(null);
    try {
      const { datos } = await obtenerDisponibilidadConRespaldo(adminId, salonId, mes.anio, mes.mes);
      if (consulta === ultimaConsulta.current) setOcupadas((datos && datos.fechasOcupadas) || []);
    } catch (e) {
      if (consulta === ultimaConsulta.current) {
        setError(e && e.sinDatosGuardados ? "Sin conexión y sin datos guardados de este mes." : mensajeDeError(e));
      }
    } finally {
      if (consulta === ultimaConsulta.current) setCargando(false);
    }
  }

  useEffect(() => {
    if (salonId) void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, version, mes.anio, mes.mes]);

  return {
    mes,
    hoy: hoy.clave,
    ocupadas,
    cargando,
    error,
    mesAnterior: () => setMes(sumarMeses(mes, -1)),
    mesSiguiente: () => setMes(sumarMeses(mes, 1)),
    irAlMes: (anio, numeroMes) => setMes({ anio, mes: numeroMes }),
    reintentar: cargar,
  };
}
