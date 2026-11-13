/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Reglas puras de "Mis salones". Sin React ni red.
 *
 * Aquí viven: cómo se resume cada salón en su ficha, qué acciones piden confirmación y qué
 * texto lleva cada diálogo, y cómo se traducen los códigos de error de la API.
 */

export const ESTADO_PUBLICADO = "publicado";
export const ESTADO_BORRADOR = "no_publicado";

// Códigos de salones que contesta la API (ver MEMORIA.md §6 y el contrato del back).
export const CODIGOS_SALON = {
  noExiste: 2001,
  noEsDueno: 2002,
  sinPaquetes: 2003,
  estadoInvalido: 2004,
  conSolicitudes: 2010, // tiene solicitudes pendientes o confirmadas: no se elimina
  errorInterno: 5000,
};

export function esPublicado(salon) {
  return !!salon && salon.estado === ESTADO_PUBLICADO;
}

export function etiquetaEstado(salon) {
  return esPublicado(salon) ? "Publicado" : "Borrador";
}

/**
 * Lo que necesita pintar una ficha de la lista. Tolera que el back todavía no mande
 * `fotoPrincipal` ni `totalFotos` (mientras no esté desplegado el contrato nuevo).
 * → { id, nombre, zona, capacidad, estado, publicado, etiqueta, fotoPrincipal, totalFotos,
 *     totalPaquetes, textoFotos, textoPaquetes, resumen }
 */
export function fichaDeSalon(salon) {
  const totalFotos = Number(salon.totalFotos) || 0;
  const totalPaquetes = Number(salon.totalPaquetes) || 0;
  const capacidad = Number(salon.capacidad) || 0;

  return {
    id: salon.id,
    nombre: salon.nombre || "Salón sin nombre",
    zona: salon.zona || "Sin zona",
    capacidad,
    estado: salon.estado,
    publicado: esPublicado(salon),
    etiqueta: etiquetaEstado(salon),
    // El back manda null cuando el salón no tiene fotos; la ficha pinta el marcador de posición.
    fotoPrincipal: salon.fotoPrincipal || null,
    totalFotos,
    totalPaquetes,
    textoFotos: `${totalFotos} ${totalFotos === 1 ? "foto" : "fotos"}`,
    textoPaquetes: `${totalPaquetes} ${totalPaquetes === 1 ? "paquete" : "paquetes"}`,
    resumen: `${capacidad} personas · ${totalPaquetes} ${totalPaquetes === 1 ? "paquete" : "paquetes"} · ${totalFotos} ${totalFotos === 1 ? "foto" : "fotos"}`,
  };
}

export function fichasDeSalones(salones) {
  return (Array.isArray(salones) ? salones : []).map(fichaDeSalon);
}

// Muestra la lista por partes para no pintar cientos de fichas de golpe (igual que el panel).
export function paginaDeSalones(lista, paginas, porPagina = 9) {
  const hasta = paginas * porPagina;
  return { visibles: lista.slice(0, hasta), hayMas: lista.length > hasta };
}

// ---------- Confirmaciones ----------

/**
 * Todas las acciones que escriben piden confirmación antes de hacerse.
 * `destructiva` pinta el botón en rojo; `textoConfirmar` dice exactamente qué va a pasar.
 */
export function confirmacionGuardar(nombre) {
  return {
    clave: "guardar",
    titulo: "¿Guardar los cambios?",
    mensaje: `Se actualizará la información de "${nombre}".`,
    textoConfirmar: "Guardar cambios",
    textoCancelar: "Seguir editando",
    destructiva: false,
  };
}

export function confirmacionEliminarSalon(nombre) {
  return {
    clave: "eliminarSalon",
    titulo: "¿Eliminar este salón?",
    mensaje: `Se eliminará "${nombre}" con sus paquetes y sus fotos. Esta acción no se puede deshacer.`,
    textoConfirmar: "Eliminar salón",
    textoCancelar: "Cancelar",
    destructiva: true,
  };
}

export function confirmacionEliminarPaquete(nombre) {
  return {
    clave: "eliminarPaquete",
    titulo: "¿Eliminar este paquete?",
    mensaje: `Se eliminará el paquete "${nombre}" de este salón.`,
    textoConfirmar: "Eliminar paquete",
    textoCancelar: "Cancelar",
    destructiva: true,
  };
}

export function confirmacionEliminarFoto() {
  return {
    clave: "eliminarFoto",
    titulo: "¿Eliminar esta foto?",
    mensaje: "La foto se quitará del salón. Esta acción no se puede deshacer.",
    textoConfirmar: "Eliminar foto",
    textoCancelar: "Cancelar",
    destructiva: true,
  };
}

/**
 * Cambiar entre publicado y borrador. Al publicar se avisa que los clientes lo verán;
 * al pasar a borrador, que dejará de aparecer en las búsquedas.
 */
