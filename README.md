# GlamSpaces · Frontend (React Native + Expo → PWA)

Frontend del equipo G3. Un solo código en React Native (Expo) que se compila a web
con `react-native-web` y se publica como sitio estático en Azure.

## Estructura

```
App.js                              Router manual entre pantallas (navigate(nombre, params) + route.params)
                                    En web usa el historial del navegador: Atrás/Adelante y recargar funcionan
components/                         Piezas visuales reutilizables
  Campo.js · Campo.styles.js          Input con etiqueta, error, pista y mostrar/ocultar contraseña
  Marca.js · Marca.styles.js          Logo + nombre de GlamSpaces
  TarjetaSalon.js · .styles.js        Tarjeta de un resultado de búsqueda (HU-10), con carrusel al pasar el mouse
  useCarrusel.js · carrusel.logica.js Carrusel de la tarjeta y navegación de la galería del detalle
  EncabezadoCliente.js · .styles.js   Barra con migas de pan del detalle y la reserva
  TarjetaSolicitud.js · .styles.js    Resumen de una solicitud con su estado (HU-16)
theme/
  colores.js                        Paleta única
  estilosComunes.js                 Estilos que se repiten (tarjeta, botones, mensajes...)
utils/
  validadores.js                    Correo, URL, número, longitud mínima de contraseña
  validarCuenta.js                  Reglas comunes de cliente y administrador
  formato.js                        Formato de precios ($8,500)
  fechas.js                         Fechas del calendario ("yyyy-MM-dd", semanas del mes, fecha larga)
services/                           Todo lo que habla con la API o el dispositivo
  api.js                              URL base (EXPO_PUBLIC_API_URL), postJson, postPaginado, mensajes de error
  usuariosApi.js                      Registro y login (HU-02, HU-03, HU-04)
  salonesApi.js                       Crear/publicar salón y paquetes (HU-07), buscar (HU-10), detalle y disponibilidad (HU-13)
  solicitudesApi.js                   Crear, consultar y listar solicitudes de reservación (HU-16)
  solicitudes.logica.js               Armado del envío a /solicitudes/crear y mensajes de sus errores
  sesionStorage.js                    Sesión activa en el dispositivo
screens/                            Una carpeta por pantalla, cada una dividida en 4 partes
  <Pantalla>/<Pantalla>Screen.js      Módulo visual (solo JSX)
  <Pantalla>/<Pantalla>.styles.js     Estilos
  <Pantalla>/use<Pantalla>.js         Lógica: estado y acciones (el "script")
  <Pantalla>/<pantalla>.validaciones.js  Reglas de validación
  BusquedaSalones/                  HU-10 · pantalla de inicio
  DetalleSalon/                     HU-13 · detalle en dos columnas, galería, paquetes, calendario y tarjeta fija
  SolicitudReservacion/             HU-16 · reserva en 2 pasos (Cliente 04 elegir, Cliente 05 confirmar)
  MisSolicitudes/                   HU-16 · estado de las solicitudes del cliente
  PanelAdministrador/               HU-19 · solicitudes del salón (aceptar / rechazar) y calendario
  Login/                            HU-04 (+ PanelSesion.js)
  RegistroCliente/                  HU-02
  RegistroAdministrador/            HU-03
  PublicarSalon/                    HU-07
```

Regla de oro: **la pantalla no hace `fetch` ni valida**. Pinta lo que le da su hook.
El hook valida con su archivo de validaciones y manda los datos a un servicio.

## Configuración

1. Copia `.env.example` a `.env` (no se sube al repo).
2. `npm install`
3. `npm run web` (o `npx expo start --web -c` para limpiar caché).

La URL de la API se lee de `EXPO_PUBLIC_API_URL`. En producción la inyecta el
workflow de GitHub Actions desde el secret del mismo nombre.

## Cómo habla con la API (backend Sprint 2.5)

Desde el Sprint 2.5 del backend **todos los endpoints son POST** y todas las respuestas
tienen la misma forma:

```json
{ "codigo": 0, "mensaje": "...", "datos": { ... }, "exito": true }
```

`services/api.js` lo resuelve una sola vez para toda la app:
- `postJson(ruta, body)` → regresa solo `datos`.
- `postPaginado(ruta, body)` → regresa `{ datos, pagina, tamanoPagina, totalRegistros, totalPaginas, mensaje }`.
- Si `exito` es `false` o el status no es 2xx, lanza `ApiError` con `estado` (HTTP), `codigo`
  (catálogo del backend, ej. 2003) y `mensaje` en español, que se muestra tal cual.

## Publicar un salón (HU-07)

La API no publica al crear, así que el botón **Publicar** hace 3 llamadas seguidas
(`services/salonesApi.js`):

1. `POST /api/salones/crear` → crea el salón como `no_publicado`.
2. `POST /api/paquetes/crear` → uno por cada paquete (`salonId` en el body).
3. `POST /api/salones/actualizar` con `estado: "publicado"` → exige al menos un paquete.

- Mientras no haya JWT, el `adminId` (el `id` que regresa el login) va en el body.
  La sesión lo guarda; si alguien tiene una sesión vieja sin `id`, se le pide volver a entrar.
