// Sprint 7 · Paginación de solicitudes (10) y de salones (18 + "Cargar más") (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  POR_PAGINA_SALONES,
  POR_PAGINA_SOLICITUDES,
  SALONES_POR_CARGA,
  numerosDePagina,
  paginaDelServidor,
  paginaValida,
  paginar,
  textoDeRango,
  totalDePaginas,
  visiblesConCargarMas,
} from "../../services/paginacion.logica.js";

const lista = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));

// ---------- Tamaños acordados ----------

test("los tamaños son los pedidos: 10 solicitudes, 18 salones, 6 por carga", () => {
  assert.strictEqual(POR_PAGINA_SOLICITUDES, 10); // 2 columnas × 5 filas
  assert.strictEqual(POR_PAGINA_SALONES, 18); // 3 columnas × 6 filas
  assert.strictEqual(SALONES_POR_CARGA, 6); // "Cargar más" = 2 filas
});

// ---------- totalDePaginas / paginaValida ----------

test("totalDePaginas redondea hacia arriba y nunca da 0", () => {
  assert.strictEqual(totalDePaginas(48, 10), 5);
  assert.strictEqual(totalDePaginas(50, 10), 5);
  assert.strictEqual(totalDePaginas(51, 10), 6);
  assert.strictEqual(totalDePaginas(1500, 18), 84);
  assert.strictEqual(totalDePaginas(0, 10), 1); // lista vacía: sigue siendo la página 1
});

test("paginaValida deja la página dentro del rango", () => {
  assert.strictEqual(paginaValida(3, 5), 3);
  assert.strictEqual(paginaValida(0, 5), 1);
  assert.strictEqual(paginaValida(-2, 5), 1);
  assert.strictEqual(paginaValida(99, 5), 5);
  assert.strictEqual(paginaValida("abc", 5), 1);
});

// ---------- paginar (listas en memoria) ----------

test("paginar corta de 10 en 10 y dice el rango", () => {
  const r = paginar(lista(48), 1);
  assert.strictEqual(r.visibles.length, 10);
  assert.strictEqual(r.visibles[0].id, 1);
  assert.deepStrictEqual([r.pagina, r.totalPaginas, r.totalRegistros], [1, 5, 48]);
  assert.deepStrictEqual([r.desde, r.hasta], [1, 10]);
  assert.strictEqual(r.hayAnterior, false);
  assert.strictEqual(r.haySiguiente, true);
});

test("paginar en una página intermedia", () => {
  const r = paginar(lista(48), 3);
  assert.strictEqual(r.visibles[0].id, 21);
  assert.deepStrictEqual([r.desde, r.hasta], [21, 30]);
  assert.strictEqual(r.hayAnterior, true);
  assert.strictEqual(r.haySiguiente, true);
});

test("paginar en la última página puede traer menos de 10", () => {
  const r = paginar(lista(48), 5);
  assert.strictEqual(r.visibles.length, 8);
  assert.deepStrictEqual([r.desde, r.hasta], [41, 48]);
  assert.strictEqual(r.haySiguiente, false);
});

test("paginar con una página fuera de rango se queda en la última", () => {
  const r = paginar(lista(48), 99);
  assert.strictEqual(r.pagina, 5);
  assert.strictEqual(r.visibles.length, 8);
});

test("paginar una lista vacía no rompe nada", () => {
  const r = paginar([], 1);
  assert.deepStrictEqual(r.visibles, []);
  assert.deepStrictEqual([r.desde, r.hasta, r.totalRegistros], [0, 0, 0]);
  assert.strictEqual(r.hayAnterior, false);
  assert.strictEqual(r.haySiguiente, false);
});

test("paginar aguanta que no le pasen una lista", () => {
  assert.strictEqual(paginar(null, 1).totalRegistros, 0);
  assert.strictEqual(paginar(undefined, 1).visibles.length, 0);
});

// ---------- paginaDelServidor (el back ya paginó) ----------

test("paginaDelServidor usa el total que mandó la API", () => {
  // Página 2 de 1,500 salones de 18 en 18.
  const r = paginaDelServidor({ pagina: 2, porPagina: 18, totalRegistros: 1500, totalPaginas: 84, cuantosLlegaron: 18 });
  assert.deepStrictEqual([r.desde, r.hasta], [19, 36]);
  assert.strictEqual(r.totalPaginas, 84);
  assert.strictEqual(r.hayAnterior, true);
  assert.strictEqual(r.haySiguiente, true);
});

