/**
 * GlamSpaces · HU-16 (+ Sprint 7) · Lógica de "Mis solicitudes" del cliente.
 *
 *  - Lista las solicitudes del cliente: POST /api/solicitudes/listar.
 *  - "Actualizar estado" vuelve a consultar una sola: POST /api/solicitudes/obtener.
 *
 * Sprint 7: filtros por estado con contadores del TOTAL y paginación de 10 en 10 (2 columnas
 * × 5 filas). Para que los contadores y los filtros sean del total y no de una página, se piden
 * todas las solicitudes del cliente de una vez (son las suyas, no el catálogo entero) y el
 * filtrado y la paginación se hacen en memoria con funciones puras y probadas.
 *
 * La FOTO del salón: POST /api/solicitudes/listar todavía no la manda. La tarjeta usa
 * `fotoPrincipal` si llega y mientras tanto pinta el marcador; NO se pide el salón de cada
 * solicitud, porque sería una llamada por tarjeta. Ver el contrato pendiente en el README.
 */

import { useEffect, useState } from "react";
import { listarSolicitudes, obtenerSolicitud } from "../../services/solicitudesApi";
import { textoDeErrorApi } from "../../services/api";
import { obtenerSesionActiva } from "../../services/sesionStorage";
import { POR_PAGINA_SOLICITUDES, paginar } from "../../services/paginacion.logica";
import {
  contarPorEstado,
  listaDeMisSolicitudes,
  tarjetasDeSolicitudes,
  textoSinResultados,
} from "./misSolicitudes.logica";

// Las solicitudes son las del propio cliente: caben en una sola petición.
const TAMANO_PETICION = 200;

export default function useMisSolicitudes() {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Filtros, orden y página (Sprint 7).
  const [estado, setEstado] = useState("todas");
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);

  const [actualizandoId, setActualizandoId] = useState(null);
  const [avisos, setAvisos] = useState({}); // { [id]: "texto" } tras actualizar una

  const esCliente = !!sesion && sesion.tipo_cuenta === "cliente" && !!sesion.id;

  async function cargar(clienteId = sesion && sesion.id) {
    setCargando(true);
    setError(null);
    try {
      const r = await listarSolicitudes(clienteId, { pagina: 1, tamanoPagina: TAMANO_PETICION });
      setSolicitudes(r.datos);
      setAvisos({});
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
        await cargar(guardada.id);
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

  // Contadores del TOTAL (no de la página) y lista filtrada y ordenada.
  const conteo = contarPorEstado(solicitudes);
  const lista = tarjetasDeSolicitudes(listaDeMisSolicitudes(solicitudes, estado, orden));
  const p = paginar(lista, pagina, POR_PAGINA_SOLICITUDES);

  return {
    sesion,
    cargandoSesion,
    esCliente,
    // lista ya filtrada, ordenada y paginada
    solicitudes: p.visibles,
    paginacion: p,
    irAPagina: setPagina,
    // filtros (Sprint 7)
    estado,
    orden,
    conteo,
    sinResultados: lista.length === 0,
    textoVacio: textoSinResultados(estado),
    cambiarEstado: (clave) => { setEstado(clave); setPagina(1); },
    cambiarOrden: (clave) => { setOrden(clave); setPagina(1); },
    // estado general
    cargando,
    error,
    recargar: () => cargar(),
    actualizandoId,
    avisos,
    actualizarEstado,
  };
}
