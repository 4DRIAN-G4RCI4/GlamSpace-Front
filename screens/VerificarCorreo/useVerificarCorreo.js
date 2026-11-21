/**
 * GlamSpaces · Sprint 10 · Verificar el correo de una cuenta nueva (estado y acciones).
 *   POST /api/usuarios/verificarCorreo { correo, codigo } → la sesión: se guarda y entra.
 *   POST /api/usuarios/reenviarCodigo  { correo, proposito: "verificacion" }
 */

import { useState } from "react";
import { reenviarCodigo, verificarCorreo } from "../../services/usuariosApi";
import { guardarSesion } from "../../services/sesionStorage";
import { ESPERA_REENVIO_SEGUNDOS, TEXTOS_CORREO, mensajeDeErrorCodigo, validarCodigo } from "../../services/correo.logica";
import useCuentaRegresiva from "../../components/useCuentaRegresiva";

export default function useVerificarCorreo(correo, alEntrar) {
  const [codigo, setCodigo] = useState("");
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }
  const [enviando, setEnviando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const cuenta = useCuentaRegresiva(ESPERA_REENVIO_SEGUNDOS);

  function mostrarError(e) {
    const { texto, campo } = mensajeDeErrorCodigo(e);
    if (campo) setErrores({ [campo]: texto });
    else setMensaje({ tipo: "fail", texto });
  }

  async function verificar() {
    setMensaje(null);
    const erroresForm = validarCodigo(codigo);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) return;

    setEnviando(true);
    try {
      const sesion = await verificarCorreo(correo, codigo);
      await guardarSesion(sesion);
      alEntrar(sesion);
    } catch (e) {
      mostrarError(e);
    } finally {
      setEnviando(false);
    }
  }

  async function reenviar() {
    setMensaje(null);
    setErrores({});
    setReenviando(true);
    try {
      await reenviarCodigo(correo, "verificacion");
      setMensaje({ tipo: "ok", texto: TEXTOS_CORREO.reenviado });
      cuenta.reiniciar();
    } catch (e) {
      mostrarError(e);
    } finally {
      setReenviando(false);
    }
  }

  return { codigo, setCodigo, errores, mensaje, enviando, reenviando, restantes: cuenta.restantes, verificar, reenviar };
}
