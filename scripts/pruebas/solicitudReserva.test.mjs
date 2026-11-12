// HU-16 (Cliente 04 y 05): validaciones, armado del envío y mensajes de error (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  LIMITE_COMENTARIOS,
  resumenErrores,
  validarComentarios,
  validarCorreo,
  validarFecha,
  validarInvitados,
  validarNombre,
  validarPasoConfirmar,
  validarPasoElegir,
  validarTelefono,
  validarTerminos,
  validarTipoEvento,
} from "../../screens/SolicitudReservacion/solicitudReservacion.validaciones.js";
import { armarSolicitudParaApi, mensajeDeErrorSolicitud } from "../../services/solicitudes.logica.js";

const HOY = "2026-11-12";
const pasoElegir = {
  fecha: "2026-12-18",
  hoy: HOY,
  ocupadas: ["2026-12-12"],
  tipoEvento: "Boda",
  invitados: "120",
  capacidad: 150,
  telefono: "771 123 4567",
  comentarios: "",
};

test("fecha: requerida, futura y disponible", () => {
  assert.match(validarFecha(null, { hoy: HOY }), /Elige la fecha/);
  assert.match(validarFecha(HOY, { hoy: HOY }), /a partir de mañana/);
  assert.match(validarFecha("2026-11-01", { hoy: HOY }), /a partir de mañana/);
  assert.match(validarFecha("2026-12-12", { hoy: HOY, ocupadas: ["2026-12-12"] }), /reservada/);
  assert.strictEqual(validarFecha("2026-11-13", { hoy: HOY }), null);
});

test("tipo de evento requerido", () => {
  assert.ok(validarTipoEvento("  "));
  assert.strictEqual(validarTipoEvento("XV años"), null);
});

test("invitados: entero > 0 y hasta la capacidad", () => {
  assert.match(validarInvitados("", 150), /cuántos invitados/);
  assert.match(validarInvitados("0", 150), /mayor a 0/);
  assert.match(validarInvitados("-5", 150), /mayor a 0/);
  assert.match(validarInvitados("12.5", 150), /entero/);
  assert.match(validarInvitados("abc", 150), /entero/);
  assert.strictEqual(validarInvitados("150", 150), null); // justo en el límite
  assert.match(validarInvitados("151", 150), /hasta 150 personas/);
  assert.strictEqual(validarInvitados("1", 150), null);
});

test("teléfono: exactamente 10 dígitos", () => {
  assert.match(validarTelefono(""), /Escribe un teléfono/);
  assert.strictEqual(validarTelefono("7711234567"), null);
  assert.strictEqual(validarTelefono("(771) 123-4567"), null);
  assert.strictEqual(validarTelefono("771.123.4567"), null);
  assert.match(validarTelefono("771123456"), /10 dígitos/); // 9
  assert.match(validarTelefono("77112345678"), /10 dígitos/); // 11
  assert.match(validarTelefono("+52 7711234567"), /10 dígitos/);
  assert.match(validarTelefono("771abc4567"), /10 dígitos/);
});

test("comentarios: hasta 500 caracteres", () => {
  assert.strictEqual(validarComentarios(""), null);
  assert.strictEqual(validarComentarios("x".repeat(LIMITE_COMENTARIOS)), null);
  assert.match(validarComentarios("x".repeat(LIMITE_COMENTARIOS + 1)), /Máximo 500/);
});

test("nombre, correo y términos", () => {
  assert.ok(validarNombre(" "));
  assert.strictEqual(validarNombre("Ana López"), null);
  assert.match(validarCorreo(""), /Escribe tu correo/);
  assert.match(validarCorreo("ana@"), /correo válido/);
  assert.match(validarCorreo("ana lopez@x.com"), /correo válido/);
  assert.strictEqual(validarCorreo("ana@ejemplo.com"), null);
  assert.ok(validarTerminos(false));
  assert.strictEqual(validarTerminos(true), null);
});

