# Ronda de experiencia del Sprint 7 — evidencia

Ajustes de usabilidad sobre lo que ya existía: paginación en las listas, botón "← Regresar",
la pantalla vieja de un solo salón fuera, invitación a ser administrador y las pantallas de
acceso con un solo diseño.

**Fecha:** 2026-11-13 · **Rama:** `Sprint7_Adrian_ExperienciaFront`

Todo se probó contra la **API local** (`http://localhost:5080`, LocalDB con las migraciones hasta
M012 y Azurite), con el build servido en `npx serve dist -l 8081`. **No se escribió nada en
producción.** Para ver la paginación con datos suficientes se insertaron 24 solicitudes de prueba
**solo en LocalDB**.

---

## 1 · Panel de solicitudes del administrador

- Tarjetas a **dos columnas** desde 700 px de ancho de contenido; una sola en teléfono.
- **10 por página** (2 × 5) con Anterior / Siguiente y números.
- Los filtros (Todas / Pendientes / Confirmadas / Rechazadas) y el orden se conservan y
  **vuelven a la página 1** al cambiar.
- Los contadores son **del total**, no de la página.

Verificado con 28 solicitudes: `Todas (28) · Pendientes (9) · Confirmadas (9) · Rechazadas (10)`
y "Mostrando 1–10 de 28 solicitudes" con páginas 1-2-3. Las tarjetas quedan en x=308 y x=849
(dos columnas reales).

> **Se corrigió durante la prueba:** el ancho se calculaba en píxeles (`(ancho - 14) / 2`) y por
> unos pocos píxeles las dos tarjetas no cabían en la fila. Ahora es `calc(50% - 7px)`.

Capturas: `panel-admin-1440.png`, `panel-admin-768.png`, `panel-admin-320.png`.

## 2 · Fuera la pantalla vieja de "Mi salón"

- Se **borraron** `PublicarSalonScreen.js`, `usePublicarSalon.js` y `PublicarSalon.styles.js`.
  Se conservan `SeccionFotos`, `useFotosSalon` y `publicarSalon.validaciones` porque los usa
  "Editar salón".
- Todos los accesos van a **"Mis salones"**: la barra superior, el menú lateral y, en el Perfil,
  la fila ahora dice **"Mis salones y fotos"**.
- La ruta vieja ya no existe en el router: al forzarla por el historial, la app cae al inicio
  (verificado) y no aparecen las pestañas viejas "Salón nuevo | correo".
- **Pie del menú lateral:** ahora muestra el nombre real del administrador y "Administrador".
  Verificado: `AJ · Adrian García Jiménez · Administrador` (antes salía "Mis salones" o "G").

## 3 · Botón "← Regresar"

- `components/BotonRegresar.js` + `navigation.regresar` en `App.js`.
- Usa el **historial del navegador**, así que hace lo mismo que el botón Atrás y no lo rompe.
  Si se entró directo por la URL, va a la pantalla de respaldo de `navegacion.logica.js`:
  nunca a una pantalla en blanco ni al login desde una pantalla con sesión.
- Sale en las pantallas internas de cliente (por la barra de navegación), en "Mis salones",
  "Editar salón" y en las pantallas de acceso.
- 44 px de alto y foco visible.

## 4 · Mis solicitudes del cliente

- Tarjetas a **dos columnas** (una en teléfono) con la **foto del salón** y su marcador cuando
  no hay foto o la URL falla.
- **Filtros iguales a los del administrador**, con contadores del total, y **10 por página**.

Verificado con 25 solicitudes: `Todas (25) · Pendientes (8) · Confirmadas (9) · Rechazadas (8)`
y "Mostrando 1–10 de 25 solicitudes".

> **Se corrigió durante la prueba:** la tarjeta mostraba `Evento: undefined` porque al normalizar
> la solicitud se perdían campos de la API. Ahora conserva todo (`tipoEvento`, teléfono,
> comentarios) y muestra "XV años · 55 invitados". Queda fijado con una prueba.

Capturas: `mis-solicitudes-1440.png`, `-1024.png`, `-390.png`, `-320.png`.

## 5 · "Cargar más" y paginación en las listas de salones

