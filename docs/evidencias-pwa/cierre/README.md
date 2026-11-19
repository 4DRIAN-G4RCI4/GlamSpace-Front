# Cierre del proyecto GlamSpaces · HU-23 a HU-28

Documentos fuente para generar los reportes de estas historias de usuario. Cada archivo tiene la misma estructura:
ficha, objetivo, criterios de aceptación, entorno, qué se hizo, resultados, evidencia, defectos, pendientes y
**datos clave para el reporte** (números listos para citar).

| HU | Título | Sprint | Responsable | Estado | Archivo |
|---|---|---|---|---|---|
| HU-23 | Pruebas del flujo completo del cliente | 8 | Erick Trejo Reséndiz | Terminada · 36/36 | [HU-23.md](HU-23.md) |
| HU-24 | Pruebas del flujo completo del administrador | 8 | Adrian Adonai García Jiménez | Terminada · 32/32 | [HU-24.md](HU-24.md) |
| HU-25 | Corrección de errores encontrados | 8 | Ángel Alexis Blas Castillo | Terminada | [HU-25.md](HU-25.md) |
| HU-26 | Despliegue de la PWA en un ambiente accesible | 9 | Ángel Alexis Blas Castillo | Terminada | [HU-26.md](HU-26.md) |
| HU-27 | Pruebas de instalación en dispositivo real | 9 | Adrian Adonai García Jiménez | Android probado en tablet real · 8/8 OK · iPhone pendiente | [HU-27.md](HU-27.md) |
| HU-28 | Ajustes finales de UX y rendimiento | 9 | Erick Trejo Reséndiz | Terminada · LCP 8.1 → 5.8 s | [HU-28.md](HU-28.md) |

Resumen técnico en un solo archivo: [Cierre-HU23-a-HU28.md](Cierre-HU23-a-HU28.md).

## Contexto del proyecto (para quien redacta el reporte)

- **GlamSpaces:** PWA para buscar y reservar salones de eventos en la región Tula–Tepeji (Hidalgo). Dos roles:
  **cliente** (busca, ve el detalle, pide una fecha) y **administrador** (publica salones, paquetes y fotos, atiende
  solicitudes).
- **Front:** React Native + Expo exportado a web (PWA), en Azure Storage (sitio estático):
  <https://glamspacesfrontsa.z41.web.core.windows.net>.
- **Back:** API .NET 9 (Clean Architecture, Dapper y stored procedures, todo POST con respuesta
  `{codigo, mensaje, datos, exito}`) en Azure App Service, con Azure SQL.
- **Flujo de ramas:** rama de la tarea → `develop` → `release` → `main`, un PR por salto, con pruebas y el Quality Gate
  de SonarQube Cloud en verde. El deploy ocurre al llegar a `main`.
- **Datos de producción al cierre:** 1,501 salones publicados (1,500 de la carga de demostración de la región y 1 real),
  con 4 o 5 fotos y de 1 a 3 paquetes cada uno.
- **Fechas:** 18 y 19 de noviembre de 2026 (Sprint 8: HU-23 a HU-25 · Sprint 9: HU-26 a HU-28).
