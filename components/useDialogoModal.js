/**
 * GlamSpaces · Comportamiento accesible compartido por los diálogos modales.
 *
 * Lo usan DialogoConfirmacion y DialogoConvertirAdmin:
 *   - Al abrir, el foco entra al diálogo; al cerrar, vuelve a donde estaba (quien lo abrió).
 *   - El foco queda atrapado: Tab y Shift+Tab giran entre los elementos del diálogo.
 *   - Escape cierra, igual que el botón de cancelar.
 *
 * React Native Web deja `tabindex="0"` en divs de envoltura sin rol: si entraran al ciclo, el
 * foco no giraría entre los botones, así que solo cuentan los elementos con rol interactivo.
 *
 * → { tarjeta } · la referencia que hay que poner en el contenedor del diálogo.
 */

import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

const ES_WEB = Platform.OS === "web" && typeof document !== "undefined";

const ROLES_INTERACTIVOS = ["button", "link", "textbox", "checkbox", "radio", "combobox", "switch"];
const ETIQUETAS_INTERACTIVAS = ["button", "input", "select", "textarea", "a"];

function enfocablesDe(caja) {
  if (!caja || !caja.querySelectorAll) return [];
  return [...caja.querySelectorAll("button, [href], input, select, textarea, [role], [tabindex]:not([tabindex='-1'])")]
    .filter((el) => {
      if (el.disabled || el.getAttribute("aria-hidden") === "true") return false;
      if (ETIQUETAS_INTERACTIVAS.includes(el.tagName.toLowerCase())) return true;
      return ROLES_INTERACTIVOS.includes(el.getAttribute("role"));
    });
}

/**
 * `visible`: si el diálogo está abierto · `alCerrar`: qué hacer con Escape.
 * `enfocarPrimero`: true lleva el foco al primer elemento (un campo); si no, al último
 * (el botón principal, que es lo habitual en una confirmación).
 */
export default function useDialogoModal({ visible, alCerrar, enfocarPrimero = false }) {
  const tarjeta = useRef(null);
  const focoPrevio = useRef(null);

  const cerrar = useCallback(() => {
    if (alCerrar) alCerrar();
  }, [alCerrar]);

  // Entrada y regreso del foco.
  useEffect(() => {
    if (!ES_WEB || !visible) return undefined;

    focoPrevio.current = document.activeElement;
    const tiempo = setTimeout(() => {
      const opciones = enfocablesDe(tarjeta.current);
      const destino = enfocarPrimero ? opciones[0] : opciones[opciones.length - 1];
      if (destino && destino.focus) destino.focus();
    }, 0);

    return () => {
      clearTimeout(tiempo);
      const volverA = focoPrevio.current;
      if (volverA && volverA.focus) volverA.focus();
    };
  }, [visible, enfocarPrimero]);

  // Escape cierra; Tab y Shift+Tab no salen del diálogo.
  useEffect(() => {
    if (!ES_WEB || !visible) return undefined;

    const alTeclear = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar();
        return;
      }
      if (e.key !== "Tab") return;

      const opciones = enfocablesDe(tarjeta.current);
      if (opciones.length === 0) return;
      const primero = opciones[0];
      const ultimo = opciones[opciones.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alTeclear, true);
    return () => document.removeEventListener("keydown", alTeclear, true);
  }, [visible, cerrar]);

  return { tarjeta };
}
