// HU-19 · Reglas del panel del administrador: pendientes, historial, cifras y calendario (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  ETIQUETA_ESTADO,
  ORDENES,
  detalleSolicitud,
  estadisticas,
  fechasConPendientes,
  historialReciente,
  iniciales,
  pendientesEnConflicto,
  proximasConfirmadas,
  solicitudesPendientes,
} from "../../screens/PanelAdministrador/panelAdministrador.logica.js";

// Datos de prueba: las fechas son texto "yyyy-MM-dd", como las regresa la API.
const SOLICITUDES = [
  { id: 1, estado: "pendiente", fechaEvento: "2026-11-20", fechaCreacion: "2026-11-01T10:00:00", numeroInvitados: 100, nombrePaquete: "Oro", precioPaquete: 8500 },
  { id: 2, estado: "pendiente", fechaEvento: "2026-11-14", fechaCreacion: "2026-11-02T10:00:00", numeroInvitados: 150, nombrePaquete: "Plata", precioPaquete: 7000 },
  { id: 3, estado: "confirmada", fechaEvento: "2026-11-25", fechaCreacion: "2026-11-03T10:00:00", numeroInvitados: 200, nombrePaquete: "Oro", precioPaquete: 8500 },
  { id: 4, estado: "rechazada", fechaEvento: "2026-11-10", fechaCreacion: "2026-11-04T10:00:00", numeroInvitados: 80, nombrePaquete: null, precioPaquete: null },
  { id: 5, estado: "confirmada", fechaEvento: "2026-12-05", fechaCreacion: "2026-11-05T10:00:00", numeroInvitados: 120, nombrePaquete: "Plata", precioPaquete: 7000 },
  { id: 6, estado: "confirmada", fechaEvento: "2026-11-08", fechaCreacion: "2026-11-06T10:00:00", numeroInvitados: 90, nombrePaquete: "Bronce", precioPaquete: 5000 },
];

const ids = (lista) => lista.map((s) => s.id);
const HOY = "2026-11-12";

// ---------- Pendientes ----------

test("solicitudesPendientes: solo pendientes, la más próxima primero", () => {
  assert.deepStrictEqual(ids(solicitudesPendientes(SOLICITUDES)), [2, 1]);
});

test("solicitudesPendientes: con la misma fecha desempata por id", () => {
  const mismaFecha = [
    { id: 9, estado: "pendiente", fechaEvento: "2026-11-14" },
    { id: 4, estado: "pendiente", fechaEvento: "2026-11-14" },
  ];
  assert.deepStrictEqual(ids(solicitudesPendientes(mismaFecha)), [4, 9]);
});

test("solicitudesPendientes: sin pendientes regresa lista vacía", () => {
  assert.deepStrictEqual(solicitudesPendientes([]), []);
  assert.deepStrictEqual(solicitudesPendientes([{ id: 1, estado: "confirmada", fechaEvento: "2026-11-01" }]), []);
});

// ---------- Historial ----------

test("historialReciente: ya atendidas, la más nueva primero", () => {
  assert.deepStrictEqual(ids(historialReciente(SOLICITUDES)), [6, 5, 4, 3]);
});

test("historialReciente: respeta el límite y con 0 trae todas", () => {
  assert.deepStrictEqual(ids(historialReciente(SOLICITUDES, 2)), [6, 5]);
  assert.strictEqual(historialReciente(SOLICITUDES, 0).length, 4);
});

// ---------- Cifras de las tarjetas ----------

test("estadisticas: cuenta pendientes y suma lo aceptado del mes en curso", () => {
  // En noviembre de 2026 hay 2 confirmadas (ids 3 y 6); la 5 es de diciembre.
  assert.deepStrictEqual(estadisticas(SOLICITUDES, HOY), {
    pendientes: 2,
    aceptadasMes: 2,
    ingresosMes: 13500,
  });
});

test("estadisticas: sin solicitudes todo queda en cero", () => {
  assert.deepStrictEqual(estadisticas([], HOY), { pendientes: 0, aceptadasMes: 0, ingresosMes: 0 });
});

test("estadisticas: una confirmada sin precio no rompe la suma", () => {
  const sinPrecio = [{ id: 1, estado: "confirmada", fechaEvento: "2026-11-09", precioPaquete: null }];
  assert.strictEqual(estadisticas(sinPrecio, HOY).ingresosMes, 0);
});

