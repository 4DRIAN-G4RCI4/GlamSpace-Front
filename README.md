# GlamSpaces · Frontend (React Native + Expo → PWA)

Frontend del equipo G3. Un solo código en React Native (Expo) que se compila a web
con `react-native-web` y se publica como sitio estático en Azure.

## Estructura

```
App.js                              Router manual entre pantallas
components/                         Piezas visuales reutilizables
  Campo.js · Campo.styles.js          Input con etiqueta, error, pista y mostrar/ocultar contraseña
  Marca.js · Marca.styles.js          Logo + nombre de GlamSpaces
theme/
  colores.js                        Paleta única
  estilosComunes.js                 Estilos que se repiten (tarjeta, botones, mensajes...)
utils/
  validadores.js                    Correo, URL, número, longitud mínima de contraseña
  validarCuenta.js                  Reglas comunes de cliente y administrador
services/                           Todo lo que habla con la API o el dispositivo
  api.js                              URL base (EXPO_PUBLIC_API_URL), postJson, mensajes de error
  usuariosApi.js                      Registro y login (HU-02, HU-03, HU-04)
  salonesApi.js                       Crear salón y paquetes (HU-06 → usado por HU-07)
  sesionStorage.js                    Sesión activa en el dispositivo
screens/                            Una carpeta por pantalla, cada una dividida en 4 partes
  <Pantalla>/<Pantalla>Screen.js      Módulo visual (solo JSX)
  <Pantalla>/<Pantalla>.styles.js     Estilos
  <Pantalla>/use<Pantalla>.js         Lógica: estado y acciones (el "script")
  <Pantalla>/<pantalla>.validaciones.js  Reglas de validación
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

## Publicar un salón (HU-07 ↔ API de HU-06)

La API no publica al crear, así que el botón **Publicar** hace 3 llamadas seguidas
(`services/salonesApi.js`):

1. `POST /api/salones` → crea el salón como `no_publicado`.
2. `POST /api/salones/{id}/paquetes` → uno por cada paquete.
3. `PUT /api/salones/{id}` con `estado: "publicado"` → exige al menos un paquete.

- Mientras no haya JWT, el `adminId` (el `id` que regresa el login) va en el body.
  La sesión lo guarda; si alguien tiene una sesión vieja sin `id`, se le pide volver a entrar.
- El `PUT` reemplaza todo: siempre se mandan todos los campos (si no, se borra la descripción).
- Si falla a medias (por ejemplo, el salón se creó pero un paquete no), el reintento
  continúa donde se quedó y no duplica nada.
- Los errores de reglas de negocio vienen en `{ "mensaje": "..." }` y se muestran tal cual.

## Pendiente

- **Fotos:** la HU-07 las pide, pero la API de HU-06 todavía no las recibe al crear ni
  al actualizar (solo las devuelve en el detalle). El formulario no las incluye hasta que
  exista el endpoint.
