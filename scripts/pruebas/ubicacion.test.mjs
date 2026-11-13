// Mejora de HU-07/HU-08 · Campo "Zona o dirección": código postal, dirección y armado de la zona (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  ATRIBUCION_OSM,
  ESPERA_ENTRE_PETICIONES_MS,
  ESPERA_ESCRITURA_MS,
  LARGO_MAXIMO_ZONA,
  coloniasDesdeCodigoPostal,
  componerZona,
  debeBuscarDireccion,
  esCodigoPostal,
  mensajeDeFalloUbicacion,
  planDeBusqueda,
  recortarZona,
  sugerenciasDesdeDireccion,
} from "../../services/ubicacion.logica.js";

// ---------- Código postal ----------

test("esCodigoPostal: exactamente 5 dígitos", () => {
  assert.strictEqual(esCodigoPostal("42800"), true);
  assert.strictEqual(esCodigoPostal("  42800  "), true);
  for (const malo of ["4280", "428000", "42a00", "", "Tula", null, undefined]) {
    assert.strictEqual(esCodigoPostal(malo), false, String(malo));
  }
});

test("debeBuscarDireccion: a partir de 4 letras", () => {
  assert.strictEqual(debeBuscarDireccion("Tula"), true);
  assert.strictEqual(debeBuscarDireccion("Tul"), false);
  assert.strictEqual(debeBuscarDireccion("   "), false);
  assert.strictEqual(debeBuscarDireccion(null), false);
});

test("planDeBusqueda decide a qué servicio preguntar", () => {
  assert.deepStrictEqual(planDeBusqueda("42800"), { tipo: "cp", consulta: "42800" });
  assert.deepStrictEqual(planDeBusqueda("Tula de Allende"), { tipo: "direccion", consulta: "Tula de Allende" });
  // Muy corto: no se consulta nada y el campo sigue escribiéndose a mano.
  assert.deepStrictEqual(planDeBusqueda("Tu"), { tipo: "ninguno", consulta: "" });
  assert.deepStrictEqual(planDeBusqueda(""), { tipo: "ninguno", consulta: "" });
});

test("los tiempos respetan el límite de Nominatim", () => {
  assert.strictEqual(ESPERA_ESCRITURA_MS, 600);
  assert.ok(ESPERA_ENTRE_PETICIONES_MS >= 1000, "máximo 1 petición por segundo");
});

// ---------- Armado de la zona ----------

test("componerZona arma Colonia, Municipio, Estado, CP", () => {
  assert.strictEqual(
    componerZona({ colonia: "Centro", municipio: "Tula de Allende", estado: "Hidalgo", cp: "42800" }),
    "Centro, Tula de Allende, Hidalgo, CP 42800",
  );
});

test("componerZona omite lo que falte, sin comas sueltas", () => {
  assert.strictEqual(componerZona({ colonia: "Centro", estado: "Hidalgo", cp: "42800" }), "Centro, Hidalgo, CP 42800");
  assert.strictEqual(componerZona({ municipio: "Tula", estado: "Hidalgo" }), "Tula, Hidalgo");
  assert.strictEqual(componerZona({ colonia: "Centro" }), "Centro");
  assert.strictEqual(componerZona({}), "");
  assert.strictEqual(componerZona(), "");
});

test("componerZona ignora espacios de más", () => {
  assert.strictEqual(componerZona({ colonia: "  Centro  ", estado: " Hidalgo ", cp: " 42800 " }), "Centro, Hidalgo, CP 42800");
});

// La columna Salones.Zona del back es NVARCHAR(200).
test("la zona nunca pasa del largo que acepta el back", () => {
  const larga = componerZona({
    colonia: "C".repeat(90),
    municipio: "M".repeat(90),
    estado: "E".repeat(90),
    cp: "42800",
  });
  assert.ok(larga.length <= LARGO_MAXIMO_ZONA, `quedó en ${larga.length}`);
});

test("recortarZona quita partes completas antes que cortar palabras", () => {
  const zona = "Fraccionamiento Las Palmas, Tula de Allende, Hidalgo, CP 42800";
  // Cabe completa.
  assert.strictEqual(recortarZona(zona, 200), zona);
  // No cabe: se quita la última parte entera, no se parte una palabra.
  const recortada = recortarZona(zona, 50);
  assert.ok(recortada.length <= 50);
  assert.ok(!recortada.endsWith(","), "no deja una coma colgando");
  assert.strictEqual(recortada, "Fraccionamiento Las Palmas, Tula de Allende");
});

test("recortarZona corta en un espacio si ni la primera parte cabe", () => {
  const r = recortarZona("Fraccionamiento Residencial Las Palmas del Valle", 20);
  assert.ok(r.length <= 20);
  assert.ok(!r.endsWith(" "));
  assert.strictEqual(r, "Fraccionamiento");
});

// ---------- Zippopotam (código postal) ----------

// Respuesta real de https://api.zippopotam.us/mx/42800 (recortada).
const RESPUESTA_CP = {
  "country": "Mexico",
  "country abbreviation": "MX",
  "post code": "42800",
  places: [
    { "place name": "San Andres", state: "Hidalgo", "state abbreviation": "HID" },
    { "place name": "Tula de Allende Centro", state: "Hidalgo", "state abbreviation": "HID" },
    { "place name": "Nantzha", state: "Hidalgo", "state abbreviation": "HID" },
  ],
};

