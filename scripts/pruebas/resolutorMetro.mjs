/**
 * GlamSpaces · Enganche de resolución que corre en el hilo de carga de módulos.
 * Lo registra resolverExpo.mjs. Ver ahí la explicación.
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const EXTENSIONES = [".js", ".mjs", ".json", "/index.js"];

export async function resolve(especificador, contexto, siguiente) {
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
