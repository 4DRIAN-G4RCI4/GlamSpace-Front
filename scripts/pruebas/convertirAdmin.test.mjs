// Sprint 7 · Convertir una cuenta de cliente en administrador (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  CODIGOS_CONVERSION,
  TEXTOS_CONVERSION,
  esErrorDeCodigo,
  esLaMismaCuenta,
  mensajeDeErrorConversion,
  puedeConvertirse,
  validarConversion,
  yaEraAdministrador,
} from "../../services/convertirAdmin.logica.js";

// ---------- Quién se puede convertir ----------

test("una cuenta de cliente sí se puede convertir", () => {
  assert.strictEqual(puedeConvertirse({ id: 3, tipo_cuenta: "cliente" }), true);
});

test("quien ya es administrador no se convierte otra vez", () => {
  assert.strictEqual(puedeConvertirse({ id: 3, tipo_cuenta: "administrador" }), false);
});

test("sin sesión o sin id no se puede convertir", () => {
  assert.strictEqual(puedeConvertirse(null), false);
  assert.strictEqual(puedeConvertirse(undefined), false);
  assert.strictEqual(puedeConvertirse({}), false);
  assert.strictEqual(puedeConvertirse({ tipo_cuenta: "cliente" }), false); // sin id
});

// ---------- Validación ----------

test("la contraseña es obligatoria", () => {
  assert.strictEqual(validarConversion({ contrasena: "" }).contrasena, "Escribe tu contraseña para confirmar.");
  assert.strictEqual(validarConversion({ contrasena: "   " }).contrasena, "Escribe tu contraseña para confirmar.");
  assert.strictEqual(validarConversion({}).contrasena, "Escribe tu contraseña para confirmar.");
});

test("con contraseña no hay errores", () => {
  assert.deepStrictEqual(validarConversion({ contrasena: "12345678" }), {});
});

// ---------- Errores de la API ----------

test("la contraseña incorrecta se marca en su campo", () => {
  const r = mensajeDeErrorConversion({ tipo: "http", codigo: CODIGOS_CONVERSION.credencialesIncorrectas });
  assert.strictEqual(r.campo, "contrasena");
  assert.match(r.texto, /contraseña/i);
});

test("si la API manda su mensaje, ese se muestra", () => {
  const r = mensajeDeErrorConversion({ tipo: "http", codigo: 1006, mensaje: "La cuenta ya es administrador." });
  assert.strictEqual(r.texto, "La cuenta ya es administrador.");
});

test("la contraseña incorrecta se sigue marcando en el campo aunque la API mande mensaje", () => {
  const r = mensajeDeErrorConversion({ tipo: "http", codigo: 1003, mensaje: "Correo o contraseña incorrectos." });
  assert.strictEqual(r.campo, "contrasena");
  assert.strictEqual(r.texto, "Correo o contraseña incorrectos.");
});

test("cada código tiene su respaldo en español", () => {
  assert.match(mensajeDeErrorConversion({ codigo: CODIGOS_CONVERSION.usuarioNoEncontrado }).texto, /ya no existe/i);
  assert.match(mensajeDeErrorConversion({ codigo: CODIGOS_CONVERSION.yaEsAdministrador }).texto, /ya es/i);
});

test("sin conexión y sin configuración tienen su propio aviso", () => {
  assert.match(mensajeDeErrorConversion({ tipo: "red" }).texto, /conexión/i);
  assert.match(mensajeDeErrorConversion({ tipo: "config" }).texto, /EXPO_PUBLIC_API_URL/);
});

test("un error desconocido no deja al usuario sin aviso", () => {
  assert.match(mensajeDeErrorConversion(null).texto, /error/i);
  assert.match(mensajeDeErrorConversion({ tipo: "http", codigo: 9999 }).texto, /error/i);
});

// Con 1006 la cuenta ya era administrador: no hay que asustar al usuario, solo recargar.
test("yaEraAdministrador reconoce el 1006", () => {
  assert.strictEqual(yaEraAdministrador({ codigo: CODIGOS_CONVERSION.yaEsAdministrador }), true);
  assert.strictEqual(yaEraAdministrador({ codigo: 1003 }), false);
  assert.strictEqual(yaEraAdministrador(null), false);
});

// ---------- Textos ----------

test("los textos piden verificar y explican qué cambia y qué se conserva", () => {
  assert.match(TEXTOS_CONVERSION.explicacion, /inicia sesión/i);
  const condiciones = TEXTOS_CONVERSION.condiciones.join(" ");
  assert.match(condiciones, /público/i);
  assert.match(condiciones, /correo/i);
  assert.match(condiciones, /solicitudes/i);
  assert.ok(TEXTOS_CONVERSION.boton && TEXTOS_CONVERSION.boton !== "Aceptar");
  assert.match(TEXTOS_CONVERSION.exito, /administrador/i);
});

// ---------- Paso 1: verificar identidad ----------

test("la verificación solo pasa con la misma cuenta que está en sesión", () => {
  assert.strictEqual(esLaMismaCuenta({ id: 7 }, { id: 7 }), true);
  assert.strictEqual(esLaMismaCuenta({ id: 7 }, { id: 8 }), false);
  assert.strictEqual(esLaMismaCuenta(null, { id: 7 }), false);
  assert.strictEqual(esLaMismaCuenta({ id: 7 }, null), false);
});

test("Sprint 10 · los errores del código regresan al paso del código; los demás no", () => {
  for (const codigo of [1008, 1009, 1010, 1011]) assert.equal(esErrorDeCodigo({ codigo }), true);
  for (const e of [{ codigo: 1003 }, { codigo: 1006 }, { codigo: 1007 }, { tipo: "red" }, null]) assert.equal(esErrorDeCodigo(e), false);
  assert.match(TEXTOS_CONVERSION.explicacionCodigo("an•••@x.com"), /an•••@x\.com/);
});
