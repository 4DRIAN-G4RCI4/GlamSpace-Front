# Cierre del proyecto · HU-23 a HU-28

Fechas: 18 y 19/11/2026. Producción: <https://glamspacesfrontsa.z41.web.core.windows.net> (front) y la API en
Azure App Service. Las pruebas de flujo se corrieron contra la API **local** (LocalDB); en producción solo se hicieron lecturas.

## HU-23 · Flujo completo del cliente — 36/36 OK (dos corridas)

Prueba E2E por HTTP (API local en el puerto 5090 con el código de `develop`, LocalDB). Cuentas `@e2e.glamspaces.test`,
borradas al final de cada corrida.

| Paso | Casos |
|---|---|
| Registro | cuenta nueva · correo duplicado (1002) · contraseña corta (1001) |
| Inicio de sesión | correcto · contraseña incorrecta y correo inexistente con el mismo mensaje (1003) · nunca regresa `passwordHash` |
| Búsqueda | 18 por página y página 2 · zona sin importar mayúsculas ni acentos · capacidad y precio · `fotosPreview` · los no publicados no aparecen |
| Detalle | salón existente · inexistente (2001) · disponibilidad del mes |
| Solicitud | más invitados que la capacidad · sin teléfono · duplicada (4004) · ajena (4005) · un administrador no puede pedir (4003) |
| Mis solicitudes | trae `fotoPrincipal`; después de que el admin acepta se ve confirmada, la fecha queda ocupada y volver a pedirla da 4002 |
| Convertir a administrador | contraseña incorrecta (1003) · inexistente (1005) · éxito · repetir (1006) · login con la misma cuenta ya como admin · puede crear salones · "Mis solicitudes" responde 4003 |

## HU-24 · Flujo completo del administrador — 32/32 OK (dos corridas)

| Paso | Casos |
|---|---|
| Registro e inicio de sesión | sin nombre de salón (1001) · correcto |
| Salón | capacidad inválida · publicar sin paquetes (2003) · publicar · editar uno ajeno (2002) |
| Paquetes | crear, editar y eliminar · en salón ajeno (2002) · el último de un salón publicado (3002) |
| Mis salones | `totalPaquetes`, `fotoPrincipal` y `totalFotos` |
| Fotos | sin archivo (2005) · archivo falso con extensión .jpg (2006) |
| Panel | pendientes con nombre del cliente y foto · salón ajeno (2002) · estado inválido (1001) |
| Atender | aceptar (rechaza sola la otra de la misma fecha) · aceptar o rechazar otra vez (4006) · rechazar · filtrar confirmadas |
| Eliminar salón | con solicitud confirmada (2010) · ajeno (2002) · sin solicitudes (éxito) · inexistente (2001) |

Pruebas unitarias del front: **257/257**. No cubre: la subida real de una foto (sin emulador de almacenamiento en local)
ni la interfaz en un navegador.

## HU-25 · Corrección de errores encontrados

- **En las pruebas de flujo no apareció ningún error de la aplicación.** En la primera corrida fallaron 9 casos por un
  error de la prueba: esperaba 3002 al borrar el último paquete de un salón **no** publicado; la regla (y el README del
  back) dice que solo aplica a salones publicados. Se corrigió la prueba.
- **Hallazgos de la revisión de producción**, corregidos en HU-28: el bundle se servía sin compresión y sin caché.
- **Observado, sin corregir en código:** con la API recién despertada, la primera búsqueda respondió **500** una vez
  (arranque en frío de App Service / Azure SQL). El front muestra "No se pudieron cargar los salones" con el botón
  Reintentar, y al reintentar funciona. Se evita activando **Always On** en el App Service (configuración de Azure).

## HU-26 · Despliegue de la PWA en un ambiente accesible

Verificado en producción (solo lectura):

| Requisito | Resultado |
|---|---|
| HTTPS | Sí. Por HTTP la cuenta responde 400 ("does not support http"). |
| `manifest.json` | 200 · `name`, `short_name`, `start_url` y `scope` "/", `display: standalone`, `theme_color`, `background_color`, `lang es-MX` |
| Íconos | 192, 512 y maskable 512 (PNG, 200) · `apple-touch-icon` 180 |
| Service worker | `sw.js` 200 con `install`, `activate` y `fetch`; precarga del shell y caché de medios (HU-21) |
| Etiquetas | `viewport` con `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-*` |
| Despliegue | `deploy-front.yml` en cada push a `main` (Azure Storage, sitio estático) |

## HU-27 · Pruebas de instalación en dispositivo real (las corre el equipo)

Llenar en un teléfono real con la URL de producción:

| # | Paso | Android (Chrome) | iPhone (Safari) |
|---|---|---|---|
| 1 | Abrir la URL y esperar la búsqueda | ☐ | ☐ |
| 2 | Instalar: menú ⋮ → "Instalar app" · Compartir → "Agregar a inicio" | ☐ | ☐ |
| 3 | El ícono GlamSpaces aparece en la pantalla de inicio | ☐ | ☐ |
| 4 | Abre a pantalla completa (sin barra del navegador), barra superior vino | ☐ | ☐ |
| 5 | Buscar "tula", abrir un salón, ver fotos y calendario | ☐ | ☐ |
| 6 | Iniciar sesión como cliente y como administrador | ☐ | ☐ |
| 7 | Modo avión: la app abre y muestra lo guardado / aviso sin conexión | ☐ | ☐ |
| 8 | Volver a la red: se recupera sin cerrar la app | ☐ | ☐ |
| 9 | Tras un deploy nuevo aparece el aviso de nueva versión | ☐ | ☐ |
| 10 | Desinstalar | ☐ | ☐ |

Modelo y versión del sistema de cada teléfono: ______________________

## HU-28 · Ajustes finales de UX y rendimiento

Lighthouse 12.8.2 (móvil, 4G simulada) sobre producción, **antes** de los ajustes:

| | Corrida 1 (API en frío) | Corrida 2 (API despierta) |
|---|---|---|
| Rendimiento | 47 | **64** |
| Accesibilidad | 99 | **100** |
| Buenas prácticas | 96 | **96** |
| SEO | 100 | **100** |
| LCP | 23.1 s | 8.1 s |
| Bloqueo total (TBT) | 800 ms | 351 ms |

Causas que marca Lighthouse: sin compresión de texto (529 KiB de ahorro), sin caché (727 KiB), faltan `preconnect`
a la API y a las fuentes, y las fuentes se pedían hasta que cargaba el JS.

Ajustes (PR del front `Sprint8_Adrian_RendimientoPWA`):

- `deploy-front.yml`: gzip del bundle y de los textos (**744 KB → 205 KB**, −72 %) y `Cache-Control` (1 año
  inmutable para `_expo/` y `assets/`, que llevan hash; 7 días para `icons/`; `no-cache` para `index.html`, `sw.js` y
  los `.json`).
- `public/index.html`: `preconnect` a la API y a Google Fonts, y la hoja de fuentes desde el HTML.

Medición **después**: pendiente de correr Lighthouse cuando el cambio llegue a `main`.
