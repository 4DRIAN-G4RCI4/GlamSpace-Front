// Ajuste de usabilidad (HU-19 / navegación): accesos por rol, acceso activo y lista de solicitudes (node --test).
import test from "node:test";
import assert from "node:assert";
import { CORTE_TELEFONO, accesosPara, claveActiva, esTelefono, inicialesDe } from "../../components/navegacion.logica.js";
import {
  FILTROS_ESTADO,
  contarPorEstado,
  fechaDeCreacion,
  listaDeSolicitudes,
  paginaVisible,
} from "../../screens/PanelAdministrador/panelAdministrador.logica.js";

const claves = (lista) => lista.map((a) => a.clave);

test("sin sesión: solo Buscar salones", () => {
  assert.deepStrictEqual(claves(accesosPara(null)), ["buscar"]);
});

test("cliente: Buscar salones, Mis solicitudes y Mi perfil", () => {
  const a = accesosPara({ id: 3, tipo_cuenta: "cliente" });
  assert.deepStrictEqual(claves(a), ["buscar", "solicitudes", "perfil"]);
  assert.strictEqual(a[1].destino, "MisSolicitudes");
  assert.strictEqual(a[1].texto, "Mis solicitudes");
});

test("administrador: Buscar salones, Solicitudes (panel), Mis salones y Mi perfil", () => {
  const a = accesosPara({ id: 7, tipo_cuenta: "administrador" });
  assert.deepStrictEqual(claves(a), ["buscar", "solicitudes", "salon", "perfil"]);
  assert.strictEqual(a[1].destino, "PanelAdministrador");
  assert.deepStrictEqual(a[1].params, { pestana: "solicitudes" });
  // "Mi salón" pasó a ser "Mis salones": abre la lista de todos los salones del admin.
  assert.strictEqual(a[2].destino, "MisSalones");
  assert.strictEqual(a[2].texto, "Mis salones");
});

test("acceso activo según la pantalla (aria-current)", () => {
  assert.strictEqual(claveActiva("BusquedaSalones"), "buscar");
  assert.strictEqual(claveActiva("DetalleSalon"), "buscar");
  assert.strictEqual(claveActiva("SolicitudReservacion"), "buscar");
  assert.strictEqual(claveActiva("MisSolicitudes"), "solicitudes");
  assert.strictEqual(claveActiva("PanelAdministrador"), "solicitudes");
  // La pantalla vieja de un solo salón ya no existe: todo pasa por "Mis salones".
  assert.strictEqual(claveActiva("PublicarSalon"), null);
  assert.strictEqual(claveActiva("MisSalones"), "salon");
  assert.strictEqual(claveActiva("EditarSalon"), "salon");
  assert.strictEqual(claveActiva("Perfil"), "perfil");
  assert.strictEqual(claveActiva("Login"), null);
});

test("menú hamburguesa solo debajo de 768 px", () => {
  assert.strictEqual(CORTE_TELEFONO, 768);
  assert.strictEqual(esTelefono(320), true);
  assert.strictEqual(esTelefono(767), true);
  assert.strictEqual(esTelefono(768), false);
  assert.strictEqual(esTelefono(1440), false);
});

test("iniciales del avatar", () => {
  assert.strictEqual(inicialesDe("María López García"), "MG");
  assert.strictEqual(inicialesDe("Admin"), "A");
  assert.strictEqual(inicialesDe(""), "?");
  assert.strictEqual(inicialesDe(undefined), "?");
});

const S = [
  { id: 1, estado: "pendiente", fechaEvento: "2026-12-19", fechaCreacion: "2026-11-01T10:00:00" },
  { id: 2, estado: "confirmada", fechaEvento: "2026-12-12", fechaCreacion: "2026-11-03T10:00:00" },
  { id: 3, estado: "rechazada", fechaEvento: "2026-12-05", fechaCreacion: "2026-11-02T10:00:00" },
  { id: 4, estado: "pendiente", fechaEvento: "2026-12-05", fechaCreacion: "2026-11-04T10:00:00" },
];

test("conteo por estado para los chips del filtro", () => {
  assert.deepStrictEqual(contarPorEstado(S), { todas: 4, pendiente: 2, confirmada: 1, rechazada: 1 });
  assert.deepStrictEqual(contarPorEstado([]), { todas: 0, pendiente: 0, confirmada: 0, rechazada: 0 });
  assert.deepStrictEqual(FILTROS_ESTADO.map((f) => f.clave), ["todas", "pendiente", "confirmada", "rechazada"]);
});

test("filtro por estado y orden por fecha del evento (la más próxima primero; empate por id)", () => {
  assert.deepStrictEqual(listaDeSolicitudes(S, "todas", "proximas").map((s) => s.id), [3, 4, 2, 1]);
  assert.deepStrictEqual(listaDeSolicitudes(S, "pendiente", "proximas").map((s) => s.id), [4, 1]);
  assert.deepStrictEqual(listaDeSolicitudes(S, "confirmada").map((s) => s.id), [2]);
});

test("orden por más recientes (fecha en que llegó la solicitud)", () => {
  assert.deepStrictEqual(listaDeSolicitudes(S, "todas", "recientes").map((s) => s.id), [4, 2, 3, 1]);
});

test("ordenar no cambia la lista original", () => {
  const copia = S.map((s) => s.id);
  listaDeSolicitudes(S, "todas", "recientes");
  assert.deepStrictEqual(S.map((s) => s.id), copia);
});

test("paginación de 10 en 10 con 'Ver más'", () => {
  const muchas = Array.from({ length: 23 }, (_, i) => i);
  assert.deepStrictEqual([paginaVisible(muchas, 1).visibles.length, paginaVisible(muchas, 1).hayMas], [10, true]);
  assert.deepStrictEqual([paginaVisible(muchas, 2).visibles.length, paginaVisible(muchas, 2).hayMas], [20, true]);
  assert.deepStrictEqual([paginaVisible(muchas, 3).visibles.length, paginaVisible(muchas, 3).hayMas], [23, false]);
  assert.deepStrictEqual(paginaVisible([], 1), { visibles: [], hayMas: false });
});

test("fecha de creación: la API la manda en UTC (con o sin Z) y se muestra en hora local", () => {
  const local = (iso) => {
    const d = new Date(iso);
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  assert.strictEqual(fechaDeCreacion("2026-11-12T15:05:00"), local("2026-11-12T15:05:00Z"));
  assert.strictEqual(fechaDeCreacion("2026-11-12T15:05:00Z"), local("2026-11-12T15:05:00Z"));
  // Con desfase explícito no se le agrega "Z" (si se agregara, la fecha sería inválida y saldría vacía)
  assert.strictEqual(fechaDeCreacion("2026-11-12T09:05:00-06:00"), local("2026-11-12T15:05:00Z"));
  assert.strictEqual(fechaDeCreacion("2026-11-12T15:05:00+0000"), local("2026-11-12T15:05:00Z"));
  // Una "Z" en medio no cuenta como zona
  assert.strictEqual(fechaDeCreacion(""), "");
  assert.strictEqual(fechaDeCreacion("no es fecha"), "");
});
