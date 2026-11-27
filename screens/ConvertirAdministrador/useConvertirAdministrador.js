/**
 * GlamSpaces · "Conviértete en administrador" · estado y acciones.
 *
 *  1. verificar → inicia sesión con correo y contraseña (POST /api/usuarios/login). Tiene que ser la
 *                 misma cuenta que está en sesión (convertirAdmin.logica: esLaMismaCuenta). Después
 *                 se pide el código al correo (POST /api/usuarios/codigoConversion).
 *  2. codigo    → escribe los 6 dígitos; "Reenviar código" con cuenta regresiva de 60 s.
 *  3. confirmar → "Verificación exitosa" y lo que cambia; con "Sí, convertir mi cuenta" se llama a
 *                 POST /api/usuarios/convertirAAdministrador con la contraseña y el código. Si el
 *                 código falla (incorrecto, vencido, intentos) se regresa al paso 2 con el error.
 */

import { useState } from "react";
import { convertirAAdministrador, iniciarSesion, pedirCodigoConversion } from "../../services/usuariosApi";
import { textoDeErrorApi } from "../../services/api";
import { guardarSesion } from "../../services/sesionStorage";
import { validarLogin } from "../Login/login.validaciones";
import {
  TEXTOS_CONVERSION,
  esErrorDeCodigo,
  esLaMismaCuenta,
  mensajeDeErrorConversion,
  yaEraAdministrador,
} from "../../services/convertirAdmin.logica";
import { ESPERA_REENVIO_SEGUNDOS, TEXTOS_CORREO, mensajeDeErrorCodigo, validarCodigo } from "../../services/correo.logica";
import useSesion from "../../components/useSesion";
import useCuentaRegresiva from "../../components/useCuentaRegresiva";

const esCredencialIncorrecta = (e) => !!e && e.tipo === "http" && [400, 401, 404].includes(e.estado);

export default function useConvertirAdministrador(alConvertir) {
  const { sesion, cargando } = useSesion();
  const [paso, setPaso] = useState("verificar"); // "verificar" | "codigo" | "confirmar"
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [aviso, setAviso] = useState(null); // mensaje de éxito (código reenviado)
  const [enviando, setEnviando] = useState(false);
  const cuenta = useCuentaRegresiva(ESPERA_REENVIO_SEGUNDOS);

  // Errores del código van en su campo (o como aviso); los demás, con los textos de la conversión.
  function mostrarError(e) {
    const { texto, campo } = esErrorDeCodigo(e) ? mensajeDeErrorCodigo(e) : mensajeDeErrorConversion(e);
    if (campo === "codigo") setErrores({ codigo: texto });
    else setMensaje(texto);
  }

  async function mandarCodigo() {
    await pedirCodigoConversion(sesion.id, password);
    cuenta.reiniciar();
  }

  async function verificar() {
    setMensaje(null);
    const erroresForm = validarLogin({ correo, password });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) return;

    setEnviando(true);
    try {
      const verificada = await iniciarSesion(correo, password);
      if (!esLaMismaCuenta(sesion, verificada)) {
        setMensaje(TEXTOS_CONVERSION.otraCuenta);
        return;
      }
      await mandarCodigo();
      setPaso("codigo");
    } catch (e) {
      if (esErrorDeCodigo(e)) {
        // 1011: ya se le mandó uno hace menos de 60 s; ese sigue sirviendo.
        setPaso("codigo");
        mostrarError(e);
      } else setMensaje(esCredencialIncorrecta(e) ? TEXTOS_CONVERSION.credenciales : textoDeErrorApi(e));
    } finally {
      setEnviando(false);
    }
  }

  async function reenviar() {
    setMensaje(null);
    setAviso(null);
    setErrores({});
    setEnviando(true);
    try {
      await mandarCodigo();
      setAviso(TEXTOS_CORREO.reenviado);
    } catch (e) {
      mostrarError(e);
    } finally {
      setEnviando(false);
    }
  }

  function continuar() {
    setMensaje(null);
    setAviso(null);
    const erroresCodigo = validarCodigo(codigo);
    setErrores(erroresCodigo);
    if (Object.keys(erroresCodigo).length === 0) setPaso("confirmar");
  }

  async function convertir() {
    setMensaje(null);
    setEnviando(true);
    try {
      const nueva = await convertirAAdministrador(sesion.id, password, codigo);
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
      if (esErrorDeCodigo(e)) setPaso("codigo");
      mostrarError(e);
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
    codigo,
    setCodigo,
    errores,
    mensaje,
    aviso,
    enviando,
    restantes: cuenta.restantes,
    verificar,
    reenviar,
    continuar,
    convertir,
  };
}
