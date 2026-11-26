/**
 * GlamSpaces · Sprint 10 · Verificar el correo de una cuenta nueva (estado y acciones).
 *   POST /api/usuarios/verificarCorreo { correo, codigo } → la sesión: se guarda y entra.
 *   "Reenviar código", avisos y errores: ../../components/useCodigoCorreo.js
 */

import { useState } from "react";
import { verificarCorreo } from "../../services/usuariosApi";
import { guardarSesion } from "../../services/sesionStorage";
import { validarCodigo } from "../../services/correo.logica";
import useCodigoCorreo from "../../components/useCodigoCorreo";

export default function useVerificarCorreo(correo, alEntrar) {
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const c = useCodigoCorreo(correo, "verificacion");

  async function verificar() {
    c.setMensaje(null);
    const erroresForm = validarCodigo(codigo);
    c.setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) return;

    setEnviando(true);
    try {
      const sesion = await verificarCorreo(correo, codigo);
      await guardarSesion(sesion);
      alEntrar(sesion);
    } catch (e) {
      c.mostrarError(e);
    } finally {
      setEnviando(false);
    }
  }

  return {
    codigo,
    setCodigo,
    errores: c.errores,
    mensaje: c.mensaje,
    enviando,
    reenviando: c.reenviando,
    restantes: c.restantes,
    verificar,
    reenviar: c.reenviar,
  };
}