- `actualizar` reemplaza todo: siempre se mandan todos los campos (si no, se borra la descripción).
- Si falla a medias (por ejemplo, el salón se creó pero un paquete no), el reintento
  continúa donde se quedó y no duplica nada.

## Sprint 3 — Pantalla de búsqueda de salones (HU-10)

Es la **pantalla de inicio** de la app (`screens/BusquedaSalones/`). Consume
`POST /api/salones/buscar` (HU-09 del backend).

- **Barra de búsqueda**: filtra por zona (coincidencia parcial, sin importar acentos).
- **Chips de filtro** 📍 Zona · 👥 Capacidad · 💲 Precio: al tocar uno se abre su editor
  y el filtro se aplica al confirmar con **Aplicar**. Los filtros activos se ven **rellenos**
  y muestran su valor ("👥 150+ personas", "💲 Hasta $10,000"); la ✕ los quita.
- **Tarjetas**: foto principal (o la inicial del salón si no tiene), nombre, zona, capacidad
  y **precio desde**. Al tocarla se abre el detalle de ese salón (`screens/DetalleSalon/`).
- **Sin resultados**: muestra "No hay salones disponibles con esos filtros" y un botón para quitarlos.
- **Paginado**: 10 por página, con botón "Cargar más salones".
- Si el usuario cambia los filtros rápido, solo se pinta la respuesta de la última búsqueda.
- **Zona por defecto**: `ZONA_POR_DEFECTO` en `useBusquedaSalones.js`. Hoy está vacía, así que
  la pantalla abre con todos los salones publicados. Si el equipo define una zona, se cambia ahí.

Navegación: la app abre en la búsqueda; **Mi cuenta** lleva al login, el panel de cliente
tiene **Buscar salones** y el login tiene **Ver salones sin iniciar sesión**.

### Criterios de aceptación (probados de punta a punta en Chrome contra la API de Azure)

| # | Caso | Resultado |
|---|---|---|
| 1 | Abrir la pantalla de inicio | Carga los salones publicados con su "precio desde" |
| 2 | Aplicar un filtro y confirmarlo | La lista se actualiza (ej. zona "tula" → 5; + precio ≤ $10,000 → 4) |
| 3 | Búsqueda sin resultados | Mensaje "No hay salones disponibles con esos filtros" |
| 4 | Tocar una tarjeta | Abre el detalle de ese salón con sus paquetes |

Regla de negocio: los filtros activos se ven rellenos y con su valor. También se probó la
validación de los chips (precio negativo), "Quitar filtros" y volver de la pantalla de detalle.

### Diseño y accesibilidad

- **Franja de encabezado** morado oscuro con acento dorado; resultados sobre el fondo lila.
- **Sugerencias rápidas** en cada filtro (Tula, 100+, Hasta $10,000...): un toque aplica el
  filtro sin escribir. También se puede escribir un valor y pulsar **Aplicar**.
- **Cuadrícula responsiva**: 1 columna en celular, 2 en tablet (≥ 700 px), 3 en escritorio (≥ 1024 px).
- **Carga con esqueletos** (`components/Esqueleto.js`) en lugar de un spinner, en la búsqueda y en el detalle.
- **Foto de respaldo** (`components/FotoSalon.js`): si el salón no tiene foto o la URL no carga,
  muestra su inicial en lugar de un recuadro vacío.
- **Detalle**: botón "Volver" arriba, datos en pastillas, "precio desde" destacado y el paquete
  más económico marcado.
- **Escalas** de espaciado y esquinas en `theme/espaciado.js` (sin números sueltos).
- **Accesibilidad (WCAG 2.1 AA)**: revisado con axe-core sin problemas en búsqueda y detalle.
  Etiquetas para lectores de pantalla en tarjetas, chips y campos; foco visible al navegar con
  teclado; el color `muted` y el pie de página se oscurecieron para cumplir contraste 4.5:1.

## Sprint 4 — Detalle y calendario de disponibilidad (HU-13)

`screens/DetalleSalon/` ahora es la pantalla completa del salón. Consume
`POST /api/salones/obtener` (detalle) y `POST /api/salones/disponibilidad` (HU-12 del backend),
que regresa las fechas ocupadas de un mes: `{ salonId, anio, mes, fechasOcupadas: ["2026-11-14"] }`.

- **Galería**: foto grande y miniaturas para cambiarla (solo si el salón tiene más de una).
- **Paquetes** del más barato al más caro, igual que antes.
- **Calendario mensual** (`CalendarioDisponibilidad.js` + `useDisponibilidad.js`): abre en el mes
  actual, no deja ir a meses pasados y consulta la API cada vez que se cambia de mes.
  Cada día se ve como disponible, **ocupado** (rosa y tachado), pasado (gris) o **tu fecha** (morado).
  Si la consulta falla, muestra el error con **Reintentar** y no deja elegir fechas.
- **Solicitar reservación**: se habilita al elegir una fecha y lleva a
  `screens/SolicitudReservacion/` con la fecha precargada ("Cambiar" regresa al calendario).

