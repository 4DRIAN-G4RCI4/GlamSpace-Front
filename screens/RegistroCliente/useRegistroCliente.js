/**
 * GlamSpaces · HU-02 · Lógica del registro de cliente.
 * La cuenta se crea en la API (POST /api/usuarios/registro) como "cliente".
 */

import { useState } from "react";
import { registrarUsuario } from "../../services/usuariosApi";
import { textoDeErrorApi } from "../../services/api";
import { validarRegistroCliente } from "./registroCliente.validaciones";

export default function useRegistroCliente() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }

  async function manejarRegistro() {
    setMensaje(null);

    const erroresForm = validarRegistroCliente({
      nombre,
      correo,
      password,
      password2,
      aceptaTerminos,
    });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      setMensaje({ tipo: "fail", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    const nombreLimpio = nombre.trim();

    setEnviando(true);
    try {
      await registrarUsuario({
        nombre: nombreLimpio,
        correo: correo.trim(),
        password,
        tipoCuenta: "cliente",
        nombreSalon: null,
      });
      setMensaje({
        tipo: "ok",
        texto: `¡Cuenta creada! Bienvenido/a, ${nombreLimpio.split(" ")[0]}.`,
      });
      setNombre("");
      setCorreo("");
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
