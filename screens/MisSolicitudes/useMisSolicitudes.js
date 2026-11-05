/**
 * GlamSpaces · HU-16 · Lógica de "Mis solicitudes" (criterio 4).
 *
 *  - Lista las solicitudes del cliente: POST /api/solicitudes/listar (paginado).
 *  - "Actualizar estado" vuelve a consultar una sola: POST /api/solicitudes/obtener.
 */

import { useEffect, useState } from "react";
import { listarSolicitudes, obtenerSolicitud } from "../../services/solicitudesApi";
import { textoDeErrorApi } from "../../services/api";
import { obtenerSesionActiva } from "../../services/sesionStorage";

const TAMANO_PAGINA = 10;

export default function useMisSolicitudes() {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [solicitudes, setSolicitudes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [actualizandoId, setActualizandoId] = useState(null);
  const [avisos, setAvisos] = useState({}); // { [id]: "texto" } tras actualizar una

  const esCliente = !!sesion && sesion.tipo_cuenta === "cliente" && !!sesion.id;

  async function cargar(paginaPedida, clienteId = sesion && sesion.id) {
    setCargando(true);
    setError(null);
    try {
      const r = await listarSolicitudes(clienteId, { pagina: paginaPedida, tamanoPagina: TAMANO_PAGINA });
      // La página 1 reemplaza la lista; las siguientes se agregan al final ("Ver más").
      setSolicitudes((actuales) => (paginaPedida === 1 ? r.datos : [...actuales, ...r.datos]));
      setPagina(paginaPedida);
      setTotalPaginas(r.totalPaginas || 0);
      if (paginaPedida === 1) setAvisos({});
    } catch (e) {
      setError(textoDeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void (async () => {
      const guardada = await obtenerSesionActiva();
      setSesion(guardada);
      setCargandoSesion(false);
      if (guardada && guardada.tipo_cuenta === "cliente" && guardada.id) {
        await cargar(1, guardada.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function actualizarEstado(solicitudId) {
    setActualizandoId(solicitudId);
    try {
      const nueva = await obtenerSolicitud(sesion.id, solicitudId);
      const anterior = solicitudes.find((s) => s.id === solicitudId);
      setSolicitudes((actuales) => actuales.map((s) => (s.id === solicitudId ? nueva : s)));
      const cambio = anterior && anterior.estado !== nueva.estado;
      setAvisos((a) => ({ ...a, [solicitudId]: cambio ? "¡El estado cambió!" : "Sin cambios por ahora." }));
    } catch (e) {
      setAvisos((a) => ({ ...a, [solicitudId]: textoDeErrorApi(e) }));
    } finally {
      setActualizandoId(null);
    }
  }

  return {
    sesion,
    cargandoSesion,
    esCliente,
    solicitudes,
    cargando,
    error,
    hayMas: pagina < totalPaginas,
    verMas: () => cargar(pagina + 1),
    recargar: () => cargar(1),
    actualizandoId,
    avisos,
    actualizarEstado,
  };
}
