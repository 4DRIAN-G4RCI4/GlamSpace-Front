/**
 * GlamSpaces · HU-03 · Lógica del registro de administrador de salón.
 * La cuenta se crea en la API (POST /api/usuarios/registro) como "administrador",
 * mandando también el nombre del salón.
 * El estado y el envío son los mismos que en el registro de cliente: ../../components/useFormularioRegistro.js
 */

import useFormularioRegistro from "../../components/useFormularioRegistro";
import { validarRegistroAdministrador } from "./registroAdministrador.validaciones";

export default function useRegistroAdministrador() {
  return useFormularioRegistro({
    tipoCuenta: "administrador",
    validar: validarRegistroAdministrador,
    pideSalon: true,
    textoExito: ({ nombreSalon }) => `¡Cuenta creada! Ya puedes publicar "${nombreSalon}".`,
  });
}
