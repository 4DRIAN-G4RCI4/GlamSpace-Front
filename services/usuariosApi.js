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

// La API contesta siempre con la misma forma (UsuarioResponse); aquí se traduce a la sesión.
function aSesion(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombreCompleto,
    correo: usuario.correo,
    tipo_cuenta: usuario.tipoCuenta,
    nombre_salon: usuario.nombreSalon || null,
  };
}

// POST /api/usuarios/login  → devuelve la sesión con los nombres que usa la app
export async function iniciarSesion(correo, password) {
  return aSesion(await postJson("/usuarios/login", { correo: correo.trim(), password }));
}

// POST /api/usuarios/convertirAAdministrador  { usuarioId, contrasena }
// Convierte una cuenta de cliente en administrador: mismo correo, contraseña e historial.
// Pide la contraseña porque todavía no hay JWT (la cuenta la confirma quien la está usando).
// → la sesión ya con tipo_cuenta "administrador".
// Errores: 1005 la cuenta no existe · 1003 contraseña incorrecta · 1006 ya es administrador.
export async function convertirAAdministrador(usuarioId, contrasena) {
  return aSesion(await postJson("/usuarios/convertirAAdministrador", { usuarioId, contrasena }));
}
