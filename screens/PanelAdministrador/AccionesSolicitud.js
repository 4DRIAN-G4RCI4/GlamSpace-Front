/**
 * GlamSpaces · HU-19 · Aceptar / Rechazar una solicitud desde su detalle (Figma Admin 03).
 * Cada acción pide confirmar ("Sí, …"); los errores de la API se muestran aquí (incluida la
 * solicitud ya atendida, 4006). Sin conexión (HU-22) quedan deshabilitadas con el aviso del panel.
 */

import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { PWA } from "../../theme/disenoPwa";
import { pendientesEnConflicto } from "./panelAdministrador.logica";
import { estilos } from "./PanelAdministrador.styles";

function Boton({ etiqueta, accesible, onPress, estilo, estiloTexto, deshabilitado, cargando }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={accesible || etiqueta}
      accessibilityState={{ disabled: !!deshabilitado }}
      style={({ hovered, focused }) => [
        estilo,
        estilos.botonDetalle,
        (hovered || focused) && !deshabilitado && estilos.botonFoco,
        focused && estilos.focoVisible,
        deshabilitado && estilos.botonDeshabilitado,
      ]}
    >
      {cargando ? <ActivityIndicator color={PWA.fondo} /> : <Text style={estiloTexto}>{etiqueta}</Text>}
    </Pressable>
  );
}

export default function AccionesSolicitud({ solicitud: s, panel }) {
  const error = panel.erroresPorId[s.id];
  const confirmando = panel.porConfirmar && panel.porConfirmar.id === s.id ? panel.porConfirmar.accion : null;
  const procesando = panel.procesandoId === s.id;
  const bloqueadas = !!panel.procesandoId || !panel.puedeAtender;

  if (s.estado !== "pendiente") {
    return (
      <Text style={estilos.atendida} accessibilityLiveRegion="polite">
        Esta solicitud ya fue {s.estado === "confirmada" ? "aceptada: la fecha está bloqueada en tu calendario." : "rechazada: la fecha sigue disponible."}
      </Text>
    );
  }

  let cuerpo;
  if (confirmando) {
    const conflictos = pendientesEnConflicto(panel.solicitudes, s);
    const aceptar = confirmando === "aceptar";
    cuerpo = (
      <View style={estilos.confirmacion} accessibilityLiveRegion="polite">
        <Text style={estilos.confirmacionTexto}>
          {aceptar
            ? `¿Aceptar la solicitud de ${s.nombreCliente}? La fecha quedará bloqueada en tu calendario` +
              (conflictos > 0 ? ` y se rechazarán ${conflictos} solicitud(es) pendiente(s) del mismo día.` : ".")
            : `¿Rechazar la solicitud de ${s.nombreCliente}? La fecha seguirá disponible.`}
        </Text>
        <View style={estilos.accionesDetalle}>
          <Boton etiqueta="Cancelar" onPress={panel.cancelarConfirmacion} deshabilitado={procesando} estilo={estilos.botonCancelar} estiloTexto={estilos.botonCancelarTexto} />
          <Boton
            etiqueta={aceptar ? "Sí, aceptar" : "Sí, rechazar"}
            accesible={aceptar ? "Sí, aceptar la solicitud" : "Sí, rechazar la solicitud"}
            onPress={panel.confirmarAccion}
            deshabilitado={procesando || !panel.puedeAtender}
            cargando={procesando}
            estilo={aceptar ? estilos.botonAceptar : estilos.botonPeligro}
            estiloTexto={estilos.botonAceptarTexto}
          />
        </View>
      </View>
    );
  } else {
    cuerpo = (
      <View style={estilos.accionesDetalle}>
        <Boton
          etiqueta="Rechazar solicitud"
          accesible={`Rechazar la solicitud de ${s.nombreCliente}`}
          onPress={() => panel.pedirConfirmacion(s.id, "rechazar")}
          deshabilitado={bloqueadas}
          estilo={estilos.botonRechazar}
          estiloTexto={estilos.botonRechazarTexto}
        />
        <Boton
          etiqueta="Aceptar solicitud"
          accesible={`Aceptar la solicitud de ${s.nombreCliente}`}
          onPress={() => panel.pedirConfirmacion(s.id, "aceptar")}
          deshabilitado={bloqueadas}
          estilo={estilos.botonAceptar}
          estiloTexto={estilos.botonAceptarTexto}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {cuerpo}
      {error ? <Text style={estilos.errorTarjeta} accessibilityRole="alert">{error}</Text> : null}
    </View>
  );
}
