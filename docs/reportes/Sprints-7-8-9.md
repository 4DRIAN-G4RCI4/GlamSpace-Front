# GlamSpaces · Sprints 7, 8 y 9: lo que se hizo

Este archivo es la fuente para redactar la documentación y los reportes de los Sprints 7, 8 y 9 (12–19 de noviembre de
2026). Junta todo lo que se hizo, dónde está la evidencia y los números que se pueden citar. Cada sección dice qué
archivo abrir para ver el detalle.

## Contexto del proyecto

- **Qué es:** PWA para buscar y reservar salones de eventos en la región Tula–Tepeji (Hidalgo). Tiene dos roles:
  - **Cliente:** busca salones, ve el detalle y pide una fecha.
  - **Administrador:** publica salones, paquetes y fotos, y atiende las solicitudes.
- **Front (`GlamSpace-Front`):**
  - React Native + Expo, exportado a web como PWA.
  - Se publica en Azure Storage como sitio estático: <https://glamspacesfrontsa.z41.web.core.windows.net>.
  - Las pruebas corren con `node --test`.
- **Back (`GlamSpace-Back`):**
  - API .NET 9 con Clean Architecture, Dapper y stored procedures, en Azure App Service con Azure SQL.
  - Todos los endpoints son `POST` y responden `{codigo, mensaje, datos, exito}`.
  - Las migraciones son de FluentMigrator, con un script SQL equivalente por cada una.
  - Pruebas con xUnit y NSubstitute.
  - Las fotos se guardan en Azure Blob Storage.
- **Flujo de trabajo:**
  - Rama de la tarea → `develop` → `release` → `main`, con un PR por salto.
  - Cada PR exige pruebas y el Quality Gate de SonarQube Cloud en verde: cobertura nueva ≥ 80 % y duplicación ≤ 3 %.
  - El deploy es automático al llegar a `main`.
  - Los commits se llaman `RE_SprintN: …`.
- **Base de datos de producción:** solo cambia con scripts que el responsable corre a mano. El deploy del back no corre
  migraciones.

---

## Sprint 7 (12–14 de noviembre)

Objetivo: convertir el sitio en una PWA instalable y con modo sin conexión, subir fotos reales de los salones, dejar
el detalle y la reserva igual que la maqueta, darle al administrador la gestión de sus salones y medir la calidad
con SonarQube.

### Historias y trabajos del front