test("coloniasDesdeCodigoPostal saca una opción por colonia", () => {
  const opciones = coloniasDesdeCodigoPostal(RESPUESTA_CP);
  assert.strictEqual(opciones.length, 3);
  assert.strictEqual(opciones[0].colonia, "San Andres");
  assert.strictEqual(opciones[0].estado, "Hidalgo");
  assert.strictEqual(opciones[0].cp, "42800");
  // Zippopotam no da municipio: se deja vacío para que el administrador lo escriba.
  assert.strictEqual(opciones[0].municipio, "");
  assert.strictEqual(opciones[0].zona, "San Andres, Hidalgo, CP 42800");
});

test("coloniasDesdeCodigoPostal no repite colonias", () => {
  const conRepetidas = {
    "post code": "42800",
    places: [
      { "place name": "Centro", state: "Hidalgo" },
      { "place name": "Centro", state: "Hidalgo" },
    ],
  };
  assert.strictEqual(coloniasDesdeCodigoPostal(conRepetidas).length, 1);
});

test("coloniasDesdeCodigoPostal con un CP que no existe regresa lista vacía", () => {
  assert.deepStrictEqual(coloniasDesdeCodigoPostal(null, "00000"), []);
  assert.deepStrictEqual(coloniasDesdeCodigoPostal({}, "00000"), []);
  assert.deepStrictEqual(coloniasDesdeCodigoPostal({ places: [] }), []);
});

test("coloniasDesdeCodigoPostal usa el CP buscado si la respuesta no lo trae", () => {
  const sinCp = { places: [{ "place name": "Centro", state: "Hidalgo" }] };
  assert.strictEqual(coloniasDesdeCodigoPostal(sinCp, "42800")[0].cp, "42800");
});

// ---------- Nominatim (dirección) ----------

// Respuesta real de nominatim.openstreetmap.org (recortada).
const RESPUESTA_DIRECCION = [
  {
    place_id: 123,
    display_name: "Centro, Tula, Tula de Allende, Hidalgo, 42800, México",
    address: { quarter: "Centro", town: "Tula", county: "Tula de Allende", state: "Hidalgo", postcode: "42800" },
  },
  {
    place_id: 456,
    display_name: "Las Palmas, Tula de Allende, Hidalgo, 42830, México",
    address: { suburb: "Las Palmas", county: "Tula de Allende", state: "Hidalgo", postcode: "42830" },
  },
];

test("sugerenciasDesdeDireccion saca colonia, municipio, estado y CP", () => {
  const s = sugerenciasDesdeDireccion(RESPUESTA_DIRECCION);
  assert.strictEqual(s.length, 2);
  assert.strictEqual(s[0].colonia, "Centro");
  assert.strictEqual(s[0].municipio, "Tula de Allende");
  assert.strictEqual(s[0].estado, "Hidalgo");
  assert.strictEqual(s[0].cp, "42800");
  assert.strictEqual(s[0].zona, "Centro, Tula de Allende, Hidalgo, CP 42800");
  // En la lista se ve el nombre completo que manda OSM.
  assert.match(s[0].etiqueta, /Tula de Allende/);
});

test("sugerenciasDesdeDireccion entiende los distintos nombres de colonia de OSM", () => {
  const variantes = [
    { place_id: 1, address: { neighbourhood: "Barrio Alto", county: "Tula", state: "Hidalgo" } },
    { place_id: 2, address: { residential: "Villas", city: "Tepeji", state: "Hidalgo" } },
    { place_id: 3, address: { village: "Nantzha", municipality: "Tula", state: "Hidalgo" } },
  ];
  const s = sugerenciasDesdeDireccion(variantes);
  assert.deepStrictEqual(s.map((x) => x.colonia), ["Barrio Alto", "Villas", "Nantzha"]);
  assert.deepStrictEqual(s.map((x) => x.municipio), ["Tula", "Tepeji", "Tula"]);
});

test("sugerenciasDesdeDireccion no repite la misma zona", () => {
  const repetidas = [
    { place_id: 1, address: { quarter: "Centro", county: "Tula", state: "Hidalgo", postcode: "42800" } },
    { place_id: 2, address: { quarter: "Centro", county: "Tula", state: "Hidalgo", postcode: "42800" } },
  ];
  assert.strictEqual(sugerenciasDesdeDireccion(repetidas).length, 1);
});

test("sugerenciasDesdeDireccion descarta resultados sin datos útiles", () => {
  assert.deepStrictEqual(sugerenciasDesdeDireccion([{ place_id: 1, address: {} }]), []);
  assert.deepStrictEqual(sugerenciasDesdeDireccion([]), []);
  assert.deepStrictEqual(sugerenciasDesdeDireccion(null), []);
});

// Privacidad: solo se guarda la ubicación, nunca datos personales ni coordenadas.
test("la sugerencia solo lleva datos de ubicación", () => {
  const s = sugerenciasDesdeDireccion(RESPUESTA_DIRECCION)[0];
  assert.deepStrictEqual(Object.keys(s).sort(), ["cp", "colonia", "estado", "etiqueta", "id", "municipio", "zona"].sort());
});

// ---------- Fallos ----------

test("si la ubicación falla, el mensaje invita a escribirla a mano", () => {
  assert.match(mensajeDeFalloUbicacion({ tipo: "red" }), /a mano/i);
  assert.match(mensajeDeFalloUbicacion({ tipo: "red" }), /sin conexión/i);
  assert.match(mensajeDeFalloUbicacion(new Error("falló")), /a mano/i);
  assert.match(mensajeDeFalloUbicacion(null), /a mano/i);
});

test("la atribución de OpenStreetMap es la que pide su licencia", () => {
  assert.strictEqual(ATRIBUCION_OSM, "© OpenStreetMap contributors");
});
