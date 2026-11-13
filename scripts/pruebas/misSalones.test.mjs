// Mejora de HU-07/HU-08 · "Mis salones": fichas, confirmaciones, errores del back y sin conexión (node --test).
import test from "node:test";
import assert from "node:assert";
import {
  CODIGOS_SALON,
  confirmacionCambiarEstado,
  confirmacionEliminarFoto,
  confirmacionEliminarPaquete,
  confirmacionEliminarSalon,
  confirmacionGuardar,
  confirmacionSalirSinGuardar,
  esConflictoDeSolicitudes,
  esPublicado,
  estadoDeAccion,
  etiquetaEstado,
  fichaDeSalon,
  fichasDeSalones,
  hayCambiosSinGuardar,
  mensajeDeErrorSalon,
  paginaDeSalones,
  pideConfirmacion,
} from "../../screens/MisSalones/misSalones.logica.js";
import {
  CAPACIDAD_MAXIMA,
  LARGO_MAXIMO_DESCRIPCION,
  LARGO_MAXIMO_NOMBRE,
  motivoNoPublicable,
  puedePublicar,
  puedeQuitarPaquete,
  validarDatosSalon,
  validarGuardado,
} from "../../screens/MisSalones/editarSalon.validaciones.js";
import { LARGO_MAXIMO_ZONA } from "../../services/ubicacion.logica.js";

const SALON = {
  id: 7,
  nombre: "Jardín Villa Esmeralda",
  zona: "Centro, Tula de Allende, Hidalgo, CP 42800",
  capacidad: 200,
  estado: "publicado",
  totalPaquetes: 2,
  totalFotos: 3,
  fotoPrincipal: "https://ejemplo.mx/foto.jpg",
};

// ---------- Fichas de la lista ----------

test("fichaDeSalon arma lo que pinta la tarjeta", () => {
  const f = fichaDeSalon(SALON);
  assert.strictEqual(f.id, 7);
  assert.strictEqual(f.nombre, "Jardín Villa Esmeralda");
  assert.strictEqual(f.publicado, true);
  assert.strictEqual(f.etiqueta, "Publicado");
  assert.strictEqual(f.fotoPrincipal, "https://ejemplo.mx/foto.jpg");
  assert.strictEqual(f.textoFotos, "3 fotos");
  assert.strictEqual(f.textoPaquetes, "2 paquetes");
  assert.strictEqual(f.resumen, "200 personas · 2 paquetes · 3 fotos");
});

test("fichaDeSalon marca el borrador", () => {
  const f = fichaDeSalon({ ...SALON, estado: "no_publicado" });
  assert.strictEqual(f.publicado, false);
  assert.strictEqual(f.etiqueta, "Borrador");
});

test("fichaDeSalon usa singular con uno solo", () => {
  const f = fichaDeSalon({ ...SALON, totalPaquetes: 1, totalFotos: 1 });
  assert.strictEqual(f.textoFotos, "1 foto");
  assert.strictEqual(f.textoPaquetes, "1 paquete");
});

// Mientras el back nuevo no esté desplegado, listar no manda fotoPrincipal ni totalFotos.
test("fichaDeSalon aguanta un salón sin fotoPrincipal ni totalFotos", () => {
  const f = fichaDeSalon({ id: 1, nombre: "Salón Nuevo", zona: "Tula", capacidad: 50, estado: "no_publicado" });
  assert.strictEqual(f.fotoPrincipal, null); // la tarjeta pinta el marcador de posición
  assert.strictEqual(f.totalFotos, 0);
  assert.strictEqual(f.textoFotos, "0 fotos");
  assert.strictEqual(f.textoPaquetes, "0 paquetes");
});

test("fichaDeSalon rellena los datos que falten sin romperse", () => {
  const f = fichaDeSalon({ id: 2 });
  assert.strictEqual(f.nombre, "Salón sin nombre");
  assert.strictEqual(f.zona, "Sin zona");
  assert.strictEqual(f.capacidad, 0);
});

test("fichasDeSalones acepta una lista vacía o inválida", () => {
  assert.deepStrictEqual(fichasDeSalones([]), []);
  assert.deepStrictEqual(fichasDeSalones(null), []);
  assert.strictEqual(fichasDeSalones([SALON, SALON]).length, 2);
});

test("esPublicado y etiquetaEstado distinguen publicado de borrador", () => {
  assert.strictEqual(esPublicado(SALON), true);
  assert.strictEqual(esPublicado({ estado: "no_publicado" }), false);
  assert.strictEqual(esPublicado(null), false);
  assert.strictEqual(etiquetaEstado({ estado: "no_publicado" }), "Borrador");
});