Regla de negocio (`detalleSalon.validaciones.js`): solo se eligen fechas futuras (a partir de
mañana) que no estén ocupadas. Las fechas se manejan como texto `yyyy-MM-dd` con la hora local
(`utils/fechas.js`), así no se corren un día por la zona horaria.

### Criterios de aceptación (probados de punta a punta en Chrome contra la API de Azure)

Salón `[Prueba] Jardín Encanto`: noviembre 2026 tiene confirmadas el 14 y el 21 y una pendiente el 28.

| # | Caso | Resultado |
|---|---|---|
| 1 | Entrar al detalle del salón | Muestra fotos, paquetes y el calendario del mes actual |
| 2 | Ver noviembre 2026 | El 14 y el 21 se ven ocupados; el 28 (pendiente) se ve disponible |
| 3 | Elegir el 20 y pulsar **Solicitar reservación** | Abre la solicitud con "viernes 20 de noviembre de 2026" |
| 4 | Tocar el 14 (ocupado) | Avisa "Esa fecha ya está reservada" y el botón sigue deshabilitado |

Accesibilidad: cada día tiene su etiqueta para lector de pantalla ("14 de noviembre, ocupado"),
los ocupados no dependen solo del color (van tachados) y el aviso se anuncia al aparecer.

## Sprint 5 — Formulario de solicitud de reservación (HU-16)

Consume los endpoints de la HU-15 del backend (`services/solicitudesApi.js`), todos POST:

| Endpoint | Body | Uso |
|---|---|---|
| `/api/solicitudes/crear` | `{ clienteId, salonId, paqueteId?, fechaEvento, tipoEvento, numeroInvitados, telefonoContacto, comentarios? }` | Enviar la solicitud |
| `/api/solicitudes/obtener` | `{ id, clienteId }` | "Actualizar estado" de una solicitud |
| `/api/solicitudes/listar` | `{ clienteId, pagina, tamanoPagina }` | "Mis solicitudes" |

- **Formulario** (`screens/SolicitudReservacion/`): llega desde el calendario del detalle con la fecha
  precargada ("Cambiar" regresa al calendario). Pide tipo de evento (con sugerencias de un toque),
  número de invitados (muestra la capacidad del salón), paquete opcional, teléfono y comentarios.
  El nombre se toma de la sesión, porque la API lo lee de la cuenta del cliente.
- **Sesión**: solo un cliente puede enviar. Sin sesión, el formulario pide **Iniciar sesión** y, al entrar,
  regresa al formulario con la misma fecha (`volverA` en los parámetros del login). A un administrador
  le explica que necesita una cuenta de cliente.
- **Confirmación**: al enviarse muestra "¡Solicitud enviada!" con el resumen y el estado **Pendiente**.
- **Mis solicitudes** (`screens/MisSolicitudes/`): lista del cliente con el estado de cada una
  (pendiente, confirmada o rechazada, cada uno con su color), "Actualizar estado" por solicitud y
  "Ver más" para paginar. Se entra desde el panel del cliente y desde la confirmación.

Reglas (`solicitudReservacion.validaciones.js`): fecha, tipo de evento, invitados (entero > 0 y hasta
la capacidad del salón), nombre y teléfono (10 a 15 dígitos) son obligatorios; comentarios hasta 500
caracteres. Si algo falta, se marca cada campo y un aviso dice qué revisar, sin llamar a la API.

Errores de la API que se tratan aparte:
- **4002** (la fecha ya no está disponible) y **1001** de fecha pasada: muestra el mensaje y el botón
  **Elegir otra fecha**, que regresa al calendario.
- **4004** (ya hay una solicitud pendiente para ese salón y fecha): muestra el mensaje y **Ver mis solicitudes**.
- Los demás se muestran tal cual llegan de la API.

**Limitación conocida:** mientras no haya JWT, el `clienteId` viaja en el body (lo toma de la sesión
guardada). Hoy alguien podría mandar el `clienteId` de otro cliente; se corrige cuando la API tome el
cliente del token.

### Criterios de aceptación (probados en Chrome)

Los salones y el calendario se probaron contra la API de Azure. Los 3 endpoints de solicitudes se
simularon en el navegador con el contrato de la HU-15 (mismos campos y códigos), para no crear
datos en producción.

| # | Caso | Resultado |
|---|---|---|
| 1 | Completar el formulario y enviarlo | Manda el body del contrato y muestra "¡Solicitud enviada!" con estado Pendiente |
| 2 | Enviar con tipo de evento, invitados y teléfono vacíos | Marca los 3 campos y avisa "Revisa: tipo de evento, número de invitados y teléfono." sin llamar a la API |
| 3 | La API responde 4002 al enviar | Muestra "La fecha ya no está disponible." y el botón **Elegir otra fecha** |
| 4 | Abrir "Mis solicitudes" y pulsar "Actualizar estado" | Muestra cada solicitud como Pendiente, Confirmada o Rechazada y consulta `/obtener` |

También se probó: invitados por encima de la capacidad, el regreso al formulario después de iniciar
sesión y que no haya errores de JavaScript.

## Sprint 6 — Panel de administrador de solicitudes (HU-19)

