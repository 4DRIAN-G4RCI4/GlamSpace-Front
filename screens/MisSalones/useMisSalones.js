/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Lógica de la pantalla "Mis salones".
 *
 * Trae los salones del administrador (con respaldo local: sin conexión se ven los guardados,
 * HU-22) y maneja el borrado con su confirmación.
 *
 * Sin conexión, todo lo que escribe queda deshabilitado con su motivo; nunca se encola un POST.
 */

import { useCallback, useEffect, useState } from "react";
import { eliminarSalon, listarSalonesDeAdminConRespaldo } from "../../services/salonesApi";
import { obtenerSesionActiva } from "../../services/sesionStorage";
import useConexion from "../../utils/useConexion";
import {
  confirmacionEliminarSalon,
  estadoDeAccion,
  fichasDeSalones,
  mensajeDeErrorSalon,
  paginaDeSalones,
} from "./misSalones.logica";

const POR_PAGINA = 9;

export default function useMisSalones() {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardadoEn, setGuardadoEn] = useState(null);
  const [paginas, setPaginas] = useState(1);

  // Diálogo de confirmación y avisos de resultado.
  const [confirmacion, setConfirmacion] = useState(null); // { ...texto, salon }
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }

  const cargar = useCallback(async (adminId) => {
    if (!adminId) return;
    setCargando(true);
    setError(null);
    try {
      const r = await listarSalonesDeAdminConRespaldo(adminId);
      setSalones(r.datos || []);
      setGuardadoEn(r.guardadoEn);
    } catch (e) {
      setSalones([]);
      setError(mensajeDeErrorSalon(e));
    } finally {
      setCargando(false);
    }
  }, []);

  // Al volver la conexión se recarga sola.
  const enLinea = useConexion(() => {
    if (sesion && sesion.id) void cargar(sesion.id);
  });

  useEffect(() => {
    void (async () => {
      const guardada = await obtenerSesionActiva();
      setSesion(guardada);
      setCargandoSesion(false);
      if (guardada && guardada.tipo_cuenta === "administrador" && guardada.id) {
        await cargar(guardada.id);
      } else {
        setCargando(false);
      }
    })();
  }, [cargar]);

  const esAdministrador = !!sesion && sesion.tipo_cuenta === "administrador";

  const fichas = fichasDeSalones(salones);
  const { visibles, hayMas } = paginaDeSalones(fichas, paginas, POR_PAGINA);

  const accionCrear = estadoDeAccion("crear", enLinea);
  const accionEliminar = estadoDeAccion("eliminarSalon", enLinea);

  function pedirEliminar(ficha) {
    if (!accionEliminar.habilitada) return;
    setMensaje(null);
    setConfirmacion({ ...confirmacionEliminarSalon(ficha.nombre), salon: ficha });
  }

  function cancelarConfirmacion() {
    if (!eliminando) setConfirmacion(null);
  }

  async function confirmarEliminar() {
    if (!confirmacion || !sesion) return;
    const ficha = confirmacion.salon;
    setEliminando(true);
    try {
      await eliminarSalon(sesion.id, ficha.id);
      // Solo se quita de la lista cuando la API confirmó el borrado.
      setSalones((previos) => previos.filter((s) => s.id !== ficha.id));
      setConfirmacion(null);
      setMensaje({ tipo: "ok", texto: `Se eliminó "${ficha.nombre}".` });
    } catch (e) {
      // Con 2010 (tiene solicitudes) el salón NO se elimina: se muestra el mensaje de la API.
      setConfirmacion(null);
      setMensaje({ tipo: "fail", texto: mensajeDeErrorSalon(e) });
    } finally {
      setEliminando(false);
    }
  }

  return {
    // sesión
    sesion,
    cargandoSesion,
    esAdministrador,
    // lista
    salones: visibles,
    totalSalones: fichas.length,
    vacia: !cargando && fichas.length === 0,
    hayMas,
    verMas: () => setPaginas((p) => p + 1),
    cargando,
    error,
    refrescar: () => sesion && cargar(sesion.id),
    // sin conexión (HU-22)
    enLinea,
    guardadoEn,
    accionCrear,
    accionEliminar,
    // eliminar con confirmación
    confirmacion,
    eliminando,
    pedirEliminar,
    cancelarConfirmacion,
    confirmarEliminar,
    // avisos
    mensaje,
    limpiarMensaje: () => setMensaje(null),
  };
}
