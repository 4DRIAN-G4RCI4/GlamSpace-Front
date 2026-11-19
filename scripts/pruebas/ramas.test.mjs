// Cobertura · Casos límite de la lógica: valores vacíos, empates al ordenar y fallas del almacenamiento.
import { test } from "node:test";
import assert from "node:assert/strict";
import { confirmacionCambiarEstado, hayCambiosSinGuardar } from "../../screens/MisSalones/misSalones.logica.js";
import { listaDeMisSolicitudes } from "../../screens/MisSolicitudes/misSolicitudes.logica.js";
import { historialReciente, listaDeSolicitudes } from "../../screens/PanelAdministrador/panelAdministrador.logica.js";
import { soloDigitos, validarNombre, resumenErrores } from "../../screens/SolicitudReservacion/solicitudReservacion.validaciones.js";
import { FILTROS } from "../../screens/BusquedaSalones/filtros.js";
import { mensajeDeErrorFoto } from "../../services/fotos.logica.js";
import { totalDePaginas, paginaValida, numerosDePagina } from "../../services/paginacion.logica.js";
import { recortarZona, sugerenciasDesdeDireccion } from "../../services/ubicacion.logica.js";
import { crearCacheLocal } from "../../services/cacheLocal.nucleo.js";
import { armarSolicitudParaApi, mensajeDeErrorSolicitud } from "../../services/solicitudes.logica.js";

test("Mis salones: sin salón, sin datos o con paquetes incompletos", () => {
  assert.match(confirmacionCambiarEstado(null).mensaje, /"este salón"/);
  assert.equal(hayCambiosSinGuardar(null, {}), false);
  assert.equal(hayCambiosSinGuardar({}, null), false);
  assert.equal(hayCambiosSinGuardar({}, {}), false);
  assert.equal(hayCambiosSinGuardar({ paquetes: [{}] }, { paquetes: [{ precio: "x" }] }), false);
  assert.equal(hayCambiosSinGuardar({ paquetes: [{ id: 1, nombre: "A", precio: 1 }] }, { paquetes: [{ id: 1, nombre: "B", precio: 1 }] }), true);
});

test("Mis solicitudes y panel: entrada que no es lista y empates de fecha se ordenan por id", () => {
  assert.deepEqual(listaDeMisSolicitudes(null), []);
  const mismas = [
    { id: 1, estado: "pendiente", fechaEvento: "2026-12-01", fechaCreacion: "2026-11-01" },
    { id: 2, estado: "confirmada", fechaEvento: "2026-12-01", fechaCreacion: "2026-11-01" },
  ];
  assert.deepEqual(listaDeMisSolicitudes(mismas).map((s) => s.id), [2, 1]);
  assert.deepEqual(listaDeMisSolicitudes(mismas, "todas", "proximas").map((s) => s.id), [1, 2]);
  assert.deepEqual(listaDeSolicitudes(mismas).map((s) => s.id), [1, 2]);
  assert.deepEqual(listaDeSolicitudes(mismas, "todas", "recientes").map((s) => s.id), [2, 1]);
  const atendidas = mismas.map((s) => ({ ...s, estado: "confirmada" }));
  assert.deepEqual(historialReciente(atendidas).map((s) => s.id), [2, 1]);
  assert.equal(historialReciente(atendidas, 0).length, 2);
});

test("Validaciones de la reserva con valores vacíos y campos sin nombre conocido", () => {
  assert.equal(soloDigitos(null), "");
  assert.match(validarNombre(undefined), /nombre completo/);
  assert.equal(resumenErrores({ otroCampo: "x" }), "Falta completar: otroCampo.");
});

test("Filtros de la búsqueda: textos de cada chip activo", () => {
  const [zona, capacidad, precio] = FILTROS;
  assert.equal(zona.activo("Tula"), "Tula");
  assert.equal(capacidad.activo(100), "100+ personas");
  assert.match(precio.activo(5000), /^Hasta \$5,000/);
  assert.equal(precio.sugerencias.length, 4);
});

test("Mensajes de error con error nulo o sin datos", () => {
  assert.match(mensajeDeErrorFoto(null), /Ocurrió un error con la foto/);
  assert.match(mensajeDeErrorFoto({ tipo: "config" }), /EXPO_PUBLIC_API_URL/);
  assert.match(mensajeDeErrorSolicitud({ tipo: "config" }).texto, /EXPO_PUBLIC_API_URL/);
  assert.deepEqual(mensajeDeErrorSolicitud({ tipo: "http", codigo: 1001 }), { texto: "Revisa los datos de tu solicitud.", accion: null });
});

test("Armar la solicitud sin datos opcionales", () => {
  const cuerpo = armarSolicitudParaApi(5, { salonId: 7, fecha: "2026-12-05", invitados: "10" });
  assert.equal(cuerpo.tipoEvento, "");
  assert.equal(cuerpo.telefonoContacto, "");
  assert.equal(cuerpo.comentarios, null);
  assert.equal(cuerpo.paqueteId, null);
});

test("Paginación con valores que no son número", () => {
  assert.equal(totalDePaginas(10, "x"), 10);
  assert.equal(totalDePaginas("x", 5), 1);
  assert.equal(paginaValida("x", "y"), 1);
  assert.deepEqual(numerosDePagina(1, "x"), [1]);
});

test("Ubicación: zona larga sin espacios y resultados incompletos de Nominatim", () => {
  assert.equal(recortarZona("a".repeat(250)).length, 200);
  const r = sugerenciasDesdeDireccion([null, { address: { city: "Tula", state: "Hidalgo" } }]);
  assert.equal(r.length, 1);
  assert.equal(r[0].id, r[0].zona);
  assert.equal(r[0].etiqueta, r[0].zona);
});

test("Caché local: borrar todo sin llaves propias, con error del almacenamiento y entradas dañadas", async () => {
  const datos = new Map([["otra:llave", "1"], ["glamspaces_cache:1:x", "null"]]);
  let fallar = false;
  const almacen = {
    async getItem(k) { return datos.get(k) ?? null; },
    async setItem(k, v) { datos.set(k, v); },
    async removeItem(k) { if (fallar) throw new Error("x"); datos.delete(k); },
    async getAllKeys() { if (fallar) throw new Error("x"); return [...datos.keys()]; },
    async multiRemove(ks) { ks.forEach((k) => datos.delete(k)); },
  };
  const cache = crearCacheLocal(almacen);
  assert.equal(await cache.leer("glamspaces_cache:1:x"), null); // "null" guardado → se descarta
  assert.equal(datos.has("glamspaces_cache:1:x"), false);
  assert.equal(await cache.borrarTodo(), true); // no hay llaves propias: no borra nada más
  assert.equal(datos.get("otra:llave"), "1");
  fallar = true;
  assert.equal(await cache.borrarTodo(), false);
  assert.equal(await cache.borrar("glamspaces_cache:1:y"), false);
});
