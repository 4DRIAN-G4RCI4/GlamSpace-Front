/**
 * GlamSpaces · HU-10 · Configuración de los chips de filtro: textos, teclado
 * y sugerencias rápidas (un toque aplica el filtro sin escribir).
 */

import { formatearPrecio } from "../../utils/formato";

export const FILTROS = [
  {
    nombre: "zona",
    icono: "📍",
    inactivo: "Zona",
    activo: (v) => v,
    pregunta: "¿En qué zona es tu evento?",
    placeholder: "Ej. Tula de Allende",
    teclado: "default",
    sugerencias: [
      { valor: "Tula", texto: "Tula" },
      { valor: "Tepeji", texto: "Tepeji" },
      { valor: "Mixquiahuala", texto: "Mixquiahuala" },
      { valor: "Tlahuelilpan", texto: "Tlahuelilpan" },
    ],
  },
  {
    nombre: "capacidadMinima",
    icono: "👪",
    inactivo: "Capacidad",
    activo: (v) => `${v}+ personas`,
    pregunta: "¿Cuántos invitados tendrás como mínimo?",
    placeholder: "Ej. 150",
    teclado: "numeric",
    sugerencias: [50, 100, 200, 300].map((n) => ({ valor: n, texto: `${n}+` })),
  },
  {
    nombre: "precioMaximo",
    icono: "💲",
    inactivo: "Precio",
    activo: (v) => `Hasta ${formatearPrecio(v)}`,
    pregunta: "¿Cuál es tu presupuesto máximo (MXN)?",
    placeholder: "Ej. 10000",
    teclado: "decimal-pad",
    sugerencias: [5000, 10000, 20000, 40000].map((n) => ({ valor: n, texto: `Hasta ${formatearPrecio(n)}` })),
  },
];
