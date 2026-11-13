/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Estado del campo "Zona o dirección".
 *
 * Mientras el administrador escribe:
 *   - 5 dígitos          → colonias de ese código postal (Zippopotam)
 *   - 4 letras o más     → sugerencias de dirección (Nominatim)
 *   - menos              → no se consulta nada
 *
 * Se espera 600 ms desde la última tecla (debounce) y la consulta anterior se cancela, así que
 * escribir rápido no dispara una petición por letra. El servicio además espacia las peticiones
 * a una por segundo (límite de Nominatim).
 *
 * Si la consulta falla, se avisa y ya: el campo se sigue escribiendo a mano y se puede guardar.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { buscarPorCodigoPostal, buscarPorDireccion } from "../../services/ubicacionApi";
import { ESPERA_ESCRITURA_MS, mensajeDeFalloUbicacion, planDeBusqueda } from "../../services/ubicacion.logica";

export default function useUbicacion(valor, alElegirZona) {
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [abierto, setAbierto] = useState(false);

  // Para cancelar la consulta anterior y para no consultar lo que el usuario acaba de elegir.
  const peticion = useRef(null);
  const recienElegido = useRef(null);
  const montado = useRef(true);
  // El valor con el que se abrió la pantalla (la zona que ya tenía el salón): no se consulta,
  // porque el administrador todavía no ha escrito nada. Solo se busca al escribir.
  const valorInicial = useRef(valor);

  useEffect(() => () => {
    montado.current = false;
    if (peticion.current) peticion.current.abort();
  }, []);

  useEffect(() => {
    const texto = String(valor ?? "");

    // Al abrir, la zona que ya tenía el salón no se consulta (nadie ha escrito todavía).
    if (valorInicial.current !== null && texto === valorInicial.current) return undefined;
    valorInicial.current = null;

    // Si el texto es justo lo que se acaba de elegir, no se vuelve a consultar.
    if (recienElegido.current !== null && texto === recienElegido.current) return undefined;
    recienElegido.current = null;

    const plan = planDeBusqueda(texto);
    if (plan.tipo === "ninguno") {
      setSugerencias([]);
      setAbierto(false);
      setAviso(null);
      return undefined;
    }

    const temporizador = setTimeout(async () => {
      if (peticion.current) peticion.current.abort();
      const control = new AbortController();
      peticion.current = control;

      setBuscando(true);
      setAviso(null);
      try {
        const opciones = plan.tipo === "cp"
          ? await buscarPorCodigoPostal(plan.consulta, { senal: control.signal })
          : await buscarPorDireccion(plan.consulta, { senal: control.signal });

        if (!montado.current || control.signal.aborted) return;
        setSugerencias(opciones);
        setAbierto(opciones.length > 0);
        // Un CP que no existe no es un error: solo no hay colonias que ofrecer.
        if (opciones.length === 0 && plan.tipo === "cp") {
          setAviso("No encontramos colonias para ese código postal. Escribe la zona a mano.");
        }
      } catch (error) {
        if (!montado.current || (error && error.name === "AbortError")) return;
        setSugerencias([]);
        setAbierto(false);
        setAviso(mensajeDeFalloUbicacion(error));
      } finally {
        if (montado.current) setBuscando(false);
      }
    }, ESPERA_ESCRITURA_MS);

    return () => clearTimeout(temporizador);
  }, [valor]);

  // Al elegir una sugerencia se guarda la zona ya compuesta y se cierra la lista.
  const elegir = useCallback(
    (opcion) => {
      recienElegido.current = opcion.zona;
      if (alElegirZona) alElegirZona(opcion.zona, opcion);
      setSugerencias([]);
      setAbierto(false);
      setAviso(null);
    },
    [alElegirZona],
  );

  const cerrar = useCallback(() => setAbierto(false), []);

  return { sugerencias, buscando, aviso, abierto, elegir, cerrar };
}
