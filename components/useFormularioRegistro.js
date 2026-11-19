/**
 * GlamSpaces · Estado y envío del registro, compartido por HU-02 (cliente) y HU-03 (administrador).
 * La cuenta se crea en la API (POST /api/usuarios/registro). Cada registro pasa:
 *   - tipoCuenta: "cliente" | "administrador"
 *   - validar:    sus reglas (registroCliente.validaciones o registroAdministrador.validaciones)
 *   - pideSalon:  true si también pide el nombre del salón
 *   - textoExito: ({ nombre, nombreSalon }) → mensaje al crear la cuenta
 */

import { useState } from "react";
import { registrarUsuario } from "../services/usuariosApi";
import { textoDeErrorApi } from "../services/api";

export default function useFormularioRegistro({ tipoCuenta, validar, pideSalon = false, textoExito }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [nombreSalon, setNombreSalon] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "fail", texto }

  async function manejarRegistro() {
    setMensaje(null);

    const campos = { nombre, correo, password, password2, aceptaTerminos };
    const erroresForm = validar(pideSalon ? { ...campos, nombreSalon } : campos);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      setMensaje({ tipo: "fail", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    const limpios = { nombre: nombre.trim(), nombreSalon: nombreSalon.trim() };

    setEnviando(true);
    try {
      await registrarUsuario({
        nombre: limpios.nombre,
        correo: correo.trim(),
        password,
        tipoCuenta,
        nombreSalon: pideSalon ? limpios.nombreSalon : null,
      });
      setMensaje({ tipo: "ok", texto: textoExito(limpios) });
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