export function confirmacionCambiarEstado(salon) {
  const nombre = (salon && salon.nombre) || "este salón";
  if (esPublicado(salon)) {
    return {
      clave: "aBorrador",
      titulo: "¿Pasar el salón a borrador?",
      mensaje: `"${nombre}" dejará de aparecer en las búsquedas de los clientes. Puedes volver a publicarlo cuando quieras.`,
      textoConfirmar: "Pasar a borrador",
      textoCancelar: "Dejarlo publicado",
      destructiva: false,
    };
  }
  return {
    clave: "aPublicado",
    titulo: "¿Publicar el salón?",
    mensaje: `"${nombre}" aparecerá en las búsquedas y los clientes podrán solicitar reservaciones.`,
    textoConfirmar: "Publicar salón",
    textoCancelar: "Dejarlo en borrador",
    destructiva: false,
  };
}

export function confirmacionSalirSinGuardar() {
  return {
    clave: "salir",
    titulo: "¿Salir sin guardar?",
    mensaje: "Hay cambios que todavía no se guardan. Si sales, se perderán.",
    textoConfirmar: "Salir sin guardar",
    textoCancelar: "Seguir editando",
    destructiva: true,
  };
}

/**
 * ¿Esta acción necesita confirmación? Todas las que escriben, sí.
 * Salir o cancelar solo la pide si de verdad hay cambios sin guardar.
 */
export function pideConfirmacion(accion, { hayCambios = false } = {}) {
  if (accion === "salir" || accion === "cancelar") return hayCambios;
  return ["guardar", "eliminarSalon", "eliminarPaquete", "eliminarFoto", "cambiarEstado"].includes(accion);
}

// ---------- Cambios sin guardar ----------

const CAMPOS = ["nombre", "zona", "capacidad", "descripcion", "estado"];

/** ¿El formulario cambió respecto a lo que trajo la API? (para avisar al salir) */
export function hayCambiosSinGuardar(original, actual) {
  if (!original || !actual) return false;
  const distinto = CAMPOS.some((c) => String(original[c] ?? "").trim() !== String(actual[c] ?? "").trim());
  if (distinto) return true;
  return paquetesCambiaron(original.paquetes, actual.paquetes);
}

function paquetesCambiaron(antes = [], ahora = []) {
  if (antes.length !== ahora.length) return true;
  const clave = (p) => `${p.id ?? "nuevo"}|${String(p.nombre ?? "").trim()}|${String(p.descripcion ?? "").trim()}|${Number(p.precio) || 0}`;
  const previos = antes.map(clave).sort();
  const nuevos = ahora.map(clave).sort();
  return previos.some((v, i) => v !== nuevos[i]);
}

// ---------- Errores de la API ----------

/**
 * Mensaje para el administrador según el código que contestó la API.
 * Regla del proyecto: si la API manda `mensaje`, se muestra TAL CUAL (ya viene en español).
 * Estos textos son solo el respaldo cuando no viene mensaje.
 */
export function mensajeDeErrorSalon(error) {
  if (!error) return "Ocurrió un error, intenta de nuevo.";
  if (error.tipo === "red") return "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
  if (error.tipo === "config") return "La app no tiene configurada la URL de la API (EXPO_PUBLIC_API_URL).";

  // La API ya explica el motivo en español: ese mensaje manda.
  if (error.mensaje) return error.mensaje;

  switch (error.codigo) {
    case CODIGOS_SALON.noExiste:
      return "El salón ya no existe. Actualiza la lista.";
    case CODIGOS_SALON.noEsDueno:
      return "Este salón no es de tu cuenta.";
    case CODIGOS_SALON.sinPaquetes:
      return "Agrega al menos un paquete para publicar tu salón.";
    case CODIGOS_SALON.estadoInvalido:
      return "El estado del salón no es válido.";
    case CODIGOS_SALON.conSolicitudes:
      return "Este salón tiene solicitudes pendientes o confirmadas, así que no se puede eliminar.";
    case CODIGOS_SALON.errorInterno:
      return "Ocurrió un error en el servidor. Intenta de nuevo más tarde.";
    default:
      return "Ocurrió un error, intenta de nuevo.";
  }
}

export function esConflictoDeSolicitudes(error) {
  return !!error && error.codigo === CODIGOS_SALON.conSolicitudes;
}

// ---------- Sin conexión (HU-22) ----------

const MOTIVO_SIN_CONEXION = "Necesitas conexión para hacer cambios en tus salones.";

/**
 * Sin conexión la lista se ve desde la caché, pero todo lo que escribe queda deshabilitado
 * con su motivo. Nunca se encola nada: los POST no se guardan para después.
 * → { habilitada, motivo }
 */
export function estadoDeAccion(accion, enLinea) {
  const escribe = ["crear", "editar", "guardar", "eliminarSalon", "eliminarPaquete", "subirFoto", "eliminarFoto", "cambiarEstado"].includes(accion);
  if (escribe && !enLinea) return { habilitada: false, motivo: MOTIVO_SIN_CONEXION };
  return { habilitada: true, motivo: null };
}
