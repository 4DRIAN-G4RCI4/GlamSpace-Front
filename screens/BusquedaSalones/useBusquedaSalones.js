/**
 * GlamSpaces · HU-10 · Lógica de la pantalla de búsqueda de salones.
 *
 *  - Al abrir, busca con la zona por defecto (criterio 1).
 *  - La barra de búsqueda filtra por zona. Los chips (zona, capacidad, precio) se
 *    editan y se confirman con "Aplicar" (criterio 2); los activos se ven rellenos.
 *  - Cada cambio de filtros vuelve a consultar POST /api/salones/buscar (HU-09).
 *  - Lista vacía → la pantalla muestra el mensaje de "sin resultados" (criterio 3).
 *  - "Cargar más" pide la siguiente página y la agrega al final.
 */

import { useEffect, useRef, useState } from "react";
import { buscarSalones } from "../../services/salonesApi";
import { textoDeErrorApi } from "../../services/api";
import { guardarCache, leerCache, llaveCache } from "../../services/cacheLocal";
import { aNumero } from "../../utils/validadores";
import { POR_PAGINA_SALONES, SALONES_POR_CARGA, paginaDelServidor } from "../../services/paginacion.logica";
import { validarCapacidad, validarPrecio } from "./busquedaSalones.validaciones";

// Zona con la que abre la pantalla. Vacía = todos los salones publicados.
// Si el equipo define una zona por defecto (ej. "Tula"), se cambia solo aquí.
export const ZONA_POR_DEFECTO = "";

// 3 columnas x 6 filas = 18 por pagina (ver services/paginacion.logica.js).
const TAMANO_PAGINA = POR_PAGINA_SALONES;
const SIN_FILTROS = { zona: "", capacidadMinima: null, precioMaximo: null };
const VALIDADORES = { zona: () => null, capacidadMinima: validarCapacidad, precioMaximo: validarPrecio };