| # | Trabajo | Qué se hizo | PRs (front) | Evidencia |
|---|---|---|---|---|
| 1 | **HU-20 · PWA instalable** | `manifest.json`, íconos normal y *maskable*, metadatos de iOS, `theme-color` vino y áreas seguras (`viewport-fit=cover`) | #35 → #38 → #39 | `docs/evidencias-pwa/HU-20.md`, `hu20_*` |
| 2 | **HU-21 · Service worker y caché** | `sw.js` generado en el build: la app se guarda en caché con versión y las fotos en una caché de medios. Muestra un aviso de nueva versión y la página de búsqueda funciona sin red | #36 → #38 → #39 | `HU-21.md`, `hu21_*` (incluye la prueba en Slow 3G y sin conexión) |
| 3 | **HU-22 · Modo sin conexión del administrador** | Banner "sin conexión", último estado guardado del panel y el calendario, y botones desactivados mientras no hay red | #37 → #38 → #39 | `HU-22.md`, `hu22_*` |
| 4 | **HU-07 · Fotos del salón (subida real)** | Sección de fotos en "Mi salón": subida con barra de progreso, reintento y eliminar. Se corrigió que una carga en curso se borraba | #41 → #42 → #43 · #44 → #45 → #46 | `HU-07-fotos.md`, `hu07_*` |
| 5 | **HU-16 · Galería, detalle y reserva** | Detalle en dos columnas con galería y tarjeta de reserva fija, y carrusel al pasar el mouse por la tarjeta. La reserva va en dos pasos (pantallas Cliente 04 y 05) y muestra los errores de la API (por ejemplo 4002) | #47 → #48 → #49 | `Galeria-reserva.md`, `galeria_reserva_*` (6 tamaños de pantalla) |
| 6 | **Navegación, Perfil y solicitudes** | Barra superior fija con accesos según el rol y menú hamburguesa en teléfono, Perfil en dos columnas, y detalle de cada solicitud con los datos del salón | #50 → #51 | `docs/evidencias-pwa/navegacion/` |
| 7 | **Cobertura en SonarQube Cloud** | Workflow `sonar.yml` y `sonar-project.properties`. Cobertura con el medidor de Node (`npm run test:cobertura`). Se apagó el análisis automático de SonarCloud. Se corrigieron S8786 (regex del correo), S7773 (`Number.NaN`) y S2871 (`sort` con `localeCompare`) | #52 → #54 → #55 | README, sección "Calidad y cobertura" |
| 8 | **Mis salones del administrador** | Lista de sus salones con Editar, Ver y Eliminar, y edición con todos los datos ya cargados. Ubicación asistida: código postal (Zippopotam) y dirección (OpenStreetMap/Nominatim). Diálogo de confirmación accesible. Se corrigió el bug del nombre del salón, que se prellenaba con el correo | #53 → #54 → #55 | `docs/evidencias-pwa/mis-salones/` (9 capturas) |
| 9 | **Ronda de experiencia** | Panel del administrador en 2 columnas con paginación de 10. Botón "← Regresar". "Mis solicitudes" con filtros, contadores y paginación. Listas de 18 salones con "Cargar más" de 6. Invitación a ser administrador. Login y registros con diseño de dos paneles y autocompletado corregido | #56 → #57 → #58 | `docs/evidencias-pwa/experiencia/` |
| 10 | **Foto en las solicitudes y convertir a administrador** | Las tarjetas de solicitud muestran la foto del salón (`fotoPrincipal`). Un cliente se puede convertir en administrador confirmando su contraseña; conserva su correo y su historial. Se extrajo el hook `useDialogoModal` para quitar la duplicación | #59 → #60 → #61 · #62 → #63 → #64 | `sprint7` en el README |

### Trabajos del back

| # | Trabajo | Qué se hizo | PRs (back) |
|---|---|---|---|
| 1 | **HU-07 · Fotos en Azure Blob Storage** | Endpoints `subirFoto` y `eliminarFoto`; la API valida su configuración al arrancar. Migración **M010** y script 12. Pruebas con un almacenamiento falso | #50 → #51 → #52 |
| 2 | **`fotosDetalle` en el detalle del salón** | El id y la URL de cada foto | #53 → #54 |
| 3 | **`fotosPreview` en la búsqueda** | Hasta 5 fotos por salón, en una sola consulta por página (sin N+1). Migración **M011** y script 13 | #55 → #56 → #57 |
| 4 | **Sonar del back** | Analiza `main` y los PRs. Pruebas de los repositorios de paquetes, usuarios, solicitudes y salones con `ConexionFalsa` | #58 → #59 → #60 |
| 5 | **Mis salones (back)** | Endpoint `eliminar` de salón: devuelve el código 2010 si el salón tiene solicitudes y en ese caso no lo borra. Además, `fotoPrincipal` y `totalFotos` en `listar`. Migración **M012** y script 14 | #61 → #62 (→ #60) |
| 6 | **Correcciones de Sonar** | Menos duplicación, acciones de GitHub fijadas por SHA y regla S6964 | #63 → #64 → #65 |
| 7 | **Carga masiva de demostración** | Scripts **15** (carga), **16** (borrado) y **17** (verificación). Cargan 1,500 salones de la región, cada uno con 4 o 5 fotos y de 1 a 3 paquetes, todos marcados como demo. Se corrigió el orden de los juegos de fotos (`INSERT … ORDER BY` con `OUTPUT`) | #66 → #67 → #70 |
| 8 | **Solicitudes y conversión a administrador** | `fotoPrincipal` en `solicitudes/listar` y `listarPorSalon`. `POST /api/usuarios/convertirAAdministrador {usuarioId, contrasena}`, que responde 1005/404, 1003/401 y 1006/409. Migración **M013** y script 18 | #68 → #69 → #70 |

