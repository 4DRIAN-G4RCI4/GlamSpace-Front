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
  TarjetaSalon.js · .styles.js        Tarjeta de un resultado de búsqueda (HU-10)
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
  sesionStorage.js                    Sesión activa en el dispositivo
screens/                            Una carpeta por pantalla, cada una dividida en 4 partes
  <Pantalla>/<Pantalla>Screen.js      Módulo visual (solo JSX)
  <Pantalla>/<Pantalla>.styles.js     Estilos
  <Pantalla>/use<Pantalla>.js         Lógica: estado y acciones (el "script")
  <Pantalla>/<pantalla>.validaciones.js  Reglas de validación
  BusquedaSalones/                  HU-10 · pantalla de inicio
  DetalleSalon/                     HU-13 · detalle, galería y calendario de disponibilidad
  SolicitudReservacion/             HU-16 · formulario de solicitud con la fecha precargada
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

## Pendiente

- **Fotos:** la HU-07 las pide, pero la API de HU-06 todavía no las recibe al crear ni
  al actualizar (solo las devuelve en el detalle). El formulario no las incluye hasta que
  exista el endpoint.
- **Mi salón** (HU-19) abre por ahora la pantalla de Publicar salón; falta una pantalla para editar el salón.
- **Probar la HU-16 contra la API real** con una cuenta de cliente de prueba (los criterios 1, 3 y 4
  se probaron con la API simulada).
