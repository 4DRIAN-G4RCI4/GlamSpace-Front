/**
 * GlamSpaces · HU-16 · Lógica del flujo de solicitud de reservación (Figma Cliente 04 y 05).
 *
 *  - Paso "elegir" (Cliente 04): fecha (calendario con disponibilidad), paquete, tipo de evento,
 *    invitados, teléfono y comentarios, con el resumen y el total estimado.
 *  - Paso "confirmar" (Cliente 05): datos de contacto prellenados de la sesión y términos.
 *  - Lo elegido viaja en los parámetros de la pantalla (`borrador`): sobrevive al botón Atrás,
 *    a recargar la página y a iniciar sesión a la mitad.
 *  - Envía a POST /api/solicitudes/crear solo lo que guarda la API (solicitudes.logica.js).
 *  - Sin conexión (HU-22) el envío queda deshabilitado; no se guarda ni se encola ningún POST.
 */

import { useEffect, useState } from "react";
import { obtenerSalon } from "../../services/salonesApi";
import { crearSolicitud } from "../../services/solicitudesApi";
import { mensajeDeErrorSolicitud } from "../../services/solicitudes.logica";
import { textoDeErrorApi } from "../../services/api";
import { obtenerSesionActiva } from "../../services/sesionStorage";
import useConexion from "../../utils/useConexion";
import useDisponibilidad from "../DetalleSalon/useDisponibilidad";
import { validarPasoConfirmar, validarPasoElegir, resumenErrores } from "./solicitudReservacion.validaciones";

const CAMPOS_ELEGIR = ["fecha", "tipoEvento", "invitados", "telefono", "comentarios"];
const CAMPOS_CONFIRMAR = ["nombre", "telefono", "correo", "terminos"];