- Rejilla de **3 columnas** en escritorio, **18 por página** (6 filas).
- **"Cargar más salones"** agrega **6** (2 filas) sin cambiar de página.
- Debajo, paginación de 18 en 18 con Anterior / Siguiente, números y el total.
- Usa la **paginación real del back**: se piden bloques de 6 (`pagina`/`tamanoPagina`), tres
  bloques forman la página de 18. Al cambiar de página se reinicia lo cargado de más.

Verificado con **1,422 salones** reales:
`Mostrando 1–18` → Cargar más → `1–24` → `1–30`; página 2 → `19–36`.

Capturas: `buscar-salones-1440.png`, `buscar-salones-390.png`.

## 6 · Invitación a ser administrador

- Tarjeta "¿Quieres registrar un salón? / Conviértete en administrador" en **Buscar salones** y
  en el **Perfil**, solo para cuentas de **cliente**.
- Verificado: con sesión de cliente **sí** aparece; con sesión de administrador **no**.
- El botón lleva al registro de administrador (ver el contrato que falta, abajo).

## 7 · Login y registro

- **(a)** "← Ver salones sin iniciar sesión" es ahora un **botón secundario** con borde vino y el
  mismo ancho que el principal (`login-1440.png`).
- **(b)** Los dos registros usan el **mismo diseño de dos paneles** del login
  (`components/LayoutAcceso.js`): panel vino con la marca a la izquierda y el formulario a la
  derecha; en móvil una sola columna (`registro-admin-1440.png`, `registro-admin-390.png`,
  `registro-cliente-1440.png`).
- **(c) El bug del autocompletado.** Ningún formulario de acceso tenía `autoComplete`, así que el
  navegador adivinaba y ofrecía el correo guardado en "Nombre del salón". Verificado en el DOM:

| Campo | autoComplete |
|---|---|
| Nombre completo | `name` |
| Correo electrónico | `email` |
| **Nombre del salón** | **`off`** |
| Contraseña (login) | `current-password` |
| Contraseñas (registro) | `new-password` |

## Modo sin conexión (HU-22)

Intacto. En "Mis salones" sin conexión: aviso "Modo sin conexión", el motivo
("Para crear, editar o eliminar salones necesitas conexión.") y **deshabilitados** "+ Nuevo salón"
y los botones "Eliminar". La lista se sigue viendo desde la caché. No se cachea ningún POST.

Captura: `mis-salones-sin-conexion-1440.png`.

## Responsivo

| Ancho | Scroll horizontal |
|---|---|
| 1440 | no |
| 1024 | no |
| 768 | no |
| 390 | no |
| 320 | no |
| 844×390 (horizontal) | no |

## Pruebas automáticas

`npm test` → **244 en verde** (antes 243 al retomar; 199 al empezar la ronda).

| Archivo | Qué cubre |
|---|---|
| `scripts/pruebas/paginacion.test.mjs` (20) | Tamaños, cortes de página, números con "…", textos del rango y "Cargar más" |
| `scripts/pruebas/experiencia.test.mjs` (25) | Filtros y contadores del cliente, tarjeta con y sin foto, invitación por rol y a dónde regresa cada pantalla |

---

## Contratos del back

1. **Foto en las solicitudes del cliente: ya resuelto.** Cuando se escribió esta evidencia,
   `POST /api/solicitudes/listar` no mandaba la foto. El back la agregó (`fotoPrincipal`,
   string o null, en `listar` y en `listarPorSalon`), así que la tarjeta la usa directo: una sola
   llamada trae todo y **no** se pide el salón de cada solicitud (nada de N+1). Si el salón no
   tiene fotos, o la URL falla, se sigue pintando el marcador.
2. **Convertir una cuenta de cliente en administrador: pendiente de conectar.** El back ya publicó
   `POST /api/usuarios/convertirAAdministrador`, pero el front **todavía no lo usa**: la invitación
   sigue llevando al registro de administrador. Queda para una ronda siguiente.

## Desviaciones y lo que no se probó

- **Chips del panel del administrador a 34 px** (menos de los 44 de objetivo táctil): vienen de la
  HU-19 y no se tocaron en esta ronda.
- Los datos de prueba de LocalDB tienen **acentos rotos** (`JardÃ­n`): es la codificación de
  `04_DatosPrueba.sql`, no del front.
- **No se probó** subir fotos ni el detalle de una solicitud: no se modificaron en esta ronda.
