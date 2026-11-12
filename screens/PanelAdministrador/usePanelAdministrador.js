/**
 * GlamSpaces · HU-19 · Lógica del panel de administrador de solicitudes.
 *
 *  - Salones del admin:   POST /api/salones/listar { adminId }
 *  - Solicitudes:         POST /api/solicitudes/listarPorSalon { adminId, salonId, estado: "todas" } (HU-18)
 *  - Aceptar / rechazar:  POST /api/solicitudes/aceptar | rechazar { id, adminId } (HU-18 → HU-17)
 *
 * Cada acción se confirma antes de enviarse. Si la API responde con error, la solicitud se queda
 * en la lista con el mensaje (criterio 4). Si sale bien, se recarga la lista y el calendario
 * (criterios 2 y 3): la API ya rechazó las otras pendientes del mismo día y bloqueó la fecha.
 *
 * HU-22 · Sin conexión: salones y solicitudes salen de la caché local (services/cacheLocal.js) con
 * la fecha en que se guardaron, aceptar/rechazar se deshabilita y al volver la conexión se recarga solo.
 */

import { useEffect, useState } from "react";
import { listarSalonesDeAdminConRespaldo } from "../../services/salonesApi";
import { aceptarSolicitud, listarSolicitudesDeSalonConRespaldo, rechazarSolicitud } from "../../services/solicitudesApi";
import { textoDeErrorApi } from "../../services/api";
import { obtenerSesionActiva } from "../../services/sesionStorage";
import useConexion from "../../utils/useConexion";

export const SIN_DATOS_GUARDADOS =
  "Sin conexión y sin datos guardados. Conéctate a internet una vez para que tu panel se guarde en este dispositivo.";

export const mensajeDeError = (e) => (e && e.sinDatosGuardados ? SIN_DATOS_GUARDADOS : textoDeErrorApi(e));

// La más vieja de las fechas de lo que se está mostrando desde la caché (null = todo está al día).
function fechaMasVieja(...fechas) {
  const conFecha = fechas.filter(Boolean);
  return conFecha.length ? new Date(Math.min(...conFecha.map((f) => f.getTime()))) : null;
}

