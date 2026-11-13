/**
 * GlamSpaces · Sprint 7 · Invitación a registrar un salón.
 *
 * Se muestra SOLO a las cuentas de cliente (quien ya es administrador no la ve), en la pantalla
 * de inicio y en el Perfil. La regla vive en components/navegacion.logica.js y está probada.
 *
 * El botón lleva al registro de administrador: el back todavía no puede convertir una cuenta de
 * cliente en administrador (usuarios solo tiene registro, login y obtener). Ver el README.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORES } from "../theme/colores";
import { conFuentes } from "../theme/disenoPwa";
import { ESPACIO, RADIO } from "../theme/espaciado";
import { INVITACION_ADMIN, muestraInvitacionAdmin } from "./navegacion.logica";

export default function InvitacionAdmin({ sesion, navigation, estilo }) {
  if (!muestraInvitacionAdmin(sesion)) return null;

  return (
    <View style={[estilos.tarjeta, estilo]}>
      <View style={estilos.textos}>
        <Text style={estilos.titulo} accessibilityRole="header">{INVITACION_ADMIN.titulo}</Text>
        <Text style={estilos.texto}>{INVITACION_ADMIN.texto}</Text>
      </View>
      <Pressable
        onPress={() => navigation && navigation.navigate(INVITACION_ADMIN.destino)}
        accessibilityRole="button"
        accessibilityLabel={INVITACION_ADMIN.boton}
        style={({ hovered, focused, pressed }) => [
          estilos.boton,
          (hovered || pressed) && estilos.botonActivo,
          focused && estilos.foco,
        ]}
      >
        <Text style={estilos.botonTexto}>{INVITACION_ADMIN.boton}</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create(conFuentes({
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIO.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: ESPACIO.lg,
    marginBottom: ESPACIO.xl,
  },
  textos: { flexShrink: 1, minWidth: 220, gap: ESPACIO.xs },
  titulo: { fontSize: 16, fontWeight: "700", color: COLORES.texto },
  texto: { fontSize: 13.5, lineHeight: 20, color: COLORES.muted, maxWidth: 560 },
  boton: {
    minHeight: 44, // objetivo táctil
    paddingHorizontal: ESPACIO.xl,
    borderRadius: RADIO.sm,
    backgroundColor: COLORES.morado,
    alignItems: "center",
    justifyContent: "center",
  },
  botonActivo: { backgroundColor: COLORES.moradoOscuro },
  botonTexto: { fontSize: 14, fontWeight: "700", color: "#fff" },
  foco: {
    outlineWidth: 2,
    outlineColor: COLORES.dorado,
    outlineStyle: "solid",
    outlineOffset: 2,
  },
}));
