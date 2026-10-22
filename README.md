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
  sesionStorage.js                    Sesión activa en el dispositivo
screens/                            Una carpeta por pantalla, cada una dividida en 4 partes
  <Pantalla>/<Pantalla>Screen.js      Módulo visual (solo JSX)
  <Pantalla>/<Pantalla>.styles.js     Estilos
  <Pantalla>/use<Pantalla>.js         Lógica: estado y acciones (el "script")
  <Pantalla>/<pantalla>.validaciones.js  Reglas de validación
  BusquedaSalones/                  HU-10 · pantalla de inicio
  DetalleSalon/                     HU-13 · detalle, galería y calendario de disponibilidad
  SolicitudReservacion/             Destino de HU-13 con la fecha precargada
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

## Pendiente

- **Fotos:** la HU-07 las pide, pero la API de HU-06 todavía no las recibe al crear ni
  al actualizar (solo las devuelve en el detalle). El formulario no las incluye hasta que
  exista el endpoint.
- **Enviar la solicitud de reservación:** la pantalla ya recibe la fecha y el paquete, pero el
  botón **Enviar** queda deshabilitado hasta que la API tenga el endpoint para crear reservaciones
  (la tabla `Reservaciones` ya existe, HU-11).
