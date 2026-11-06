/**
 * GlamSpaces · Lógica de la pantalla Perfil.
 * Los datos salen de la sesión guardada al iniciar sesión (services/sesionStorage.js):
 * { id, nombre, correo, tipo_cuenta, nombre_salon }. La API todavía no tiene un endpoint de perfil.
 */

import { useEffect, useState } from "react";
import { cerrarSesion as borrarSesion, obtenerSesionActiva } from "../../services/sesionStorage";

export default function usePerfil() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarUsuario = async () => {
    setCargando(true);
    setUsuario(await obtenerSesionActiva());
    setCargando(false);
  };

  const cerrarSesion = async () => {
    await borrarSesion();
    setUsuario(null);
  };

  useEffect(() => {
    void cargarUsuario();
  }, []);

  return { usuario, cargando, cargarUsuario, cerrarSesion };
}