export default function useSolicitudReservacion(params, navigation) {
  const { salonId = null, borrador: inicial = {}, paso = "elegir", enviada: enviadaParam = null } = params || {};

  const [salon, setSalon] = useState(null);
  const [cargandoSalon, setCargandoSalon] = useState(true);
  const [errorSalon, setErrorSalon] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Paso 1 · Cliente 04 (la fecha la guarda el calendario)
  const calendario = useDisponibilidad(salonId, inicial.fecha || null);
  const [paqueteId, setPaqueteId] = useState(inicial.paqueteId || null);
  const [tipoEvento, setTipoEvento] = useState(inicial.tipoEvento || "");
  const [invitados, setInvitados] = useState(inicial.invitados || "");
  const [telefono, setTelefono] = useState(inicial.telefono || "");
  const [comentarios, setComentarios] = useState(inicial.comentarios || "");

  // Paso 2 · Cliente 05 (nombre y correo solo se muestran y validan: la API no los guarda)
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [terminos, setTerminos] = useState(false);

  const [tocados, setTocados] = useState({}); // los errores se ven al salir del campo
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null); // { texto, accion }
  const [enviada, setEnviada] = useState(enviadaParam);
  const enLinea = useConexion();

  async function cargarSalon() {
    setCargandoSalon(true);
    setErrorSalon(null);
    try {
      setSalon(await obtenerSalon(salonId));
    } catch (e) {
      setErrorSalon(textoDeErrorApi(e));
    } finally {
      setCargandoSalon(false);
    }
  }

  useEffect(() => {
    if (salonId) void cargarSalon();
    void (async () => {
      const guardada = await obtenerSesionActiva();
      setSesion(guardada);
      if (guardada) {
        setNombre((n) => n || guardada.nombre || "");
        setCorreo((c) => c || guardada.correo || "");
      }
      setCargandoSesion(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  const fecha = calendario.fechaElegida;
  const paquetes = salon ? [...salon.paquetes].sort((a, b) => a.precio - b.precio) : [];
  const paqueteElegido = paquetes.find((p) => p.id === paqueteId) || null;
  const borrador = { fecha, paqueteId, invitados, tipoEvento, telefono, comentarios };

  const erroresElegir = validarPasoElegir({
    fecha,
    hoy: calendario.hoy,
    ocupadas: calendario.ocupadas,
    tipoEvento,
    invitados,
    capacidad: salon ? salon.capacidad : null,
    telefono,
    comentarios,
  });
  const erroresConfirmar = validarPasoConfirmar({ nombre, telefono, correo, terminos });

  // Una sesión vieja sin `id` no sirve: la API necesita el clienteId.
  const esCliente = !!sesion && sesion.tipo_cuenta === "cliente" && !!sesion.id;

  // El error de un campo se muestra si ya se tocó.
  const visibles = (errores) => Object.fromEntries(Object.entries(errores).filter(([campo]) => tocados[campo]));
  const tocar = (campo) => () => setTocados((t) => (t[campo] ? t : { ...t, [campo]: true }));
  const tocarTodos = (campos) => setTocados((t) => ({ ...t, ...Object.fromEntries(campos.map((c) => [c, true])) }));

  function irAPaso(nuevoPaso) {
    if (!navigation) return;
    navigation.navigate("SolicitudReservacion", { salonId, paso: nuevoPaso, borrador });
  }

  function continuar() {
    if (Object.keys(erroresElegir).length > 0) {
      tocarTodos(CAMPOS_ELEGIR);
      return;
    }
    // Se guarda lo elegido en la entrada actual del historial: con "Atrás" vuelve igual.
    if (navigation && navigation.reemplazar) navigation.reemplazar("SolicitudReservacion", { salonId, paso: "elegir", borrador });
    irAPaso("confirmar");
  }

  function iniciarSesion() {
    if (navigation) navigation.navigate("Login", { volverA: { nombre: "SolicitudReservacion", params: { salonId, paso: "confirmar", borrador } } });
  }

  async function enviar() {
    setErrorEnvio(null);
    if (Object.keys(erroresConfirmar).length > 0) {
      tocarTodos(CAMPOS_CONFIRMAR);
      return;
    }
    if (!puedeEnviar) return;
    setEnviando(true);
    try {
      const creada = await crearSolicitud(sesion.id, { salonId, ...borrador });
      setEnviada(creada);
      // Sin borrador en el historial: con "Atrás" no se puede volver a mandar lo mismo.
      if (navigation && navigation.reemplazar) navigation.reemplazar("SolicitudReservacion", { salonId, paso: "enviada", enviada: creada });
    } catch (e) {
      setErrorEnvio(mensajeDeErrorSolicitud(e));
    } finally {
      setEnviando(false);
    }
  }

  const listoElegir = Object.keys(erroresElegir).length === 0;
  const puedeEnviar = esCliente && enLinea && listoElegir && Object.keys(erroresConfirmar).length === 0 && !enviando;

  return {
    paso: enviada ? "enviada" : paso,
    salonId,
    salon,
    cargando: cargandoSalon || cargandoSesion,
    errorSalon,
    reintentarSalon: cargarSalon,
    sesion,
    esCliente,
    enLinea,
    calendario,
    fecha,
    paquetes,
    paqueteId,
    paqueteElegido,
    elegirPaquete: (id) => setPaqueteId((actual) => (actual === id ? null : id)),
    total: paqueteElegido ? paqueteElegido.precio : null,
    tipoEvento,
    setTipoEvento,
    invitados,
    setInvitados: (texto) => setInvitados(texto.replace(/\D/g, "")),
    telefono,
    setTelefono,
    comentarios,
    setComentarios,
    nombre,
    setNombre,
    correo,
    setCorreo,
    terminos,
    alternarTerminos: () => {
      setTerminos((v) => !v);
      tocar("terminos")();
    },
    tocar,
    erroresElegir: visibles(erroresElegir),
    erroresConfirmar: visibles(erroresConfirmar),
    faltanElegir: resumenErrores(erroresElegir),
    faltanConfirmar: resumenErrores({ ...(listoElegir ? {} : { detalles: "x" }), ...erroresConfirmar }),
    listoElegir,
    puedeEnviar,
    enviando,
    errorEnvio,
    enviada,
    continuar,
    volverAElegir: () => irAPaso("elegir"),
    iniciarSesion,
    enviar,
  };
}
