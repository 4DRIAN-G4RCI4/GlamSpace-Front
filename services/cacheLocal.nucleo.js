/**
 * GlamSpaces · Lógica de la caché local de datos (sin dependencias, para poder probarla en Node).
 * La app usa services/cacheLocal.js, que la conecta con AsyncStorage.
 *
 * Cada entrada se guarda como { esquema, guardadoEn, datos }:
 *   - esquema:    si cambia ESQUEMA, lo guardado con el formato viejo se descarta solo.
 *   - guardadoEn: fecha ISO de cuándo se guardó (para avisar "actualizado: …").
 * Nunca se guardan contraseñas ni tokens aquí: solo datos que la app ya mostró.
 */

export const PREFIJO = "glamspaces_cache:";
export const ESQUEMA = 1;

// Llave por usuario: "glamspaces_cache:<usuario>:<parte>:<parte>…". Sin usuario → "publico".
export function llaveCache(usuarioId, ...partes) {
  const dueno = usuarioId === null || usuarioId === undefined || usuarioId === "" ? "publico" : String(usuarioId);
  return [PREFIJO + dueno, ...partes.map((p) => (p === null || p === undefined ? "" : String(p)))].join(":");
}

function esAlmacenamientoLleno(e) {
  const texto = `${e && e.name} ${e && e.message}`;
  return /quota|full|lleno|SQLITE_FULL|exceeded/i.test(texto);
}

// HU-22 · Con conexión: pide a la API y guarda. Sin conexión (navigator.onLine false o error de
// tipo "red"): regresa lo último guardado marcado como desactualizado, con su fecha.
// → { datos, desactualizado, guardadoEn } · sin nada guardado lanza un error "red" con sinDatosGuardados.
export async function conRespaldo({ pedir, leer, guardar, enLinea }) {
  if (enLinea) {
    try {
      const datos = await pedir();
      await guardar(datos);
      return { datos, desactualizado: false, guardadoEn: null };
    } catch (e) {
      if (!e || e.tipo !== "red") throw e; // errores de negocio o HTTP no se tapan con la caché
    }
  }
  const guardado = await leer();
  if (!guardado) {
    const e = new Error("red");
    e.tipo = "red";
    e.sinDatosGuardados = true;
    throw e;
  }
  return { datos: guardado.datos, desactualizado: true, guardadoEn: guardado.guardadoEn };
}

export function crearCacheLocal(almacen, ahora = () => new Date()) {
  async function llavesPropias() {
    const llaves = await almacen.getAllKeys();
    return llaves.filter((l) => l.indexOf(PREFIJO) === 0);
  }

  async function borrarTodo() {
    try {
      const llaves = await llavesPropias();
      if (llaves.length) await almacen.multiRemove(llaves);
      return true;
    } catch (e) {
      return false;
    }
  }

  // → { ok: true } | { ok: false, motivo: "lleno" | "error" }. Nunca lanza: la caché es un extra.
  async function guardar(llave, datos) {
    const texto = JSON.stringify({ esquema: ESQUEMA, guardadoEn: ahora().toISOString(), datos });
    try {
      await almacen.setItem(llave, texto);
      return { ok: true };
    } catch (e) {
      if (!esAlmacenamientoLleno(e)) return { ok: false, motivo: "error" };
      // Almacenamiento lleno: se libera la caché propia (la sesión no se toca) y se intenta una vez más.
      try {
        const otras = (await llavesPropias()).filter((l) => l !== llave);
        if (otras.length) await almacen.multiRemove(otras);
        await almacen.setItem(llave, texto);
        return { ok: true };
      } catch (e2) {
        return { ok: false, motivo: "lleno" };
      }
    }
  }

  // → { datos, guardadoEn: Date } | null (no hay, está dañado o es de otro esquema).
  async function leer(llave) {
    try {
      const texto = await almacen.getItem(llave);
      if (!texto) return null;
      const entrada = JSON.parse(texto);
      if (!entrada || entrada.esquema !== ESQUEMA || !entrada.guardadoEn) {
        await almacen.removeItem(llave);
        return null;
      }
      return { datos: entrada.datos, guardadoEn: new Date(entrada.guardadoEn) };
    } catch (e) {
      try { await almacen.removeItem(llave); } catch (e2) { /* nada que hacer */ }
      return null;
    }
  }

  async function borrar(llave) {
    try {
      await almacen.removeItem(llave);
      return true;
    } catch (e) {
      return false;
    }
  }

  return { guardar, leer, borrar, borrarTodo };
}
