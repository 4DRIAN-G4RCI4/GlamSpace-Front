/**
 * GlamSpaces · HU-02 Registro de cliente (Sprint 1)
 * Responsable: Erick Trejo Reséndiz — capa FRONTEND (React Native / Expo)
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - RegistroClienteScreen.js                → pantalla: textos [este archivo]
 *   - ../../components/FormularioRegistro.js  → formulario común con el registro de administrador
 *   - useRegistroCliente.js                   → lógica / estado / acciones
 *   - registroCliente.validaciones.js         → reglas de validación
 *   - ../../services/usuariosApi.js           → llamada a la API
 */

import React from "react";
import FormularioRegistro from "../../components/FormularioRegistro";
import useRegistroCliente from "./useRegistroCliente";

const TEXTOS = {
  marca: "Encuentra y reserva el salón para tu evento: compara espacios, revisa disponibilidad y envía tu solicitud.",
  titulo: "Crea tu cuenta",
  subtitulo: "Regístrate para buscar y reservar salones de fiestas en tu zona.",
  ejemploNombre: "Ej. Erick Trejo Reséndiz",
  boton: "Crear mi cuenta",
  enlace: {
    pregunta: "¿Tienes un salón que quieres publicar?",
    accion: "Regístrate como administrador",
    destino: "RegistroAdministrador",
  },
};

export default function RegistroClienteScreen({ navigation }) {
  const f = useRegistroCliente();
  return <FormularioRegistro navigation={navigation} f={f} textos={TEXTOS} />;
}
