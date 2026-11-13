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
  PublicarSalon: "salon",
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
