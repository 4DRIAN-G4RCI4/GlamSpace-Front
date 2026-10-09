/**
 * GlamSpaces · HU-04 · Lógica de inicio y cierre de sesión.
 *
 *  - Login contra la API (POST /api/usuarios/login), válido para cliente y admin.
 *  - Mensaje genérico si fallan correo o contraseña (no dice cuál de los dos).
 *  - Tras 3 intentos fallidos seguidos, advertencia extra (sin bloquear la cuenta).
 *  - La sesión se mantiene al cerrar y reabrir la app (AsyncStorage).
 */

import { useEffect, useState } from "react";
import { iniciarSesion } from "../../services/usuariosApi";
import { textoDeErrorApi } from "../../services/api";
import {
  guardarSesion,
  obtenerSesionActiva,
  cerrarSesion,
} from "../../services/sesionStorage";
import { validarLogin } from "./login.validaciones";

const INTENTOS_PARA_ADVERTENCIA = 3;

// La API contesta 401 (o 400/404) cuando correo o contraseña no coinciden.
function esErrorDeCredenciales(error) {
  return !!error && error.tipo === "http" && [400, 401, 404].includes(error.estado);
}

export default function useLogin() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    // Si ya había una sesión activa, al reabrir la app se mantiene.
    (async () => {
      const sesionGuardada = await obtenerSesionActiva();
      setSesion(sesionGuardada);
      setCargandoSesion(false);
    })();
  }, []);

  async function manejarLogin() {
    setMensaje(null);

    const erroresForm = validarLogin({ correo, password });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      setMensaje({ tipo: "fail", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    setEnviando(true);
    try {
      const nuevaSesion = await iniciarSesion(correo, password);
      await guardarSesion(nuevaSesion);
      setSesion(nuevaSesion);
      setIntentosFallidos(0);
      setPassword("");
      setMensaje(null);
    } catch (error) {
      if (esErrorDeCredenciales(error)) {
        const nuevosIntentos = intentosFallidos + 1;
        setIntentosFallidos(nuevosIntentos);

        // Mensaje genérico a propósito: no dice si falló el correo o la contraseña.
        let texto = "Correo o contraseña incorrectos.";
        if (nuevosIntentos >= INTENTOS_PARA_ADVERTENCIA) {
          texto += " Revisa bien tus datos antes de intentar de nuevo.";
        }
        setMensaje({ tipo: "fail", texto });
      } else {
        // Sin conexión, API caída, etc.: no cuenta como intento fallido.
        setMensaje({ tipo: "fail", texto: textoDeErrorApi(error) });
      }
    } finally {
      setEnviando(false);
    }
  }

  async function manejarCerrarSesion() {
    await cerrarSesion();
    setSesion(null);
    setCorreo("");
    setPassword("");
    setIntentosFallidos(0);
    setMensaje(null);
    setErrores({});
  }

  return {
    correo,
    setCorreo,
    password,
    setPassword,
    mostrarPassword,
    alternarPassword: () => setMostrarPassword((v) => !v),
    errores,
    enviando,
    mensaje,
    sesion,
    cargandoSesion,
    manejarLogin,
    manejarCerrarSesion,
  };
}
