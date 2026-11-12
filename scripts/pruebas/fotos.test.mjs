// HU-07 (fotos): subida real de imágenes · validación del cliente y armado del FormData (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  MAX_FOTOS,
  TAMANO_MAXIMO,
  TIPOS_ACEPTADOS,
  armarFormularioFoto,
  cuposDisponibles,
  detectarTipo,
  mensajeDeErrorFoto,
  repartirSeleccion,
  validarArchivo,
} from "../../services/fotos.logica.js";

const JPG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d];
const WEBP = [...Buffer.from("RIFF"), 0x24, 0, 0, 0, ...Buffer.from("WEBP")];
const bytes = (texto) => [...Buffer.from(texto)];

test("tipo real por magic bytes: JPG, PNG y WEBP", () => {
  assert.strictEqual(detectarTipo(JPG), "jpg");
  assert.strictEqual(detectarTipo(PNG), "png");
  assert.strictEqual(detectarTipo(WEBP), "webp");
});

test("tipo real: un texto renombrado a .jpg, GIF, PDF o RIFF de audio no son imagen", () => {
  assert.strictEqual(detectarTipo(bytes("no soy imagen")), null);
  assert.strictEqual(detectarTipo(bytes("GIF89a......")), null);
  assert.strictEqual(detectarTipo(bytes("%PDF-1.7....")), null);
  assert.strictEqual(detectarTipo(bytes("RIFF....WAVE")), null);
  assert.strictEqual(detectarTipo([]), null);
  assert.strictEqual(detectarTipo(undefined), null);
});

test("tamaño: hasta 5 MB exactos se acepta; un byte más o vacío no", () => {
  assert.strictEqual(validarArchivo({ tamano: TAMANO_MAXIMO, inicio: JPG }), null);
  assert.strictEqual(validarArchivo({ tamano: TAMANO_MAXIMO + 1, inicio: JPG }), "La imagen pesa más de 5 MB.");
  assert.strictEqual(validarArchivo({ tamano: 0, inicio: JPG }), "El archivo está vacío.");
});

test("validarArchivo revisa el tipo real aunque el tamaño esté bien", () => {
  assert.strictEqual(validarArchivo({ tamano: 2000, inicio: bytes("texto") }), "Solo se aceptan imágenes JPG, PNG o WEBP.");
  assert.strictEqual(validarArchivo({ tamano: 2000, inicio: PNG }), null);
});

test("límite de 8 contando las que ya tiene el salón y las que están por subirse", () => {
  assert.strictEqual(MAX_FOTOS, 8);
  assert.strictEqual(cuposDisponibles(0), 8);
  assert.strictEqual(cuposDisponibles(5), 3);
  assert.strictEqual(cuposDisponibles(5, 2), 1);
  assert.strictEqual(cuposDisponibles(8), 0);
  assert.strictEqual(cuposDisponibles(10), 0);
});

test("repartirSeleccion: entran las primeras que caben y se cuentan las sobrantes", () => {
  assert.deepStrictEqual(repartirSeleccion(["a", "b", "c", "d"], 3), { aceptados: ["a", "b", "c"], sobrantes: 1 });
  assert.deepStrictEqual(repartirSeleccion(["a"], 3), { aceptados: ["a"], sobrantes: 0 });
  assert.deepStrictEqual(repartirSeleccion(["a", "b"], 0), { aceptados: [], sobrantes: 2 });
});

test("FormData con los campos exactos del contrato: salonId, adminId y archivo", async () => {
  const archivo = new File([Uint8Array.from(JPG)], "salon.jpg", { type: "image/jpeg" });
  const datos = armarFormularioFoto({ salonId: 12, adminId: 3, archivo });
  assert.deepStrictEqual([...datos.keys()], ["salonId", "adminId", "archivo"]);
  assert.strictEqual(datos.get("salonId"), "12");
  assert.strictEqual(datos.get("adminId"), "3");
  const enviado = datos.get("archivo");
  assert.strictEqual(enviado.name, "salon.jpg");
  assert.deepStrictEqual([...new Uint8Array(await enviado.arrayBuffer())], JPG);
});

test("FormData con un Blob sin nombre usa 'foto' como nombre del archivo", () => {
  const datos = armarFormularioFoto({ salonId: 1, adminId: 2, archivo: new Blob([Uint8Array.from(PNG)]) });
  assert.strictEqual(datos.get("archivo").name, "foto");
});

test("el selector solo ofrece JPG, PNG y WEBP", () => {
  assert.strictEqual(TIPOS_ACEPTADOS, "image/jpeg,image/png,image/webp");
});

test("mensajes claros para cada código de la API y genérico para lo demás", () => {
  const de = (codigo) => mensajeDeErrorFoto({ tipo: "http", codigo });
  assert.match(de(2001), /salón ya no existe/);
  assert.match(de(2002), /dueño/);
  assert.match(de(2005), /Selecciona una imagen/);
  assert.match(de(2006), /JPG, PNG o WEBP/);
  assert.match(de(2007), /5 MB/);
  assert.match(de(2008), /8 fotos/);
  assert.match(de(2009), /ya no existe/);
  assert.match(de(5000), /No se pudo guardar la foto/);
  assert.strictEqual(de(1234), "Ocurrió un error con la foto, intenta de nuevo.");
  assert.strictEqual(mensajeDeErrorFoto(undefined), "Ocurrió un error con la foto, intenta de nuevo.");
  assert.match(mensajeDeErrorFoto({ tipo: "red" }), /conectar con el servidor/);
});

import { tamanoMosaico } from "../../services/fotos.logica.js";

test("mosaicos de escritorio: 4 por fila de 165 px en la columna de la maqueta (696 px), mínimo 2", () => {
  assert.strictEqual(tamanoMosaico(696), 165);                 // 4 × 165 + 3 × 12 = 696
  assert.strictEqual(tamanoMosaico(520), 165);                 // caben 3
  assert.strictEqual(tamanoMosaico(330), 159);                 // 2 por fila, más chicos
  assert.strictEqual(tamanoMosaico(0), 165);                   // antes de medir
  assert.ok(tamanoMosaico(250) * 2 + 12 <= 250);               // nunca se sale de la columna
});
