/**
 * GlamSpaces · Sprint 10 · "Verifica tu correo" (después de registrarse, o al iniciar sesión con una
 * cuenta sin verificar). Mismo diseño de dos paneles que el login (components/LayoutAcceso).
 *
 *   - VerificarCorreoScreen.js → pantalla (JSX)   [este archivo]
 *   - useVerificarCorreo.js    → estado, verificar y reenviar
 *   - ../../services/correo.logica.js → contrato con la API, textos y reglas (probadas)
 *
 * route.params.correo: el correo al que se mandó el código. Sin él no hay nada que verificar: se va al login.
 */

import React, { useEffect } from "react";
import { Text } from "react-native";
import BotonAcceso from "../../components/BotonAcceso";
import CampoCodigo from "../../components/CampoCodigo";
import LayoutAcceso from "../../components/LayoutAcceso";
import { TEXTOS_CORREO } from "../../services/correo.logica";
import { estilos } from "../Login/Login.styles";
import useVerificarCorreo from "./useVerificarCorreo";

export default function VerificarCorreoScreen({ navigation, route }) {
  const correo = (route && route.params && route.params.correo) || "";
  const ir = navigation && (navigation.reemplazar || navigation.navigate);
  // Ya verificada, la cuenta entra igual que en el login: el administrador a su panel y el cliente a su perfil.
  const f = useVerificarCorreo(correo, (sesion) => ir && ir(sesion.tipo_cuenta === "administrador" ? "PanelAdministrador" : "Perfil"));

  useEffect(() => {
    if (!correo && ir) ir("Login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correo]);

  return (
    <LayoutAcceso navigation={navigation} respaldoRegresar="Login">
      <Text style={estilos.tituloLogin} accessibilityRole="header">{TEXTOS_CORREO.verificarTitulo}</Text>
      <Text style={estilos.subtitulo}>{TEXTOS_CORREO.verificarTexto(correo)}</Text>

      <CampoCodigo
        valor={f.codigo}
        onCambiar={f.setCodigo}
        error={f.errores.codigo}
        restantes={f.restantes}
        reenviando={f.reenviando}
        onReenviar={f.reenviar}
      />

      <BotonAcceso texto={TEXTOS_CORREO.verificarBoton} onPress={f.verificar} enviando={f.enviando} />

      {f.mensaje ? (
        <Text style={[estilos.mensajeGeneral, f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail]} role="status">
          {f.mensaje.texto}
        </Text>
      ) : null}
    </LayoutAcceso>
  );
}
