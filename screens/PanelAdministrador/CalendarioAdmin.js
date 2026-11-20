/**
 * GlamSpaces · HU-19 · Calendario de disponibilidad del salón (Figma Admin 04).
 *
 * Reservado (fondo Stiletto) = la API lo marca ocupado: reservación o solicitud confirmada.
 * Solicitud pendiente (borde dorado) = hay al menos una pendiente ese día.
 * Tras aceptar una solicitud, el panel sube `version` y el mes se vuelve a consultar (criterio 2).
 */

import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { DIAS_SEMANA_DESDE_DOMINGO, MESES, claveFecha, formatearFechaCorta, semanasDelMes } from "../../utils/fechas";
import useCalendarioAdmin from "./useCalendarioAdmin";
import { fechasConPendientes, proximasConfirmadas, resumenDelDia, solicitudesDelDia } from "./panelAdministrador.logica";
import { estilos } from "./PanelAdministrador.styles";

const FLECHA_ANTERIOR = require("../../assets/admin/flecha-anterior.svg");
const FLECHA_SIGUIENTE = require("../../assets/admin/flecha-siguiente.svg");

function Flecha({ fuente, etiqueta, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ hovered, focused }) => [estilos.calendarioFlecha, (hovered || focused) && estilos.navEnlaceFoco]}
    >
      <Image source={fuente} style={{ width: 17, height: 17 }} accessibilityIgnoresInvertColors />
    </Pressable>
  );
}

function Leyenda() {
  return (
    <View style={estilos.leyenda}>
      <View style={estilos.leyendaItem}>
        <View style={estilos.leyendaMuestra} />
        <Text style={estilos.leyendaTexto}>Disponible</Text>
      </View>
      <View style={estilos.leyendaItem}>
        <View style={[estilos.leyendaMuestra, estilos.leyendaReservado]} />
        <Text style={estilos.leyendaTexto}>Reservado</Text>
      </View>
      <View style={estilos.leyendaItem}>
        <View style={[estilos.leyendaMuestra, estilos.leyendaPendiente]} />
        <Text style={estilos.leyendaTexto}>Solicitud pendiente</Text>
      </View>
    </View>
  );
}

function ProximasConfirmadas({ solicitudes, hoy, movil }) {
  const proximas = proximasConfirmadas(solicitudes, hoy);
  return (
    <View style={movil ? estilos.proximasMovil : estilos.proximas}>
      <Text style={movil ? estilos.tituloSeccionMovil : estilos.tituloSeccion} accessibilityRole="header">
        Próximas reservas confirmadas
      </Text>
      {proximas.length === 0 ? (
        <Text style={estilos.leyendaTexto}>Todavía no tienes reservas confirmadas.</Text>
      ) : (
        proximas.map((s) => (
          <View key={s.id} style={estilos.proxima}>
            <View style={estilos.tarjetaDatos}>
              <Text style={estilos.proximaNombre}>
                {formatearFechaCorta(s.fechaEvento, { conAnio: false })} — {s.nombreCliente}
              </Text>
              <Text style={estilos.proximaDetalle}>
                {s.nombrePaquete || "Sin paquete"} · {s.numeroInvitados} inv.
              </Text>
            </View>
            <View style={estilos.proximaPunto} />
          </View>
        ))
      )}
    </View>
  );
}