export default function usePanelAdministrador(pestanaInicial = "solicitudes") {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [salones, setSalones] = useState([]);
  const [salonId, setSalonId] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [pestana, setPestana] = useState(pestanaInicial); // "solicitudes" | "calendario"
  const [porConfirmar, setPorConfirmar] = useState(null); // { id, accion: "aceptar" | "rechazar" }
  const [procesandoId, setProcesandoId] = useState(null);
  const [erroresPorId, setErroresPorId] = useState({}); // { [id]: "mensaje de la API" }
  const [aviso, setAviso] = useState(null);
  const [versionCalendario, setVersionCalendario] = useState(0); // al cambiar, el calendario se vuelve a consultar
  const [guardadoSalones, setGuardadoSalones] = useState(null); // Date si los salones salieron de la caché
  const [guardadoSolicitudes, setGuardadoSolicitudes] = useState(null);

  // Al volver la conexión se recarga todo sin que el administrador haga nada.
  const enLinea = useConexion(() => {
    if (sesion && sesion.id) void refrescar();
  });

  const esAdministrador = !!sesion && sesion.tipo_cuenta === "administrador" && !!sesion.id;
  const salon = salones.find((s) => s.id === salonId) || null;

  async function cargarSolicitudes(adminId = sesion && sesion.id, idSalon = salonId) {
    if (!adminId || !idSalon) return;
    setCargando(true);
    setError(null);
    try {
      const r = await listarSolicitudesDeSalonConRespaldo(adminId, idSalon, { estado: "todas" });
      setSolicitudes(r.datos.datos);
      setGuardadoSolicitudes(r.guardadoEn);
    } catch (e) {
      setSolicitudes([]);
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }

  // `preferido`: al recargar se queda en el salón que el administrador estaba viendo.
  async function cargarTodo(adminId, preferido = null) {
    setCargando(true);
    setError(null);
    try {
      const r = await listarSalonesDeAdminConRespaldo(adminId);
      const lista = r.datos;
      setSalones(lista);
      setGuardadoSalones(r.guardadoEn);
      const elegido = lista.some((s) => s.id === preferido) ? preferido : lista.length > 0 ? lista[0].id : null;
      setSalonId(elegido);
      if (elegido) {
        await cargarSolicitudes(adminId, elegido);
      } else {
        setCargando(false);
      }
    } catch (e) {
      setError(mensajeDeError(e));
      setCargando(false);
    }
  }

  async function refrescar() {
    await cargarTodo(sesion.id, salonId);
    setVersionCalendario((v) => v + 1);
  }

  useEffect(() => {
    void (async () => {
      const guardada = await obtenerSesionActiva();
      setSesion(guardada);
      setCargandoSesion(false);
      if (guardada && guardada.tipo_cuenta === "administrador" && guardada.id) {
        await cargarTodo(guardada.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function elegirSalon(id) {
    if (id === salonId) return;
    setSalonId(id);
    setPorConfirmar(null);
    setErroresPorId({});
    setAviso(null);
    void cargarSolicitudes(sesion.id, id);
  }

  // Primer clic: pide confirmar. La acción solo se envía con "Sí, …".
  function pedirConfirmacion(id, accion) {
    setAviso(null);
    setPorConfirmar({ id, accion });
  }

  function cancelarConfirmacion() {
    setPorConfirmar(null);
  }

  async function confirmarAccion() {
    if (!porConfirmar || procesandoId || !puedeAtender) return;
    const { id, accion } = porConfirmar;
    setProcesandoId(id);
    setErroresPorId((actuales) => ({ ...actuales, [id]: null }));
    try {
      const atendida =
        accion === "aceptar" ? await aceptarSolicitud(sesion.id, id) : await rechazarSolicitud(sesion.id, id);
      setPorConfirmar(null);
      setAviso(
        accion === "aceptar"
          ? `Solicitud de ${nombreDe(id)} aceptada. La fecha quedó bloqueada en el calendario` +
              (atendida.solicitudesRechazadas > 0
                ? ` y se rechazaron ${atendida.solicitudesRechazadas} solicitud(es) pendiente(s) de ese día.`
                : ".")
          : `Solicitud de ${nombreDe(id)} rechazada. La fecha sigue disponible.`,
      );
      await cargarSolicitudes();
      setVersionCalendario((v) => v + 1);
    } catch (e) {
      // Criterio 4: el mensaje se muestra en la tarjeta y la solicitud NO se quita de la lista.
      setPorConfirmar(null);
      setErroresPorId((actuales) => ({ ...actuales, [id]: textoDeErrorApi(e) }));
    } finally {
      setProcesandoId(null);
    }
  }

  // Aceptar o rechazar necesita la API: sin conexión (o con datos guardados) no se permite.
  const guardadoEn = fechaMasVieja(guardadoSalones, guardadoSolicitudes);
  const puedeAtender = enLinea && !guardadoEn;

  function nombreDe(id) {
    const s = solicitudes.find((x) => x.id === id);
    return s ? s.nombreCliente : "el cliente";
  }

  return {
    sesion,
    cargandoSesion,
    esAdministrador,
    salones,
    salon,
    elegirSalon,
    solicitudes,
    cargando,
    error,
    recargar: () => cargarSolicitudes(),
    reintentarTodo: refrescar,
    // HU-22
    enLinea,
    guardadoEn,
    puedeAtender,
    pestana,
    setPestana,
    porConfirmar,
    pedirConfirmacion,
    cancelarConfirmacion,
    confirmarAccion,
    procesandoId,
    erroresPorId,
    aviso,
    cerrarAviso: () => setAviso(null),
    versionCalendario,
  };
}
