// Validaciones de formularios y validadores básicos: registro, login, búsqueda y publicar salón (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  LONGITUD_MIN_PASSWORD,
  aNumero,
  esCorreoValido,
  esUrlValida,
} from "../../utils/validadores.js";
import { validarDatosCuenta } from "../../utils/validarCuenta.js";
import { validarLogin } from "../../screens/Login/login.validaciones.js";
import { validarRegistroCliente } from "../../screens/RegistroCliente/registroCliente.validaciones.js";
import { validarRegistroAdministrador } from "../../screens/RegistroAdministrador/registroAdministrador.validaciones.js";
import {
  validarCapacidad,
  validarPrecio,
} from "../../screens/BusquedaSalones/busquedaSalones.validaciones.js";
import {
  validarPaquete,
  validarPublicacion,
  validarSalon,
} from "../../screens/PublicarSalon/publicarSalon.validaciones.js";
import { formatearPrecio } from "../../utils/formato.js";

// ---------- utils/validadores ----------

test("esCorreoValido acepta correos con dominio y rechaza los incompletos", () => {
  for (const bueno of ["a@b.co", "ana.lopez@correo.com", "ana@sub.dominio.mx", "  a@b.co  "]) {
    assert.strictEqual(esCorreoValido(bueno), true, bueno);
  }
  for (const malo of ["sin-arroba.com", "a@b", "a@b.", "@b.co", "a@.co", "a b@c.co", "a@@b.co", ""]) {
    assert.strictEqual(esCorreoValido(malo), false, malo);
  }
});

// El regex se reescribió para que cada tramo del dominio no acepte puntos (Sonar S8786);
// de paso dejó de aceptar dominios con puntos pegados o un punto al final.
test("esCorreoValido rechaza dominios con puntos de más", () => {
  assert.strictEqual(esCorreoValido("a@b..co"), false);
  assert.strictEqual(esCorreoValido("a@b.co."), false);
});

test("esCorreoValido no truena con valores que no son texto", () => {
  assert.strictEqual(esCorreoValido(null), false);
  assert.strictEqual(esCorreoValido(undefined), false);
  assert.strictEqual(esCorreoValido(123), false);
});

test("esUrlValida acepta http y https y rechaza lo demás", () => {
  assert.strictEqual(esUrlValida("https://glamspaces.mx/foto.jpg"), true);
  assert.strictEqual(esUrlValida("http://localhost:5080/x.png"), true);
  assert.strictEqual(esUrlValida("  https://a.mx/b  "), true);
  assert.strictEqual(esUrlValida("ftp://a.mx"), false);
  assert.strictEqual(esUrlValida("glamspaces.mx"), false);
  assert.strictEqual(esUrlValida("https://"), false);
  assert.strictEqual(esUrlValida(""), false);
});

test("aNumero limpia $, comas y espacios; vacío es NaN", () => {
  assert.strictEqual(aNumero("1500"), 1500);
  assert.strictEqual(aNumero("1,500"), 1500);
  assert.strictEqual(aNumero("$1,500.50"), 1500.5);
  assert.strictEqual(aNumero(" 250 "), 250);
  assert.ok(Number.isNaN(aNumero("")));
  assert.ok(Number.isNaN(aNumero("   ")));
  assert.ok(Number.isNaN(aNumero("abc")));
});

// ---------- utils/validarCuenta ----------

const CUENTA_OK = {
  nombre: "Ana López",
  correo: "ana@correo.com",
  password: "12345678",
  password2: "12345678",
  aceptaTerminos: true,
};

test("validarDatosCuenta no marca nada cuando los datos están completos", () => {
  assert.deepStrictEqual(validarDatosCuenta(CUENTA_OK), {});
});

test("validarDatosCuenta marca cada campo vacío con su mensaje", () => {
  const e = validarDatosCuenta({ nombre: "  ", correo: "", password: "", password2: "", aceptaTerminos: false });
  assert.strictEqual(e.nombre, "Escribe tu nombre completo.");
  assert.strictEqual(e.correo, "Escribe tu correo electrónico.");
  assert.strictEqual(e.password, "Escribe una contraseña.");
  assert.strictEqual(e.password2, "Las contraseñas no coinciden.");
  assert.strictEqual(e.terminos, "Debes aceptar los términos para continuar.");
});

test("validarDatosCuenta revisa el formato del correo y el largo de la contraseña", () => {
  const e = validarDatosCuenta({ ...CUENTA_OK, correo: "ana@correo", password: "1234567", password2: "1234567" });
  assert.strictEqual(e.correo, "El formato del correo no es válido.");
  assert.strictEqual(e.password, `La contraseña debe tener al menos ${LONGITUD_MIN_PASSWORD} caracteres.`);
  assert.strictEqual(e.password2, undefined);
});

test("validarDatosCuenta marca la confirmación cuando no coincide", () => {
  const e = validarDatosCuenta({ ...CUENTA_OK, password2: "otra12345" });
  assert.strictEqual(e.password2, "Las contraseñas no coinciden.");
});

test("validarRegistroCliente usa las mismas reglas de la cuenta", () => {
  assert.deepStrictEqual(validarRegistroCliente(CUENTA_OK), {});
  assert.strictEqual(validarRegistroCliente({ ...CUENTA_OK, nombre: "" }).nombre, "Escribe tu nombre completo.");
});

