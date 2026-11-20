/**
 * GlamSpaces · Correo y contraseña de las pantallas que piden iniciar sesión: el login y el paso
 * "verifica tu identidad" de Conviértete en administrador.
 *
 * `f`: { correo, setCorreo, password, setPassword, errores, mostrarPassword, alternarPassword }
 */

import React from "react";
import Campo from "./Campo";

export default function CamposAcceso({ f }) {
  return (
    <>
      <Campo
        etiqueta="Correo electrónico"
        autoComplete="email"
        textContentType="emailAddress"
        valor={f.correo}
        onCambiar={f.setCorreo}
        placeholder="tucorreo@ejemplo.com"
        error={f.errores.correo}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Campo
        etiqueta="Contraseña"
        autoComplete="current-password"
        textContentType="password"
        valor={f.password}
        onCambiar={f.setPassword}
        placeholder="Tu contraseña"
        error={f.errores.password}
        secureTextEntry={!f.mostrarPassword}
        conToggle
        mostrarPassword={f.mostrarPassword}
        onToggle={f.alternarPassword}
      />
    </>
  );
}
