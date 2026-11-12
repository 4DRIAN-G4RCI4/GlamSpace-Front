/**
 * GlamSpaces · HU-07 (fotos): subida real de imágenes · estado de la sección "Fotos del salón".
 *
 *  - Salón existente (elegido en los chips): sus fotos salen de obtener → fotosDetalle; subir y
 *    eliminar se hacen al momento contra la API.
 *  - Salón nuevo: las fotos elegidas quedan "pendientes" y se suben con subirPendientes(salonId)
 *    cuando el salón ya existe (después de publicarlo). Las que fallen se quedan para reintentar.
 *  - Sin conexión (HU-22) no se sube ni se elimina; nada se encola.
 *
 * Estados de cada foto: "guardada" | "pendiente" | "subiendo" | "error" | "eliminando".
 */

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { eliminarFoto, listarSalonesDeAdmin, obtenerSalon, subirFoto } from "../../services/salonesApi";
import {
  TIPOS_ACEPTADOS,
  cuposDisponibles,
  mensajeDeErrorFoto,
  repartirSeleccion,
  validarArchivo,
} from "../../services/fotos.logica";
import useConexion from "../../utils/useConexion";

export const NUEVO = "nuevo";
export const PUEDE_ELEGIR_ARCHIVOS = Platform.OS === "web" && typeof document !== "undefined";

let siguienteClave = 0;
const nuevaClave = () => `f${++siguienteClave}`;

// Selector de archivos del navegador (solo web): input oculto con accept y selección múltiple.
function elegirArchivosWeb() {
  return new Promise((resolver) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = TIPOS_ACEPTADOS;
    input.multiple = true;
    input.onchange = () => resolver(Array.from(input.files || []));
    input.click();
  });
}

async function primerosBytes(archivo) {
  return Array.from(new Uint8Array(await archivo.slice(0, 12).arrayBuffer()));
}

