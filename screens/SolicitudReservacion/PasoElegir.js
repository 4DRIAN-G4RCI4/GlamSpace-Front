/**
 * GlamSpaces · HU-16 · Paso 1 de la reserva (Figma "Desktop — Cliente 04 · Solicitar reservación").
 * Izquierda: resumen del salón, 1. fecha, 2. paquete, 3. detalles del evento. Derecha: "Resumen"
 * con el total estimado y "Continuar" (deshabilitado hasta que todo sea válido).
 * En móvil todo va apilado y el resumen al final. Solo presentación.
 */

import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import Campo from "../../components/Campo";
import FotoSalon from "../../components/FotoSalon";
import CalendarioDisponibilidad from "../DetalleSalon/CalendarioDisponibilidad";
import ResumenReserva from "./ResumenReserva";
import { formatearPrecio } from "../../utils/formato";
import { formatearFechaCorta } from "../../utils/fechas";
import { MEDIDA } from "../../theme/disenoPwa";
import { LIMITE_COMENTARIOS, TIPOS_EVENTO } from "./solicitudReservacion.validaciones";
import { estilos } from "./SolicitudReservacion.styles";

function Seccion({ numero, titulo, opcional, children }) {
  return (
    <View style={estilos.seccionPaso}>
      <Text style={estilos.seccionTitulo} accessibilityRole="header" aria-level={2}>
        {numero}. {titulo}
        {opcional ? <Text style={estilos.seccionOpcional}> (opcional)</Text> : null}
      </Text>
      {children}
    </View>
  );
}

function OpcionPaquete({ paquete, elegido, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: elegido }}
      aria-checked={elegido}
      accessibilityLabel={`${paquete.nombrePaquete}, ${formatearPrecio(paquete.precio)}`}
      style={({ hovered, focused }) => [estilos.opcion, elegido && estilos.opcionActiva, (hovered || focused) && estilos.opcionFoco]}
    >
      <View style={[estilos.radio, elegido && estilos.radioActivo]}>{elegido ? <View style={estilos.radioPunto} /> : null}</View>
      <View style={estilos.opcionTextos}>
        <Text style={estilos.opcionNombre}>{paquete.nombrePaquete}</Text>
        {paquete.descripcion ? <Text style={estilos.opcionDescripcion}>{paquete.descripcion}</Text> : null}
      </View>
      <Text style={estilos.opcionPrecio}>{formatearPrecio(paquete.precio)}</Text>
    </Pressable>
  );
}

