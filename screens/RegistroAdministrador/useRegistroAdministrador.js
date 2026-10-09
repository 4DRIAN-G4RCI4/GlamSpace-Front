/**
 * GlamSpaces · HU-03 · Lógica del registro de administrador de salón.
 * La cuenta se crea en la API (POST /api/usuarios/registro) como "administrador",
 * mandando también el nombre del salón.
 */

import { useState } from "react";
import { registrarUsuario } from "../../services/usuariosApi";
import { textoDeErrorApi } from "../../services/api";
import { validarRegistroAdministrador } from "./registroAdministrador.validaciones";

export default function useRegistroAdministrador() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [nombreSalon, setNombreSalon] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  async function manejarRegistro() {
    setMensaje(null);

    const erroresForm = validarRegistroAdministrador({
      nombre,
      correo,
      nombreSalon,
      password,
      password2,
      aceptaTerminos,
    });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      setMensaje({ tipo: "fail", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    const salonLimpio = nombreSalon.trim();

    setEnviando(true);
    try {
      await registrarUsuario({
        nombre: nombre.trim(),
        correo: correo.trim(),
        password,
        tipoCuenta: "administrador",
        nombreSalon: salonLimpio,
      });
      setMensaje({
        tipo: "ok",
        texto: `¡Cuenta creada! Ya puedes publicar "${salonLimpio}".`,
      });
      setNombre("");
      setCorreo("");
      setNombreSalon("");
      setPassword("");
      setPassword2("");
      setAceptaTerminos(false);
      setErrores({});
    } catch (error) {
      if (error && error.tipo === "http" && error.estado === 409) {
        setErrores((previos) => ({ ...previos, correo: "Ya existe una cuenta con este correo." }));
        setMensaje({ tipo: "fail", texto: "No se pudo crear la cuenta." });
      } else {
        setMensaje({ tipo: "fail", texto: textoDeErrorApi(error) });
      }
    } finally {
      setEnviando(false);
    }
  }

  return {
    nombre,
    setNombre,
    correo,
    setCorreo,
    nombreSalon,
    setNombreSalon,
    password,
    setPassword,
    password2,
    setPassword2,
    aceptaTerminos,
    alternarTerminos: () => setAceptaTerminos((v) => !v),
    mostrarPassword,
    alternarPassword: () => setMostrarPassword((v) => !v),
    errores,
    enviando,
    mensaje,
    manejarRegistro,
  };
}
