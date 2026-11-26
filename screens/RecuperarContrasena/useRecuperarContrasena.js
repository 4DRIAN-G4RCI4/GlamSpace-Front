/**
 * GlamSpaces · Sprint 10 · Recuperar la cuenta con un código por correo (estado y acciones).
 *
 *   paso "correo"      → POST /api/usuarios/recuperar { correo } (siempre responde igual)
 *   paso "restablecer" → POST /api/usuarios/restablecer { correo, codigo, nuevaContrasena }
 *                        y POST /api/usuarios/reenviarCodigo { correo, proposito: "recuperacion" }
 *   paso "listo"       → ya puede iniciar sesión con la nueva contraseña
 */

import { useState } from "react";
import { restablecerContrasena, solicitarRecuperacion } from "../../services/usuariosApi";
import { esCorreoValido } from "../../utils/validadores";
import { validarRestablecer } from "../../services/correo.logica";
import useCodigoCorreo from "../../components/useCodigoCorreo";

export default function useRecuperarContrasena(correoInicial = "") {
  const [paso, setPaso] = useState("correo");
  const [correo, setCorreo] = useState(correoInicial);
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // Avisos, errores y "Reenviar código": ../../components/useCodigoCorreo.js
  const c = useCodigoCorreo(correo, "recuperacion");
  const { setErrores, setMensaje } = c;

  // Envuelve una llamada a la API: limpia avisos, marca "enviando" y muestra el error si falla.
  async function conEnvio(accion) {
    setMensaje(null);
    setEnviando(true);
    try {
      await accion();
    } catch (e) {
      c.mostrarError(e);
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
      c.reiniciarCuenta();
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
    errores: c.errores,
    mensaje: c.mensaje,
    enviando,
    reenviando: c.reenviando,
    restantes: c.restantes,
    pedirCodigo,
    restablecer,
    reenviar: c.reenviar,
    cambiarCorreo: () => {
      setPaso("correo");
      setCodigo("");
      setErrores({});
      setMensaje(null);
    },
  };
}
