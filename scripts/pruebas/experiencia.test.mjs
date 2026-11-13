// Sprint 7 · Mis solicitudes del cliente, invitación a administrador y botón Regresar (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  FILTROS_ESTADO,
  ORDENES_CLIENTE,
  contarPorEstado,
  listaDeMisSolicitudes,
  tarjetaDeSolicitud,
  tarjetasDeSolicitudes,
  textoSinResultados,
} from "../../screens/MisSolicitudes/misSolicitudes.logica.js";
import {
  INVITACION_ADMIN,
  llevaBotonRegresar,
  muestraInvitacionAdmin,
  regresoDe,
  claveActiva,
} from "../../components/navegacion.logica.js";

// Lo que regresa hoy POST /api/solicitudes/listar: trae salonId y nombreSalon, pero NO la foto.
const SOLICITUDES = [
  { id: 1, salonId: 10, nombreSalon: "Jardín Villa", estado: "pendiente", fechaEvento: "2026-12-20", fechaCreacion: "2026-11-01T10:00:00", numeroInvitados: 100, nombrePaquete: "Oro" },
  { id: 2, salonId: 11, nombreSalon: "Terraza del Valle", estado: "confirmada", fechaEvento: "2026-11-30", fechaCreacion: "2026-11-05T10:00:00", numeroInvitados: 80, nombrePaquete: null },
  { id: 3, salonId: 12, nombreSalon: "Hacienda San Rafael", estado: "rechazada", fechaEvento: "2026-12-05", fechaCreacion: "2026-11-03T10:00:00", numeroInvitados: 150, nombrePaquete: "Plata" },
  { id: 4, salonId: 10, nombreSalon: "Jardín Villa", estado: "pendiente", fechaEvento: "2027-01-15", fechaCreacion: "2026-11-08T10:00:00", numeroInvitados: 60, nombrePaquete: "Bronce" },
];

const ids = (lista) => lista.map((s) => s.id);

// ---------- Filtros y contadores ----------

test("los filtros del cliente son los mismos cuatro del administrador", () => {
  assert.deepStrictEqual(FILTROS_ESTADO.map((f) => f.clave), ["todas", "pendiente", "confirmada", "rechazada"]);
  assert.deepStrictEqual(FILTROS_ESTADO.map((f) => f.texto), ["Todas", "Pendientes", "Confirmadas", "Rechazadas"]);
});

test("los contadores son del TOTAL, no de la página que se ve", () => {
  const conteo = contarPorEstado(SOLICITUDES);
  assert.deepStrictEqual(conteo, { todas: 4, pendiente: 2, confirmada: 1, rechazada: 1 });
  // Aunque solo se pinten 2 por página, los contadores siguen contando las 4.
  assert.strictEqual(contarPorEstado(SOLICITUDES).todas, SOLICITUDES.length);
});

test("contarPorEstado con lista vacía o inválida", () => {
  assert.deepStrictEqual(contarPorEstado([]), { todas: 0, pendiente: 0, confirmada: 0, rechazada: 0 });
  assert.deepStrictEqual(contarPorEstado(null), { todas: 0, pendiente: 0, confirmada: 0, rechazada: 0 });
});

test("listaDeMisSolicitudes: 'todas' no filtra y ordena por la más reciente", () => {
  // Por defecto el cliente ve primero la que acaba de enviar.
  assert.deepStrictEqual(ids(listaDeMisSolicitudes(SOLICITUDES)), [4, 2, 3, 1]);
});

test("listaDeMisSolicitudes filtra por cada estado", () => {
  assert.deepStrictEqual(ids(listaDeMisSolicitudes(SOLICITUDES, "pendiente")), [4, 1]);
  assert.deepStrictEqual(ids(listaDeMisSolicitudes(SOLICITUDES, "confirmada")), [2]);
  assert.deepStrictEqual(ids(listaDeMisSolicitudes(SOLICITUDES, "rechazada")), [3]);
});

test("listaDeMisSolicitudes puede ordenar por fecha del evento", () => {
  assert.deepStrictEqual(ids(listaDeMisSolicitudes(SOLICITUDES, "todas", "proximas")), [2, 3, 1, 4]);
});

test("listaDeMisSolicitudes no modifica la lista original", () => {
  const copia = [...SOLICITUDES];
  listaDeMisSolicitudes(SOLICITUDES, "todas", "proximas");
  assert.deepStrictEqual(ids(SOLICITUDES), ids(copia));
});

test("los órdenes del cliente están en español", () => {
  assert.deepStrictEqual(ORDENES_CLIENTE.map((o) => o.clave), ["recientes", "proximas"]);
});

// ---------- Tarjeta con foto ----------

test("tarjetaDeSolicitud arma lo que pinta la tarjeta", () => {
  const t = tarjetaDeSolicitud(SOLICITUDES[0]);
  assert.strictEqual(t.id, 1);
  assert.strictEqual(t.salonId, 10);
  assert.strictEqual(t.nombreSalon, "Jardín Villa");
  assert.strictEqual(t.estado, "pendiente");
  assert.strictEqual(t.nombrePaquete, "Oro");
  assert.strictEqual(t.numeroInvitados, 100);
});

// La tarjeta también pinta el tipo de evento, el teléfono y los comentarios: no se pueden
// perder al normalizar (si se pierden, en pantalla sale "undefined").
test("tarjetaDeSolicitud conserva los demás campos que manda la API", () => {
  const api = { ...SOLICITUDES[0], tipoEvento: "XV años", telefonoContacto: "7731234567", comentarios: "Con jardín" };
  const t = tarjetaDeSolicitud(api);
  assert.strictEqual(t.tipoEvento, "XV años");
  assert.strictEqual(t.telefonoContacto, "7731234567");
  assert.strictEqual(t.comentarios, "Con jardín");
});

