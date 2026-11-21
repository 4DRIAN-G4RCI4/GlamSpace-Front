/**
 * GlamSpaces · Sprint 10 · Lo común de las pantallas que piden un código por correo (verificar la
 * cuenta y recuperarla): errores por campo, el aviso general, mostrar el error de la API y
 * "Reenviar código" con su cuenta regresiva.
 *
 * proposito: "verificacion" | "recuperacion" (POST /api/usuarios/reenviarCodigo)
 */

import { useState } from "react";
import { reenviarCodigo } from "../services/usuariosApi";
import { ESPERA_REENVIO_SEGUNDOS, TEXTOS_CORREO, mensajeDeErrorCodigo } from "../services/correo.logica";
import useCuentaRegresiva from "./useCuentaRegresiva";

export default function useCodigoCorreo(correo, proposito) {
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }
  const [reenviando, setReenviando] = useState(false);
  const cuenta = useCuentaRegresiva(ESPERA_REENVIO_SEGUNDOS);

  function mostrarError(e) {
    const { texto, campo } = mensajeDeErrorCodigo(e);
    if (campo) setErrores({ [campo]: texto });
    else setMensaje({ tipo: "fail", texto });
  }

  async function reenviar() {
    setMensaje(null);
    setErrores({});
    setReenviando(true);
    try {
      await reenviarCodigo(correo, proposito);
      setMensaje({ tipo: "ok", texto: TEXTOS_CORREO.reenviado });
      cuenta.reiniciar();
    } catch (e) {
      mostrarError(e);
    } finally {
      setReenviando(false);
    }
  }

  return {
    errores,
    setErrores,
    mensaje,
    setMensaje,
    reenviando,
    restantes: cuenta.restantes,
    reiniciarCuenta: cuenta.reiniciar,
    mostrarError,
    reenviar,
  };
}