export default function useFotosSalon(sesion) {
  const adminId = sesion && sesion.id;
  const enLinea = useConexion(() => adminId && void cargarSalones());

  const [salones, setSalones] = useState([]);
  const [salonId, setSalonId] = useState(NUEVO);
  const [fotosPorSalon, setFotosPorSalon] = useState({ [NUEVO]: [] });
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [aviso, setAviso] = useState(null); // mensaje de la sección (validación del cliente, sobrantes…)

  // Las vistas previas locales se liberan al salir.
  const vistasPrevias = useRef(new Set());
  useEffect(() => () => vistasPrevias.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const fotos = fotosPorSalon[salonId] || [];

  function actualizar(id, clave, cambios) {
    setFotosPorSalon((previo) => ({
      ...previo,
      [id]: (previo[id] || []).map((f) => (f.clave === clave ? { ...f, ...cambios } : f)),
    }));
  }

  function quitarDeLista(id, clave) {
    setFotosPorSalon((previo) => ({ ...previo, [id]: (previo[id] || []).filter((f) => f.clave !== clave) }));
  }

  async function cargarSalones() {
    if (!adminId) return;
    try {
      setSalones(await listarSalonesDeAdmin(adminId));
    } catch (e) {
      // Sin la lista solo se pueden agregar fotos al salón nuevo; no es un error de la sección.
    }
  }

  async function cargarFotos(id) {
    setCargando(true);
    setErrorCarga(null);
    try {
      const salon = await obtenerSalon(id);
      const guardadas = (salon.fotosDetalle || []).map((f) => ({ clave: `g${f.fotoId}`, fotoId: f.fotoId, url: f.url, estado: "guardada" }));
      setFotosPorSalon((previo) => ({
        ...previo,
        // Conserva las que fallaron al subir para poder reintentarlas.
        [id]: [...guardadas, ...(previo[id] || []).filter((f) => f.estado === "error")],
      }));
    } catch (e) {
      setErrorCarga(mensajeDeErrorFoto(e));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarSalones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  function elegirSalon(id) {
    setAviso(null);
    setSalonId(id);
    if (id !== NUEVO) void cargarFotos(id);
  }

  async function subirUna(id, foto) {
    actualizar(id, foto.clave, { estado: "subiendo", progreso: 0, error: null });
    try {
      const r = await subirFoto(adminId, id, foto.archivo, (p) => actualizar(id, foto.clave, { progreso: p }));
      actualizar(id, foto.clave, { estado: "guardada", fotoId: r.fotoId, url: r.url, archivo: null, progreso: 1 });
      return true;
    } catch (e) {
      actualizar(id, foto.clave, { estado: "error", error: mensajeDeErrorFoto(e) });
      return false;
    }
  }

  // Abre el selector, valida cada archivo y lo sube (salón existente) o lo deja pendiente (salón nuevo).
  async function agregar() {
    if (!PUEDE_ELEGIR_ARCHIVOS || !enLinea) return;
    setAviso(null);
    const archivos = await elegirArchivosWeb();
    if (!archivos.length) return;

    const ocupadas = fotos.filter((f) => f.estado !== "eliminando").length;
    const { aceptados, sobrantes } = repartirSeleccion(archivos, cuposDisponibles(ocupadas));
    const rechazos = [];
    const nuevas = [];
    for (const archivo of aceptados) {
      const motivo = validarArchivo({ tamano: archivo.size, inicio: await primerosBytes(archivo) });
      if (motivo) {
        rechazos.push(`${archivo.name}: ${motivo}`);
        continue;
      }
      const url = URL.createObjectURL(archivo);
      vistasPrevias.current.add(url);
      nuevas.push({ clave: nuevaClave(), archivo, url, nombre: archivo.name, estado: "pendiente", progreso: 0 });
    }

    const partes = [];
    if (sobrantes) partes.push(`El salón puede tener máximo 8 fotos: no se agregaron ${sobrantes}.`);
    if (rechazos.length) partes.push(rechazos.join(" · "));
    if (partes.length) setAviso(partes.join(" "));

    const id = salonId;
    setFotosPorSalon((previo) => ({ ...previo, [id]: [...(previo[id] || []), ...nuevas] }));
    if (id !== NUEVO) {
      for (const foto of nuevas) await subirUna(id, foto); // una por una: respeta el límite de 8
    }
  }

  function reintentar(clave) {
    const foto = fotos.find((f) => f.clave === clave);
    if (foto && foto.archivo && salonId !== NUEVO && enLinea) void subirUna(salonId, foto);
  }

  // Quita del navegador una foto que todavía no está en la API (pendiente o con error).
  function quitar(clave) {
    const foto = fotos.find((f) => f.clave === clave);
    if (foto && foto.url && vistasPrevias.current.has(foto.url)) {
      URL.revokeObjectURL(foto.url);
      vistasPrevias.current.delete(foto.url);
    }
    quitarDeLista(salonId, clave);
  }

  async function eliminar(clave) {
    const id = salonId;
    const foto = fotos.find((f) => f.clave === clave);
    if (!foto || !foto.fotoId || !enLinea) return;
    actualizar(id, clave, { estado: "eliminando", error: null });
    try {
      await eliminarFoto(adminId, id, foto.fotoId);
      quitarDeLista(id, clave);
    } catch (e) {
      if (e && e.codigo === 2009) {
        quitarDeLista(id, clave); // ya no existía: se quita de la lista
        setAviso(mensajeDeErrorFoto(e));
      } else {
        actualizar(id, clave, { estado: "guardada", error: mensajeDeErrorFoto(e) });
      }
    }
  }

  // Después de crear el salón nuevo: sube sus fotos pendientes y deja la sección en ese salón.
  // → { total, subidas }
  async function subirPendientes(nuevoSalonId) {
    const pendientes = (fotosPorSalon[NUEVO] || []).filter((f) => f.archivo);
    setFotosPorSalon((previo) => ({ ...previo, [NUEVO]: [], [nuevoSalonId]: pendientes }));
    setSalonId(nuevoSalonId);
    void cargarSalones();
    let subidas = 0;
    for (const foto of pendientes) {
      if (await subirUna(nuevoSalonId, foto)) subidas += 1;
    }
    return { total: pendientes.length, subidas };
  }

  const activas = fotos.filter((f) => f.estado !== "eliminando").length;
  return {
    salones,
    salonId,
    elegirSalon,
    fotos,
    cargando,
    errorCarga,
    reintentarCarga: () => salonId !== NUEVO && cargarFotos(salonId),
    aviso,
    enLinea,
    puedeAgregar: PUEDE_ELEGIR_ARCHIVOS && enLinea && cuposDisponibles(activas) > 0,
    lleno: cuposDisponibles(activas) === 0,
    agregar,
    reintentar,
    quitar,
    eliminar,
    subirPendientes,
    esNuevo: salonId === NUEVO,
  };
}
