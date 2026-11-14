/**
 * GlamSpaces · Sprint 7 · "Conviértete en administrador".
 *
 * El cliente confirma con su contraseña y la cuenta pasa a ser de administrador: mismo correo,
 * misma contraseña y su historial de solicitudes se conserva. Se pide la contraseña porque
 * todavía no hay JWT (POST /api/usuarios/convertirAAdministrador { usuarioId, contrasena }).
 *
 * Es un diálogo modal con el mismo comportamiento accesible que DialogoConfirmacion:
 * role="dialog", aria-modal, foco atrapado, Escape para cerrar y el foco vuelve a donde estaba.
 */

import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import Campo from "./Campo";
import { COLORES } from "../theme/colores";
import { convertirAAdministrador } from "../services/usuariosApi";
import { guardarSesion } from "../services/sesionStorage";
import {
  TEXTOS_CONVERSION,
  mensajeDeErrorConversion,
  validarConversion,
  yaEraAdministrador,
} from "../services/convertirAdmin.logica";
import useDialogoModal from "./useDialogoModal";
import { estilos } from "./DialogoConfirmacion.styles";

export default function DialogoConvertirAdmin({ visible, sesion, onCerrar, onConvertida }) {
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);


  const cerrar = useCallback(() => {
    if (!enviando && onCerrar) onCerrar();
  }, [enviando, onCerrar]);

  // Al abrir se limpia lo que quedó de la vez anterior.
  useEffect(() => {
    if (!visible) return;
    setContrasena("");
    setErrores({});
    setMensaje(null);
  }, [visible]);

  // Foco atrapado, Escape y regreso del foco (compartido con DialogoConfirmacion).
  // `enfocarPrimero`: aquí el foco entra al campo de la contraseña.
  const { tarjeta } = useDialogoModal({ visible, alCerrar: cerrar, enfocarPrimero: true });

  async function convertir() {
    const erroresForm = validarConversion({ contrasena });
    setErrores(erroresForm);
    setMensaje(null);
    if (Object.keys(erroresForm).length > 0) return;

    setEnviando(true);
    try {
      const nueva = await convertirAAdministrador(sesion.id, contrasena);
      await guardarSesion(nueva);
      if (onConvertida) onConvertida(nueva);
    } catch (error) {
      // 1006: la cuenta ya era de administrador. No es un fallo para el usuario: se sigue.
      if (yaEraAdministrador(error)) {
        const actualizada = { ...sesion, tipo_cuenta: "administrador" };
        await guardarSesion(actualizada);
        if (onConvertida) onConvertida(actualizada);
        return;
      }
      const { texto, campo: cual } = mensajeDeErrorConversion(error);
      if (cual) setErrores({ [cual]: texto });
      else setMensaje(texto);
    } finally {
      setEnviando(false);
    }
  }

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={cerrar}>
      <Pressable style={estilos.fondo} onPress={cerrar} accessibilityLabel="Cerrar el diálogo">
        {/* Lo nombra el encabezado que lleva dentro (ver DialogoConfirmacion). */}
        <View
          ref={tarjeta}
          style={estilos.tarjeta}
          onStartShouldSetResponder={() => true}
          role="dialog"
          aria-modal="true"
          accessibilityViewIsModal
        >
          <Text style={estilos.titulo} accessibilityRole="header">{TEXTOS_CONVERSION.titulo}</Text>
          <Text style={estilos.mensaje}>{TEXTOS_CONVERSION.explicacion}</Text>

          <Campo
            etiqueta={TEXTOS_CONVERSION.etiquetaContrasena}
            valor={contrasena}
            onCambiar={setContrasena}
            placeholder="Tu contraseña"
            error={errores.contrasena}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
          />

          {mensaje ? (
            <Text style={[estilos.mensaje, { color: COLORES.error }]} role="status" aria-live="polite">
              {mensaje}
            </Text>
          ) : null}

          <View style={estilos.botones}>
            <Pressable
              onPress={cerrar}
              disabled={enviando}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              style={({ hovered, focused, pressed }) => [
                estilos.boton,
                estilos.botonCancelar,
                (hovered || pressed) && estilos.botonCancelarActivo,
                focused && estilos.foco,
                enviando && estilos.botonInactivo,
              ]}
            >
              <Text style={estilos.botonCancelarTexto}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={convertir}
              disabled={enviando}
              accessibilityRole="button"
              accessibilityLabel={TEXTOS_CONVERSION.boton}
              style={({ hovered, focused, pressed }) => [
                estilos.boton,
                estilos.botonPrincipal,
                (hovered || pressed) && estilos.botonPrincipalActivo,
                focused && estilos.foco,
                enviando && estilos.botonInactivo,
              ]}
            >
              {enviando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={estilos.botonPrincipalTexto}>{TEXTOS_CONVERSION.boton}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
