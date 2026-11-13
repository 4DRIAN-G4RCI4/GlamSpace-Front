# Mis salones — evidencia (mejora de HU-07 / HU-08)

Rediseño de "Mi salón" como gestión de **Mis salones**: lista de todos los salones del
administrador, pantalla de editar con los datos ya cargados, ubicación asistida y confirmación
en todas las acciones que escriben.

**Fecha:** 2026-11-13 · **Rama:** `Sprint7_Adrian_MisSalonesFront`

---

## Qué se probó y cómo

Todo contra la **API local** (`http://localhost:5080`, LocalDB `GlamSpacesMigraciones` con las
migraciones hasta **M012** y Azurite para las fotos), con el build servido en
`npx serve dist -l 8081`. **No se escribió nada en producción.**

El back ya traía el contrato nuevo en su rama `Sprint7_Adrian_MisSalonesBack`:
`listar` con `fotoPrincipal` y `totalFotos`, y `POST /api/salones/eliminar` con el código **2010**.

### Flujos verificados en el navegador

| # | Qué | Resultado |
|---|---|---|
| 1 | Lista con los 9 salones del administrador de prueba | Rejilla de 3 columnas, foto o marcador, nombre, zona, estado, resumen y los tres botones |
| 2 | Estado vacío (cuenta sin salones) | "Todavía no tienes salones" + "Crear mi primer salón" |
| 3 | Crear un salón de punta a punta | Se creó el salón 6015 con su zona, capacidad y un paquete (verificado en la BD) |
| 4 | **Editar: todos los datos precargados** | Nombre, zona, capacidad, descripción, estado y el paquete (nombre, descripción y precio) llegan llenos y editables |
| 5 | **Bug del nombre** | Con una cuenta cuyo `nombre` y `nombre_salon` **son el correo**, el campo "Nombre del salón" queda **vacío** al crear. Antes aparecía el correo |
| 6 | Ubicación por **código postal** | `42800` → 5 colonias reales de Tula de Allende; al elegir una, el campo queda "Tula de Allende Centro, Hidalgo, CP 42800" |
| 7 | Ubicación por **dirección** | "Tepeji del Rio centro" → sugerencias de OpenStreetMap con colonia, municipio, estado y CP |
| 8 | Atribución de OpenStreetMap | "© OpenStreetMap contributors" visible junto a las sugerencias |
| 9 | No consulta al abrir | La zona que ya tenía el salón no dispara ninguna petición; solo se busca al escribir |
| 10 | **Eliminar con solicitudes (2010)** | La API contesta 2010, se muestra **su** mensaje ("…solicitudes pendientes o confirmadas; resuélvelas antes de eliminar el salón.") y el salón **no** se elimina |
| 11 | **Eliminar sin solicitudes** | El salón se elimina, se regresa a la lista y queda el estado vacío |
| 12 | Confirmación al guardar | "¿Guardar los cambios?" con el nombre del salón |
| 13 | Confirmación al salir con cambios | "¿Salir sin guardar?"; sin cambios, sale directo (no estorba) |
| 14 | Modo sin conexión | Aviso "Modo sin conexión" + motivo; Publicar, Guardar y Agregar foto deshabilitados. Cancelar sigue activo (no escribe) |

### Accesibilidad del diálogo de confirmación

Medido en el navegador:

- `role="dialog"` con `aria-modal="true"`.
- El foco **entra** al diálogo (al botón principal) y **vuelve** al botón que lo abrió al cerrar.
- **Foco atrapado**: Tab desde el último botón vuelve al primero y Shift+Tab desde el primero va al último.
- **Escape** cierra (igual que Cancelar).
- Los botones dicen lo que hacen: "Guardar cambios", "Eliminar salón", "Pasar a borrador", "Salir sin guardar". Nunca un "Aceptar" suelto.
- Foco visible con anillo dorado; el botón destructivo va en rojo.

### Responsivo

| Ancho | Captura | Resultado |
|---|---|---|
| 1440 | `lista-1440.png` | 3 columnas, sin scroll horizontal |
| 1024 | `lista-1024.png` | 3 columnas, sin scroll horizontal |
| 768 | `lista-768.png` | 2 columnas con el encabezado móvil y sus pestañas |
| 390 | `lista-390.png` | 1 columna |
| 320 | `lista-320.png` | 1 columna, **nada se desborda** y no hay scroll horizontal |
| 844×390 | `lista-844x390-horizontal.png` | Horizontal, sin scroll horizontal |

Objetivos táctiles de 44 px en todos los botones de estas pantallas.

### Capturas

| Archivo | Qué muestra |
|---|---|
| `lista-1440.png` … `lista-320.png` | La lista en cada ancho |
| `lista-844x390-horizontal.png` | Horizontal |
| `editar-1440-datos-precargados.png` | Editar con todo cargado y las sugerencias de ubicación |
| `dialogo-eliminar-salon.png` | Confirmación de borrado (nombre + "no se puede deshacer") |
| `editar-sin-conexion.png` | Modo sin conexión con las acciones deshabilitadas |

---

## Pruebas automáticas

`npm test` → **198 en verde** (antes 131). `npm run test:cobertura` → **98.87 %** de líneas.

| Archivo nuevo | Qué cubre |
|---|---|
| `scripts/pruebas/misSalones.test.mjs` | Fichas, paginación, los 6 diálogos de confirmación, cambios sin guardar, errores del back (incluido 2010) y el modo sin conexión |
| `scripts/pruebas/ubicacion.test.mjs` | CP vs dirección, armado y recorte de la zona, respuestas reales de Zippopotam y Nominatim, privacidad y atribución |
| `scripts/pruebas/sesionNombre.test.mjs` | El bug del nombre: el campo nunca trae el correo |
| `scripts/pruebas/serviceWorker.test.js` | Se agregó: el service worker **no cachea** las dos APIs de ubicación |

Cobertura de la lógica nueva: `misSalones.logica.js` 100 %, `editarSalon.validaciones.js` 100 %,
`sesion.logica.js` 100 %, `ubicacion.logica.js` 100 % de líneas.

---

## Desviaciones de la maqueta

1. **La rejilla de "Mis salones" no existe en Figma.** La maqueta (Admin 05) supone **un solo**
   salón por administrador. La lista se diseñó con los mismos tokens (paleta, radios, espaciado)
   y el mismo estilo de tarjeta que `TarjetaSalon`.
2. **"Mi salón" pasó a llamarse "Mis salones"** en la barra de navegación, porque ahora lleva a la
   lista. La barra lateral del panel conserva el texto "Mi salón" de la maqueta.
3. **La maqueta de Admin 05 tiene "Capacidad mínima" y "Capacidad máxima".** La API solo guarda
   una `Capacidad`, así que se dejó un único campo, como ya estaba en Publicar salón.
4. **Avatar de la barra lateral:** mide 34 px, menos de los 44 px de objetivo táctil. Viene de
   `LayoutAdmin` (HU-19) y se dejó igual para no cambiar el panel ya aprobado.
5. **Datos de prueba con acentos rotos** (`JardÃ­n`): es cómo quedó `04_DatosPrueba.sql` en la BD
   local, no un problema del front.

## Lo que no se probó

- **Subir fotos contra Azurite**: la sección de fotos es la de la HU-07 y no se modificó (solo se
  le agregó la opción de ocultar el selector de salón). No se subieron imágenes nuevas.
- **Producción**: no se escribió nada. Antes del PR a `main` hay que comprobar con una llamada de
  solo lectura que el back nuevo ya está desplegado.