El administrador ve las solicitudes **pendientes** de su salón ordenadas por fecha del evento y las
**acepta o rechaza**. El calendario del salón se actualiza después de cada acción.

**Diseño:** sigue el Figma "PROYECTO--PWA" del equipo (Admin 02 · Panel de solicitudes, escritorio y
móvil, y Admin 04 · Calendario de disponibilidad): barra lateral oscura, color vino `#6b2942`,
Playfair Display para títulos e Inter para el texto. Los tokens están en `theme/disenoPwa.js` y las
fuentes se cargan en web con `theme/fuentesWeb.js`. Los íconos (logo y flechas) están en `assets/admin/`.
En pantallas de menos de 1024 px se usa la versión móvil: encabezado con pestañas.

| Pieza | Dónde |
|---|---|
| Pantalla | `screens/PanelAdministrador/` (pantalla, estilos, `usePanelAdministrador`, `useCalendarioAdmin`, reglas puras en `panelAdministrador.logica.js`) |
| Endpoints (HU-18) | `services/solicitudesApi.js`: `listarSolicitudesDeSalon`, `aceptarSolicitud`, `rechazarSolicitud` |
| Salones del admin | `services/salonesApi.js`: `listarSalonesDeAdmin` (`POST /api/salones/listar`) |
| Acceso | Iniciar sesión como administrador → **Panel de solicitudes** |

**Cómo funciona**

- **Aceptar y rechazar** piden confirmación dentro de la tarjeta. Al aceptar, el mensaje avisa cuántas
  pendientes del mismo día se rechazarán solas (HU-17).
- Si la API responde con error, el mensaje aparece en la tarjeta y la solicitud **no** se quita (criterio 4).
- Solo se ven las solicitudes del salón del administrador en sesión: la API responde `2002` si no es su salón.
- Si el administrador tiene varios salones, aparece un selector arriba.
- Las tarjetas de cifras (pendientes, aceptadas e ingresos del mes) y el historial reciente se calculan
  con las mismas solicitudes.

**Criterios verificados** con el front y la API locales sobre LocalDB, con un navegador automatizado (9 de 9):

| # | Caso | Resultado |
|---|---|---|
| 1 | Abrir el panel con 4 pendientes | Se listan por fecha del evento: 5, 12, 12 y 19 de diciembre |
| 2 | Aceptar una solicitud | Sale de pendientes, la otra del mismo día se rechaza sola y el calendario marca el día como **Reservado** |
| 3 | Rechazar una solicitud | Sale de pendientes y el día sigue **Disponible** |
| 4 | La API responde `4006` al aceptar | Muestra "La solicitud ya fue atendida." y la tarjeta se queda |

También se revisó: móvil a 390 px sin scroll horizontal, títulos en Playfair Display y que no haya errores de JavaScript.

## Sprint 7 — PWA

### HU-20 · Manifest e instalación

- `public/manifest.json` contiene el nombre, `display: standalone`, `start_url` y `scope` en `/`, `es-MX`, los colores del diseño y los íconos 192, 512 y 512 maskable.
- `public/index.html` es la plantilla que Expo usa al exportar. Incluye el link al manifest, el apple-touch-icon, `viewport-fit=cover`, las metas de Apple y las áreas seguras.
- `public/` se copia tal cual a `dist/`.
- Evidencias en `docs/evidencias-pwa/HU-20.md`.

### HU-21 · Service worker y estrategia de caché

**Construir:** `npm run build:web`. Corre `expo export -p web` y después `scripts/posexport.js`, que genera `dist/sw.js` con:

- **PRECACHE**: los archivos reales de `dist`, que son el HTML (como `/`), el bundle con hash, los assets, los íconos y el manifest.
- **VERSION**: un hash del contenido de esos archivos. Si algo cambia, cambia la versión. El navegador instala el SW nuevo, que borra la caché anterior.

| Petición | Estrategia | Por qué |
|---|---|---|
| Navegación (abrir la app) | Red primero. Si la red falla o tarda más de 3 s, usa el `index.html` guardado | Así siempre se ve la última versión, pero sin conexión la app abre igual |
| `/_expo/static/*` y `/assets/*` (llevan hash) | Caché primero | Si el archivo cambia, cambia su nombre, así que lo guardado nunca queda viejo |
| Manifest e íconos | Red primero | No llevan hash |
| Fotos de salones y fuentes (Google Fonts) | Stale-while-revalidate (caché `glamspaces-medios`, máximo 150) | Se muestran al instante y se actualizan en segundo plano |
| **POST y cualquier ruta `/api/`** | **No se interceptan** | La Cache API no guarda POST, y los datos van por la capa local (abajo) |

**Datos ("consultado recientemente"):** `services/cacheLocal.js` guarda las respuestas de la API en AsyncStorage (`localStorage` en web).

- Cada entrada lleva su fecha de guardado y la versión del esquema.
- Las llaves van por usuario (`glamspaces_cache:<usuario|publico>:…`).
- Si el almacenamiento se llena, la caché se libera y el guardado se intenta una vez más.
- La búsqueda de salones usa stale-while-revalidate: pinta al instante la primera página guardada, la reemplaza cuando responde la API y, si no hay red, deja lo guardado.
- La HU-22 reutiliza este módulo.
- `sesionStorage.cerrarSesion()` borra toda la caché local. Ahí nunca se guardan contraseñas ni tokens.