test("paginaDeSalones muestra por partes y avisa si hay más", () => {
  const lista = Array.from({ length: 20 }, (_, i) => ({ id: i }));
  const p1 = paginaDeSalones(lista, 1, 9);
  assert.strictEqual(p1.visibles.length, 9);
  assert.strictEqual(p1.hayMas, true);
  const p3 = paginaDeSalones(lista, 3, 9);
  assert.strictEqual(p3.visibles.length, 20);
  assert.strictEqual(p3.hayMas, false);
});

// ---------- Confirmaciones ----------

test("guardar pide confirmación y dice de qué salón", () => {
  const c = confirmacionGuardar("Jardín Villa Esmeralda");
  assert.match(c.mensaje, /Jardín Villa Esmeralda/);
  assert.strictEqual(c.textoConfirmar, "Guardar cambios");
  assert.strictEqual(c.destructiva, false);
});

test("eliminar salón lleva el nombre y avisa que no se puede deshacer", () => {
  const c = confirmacionEliminarSalon("Jardín Villa Esmeralda");
  assert.match(c.mensaje, /Jardín Villa Esmeralda/);
  assert.match(c.mensaje, /no se puede deshacer/i);
  assert.strictEqual(c.textoConfirmar, "Eliminar salón");
  assert.strictEqual(c.destructiva, true);
});

test("eliminar paquete y foto son destructivas y dicen qué hacen", () => {
  const paquete = confirmacionEliminarPaquete("Paquete Oro");
  assert.match(paquete.mensaje, /Paquete Oro/);
  assert.strictEqual(paquete.textoConfirmar, "Eliminar paquete");
  assert.strictEqual(paquete.destructiva, true);

  const foto = confirmacionEliminarFoto();
  assert.strictEqual(foto.textoConfirmar, "Eliminar foto");
  assert.strictEqual(foto.destructiva, true);
});

test("cambiar de publicado a borrador avisa que deja de verse", () => {
  const c = confirmacionCambiarEstado({ nombre: "Villa", estado: "publicado" });
  assert.strictEqual(c.clave, "aBorrador");
  assert.match(c.mensaje, /dejará de aparecer/i);
  assert.strictEqual(c.textoConfirmar, "Pasar a borrador");
});

test("publicar avisa que los clientes podrán solicitar", () => {
  const c = confirmacionCambiarEstado({ nombre: "Villa", estado: "no_publicado" });
  assert.strictEqual(c.clave, "aPublicado");
  assert.match(c.mensaje, /aparecerá en las búsquedas/i);
  assert.strictEqual(c.textoConfirmar, "Publicar salón");
});

test("salir sin guardar avisa que se pierden los cambios", () => {
  const c = confirmacionSalirSinGuardar();
  assert.match(c.mensaje, /se perderán/i);
  assert.strictEqual(c.destructiva, true);
});

test("todos los diálogos traen título, mensaje y los dos botones", () => {
  const todos = [
    confirmacionGuardar("X"),
    confirmacionEliminarSalon("X"),
    confirmacionEliminarPaquete("X"),
    confirmacionEliminarFoto(),
    confirmacionCambiarEstado({ nombre: "X", estado: "publicado" }),
    confirmacionSalirSinGuardar(),
  ];
  for (const c of todos) {
    assert.ok(c.titulo, "falta título");
    assert.ok(c.mensaje, "falta mensaje");
    // El botón dice lo que hace, nunca solo "Aceptar".
    assert.ok(c.textoConfirmar && c.textoConfirmar !== "Aceptar", `botón poco claro: ${c.textoConfirmar}`);
    assert.ok(c.textoCancelar, "falta botón de cancelar");
  }
});

test("pideConfirmacion: todo lo que escribe pide confirmación", () => {
  for (const accion of ["guardar", "eliminarSalon", "eliminarPaquete", "eliminarFoto", "cambiarEstado"]) {
    assert.strictEqual(pideConfirmacion(accion), true, accion);
  }
});

test("pideConfirmacion: salir solo pregunta si hay cambios sin guardar", () => {
  assert.strictEqual(pideConfirmacion("salir", { hayCambios: true }), true);
  assert.strictEqual(pideConfirmacion("salir", { hayCambios: false }), false);
  assert.strictEqual(pideConfirmacion("cancelar", { hayCambios: true }), true);
  assert.strictEqual(pideConfirmacion("cancelar", { hayCambios: false }), false);
});

