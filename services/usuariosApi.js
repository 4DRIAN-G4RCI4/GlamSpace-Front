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

// POST /api/usuarios/codigoConversion  { usuarioId, contrasena }
// Sprint 10: comprueba la contraseña y manda al correo el código para convertir la cuenta.
// Errores: 1003 contraseña · 1005 no existe · 1006 ya es administrador · 1011 espera 60 s.
export async function pedirCodigoConversion(usuarioId, contrasena) {
  return postJson("/usuarios/codigoConversion", { usuarioId, contrasena });
}

// POST /api/usuarios/convertirAAdministrador  { usuarioId, contrasena, codigo }
// Convierte una cuenta de cliente en administrador: mismo correo, contraseña e historial.
// Pide la contraseña (todavía no hay JWT) y el código que le llegó al correo.
// → la sesión ya con tipo_cuenta "administrador".
// Errores: 1008/1009/1010 código · 1005 la cuenta no existe · 1003 contraseña incorrecta · 1006 ya es administrador.
export async function convertirAAdministrador(usuarioId, contrasena, codigo) {
  return aSesion(await postJson("/usuarios/convertirAAdministrador", { usuarioId, contrasena, codigo }));
}

// ---------- Sprint 10 · Verificación del correo y recuperación de la cuenta ----------
// Contrato y códigos de error en services/correo.logica.js.

// POST /api/usuarios/verificarCorreo { correo, codigo } → la sesión (la cuenta queda activa y entra).
export async function verificarCorreo(correo, codigo) {
  return aSesion(await postJson("/usuarios/verificarCorreo", { correo: correo.trim(), codigo }));
}

// POST /api/usuarios/reenviarCodigo { correo, proposito: "verificacion" | "recuperacion" }
export function reenviarCodigo(correo, proposito) {
  return postJson("/usuarios/reenviarCodigo", { correo: correo.trim(), proposito });
}

// POST /api/usuarios/recuperar { correo } → siempre el mismo mensaje, exista o no la cuenta.
export function solicitarRecuperacion(correo) {
  return postJson("/usuarios/recuperar", { correo: correo.trim() });
}

// POST /api/usuarios/restablecer { correo, codigo, nuevaContrasena }
export function restablecerContrasena(correo, codigo, nuevaContrasena) {
  return postJson("/usuarios/restablecer", { correo: correo.trim(), codigo, nuevaContrasena });
}