export default function CalendarioAdmin({ adminId, salonId, solicitudes, version, movil, onAbrir }) {
  const cal = useCalendarioAdmin(adminId, salonId, version);
  const [diaEncima, setDiaEncima] = useState(null); // día con el puntero encima (muestra el globo)
  const pendientes = fechasConPendientes(solicitudes);
  const ocupadas = new Set(cal.ocupadas);
  const semanas = semanasDelMes(cal.mes.anio, cal.mes.mes, { desdeDomingo: true });
  const nombreMes = MESES[cal.mes.mes - 1];
  const titulo = `${nombreMes[0].toUpperCase()}${nombreMes.slice(1)} ${cal.mes.anio}`;

  const tarjeta = (
    <View style={[estilos.calendarioTarjeta, movil && estilos.calendarioTarjetaMovil]}>
      <View style={estilos.calendarioEncabezado}>
        <Flecha fuente={FLECHA_ANTERIOR} etiqueta="Mes anterior" onPress={cal.mesAnterior} />
        <Text style={estilos.calendarioMes} accessibilityRole="header" accessibilityLiveRegion="polite">
          {titulo}
        </Text>
        <Flecha fuente={FLECHA_SIGUIENTE} etiqueta="Mes siguiente" onPress={cal.mesSiguiente} />
      </View>

      <View style={[estilos.calendarioSemana, movil && estilos.calendarioSemanaMovil]}>
        {DIAS_SEMANA_DESDE_DOMINGO.map((d) => (
          <View key={d.largo} style={estilos.calendarioDiaSemana}>
            <Text style={estilos.calendarioDiaSemanaTexto} accessibilityLabel={d.largo}>
              {d.corto}
            </Text>
          </View>
        ))}
      </View>

      {cal.error ? (
        <View style={estilos.errorCaja}>
          <Text style={estilos.errorTexto} accessibilityRole="alert">{cal.error}</Text>
          <Pressable onPress={cal.reintentar} accessibilityRole="button" style={estilos.botonCancelar}>
            <Text style={estilos.botonCancelarTexto}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        semanas.map((semana, i) => (
          <View
            key={i}
            style={[
              estilos.calendarioSemana,
              movil && estilos.calendarioSemanaMovil,
              semana.some((d) => d && claveFecha(cal.mes.anio, cal.mes.mes, d) === diaEncima) && estilos.calendarioSemanaEncima,
            ]}
          >
            {semana.map((dia, j) => {
              if (!dia) return <View key={j} style={[estilos.calendarioCelda, movil && estilos.calendarioCeldaMovil]} />;
              const clave = claveFecha(cal.mes.anio, cal.mes.mes, dia);
              const reservado = ocupadas.has(clave);
              const pendiente = !reservado && pendientes.has(clave);
              const pasado = clave < cal.hoy;
              const estado = reservado ? "reservado" : pendiente ? "con solicitud pendiente" : pasado ? "pasado" : "disponible";
              // Pasar el puntero muestra quién pidió ese día; tocarlo abre la solicitud.
              const delDia = solicitudesDelDia(solicitudes, clave);
              const conSolicitud = delDia.length > 0 && !!onAbrir;
              const Celda = conSolicitud ? Pressable : View;
              const interaccion = conSolicitud
                ? {
                    onPress: () => onAbrir(delDia[0].id),
                    onHoverIn: () => setDiaEncima(clave),
                    onHoverOut: () => setDiaEncima(null),
                    accessibilityRole: "button",
                    accessibilityHint: "Abre la solicitud de este día",
                  }
                : {};
              return (
                <Celda
                  key={j}
                  {...interaccion}
                  accessibilityLabel={`${formatearFechaCorta(clave)}: ${estado}${conSolicitud ? `. ${resumenDelDia(delDia)}` : ""}`}
                  style={[
                    estilos.calendarioCelda,
                    movil && estilos.calendarioCeldaMovil,
                    reservado && estilos.calendarioReservado,
                    pendiente && estilos.calendarioPendiente,
                    conSolicitud && estilos.calendarioCeldaConSolicitud,
                  ]}
                >
                  <Text
                    style={
                      reservado
                        ? estilos.calendarioDiaReservado
                        : pendiente
                          ? estilos.calendarioDiaPendiente
                          : pasado
                            ? estilos.calendarioDiaPasado
                            : estilos.calendarioDiaTexto
                    }
                  >
                    {dia}
                  </Text>
                  {diaEncima === clave && conSolicitud ? (
                    <View style={estilos.calendarioGlobo} pointerEvents="none">
                      <Text style={estilos.calendarioGloboTexto}>{resumenDelDia(delDia)}</Text>
                    </View>
                  ) : null}
                </Celda>
              );
            })}
          </View>
        ))
      )}

      {cal.cargando ? <Text style={estilos.calendarioCargando}>Consultando disponibilidad…</Text> : null}
      <Leyenda />
    </View>
  );

  return movil ? (
    <View style={estilos.calendarioColumna}>
      {tarjeta}
      <ProximasConfirmadas solicitudes={solicitudes} hoy={cal.hoy} movil />
    </View>
  ) : (
    <View style={estilos.calendarioFila}>
      {tarjeta}
      <ProximasConfirmadas solicitudes={solicitudes} hoy={cal.hoy} />
    </View>
  );
}