test("validarPasoElegir: completo sin errores; vacío marca cada campo", () => {
  assert.deepStrictEqual(validarPasoElegir(pasoElegir), {});
  const errores = validarPasoElegir({ ...pasoElegir, fecha: null, tipoEvento: "", invitados: "", telefono: "" });
  assert.deepStrictEqual(Object.keys(errores), ["fecha", "tipoEvento", "invitados", "telefono"]);
  assert.strictEqual(resumenErrores(errores), "Falta completar: fecha, tipo de evento, invitados y teléfono.");
});

test("validarPasoConfirmar marca nombre, correo, teléfono y términos", () => {
  const ok = { nombre: "Ana", telefono: "7711234567", correo: "ana@ejemplo.com", terminos: true };
  assert.deepStrictEqual(validarPasoConfirmar(ok), {});
  assert.deepStrictEqual(Object.keys(validarPasoConfirmar({ ...ok, correo: "x", terminos: false })), ["correo", "terminos"]);
  assert.strictEqual(resumenErrores({ terminos: "x" }), "Falta completar: términos.");
  assert.strictEqual(resumenErrores({}), null);
});

test("armarSolicitudParaApi manda solo lo que guarda la API", () => {
  const body = armarSolicitudParaApi(7, {
    salonId: 3,
    paqueteId: 12,
    fecha: "2026-12-18",
    tipoEvento: "  Boda ",
    invitados: "120",
    telefono: "(771) 123-4567",
    comentarios: "  Banda en vivo  ",
    nombre: "Ana",
    correo: "ana@ejemplo.com",
  });
  assert.deepStrictEqual(body, {
    clienteId: 7,
    salonId: 3,
    paqueteId: 12,
    fechaEvento: "2026-12-18",
    tipoEvento: "Boda",
    numeroInvitados: 120,
    telefonoContacto: "7711234567",
    comentarios: "Banda en vivo",
  });
});

test("armarSolicitudParaApi sin paquete ni comentarios manda null", () => {
  const body = armarSolicitudParaApi(7, { salonId: 3, fecha: "2026-12-18", tipoEvento: "XV años", invitados: "90", telefono: "7711234567", comentarios: "   " });
  assert.strictEqual(body.paqueteId, null);
  assert.strictEqual(body.comentarios, null);
});

test("mensajeDeErrorSolicitud: cada código con su mensaje y siguiente paso", () => {
  assert.deepStrictEqual(mensajeDeErrorSolicitud({ tipo: "http", codigo: 4002 }).accion, "fecha");
  assert.match(mensajeDeErrorSolicitud({ tipo: "http", codigo: 4004 }).texto, /pendiente/);
  assert.strictEqual(mensajeDeErrorSolicitud({ tipo: "http", codigo: 4004 }).accion, "misSolicitudes");
  assert.strictEqual(mensajeDeErrorSolicitud({ tipo: "http", codigo: 3001 }).accion, "paquete");
  assert.strictEqual(mensajeDeErrorSolicitud({ tipo: "http", codigo: 4003 }).accion, "sesion");
  assert.strictEqual(mensajeDeErrorSolicitud({ tipo: "http", codigo: 1005 }).accion, "sesion");
  assert.match(mensajeDeErrorSolicitud({ tipo: "http", codigo: 2001 }).texto, /ya no está disponible/);
});

test("mensajeDeErrorSolicitud: 1001 usa el mensaje de la API; de fecha sugiere otra", () => {
  const fecha = mensajeDeErrorSolicitud({ tipo: "http", codigo: 1001, mensaje: "La fecha del evento no puede ser una fecha pasada." });
  assert.deepStrictEqual(fecha, { texto: "La fecha del evento no puede ser una fecha pasada.", accion: "fecha" });
  const capacidad = mensajeDeErrorSolicitud({ tipo: "http", codigo: 1001, mensaje: "Los invitados exceden la capacidad del salón." });
  assert.strictEqual(capacidad.accion, null);
});

test("mensajeDeErrorSolicitud: sin red y errores desconocidos", () => {
  assert.match(mensajeDeErrorSolicitud({ tipo: "red" }).texto, /conectar/);
  assert.strictEqual(mensajeDeErrorSolicitud({ tipo: "http", codigo: 5000, mensaje: "Ocurrió un error." }).texto, "Ocurrió un error.");
  assert.match(mensajeDeErrorSolicitud(null).texto, /No se pudo enviar/);
});
