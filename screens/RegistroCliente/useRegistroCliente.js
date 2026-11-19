/**
 * GlamSpaces · HU-02 · Lógica del registro de cliente.
 * La cuenta se crea en la API (POST /api/usuarios/registro) como "cliente".
 * El estado y el envío son los mismos que en el registro de administrador: ../../components/useFormularioRegistro.js
 */

import useFormularioRegistro from "../../components/useFormularioRegistro";
import { validarRegistroCliente } from "./registroCliente.validaciones";

export default function useRegistroCliente() {
  return useFormularioRegistro({
    tipoCuenta: "cliente",
    validar: validarRegistroCliente,
    textoExito: ({ nombre }) => `¡Cuenta creada! Bienvenido/a, ${nombre.split(" ")[0]}.`,
  });
}
