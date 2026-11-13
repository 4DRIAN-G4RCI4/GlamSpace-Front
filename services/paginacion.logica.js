/**
 * GlamSpaces · Paginación compartida por las listas. Funciones puras: sin React y sin red.
 *
 * Dos usos distintos:
 *   - Listas que ya están en memoria (solicitudes): se parten de 10 en 10 aquí mismo.
 *   - Listas que vienen paginadas del back (salones): el back manda `totalRegistros` y
 *     `totalPaginas`, y aquí solo se arman los números de página y los textos.
 *
 * En las listas de salones conviven dos cosas (petición del Sprint 7):
 *   - "Cargar más salones": agrega 2 filas (6 salones) a lo que ya se ve, dentro de la página.
 *   - Paginación de 18 en 18: cambia de bloque y reinicia lo que se había cargado de más.
 */

// Solicitudes: 2 columnas × 5 filas.
export const POR_PAGINA_SOLICITUDES = 10;

// Salones: 3 columnas × 6 filas = 18 por página; "Cargar más" suma 2 filas.
export const POR_PAGINA_SALONES = 18;
export const SALONES_POR_CARGA = 6;

// Cuántos números de página se pintan como máximo (con "…" cuando hay más).
const MAXIMO_NUMEROS = 7;

export function totalDePaginas(totalRegistros, porPagina) {
  const total = Number(totalRegistros) || 0;
  const tamano = Number(porPagina) || 1;
  return total === 0 ? 1 : Math.ceil(total / tamano);
}

/** La página siempre queda dentro del rango disponible (1 … totalPaginas). */
export function paginaValida(pagina, totalPaginas) {
  const n = Number(pagina) || 1;
  const max = Math.max(1, Number(totalPaginas) || 1);
  return Math.min(Math.max(1, n), max);
}

/**
 * Corta una lista que ya está completa en memoria.
 * → { visibles, pagina, totalPaginas, totalRegistros, desde, hasta, hayAnterior, haySiguiente }
 */
export function paginar(lista, pagina, porPagina = POR_PAGINA_SOLICITUDES) {
  const todos = Array.isArray(lista) ? lista : [];
  const totalRegistros = todos.length;
  const totalPaginas = totalDePaginas(totalRegistros, porPagina);
  const actual = paginaValida(pagina, totalPaginas);
  const inicio = (actual - 1) * porPagina;
  const visibles = todos.slice(inicio, inicio + porPagina);

  return {
    visibles,
    pagina: actual,
    totalPaginas,
    totalRegistros,
    desde: totalRegistros === 0 ? 0 : inicio + 1,
    hasta: inicio + visibles.length,
    hayAnterior: actual > 1,
    haySiguiente: actual < totalPaginas,
  };
}

/**
 * Lo mismo pero para una lista que ya viene paginada del back: no se corta nada, solo se
 * calculan los textos y los botones a partir de lo que contestó la API.
 */
export function paginaDelServidor({ pagina, porPagina, totalRegistros, totalPaginas, cuantosLlegaron }) {
  const total = Number(totalRegistros) || 0;
  const paginas = Number(totalPaginas) || totalDePaginas(total, porPagina);
  const actual = paginaValida(pagina, paginas);
  const inicio = (actual - 1) * porPagina;
  const llegaron = Number(cuantosLlegaron) || 0;

  return {
    pagina: actual,
    totalPaginas: paginas,
    totalRegistros: total,
    desde: total === 0 ? 0 : inicio + 1,
    hasta: total === 0 ? 0 : inicio + llegaron,
    hayAnterior: actual > 1,
    haySiguiente: actual < paginas,
  };
}

/**
 * Números de página para los botones, con "…" cuando no caben todos.
 * Siempre se ven la primera, la última y las vecinas de la actual.
 * → [1, "…", 4, 5, 6, "…", 25]
 */
export function numerosDePagina(pagina, totalPaginas, maximo = MAXIMO_NUMEROS) {
  const total = Math.max(1, Number(totalPaginas) || 1);
  const actual = paginaValida(pagina, total);
  if (total <= maximo) return Array.from({ length: total }, (_, i) => i + 1);

  // El tope cuenta TODO lo que se pinta, también los "…": con maximo 7 se ven como mucho
  // 7 elementos (por ejemplo 1 · … · 41 42 43 · … · 84).
  const numeros = [];
  const agregar = (n) => { if (!numeros.includes(n)) numeros.push(n); };

  // Cuántas páginas de verdad caben: se restan la primera, la última y los dos posibles "…".
  const huecos = (actual > 3 ? 1 : 0) + (actual < total - 2 ? 1 : 0);
  const cuantas = Math.max(1, maximo - 2 - huecos);

  let desde = Math.max(2, actual - Math.floor((cuantas - 1) / 2));
  let hasta = Math.min(total - 1, desde + cuantas - 1);
  desde = Math.max(2, Math.min(desde, hasta - cuantas + 1));

  agregar(1);
  if (desde > 2) numeros.push("…");
  for (let n = desde; n <= hasta; n++) agregar(n);
  if (hasta < total - 1) numeros.push("…");
  agregar(total);
  return numeros;
}

/** "Mostrando 1–10 de 48 solicitudes" · con 0 lo dice sin números. */
export function textoDeRango({ desde, hasta, totalRegistros }, singular = "resultado", plural = "resultados") {
  const total = Number(totalRegistros) || 0;
  if (total === 0) return `Sin ${plural}`;
  const nombre = total === 1 ? singular : plural;
  return `Mostrando ${desde}–${hasta} de ${total.toLocaleString("es-MX")} ${nombre}`;
}

/**
 * "Cargar más" dentro de una página de salones: cuántos se ven y si queda algo por mostrar
 * de los que ya se tienen. `cargas` empieza en 0 (solo la primera fila de filas).
 */
export function visiblesConCargarMas(lista, cargas, inicial = POR_PAGINA_SALONES, porCarga = SALONES_POR_CARGA) {
  const todos = Array.isArray(lista) ? lista : [];
  // La primera página ya trae `inicial`; "Cargar más" suma de a `porCarga`.
  const cuantos = Math.min(todos.length, inicial + Math.max(0, Number(cargas) || 0) * porCarga);
  return { visibles: todos.slice(0, cuantos), hayMasEnLaPagina: cuantos < todos.length };
}
