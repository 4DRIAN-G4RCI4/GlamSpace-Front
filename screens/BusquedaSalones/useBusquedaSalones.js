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
import { aNumero } from "../../utils/validadores";
import { validarCapacidad, validarPrecio } from "./busquedaSalones.validaciones";

// Zona con la que abre la pantalla. Vacía = todos los salones publicados.
// Si el equipo define una zona por defecto (ej. "Tula"), se cambia solo aquí.
export const ZONA_POR_DEFECTO = "";

const TAMANO_PAGINA = 10;
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
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState(null);

  // Si el usuario cambia los filtros rápido, solo se pinta la respuesta de la última búsqueda.
  const ultimaBusqueda = useRef(0);

  async function consultar(paginaPedida) {
    const id = ++ultimaBusqueda.current;
    const esPrimeraPagina = paginaPedida === 1;
    esPrimeraPagina ? setCargando(true) : setCargandoMas(true);
    setError(null);

    try {
      const r = await buscarSalones({ ...filtros, pagina: paginaPedida, tamanoPagina: TAMANO_PAGINA });
      if (id !== ultimaBusqueda.current) return;
      setSalones((previos) => (esPrimeraPagina ? r.datos : [...previos, ...r.datos]));
      setPagina(r.pagina);
      setTotalPaginas(r.totalPaginas);
      setTotalRegistros(r.totalRegistros);
    } catch (e) {
      if (id !== ultimaBusqueda.current) return;
      setError(textoDeErrorApi(e));
    } finally {
      if (id === ultimaBusqueda.current) {
        setCargando(false);
        setCargandoMas(false);
      }
    }
  }

  useEffect(() => {
    consultar(1);
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

  function aplicarChip() {
    const mensajeError = VALIDADORES[chipAbierto](borradorChip);
    if (mensajeError) {
      setErrorChip(mensajeError);
      return;
    }
    if (chipAbierto === "zona") {
      const zona = borradorChip.trim();
      setTextoBusqueda(zona); // la barra y el chip muestran lo mismo
      setFiltros((previos) => ({ ...previos, zona }));
    } else {
      setFiltros((previos) => ({ ...previos, [chipAbierto]: aNumero(borradorChip) }));
    }
    cerrarChip();
  }

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
    quitarFiltro,
    quitarTodos,
    // resultados
    salones,
    totalRegistros,
    hayMas: pagina < totalPaginas,
    cargando,
    cargandoMas,
    error,
    cargarMas: () => consultar(pagina + 1),
    reintentar: () => consultar(1),
  };
}
