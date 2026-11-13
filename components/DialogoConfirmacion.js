/**
 * GlamSpaces · Mejora de HU-07/HU-08 · Diálogo de confirmación reutilizable y accesible.
 *
 * Lo usan todas las acciones que escriben: guardar, eliminar salón, eliminar paquete,
 * eliminar foto, cambiar entre publicado y borrador y salir con cambios sin guardar.
 * El texto de cada uno lo arma screens/MisSalones/misSalones.logica.js (probado).
 *
 * Accesibilidad:
 *   - role="dialog" con aria-modal. El diálogo se nombra con el encabezado que lleva dentro
 *     (role="heading" con el título): esta versión de React Native Web no escribe aria-label
 *     ni aria-labelledby en una View, y el encabezado es lo que anuncian los lectores de pantalla
 *     al entrar el foco.
 *   - El foco entra al diálogo y queda atrapado: Tab y Shift+Tab giran entre sus botones.
 *   - Escape cierra (igual que Cancelar) y al cerrar el foco vuelve a donde estaba.
 *   - Botones de 44 px en móvil, con el texto de lo que hacen (nunca un "Aceptar" pelón).
 *   - Respeta prefers-reduced-motion: no hay animación de entrada.
 */

import React, { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, Text, View } from "react-native";
import { estilos } from "./DialogoConfirmacion.styles";

const ES_WEB = Platform.OS === "web" && typeof document !== "undefined";

export default function DialogoConfirmacion({
  visible,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  destructiva = false,
  ocupado = false,
  onConfirmar,
  onCancelar,
}) {
  const tarjeta = useRef(null);
  const botonConfirmar = useRef(null);
  const focoPrevio = useRef(null);

  const cancelar = useCallback(() => {
    if (!ocupado && onCancelar) onCancelar();
  }, [ocupado, onCancelar]);

  // Al abrir: se recuerda dónde estaba el foco y se lleva al botón principal.
  // Al cerrar: el foco regresa a donde estaba (quien abrió el diálogo).
  useEffect(() => {
    if (!ES_WEB) return undefined;
    if (!visible) return undefined;

    focoPrevio.current = document.activeElement;
    const tiempo = setTimeout(() => {
      if (botonConfirmar.current && botonConfirmar.current.focus) botonConfirmar.current.focus();
    }, 0);

    return () => {
      clearTimeout(tiempo);
      const volverA = focoPrevio.current;
      if (volverA && volverA.focus) volverA.focus();
    };
  }, [visible]);

  // Escape cierra; Tab y Shift+Tab no salen del diálogo.
  useEffect(() => {
    if (!ES_WEB || !visible) return undefined;

    const alTeclear = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelar();
        return;
      }
      if (e.key !== "Tab") return;

      const caja = tarjeta.current;
      if (!caja || !caja.querySelectorAll) return;
      // Solo lo que de verdad se puede usar: React Native Web deja tabindex="0" en divs de
      // envoltura sin rol, y si entraran al ciclo el foco no giraría entre los botones.
      const ROLES = ["button", "link", "textbox", "checkbox", "radio", "combobox", "switch"];
      const enfocables = [...caja.querySelectorAll("button, [href], input, select, textarea, [role], [tabindex]:not([tabindex='-1'])")]
        .filter((el) => {
          if (el.disabled || el.getAttribute("aria-hidden") === "true") return false;
          const etiqueta = el.tagName.toLowerCase();
          if (["button", "input", "select", "textarea", "a"].includes(etiqueta)) return true;
          return ROLES.includes(el.getAttribute("role"));
        });
      if (enfocables.length === 0) return;

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
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
  }, [visible, cancelar]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={cancelar}>
      {/* Tocar fuera cancela, igual que Escape. */}
      <Pressable style={estilos.fondo} onPress={cancelar} accessibilityLabel="Cerrar el diálogo">
        {/* onStartShouldSetResponder corta el toque para que usar el diálogo no lo cierre.
            Lo nombra el encabezado que lleva dentro (el título). */}
        <View
          ref={tarjeta}
          style={estilos.tarjeta}
          onStartShouldSetResponder={() => true}
          role="dialog"
          aria-modal="true"
          accessibilityViewIsModal
        >
          <Text style={estilos.titulo} accessibilityRole="header">
            {titulo}
          </Text>
          <Text style={estilos.mensaje}>{mensaje}</Text>

          <View style={estilos.botones}>
            <Pressable
              onPress={cancelar}
              disabled={ocupado}
              accessibilityRole="button"
              accessibilityLabel={textoCancelar}
              style={({ hovered, focused, pressed }) => [
                estilos.boton,
                estilos.botonCancelar,
                (hovered || pressed) && estilos.botonCancelarActivo,
                focused && estilos.foco,
                ocupado && estilos.botonInactivo,
              ]}
            >
              <Text style={estilos.botonCancelarTexto}>{textoCancelar}</Text>
            </Pressable>

            <Pressable
              ref={botonConfirmar}
              onPress={onConfirmar}
              disabled={ocupado}
              accessibilityRole="button"
              accessibilityLabel={textoConfirmar}
              style={({ hovered, focused, pressed }) => [
                estilos.boton,
                destructiva ? estilos.botonPeligro : estilos.botonPrincipal,
                (hovered || pressed) && (destructiva ? estilos.botonPeligroActivo : estilos.botonPrincipalActivo),
                focused && estilos.foco,
                ocupado && estilos.botonInactivo,
              ]}
            >
              {ocupado ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={estilos.botonPrincipalTexto}>{textoConfirmar}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
