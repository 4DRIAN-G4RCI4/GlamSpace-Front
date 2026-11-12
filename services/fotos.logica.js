/**
 * GlamSpaces · HU-07 (fotos): subida real de imágenes · reglas puras (sin dependencias, se prueban
 * con node --test). Son las mismas que valida la API; aquí se revisan antes para no subir de balde.
 */

export const MAX_FOTOS = 8;
export const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB
export const TIPOS_ACEPTADOS = "image/jpeg,image/png,image/webp"; // para accept del selector

// Tipo REAL por los primeros bytes (magic bytes), no por la extensión: "jpg" | "png" | "webp" | null.
export function detectarTipo(bytes) {
  const b = bytes || [];
  const empieza = (firma, desde = 0) => firma.every((v, i) => b[desde + i] === v);
  if (empieza([0xff, 0xd8, 0xff])) return "jpg";
  if (empieza([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (b.length >= 12 && empieza([0x52, 0x49, 0x46, 0x46]) && empieza([0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  return null;
}

// null si el archivo se puede subir; si no, el mensaje para el administrador.
export function validarArchivo({ tamano, inicio }) {
  if (!tamano) return "El archivo está vacío.";
  if (tamano > TAMANO_MAXIMO) return "La imagen pesa más de 5 MB.";
  if (!detectarTipo(inicio)) return "Solo se aceptan imágenes JPG, PNG o WEBP.";
  return null;
}

// Cuántas fotos más caben contando las que ya tiene el salón y las que están por subirse.
export function cuposDisponibles(yaEnElSalon, porSubir = 0) {
  return Math.max(0, MAX_FOTOS - yaEnElSalon - porSubir);
}

// Reparte lo que eligió el administrador: las primeras que caben y cuántas se quedaron fuera.
export function repartirSeleccion(archivos, cupos) {
  return { aceptados: archivos.slice(0, cupos), sobrantes: Math.max(0, archivos.length - cupos) };
}

// Escritorio: entre 2 y 4 fotos por fila según el ancho de la columna, de hasta 165 px (Figma).
export function tamanoMosaico(anchoColumna, separacion = 12, maximo = 165) {
  if (!anchoColumna) return maximo;
  const porFila = Math.min(4, Math.max(2, Math.floor((anchoColumna + separacion) / (maximo + separacion))));
  return Math.min(maximo, Math.floor((anchoColumna - separacion * (porFila - 1)) / porFila));
}

// Al cargar las fotos de un salón desde la API: las guardadas que regresa la API, más las que el
// navegador tiene en curso (pendientes, subiendo o con error) y las que se acaban de guardar y la
// API todavía no regresaba. Así una carga que termina tarde nunca borra de la pantalla una subida.
export function combinarFotos(guardadas, locales) {
  const ids = new Set(guardadas.map((f) => f.fotoId));
  const enCurso = (locales || []).filter(
    (f) => ["pendiente", "subiendo", "error"].includes(f.estado) || (f.estado === "guardada" && f.fotoId && !ids.has(f.fotoId)),
  );
  return [...guardadas, ...enCurso];
}

// Campos exactos que espera POST /api/salones/subirFoto (multipart/form-data).
export function armarFormularioFoto({ salonId, adminId, archivo }) {
  const datos = new FormData();
  datos.append("salonId", String(salonId));
  datos.append("adminId", String(adminId));
  datos.append("archivo", archivo, archivo.name || "foto");
  return datos;
}

const MENSAJES_API = {
  2001: "El salón ya no existe.",
  2002: "Solo el administrador dueño del salón puede cambiar sus fotos.",
  2005: "Selecciona una imagen para subir.",
  2006: "Formato no válido: solo se aceptan imágenes JPG, PNG o WEBP.",
  2007: "La imagen pesa más de 5 MB.",
  2008: "El salón ya tiene 8 fotos. Elimina una para subir otra.",
  2009: "Esa foto ya no existe; actualiza la lista.",
  5000: "No se pudo guardar la foto en este momento. Intenta de nuevo más tarde.",
};

// Mensaje claro en español para cada error de la API; genérico para cualquier otro.
export function mensajeDeErrorFoto(error) {
  if (error && error.tipo === "red") return "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
  if (error && error.tipo === "config") return "La app no tiene configurada la URL de la API (EXPO_PUBLIC_API_URL).";
  return (error && MENSAJES_API[error.codigo]) || "Ocurrió un error con la foto, intenta de nuevo.";
}