test("pideConfirmacion: ver la lista o editar no pregunta nada", () => {
  assert.strictEqual(pideConfirmacion("ver"), false);
  assert.strictEqual(pideConfirmacion("editar"), false);
});

// ---------- Cambios sin guardar ----------

const ORIGINAL = {
  nombre: "Villa",
  zona: "Centro, Tula",
  capacidad: "200",
  descripcion: "Con jardín",
  estado: "publicado",
  paquetes: [{ id: 1, nombre: "Oro", descripcion: "8 hrs", precio: 8500 }],
};

test("hayCambiosSinGuardar: sin tocar nada, no hay cambios", () => {
  assert.strictEqual(hayCambiosSinGuardar(ORIGINAL, { ...ORIGINAL }), false);
});

test("hayCambiosSinGuardar detecta cada campo", () => {
  for (const campo of ["nombre", "zona", "capacidad", "descripcion", "estado"]) {
    assert.strictEqual(hayCambiosSinGuardar(ORIGINAL, { ...ORIGINAL, [campo]: "otro" }), true, campo);
  }
});

test("hayCambiosSinGuardar detecta paquetes agregados, quitados o editados", () => {
  const agregado = { ...ORIGINAL, paquetes: [...ORIGINAL.paquetes, { nombre: "Plata", precio: 7000 }] };
  const quitado = { ...ORIGINAL, paquetes: [] };
  const editado = { ...ORIGINAL, paquetes: [{ id: 1, nombre: "Oro", descripcion: "8 hrs", precio: 9000 }] };
  assert.strictEqual(hayCambiosSinGuardar(ORIGINAL, agregado), true);
  assert.strictEqual(hayCambiosSinGuardar(ORIGINAL, quitado), true);
  assert.strictEqual(hayCambiosSinGuardar(ORIGINAL, editado), true);
});

test("hayCambiosSinGuardar ignora los espacios de más", () => {
  assert.strictEqual(hayCambiosSinGuardar(ORIGINAL, { ...ORIGINAL, nombre: "  Villa  " }), false);
});

// ---------- Errores de la API ----------

test("mensajeDeErrorSalon muestra el mensaje de la API tal cual", () => {
  // Regla del proyecto: si la API manda mensaje en español, ese se muestra.
  const error = { tipo: "http", codigo: 2010, mensaje: "El salón tiene solicitudes pendientes." };
  assert.strictEqual(mensajeDeErrorSalon(error), "El salón tiene solicitudes pendientes.");
});

test("mensajeDeErrorSalon tiene respaldo para cada código", () => {
  const texto = (codigo) => mensajeDeErrorSalon({ tipo: "http", codigo });
  assert.match(texto(CODIGOS_SALON.noExiste), /ya no existe/i);
  assert.match(texto(CODIGOS_SALON.noEsDueno), /no es de tu cuenta/i);
  assert.match(texto(CODIGOS_SALON.sinPaquetes), /al menos un paquete/i);
  assert.match(texto(CODIGOS_SALON.estadoInvalido), /estado/i);
  assert.match(texto(CODIGOS_SALON.conSolicitudes), /solicitudes pendientes o confirmadas/i);
  assert.match(texto(CODIGOS_SALON.errorInterno), /servidor/i);
});

test("mensajeDeErrorSalon distingue sin conexión y falta de configuración", () => {
  assert.match(mensajeDeErrorSalon({ tipo: "red" }), /conexión/i);
  assert.match(mensajeDeErrorSalon({ tipo: "config" }), /EXPO_PUBLIC_API_URL/);
});

test("mensajeDeErrorSalon con un error desconocido no deja al usuario sin aviso", () => {
  assert.match(mensajeDeErrorSalon(null), /error/i);
  assert.match(mensajeDeErrorSalon({ tipo: "http", codigo: 9999 }), /error/i);
});

test("el 2010 se reconoce: el salón NO se eliminó", () => {
  const error = { tipo: "http", codigo: CODIGOS_SALON.conSolicitudes };
  assert.strictEqual(esConflictoDeSolicitudes(error), true);
  assert.strictEqual(esConflictoDeSolicitudes({ codigo: 2001 }), false);
  assert.strictEqual(esConflictoDeSolicitudes(null), false);
});

// ---------- Sin conexión (HU-22) ----------

