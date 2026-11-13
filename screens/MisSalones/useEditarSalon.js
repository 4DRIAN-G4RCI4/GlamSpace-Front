/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Lógica de "Editar salón" (y de crear uno nuevo).
 *
 * Al abrir con un salonId, se pide el salón a la API (obtener) y se MUESTRAN todos sus datos:
 * nombre, zona, capacidad, descripción, estado, paquetes y fotos. Sin salonId, el formulario
 * nace vacío (el nombre NO se prellena con el correo ni con el nombre del usuario).
 *
 * Todo lo que escribe pasa antes por el diálogo de confirmación (misSalones.logica.js):
 * guardar, eliminar salón, eliminar paquete, cambiar entre publicado y borrador y salir
 * con cambios sin guardar. Sin conexión queda deshabilitado con su motivo (HU-22).
 */

import { useCallback, useEffect, useState } from "react";
import {
  actualizarPaquete,
  actualizarSalon,
  crearPaquete,
  crearSalon,
  eliminarPaquete,
  eliminarSalon,
  obtenerSalonParaEditar,
} from "../../services/salonesApi";
import { obtenerSesionActiva } from "../../services/sesionStorage";
import { aNumero } from "../../utils/validadores";
import useConexion from "../../utils/useConexion";
import useFotosSalon from "../PublicarSalon/useFotosSalon";
import {
  ESTADO_BORRADOR,
  ESTADO_PUBLICADO,
  confirmacionCambiarEstado,
  confirmacionEliminarPaquete,
  confirmacionEliminarSalon,
  confirmacionGuardar,
  confirmacionSalirSinGuardar,
  estadoDeAccion,
  hayCambiosSinGuardar,
  mensajeDeErrorSalon,
} from "./misSalones.logica";
import { puedeQuitarPaquete, validarGuardado, validarPaquete } from "./editarSalon.validaciones";

const PAQUETE_VACIO = { nombre: "", descripcion: "", precio: "" };

const FORMULARIO_VACIO = {
  nombre: "",
  zona: "",
  capacidad: "",
  descripcion: "",
  estado: ESTADO_BORRADOR,
  paquetes: [],
};

// La API regresa los paquetes como { id, nombrePaquete, descripcion, precio }.
function aPaqueteDelFormulario(p) {
  return {
    id: p.id,
    nombre: p.nombrePaquete ?? p.nombre ?? "",
    descripcion: p.descripcion ?? "",
    precio: p.precio,
  };
}

