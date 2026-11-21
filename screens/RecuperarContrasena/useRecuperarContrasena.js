/**
 * GlamSpaces · Sprint 10 · Recuperar la cuenta con un código por correo (estado y acciones).
 *
 *   paso "correo"      → POST /api/usuarios/recuperar { correo } (siempre responde igual)
 *   paso "restablecer" → POST /api/usuarios/restablecer { correo, codigo, nuevaContrasena }
 *                        y POST /api/usuarios/reenviarCodigo { correo, proposito: "recuperacion" }
 *   paso "listo"       → ya puede iniciar sesión con la nueva contraseña
 */

import { useState } from "react";
import { reenviarCodigo, restablecerContrasena, solicitarRecuperacion } from "../../services/usuariosApi";
import { esCorreoValido } from "../../utils/validadores";
import { ESPERA_REENVIO_SEGUNDOS, TEXTOS_CORREO, mensajeDeErrorCodigo, validarRestablecer } from "../../services/correo.logica";
import useCuentaRegresiva from "../../components/useCuentaRegresiva";

export default function useRecuperarContrasena(correoInicial = "") {
  const [paso, setPaso] = useState("correo");
  const [correo, setCorreo] = useState(correoInicial);
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
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

  // Envuelve una llamada a la API: limpia avisos, marca "enviando" y muestra el error si falla.
  async function conEnvio(accion) {
    setMensaje(null);
    setEnviando(true);
    try {
      await accion();
    } catch (e) {
      mostrarError(e);
    } finally {
      setEnviando(false);
    }
  }

  function pedirCodigo() {
    const limpio = correo.trim();
    const error = !limpio ? "Escribe tu correo electrónico." : !esCorreoValido(limpio) ? "El formato del correo no es válido." : null;
    setErrores(error ? { correo: error } : {});
    if (error) return Promise.resolve();
    return conEnvio(async () => {
      await solicitarRecuperacion(limpio);
      setPaso("restablecer");
      cuenta.reiniciar();
    });
  }

  function restablecer() {
    const erroresForm = validarRestablecer({ codigo, password, password2 });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) return Promise.resolve();
    return conEnvio(async () => {
      await restablecerContrasena(correo, codigo, password);
      setPassword("");
      setPassword2("");
      setPaso("listo");
    });
  }

  async function reenviar() {
    setMensaje(null);
    setErrores({});
    setReenviando(true);
    try {
      await reenviarCodigo(correo, "recuperacion");
      setMensaje({ tipo: "ok", texto: TEXTOS_CORREO.reenviado });
      cuenta.reiniciar();
    } catch (e) {
      mostrarError(e);
    } finally {
      setReenviando(false);
    }
  }

  return {
    paso,
    correo,
    setCorreo,
    codigo,
    setCodigo,
    password,
    setPassword,
    password2,
    setPassword2,
    mostrarPassword,
    alternarPassword: () => setMostrarPassword((v) => !v),
    errores,
    mensaje,
    enviando,
    reenviando,
    restantes: cuenta.restantes,
    pedirCodigo,
    restablecer,
    reenviar,
    cambiarCorreo: () => {
      setPaso("correo");
      setCodigo("");
      setErrores({});
      setMensaje(null);
    },
  };
}
