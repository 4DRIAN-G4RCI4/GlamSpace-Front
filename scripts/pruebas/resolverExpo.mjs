/**
 * GlamSpaces · Resolución de imports al estilo Metro (Expo) para `node --test`.
 *
 * El código de la app importa sin extensión (`import { aNumero } from "../../utils/validadores"`)
 * porque Metro la agrega sola. Node con módulos ES exige la extensión, así que al correr las
 * pruebas se carga este resolutor (`--import ./scripts/pruebas/resolverExpo.mjs`) que prueba
 * ".js", ".mjs" y "/index.js" cuando la ruta tal cual no existe.
 *
 * Solo afecta a las pruebas: el código de la app no se modifica.
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./resolutorMetro.mjs", pathToFileURL(`${import.meta.dirname}/`));
