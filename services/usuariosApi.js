/**
 * GlamSpaces · Servicio de cuentas (HU-02, HU-03 y HU-04).
 * Traduce entre los nombres de campo de la API y los que usa la app.
 */

import { postJson } from "./api";

// POST /api/usuarios/registro  (cliente o administrador)
export async function registrarUsuario({ nombre, correo, password, tipoCuenta, nombreSalon }) {
  return postJson("/usuarios/registro", {
    nombreCompleto: nombre,
    correo,
    password,
    tipoCuenta,
    nombreSalon: nombreSalon ?? null,
  });
}

// POST /api/usuarios/login  → devuelve la sesión con los nombres que usa la app
export async function iniciarSesion(correo, password) {
  const usuario = await postJson("/usuarios/login", {
    correo: correo.trim(),
    password,
  });

  return {
    id: usuario.id,
    nombre: usuario.nombreCompleto,
    correo: usuario.correo,
    tipo_cuenta: usuario.tipoCuenta,
    nombre_salon: usuario.nombreSalon || null,
  };
}