test("estadisticas: solo cuenta el mes de hoy", () => {
  assert.strictEqual(estadisticas(SOLICITUDES, "2026-12-01").aceptadasMes, 1);
  assert.strictEqual(estadisticas(SOLICITUDES, "2026-12-01").ingresosMes, 7000);
});

// ---------- Calendario ----------

test("proximasConfirmadas: confirmadas de hoy en adelante, en orden", () => {
  assert.deepStrictEqual(ids(proximasConfirmadas(SOLICITUDES, HOY)), [3, 5]);
});

test("proximasConfirmadas: incluye la de hoy mismo y respeta el límite", () => {
  assert.deepStrictEqual(ids(proximasConfirmadas(SOLICITUDES, "2026-11-25")), [3, 5]);
  assert.deepStrictEqual(ids(proximasConfirmadas(SOLICITUDES, HOY, 1)), [3]);
});

test("fechasConPendientes: el conjunto de fechas con alguna pendiente", () => {
  const fechas = fechasConPendientes(SOLICITUDES);
  assert.ok(fechas instanceof Set);
  assert.deepStrictEqual([...fechas].sort(), ["2026-11-14", "2026-11-20"]);
  assert.strictEqual(fechas.has("2026-11-25"), false); // esa es confirmada
});

test("pendientesEnConflicto: otras pendientes del mismo día (HU-17)", () => {
  const mismoDia = [
    { id: 1, estado: "pendiente", fechaEvento: "2026-11-14" },
    { id: 2, estado: "pendiente", fechaEvento: "2026-11-14" },
    { id: 3, estado: "pendiente", fechaEvento: "2026-11-14" },
    { id: 4, estado: "confirmada", fechaEvento: "2026-11-14" },
    { id: 5, estado: "pendiente", fechaEvento: "2026-11-15" },
  ];
  // Sin contarse ella misma, ni las de otro día, ni las ya atendidas.
  assert.strictEqual(pendientesEnConflicto(mismoDia, mismoDia[0]), 2);
  assert.strictEqual(pendientesEnConflicto(mismoDia, mismoDia[4]), 0);
});

// ---------- Textos ----------

test("detalleSolicitud: fecha, paquete e invitados en una línea", () => {
  assert.strictEqual(detalleSolicitud(SOLICITUDES[0]), "Vie 20 nov 2026 · Oro · 100 inv.");
});

test("detalleSolicitud: sin paquete lo dice", () => {
  assert.strictEqual(detalleSolicitud(SOLICITUDES[3]), "Mar 10 nov 2026 · Sin paquete · 80 inv.");
});

test("iniciales: toma las dos primeras palabras con mayúscula", () => {
  assert.strictEqual(iniciales("María López García"), "ML");
  assert.strictEqual(iniciales("Jardín Villa Esmeralda"), "JV");
  assert.strictEqual(iniciales("Ana"), "A");
});

// Los corchetes y paréntesis se cambian por espacios, así que la palabra que encierran
// sí cuenta: "[Prueba] Salón Real" → "PS" (Prueba y Salón), no "SR".
test("iniciales: los corchetes y paréntesis no estorban al separar palabras", () => {
  assert.strictEqual(iniciales("[Prueba] Salón Real"), "PS");
  assert.strictEqual(iniciales("(Nuevo) Jardín Azul"), "NJ");
  assert.strictEqual(iniciales("Salón (Tula)"), "ST");
});

test("iniciales: cuando no hay mayúsculas usa el primer carácter útil", () => {
  assert.strictEqual(iniciales("salón de fiestas"), "S");
  assert.strictEqual(iniciales("123 Salón"), "S");
});

test("iniciales: sin nombre regresa la G de GlamSpaces", () => {
  assert.strictEqual(iniciales(""), "G");
  assert.strictEqual(iniciales(null), "G");
  assert.strictEqual(iniciales(undefined), "G");
  assert.strictEqual(iniciales("   "), "G");
});

test("las etiquetas y los órdenes están en español", () => {
  assert.deepStrictEqual(ETIQUETA_ESTADO, {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    rechazada: "Rechazada",
  });
  assert.deepStrictEqual(
    ORDENES.map((o) => o.clave),
    ["proximas", "recientes"],
  );
});
