/**
 * GlamSpaces · Navegación (ajuste de usabilidad, HU-19 / navegación) · reglas puras, sin React.
 * Qué accesos ve cada rol en la barra superior y cuál está activo según la pantalla.
 */

// Debajo de este ancho la barra muestra el menú hamburguesa (teléfono).
export const CORTE_TELEFONO = 768;

export const esTelefono = (ancho) => ancho < CORTE_TELEFONO;

const BUSCAR = { clave: "buscar", texto: "Buscar salones", destino: "BusquedaSalones" };
const PERFIL = { clave: "perfil", texto: "Mi perfil", destino: "Perfil" };

// Accesos principales por rol. En escritorio "Mi perfil" va en el menú del avatar; en el
// teléfono va dentro del menú hamburguesa junto con los demás.
export function accesosPara(sesion) {
  if (!sesion) return [BUSCAR];
  if (sesion.tipo_cuenta === "administrador") {
    return [
      BUSCAR,
      { clave: "solicitudes", texto: "Solicitudes", destino: "PanelAdministrador", params: { pestana: "solicitudes" } },
      { clave: "salon", texto: "Mis salones", destino: "MisSalones" },
      PERFIL,
    ];
  }
  return [BUSCAR, { clave: "solicitudes", texto: "Mis solicitudes", destino: "MisSolicitudes" }, PERFIL];
}

const ACTIVO_POR_PANTALLA = {
  BusquedaSalones: "buscar",
  DetalleSalon: "buscar",
  SolicitudReservacion: "buscar",
  MisSolicitudes: "solicitudes",
  PanelAdministrador: "solicitudes",
  MisSalones: "salon",
  EditarSalon: "salon",
  Perfil: "perfil",
};

// Clave del acceso que corresponde a la pantalla actual (para aria-current y el color activo).
export function claveActiva(pantalla) {
  return ACTIVO_POR_PANTALLA[pantalla] || null;
}

// "María López García" → "MG" · vacío → "?"
export function inicialesDe(nombre) {
  const partes = String(nombre || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return `${partes[0][0]}${partes.length > 1 ? partes[partes.length - 1][0] : ""}`.toUpperCase();
}

// ---------- Invitación a ser administrador (Sprint 7) ----------

/**
 * ¿Se le ofrece al usuario registrar un salón?
 * Solo a los clientes: quien ya es administrador no la ve, y sin sesión tampoco
 * (primero inicia sesión o se registra).
 */
export function muestraInvitacionAdmin(sesion) {
  return !!sesion && sesion.tipo_cuenta === "cliente";
}

export const INVITACION_ADMIN = {
  titulo: "¿Quieres registrar un salón?",
  texto: "Conviértete en administrador y publica tu salón para que los clientes lo encuentren y te envíen solicitudes.",
  boton: "Conviértete en administrador",
  // El botón abre el diálogo que convierte la cuenta (POST /api/usuarios/convertirAAdministrador).
  // `destino` es a dónde se va DESPUÉS de convertirse, para publicar el primer salón.
  destino: "MisSalones",
};

// ---------- Botón "Regresar" ----------

// A dónde vuelve cada pantalla interna cuando no hay historial al cual regresar (por ejemplo,
// si se entró directo por la URL). Nunca al login ni a una pantalla en blanco.
const REGRESO_POR_PANTALLA = {
  DetalleSalon: "BusquedaSalones",
  SolicitudReservacion: "BusquedaSalones",
  MisSolicitudes: "BusquedaSalones",
  Perfil: "BusquedaSalones",
  MisSalones: "PanelAdministrador",
  EditarSalon: "MisSalones",
  PanelAdministrador: "BusquedaSalones",
  RegistroCliente: "Login",
  RegistroAdministrador: "Login",
  Login: "BusquedaSalones",
  ConvertirAdministrador: "Perfil",
};

/** Pantalla a la que regresa `pantalla` si no se puede usar el historial del navegador. */
export function regresoDe(pantalla) {
  return REGRESO_POR_PANTALLA[pantalla] || "BusquedaSalones";
}

/** ¿Esta pantalla lleva botón "← Regresar"? La de inicio no lo necesita. */
export function llevaBotonRegresar(pantalla) {
  return pantalla !== "BusquedaSalones" && !!REGRESO_POR_PANTALLA[pantalla];
}

// ---------- El administrador solo consulta salones (Sprint 10) ----------

/**
 * ¿Se le ofrece "Solicitar reservación"? Un administrador puede ver cualquier salón y sus paquetes,
 * pero no rentar (la API también lo rechaza: 4003 · Solo los clientes pueden enviar solicitudes).
 * Sin sesión sí se ofrece: al pulsarlo se le pide iniciar sesión.
 */
export function puedeReservar(sesion) {
  return !sesion || sesion.tipo_cuenta !== "administrador";
}

export const AVISO_SOLO_CONSULTA = {
  titulo: "Vista de administrador",
  texto: "Como administrador puedes ver la información y los paquetes de este salón, pero no rentarlo. Si quieres rentar un salón, crea una cuenta de cliente.",
  corto: "Solo consulta · para rentar crea una cuenta de cliente",
  boton: "Crear cuenta de cliente",
};