**Registro y actualización** (`components/AvisoNuevaVersion.js`):

- Solo se registra en web y en producción. Con `expo start` no se registra nada.
- El SW nuevo usa `skipWaiting` y `clients.claim`. Si una pestaña abierta todavía tiene código viejo, aparece el aviso "Hay una versión nueva disponible · Actualizar".
- La app instalada revisa si hay versión nueva cada vez que vuelve al frente.

**Probar y auditar:**

```bash
npm test                      # pruebas de funciones puras (node --test, sin dependencias; requiere Node 22+)
npm run build:web
npx serve dist -l 8081        # 8081: el CORS de la API acepta ese puerto
```

En Chrome, abre DevTools → Application:

- **Service workers**: "activated and is running".
- **Cache Storage**: `glamspaces-app-<versión>` y `glamspaces-medios`.
- **Local storage**: las llaves `glamspaces_cache:*`.

En Network, prueba con "Offline" y con "Slow 3G" y recarga la búsqueda.

Evidencias en `docs/evidencias-pwa/HU-21.md`.

**Límites conocidos:**

- No se probó en un teléfono real (Android/iOS) ni en Safari. iOS no muestra el aviso de instalación; ahí se instala con "Agregar a inicio".
- Las fotos de otros dominios se guardan como respuestas "opaque". El SW no ve si eran un error, pero las revalida en cada visita.
- La caché local guarda solo la primera página de cada búsqueda. "Cargar más" necesita red.

### HU-22 · Modo sin conexión del panel del administrador

- **Servicios con respaldo:** `listarSalonesDeAdminConRespaldo`, `listarSolicitudesDeSalonConRespaldo` y `obtenerDisponibilidadConRespaldo` regresan `{ datos, desactualizado, guardadoEn }`.
  - Con conexión, piden a la API y guardan la respuesta.
  - Si la red falla (`ApiError` tipo `"red"`) o `navigator.onLine` es `false`, regresan lo último guardado marcado como desactualizado.
  - Las llaves van por admin y por salón, mes o estado: `glamspaces_cache:<adminId>:solicitudes:<salonId>:<estado>`.
  - Los errores de negocio o HTTP no se tapan con la caché.
  - Las versiones originales (y la pantalla del cliente) no cambiaron.
- **Banner:** sin conexión, el panel muestra "Modo sin conexión · mostrando la última información guardada (actualizado: <fecha y hora>)", con `aria-live`.
- **Acciones:** "Aceptar" y "Rechazar" se deshabilitan y el banner explica por qué.
- **Sin nada guardado:** si un salón o un mes no tiene datos guardados, aparece "sin datos guardados".
- **Reconexión:** `utils/useConexion.js` escucha `online`/`offline`; al volver la conexión, el panel y el calendario se recargan solos.
- **Privacidad:** cerrar sesión borra toda la caché. Nunca se guardan contraseñas ni tokens.
- **Evidencias:** `docs/evidencias-pwa/HU-22.md`.

### HU-07 (fotos): subida real de imágenes

En "Mi salón" (panel del administrador) está la sección **Fotos del salón**, con el diseño de Figma Admin 05:

- **Escritorio:** mosaicos de hasta 165 px (de 2 a 4 por fila) y un mosaico "+" punteado.
- **Móvil:** 2 por fila y un botón "+ Agregar foto" punteado.

**Salón:** con los chips "Salón nuevo" o uno de tus salones se elige de qué salón son las fotos. Todavía no existe una pantalla de editar salón.

- **Salón existente:** las fotos salen de `obtener → fotosDetalle`. Subir y eliminar se hacen al momento.
- **Salón nuevo:** las fotos quedan pendientes y se suben después de publicar, cuando ya existe el `salonId`. Las que fallen se quedan con **Reintentar** en el chip de ese salón.

**Validación en el cliente** (`services/fotos.logica.js`, la misma regla que la API):

- Tipo real por magic bytes: JPG, PNG o WEBP.
- 5 MB como máximo.
- 8 fotos como máximo, contando las que ya tiene el salón.

**Cada foto** muestra vista previa, "Subiendo N %", su error y **Reintentar**. Para eliminar pide confirmación. Si el archivo es una foto vieja con URL externa rota, la API borra solo el registro.

**Servicios:**

- `subirFoto(adminId, salonId, archivo, onProgreso)` manda `multipart/form-data` con `salonId`, `adminId` y `archivo`. Usa `postFormulario` en `api.js`, que usa XMLHttpRequest para reportar el progreso y **no** pone Content-Type, porque el navegador agrega el boundary.
- `eliminarFoto(adminId, salonId, fotoId)` manda JSON.

**Mensajes de error:** cada código (2001, 2002, 2005–2009, 5000) tiene su mensaje en español, y cualquier otro da uno genérico.

**Mostrar:** las fotos se muestran con su URL pública, que el service worker cachea con stale-while-revalidate. Si una foto da 404, `components/FotoSalon.js` muestra el espacio de la maqueta con la inicial del salón. Lo usan las tarjetas, el detalle y "Mi salón".

