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

import React, { useCallback } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import useDialogoModal from "./useDialogoModal";
import { estilos } from "./DialogoConfirmacion.styles";

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

  const cancelar = useCallback(() => {
    if (!ocupado && onCancelar) onCancelar();
  }, [ocupado, onCancelar]);

  // Foco atrapado, Escape y regreso del foco (compartido con DialogoConvertirAdmin).
  // El foco entra al botón principal, que es lo que se espera en una confirmación.
  const { tarjeta } = useDialogoModal({ visible, alCerrar: cancelar });

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
