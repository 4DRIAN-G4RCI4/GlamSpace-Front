/**
 * GlamSpaces · Fechas del calendario de disponibilidad (HU-13). Funciones puras.
 *
 * Las fechas se manejan como texto "yyyy-MM-dd" (igual que las regresa la API) y se
 * arman con año/mes/día locales, sin pasar por UTC: así nunca se corren un día.
 * Como texto, se pueden comparar directo ("2026-11-14" < "2026-11-21").
 */

export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// La semana empieza en lunes.
export const DIAS_SEMANA = [
  { corto: "L", largo: "lunes" },
  { corto: "M", largo: "martes" },
  { corto: "M", largo: "miércoles" },
  { corto: "J", largo: "jueves" },
  { corto: "V", largo: "viernes" },
  { corto: "S", largo: "sábado" },
  { corto: "D", largo: "domingo" },
];

const dosDigitos = (n) => String(n).padStart(2, "0");

// (2026, 11, 4) → "2026-11-04"   ·   mes de 1 a 12
export function claveFecha(anio, mes, dia) {
  return `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`;
}

// → { anio, mes, dia, clave } de hoy en la hora del dispositivo.
export function fechaHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  const dia = hoy.getDate();
  return { anio, mes, dia, clave: claveFecha(anio, mes, dia) };
}

// ({ anio: 2026, mes: 12 }, 1) → { anio: 2027, mes: 1 }
export function sumarMeses({ anio, mes }, paso) {
  const total = anio * 12 + (mes - 1) + paso;
  return { anio: Math.floor(total / 12), mes: (total % 12) + 1 };
}

// Semanas del mes para pintar la cuadrícula: arreglos de 7 días (número o null en los huecos).
export function semanasDelMes(anio, mes) {
  const huecosAlInicio = (new Date(anio, mes - 1, 1).getDay() + 6) % 7; // lunes = 0
  const diasEnMes = new Date(anio, mes, 0).getDate();

  const celdas = Array(huecosAlInicio).fill(null);
  for (let dia = 1; dia <= diasEnMes; dia++) celdas.push(dia);
  while (celdas.length % 7 !== 0) celdas.push(null);

  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

// "2026-11-14" → "sábado 14 de noviembre de 2026"
export function formatearFechaLarga(clave) {
  const [anio, mes, dia] = clave.split("-").map(Number);
  const diaSemana = DIAS_SEMANA[(new Date(anio, mes - 1, dia).getDay() + 6) % 7].largo;
  return `${diaSemana} ${dia} de ${MESES[mes - 1]} de ${anio}`;
}
