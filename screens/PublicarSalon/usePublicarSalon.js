/**
 * GlamSpaces · HU-07 · Lógica del formulario de publicación de salón.
 *
 * Hook que concentra el estado y las acciones. La pantalla solo pinta lo que
 * este hook le entrega; no hay validaciones ni fetch dentro del JSX.
 *
 * Publicar = 3 pasos contra la API (ver services/salonesApi.js):
 *   crear salón → agregar cada paquete → publicar (PUT).
 */

import { useEffect, useState } from "react";
import { crearSalon, crearPaquete, publicarSalon } from "../../services/salonesApi";
import { textoDeErrorApi } from "../../services/api";
import { obtenerSesionActiva } from "../../services/sesionStorage";
import { aNumero } from "../../utils/validadores";
import { validarPaquete, validarPublicacion } from "./publicarSalon.validaciones";

const PAQUETE_VACIO = { nombre: "", descripcion: "", precio: "" };
const PROGRESO_INICIAL = { salonId: null, enviados: 0 };

export default function usePublicarSalon() {
  // Sesión
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Datos del salón
  const [nombre, setNombre] = useState("");
  const [zona, setZona] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [descripcionSalon, setDescripcionSalon] = useState("");

  // Paquetes
  const [paquetes, setPaquetes] = useState([]);
  const [borrador, setBorrador] = useState(PAQUETE_VACIO);
  const [erroresPaquete, setErroresPaquete] = useState({});

  // Estado general
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }

  // Si algo falla a medias (salón creado, paquete no), aquí queda lo ya enviado
  // para que el reintento no duplique el salón ni los paquetes.
  const [progreso, setProgreso] = useState(PROGRESO_INICIAL);

  useEffect(() => {
    (async () => {
      const sesionGuardada = await obtenerSesionActiva();
      setSesion(sesionGuardada);
      if (sesionGuardada && sesionGuardada.nombre_salon) {
        setNombre(sesionGuardada.nombre_salon);
      }
      setCargandoSesion(false);
    })();
  }, []);

  const esAdministrador = !!sesion && sesion.tipo_cuenta === "administrador";

  // ---- Paquetes ----

  function cambiarBorrador(campo, valor) {
    setBorrador((previo) => ({ ...previo, [campo]: valor }));
  }

  function agregarPaquete() {
    const erroresNuevos = validarPaquete(borrador);
    setErroresPaquete(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) {
      return; // Criterio 3: no se agrega ni se manda a la API
    }

    setPaquetes((previos) => [
      ...previos,
      {
        nombre: borrador.nombre.trim(),
        descripcion: borrador.descripcion.trim(),
        precio: aNumero(borrador.precio),
      },
    ]);
    setBorrador(PAQUETE_VACIO);
    setErroresPaquete({});
    setErrores((previos) => ({ ...previos, paquetes: undefined }));
  }

  function quitarPaquete(indice) {
    if (indice < progreso.enviados) return; // ya está en la API
    setPaquetes((previos) => previos.filter((_, i) => i !== indice));
  }

  // ---- Publicar ----

  async function publicar() {
    setMensaje(null);

    const borradorConDatos =
      !!borrador.nombre.trim() || !!borrador.descripcion.trim() || !!borrador.precio.trim();

    const erroresForm = validarPublicacion({
      nombre,
      zona,
      capacidad,
      paquetes,
      borradorConDatos,
    });
    setErrores(erroresForm);

    if (Object.keys(erroresForm).length > 0) {
      const soloPaquetes = Object.keys(erroresForm).length === 1 && erroresForm.paquetes;
      setMensaje({
        tipo: "fail",
        texto: soloPaquetes || "Revisa los campos marcados en rojo.",
      });
      return;
    }

    // La API pide el adminId (el id que regresa el login). Las sesiones guardadas
    // antes de esta versión no lo traen.
    if (!sesion || sesion.id === undefined || sesion.id === null) {
      setMensaje({
        tipo: "fail",
        texto: "Tu sesión es de una versión anterior. Cierra sesión y vuelve a entrar para poder publicar.",
      });
      return;
    }
    const adminId = sesion.id;

    const datosSalon = {
      adminId,
      nombre: nombre.trim(),
      zona: zona.trim(),
      capacidad: aNumero(capacidad),
      descripcion: descripcionSalon.trim(),
    };

    setEnviando(true);
    let salonId = progreso.salonId;
    let enviados = progreso.enviados;

    try {
      // 1) Crear el salón (nace "no_publicado")
      if (!salonId) {
        const salon = await crearSalon(datosSalon);
        salonId = salon.id;
        setProgreso({ salonId, enviados });
      }

      // 2) Agregar los paquetes que falten
      while (enviados < paquetes.length) {
        await crearPaquete(salonId, adminId, paquetes[enviados]);
        enviados += 1;
        setProgreso({ salonId, enviados });
      }

      // 3) Publicar (la API exige al menos un paquete)
      await publicarSalon(salonId, datosSalon);

      // Criterio 4: confirmación al administrador
      setMensaje({
        tipo: "ok",
        texto: `¡Listo! "${datosSalon.nombre}" ya está publicado con ${paquetes.length} ${
          paquetes.length === 1 ? "paquete" : "paquetes"
        }.`,
      });
      setNombre(sesion.nombre_salon ? sesion.nombre_salon : "");
      setZona("");
      setCapacidad("");
      setDescripcionSalon("");
      setPaquetes([]);
      setBorrador(PAQUETE_VACIO);
      setErrores({});
      setErroresPaquete({});
      setProgreso(PROGRESO_INICIAL);
    } catch (error) {
      const parcial = salonId
        ? " Tu salón ya se guardó; vuelve a pulsar Publicar para terminar."
        : "";
      setMensaje({ tipo: "fail", texto: textoDeErrorApi(error) + parcial });
    } finally {
      setEnviando(false);
    }
  }

  return {
    // sesión
    cargandoSesion,
    esAdministrador,
    // datos del salón
    nombre,
    setNombre,
    zona,
    setZona,
    capacidad,
    setCapacidad,
    descripcionSalon,
    setDescripcionSalon,
    // paquetes
    paquetes,
    borrador,
    cambiarBorrador,
    erroresPaquete,
    agregarPaquete,
    quitarPaquete,
    paquetesEnviados: progreso.enviados,
    // envío
    errores,
    enviando,
    mensaje,
    publicar,
  };
}