Todas las migraciones (M010 a M013) tienen prueba de `Up` y `Down`, y el workflow de migraciones verifica el rollback de
cada una. Producción se actualizó corriendo a mano los scripts 12 a 18.

### Resultados del Sprint 7

| Indicador | Valor |
|---|---|
| Pruebas del front | 71 → **257** en verde |
| Cobertura del front en SonarCloud | "–" (no se medía) → **92 %** (Quality Gate OK) |
| Salones en producción | 1 → **1,501** (carga de demostración) |
| Deploy | Front y back en producción; `convertirAAdministrador` publicado |

---

## Sprints 8 y 9 (18–19 de noviembre) · Cierre del proyecto

Las seis historias del cierre se trabajaron juntas el 18 y el 19 de noviembre, pero en el backlog pertenecen a dos
sprints:

- **Sprint 8 · Pruebas y corrección:** HU-23, HU-24 y HU-25.
- **Sprint 9 · Despliegue, dispositivo real y ajustes finales:** HU-26, HU-27 y HU-28.

En Git los commits y PRs de las seis se llaman `RE_Sprint8: …`, porque se subieron juntos.

Cada historia tiene su documento con la misma estructura: ficha (con sprint y responsable), objetivo, criterios,
entorno, resultados, evidencia, defectos y **datos clave para el reporte**. Están en `docs/evidencias-pwa/cierre/`:
`HU-23.md` a `HU-28.md`, el índice en `README.md` y el resumen técnico en `Cierre-HU23-a-HU28.md`.

### Sprint 8 · Pruebas y corrección de errores

| HU | Título | Responsable | Resultado | Números para citar |
|---|---|---|---|---|
| **HU-23** | Pruebas del flujo completo del cliente | Erick Trejo Reséndiz | Terminada | **36/36** casos OK, dos corridas seguidas, 0 defectos en la app |
| **HU-24** | Pruebas del flujo completo del administrador | Adrian Adonai García Jiménez | Terminada | **32/32** casos OK, 0 defectos en la app |
| **HU-25** | Corrección de errores encontrados | Ángel Alexis Blas Castillo | Terminada | Reintento automático de las lecturas cuando la API de Azure recién despierta (red o 5xx, un solo reintento a los 1.5 s; las escrituras nunca se repiten), con 6 pruebas nuevas |

Qué se hizo:

- **HU-23 y HU-24:** las pruebas de punta a punta corrieron contra una API local (LocalDB y Azurite), nunca contra
  producción.
  - **Cliente:** registro, login, búsqueda con filtros, detalle, disponibilidad, solicitud de reservación y "Mis
    solicitudes".
  - **Administrador:** registro, Mis salones, crear y editar un salón, paquetes y fotos, aceptar y rechazar solicitudes,
    bloqueo de fechas y eliminar.
  - Un caso esperaba un error que la regla de negocio no aplica (borrar el último paquete de un salón **no publicado**).
    Se corrigió la prueba, no la app.
- **HU-25:** se agregó `services/reintento.logica.js`, que usa `services/api.js`. Con eso, la primera búsqueda después
  de que la API estuvo dormida ya no muestra error.

### Sprint 9 · Despliegue, dispositivo real y ajustes finales

| HU | Título | Responsable | Resultado | Números para citar |
|---|---|---|---|---|
| **HU-26** | Despliegue de la PWA en un ambiente accesible | Ángel Alexis Blas Castillo | Terminada | En Azure Storage con deploy automático al llegar a `main`. Se verificó en producción: gzip, `immutable` en los archivos con hash y `no-cache` en `index.html` y `sw.js` |
| **HU-27** | Pruebas de instalación en dispositivo real | Adrian Adonai García Jiménez | Android probado, iPhone pendiente | Tablet Samsung Galaxy Tab A9 con Android 16: instalada como WebAPK, pantalla completa, service worker activo y arranque en modo avión. **8/8** pasos probados OK, 0 fallas, FCP de 1.38 s en el dispositivo |
| **HU-28** | Ajustes finales de UX y rendimiento | Erick Trejo Reséndiz | Terminada | Lighthouse 64 → **68**, LCP 8.1 → **5.8 s**, carga inicial 835 → **315 KiB**, bundle 744 → **206 KB** |

