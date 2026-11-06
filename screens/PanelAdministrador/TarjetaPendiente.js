/**
 * GlamSpaces · HU-19 · Tarjeta de una solicitud pendiente (Figma Admin 02).
 *
 * Escritorio: datos a la izquierda y "Pendiente · Rechazar · Aceptar" a la derecha.
 * Móvil: datos y etiqueta arriba, los dos botones abajo a lo ancho.
 * Al tocar un botón se pide confirmar dentro de la misma tarjeta; si la API responde con
 * error, el mensaje aparece aquí y la tarjeta se queda en la lista (criterio 4).
 */

import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { PWA } from "../../theme/disenoPwa";
import { detalleSolicitud } from "./panelAdministrador.logica";
import { estilos } from "./PanelAdministrador.styles";

function Boton({ etiqueta, onPress, estilo, estiloTexto, deshabilitado, accesible }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={accesible || etiqueta}
      accessibilityState={{ disabled: !!deshabilitado }}
      style={({ hovered, focused, pressed }) => [
        estilo,
        (hovered || focused || pressed) && !deshabilitado && estilos.botonFoco,
        deshabilitado && estilos.botonDeshabilitado,
      ]}
    >
      <Text style={estiloTexto}>{etiqueta}</Text>
    </Pressable>
  );
}

export function EtiquetaEstado({ estado, movil }) {
  const colores = {
    pendiente: [PWA.pendienteFondo, PWA.pendienteTexto, "Pendiente"],
    confirmada: [PWA.confirmadaFondo, PWA.confirmadaTexto, "Confirmada"],
    rechazada: [PWA.rechazadaFondo, PWA.peligro, "Rechazada"],
  }[estado] || [PWA.borde, PWA.textoSecundario, estado];

  return (
    <View style={[estilos.etiqueta, movil && estilos.etiquetaMovil, { backgroundColor: colores[0] }]}>
      <Text style={[movil ? estilos.etiquetaTextoMovil : estilos.etiquetaTexto, { color: colores[1] }]}>{colores[2]}</Text>
    </View>
  );
}

function Confirmacion({ solicitud, accion, conflictos, procesando, onConfirmar, onCancelar }) {
  const aceptar = accion === "aceptar";
  const mensaje = aceptar
    ? `¿Aceptar la solicitud de ${solicitud.nombreCliente}? La fecha quedará bloqueada en tu calendario` +
      (conflictos > 0 ? ` y se rechazarán ${conflictos} solicitud(es) pendiente(s) del mismo día.` : ".")
    : `¿Rechazar la solicitud de ${solicitud.nombreCliente}? La fecha seguirá disponible.`;

  return (
    <View style={estilos.confirmacion} accessibilityLiveRegion="polite">
      <Text style={estilos.confirmacionTexto}>{mensaje}</Text>
      <View style={estilos.confirmacionBotones}>
        <Boton etiqueta="Cancelar" onPress={onCancelar} deshabilitado={procesando} estilo={estilos.botonCancelar} estiloTexto={estilos.botonCancelarTexto} />
        <Pressable
          onPress={onConfirmar}
          disabled={procesando}
          accessibilityRole="button"
          accessibilityLabel={aceptar ? "Sí, aceptar la solicitud" : "Sí, rechazar la solicitud"}
          style={({ hovered, focused }) => [
            aceptar ? estilos.botonAceptar : estilos.botonPeligro,
            (hovered || focused) && estilos.botonFoco,
            procesando && estilos.botonDeshabilitado,
          ]}
        >
          {procesando ? (
            <ActivityIndicator color={PWA.fondo} />
          ) : (
            <Text style={estilos.botonAceptarTexto}>{aceptar ? "Sí, aceptar" : "Sí, rechazar"}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default function TarjetaPendiente({
  solicitud,
  movil,
  porConfirmar,
  conflictos,
  procesando,
  bloqueada,
  error,
  onAceptar,
  onRechazar,
  onConfirmar,
  onCancelar,
}) {
  const nombre = solicitud.nombreCliente;
  const confirmando = porConfirmar && porConfirmar.id === solicitud.id ? porConfirmar.accion : null;

  const botones = (
    <>
      <Boton
        etiqueta="Rechazar"
        accesible={`Rechazar la solicitud de ${nombre}`}
        onPress={onRechazar}
        deshabilitado={bloqueada}
        estilo={[estilos.botonRechazar, movil && estilos.botonMovil]}
        estiloTexto={[estilos.botonRechazarTexto, movil && estilos.botonTextoMovil]}
      />
      <Boton
        etiqueta="Aceptar"
        accesible={`Aceptar la solicitud de ${nombre}`}
        onPress={onAceptar}
        deshabilitado={bloqueada}
        estilo={[estilos.botonAceptar, movil && estilos.botonMovil]}
        estiloTexto={[estilos.botonAceptarTexto, movil && estilos.botonTextoMovil]}
      />
    </>
  );

  return (
    <View style={[estilos.tarjeta, movil && estilos.tarjetaMovil]} accessibilityLabel={`Solicitud de ${nombre}`}>
      <View style={movil ? estilos.tarjetaFilaMovil : estilos.tarjetaFila}>
        <View style={estilos.tarjetaDatos}>
          <Text style={movil ? estilos.tarjetaNombreMovil : estilos.tarjetaNombre}>{nombre}</Text>
          <Text style={movil ? estilos.tarjetaDetalleMovil : estilos.tarjetaDetalle}>
            {detalleSolicitud(solicitud)}
            {solicitud.tipoEvento ? ` · ${solicitud.tipoEvento}` : ""}
          </Text>
        </View>
        {movil ? (
          <EtiquetaEstado estado="pendiente" movil />
        ) : (
          <View style={estilos.tarjetaAcciones}>
            <EtiquetaEstado estado="pendiente" />
            {confirmando ? null : botones}
          </View>
        )}
      </View>

      {movil && !confirmando ? <View style={estilos.botonesMovil}>{botones}</View> : null}

      {confirmando ? (
        <Confirmacion
          solicitud={solicitud}
          accion={confirmando}
          conflictos={conflictos}
          procesando={procesando}
          onConfirmar={onConfirmar}
          onCancelar={onCancelar}
        />
      ) : null}

      {error ? (
        <Text style={estilos.errorTarjeta} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
