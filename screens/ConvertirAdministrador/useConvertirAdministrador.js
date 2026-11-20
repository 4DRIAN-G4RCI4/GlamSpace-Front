/**
 * GlamSpaces · "Conviértete en administrador" · estado y acciones.
 *
 *  1. verificar → inicia sesión con correo y contraseña (POST /api/usuarios/login). Tiene que ser la
 *                 misma cuenta que está en sesión (convertirAdmin.logica: esLaMismaCuenta).
 *  2. confirmar → "Verificación exitosa" y lo que cambia; con "Sí, convertir mi cuenta" se llama a
 *                 POST /api/usuarios/convertirAAdministrador con la contraseña ya verificada.
 */

import { useState } from "react";
import { convertirAAdministrador, iniciarSesion } from "../../services/usuariosApi";
import { textoDeErrorApi } from "../../services/api";
import { guardarSesion } from "../../services/sesionStorage";
import { validarLogin } from "../Login/login.validaciones";
import {
  TEXTOS_CONVERSION,
  esLaMismaCuenta,
  mensajeDeErrorConversion,
  yaEraAdministrador,
} from "../../services/convertirAdmin.logica";
import useSesion from "../../components/useSesion";

const esCredencialIncorrecta = (e) => !!e && e.tipo === "http" && [400, 401, 404].includes(e.estado);

export default function useConvertirAdministrador(alConvertir) {
  const { sesion, cargando } = useSesion();
  const [paso, setPaso] = useState("verificar"); // "verificar" | "confirmar"
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function verificar() {
    setMensaje(null);
    const erroresForm = validarLogin({ correo, password });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) return;

    setEnviando(true);
    try {
      const verificada = await iniciarSesion(correo, password);
      if (esLaMismaCuenta(sesion, verificada)) setPaso("confirmar");
      else setMensaje(TEXTOS_CONVERSION.otraCuenta);
    } catch (e) {
      setMensaje(esCredencialIncorrecta(e) ? TEXTOS_CONVERSION.credenciales : textoDeErrorApi(e));
    } finally {
      setEnviando(false);
    }
  }

  async function convertir() {
    setMensaje(null);
    setEnviando(true);
    try {
      const nueva = await convertirAAdministrador(sesion.id, password);
      await guardarSesion(nueva);
      alConvertir(nueva);
    } catch (e) {
      // 1006: ya era administrador. No es un fallo: se actualiza la sesión y se sigue.
      if (yaEraAdministrador(e)) {
        const actualizada = { ...sesion, tipo_cuenta: "administrador" };
        await guardarSesion(actualizada);
        alConvertir(actualizada);
        return;
      }
      setMensaje(mensajeDeErrorConversion(e).texto);
    } finally {
      setEnviando(false);
    }
  }

  return {
    sesion,
    cargando,
    paso,
    correo,
    setCorreo,
    password,
    setPassword,
    mostrarPassword,
    alternarPassword: () => setMostrarPassword((v) => !v),
    errores,
    mensaje,
    enviando,
    verificar,
    convertir,
  };
}