// El endpoint todavía no manda la foto: la tarjeta debe aguantar su ausencia sin romperse
// y sin pedir el salón de cada solicitud (eso sería una llamada por tarjeta).
test("sin foto del back, la tarjeta deja fotoPrincipal en null (pinta el marcador)", () => {
  assert.strictEqual(tarjetaDeSolicitud(SOLICITUDES[0]).fotoPrincipal, null);
});

test("cuando el back mande fotoPrincipal, la tarjeta la usa", () => {
  const con = tarjetaDeSolicitud({ ...SOLICITUDES[0], fotoPrincipal: "https://ejemplo.mx/f.jpg" });
  assert.strictEqual(con.fotoPrincipal, "https://ejemplo.mx/f.jpg");
});

test("tarjetaDeSolicitud rellena lo que falte sin romperse", () => {
  const t = tarjetaDeSolicitud({});
  assert.strictEqual(t.nombreSalon, "Salón");
  assert.strictEqual(t.numeroInvitados, 0);
  assert.strictEqual(t.fotoPrincipal, null);
  assert.doesNotThrow(() => tarjetaDeSolicitud(null));
});

test("tarjetasDeSolicitudes acepta listas vacías o inválidas", () => {
  assert.strictEqual(tarjetasDeSolicitudes(SOLICITUDES).length, 4);
  assert.deepStrictEqual(tarjetasDeSolicitudes([]), []);
  assert.deepStrictEqual(tarjetasDeSolicitudes(null), []);
});

test("el estado vacío cambia según el filtro", () => {
  assert.match(textoSinResultados("pendiente"), /pendientes/i);
  assert.match(textoSinResultados("confirmada"), /confirmadas/i);
  assert.match(textoSinResultados("rechazada"), /rechazadas/i);
  assert.match(textoSinResultados("todas"), /no has enviado/i);
});

// ---------- Invitación a ser administrador ----------

test("la invitación se le muestra solo al cliente", () => {
  assert.strictEqual(muestraInvitacionAdmin({ id: 1, tipo_cuenta: "cliente" }), true);
});

test("quien ya es administrador NO ve la invitación", () => {
  assert.strictEqual(muestraInvitacionAdmin({ id: 1, tipo_cuenta: "administrador" }), false);
});

test("sin sesión no se muestra la invitación", () => {
  assert.strictEqual(muestraInvitacionAdmin(null), false);
  assert.strictEqual(muestraInvitacionAdmin(undefined), false);
  assert.strictEqual(muestraInvitacionAdmin({}), false);
});

test("la invitación lleva al registro de administrador (el back no convierte cuentas)", () => {
  assert.strictEqual(INVITACION_ADMIN.destino, "RegistroAdministrador");
  assert.match(INVITACION_ADMIN.titulo, /registrar un salón/i);
  assert.match(INVITACION_ADMIN.boton, /administrador/i);
});

// ---------- Botón Regresar ----------

test("cada pantalla interna sabe a dónde regresar", () => {
  assert.strictEqual(regresoDe("EditarSalon"), "MisSalones");
  assert.strictEqual(regresoDe("MisSalones"), "PanelAdministrador");
  assert.strictEqual(regresoDe("DetalleSalon"), "BusquedaSalones");
  assert.strictEqual(regresoDe("Perfil"), "BusquedaSalones");
  assert.strictEqual(regresoDe("MisSolicitudes"), "BusquedaSalones");
  assert.strictEqual(regresoDe("RegistroCliente"), "Login");
  assert.strictEqual(regresoDe("RegistroAdministrador"), "Login");
});

// Nunca debe dejar al usuario en blanco ni mandarlo al login desde una pantalla de sesión.
test("el regreso nunca es una pantalla vacía ni el login desde pantallas de sesión", () => {
  for (const p of ["EditarSalon", "MisSalones", "DetalleSalon", "Perfil", "MisSolicitudes", "PanelAdministrador"]) {
    const destino = regresoDe(p);
    assert.ok(destino, `${p} sin destino`);
    assert.notStrictEqual(destino, "Login", `${p} no debe regresar al login`);
  }
});

test("una pantalla desconocida regresa al inicio", () => {
  assert.strictEqual(regresoDe("NoExiste"), "BusquedaSalones");
  assert.strictEqual(regresoDe(undefined), "BusquedaSalones");
});

test("la pantalla de inicio no lleva botón Regresar", () => {
  assert.strictEqual(llevaBotonRegresar("BusquedaSalones"), false);
});

test("las pantallas internas sí llevan botón Regresar", () => {
  for (const p of ["EditarSalon", "MisSalones", "DetalleSalon", "Perfil", "MisSolicitudes", "RegistroCliente", "RegistroAdministrador"]) {
    assert.strictEqual(llevaBotonRegresar(p), true, p);
  }
});

// ---------- La pantalla vieja ya no existe ----------

test("PublicarSalon ya no es una pantalla con acceso propio", () => {
  // Se quitó del mapa de accesos: ahora todo pasa por "Mis salones".
  assert.strictEqual(claveActiva("PublicarSalon"), null);
  assert.strictEqual(claveActiva("MisSalones"), "salon");
  assert.strictEqual(claveActiva("EditarSalon"), "salon");
});
