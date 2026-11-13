# Navegación, Perfil y solicitudes — evidencias

Es un ajuste de usabilidad y de fidelidad al diseño (HU-19 / navegación), no una HU nueva. El diseño sigue el Figma PROYECTO--PWA:

- **Cliente 01, 02 y 06:** barra superior.
- **Admin 02:** lista de solicitudes.
- **Admin 03:** detalle de una solicitud.
- **Cliente 06 (móvil):** barra inferior.

## Qué cambió

**A · Barra superior fija** (`components/BarraNavegacion.js`)

- **Dónde va:** cada pantalla la pone fuera de su área con scroll, así no se pierde, no tapa contenido ni se encima con la tarjeta fija del detalle o los avisos.
- **Accesibilidad:** es un landmark `<nav>`, con `aria-current` en el acceso activo, foco visible y teclado (Esc cierra los menús).
- **Escritorio y tablet (768 px o más):**
  - Enlaces visibles según el rol:
    - Cliente: Buscar salones y Mis solicitudes.
    - Admin: además, Solicitudes y Mi salón.
  - Avatar con menú de usuario (Mi perfil y Cerrar sesión). Sin sesión: Iniciar sesión y Registra tu salón.
  - Sin hamburguesa.
- **Teléfono (menos de 768 px):** solo marca y hamburguesa de 44 px. El panel trae los mismos accesos (opciones de 48 px) y Cerrar sesión. Al abrir, el foco pasa a la primera opción.
- **Reemplaza a `EncabezadoCliente`.** Las migas de pan del detalle y de la reserva quedan en un renglón debajo.
- **Panel del admin:** conserva la navegación de su maqueta (barra lateral en escritorio y pestañas en móvil). Ver "Desviaciones".
- **Aviso de versión nueva:** en el teléfono se muestra arriba de las barras fijas de abajo.

**B · Perfil:**

- **Escritorio:** dos columnas. A la izquierda, identidad y Cerrar sesión; a la derecha, "Mi cuenta" y "Accesos" lado a lado.
- **Tablet:** la identidad arriba y las dos tarjetas lado a lado.
- **Teléfono:** una columna y la barra inferior Buscar · Solicitudes · Perfil, de 48 px.
- **Lo que se quitó:** el título "Mi perfil" con hamburguesa en escritorio y el menú lateral.
- **Datos:** solo los que trae la sesión.

**C · Solicitudes del admin:**

- **Lista** (`ListaSolicitudes.js`):
  - Filtros por estado con su conteo; empieza en Pendientes si hay alguna.
  - Orden por fecha del evento o por las más recientes.
  - Tarjetas con cliente, fecha, tipo, invitados, paquete, salón y etiqueta de estado.
  - "Ver más" de 10 en 10.
  - Dos columnas en escritorio ancho.
- **Detalle** (`components/DetalleSolicitud.js`, Admin 03):
  - "Solicitud #N" con su estado y la fecha en que llegó.
  - Detalle del evento: fecha, paquete con precio, invitados, tipo y fecha de solicitud.
  - Comentarios y Datos del cliente (nombre y teléfono).
  - Tarjeta del **salón**: galería con placeholder si una foto da 404 o no hay fotos, nombre, zona, capacidad, descripción y botón "Ver salón".
- **De dónde sale el salón:** `obtenerSalon` con la caché local de HU-22 (`obtenerSalonConRespaldo`). No hay endpoints nuevos.
- **Acciones en el detalle:** Aceptar y Rechazar con confirmación y sus errores. Sin conexión quedan deshabilitadas con el aviso de HU-22.
- **Ruta del detalle:** se abre con `{ solicitudId, salonId }`, así Atrás del navegador regresa a la lista y un enlace directo o una recarga abren el salón correcto.
- **"Mis solicitudes" (cliente):** reutiliza el mismo detalle, sin acciones ni datos de admin, con su teléfono de contacto.

**Contraste:** la etiqueta "Confirmada" tenía 4.09:1. `COLORES.confirmadaTexto` se oscureció a `#446e53` (4.82:1), con el mismo criterio que ya usaba `pendienteTexto`.

## Cómo se probó

- **Pruebas de lógica** (`node --test`): **71 de 71** (`pruebas_node.txt`). Cubren accesos por rol, acceso activo, el corte de 768 px, iniciales, conteo, filtro, orden, paginación y fecha de creación en UTC.
- **Pruebas en navegador:** Chrome contra la **API local con LocalDB**, nunca producción, con datos de prueba marcados E2E-NAV que se borraron al final. **16 de 16** (`pruebas_navegador.txt`):
  - Barra: landmark, acceso activo, fija al hacer scroll y foco visible.
  - Hamburguesa a 390 y 320 px: botón de 44 px, mismos accesos, opciones de 48 px, foco en la primera y Esc cierra.
  - **Sin scroll horizontal** en 5 pantallas × 6 tamaños: 320, 390, 768, 1024, 1440 y 844×390.
  - Perfil en escritorio (dos columnas) y en teléfono (barra inferior de 48 px).
  - Lista: filtros, "Ver más" y Confirmadas.
  - Detalle de admin: secciones, galería y placeholder de una foto rota.
  - Sin conexión: acciones deshabilitadas.
  - Aceptar con confirmación.
  - Atrás del navegador regresa a la lista, y "Ver salón" abre el detalle del salón.
  - Detalle del cliente sin acciones.
  - Cerrar sesión desde el menú de usuario borra la sesión y la caché.
  - Errores de JavaScript: ninguno.

**Capturas** antes y después a 1440×900, 1024×768, 768×1024, 390×844, 320×640 y 844×390:

| Captura | Antes | Después |
|---|---|---|
| `*_navbar_*` | ✓ | ✓ |
| `*_perfil_*` | ✓ | ✓ |
| `*_lista_solicitudes_*` | ✓ | ✓ |
| `*_menu_movil_*` (390 y 320) | ✓ | ✓ |
| `despues_detalle_solicitud_*` | — | ✓ |
| `despues_detalle_cliente_*` | — | ✓ |

Además, después: `despues_detalle_placeholder`, `despues_detalle_sin_conexion` y `despues_detalle_confirmar`.

## Desviaciones de la maqueta

- **Panel del admin:** conserva la barra lateral (escritorio) y el encabezado con pestañas (móvil) de Admin 02 a 05, en lugar de la barra superior. Es su navegación en la maqueta y ya muestra sus accesos sin hamburguesa. En las pantallas de cliente, el admin ve la barra superior con Solicitudes y Mi salón.
- **Datos del cliente (Admin 03):** la maqueta muestra el **correo del cliente**, pero `listarPorSalon` no lo regresa. Se muestran nombre y teléfono, sin pedir cambios al back.
- **Botones de Aceptar/Rechazar en móvil:** van al final del detalle, no fijos abajo como en la maqueta, para no encimarse con otras barras fijas.
- **Quick actions en la lista:** las acciones pasaron de la lista al detalle, como en Admin 03. La lista solo abre el detalle.

## Qué NO se verificó

- Teléfono real, iOS/Safari y la app instalada.
- Lectores de pantalla reales: se revisaron roles, `aria-current` y `aria-expanded`, pero no con NVDA ni VoiceOver.
- `prefers-reduced-motion`: la barra y los menús no tienen animaciones (se quitó el menú lateral animado del Perfil), así que no hay nada que reducir. No se probó con esa preferencia activa.