**Sin conexión (HU-22):** aparece el mismo aviso, ahora en `screens/PanelAdministrador/BannerSinConexion.js`. Subir y eliminar se deshabilitan. Nada se encola.

**Evidencias:** `docs/evidencias-pwa/HU-07-fotos.md`.

### Galería, detalle y reserva como la maqueta (mejora de HU-07 fotos y HU-16)

Ajustes de pantallas que ya existían para seguir el Figma PROYECTO--PWA (detalle de escritorio,
"Cliente 04 · Solicitar reservación" y "Cliente 05 · Confirmar datos de contacto"). No son HUs nuevas.

**A. Carrusel en la tarjeta de búsqueda** (`components/TarjetaSalon.js`, `useCarrusel.js`, `carrusel.logica.js`)

- Solo con mouse (`(hover: hover) and (pointer: fine)`): al pasar el mouse la foto se desliza por
  `fotosPreview` (hasta 5, campo nuevo de buscar/listar del back). Avanza sola cada 1.5 s, con puntos
  abajo y flechas ‹ ›. Al salir el mouse regresa a la primera.
- Carga diferida: al pintar la lista solo se pide la foto principal; en el primer hover se pide la
  siguiente y, al avanzar, siempre solo la que sigue.
- Las flechas son hermanas del botón de la tarjeta (no anidadas): no abren el detalle. Con Tab, el foco
  en la tarjeta muestra las flechas y se llega a ellas.
- `prefers-reduced-motion`: no avanza sola, solo con flechas.
- Sin `fotosPreview` (el back aún no lo manda) o con 0–1 foto: la tarjeta queda como antes, con
  `fotoPrincipal` o la inicial. En táctil y sin conexión tampoco hay carrusel (no se piden fotos nuevas).

**B. Detalle del salón** (`screens/DetalleSalon/`)

- Escritorio (≥ 1024 px), dos columnas. Izquierda: galería (foto grande con flechas y contador, 4
  miniaturas; la última con "+N" si hay más), nombre, zona, chip de capacidad, pestañas Información /
  Paquetes / Disponibilidad (llevan a su sección), descripción, paquetes seleccionables y calendario.
  Derecha: tarjeta fija (sticky) con "Desde $X", Fecha, Paquete, Invitados y "Solicitar reservación".
- Móvil y tablet: una columna y barra fija abajo con "Desde $X" y el botón (no hay frames móviles).
- Deslizar el dedo sobre la foto grande cambia de foto. Lo elegido (fecha, paquete, invitados) pasa
  ya llenado a la reserva.

**C. Reserva en dos pasos** (`screens/SolicitudReservacion/`)

1. **Cliente 04** (`PasoElegir.js`): resumen del salón; 1. calendario (semana desde domingo, ocupados en
   rojo; no se elige fecha pasada ni ocupada); 2. paquetes en radio (opcional si el salón no tiene);
   3. tipo de evento, invitados, teléfono y comentarios. A la derecha (abajo en móvil) el Resumen con el
   total estimado y "Continuar", deshabilitado hasta que todo sea válido y con el aviso "Falta completar: …".
2. **Cliente 05** (`PasoConfirmar.js`): resumen de la solicitud, datos de contacto prellenados de la
   sesión (nombre, teléfono, correo), términos y "Enviar solicitud".
3. Al enviar: confirmación con el estado y el botón "Ver mis solicitudes".

- Lo elegido viaja en los parámetros de la pantalla (`borrador`): se conserva con Atrás/Adelante del
  navegador, al recargar y al iniciar sesión a la mitad (el login regresa al paso 2).
- **Se envía solo lo que guarda la API** (`services/solicitudes.logica.js`): `clienteId` (de la sesión,
  con el TODO hasta que haya JWT), `salonId`, `paqueteId`, `fechaEvento`, `tipoEvento`, `numeroInvitados`,
  `telefonoContacto` (solo dígitos) y `comentarios`. **Nombre y correo se muestran y validan, pero no se
  envían:** la API toma el nombre de la cuenta y no guarda el correo.
- La API exige `tipoEvento` y la maqueta no lo trae: se agregó el selector "Tipo de evento" en el paso 3
  (sugerencias de un toque o texto libre).
- Validaciones (`solicitudReservacion.validaciones.js`), con el mensaje bajo cada campo (aria-live):
  fecha requerida, futura y disponible; invitados entero > 0 y ≤ capacidad; teléfono de 10 dígitos;
  comentarios ≤ 500; nombre requerido; correo con formato válido; términos aceptados.
- Errores de la API: 4002 → "Esa fecha se acaba de ocupar" + **Elegir otra fecha**; 4004 → "Ya tienes
  una solicitud pendiente…" + **Ver mis solicitudes**; 3001 → elegir otro paquete; 1005/4003 →
  iniciar sesión con una cuenta de cliente; 2001 → el salón ya no está disponible; 1001 → el mensaje de
  la API (si es de fecha, también "Elegir otra fecha").