test("paginaDelServidor en la última página", () => {
  const r = paginaDelServidor({ pagina: 84, porPagina: 18, totalRegistros: 1500, totalPaginas: 84, cuantosLlegaron: 6 });
  assert.deepStrictEqual([r.desde, r.hasta], [1495, 1500]);
  assert.strictEqual(r.haySiguiente, false);
});

test("paginaDelServidor sin resultados", () => {
  const r = paginaDelServidor({ pagina: 1, porPagina: 18, totalRegistros: 0, totalPaginas: 0, cuantosLlegaron: 0 });
  assert.deepStrictEqual([r.desde, r.hasta, r.totalRegistros], [0, 0, 0]);
  assert.strictEqual(r.haySiguiente, false);
});

test("paginaDelServidor calcula las páginas si la API no las manda", () => {
  const r = paginaDelServidor({ pagina: 1, porPagina: 18, totalRegistros: 40, cuantosLlegaron: 18 });
  assert.strictEqual(r.totalPaginas, 3);
});

// ---------- numerosDePagina ----------

test("con pocas páginas se ven todas", () => {
  assert.deepStrictEqual(numerosDePagina(1, 5), [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(numerosDePagina(3, 3), [1, 2, 3]);
  assert.deepStrictEqual(numerosDePagina(1, 1), [1]);
});

test("con muchas páginas siempre se ven la primera y la última", () => {
  for (const actual of [1, 10, 42, 84]) {
    const n = numerosDePagina(actual, 84);
    assert.strictEqual(n[0], 1, `página ${actual}`);
    assert.strictEqual(n[n.length - 1], 84, `página ${actual}`);
    assert.ok(n.includes(actual), `falta la actual ${actual}`);
    assert.ok(n.length <= 7, `demasiados botones: ${n.length}`);
  }
});

test("los puntos suspensivos salen solo donde faltan páginas", () => {
  // Al principio: no hay hueco a la izquierda.
  const inicio = numerosDePagina(1, 84);
  assert.strictEqual(inicio[1], 2);
  assert.ok(inicio.includes("…"));
  // En medio: hueco de los dos lados.
  const medio = numerosDePagina(42, 84);
  assert.strictEqual(medio.filter((x) => x === "…").length, 2);
  // Al final: no hay hueco a la derecha.
  const fin = numerosDePagina(84, 84);
  assert.strictEqual(fin[fin.length - 2], 83);
});

// ---------- textoDeRango ----------

test("textoDeRango arma el texto con separador de miles", () => {
  assert.strictEqual(
    textoDeRango({ desde: 1, hasta: 18, totalRegistros: 1500 }, "salón", "salones"),
    "Mostrando 1–18 de 1,500 salones",
  );
  assert.strictEqual(
    textoDeRango({ desde: 1, hasta: 10, totalRegistros: 48 }, "solicitud", "solicitudes"),
    "Mostrando 1–10 de 48 solicitudes",
  );
});

test("textoDeRango usa el singular con uno solo y avisa si no hay nada", () => {
  assert.strictEqual(textoDeRango({ desde: 1, hasta: 1, totalRegistros: 1 }, "salón", "salones"), "Mostrando 1–1 de 1 salón");
  assert.strictEqual(textoDeRango({ desde: 0, hasta: 0, totalRegistros: 0 }, "salón", "salones"), "Sin salones");
});

// ---------- "Cargar más" dentro de la página ----------

test("cargar más suma 6 salones cada vez, sin pasarse del total", () => {
  const salones = lista(18);
  // Sin cargas extra se ven los 18 que trajo la página.
  assert.strictEqual(visiblesConCargarMas(salones, 0).visibles.length, 18);
  assert.strictEqual(visiblesConCargarMas(salones, 0).hayMasEnLaPagina, false);

  // Si la página trae más de 18 (por ejemplo al acumular), se van mostrando de 6 en 6.
  const muchos = lista(40);
  assert.strictEqual(visiblesConCargarMas(muchos, 0).visibles.length, 18);
  assert.strictEqual(visiblesConCargarMas(muchos, 1).visibles.length, 24);
  assert.strictEqual(visiblesConCargarMas(muchos, 2).visibles.length, 30);
  assert.strictEqual(visiblesConCargarMas(muchos, 4).visibles.length, 40); // no se pasa del total
  assert.strictEqual(visiblesConCargarMas(muchos, 4).hayMasEnLaPagina, false);
});

test("cargar más aguanta valores raros", () => {
  assert.strictEqual(visiblesConCargarMas([], 3).visibles.length, 0);
  assert.strictEqual(visiblesConCargarMas(null, 1).visibles.length, 0);
  assert.strictEqual(visiblesConCargarMas(lista(30), -5).visibles.length, 18);
});
