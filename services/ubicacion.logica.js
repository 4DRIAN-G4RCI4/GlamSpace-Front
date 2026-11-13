/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Reglas puras del campo "Zona o dirección".
 *
 * La zona se escribe a mano o se completa con dos servicios públicos y sin clave:
 *   - Código postal (5 dígitos) → api.zippopotam.us/mx/{cp}  (da colonia y estado, NO municipio)
 *   - Texto libre              → nominatim.openstreetmap.org (da colonia, municipio, estado y CP)
 *
 * Aquí NO se hace red: solo se interpreta lo que contestan y se arma el texto que se guarda.
 * Las llamadas viven en services/ubicacionApi.js y el estado en useUbicacion.js.
 *
 * La zona se guarda como "Colonia, Municipio, Estado, CP 00000" y la columna Salones.Zona del
 * back es NVARCHAR(200): por eso se recorta a LARGO_MAXIMO_ZONA sin cortar a media palabra, para
 * que la búsqueda por zona de los clientes (HU-09) siga encontrando el salón.
 */

// Igual que Salones.Zona en la base de datos (NVARCHAR(200)).
export const LARGO_MAXIMO_ZONA = 200;

export const ATRIBUCION_OSM = "© OpenStreetMap contributors";

// Nominatim pide no pasar de 1 petición por segundo y la escritura se espera 600 ms.
export const ESPERA_ESCRITURA_MS = 600;
export const ESPERA_ENTRE_PETICIONES_MS = 1000;

// Un código postal mexicano: exactamente 5 dígitos.
const REGEX_CP = /^\d{5}$/;

export function esCodigoPostal(texto) {
  return REGEX_CP.test(String(texto ?? "").trim());
}

// A partir de cuántas letras vale la pena preguntarle a Nominatim.
export const MINIMO_PARA_BUSCAR = 4;

export function debeBuscarDireccion(texto) {
  return String(texto ?? "").trim().length >= MINIMO_PARA_BUSCAR;
}

function limpiar(valor) {
  return String(valor ?? "").trim();
}

/**
 * Arma el texto que se guarda: "Colonia, Municipio, Estado, CP 00000".
 * Las partes que falten simplemente no aparecen (nunca se inventan ni se dejan comas sueltas).
 */
export function componerZona({ colonia, municipio, estado, cp } = {}) {
  const partes = [limpiar(colonia), limpiar(municipio), limpiar(estado)].filter(Boolean);
  const codigo = limpiar(cp);
  if (codigo) partes.push(`CP ${codigo}`);
  return recortarZona(partes.join(", "));
}

/**
 * Recorta a lo que acepta el back sin cortar a media palabra: se quita la última parte completa
 * (separada por comas) hasta que quepa; si ni la primera cabe, se corta en el último espacio.
 */
export function recortarZona(texto, largoMaximo = LARGO_MAXIMO_ZONA) {
  const zona = limpiar(texto);
  if (zona.length <= largoMaximo) return zona;

  const partes = zona.split(",").map((p) => p.trim());
  while (partes.length > 1) {
    partes.pop();
    const recortada = partes.join(", ");
    if (recortada.length <= largoMaximo) return recortada;
  }

  const cortada = zona.slice(0, largoMaximo);
  const ultimoEspacio = cortada.lastIndexOf(" ");
  return (ultimoEspacio > 0 ? cortada.slice(0, ultimoEspacio) : cortada).trim();
}

/**
 * Respuesta de Zippopotam → opciones de colonia para elegir.
 * Zippopotam no da municipio: se deja vacío y el administrador puede escribirlo.
 * → [{ colonia, municipio, estado, cp, zona }]
 */
export function coloniasDesdeCodigoPostal(respuesta, cpBuscado) {
  const lugares = respuesta && Array.isArray(respuesta.places) ? respuesta.places : [];
  const cp = limpiar(respuesta && respuesta["post code"]) || limpiar(cpBuscado);

  const vistas = new Set();
  const opciones = [];
  for (const lugar of lugares) {
    const colonia = limpiar(lugar["place name"]);
    const estado = limpiar(lugar.state);
    const clave = `${colonia}|${estado}`;
    if (!colonia || vistas.has(clave)) continue;
    vistas.add(clave);
    opciones.push({ colonia, municipio: "", estado, cp, zona: componerZona({ colonia, estado, cp }) });
  }
  return opciones;
}

// En México, Nominatim pone la colonia en quarter / suburb / neighbourhood / residential.
const CAMPOS_COLONIA = ["quarter", "suburb", "neighbourhood", "residential", "village", "hamlet"];
// Y el municipio en county / city / town / municipality.
const CAMPOS_MUNICIPIO = ["county", "municipality", "city", "town"];

function primero(direccion, campos) {
  for (const campo of campos) {
    const valor = limpiar(direccion[campo]);
    if (valor) return valor;
  }
  return "";
}

/**
 * Respuesta de Nominatim → sugerencias seleccionables.
 * `etiqueta` es lo que se ve en la lista; `zona` es lo que se guarda si se elige.
 * No se guarda ningún dato personal: solo colonia, municipio, estado y CP.
 * → [{ id, etiqueta, colonia, municipio, estado, cp, zona }]
 */
export function sugerenciasDesdeDireccion(respuesta) {
  const resultados = Array.isArray(respuesta) ? respuesta : [];

  const vistas = new Set();
  const sugerencias = [];
  for (const r of resultados) {
    const direccion = r && r.address ? r.address : {};
    const colonia = primero(direccion, CAMPOS_COLONIA);
    const municipio = primero(direccion, CAMPOS_MUNICIPIO);
    const estado = limpiar(direccion.state);
    const cp = limpiar(direccion.postcode);

    const zona = componerZona({ colonia, municipio, estado, cp });
    if (!zona || vistas.has(zona)) continue;
    vistas.add(zona);

    sugerencias.push({
      id: String(r.place_id ?? zona),
      etiqueta: limpiar(r.display_name) || zona,
      colonia,
      municipio,
      estado,
      cp,
      zona,
    });
  }
  return sugerencias;
}

/**
 * Qué hacer con lo que el administrador escribió en el campo.
 *   { tipo: "cp" }        → preguntar por código postal
 *   { tipo: "direccion" } → preguntar por texto libre
 *   { tipo: "ninguno" }   → muy corto: no se consulta nada (el campo sigue editable)
 */
export function planDeBusqueda(texto) {
  const valor = limpiar(texto);
  if (esCodigoPostal(valor)) return { tipo: "cp", consulta: valor };
  if (debeBuscarDireccion(valor)) return { tipo: "direccion", consulta: valor };
  return { tipo: "ninguno", consulta: "" };
}

/**
 * Mensaje cuando la consulta de ubicación no se pudo hacer. Nunca bloquea: el campo se sigue
 * escribiendo a mano y se puede guardar igual.
 */
export function mensajeDeFalloUbicacion(error) {
  if (error && error.tipo === "red") {
    return "No se pudo consultar la ubicación (sin conexión). Escribe la zona a mano.";
  }
  return "No se pudo consultar la ubicación. Escribe la zona a mano.";
}