test("validarRegistroAdministrador exige además el nombre del salón", () => {
  assert.deepStrictEqual(validarRegistroAdministrador({ ...CUENTA_OK, nombreSalon: "Jardín Villa" }), {});
  const e = validarRegistroAdministrador({ ...CUENTA_OK, nombreSalon: "   " });
  assert.strictEqual(e.nombreSalon, "Escribe el nombre de tu salón.");
});

// ---------- Login ----------

test("validarLogin pide correo y contraseña y revisa el formato", () => {
  assert.deepStrictEqual(validarLogin({ correo: "ana@correo.com", password: "12345678" }), {});
  const vacio = validarLogin({ correo: "  ", password: "" });
  assert.strictEqual(vacio.correo, "Escribe tu correo electrónico.");
  assert.strictEqual(vacio.password, "Escribe tu contraseña.");
  assert.strictEqual(validarLogin({ correo: "ana@", password: "x" }).correo, "El formato del correo no es válido.");
});

// ---------- Filtros de búsqueda (HU-10) ----------

test("validarCapacidad solo acepta enteros mayores a 0", () => {
  assert.strictEqual(validarCapacidad("150"), null);
  assert.strictEqual(validarCapacidad("1,500"), null);
  const mensaje = "Escribe un número de personas mayor a 0 (sin decimales).";
  for (const malo of ["0", "-5", "12.5", "", "abc"]) {
    assert.strictEqual(validarCapacidad(malo), mensaje, malo);
  }
});

test("validarPrecio acepta decimales mayores a 0", () => {
  assert.strictEqual(validarPrecio("10000"), null);
  assert.strictEqual(validarPrecio("$8,500.50"), null);
  const mensaje = "Escribe un precio mayor a 0.";
  for (const malo of ["0", "-1", "", "abc"]) {
    assert.strictEqual(validarPrecio(malo), mensaje, malo);
  }
});

// ---------- Publicar salón (HU-07) ----------

const SALON_OK = { nombre: "Jardín Villa Esmeralda", zona: "Tula de Allende", capacidad: "200" };

test("validarSalon no marca nada con nombre, zona y capacidad correctos", () => {
  assert.deepStrictEqual(validarSalon(SALON_OK), {});
});

test("validarSalon marca los tres campos cuando están vacíos", () => {
  const e = validarSalon({ nombre: " ", zona: "  ", capacidad: "   " });
  assert.strictEqual(e.nombre, "Escribe el nombre del salón.");
  assert.strictEqual(e.zona, "Escribe la zona o dirección del salón.");
  assert.strictEqual(e.capacidad, "Escribe la capacidad del salón.");
});

test("validarSalon rechaza capacidades que no son enteros mayores a 0", () => {
  const mensaje = "La capacidad debe ser un número entero mayor a 0.";
  for (const malo of ["0", "-10", "12.5", "abc"]) {
    assert.strictEqual(validarSalon({ ...SALON_OK, capacidad: malo }).capacidad, mensaje, malo);
  }
});

test("validarPaquete exige nombre y precio mayor a 0", () => {
  assert.deepStrictEqual(validarPaquete({ nombre: "Paquete Oro", precio: "8500" }), {});
  const vacio = validarPaquete({ nombre: "  ", precio: "" });
  assert.strictEqual(vacio.nombre, "Escribe el nombre del paquete.");
  assert.strictEqual(vacio.precio, "Escribe el precio del paquete.");
  // Criterio 3: cero o negativo se rechaza antes de ir a la API.
  for (const malo of ["0", "-100", "abc"]) {
    assert.strictEqual(
      validarPaquete({ nombre: "Oro", precio: malo }).precio,
      "El precio debe ser un número mayor a 0.",
      malo,
    );
  }
});

test("validarPaquete acepta precios con decimales", () => {
  assert.deepStrictEqual(validarPaquete({ nombre: "Plata", precio: "$7,250.75" }), {});
});

test("validarPublicacion suma las reglas del salón y exige al menos un paquete", () => {
  assert.deepStrictEqual(
    validarPublicacion({ ...SALON_OK, paquetes: [{ nombre: "Oro" }], borradorConDatos: false }),
    {},
  );
  const sinPaquetes = validarPublicacion({ ...SALON_OK, paquetes: [], borradorConDatos: false });
  assert.strictEqual(sinPaquetes.paquetes, "Agrega al menos un paquete para publicar tu salón.");
});

test("validarPublicacion avisa si el paquete quedó escrito pero sin agregar", () => {
  const e = validarPublicacion({ ...SALON_OK, paquetes: [], borradorConDatos: true });
  assert.strictEqual(e.paquetes, 'Pulsa "Agregar paquete" para incluir el paquete que escribiste.');
});

test("validarPublicacion también marca los campos del salón", () => {
  const e = validarPublicacion({ nombre: "", zona: "", capacidad: "", paquetes: [], borradorConDatos: false });
  assert.deepStrictEqual(Object.keys(e).sort(), ["capacidad", "nombre", "paquetes", "zona"]);
});

// ---------- utils/formato ----------

test("formatearPrecio pone separador de miles y decimales solo si los hay", () => {
  assert.strictEqual(formatearPrecio(8500), "$8,500");
  assert.strictEqual(formatearPrecio(8500.5), "$8,500.50");
  assert.strictEqual(formatearPrecio(0), "$0");
  assert.strictEqual(formatearPrecio("12000"), "$12,000");
});
