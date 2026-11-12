# HU-07 (fotos): subida real de imágenes — evidencias del front

**Dónde:** en "Mi salón" (panel del administrador) está la sección **"Fotos del salón"**, con el diseño de Figma PROYECTO--PWA, Admin 05:

- **Escritorio:** mosaicos cuadrados y un mosaico "+" punteado para agregar.
- **Móvil:** 2 fotos por fila y un botón "+ Agregar foto" punteado.

El proyecto todavía no tiene una pantalla de editar salón. Por eso la sección tiene chips **"Salón nuevo"** y uno por cada salón del administrador:

- **Salón existente:** las fotos se suben y se eliminan al momento.
- **Salón nuevo:** las fotos quedan pendientes y se suben al publicar, cuando ya existe el `salonId`. Si alguna falla, el salón ya quedó publicado y se reintenta desde su chip.

## Cómo se probó

- **Front:** build local con `EXPO_PUBLIC_API_URL=http://localhost:5080/api`, servido con `npx serve dist -l 8081`.
- **API:** local (`dotnet run`, puerto 5080) contra **LocalDB**, con el contenedor real de fotos.
- **Archivos:** solo imágenes de prueba. Al final se borraron todas: el contenedor tenía 0 archivos antes y 0 después.
- **Navegador:** Chrome headless con puppeteer-core (fuera del repo).
- **Pruebas de funciones puras:** `npm test` (`node --test`), **36 de 36** (`hu07_fotos_pruebas.txt`). Cubren:
  - el tipo real por magic bytes;
  - los 5 MB;
  - el límite de 8;
  - el armado del FormData;
  - los mensajes de error;
  - el tamaño de los mosaicos.

**Resultado E2E: 23 de 23** (`hu07_fotos_e2e_local.txt`).

| Qué se pidió | Resultado |
|---|---|
| Sección "Fotos del salón" con selector `accept="image/jpeg,image/png,image/webp"` | OK |
| Validación en el cliente: tipo real, 5 MB y máximo 8 contando las que ya hay | OK. Un `.jpg` que en realidad es texto y uno de 6 MB no se suben, con su mensaje. Con 7 fotos, de 2 elegidas entra 1 y avisa; al llegar a 8 ya no se ofrece "Agregar" |
| Subida real de JPG, PNG y WEBP | OK. Las 3 aparecen en `fotosDetalle` de la API |
| Vista previa e indicador de progreso | OK. Cada foto muestra su vista previa y "Subiendo N %" con barra |
| Estado de error por foto y reintentar | OK. Ante un 5000 simulado aparece "No se pudo guardar la foto…" con **Reintentar**, que la sube (`hu07_fotos_error_reintentar.png`) |
| Eliminar con confirmación | OK. "¿Eliminar esta foto?", luego "Sí, eliminar". Una foto subida también borra su archivo (404). Una foto vieja con URL externa rota borra solo el registro |
| Salón nuevo: las fotos se suben después de crearlo | OK. "¡Listo! … ya está publicado con 1 paquete. Se subieron 2 fotos." La sección queda en ese salón con sus 2 fotos |
| Registrar un salón sin fotos sigue funcionando | OK. El flujo de publicar no cambió; sin fotos pendientes no se sube nada |
| Fotos con su URL pública en el detalle del cliente | OK. Las 3 imágenes cargan (`hu07_fotos_detalle_cliente.png`) |
| Foto vieja con 404, placeholder de la maqueta | OK. Se ve el espacio arena con la inicial del salón, sin imagen rota. Es `components/FotoSalon.js`, el mismo de tarjetas, detalle y panel |
| Sin conexión (HU-22) | OK. Aparece "Modo sin conexión · Para subir o eliminar fotos necesitas conexión." y Agregar/Eliminar quedan deshabilitados. No se encola ningún POST (`hu07_fotos_sin_conexion.png`) |
| Responsivo | OK. Ver el detalle abajo |
| Foco visible y contraste AA | OK. Contorno de 2 px. El texto "Agregar foto" usa el dorado oscurecido del tema (`COLORES.pendienteTexto`, 4.5:1 o más); el borde punteado y el "+" usan el dorado de la maqueta |

**Detalle del responsivo** (320, 360, 390, 768, 1024, 1440 y 844×390 en horizontal):

- No hay scroll horizontal y las fotos quedan dentro de la pantalla.
- Botones y chips miden 44 px o más.
- Fotos por fila: 2 en móvil y tablet, y de 2 a 4 en escritorio según el ancho de la columna.
- Capturas: `hu07_fotos_1440x900.png`, `_1024x768`, `_390x844`, `_320x640` y `_844x390`.

## Hallazgo en la prueba de producción (corregido)

La primera prueba en producción encontró una **carrera** al elegir un salón y subir una foto antes de que terminaran de cargar sus fotos:

- La carga terminaba después y **reemplazaba la lista**.
- La foto que se estaba subiendo desaparecía de la pantalla, aunque la API sí la guardaba.

Corrección:

- **Agregar** queda deshabilitado mientras cargan las fotos (el límite de 8 todavía no se conoce).
- La carga conserva lo que está en curso: subiendo, con error o recién guardado (`combinarFotos` en `services/fotos.logica.js`, con prueba).

Evidencias:

- `hu07_fotos_carrera_local.txt`: con la respuesta de `obtener` retrasada 3 s, Agregar está deshabilitado mientras carga y la subida posterior aparece guardada.
- El E2E completo se repitió: **23 de 23**.
- Las 2 fotos que dejó la prueba en producción se borraron. El salón quedó con 0 fotos, las URLs dan 404 y el contenedor tiene 0 archivos.

## Qué NO se verificó

- **Teléfono real, iOS/Safari y la app instalada.** Solo se probó en Chrome de escritorio con tamaños de móvil.
- **Producción:** la prueba con la API desplegada queda para cuando se autorice. Usará una imagen de prueba que se borra al terminar.
- **App nativa (Android/iOS):** el selector de archivos es solo web. En la app nativa la sección avisa: "Las fotos se suben desde la versión web".
