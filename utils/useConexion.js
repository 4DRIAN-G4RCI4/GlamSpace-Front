/**
 * GlamSpaces · HU-22 · ¿Hay conexión? Escucha los eventos online/offline del navegador y llama a
 * `alVolver` cuando la conexión regresa (para recargar sola la información).
 * En Android/iOS no hay esos eventos: siempre dice "en línea" y manda el error "red" de la API.
 */

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const ES_WEB = Platform.OS === "web" && typeof window !== "undefined";

export default function useConexion(alVolver) {
  const [enLinea, setEnLinea] = useState(() => !ES_WEB || navigator.onLine !== false);
  const ultimo = useRef(alVolver);
  ultimo.current = alVolver;

  useEffect(() => {
    if (!ES_WEB) return undefined;
    const alConectar = () => {
      setEnLinea(true);
      if (ultimo.current) ultimo.current();
    };
    const alDesconectar = () => setEnLinea(false);
    window.addEventListener("online", alConectar);
    window.addEventListener("offline", alDesconectar);
    return () => {
      window.removeEventListener("online", alConectar);
      window.removeEventListener("offline", alDesconectar);
    };
  }, []);

  return enLinea;
}