function TipoEvento({ f }) {
  return (
    <View>
      <Campo
        etiqueta="Tipo de evento"
        valor={f.tipoEvento}
        onCambiar={f.setTipoEvento}
        onBlur={f.tocar("tipoEvento")}
        placeholder="Ej. Boda, XV años, Cumpleaños"
        error={f.erroresElegir.tipoEvento}
        maxLength={100}
      />
      <View style={estilos.sugerencias}>
        {TIPOS_EVENTO.map((tipo) => {
          const activo = f.tipoEvento.trim() === tipo;
          return (
            <Pressable
              key={tipo}
              onPress={() => {
                f.setTipoEvento(tipo);
                f.tocar("tipoEvento")();
              }}
              accessibilityRole="button"
              accessibilityLabel={`Tipo de evento: ${tipo}`}
              accessibilityState={{ selected: activo }}
              style={({ hovered, focused }) => [estilos.sugerencia, activo && estilos.sugerenciaActiva, (hovered || focused) && !activo && estilos.sugerenciaFoco]}
            >
              <Text style={[estilos.sugerenciaTexto, activo && estilos.sugerenciaTextoActiva]}>{tipo}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function PasoElegir({ f }) {
  const { width } = useWindowDimensions();
  const escritorio = width >= MEDIDA.corteEscritorio;
  const dosColumnas = width >= 600;

  const resumen = (
    <ResumenReserva
      titulo="Resumen"
      filas={[
        { etiqueta: "Fecha", valor: f.fecha ? formatearFechaCorta(f.fecha) : null },
        { etiqueta: "Paquete", valor: f.paqueteElegido ? f.paqueteElegido.nombrePaquete : f.paquetes.length ? null : "Sin paquete" },
        { etiqueta: "Invitados", valor: f.invitados || null },
      ]}
      total={f.total}
      estilo={escritorio ? estilos.resumenFijo : estilos.resumenAbajo}
    >
      <Pressable
        onPress={f.continuar}
        disabled={!f.listoElegir}
        accessibilityRole="button"
        accessibilityState={{ disabled: !f.listoElegir }}
        style={({ hovered, focused }) => [estilos.botonPrincipal, !f.listoElegir && estilos.botonDeshabilitado, (hovered || focused) && f.listoElegir && estilos.botonPrincipalFoco]}
      >
        <Text style={estilos.botonPrincipalTexto}>Continuar</Text>
      </Pressable>
      {f.faltanElegir ? (
        <Text style={estilos.faltan} accessibilityLiveRegion="polite">
          {f.faltanElegir}
        </Text>
      ) : null}
      <Text style={estilos.notaResumen}>No se realizará ningún cobro todavía.</Text>
    </ResumenReserva>
  );

  return (
    <View style={[estilos.dosColumnas, escritorio && estilos.dosColumnasEscritorio]}>
      <View style={estilos.columnaPrincipal}>
        <Text style={estilos.tituloPaso} accessibilityRole="header" aria-level={1}>
          Solicitar reservación
        </Text>

        <View style={estilos.tarjetaSalon}>
          <FotoSalon uri={(f.salon.fotos || [])[0]} nombre={f.salon.nombre} style={estilos.tarjetaSalonFoto} tamanoInicial={26} />
          <View style={estilos.tarjetaSalonTextos}>
            <Text style={estilos.tarjetaSalonNombre}>{f.salon.nombre}</Text>
            <Text style={estilos.tarjetaSalonZona}>
              {f.salon.zona} · Hasta {f.salon.capacidad} invitados
            </Text>
          </View>
        </View>

        <Seccion numero={1} titulo="Elige la fecha">
          <CalendarioDisponibilidad c={f.calendario} />
          {f.erroresElegir.fecha && !f.calendario.aviso ? (
            <Text style={estilos.error} accessibilityLiveRegion="polite">
              {f.erroresElegir.fecha}
            </Text>
          ) : null}
        </Seccion>

        <Seccion numero={2} titulo="Elige tu paquete" opcional={f.paquetes.length === 0}>
          {f.paquetes.length === 0 ? (
            <Text style={estilos.textoSecundario}>Este salón no tiene paquetes publicados; puedes continuar sin elegir uno.</Text>
          ) : (
            <View accessibilityRole="radiogroup" style={estilos.opciones}>
              {f.paquetes.map((p) => (
                <OpcionPaquete key={p.id} paquete={p} elegido={p.id === f.paqueteId} onPress={() => f.elegirPaquete(p.id)} />
              ))}
            </View>
          )}
        </Seccion>

        <Seccion numero={3} titulo="Detalles del evento">
          <TipoEvento f={f} />
          <View style={[estilos.filaCampos, dosColumnas && estilos.filaCamposDos]}>
            <View style={estilos.campoMitad}>
              <Campo
                etiqueta="Número de invitados"
                valor={f.invitados}
                onCambiar={f.setInvitados}
                onBlur={f.tocar("invitados")}
                placeholder="Ej. 120"
                error={f.erroresElegir.invitados}
                pistaExtra={`Hasta ${f.salon.capacidad} personas.`}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={estilos.campoMitad}>
              <Campo
                etiqueta="Teléfono de contacto"
                valor={f.telefono}
                onCambiar={f.setTelefono}
                onBlur={f.tocar("telefono")}
                placeholder="771 123 4567"
                error={f.erroresElegir.telefono}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={16}
              />
            </View>
          </View>
          <Campo
            etiqueta="Comentarios (opcional)"
            valor={f.comentarios}
            onCambiar={f.setComentarios}
            onBlur={f.tocar("comentarios")}
            placeholder="Ej. Necesito acceso para banda en vivo desde las 3:00 pm"
            error={f.erroresElegir.comentarios}
            pistaExtra={`${f.comentarios.length}/${LIMITE_COMENTARIOS}`}
            multilinea
            maxLength={LIMITE_COMENTARIOS}
          />
        </Seccion>

        {escritorio ? null : resumen}
      </View>
      {escritorio ? <View style={estilos.columnaResumen}>{resumen}</View> : null}
    </View>
  );
}
