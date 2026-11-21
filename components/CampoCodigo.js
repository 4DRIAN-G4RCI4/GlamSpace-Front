/**
 * GlamSpaces · Sprint 10 · Campo del código de 6 dígitos que llega por correo y el enlace para
 * pedir otro (con cuenta regresiva). Lo usan Verificar correo y Recuperar cuenta.
 */

import React from "react";
import { Pressable, Text } from "react-native";
import Campo from "./Campo";
import { LONGITUD_CODIGO, TEXTOS_CORREO, limpiarCodigo } from "../services/correo.logica";
import { comunes as estilos } from "../theme/estilosComunes";

export default function CampoCodigo({ valor, onCambiar, error, restantes, reenviando, onReenviar }) {
  const puedeReenviar = restantes <= 0 && !reenviando;
  return (
    <>
      <Campo
        etiqueta="Código"
        valor={valor}
        onCambiar={(t) => onCambiar(limpiarCodigo(t))}
        placeholder="000000"
        error={error}
        keyboardType="number-pad"
        maxLength={LONGITUD_CODIGO}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
      <Pressable onPress={onReenviar} disabled={!puedeReenviar} accessibilityRole="button" accessibilityState={{ disabled: !puedeReenviar }}>
        <Text style={[estilos.enlaceCambio, { marginTop: 4, textAlign: "right" }]}>
          {puedeReenviar ? <Text style={estilos.enlaceResaltado}>{TEXTOS_CORREO.reenviar}</Text> : TEXTOS_CORREO.reenviarEn(Math.max(restantes, 0))}
        </Text>
      </Pressable>
    </>
  );
}
