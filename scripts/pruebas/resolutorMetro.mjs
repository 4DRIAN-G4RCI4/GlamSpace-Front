/**
 * GlamSpaces · Enganche de resolución que corre en el hilo de carga de módulos.
 * Lo registra resolverExpo.mjs. Ver ahí la explicación.
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const EXTENSIONES = [".js", ".mjs", ".json", "/index.js"];

// Paquetes que Metro importa con su `default` y Node no: se cambian por un puente de prueba.
const PUENTES = {
  "@react-native-async-storage/async-storage": new URL("./asyncStorageWeb.mjs", import.meta.url).href,
};

export async function resolve(especificador, contexto, siguiente) {
  const puente = PUENTES[especificador];
  if (puente && !contexto.parentURL.endsWith("/asyncStorageWeb.mjs")) {
    return { url: puente, shortCircuit: true, format: "module" };
  }
  try {
    return await siguiente(especificador, contexto);
  } catch (error) {
    const esRelativo = especificador.startsWith("./") || especificador.startsWith("../");
    if (!esRelativo || error.code !== "ERR_MODULE_NOT_FOUND") throw error;

    for (const extension of EXTENSIONES) {
      const candidato = new URL(especificador + extension, contexto.parentURL);
      if (existsSync(fileURLToPath(candidato))) {
        return { url: candidato.href, shortCircuit: true, format: "module" };
      }
    }
    throw error;
  }
}
