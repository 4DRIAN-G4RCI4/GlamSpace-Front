# Galería, detalle y reserva como la maqueta (mejora de HU-07 fotos y HU-16)

**Qué es:** carrusel al pasar el mouse en la tarjeta de búsqueda (A), detalle del salón en dos
columnas con tarjeta fija (B) y reserva en dos pasos, Cliente 04 y Cliente 05 (C). La descripción
completa está en el README, sección "Galería, detalle y reserva como la maqueta".

**Cómo se probó:** Chrome (puppeteer) contra el back **local** (`dotnet run`, LocalDB
`GlamSpacesMigraciones` creada con `scripts/migraciones.ps1 reset` y `04_DatosPrueba.sql`). Nada en
producción: la prueba aborta cualquier petición a Azure.

- Fotos de prueba: filas de `FotosSalon` solo en LocalDB que apuntan a SVG locales (8 fotos en el
  salón 1, 3 en el 2, 1 en el 5 y una URL rota en el 3).
- `fotosPreview` todavía no existe en el back: la prueba lo agrega a la respuesta real de `buscar`
  local con el contrato acordado (hasta 5, mismo orden que `fotos`). El salón 2 se deja sin el campo para
  probar el respaldo a `fotoPrincipal`.
- Cliente de prueba registrado en LocalDB; el envío crea la solicitud de verdad en LocalDB.
- 4002: antes de enviar se confirma otra solicitud del mismo salón y fecha en LocalDB.

## Resultados

- `galeria_reserva_pruebas.txt`: `node --test`, 59 de 59.
- `galeria_reserva_e2e_local.txt`: 66 de 66 comprobaciones de punta a punta, entre ellas:
  - carga diferida de fotos, avance cada 1.5 s, flechas sin abrir el detalle, teclado y `prefers-reduced-motion`;
  - galería con "+N", tarjeta fija al hacer scroll y lo elegido llega a la reserva;
  - "Continuar" y "Enviar" deshabilitados hasta que todo es válido, con mensaje bajo cada campo;
  - Atrás conserva lo elegido; el login regresa al paso 2 con nombre y correo de la sesión;
  - sin conexión: envío deshabilitado con el aviso;
  - 4002 y 4004 con su mensaje y siguiente paso; la solicitud guardada solo trae los campos de la API;
  - axe WCAG 2 AA sin problemas serios en búsqueda, detalle, paso 1 y paso 2;
  - sin scroll horizontal a 1440, 1024, 768, 390, 320 y 844×390, y barra inferior de 46 px en móvil.

## Capturas

| Pantalla | Archivos |
|---|---|
| Carrusel al pasar el mouse | `galeria_reserva_carrusel_hover_1440.png` |
| Detalle | `galeria_reserva_detalle_1440.png`, `galeria_reserva_detalle_calendario_1440.png`, `galeria_reserva_detalle_<ancho>x<alto>.png` |
| Paso 1 · Cliente 04 | `galeria_reserva_reserva_paso1_1440.png`, `galeria_reserva_reserva_errores_1440.png`, `galeria_reserva_reserva_<ancho>x<alto>.png` |
| Paso 2 · Cliente 05 | `galeria_reserva_confirmar_1440.png`, `galeria_reserva_confirmar_sin_conexion_1440.png`, `galeria_reserva_confirmar_error_4002_1440.png`, `galeria_reserva_confirmar_<ancho>x<alto>.png` |
| Enviada | `galeria_reserva_enviada_1440.png` |
| Búsqueda | `galeria_reserva_busqueda_<ancho>x<alto>.png` |

Tamaños: 1440×900, 1024×768, 768×1024, 390×844, 320×640 y horizontal 844×390.

## Lo que no se probó

- Teléfono real (Android/iOS) ni Safari: solo Chrome de escritorio con emulación de tamaños.
- `fotosPreview` real del back: se simuló con su contrato hasta que Alexis lo publique.