export default function useEditarSalon(salonId) {
  const esNuevo = !salonId;

  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [original, setOriginal] = useState(esNuevo ? FORMULARIO_VACIO : null);
  const [cargando, setCargando] = useState(!esNuevo);
  const [errorCarga, setErrorCarga] = useState(null);

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }

  // Paquete que se está escribiendo (para agregar uno nuevo).
  const [borrador, setBorrador] = useState(PAQUETE_VACIO);
  const [erroresPaquete, setErroresPaquete] = useState({});

  const [confirmacion, setConfirmacion] = useState(null);

  const enLinea = useConexion();
  const fotos = useFotosSalon(sesion);

  // ---------- Carga ----------

  const cargar = useCallback(async () => {
    if (esNuevo) return;
    setCargando(true);
    setErrorCarga(null);
    try {
      const salon = await obtenerSalonParaEditar(salonId);
      const datos = {
        nombre: salon.nombre ?? "",
        zona: salon.zona ?? "",
        capacidad: salon.capacidad == null ? "" : String(salon.capacidad),
        descripcion: salon.descripcion ?? "",
        estado: salon.estado ?? ESTADO_BORRADOR,
        paquetes: (salon.paquetes || []).map(aPaqueteDelFormulario),
      };
      setFormulario(datos);
      setOriginal(datos);
    } catch (e) {
      setErrorCarga(mensajeDeErrorSalon(e));
    } finally {
      setCargando(false);
    }
  }, [esNuevo, salonId]);

  useEffect(() => {
    void (async () => {
      const guardada = await obtenerSesionActiva();
      setSesion(guardada);
      setCargandoSesion(false);
      if (guardada && guardada.tipo_cuenta === "administrador") await cargar();
      else setCargando(false);
    })();
  }, [cargar]);

  // Las fotos de la sección se manejan sobre el salón que se está editando.
  useEffect(() => {
    if (!esNuevo && salonId && fotos.elegirSalon) fotos.elegirSalon(salonId);
    // Solo al cambiar de salón.
  }, [esNuevo, salonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const esAdministrador = !!sesion && sesion.tipo_cuenta === "administrador";
  const hayCambios = hayCambiosSinGuardar(original, formulario);

  const accionGuardar = estadoDeAccion("guardar", enLinea);
  const accionEliminar = estadoDeAccion("eliminarSalon", enLinea);

  // ---------- Campos ----------

  function cambiar(campo, valor) {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previos) => ({ ...previos, [campo]: undefined }));
  }

  // La elige el autocompletado de ubicación (CP o dirección) o se escribe a mano.
  function cambiarZona(zona) {
    cambiar("zona", zona);
  }

  // ---------- Paquetes ----------

  function cambiarBorrador(campo, valor) {
    setBorrador((previo) => ({ ...previo, [campo]: valor }));
  }

  function agregarPaquete() {
    const erroresNuevos = validarPaquete(borrador);
    setErroresPaquete(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) return;

    setFormulario((previo) => ({
      ...previo,
      paquetes: [
        ...previo.paquetes,
        {
          id: null, // todavía no existe en la API
          nombre: borrador.nombre.trim(),
          descripcion: borrador.descripcion.trim(),
          precio: aNumero(borrador.precio),
        },
      ],
    }));
    setBorrador(PAQUETE_VACIO);
    setErroresPaquete({});
    setErrores((previos) => ({ ...previos, paquetes: undefined }));
  }

  function editarPaquete(indice, campo, valor) {
    setFormulario((previo) => ({
      ...previo,
      paquetes: previo.paquetes.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)),
    }));
  }

  function pedirQuitarPaquete(indice) {
    const paquete = formulario.paquetes[indice];
    const permiso = puedeQuitarPaquete(formulario);
    if (!permiso.permitido) {
      setMensaje({ tipo: "fail", texto: permiso.motivo });
      return;
    }
    setConfirmacion({
      ...confirmacionEliminarPaquete(paquete.nombre || "sin nombre"),
      alConfirmar: () => quitarPaquete(indice),
    });
  }

  // Los paquetes que ya existen en la API se borran allá; los nuevos solo salen de la lista.
  async function quitarPaquete(indice) {
    const paquete = formulario.paquetes[indice];
    setConfirmacion(null);

    if (paquete.id && sesion) {
      try {
        await eliminarPaquete(sesion.id, paquete.id);
      } catch (e) {
        setMensaje({ tipo: "fail", texto: mensajeDeErrorSalon(e) });
        return;
      }
    }

    setFormulario((previo) => ({ ...previo, paquetes: previo.paquetes.filter((_, i) => i !== indice) }));
    setOriginal((previo) => (previo ? { ...previo, paquetes: previo.paquetes.filter((p) => p.id !== paquete.id) } : previo));
    setMensaje({ tipo: "ok", texto: "Se eliminó el paquete." });
  }

  // ---------- Guardar ----------

  function pedirGuardar() {
    if (!accionGuardar.habilitada) return;
    setMensaje(null);

    const erroresForm = validarGuardado(formulario);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      setMensaje({ tipo: "fail", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    setConfirmacion({
      ...confirmacionGuardar(formulario.nombre.trim()),
      alConfirmar: guardar,
    });
  }

  async function guardar() {
    if (!sesion) return;
    setGuardando(true);
    try {
      const datos = {
        adminId: sesion.id,
        nombre: formulario.nombre.trim(),
        zona: formulario.zona.trim(),
        capacidad: aNumero(formulario.capacidad),
        descripcion: formulario.descripcion.trim(),
        estado: formulario.estado,
      };

      // 1) El salón: se crea o se actualiza.
      let id = salonId;
      if (esNuevo) {
        const creado = await crearSalon(datos);
        id = creado.id;
      }

      // 2) Los paquetes: los nuevos se crean, los que ya existían se actualizan.
      for (const paquete of formulario.paquetes) {
        const datosPaquete = { ...paquete, precio: aNumero(paquete.precio) };
        if (paquete.id) await actualizarPaquete(sesion.id, datosPaquete);
        else await crearPaquete(id, sesion.id, datosPaquete);
      }

      // 3) El estado se manda al final: publicar exige que ya haya paquetes (2003).
      await actualizarSalon(id, datos);

      // 4) Las fotos pendientes de un salón nuevo se suben ahora que ya existe.
      if (esNuevo && fotos.subirPendientes) await fotos.subirPendientes(id);

      setConfirmacion(null);
      setMensaje({ tipo: "ok", texto: `Se guardaron los cambios de "${datos.nombre}".` });
      if (esNuevo) return { creado: id };
      await cargar();
      return { guardado: true };
    } catch (e) {
      setConfirmacion(null);
      setMensaje({ tipo: "fail", texto: mensajeDeErrorSalon(e) });
      return { error: true };
    } finally {
      setGuardando(false);
    }
  }

  // ---------- Publicado / borrador ----------

  function pedirCambiarEstado() {
    if (!accionGuardar.habilitada) return;
    setConfirmacion({
      ...confirmacionCambiarEstado(formulario),
      alConfirmar: () => {
        const nuevo = formulario.estado === ESTADO_PUBLICADO ? ESTADO_BORRADOR : ESTADO_PUBLICADO;
        setFormulario((previo) => ({ ...previo, estado: nuevo }));
        setConfirmacion(null);
        setMensaje({
          tipo: "ok",
          texto:
            nuevo === ESTADO_PUBLICADO
              ? "El salón quedará publicado al guardar los cambios."
              : "El salón quedará como borrador al guardar los cambios.",
        });
      },
    });
  }

  // ---------- Eliminar el salón ----------

  function pedirEliminarSalon() {
    if (esNuevo || !accionEliminar.habilitada) return;
    setConfirmacion({
      ...confirmacionEliminarSalon(formulario.nombre || "este salón"),
      alConfirmar: null, // lo resuelve la pantalla: al borrar hay que regresar a la lista
      esEliminarSalon: true,
    });
  }

  async function confirmarEliminarSalon() {
    if (!sesion || esNuevo) return { error: true };
    setGuardando(true);
    try {
      await eliminarSalon(sesion.id, salonId);
      setConfirmacion(null);
      return { eliminado: true };
    } catch (e) {
      // 2010: tiene solicitudes pendientes o confirmadas → no se elimina, se muestra el mensaje.
      setConfirmacion(null);
      setMensaje({ tipo: "fail", texto: mensajeDeErrorSalon(e) });
      return { error: true };
    } finally {
      setGuardando(false);
    }
  }

  // ---------- Salir ----------

  // Solo pregunta si de verdad hay algo sin guardar.
  function pedirSalir(alSalir) {
    if (!hayCambios) {
      alSalir();
      return;
    }
    setConfirmacion({
      ...confirmacionSalirSinGuardar(),
      alConfirmar: () => {
        setConfirmacion(null);
        alSalir();
      },
    });
  }

  function cancelarConfirmacion() {
    if (!guardando) setConfirmacion(null);
  }

  return {
    // sesión y carga
    sesion,
    cargandoSesion,
    esAdministrador,
    esNuevo,
    cargando,
    errorCarga,
    recargar: cargar,
    // formulario
    formulario,
    cambiar,
    cambiarZona,
    errores,
    hayCambios,
    publicado: formulario.estado === ESTADO_PUBLICADO,
    // paquetes
    borrador,
    cambiarBorrador,
    erroresPaquete,
    agregarPaquete,
    editarPaquete,
    pedirQuitarPaquete,
    // fotos (reutiliza la sección de HU-07)
    fotos,
    // acciones
    guardando,
    pedirGuardar,
    pedirCambiarEstado,
    pedirEliminarSalon,
    confirmarEliminarSalon,
    pedirSalir,
    // diálogo y avisos
    confirmacion,
    cancelarConfirmacion,
    mensaje,
    limpiarMensaje: () => setMensaje(null),
    // sin conexión
    enLinea,
    accionGuardar,
    accionEliminar,
  };
}
