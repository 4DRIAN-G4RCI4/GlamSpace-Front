// Sprint 10 · Verificación del correo y recuperación de la cuenta (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  CODIGOS_CORREO,
  ESPERA_REENVIO_SEGUNDOS,
  LONGITUD_CODIGO,
  TEXTOS_CORREO,
  faltaVerificarCorreo,
  limpiarCodigo,
  mensajeDeErrorCodigo,
  ocultarCorreo,
  requiereVerificacion,
  validarCodigo,
  validarRestablecer,
} from "../../services/correo.logica.js";

test("limpiarCodigo deja solo 6 dígitos (lo pegado del correo puede traer espacios o guiones)", () => {
  assert.strictEqual(limpiarCodigo(" 12 34-56 "), "123456");
  assert.strictEqual(limpiarCodigo("1234567"), "123456");
  assert.strictEqual(limpiarCodigo(undefined), "");
  assert.strictEqual(LONGITUD_CODIGO, 6);
  assert.ok(ESPERA_REENVIO_SEGUNDOS > 0);
});

test("validarCodigo pide exactamente 6 dígitos", () => {
  assert.deepStrictEqual(validarCodigo("123456"), {});
  assert.match(validarCodigo("123").codigo, /6 dígitos/);
  assert.match(validarCodigo("").codigo, /6 dígitos/);
});

test("validarRestablecer revisa código, contraseña de 8 y que coincidan", () => {
  assert.deepStrictEqual(validarRestablecer({ codigo: "123456", password: "nueva1234", password2: "nueva1234" }), {});
  const sinNada = validarRestablecer({ codigo: "", password: "", password2: "" });
  assert.ok(sinNada.codigo && sinNada.password && sinNada.password2);
  assert.match(validarRestablecer({ codigo: "123456", password: "corta", password2: "corta" }).password, /8/);
  assert.match(validarRestablecer({ codigo: "123456", password: "nueva1234", password2: "otra12345" }).password2, /no coinciden/);
});

test("faltaVerificarCorreo y requiereVerificacion", () => {
  assert.strictEqual(faltaVerificarCorreo({ codigo: CODIGOS_CORREO.correoSinVerificar }), true);
  assert.strictEqual(faltaVerificarCorreo({ codigo: 1003 }), false);
  assert.strictEqual(faltaVerificarCorreo(null), false);
  assert.strictEqual(requiereVerificacion({ correoVerificado: false }), true);
  assert.strictEqual(requiereVerificacion({ correoVerificado: true }), false);
  assert.strictEqual(requiereVerificacion({}), false); // API de hoy: no trae el campo, no cambia nada
  assert.strictEqual(requiereVerificacion(null), false);
});

test("mensajeDeErrorCodigo: los errores del código se marcan en su campo", () => {
  assert.deepStrictEqual(mensajeDeErrorCodigo({ codigo: 1008 }).campo, "codigo");
  assert.match(mensajeDeErrorCodigo({ codigo: 1009 }).texto, /venció/);
  assert.match(mensajeDeErrorCodigo({ codigo: 1010 }).texto, /demasiados/);
  assert.deepStrictEqual(mensajeDeErrorCodigo({ codigo: 1011 }).campo, null);
  assert.match(mensajeDeErrorCodigo({ tipo: "red" }).texto, /conexión/);
  assert.strictEqual(mensajeDeErrorCodigo({ codigo: 5000, mensaje: "Algo pasó." }).texto, "Algo pasó.");
  assert.match(mensajeDeErrorCodigo({ codigo: 5000 }).texto, /error/);
  assert.match(mensajeDeErrorCodigo(null).texto, /error/);
});

test("ocultarCorreo muestra solo el inicio del usuario y el dominio", () => {
  assert.strictEqual(ocultarCorreo("adrian@glamspaces.com"), "ad•••@glamspaces.com");
  assert.strictEqual(ocultarCorreo("sin-arroba"), "sin-arroba");
  assert.strictEqual(ocultarCorreo(null), "");
});

test("los textos usan el correo oculto y la cuenta regresiva", () => {
  assert.match(TEXTOS_CORREO.verificarTexto("adrian@glamspaces.com"), /ad•••@glamspaces\.com/);
  assert.match(TEXTOS_CORREO.restablecerTexto("adrian@glamspaces.com"), /6 dígitos/);
  assert.strictEqual(TEXTOS_CORREO.reenviarEn(42), "Reenviar código en 42 s");
});
