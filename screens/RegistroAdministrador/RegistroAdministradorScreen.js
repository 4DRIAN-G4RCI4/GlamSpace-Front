/**
 * GlamSpaces · HU-03 Registro de administrador de salón (Sprint 1)
 * Historia de Adrian — frontend armado por Erick.
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - RegistroAdministradorScreen.js          → pantalla: textos y el campo del salón [este archivo]
 *   - ../../components/FormularioRegistro.js  → formulario común con el registro de cliente
 *   - useRegistroAdministrador.js             → lógica / estado / acciones
 *   - registroAdministrador.validaciones.js   → reglas de validación
 *   - ../../services/usuariosApi.js           → llamada a la API
 */

import React from "react";
import Campo from "../../components/Campo";
import FormularioRegistro from "../../components/FormularioRegistro";
import useRegistroAdministrador from "./useRegistroAdministrador";

const TEXTOS = {
  marca:
    "Publica tu salón en GlamSpaces y recibe solicitudes de reservación de clientes que buscan un lugar para su evento.",
  titulo: "Registra tu salón",
  subtitulo: "Crea tu cuenta de administrador para publicar tu espacio en GlamSpaces.",
  ejemploNombre: "Ej. Adrian García Jiménez",
  boton: "Crear cuenta de administrador",
  enlace: { pregunta: "¿Buscas salones para tu evento?", accion: "Regístrate como cliente", destino: "RegistroCliente" },
};

export default function RegistroAdministradorScreen({ navigation }) {
  const f = useRegistroAdministrador();

  return (
    <FormularioRegistro navigation={navigation} f={f} textos={TEXTOS}>
      <Campo
        etiqueta="Nombre del salón"
        autoComplete="off"
        textContentType="none"
        valor={f.nombreSalon}
        onCambiar={f.setNombreSalon}
        placeholder="Ej. Salón Jardín Las Rosas"
        error={f.errores.nombreSalon}
        autoCapitalize="words"
      />
    </FormularioRegistro>
  );
}