export default function useBusquedaSalones() {
  // Filtros que ya se aplicaron (los que manda la búsqueda y pintan los chips activos)
  const [filtros, setFiltros] = useState({ ...SIN_FILTROS, zona: ZONA_POR_DEFECTO });

  // Lo que el usuario está escribiendo antes de confirmar
  const [textoBusqueda, setTextoBusqueda] = useState(ZONA_POR_DEFECTO);
  const [chipAbierto, setChipAbierto] = useState(null); // "zona" | "capacidadMinima" | "precioMaximo" | null
  const [borradorChip, setBorradorChip] = useState("");
  const [errorChip, setErrorChip] = useState(null);

  // Resultados
  const [salones, setSalones] = useState([]);
  // Primer bloque de 6 de la pagina que se ve: NO cambia al pulsar "Cargar mas", solo al
  // cambiar de pagina. De el sale el "Mostrando X–…".
  const [bloqueInicial, setBloqueInicial] = useState(1);
  // Ultimo bloque pedido: avanza con cada "Cargar mas".
  const [bloque, setBloque] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState(null);

  // Si el usuario cambia los filtros rápido, solo se pinta la respuesta de la última búsqueda.
  const ultimaBusqueda = useRef(0);

  // `bloquePedido` es un bloque de 6 salones. `acumular`: true al pulsar 'Cargar mas'
  // (se agregan al final); false al cambiar de pagina con los numeros (se reemplaza).
  async function consultar(bloquePedido, { acumular = false, cuantosBloques = 3 } = {}) {
    const id = ++ultimaBusqueda.current;
    const esPrimerBloque = bloquePedido === 1;
    const reemplaza = !acumular;
    reemplaza ? setCargando(true) : setCargandoMas(true);
    setError(null);

    const mostrar = (r) => {
      setSalones((previos) => (reemplaza ? r.datos : [...previos, ...r.datos]));
      setBloque(bloquePedido + cuantosBloques - 1);
      // Al abrir una pagina (no al cargar mas) se fija su primer bloque.
      if (!acumular) setBloqueInicial(bloquePedido);
      // Los totales se expresan en paginas de 18, que es lo que ve el usuario.
      setTotalRegistros(r.totalRegistros);
      setTotalPaginas(Math.max(1, Math.ceil((r.totalRegistros || 0) / TAMANO_PAGINA)));
    };

    // HU-21 · Catálogo "consultado recientemente" (stale-while-revalidate): la primera página
    // guardada de esta búsqueda se pinta al instante y la respuesta de la API la reemplaza.
    const llave = llaveCache(null, "busqueda", filtros.zona, filtros.capacidadMinima, filtros.precioMaximo);
    // Se pide en bloques de 6: al abrir una pagina se piden 3 bloques juntos (18 salones) y
    // "Cargar mas" pide un solo bloque mas. Se traduce a pagina/tamanoPagina del back.
    const peticion = cuantosBloques === 1
      ? buscarSalones({ ...filtros, pagina: bloquePedido, tamanoPagina: SALONES_POR_CARGA })
      : buscarSalones({ ...filtros, pagina: Math.ceil(bloquePedido / cuantosBloques), tamanoPagina: SALONES_POR_CARGA * cuantosBloques });
    peticion.catch(() => {}); // se maneja abajo; evita el aviso de promesa sin manejar mientras se lee la caché
    let mostroGuardado = false;

    try {
      if (esPrimerBloque) {
        const guardado = await leerCache(llave);
        if (guardado && id === ultimaBusqueda.current) {
          mostrar(guardado.datos);
          setCargando(false);
          mostroGuardado = true;
        }
      }
      const r = await peticion;
      if (id !== ultimaBusqueda.current) return;
      mostrar(r);
      if (esPrimerBloque) {
        void guardarCache(llave, { datos: r.datos, pagina: r.pagina, totalPaginas: r.totalPaginas, totalRegistros: r.totalRegistros });
      }
    } catch (e) {
      if (id !== ultimaBusqueda.current) return;
      // Sin red pero con lo guardado en pantalla: se queda lo guardado.
      if (!(mostroGuardado && e.tipo === "red")) setError(textoDeErrorApi(e));
    } finally {
      if (id === ultimaBusqueda.current) {
        setCargando(false);
        setCargandoMas(false);
      }
    }
  }

  useEffect(() => {
    void consultar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  // ---- Barra de búsqueda (zona) ----

  function confirmarBusqueda() {
    const zona = textoBusqueda.trim();
    if (zona !== filtros.zona) {
      setFiltros((previos) => ({ ...previos, zona }));
    }
  }

  // ---- Chips de capacidad y precio ----

  function abrirChip(nombre) {
    if (chipAbierto === nombre) {
      cerrarChip();
      return;
    }
    setChipAbierto(nombre);
    setBorradorChip(filtros[nombre] ? String(filtros[nombre]) : "");
    setErrorChip(null);
  }

  function cerrarChip() {
    setChipAbierto(null);
    setBorradorChip("");
    setErrorChip(null);
  }

  function aplicarValor(texto) {
    const mensajeError = VALIDADORES[chipAbierto](texto);
    if (mensajeError) {
      setErrorChip(mensajeError);
      return;
    }
    if (chipAbierto === "zona") {
      const zona = texto.trim();
      setTextoBusqueda(zona); // la barra y el chip muestran lo mismo
      setFiltros((previos) => ({ ...previos, zona }));
    } else {
      setFiltros((previos) => ({ ...previos, [chipAbierto]: aNumero(texto) }));
    }
    cerrarChip();
  }

  // "Aplicar" con lo escrito, o un toque en una sugerencia rápida.
  const aplicarChip = () => aplicarValor(borradorChip);
  const aplicarSugerencia = (valor) => aplicarValor(String(valor));

  // ---- Quitar filtros ----

  function quitarFiltro(nombre) {
    if (nombre === "zona") setTextoBusqueda("");
    if (nombre === chipAbierto) cerrarChip();
    setFiltros((previos) => ({ ...previos, [nombre]: SIN_FILTROS[nombre] }));
  }

  function quitarTodos() {
    setTextoBusqueda("");
    cerrarChip();
    setFiltros(SIN_FILTROS);
  }

  const hayFiltros = !!filtros.zona || !!filtros.capacidadMinima || !!filtros.precioMaximo;

  // Pagina de 18 que se esta viendo (3 bloques de 6) y cuantos se muestran en total.
  const BLOQUES_POR_PAGINA = TAMANO_PAGINA / SALONES_POR_CARGA; // 3
  const paginaActual = Math.max(1, Math.ceil(bloqueInicial / BLOQUES_POR_PAGINA));
  const desde = (bloqueInicial - 1) * SALONES_POR_CARGA + 1;
  const paginacion = {
    ...paginaDelServidor({
      pagina: paginaActual,
      porPagina: TAMANO_PAGINA,
      totalRegistros,
      totalPaginas,
      cuantosLlegaron: salones.length,
    }),
    // El rango refleja lo que de verdad se ve (18 o lo que se haya cargado de mas).
    desde: totalRegistros === 0 ? 0 : desde,
    hasta: totalRegistros === 0 ? 0 : desde + salones.length - 1,
  };
  // Quedan mas por cargar si el bloque actual no es el ultimo del catalogo.
  const hayMasEnElCatalogo = desde + salones.length - 1 < totalRegistros;

  return {
    // barra de búsqueda
    textoBusqueda,
    setTextoBusqueda,
    confirmarBusqueda,
    // chips
    filtros,
    hayFiltros,
    chipAbierto,
    borradorChip,
    setBorradorChip,
    errorChip,
    abrirChip,
    cerrarChip,
    aplicarChip,
    aplicarSugerencia,
    quitarFiltro,
    quitarTodos,
    // resultados
    salones,
    totalRegistros,
    cargando,
    cargandoMas,
    error,
    // "Cargar mas salones": pide 6 mas al back y los agrega al final, sin cambiar de pagina.
    hayMas: hayMasEnElCatalogo,
    cargarMas: () => consultar(bloque + 1, { acumular: true, cuantosBloques: 1 }),
    // Paginacion de 18 en 18: salta al primer bloque de esa pagina y reemplaza la lista.
    paginacion,
    irAPagina: (n) => consultar((n - 1) * BLOQUES_POR_PAGINA + 1),
    reintentar: () => consultar(1),
  };
}
