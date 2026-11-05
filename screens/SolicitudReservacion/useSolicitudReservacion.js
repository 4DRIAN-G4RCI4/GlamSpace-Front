/**
 * GlamSpaces · HU-16 · Lógica del formulario de solicitud de reservación.
 *
 *  - Recibe del detalle (HU-13) el salón, su capacidad, sus paquetes y la fecha elegida.
 *  - Solo un cliente con sesión puede enviar; el nombre sale de su cuenta.
 *  - Valida antes de enviar y dice qué falta (criterio 2).
 *  - Envía a POST /api/solicitudes/crear (HU-15) y guarda la solicitud creada (criterio 1).
 *  - Si la API dice que la fecha ya no está disponible, lo marca para sugerir otra (criterio 3).
 */

import { useEffect, useState } from "react";
import { crearSolicitud, CODIGOS_SOLICITUD } from "../../services/solicitudesApi";
import { textoDeErrorApi } from "../../services/api";
import { obtenerSesionActiva } from "../../services/sesionStorage";
import { aNumero } from "../../utils/validadores";
import { validarSolicitud, resumenErrores } from "./solicitudReservacion.validaciones";

export const TIPOS_EVENTO = ["Boda", "XV años", "Cumpleaños", "Bautizo", "Graduación", "Evento empresarial"];

// 4002 o el 1001 de "fecha pasada": en los dos casos hay que elegir otra fecha.
function esErrorDeFecha(error) {
  if (!error) return false;
  if (error.codigo === CODIGOS_SOLICITUD.fechaNoDisponible) return true;
  return error.codigo === CODIGOS_SOLICITUD.datosInvalidos && /fecha/i.test(error.mensaje || "");
}

export default function useSolicitudReservacion(params) {
  const { salonId = null, nombreSalon = "", capacidad = null, paquetes = [], fecha = null } = params || {};

  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [paqueteId, setPaqueteId] = useState(null); // opcional
  const [tipoEvento, setTipoEvento] = useState("");
  const [invitados, setInvitados] = useState("");
  const [telefono, setTelefono] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { texto, fechaNoDisponible, duplicada }
  const [enviada, setEnviada] = useState(null); // la solicitud que regresó la API

  useEffect(() => {
    void (async () => {
      setSesion(await obtenerSesionActiva());
      setCargandoSesion(false);
    })();
  }, []);

  // Una sesión vieja sin `id` no sirve: la API necesita el clienteId.
  const esCliente = !!sesion && sesion.tipo_cuenta === "cliente" && !!sesion.id;

  // Al corregir un campo se quita su error.
  function cambiar(setter, campo) {
    return (valor) => {
      setter(valor);
      if (errores[campo]) {
        setErrores((actuales) => {
          const copia = { ...actuales };
          delete copia[campo];
          return copia;
        });
      }
    };
  }

  async function enviar() {
    setMensaje(null);

    const erroresForm = validarSolicitud({
      fecha,
      tipoEvento,
      invitados,
      capacidad,
      nombre: sesion && sesion.nombre,
      telefono,
      comentarios,
    });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      setMensaje({ texto: resumenErrores(erroresForm) });
      return;
    }

    setEnviando(true);
    try {
      const solicitud = await crearSolicitud(sesion.id, {
        salonId,
        paqueteId,
        fecha,
        tipoEvento,
        numeroInvitados: aNumero(invitados),
        telefono,
        comentarios,
      });
      setEnviada(solicitud);
    } catch (error) {
      // La API manda el motivo en español; se muestra tal cual.
      setMensaje({
        texto: textoDeErrorApi(error),
        fechaNoDisponible: esErrorDeFecha(error),
        duplicada: error.codigo === CODIGOS_SOLICITUD.solicitudDuplicada,
      });
    } finally {
      setEnviando(false);
    }
  }

  return {
    salonId,
    nombreSalon,
    capacidad,
    paquetes,
    fecha,
    sesion,
    cargandoSesion,
    esCliente,
    paqueteId,
    elegirPaquete: setPaqueteId,
    tipoEvento,
    setTipoEvento: cambiar(setTipoEvento, "tipoEvento"),
    invitados,
    setInvitados: cambiar(setInvitados, "invitados"),
    telefono,
    setTelefono: cambiar(setTelefono, "telefono"),
    comentarios,
    setComentarios: cambiar(setComentarios, "comentarios"),
    errores,
    enviando,
    mensaje,
    enviada,
    enviar,
  };
}