- Sin conexión (HU-22): "Enviar solicitud" queda deshabilitado con el aviso de modo sin conexión; no
  se guarda ni se encola ningún POST.

**Desviaciones de la maqueta:**

- Amenidades, dirección detallada y los chips "Jardín al aire libre" / "Estacionamiento propio" no
  existen en la API: se omitieron. Solo queda el chip de capacidad.
- Las pestañas no ocultan contenido: llevan a cada sección, porque en la maqueta las tres se ven seguidas.
- Precios en texto chico: `COLORES.doradoTexto` (#8a6508) en lugar del dorado #c9a15a, que sobre blanco
  da 2.4:1 y no pasa AA. El dorado sigue en fondos y bordes.
- Invitados en móvil se capturan en el paso 1 (la barra inferior solo lleva precio y botón).

**Pruebas:** `node --test` (59): carrusel (índices, límites, sin fotos, precarga, "+N", deslizar),
cada validación y sus límites, armado del envío y mapeo de errores. De punta a punta en Chrome contra la
API **local** con LocalDB (66 comprobaciones, incluidas axe WCAG AA y 1440/1024/768/390/320 px y
horizontal sin scroll horizontal). Detalle en `docs/evidencias-pwa/Galeria-reserva.md`.

### Navegación, Perfil y solicitudes (ajuste de usabilidad, HU-19 / navegación)

No es una HU nueva: es un ajuste de usabilidad y de fidelidad al diseño (Figma PROYECTO--PWA, Cliente 01/02/06 y Admin 02/03).

- **Barra superior fija** (`components/BarraNavegacion.js`, reemplaza a `EncabezadoCliente`). Accesos por rol (`components/navegacion.logica.js`), acceso activo con `aria-current`, landmark `<nav>` y menú de usuario con Cerrar sesión.
  - Desde 768 px los enlaces se ven en la barra.
  - En el teléfono hay menú hamburguesa (44 px) con los mismos accesos.
  - El panel del admin conserva su barra lateral y sus pestañas de la maqueta.
- **Perfil:** dos columnas en escritorio; una columna con la barra inferior en el teléfono.
- **Solicitudes del admin:**
  - Lista con filtros por estado, orden y "Ver más".
  - Detalle (`components/DetalleSolicitud.js`) con el salón (galería, descripción y "Ver salón") y Aceptar/Rechazar con confirmación.
  - "Mis solicitudes" del cliente usa el mismo detalle sin acciones.
- **Evidencias:** `docs/evidencias-pwa/navegacion/Navegacion-Perfil-Solicitudes.md`, con capturas antes y después y la lista de desviaciones.

### Mis salones: gestión de los salones del administrador (mejora de HU-07 / HU-08)

No es una HU nueva: "Mi salón" (una sola pantalla de publicar) se convirtió en la **gestión de
todos los salones** del administrador. Pantallas en [`screens/MisSalones/`](screens/MisSalones/).

**Mis salones** (`MisSalonesScreen.js`)

- Una ficha por salón: foto principal (o el marcador "Sin fotos todavía"), nombre, zona,
  capacidad, estado (Publicado / Borrador), paquetes y fotos, con **Editar**, **Ver salón** y
  **Eliminar**, más **+ Nuevo salón**.
- Rejilla responsiva: 3 columnas en escritorio, 2 en tableta y 1 en teléfono, con "Ver más"
  cada 9 salones.
- Estado vacío que invita a crear el primero.

**Editar salón** (`EditarSalonScreen.js`, también crea)

- Al abrirla carga el salón con `obtener` y **muestra todo lo que ya tiene**: nombre, ubicación,
  capacidad, descripción, estado, fotos y paquetes, todo editable.
- Los paquetes se agregan, se editan y se quitan; las fotos usan la sección de la HU-07.
- Guardar cambios, Cancelar y, al final, una **zona de peligro** con Eliminar salón.
- Validación por campo con el mensaje en español debajo (`editarSalon.validaciones.js`).

**El bug del nombre prellenado con el correo**

El campo "Nombre del salón" aparecía con el correo del usuario: si la cuenta no tenía
`nombre_salon`, se caía al `nombre` del usuario, y en varias cuentas ese nombre es el propio
correo. Ahora [`services/sesion.logica.js`](services/sesion.logica.js) solo sugiere el nombre
cuando de verdad es un nombre de negocio (nunca algo con `@`); al crear, el campo nace vacío.
La barra del panel usa la misma regla.

**Ubicación asistida** (`CampoUbicacion.js`, `useUbicacion.js`, `services/ubicacion.logica.js`)

- **Código postal** (5 dígitos) → `api.zippopotam.us/mx/{cp}`: lista las colonias para elegir.
- **Texto libre** → Nominatim de OpenStreetMap, con **600 ms** de espera desde la última tecla y
  **máximo 1 petición por segundo**; la consulta anterior se cancela.
- Solo se consulta **al escribir o al elegir**, nunca al abrir la pantalla.
- La zona se guarda como `Colonia, Municipio, Estado, CP 00000`, recortada a los **200 caracteres**
  de `Salones.Zona` sin cortar palabras, para que la búsqueda por zona (HU-09) siga funcionando.
- Se muestra la atribución **© OpenStreetMap contributors**, como pide su licencia.
- Si fallan o no hay conexión, el campo se escribe a mano y **nunca** bloquea guardar.
- El service worker **no cachea** esas llamadas (probado en `serviceWorker.test.js`).

**Confirmación en todo lo que escribe** ([`components/DialogoConfirmacion.js`](components/DialogoConfirmacion.js))

Guardar, eliminar salón, eliminar paquete, eliminar foto, cambiar entre publicado y borrador y
salir con cambios sin guardar. El diálogo es `role="dialog"` con `aria-modal`, atrapa el foco
(Tab y Shift+Tab giran), cierra con **Escape**, devuelve el foco a donde estaba y sus botones
dicen lo que hacen ("Eliminar salón", no "Aceptar"). Después de cada acción hay un aviso de
éxito o de error.

**Errores del back**

Si la API manda `mensaje`, se muestra **tal cual**. Códigos: 2001 no existe, 2002 no es el dueño,
2003 publicar sin paquetes, **2010 tiene solicitudes pendientes o confirmadas** (el salón **no**
se elimina) y 5000.

**Sin conexión (HU-22):** la lista se ve desde la caché con su aviso y crear, editar, eliminar y
subir o borrar fotos quedan deshabilitados con el motivo. No se encola ningún POST.

**Evidencias:** [`docs/evidencias-pwa/mis-salones/`](docs/evidencias-pwa/mis-salones/) — probado
contra la **API local** (LocalDB con M012 y Azurite), con capturas a 1440, 1024, 768, 390, 320 px
y 844×390, y la lista de desviaciones de la maqueta.

## Calidad y cobertura (SonarQube Cloud)

Proyecto [`4DRIAN-G4RCI4_GlamSpace-Front`](https://sonarcloud.io/project/overview?id=4DRIAN-G4RCI4_GlamSpace-Front)
(organización `4drian-g4rci4`). El análisis corre en GitHub Actions con
[`.github/workflows/sonar.yml`](.github/workflows/sonar.yml) en cada push a `develop`, `release` y `main`
y en cada PR; la configuración vive en [`sonar-project.properties`](sonar-project.properties).

### Pruebas y cobertura

| Comando | Qué hace |
|---|---|
| `npm test` | Corre las pruebas de `scripts/pruebas/` (necesita Node 22 o más). |
| `npm run test:cobertura` | Las mismas pruebas midiendo cobertura; escribe `coverage/lcov.info` para Sonar. |

La cobertura la genera el propio Node (`node --test --experimental-test-coverage` con reporter `lcov`,
ver [`scripts/cobertura.js`](scripts/cobertura.js)); no hay Jest ni otra dependencia de pruebas.
`coverage/` no se versiona.

Las pruebas importan los módulos de la app, que a su vez importan sin extensión (`"../../utils/validadores"`)
porque Metro la agrega sola. Node con módulos ES sí la exige, así que las pruebas se corren con
[`scripts/pruebas/resolverExpo.mjs`](scripts/pruebas/resolverExpo.mjs), que resuelve esas rutas igual que
Metro. **El código de la app no se modificó para poder probarlo.**

### Qué se mide y qué no (`sonar.coverage.exclusions`)

Se mide **toda la lógica de negocio**: `*.validaciones.js`, `*.logica.js`, `services/` y `utils/`.

Quedan fuera de la medición de cobertura las capas de **presentación**, porque no tienen reglas de negocio
que una prueba unitaria pueda afirmar (son JSX de React Native Web, hojas de estilo y tokens del diseño);
medirlas obligaría a montar un render de React que no aporta a la calidad del código y solo diluiría el
porcentaje:

| Qué se excluye | Por qué |
|---|---|
| `App.js` | Arranque de la app: registra el service worker y arma la navegación. |
| `components/*.js` y `screens/**/*Screen.js` y los componentes de pantalla | Componentes de React Native Web: solo pintan lo que el hook les entrega. |
| `**/*.styles.js` y `theme/**` | Hojas de estilo y tokens del diseño: no tienen lógica. |
| `**/use*.js` | Hooks de React: estado y efectos. La lógica que contenían vive en los `*.logica.js`, que sí se miden. |
| `scripts/sw.base.js` | Cuerpo del service worker: corre en el navegador, con `caches` y `fetch`. Su estrategia (`scripts/swEstrategia.js`) sí se prueba. |
| `scripts/cobertura.js` | Utilería de build: es el script que *genera* el reporte de cobertura; medirlo sería medirse a sí mismo. La lógica de build que sí se prueba está en `posexport.js` y `swEstrategia.js`. |

Estas capas **sí se verifican**, pero con pruebas en el navegador real (Chrome contra la API local,
incluidas axe WCAG AA y los cortes de 1440/1024/768/390/320 px): la evidencia de cada trabajo está en
[`docs/evidencias-pwa/`](docs/evidencias-pwa/). No se excluye ninguna lógica de negocio.

## Pendiente

- **`fotosPreview` en producción:** el carrusel ya lo usa; mientras el back no lo publique, las tarjetas
  muestran solo la foto principal.
