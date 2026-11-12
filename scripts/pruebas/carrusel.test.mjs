// HU-07 (fotos): carrusel de la tarjeta de búsqueda y galería del detalle (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  MAX_FOTOS_CARRUSEL,
  conPrecarga,
  fotosDeTarjeta,
  moverIndice,
  pasoPorDeslizamiento,
  resumenMiniaturas,
  tieneCarrusel,
} from "../../components/carrusel.logica.js";

const url = (n) => `https://fotos.test/${n}.jpg`;

test("fotosDeTarjeta usa fotosPreview, hasta 5 y sin vacíos", () => {
  const salon = { fotoPrincipal: url(1), fotosPreview: [url(1), "", url(2), url(3), url(4), url(5), url(6)] };
  assert.deepStrictEqual(fotosDeTarjeta(salon), [url(1), url(2), url(3), url(4), url(5)]);
  assert.strictEqual(fotosDeTarjeta(salon).length, MAX_FOTOS_CARRUSEL);
});

test("fotosDeTarjeta regresa a fotoPrincipal si la API aún no manda fotosPreview", () => {
  assert.deepStrictEqual(fotosDeTarjeta({ fotoPrincipal: url(1) }), [url(1)]);
  assert.deepStrictEqual(fotosDeTarjeta({ fotoPrincipal: url(1), fotosPreview: null }), [url(1)]);
});

test("fotosDeTarjeta sin fotos regresa arreglo vacío", () => {
  assert.deepStrictEqual(fotosDeTarjeta({ fotoPrincipal: null, fotosPreview: [] }), []);
  assert.deepStrictEqual(fotosDeTarjeta({}), []);
  assert.deepStrictEqual(fotosDeTarjeta(null), []);
});

test("tieneCarrusel solo con 2 fotos o más", () => {
  assert.strictEqual(tieneCarrusel([]), false);
  assert.strictEqual(tieneCarrusel([url(1)]), false);
  assert.strictEqual(tieneCarrusel([url(1), url(2)]), true);
});

test("moverIndice da la vuelta en los dos sentidos", () => {
  assert.strictEqual(moverIndice(0, 5, 1), 1);
  assert.strictEqual(moverIndice(4, 5, 1), 0);
  assert.strictEqual(moverIndice(0, 5, -1), 4);
  assert.strictEqual(moverIndice(2, 3, -1), 1);
});

test("moverIndice con 0 o 1 foto se queda en 0", () => {
  assert.strictEqual(moverIndice(0, 0, 1), 0);
  assert.strictEqual(moverIndice(0, 1, -1), 0);
});

test("conPrecarga carga la foto visible y la siguiente, sin repetir", () => {
  assert.deepStrictEqual(conPrecarga([0], 0, 5), [0, 1]);
  assert.deepStrictEqual(conPrecarga([0, 1], 1, 5), [0, 1, 2]);
  assert.deepStrictEqual(conPrecarga([0, 1, 2, 3], 4, 5), [0, 1, 2, 3, 4]);
  assert.deepStrictEqual(conPrecarga([0], 0, 1), [0]);
  assert.deepStrictEqual(conPrecarga([], 0, 0), []);
});

test("resumenMiniaturas: hasta 4 y '+N' con las que sobran", () => {
  assert.deepStrictEqual(resumenMiniaturas(0), { visibles: 0, extra: 0 });
  assert.deepStrictEqual(resumenMiniaturas(3), { visibles: 3, extra: 0 });
  assert.deepStrictEqual(resumenMiniaturas(4), { visibles: 4, extra: 0 });
  assert.deepStrictEqual(resumenMiniaturas(8), { visibles: 4, extra: 4 });
});

test("pasoPorDeslizamiento respeta el umbral", () => {
  assert.strictEqual(pasoPorDeslizamiento(-60), 1);
  assert.strictEqual(pasoPorDeslizamiento(60), -1);
  assert.strictEqual(pasoPorDeslizamiento(-39), 0);
  assert.strictEqual(pasoPorDeslizamiento(0), 0);
});