test("sin conexión se deshabilita todo lo que escribe, con su motivo", () => {
  for (const accion of ["crear", "editar", "guardar", "eliminarSalon", "eliminarPaquete", "subirFoto", "eliminarFoto", "cambiarEstado"]) {
    const e = estadoDeAccion(accion, false);
    assert.strictEqual(e.habilitada, false, accion);
    assert.match(e.motivo, /conexión/i, accion);
  }
});

test("sin conexión la lista sí se puede ver (desde la caché)", () => {
  assert.deepStrictEqual(estadoDeAccion("ver", false), { habilitada: true, motivo: null });
});

test("con conexión todo queda habilitado", () => {
  for (const accion of ["crear", "guardar", "eliminarSalon", "ver"]) {
    assert.deepStrictEqual(estadoDeAccion(accion, true), { habilitada: true, motivo: null }, accion);
  }
});

// ---------- Validaciones de editar ----------

const DATOS_OK = { nombre: "Villa", zona: "Centro, Tula", capacidad: "200", descripcion: "Con jardín" };

test("validarDatosSalon acepta los datos completos", () => {
  assert.deepStrictEqual(validarDatosSalon(DATOS_OK), {});
});

test("validarDatosSalon hereda las reglas de publicar", () => {
  const e = validarDatosSalon({ nombre: " ", zona: " ", capacidad: " ", descripcion: "" });
  assert.strictEqual(e.nombre, "Escribe el nombre del salón.");
  assert.strictEqual(e.zona, "Escribe la zona o dirección del salón.");
  assert.strictEqual(e.capacidad, "Escribe la capacidad del salón.");
});

test("validarDatosSalon respeta los límites de la base de datos", () => {
  const largo = (n) => "a".repeat(n);
  assert.match(validarDatosSalon({ ...DATOS_OK, nombre: largo(LARGO_MAXIMO_NOMBRE + 1) }).nombre, /no puede pasar/);
  assert.match(validarDatosSalon({ ...DATOS_OK, zona: largo(LARGO_MAXIMO_ZONA + 1) }).zona, /no puede pasar/);
  assert.match(validarDatosSalon({ ...DATOS_OK, descripcion: largo(LARGO_MAXIMO_DESCRIPCION + 1) }).descripcion, /no puede pasar/);
  assert.match(validarDatosSalon({ ...DATOS_OK, capacidad: String(CAPACIDAD_MAXIMA + 1) }).capacidad, /no puede pasar/);
});

test("validarDatosSalon acepta justo el límite", () => {
  const largo = (n) => "a".repeat(n);
  assert.strictEqual(validarDatosSalon({ ...DATOS_OK, nombre: largo(LARGO_MAXIMO_NOMBRE) }).nombre, undefined);
  assert.strictEqual(validarDatosSalon({ ...DATOS_OK, zona: largo(LARGO_MAXIMO_ZONA) }).zona, undefined);
});

test("validarGuardado exige un paquete solo si queda publicado", () => {
  const publicado = validarGuardado({ ...DATOS_OK, estado: "publicado", paquetes: [] });
  assert.strictEqual(publicado.paquetes, "Agrega al menos un paquete para publicar tu salón.");
  // En borrador sí se puede guardar sin paquetes.
  assert.deepStrictEqual(validarGuardado({ ...DATOS_OK, estado: "no_publicado", paquetes: [] }), {});
  assert.deepStrictEqual(validarGuardado({ ...DATOS_OK, estado: "publicado", paquetes: [{ nombre: "Oro" }] }), {});
});

test("puedePublicar y su motivo", () => {
  assert.strictEqual(puedePublicar({ paquetes: [{ nombre: "Oro" }] }), true);
  assert.strictEqual(puedePublicar({ paquetes: [] }), false);
  assert.match(motivoNoPublicable({ paquetes: [] }), /al menos un paquete/i);
  assert.strictEqual(motivoNoPublicable({ paquetes: [{ nombre: "Oro" }] }), null);
});

test("no se quita el último paquete de un salón publicado (3002)", () => {
  const r = puedeQuitarPaquete({ estado: "publicado", paquetes: [{ id: 1 }] });
  assert.strictEqual(r.permitido, false);
  assert.match(r.motivo, /al menos un paquete/i);
});

test("sí se quita un paquete si quedan más, o si el salón es borrador", () => {
  assert.strictEqual(puedeQuitarPaquete({ estado: "publicado", paquetes: [{ id: 1 }, { id: 2 }] }).permitido, true);
  assert.strictEqual(puedeQuitarPaquete({ estado: "no_publicado", paquetes: [{ id: 1 }] }).permitido, true);
});
