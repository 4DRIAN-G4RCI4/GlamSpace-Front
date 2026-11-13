// Fechas del calendario y formatos para mostrar (HU-12/13/19/22) · funciones puras (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  DIAS_SEMANA,
  DIAS_SEMANA_DESDE_DOMINGO,
  MESES,
  claveFecha,
  fechaHoy,
  formatearFechaCorta,
  formatearFechaHora,
  formatearFechaLarga,
  semanasDelMes,
  sumarMeses,
} from "../../utils/fechas.js";

// ---------- Catálogos ----------

test("los catálogos tienen 12 meses y 7 días en el orden esperado", () => {
  assert.strictEqual(MESES.length, 12);
  assert.strictEqual(MESES[0], "enero");
  assert.strictEqual(MESES[11], "diciembre");
  // La semana del cliente empieza en lunes; la del panel del admin, en domingo.
  assert.strictEqual(DIAS_SEMANA.length, 7);
  assert.strictEqual(DIAS_SEMANA[0].largo, "lunes");
  assert.strictEqual(DIAS_SEMANA[6].largo, "domingo");
  assert.strictEqual(DIAS_SEMANA_DESDE_DOMINGO.length, 7);
  assert.strictEqual(DIAS_SEMANA_DESDE_DOMINGO[0].largo, "domingo");
  assert.strictEqual(DIAS_SEMANA_DESDE_DOMINGO[6].largo, "sábado");
});

// ---------- claveFecha ----------

test("claveFecha arma yyyy-MM-dd con dos dígitos", () => {
  assert.strictEqual(claveFecha(2026, 11, 4), "2026-11-04");
  assert.strictEqual(claveFecha(2026, 1, 1), "2026-01-01");
  assert.strictEqual(claveFecha(2026, 12, 31), "2026-12-31");
});

test("las claves se pueden comparar como texto", () => {
  assert.ok(claveFecha(2026, 11, 14) < claveFecha(2026, 11, 21));
  assert.ok(claveFecha(2026, 9, 30) < claveFecha(2026, 10, 1));
});

// ---------- fechaHoy ----------

test("fechaHoy regresa el día del dispositivo con su clave", () => {
  const hoy = fechaHoy();
  const esperado = new Date();
  assert.strictEqual(hoy.anio, esperado.getFullYear());
  assert.strictEqual(hoy.mes, esperado.getMonth() + 1);
  assert.strictEqual(hoy.dia, esperado.getDate());
  assert.strictEqual(hoy.clave, claveFecha(hoy.anio, hoy.mes, hoy.dia));
  assert.match(hoy.clave, /^\d{4}-\d{2}-\d{2}$/);
});

// ---------- sumarMeses ----------

test("sumarMeses avanza y retrocede cambiando de año", () => {
  assert.deepStrictEqual(sumarMeses({ anio: 2026, mes: 12 }, 1), { anio: 2027, mes: 1 });
  assert.deepStrictEqual(sumarMeses({ anio: 2026, mes: 1 }, -1), { anio: 2025, mes: 12 });
  assert.deepStrictEqual(sumarMeses({ anio: 2026, mes: 11 }, 0), { anio: 2026, mes: 11 });
  assert.deepStrictEqual(sumarMeses({ anio: 2026, mes: 6 }, 3), { anio: 2026, mes: 9 });
  assert.deepStrictEqual(sumarMeses({ anio: 2026, mes: 3 }, -5), { anio: 2025, mes: 10 });
  assert.deepStrictEqual(sumarMeses({ anio: 2026, mes: 11 }, 14), { anio: 2028, mes: 1 });
});

// ---------- semanasDelMes ----------

test("semanasDelMes arma semanas de 7 celdas con huecos al inicio y al final", () => {
  // Noviembre de 2026 empieza en domingo y tiene 30 días.
  const semanas = semanasDelMes(2026, 11);
  for (const semana of semanas) assert.strictEqual(semana.length, 7);
  // Con la semana desde lunes, el domingo 1 cae en la última casilla.
  assert.deepStrictEqual(semanas[0], [null, null, null, null, null, null, 1]);
  const dias = semanas.flat().filter((d) => d !== null);
  assert.strictEqual(dias.length, 30);
  assert.deepStrictEqual(dias, Array.from({ length: 30 }, (_, i) => i + 1));
});

test("semanasDelMes con { desdeDomingo: true } pone el día 1 en su columna", () => {
  const semanas = semanasDelMes(2026, 11, { desdeDomingo: true });
  assert.deepStrictEqual(semanas[0], [1, 2, 3, 4, 5, 6, 7]);
  assert.strictEqual(semanas.flat().filter((d) => d !== null).length, 30);
});

test("semanasDelMes respeta los años bisiestos", () => {
  assert.strictEqual(semanasDelMes(2024, 2).flat().filter(Boolean).length, 29);
  assert.strictEqual(semanasDelMes(2026, 2).flat().filter(Boolean).length, 28);
});

test("semanasDelMes acomoda meses de 31 y de 30 días", () => {
  assert.strictEqual(semanasDelMes(2026, 1).flat().filter(Boolean).length, 31);
  assert.strictEqual(semanasDelMes(2026, 4).flat().filter(Boolean).length, 30);
  assert.strictEqual(semanasDelMes(2026, 12).flat().filter(Boolean).length, 31);
});

// ---------- Formatos ----------

test("formatearFechaCorta pone día de la semana, día, mes y año", () => {
  assert.strictEqual(formatearFechaCorta("2026-09-11"), "Vie 11 sep 2026");
  assert.strictEqual(formatearFechaCorta("2026-11-14"), "Sáb 14 nov 2026");
  assert.strictEqual(formatearFechaCorta("2026-01-01"), "Jue 1 ene 2026");
});

test("formatearFechaCorta sin año cuando se pide", () => {
  assert.strictEqual(formatearFechaCorta("2026-09-11", { conAnio: false }), "Vie 11 sep");
});

test("formatearFechaLarga escribe el día y el mes con letra", () => {
  assert.strictEqual(formatearFechaLarga("2026-11-14"), "sábado 14 de noviembre de 2026");
  assert.strictEqual(formatearFechaLarga("2026-01-05"), "lunes 5 de enero de 2026");
  assert.strictEqual(formatearFechaLarga("2026-12-31"), "jueves 31 de diciembre de 2026");
});

test("formatearFechaHora agrega la hora local con dos dígitos", () => {
  assert.strictEqual(formatearFechaHora(new Date(2026, 10, 12, 9, 5)), "12 nov 2026, 09:05");
  assert.strictEqual(formatearFechaHora(new Date(2026, 0, 1, 23, 59)), "1 ene 2026, 23:59");
  assert.strictEqual(formatearFechaHora(new Date(2026, 5, 30, 0, 0)), "30 jun 2026, 00:00");
});

test("formatearFechaHora acepta el texto de una fecha", () => {
  assert.strictEqual(formatearFechaHora("2026-11-12T09:05:00"), "12 nov 2026, 09:05");
});

// Las fechas se arman con año/mes/día locales y nunca pasan por UTC: así no se corren un día.
test("las fechas no se corren un día por la zona horaria", () => {
  assert.strictEqual(formatearFechaCorta("2026-11-01", { conAnio: false }), "Dom 1 nov");
  assert.strictEqual(formatearFechaLarga("2026-11-01"), "domingo 1 de noviembre de 2026");
});
