// Cobertura · Clientes HTTP (services/api.js y los *Api.js), sesión y caché local, con un
// fetch, un XMLHttpRequest y un localStorage falsos. No se llama a ninguna API real.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const URL_API = "https://api.prueba";
process.env.EXPO_PUBLIC_API_URL = URL_API;

// ---------- localStorage falso (lo usa AsyncStorage en web) ----------
class AlmacenFalso {
  constructor() { this.m = new Map(); }
  get length() { return this.m.size; }
  key(i) { return [...this.m.keys()][i] ?? null; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.window = { localStorage: new AlmacenFalso() };

const ponerNavegador = (valor) =>
  Object.defineProperty(globalThis, "navigator", { value: valor, configurable: true, writable: true });

// ---------- fetch falso: guarda las llamadas y contesta lo que se le pida ----------
let llamadas = [];
let respuestas = [];
const responder = (...r) => { respuestas = r; };
const ok = (cuerpo, estado = 200) => ({ ok: estado >= 200 && estado < 300, status: estado, json: async () => cuerpo });
const sinJson = (estado = 200) => ({ ok: estado < 300, status: estado, json: async () => { throw new SyntaxError("x"); } });
globalThis.fetch = async (url, opciones) => {
  llamadas.push({ url, opciones, cuerpo: opciones.body ? JSON.parse(opciones.body) : undefined });
  const r = respuestas.length > 1 ? respuestas.shift() : respuestas[0];
  if (r instanceof Error) throw r;
  return r;
};
const ultima = () => llamadas[llamadas.length - 1];

beforeEach(() => {
  llamadas = [];
  respuestas = [ok({ codigo: 0, exito: true, datos: {} })];
  ponerNavegador({ onLine: true });
});

const api = await import("../../services/api.js");
const salones = await import("../../services/salonesApi.js");
const solicitudes = await import("../../services/solicitudesApi.js");
const usuarios = await import("../../services/usuariosApi.js");
const sesion = await import("../../services/sesionStorage.js");
const cache = await import("../../services/cacheLocal.js");
const ubicacion = await import("../../services/ubicacionApi.js");

// ================= services/api.js =================

test("postJson manda POST con JSON a la URL de la API y regresa solo datos", async () => {
  responder(ok({ codigo: 0, exito: true, datos: { id: 5 } }));
  assert.deepEqual(await api.postJson("/salones/crear", { a: 1 }), { id: 5 });
  assert.equal(ultima().url, `${URL_API}/salones/crear`);
  assert.equal(ultima().opciones.method, "POST");
  assert.equal(ultima().opciones.headers["Content-Type"], "application/json");
  assert.deepEqual(ultima().cuerpo, { a: 1 });
});

test("sin JSON en una respuesta correcta regresa vacío; con error HTTP lanza ApiError http", async () => {
  responder(sinJson(200));
  assert.equal(await api.postJson("/salones/crear", {}), undefined);
  responder(sinJson(500));
  await assert.rejects(api.postJson("/salones/crear", {}), (e) => e.tipo === "http" && e.estado === 500 && e.mensaje === null);
});

test("exito false con 200 lanza el mensaje y el código de la API", async () => {
  responder(ok({ codigo: 2003, exito: false, mensaje: "Sin paquetes" }));
  await assert.rejects(api.postJson("/salones/actualizar", {}), (e) => e instanceof api.ApiError && e.codigo === 2003 && e.mensaje === "Sin paquetes");
});

test("si fetch falla es un error de red", async () => {
  responder(new TypeError("Failed to fetch"));
  await assert.rejects(api.postJson("/solicitudes/crear", {}), (e) => e.tipo === "red");
});

test("una lectura que falla con 503 se reintenta una vez y regresa la segunda respuesta", async () => {
  responder(ok({}, 503), ok({ codigo: 0, exito: true, datos: [1], pagina: 1, tamanoPagina: 10, totalRegistros: 1, totalPaginas: 1, mensaje: "ok" }));
  const r = await api.postPaginado("/salones/buscar", {});
  assert.deepEqual(r, { datos: [1], pagina: 1, tamanoPagina: 10, totalRegistros: 1, totalPaginas: 1, mensaje: "ok" });
  assert.equal(llamadas.length, 2);
});

test("postPaginado sin datos regresa una lista vacía", async () => {
  responder(ok({ codigo: 0, exito: true }));
  assert.deepEqual((await api.postPaginado("/salones/listar", {})).datos, []);
});

test("textoDeErrorApi tiene un mensaje para cada caso", () => {
  const t = api.textoDeErrorApi;
  assert.match(t(null), /Ocurrió un error/);
  assert.match(t({}), /Ocurrió un error/);
  assert.match(t({ tipo: "config" }), /EXPO_PUBLIC_API_URL/);
  assert.match(t({ tipo: "red" }), /No se pudo conectar/);
  assert.equal(t({ tipo: "http", mensaje: "Mensaje de negocio" }), "Mensaje de negocio");
  assert.match(t({ tipo: "http", estado: 400 }), /rechazó los datos/);
  assert.match(t({ tipo: "http", estado: 401 }), /No tienes permiso/);
  assert.match(t({ tipo: "http", estado: 403 }), /No tienes permiso/);
  assert.match(t({ tipo: "http", estado: 404 }), /No se encontró/);
  assert.match(t({ tipo: "http", estado: 500 }), /Ocurrió un error/);
});

// ---------- postFormulario con un XMLHttpRequest falso ----------
function xhrFalso(alEnviar, { conUpload = true } = {}) {
  globalThis.XMLHttpRequest = class {
    constructor() { this.upload = conUpload ? {} : undefined; }
    open(metodo, url) { this.metodo = metodo; this.url = url; }
    send(cuerpo) { this.cuerpo = cuerpo; alEnviar(this); }
  };
}

test("postFormulario informa el avance y regresa datos", async () => {
  const avances = [];
  let peticion;
  xhrFalso((x) => {
    peticion = x;
    x.upload.onprogress({ lengthComputable: true, loaded: 5, total: 10 });
    x.upload.onprogress({ lengthComputable: false, loaded: 1, total: 0 });
    x.upload.onprogress({ lengthComputable: true, loaded: 0, total: 0 });
    x.status = 200;
    x.responseText = JSON.stringify({ exito: true, datos: { fotoId: 9 } });
    x.onload();
  });
  assert.deepEqual(await api.postFormulario("/salones/subirFoto", "form", { onProgreso: (p) => avances.push(p) }), { fotoId: 9 });
  assert.deepEqual(avances, [0.5, 1]);
  assert.equal(peticion.metodo, "POST");
  assert.equal(peticion.url, `${URL_API}/salones/subirFoto`);
  assert.equal(peticion.cuerpo, "form");
});

test("postFormulario sin onProgreso, sin upload o sin JSON también responde", async () => {
  xhrFalso((x) => { x.status = 201; x.responseText = "no es json"; x.onload(); }, { conUpload: false });
  assert.equal(await api.postFormulario("/salones/subirFoto", "f", { onProgreso: () => {} }), null);
  xhrFalso((x) => { x.status = 200; x.responseText = JSON.stringify({ exito: true, datos: 1 }); x.onload(); });
  assert.equal(await api.postFormulario("/salones/subirFoto", "f"), 1);
});

test("postFormulario rechaza con http, con exito false y con red o tiempo agotado", async () => {
  xhrFalso((x) => { x.status = 400; x.responseText = JSON.stringify({ exito: false, mensaje: "Formato", codigo: 2006 }); x.onload(); });
  await assert.rejects(api.postFormulario("/salones/subirFoto", "f"), (e) => e.tipo === "http" && e.estado === 400 && e.codigo === 2006);
  xhrFalso((x) => { x.status = 200; x.responseText = JSON.stringify({ exito: false }); x.onload(); });
  await assert.rejects(api.postFormulario("/salones/subirFoto", "f"), (e) => e.tipo === "http" && e.mensaje === null);
  xhrFalso((x) => { x.status = 502; x.responseText = ""; x.onload(); });
  await assert.rejects(api.postFormulario("/salones/subirFoto", "f"), (e) => e.estado === 502);
  xhrFalso((x) => x.onerror());
  await assert.rejects(api.postFormulario("/salones/subirFoto", "f"), (e) => e.tipo === "red");
  xhrFalso((x) => x.ontimeout());
  await assert.rejects(api.postFormulario("/salones/subirFoto", "f"), (e) => e.tipo === "red");
});

// ================= services/salonesApi.js =================

test("buscarSalones manda los filtros y null en los vacíos", async () => {
  await salones.buscarSalones({ zona: "Tula", capacidadMinima: 100, precioMaximo: 5000, pagina: 2, tamanoPagina: 18 });
  assert.deepEqual(ultima().cuerpo, { zona: "Tula", capacidadMinima: 100, precioMaximo: 5000, pagina: 2, tamanoPagina: 18 });
  await salones.buscarSalones({});
  assert.deepEqual(ultima().cuerpo, { zona: null, capacidadMinima: null, precioMaximo: null, pagina: 1, tamanoPagina: 10 });
});

test("cada función de salones llama a su ruta con el cuerpo correcto", async () => {
  const salon = { adminId: 3, nombre: "Las Palmas", zona: "Tula", capacidad: 50, descripcion: "d", estado: "no_publicado", extra: "x" };
  const base = { adminId: 3, nombre: "Las Palmas", zona: "Tula", capacidad: 50, descripcion: "d" };
  const paquete = { id: 8, nombre: "Básico", descripcion: "6 h", precio: 3000 };
  const casos = [
    [() => salones.obtenerSalon(7), "/salones/obtener", { id: 7 }],
    [() => salones.obtenerSalonParaEditar(7), "/salones/obtener", { id: 7 }],
    [() => salones.obtenerDisponibilidad(7, 2026, 11), "/salones/disponibilidad", { salonId: 7, anio: 2026, mes: 11 }],
    [() => salones.crearSalon(salon), "/salones/crear", base],
    [() => salones.crearPaquete(7, 3, paquete), "/paquetes/crear", { salonId: 7, adminId: 3, nombrePaquete: "Básico", descripcion: "6 h", precio: 3000 }],
    [() => salones.publicarSalon(7, salon), "/salones/actualizar", { id: 7, ...base, estado: "publicado" }],
    [() => salones.actualizarSalon(7, salon), "/salones/actualizar", { id: 7, ...base, estado: "no_publicado" }],
    [() => salones.eliminarSalon(3, 7), "/salones/eliminar", { id: 7, adminId: 3 }],
    [() => salones.actualizarPaquete(3, paquete), "/paquetes/actualizar", { id: 8, adminId: 3, nombrePaquete: "Básico", descripcion: "6 h", precio: 3000 }],
    [() => salones.eliminarPaquete(3, 8), "/paquetes/eliminar", { id: 8, adminId: 3 }],
    [() => salones.eliminarFoto(3, 7, 11), "/salones/eliminarFoto", { salonId: 7, fotoId: 11, adminId: 3 }],
  ];
  for (const [llamar, ruta, cuerpo] of casos) {
    await llamar();
    assert.equal(ultima().url, URL_API + ruta, ruta);
    assert.deepEqual(ultima().cuerpo, cuerpo, ruta);
  }
});

test("listarSalonesDeAdmin regresa la lista y las versiones con respaldo guardan en la caché", async () => {
  responder(ok({ exito: true, datos: [{ id: 1 }] }));
  assert.deepEqual(await salones.listarSalonesDeAdmin(3), [{ id: 1 }]);
  assert.deepEqual(ultima().cuerpo, { adminId: 3, pagina: 1, tamanoPagina: 100 });

  const r = await salones.listarSalonesDeAdminConRespaldo(3);
  assert.deepEqual(r.datos, [{ id: 1 }]);
  assert.equal(r.desactualizado, false);

  responder(ok({ exito: true, datos: { id: 7, nombre: "S" } }));
  assert.deepEqual((await salones.obtenerSalonConRespaldo(3, 7)).datos, { id: 7, nombre: "S" });
  responder(ok({ exito: true, datos: { fechasOcupadas: [] } }));
  assert.deepEqual((await salones.obtenerDisponibilidadConRespaldo(3, 7, 2026, 11)).datos, { fechasOcupadas: [] });

  // Sin conexión regresa lo guardado, marcado como desactualizado y sin pedir a la API.
  ponerNavegador({ onLine: false });
  llamadas = [];
  const guardado = await salones.obtenerSalonConRespaldo(3, 7);
  assert.equal(guardado.desactualizado, true);
  assert.deepEqual(guardado.datos, { id: 7, nombre: "S" });
  assert.equal(llamadas.length, 0);
});

test("subirFoto arma el FormData y lo manda por postFormulario", async () => {
  let enviado;
  xhrFalso((x) => { enviado = x.cuerpo; x.status = 200; x.responseText = JSON.stringify({ exito: true, datos: { fotoId: 1 } }); x.onload(); });
  const archivo = new Blob(["abc"], { type: "image/png" });
  assert.deepEqual(await salones.subirFoto(3, 7, archivo), { fotoId: 1 });
  assert.equal(enviado.get("salonId"), "7");
  assert.equal(enviado.get("adminId"), "3");
});

// ================= services/solicitudesApi.js =================

const SOLICITUD = { id: 1, fechaEvento: "2026-12-05T00:00:00", estado: "pendiente" };

test("crear, obtener, aceptar y rechazar recortan la fecha del evento", async () => {
  responder(ok({ exito: true, datos: SOLICITUD }));
  const borrador = { salonId: 7, paqueteId: 2, fecha: "2026-12-05", tipoEvento: "Boda", invitados: "40", telefono: "771 123 4567", comentarios: "" };
  assert.equal((await solicitudes.crearSolicitud(5, borrador)).fechaEvento, "2026-12-05");
  assert.equal(ultima().url, `${URL_API}/solicitudes/crear`);
  assert.equal(ultima().cuerpo.clienteId, 5);

  assert.equal((await solicitudes.obtenerSolicitud(5, 1)).fechaEvento, "2026-12-05");
  assert.deepEqual(ultima().cuerpo, { id: 1, clienteId: 5 });
  assert.equal((await solicitudes.aceptarSolicitud(3, 1)).fechaEvento, "2026-12-05");
  assert.deepEqual(ultima().cuerpo, { id: 1, adminId: 3 });
  assert.equal((await solicitudes.rechazarSolicitud(3, 1)).fechaEvento, "2026-12-05");
  assert.equal(ultima().url, `${URL_API}/solicitudes/rechazar`);
});

test("los listados de solicitudes usan sus valores por omisión y recortan las fechas", async () => {
  responder(ok({ exito: true, datos: [SOLICITUD], totalRegistros: 1 }));
  const mias = await solicitudes.listarSolicitudes(5);
  assert.deepEqual(ultima().cuerpo, { clienteId: 5, pagina: 1, tamanoPagina: 10 });
  assert.equal(mias.datos[0].fechaEvento, "2026-12-05");
  assert.equal(mias.totalRegistros, 1);

  await solicitudes.listarSolicitudes(5, { pagina: 2, tamanoPagina: 20 });
  assert.deepEqual(ultima().cuerpo, { clienteId: 5, pagina: 2, tamanoPagina: 20 });

  await solicitudes.listarSolicitudesDeSalon(3, 7);
  assert.deepEqual(ultima().cuerpo, { adminId: 3, salonId: 7, estado: "pendiente", pagina: 1, tamanoPagina: 100 });

  const r = await solicitudes.listarSolicitudesDeSalonConRespaldo(3, 7);
  assert.equal(r.datos.datos[0].fechaEvento, "2026-12-05");
  await solicitudes.listarSolicitudesDeSalonConRespaldo(3, 7, { estado: "todas" });
  assert.equal(ultima().cuerpo.estado, "todas");
  assert.equal(solicitudes.CODIGOS_SOLICITUD.fechaNoDisponible, 4002);
});

// ================= services/usuariosApi.js =================

const USUARIO = { id: 4, nombreCompleto: "Ana", correo: "ana@x.com", tipoCuenta: "cliente", nombreSalon: null };

test("registro traduce los campos y manda nombreSalon null si no hay", async () => {
  await usuarios.registrarUsuario({ nombre: "Ana", correo: "ana@x.com", password: "p", tipoCuenta: "cliente" });
  assert.deepEqual(ultima().cuerpo, { nombreCompleto: "Ana", correo: "ana@x.com", password: "p", tipoCuenta: "cliente", nombreSalon: null });
  await usuarios.registrarUsuario({ nombre: "B", correo: "b@x.com", password: "p", tipoCuenta: "administrador", nombreSalon: "Salón B" });
  assert.equal(ultima().cuerpo.nombreSalon, "Salón B");
});

test("login y convertir a administrador regresan la sesión con los nombres de la app", async () => {
  responder(ok({ exito: true, datos: USUARIO }));
  assert.deepEqual(await usuarios.iniciarSesion("  ana@x.com ", "p"), {
    id: 4, nombre: "Ana", correo: "ana@x.com", tipo_cuenta: "cliente", nombre_salon: null,
  });
  assert.deepEqual(ultima().cuerpo, { correo: "ana@x.com", password: "p" });

  responder(ok({ exito: true, datos: { ...USUARIO, tipoCuenta: "administrador", nombreSalon: "Mi salón" } }));
  const s = await usuarios.convertirAAdministrador(4, "p");
  assert.equal(s.tipo_cuenta, "administrador");
  assert.equal(s.nombre_salon, "Mi salón");
  assert.deepEqual(ultima().cuerpo, { usuarioId: 4, contrasena: "p" });
});

// ================= services/sesionStorage.js =================

test("la sesión se guarda, se lee y al cerrar se borra junto con la caché", async () => {
  const ls = globalThis.window.localStorage;
  await sesion.guardarSesion({ id: 1, nombre: "Ana" });
  assert.deepEqual(await sesion.obtenerSesionActiva(), { id: 1, nombre: "Ana" });

  await cache.guardarCache("glamspaces_cache:1:x", { a: 1 });
  assert.deepEqual((await cache.leerCache("glamspaces_cache:1:x")).datos, { a: 1 });
  await sesion.cerrarSesion();
  assert.equal(ls.getItem("glamspaces_sesion"), null);
  assert.equal(await cache.leerCache("glamspaces_cache:1:x"), null);
  assert.equal(await sesion.obtenerSesionActiva(), null);
});

test("una sesión con el formato viejo o dañada se descarta", async () => {
  const ls = globalThis.window.localStorage;
  ls.setItem("glamspaces_sesion", JSON.stringify({ id: 1 }));
  assert.equal(await sesion.obtenerSesionActiva(), null);
  assert.equal(ls.getItem("glamspaces_sesion"), null);
  ls.setItem("glamspaces_sesion", "{dañada");
  assert.equal(await sesion.obtenerSesionActiva(), null);
});

// ================= services/cacheLocal.js =================

test("conRespaldoLocal: sin navigator pide a la API; con onLine false usa lo guardado o avisa", async () => {
  ponerNavegador(undefined);
  responder(ok({ exito: true, datos: { v: 1 } }));
  const r = await cache.conRespaldoLocal("glamspaces_cache:9:y", () => api.postJson("/salones/obtener", {}));
  assert.deepEqual(r, { datos: { v: 1 }, desactualizado: false, guardadoEn: null });

  ponerNavegador({ onLine: false });
  assert.equal((await cache.conRespaldoLocal("glamspaces_cache:9:y", () => assert.fail("no debe pedir"))).desactualizado, true);
  await assert.rejects(cache.conRespaldoLocal("glamspaces_cache:9:nada", async () => 1), (e) => e.sinDatosGuardados === true);
  assert.equal(await cache.borrarCache("glamspaces_cache:9:y"), true);
});

// ================= services/ubicacionApi.js =================

test("código postal: consulta Zippopotam y un 404 es una lista vacía", async () => {
  responder(ok({ "post code": "42800", places: [{ "place name": "Centro", state: "Hidalgo" }] }));
  const colonias = await ubicacion.buscarPorCodigoPostal("42800");
  assert.equal(ultima().url, "https://api.zippopotam.us/mx/42800");
  assert.equal(ultima().opciones.method, "GET");
  assert.equal(colonias[0].colonia, "Centro");

  responder(ok(null, 404));
  assert.deepEqual(await ubicacion.buscarPorCodigoPostal("99999"), []);
});

test("dirección: consulta Nominatim con los parámetros y respeta 1 petición por segundo", async () => {
  responder(ok([{ place_id: 1, display_name: "Centro, Tula", address: { suburb: "Centro", city: "Tula", state: "Hidalgo" } }]));
  const inicio = Date.now();
  await ubicacion.buscarPorDireccion("Centro Tula");
  const sugerencias = await ubicacion.buscarPorDireccion("Centro Tula");
  assert.ok(Date.now() - inicio >= 900, "la segunda consulta espera");
  const url = new URL(ultima().url);
  assert.equal(url.origin + url.pathname, "https://nominatim.openstreetmap.org/search");
  assert.equal(url.searchParams.get("countrycodes"), "mx");
  assert.equal(url.searchParams.get("q"), "Centro Tula");
  assert.equal(sugerencias[0].colonia, "Centro");
});

test("ubicación: error HTTP, error de red y cancelación", async () => {
  responder(ok(null, 500));
  await assert.rejects(ubicacion.buscarPorCodigoPostal("42800"), (e) => e.tipo === "http" && e.estado === 500);
  responder(new TypeError("Failed to fetch"));
  await assert.rejects(ubicacion.buscarPorDireccion("Centro"), (e) => e.tipo === "red");
  const cancelada = new Error("cancelada");
  cancelada.name = "AbortError";
  responder(cancelada);
  await assert.rejects(ubicacion.buscarPorDireccion("Centro", { senal: "s" }), (e) => e === cancelada);
  assert.equal(ultima().opciones.signal, "s");
});
