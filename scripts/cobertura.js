/**
 * GlamSpaces · Cobertura para SonarQube Cloud. Corre las pruebas de scripts/pruebas con el
 * medidor de cobertura de Node y escribe coverage/lcov.info.
 *
 * Node escribe las rutas con el separador del sistema ("services\api.js" en Windows) y Sonar
 * las espera con "/", así que al final se normalizan. En Linux (el CI) ya vienen bien.
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const SALIDA = path.join(RAIZ, "coverage", "lcov.info");

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });

const r = spawnSync(
  process.execPath,
  [
    // Resuelve los imports sin extensión, como hace Metro en la app (ver scripts/pruebas/resolverExpo.mjs).
    "--import",
    "./scripts/pruebas/resolverExpo.mjs",
    "--test",
    "--experimental-test-coverage",
    // Las pruebas y sus ayudantes no cuentan como código medido.
    "--test-coverage-exclude=scripts/pruebas/**",
    "--test-reporter=lcov",
    `--test-reporter-destination=${SALIDA}`,
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    "scripts/pruebas/*.test.*",
  ],
  { cwd: RAIZ, stdio: "inherit" },
);

if (fs.existsSync(SALIDA) && path.sep !== "/") {
  const lcov = fs.readFileSync(SALIDA, "utf8").replace(/^SF:(.*)$/gm, (_, ruta) => `SF:${ruta.split(path.sep).join("/")}`);
  fs.writeFileSync(SALIDA, lcov);
}

process.exit(r.status === null ? 1 : r.status);