Qué se hizo:

- **HU-26 · Despliegue:**
  - `deploy-front.yml` comprime los archivos con gzip y los sube con encabezados de caché: 1 año e `immutable` para los
    archivos con hash, `no-cache` para `index.html`, `sw.js` y el manifest.
  - Verificación de producción (solo lectura):
    - La búsqueda trae 1,501 salones y responde en 0.4–0.7 s.
    - Las 19 fotos de demostración responden.
    - El detalle, los paquetes y la disponibilidad funcionan.
    - Las cuentas de demostración no pueden iniciar sesión, como debe ser.
- **HU-27 · Dispositivo real:**
  - La tablet se conectó por USB y se revisó con `adb` y la depuración remota de Chrome.
  - Se comprobó que la app está instalada como WebAPK y corre la misma versión que producción.
  - Se revisaron el service worker y la caché (14 archivos de la app y 23 fotos) y se vio que la consola no tiene
    errores.
  - Se probaron la búsqueda, el detalle, las fotos en pantalla completa con deslizamiento y el arranque en modo avión.
  - Hay 5 capturas en `cierre/hu27/`.
- **HU-28 · UX y rendimiento:**
  - `public/index.html` abre antes las conexiones a la API y a Google Fonts (`preconnect`) y carga la hoja de fuentes
    sin bloquear el primer pintado. Hubo una regresión de FCP (1.0 → 2.8 s) por la hoja de fuentes; se detectó en la
    medición y se corrigió.
  - Botón ⤢ para ver las fotos del salón en pantalla completa (`FotoPantallaCompleta.js`). Tiene flechas, contador,
    Esc para cerrar y se puede deslizar con el dedo; el deslizamiento está en el hook compartido `useDeslizarFotos`.
  - El botón Regresar pasó a ser un círculo junto a la marca y se rellena de vino al pasar el puntero.
  - El botón "Ver salones sin iniciar sesión" del login también se rellena de vino al pasar el puntero.

### PRs de los Sprints 8 y 9 (front)

#65 → #66 (rendimiento) · #67 → #68 → #69 (reintento, pantalla completa, Regresar y documentos) · #70 → #71 → #72
(fuentes) · #73 → #74 → #75 (medición final). Los tres saltos a `main` (#69, #72, #75) se hicieron con los checks en
verde y el Quality Gate OK.

### Resultados de los Sprints 8 y 9

| Indicador | Valor |
|---|---|
| Pruebas del front | 257 → **263** en verde |
| Pruebas de punta a punta | **68/68** (36 del cliente y 32 del administrador) |
| Lighthouse en producción (antes → después) | Rendimiento 64 → 68 · Accesibilidad 100 · Buenas prácticas 96 · SEO 100 |
| Errores en consola | 1 → **0** |

---

## Pendientes al cierre

1. **HU-27 en iPhone**, y los pasos que requieren contraseñas: iniciar sesión como cliente y como administrador, y ver
   el calendario de disponibilidad. También el aviso de versión nueva tras un deploy en el dispositivo.
2. **Optimizar las fotos de demostración** (por ejemplo `demo-02.png` pesa 1.4 MB). Pasarlas a WebP reduciría la carga
   con fotos de unos 3 MB a menos de la mitad. No se hizo por decisión del equipo.
3. **Activar Always On** en Azure App Service (requiere plan B1 o superior), para que la API no se duerma.
4. Dividir el bundle en partes que se carguen bajo demanda.

## Reglas para quien redacte

- No incluir secretos, cadenas de conexión ni contraseñas.
- Cada HU de los Sprints 8 y 9 se reporta a nombre de su responsable (está en la tabla y en la ficha de cada HU).
- Los números de este archivo se tomaron de las pruebas y mediciones reales; no redondearlos ni inventar otros.
- Si se necesita más detalle, el orden de consulta es:
  1. el documento de la HU en `docs/evidencias-pwa/`;
  2. el README del repo;
  3. el historial de PRs en GitHub.
