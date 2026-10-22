/**
 * GlamSpaces · HU-13 · Calendario mensual de disponibilidad del salón. Solo presentación:
 * pinta lo que le da useDisponibilidad (el `c` que recibe).
 *
 * Cada día es disponible, ocupado (reservación confirmada), pasado o el elegido.
 * Los ocupados y pasados se pueden tocar, pero solo muestran el aviso (criterio 4).
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Bloque } from "../../components/Esqueleto";
import { DIAS_SEMANA, MESES, claveFecha, semanasDelMes } from "../../utils/fechas";
import { estilos } from "./DetalleSalon.styles";

function estadoDelDia(clave, c) {
  if (clave === c.fechaElegida) return "elegido";
  if (clave <= c.hoy) return "pasado";
  if (c.ocupadas.includes(clave)) return "ocupado";
  return "disponible";
}

const ETIQUETA_ESTADO = {
  elegido: "seleccionado",
  pasado: "no disponible",
  ocupado: "ocupado",
  disponible: "disponible",
};

function Dia({ dia, c }) {
  const clave = claveFecha(c.mes.anio, c.mes.mes, dia);
  const estado = estadoDelDia(clave, c);

  return (
    <Pressable
      onPress={() => c.elegir(clave)}
      accessibilityRole="button"
      accessibilityLabel={`${dia} de ${MESES[c.mes.mes - 1]}, ${ETIQUETA_ESTADO[estado]}`}
      accessibilityState={{ disabled: estado === "pasado" || estado === "ocupado", selected: estado === "elegido" }}
      style={({ hovered, focused }) => [
        estilos.dia,
        estilos[`dia_${estado}`],
        clave === c.hoy && estilos.diaHoy,
        (hovered || focused) && estado === "disponible" && estilos.diaFoco,
      ]}
    >
      <Text style={[estilos.diaTexto, estilos[`diaTexto_${estado}`]]}>{dia}</Text>
    </Pressable>
  );
}

function Leyenda() {
  const items = [
    { texto: "Disponible", estilo: estilos.dia_disponible },
    { texto: "Ocupado", estilo: estilos.dia_ocupado },
    { texto: "Tu fecha", estilo: estilos.dia_elegido },
  ];
  return (
    <View style={estilos.leyenda}>
      {items.map((i) => (
        <View key={i.texto} style={estilos.leyendaItem}>
          <View style={[estilos.leyendaMuestra, i.estilo]} />
          <Text style={estilos.leyendaTexto}>{i.texto}</Text>
        </View>
      ))}
    </View>
  );
}

function BotonMes({ texto, etiqueta, onPress, deshabilitado }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: deshabilitado }}
      style={({ hovered, focused }) => [
        estilos.botonMes,
        (hovered || focused) && !deshabilitado && estilos.botonMesFoco,
        deshabilitado && estilos.botonDeshabilitado,
      ]}
    >
      <Text style={estilos.botonMesTexto}>{texto}</Text>
    </Pressable>
  );
}

export default function CalendarioDisponibilidad({ c }) {
  const semanas = semanasDelMes(c.mes.anio, c.mes.mes);
  const nombreMes = `${MESES[c.mes.mes - 1]} ${c.mes.anio}`;

  let cuadricula;
  if (c.cargando) {
    cuadricula = <Bloque style={{ height: semanas.length * 46 }} />;
  } else if (c.error) {
    cuadricula = (
      <View style={estilos.calendarioError}>
        <Text style={[estilos.mensajeGeneral, estilos.mensajeFail]}>{c.error}</Text>
        <Pressable style={estilos.botonSecundario} onPress={c.reintentar} accessibilityRole="button">
          <Text style={estilos.botonSecundarioTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  } else {
    cuadricula = semanas.map((semana, i) => (
      <View key={i} style={estilos.semana}>
        {semana.map((dia, j) => (
          <View key={j} style={estilos.celda}>
            {dia ? <Dia dia={dia} c={c} /> : null}
          </View>
        ))}
      </View>
    ));
  }

  return (
    <View style={estilos.calendario}>
      <View style={estilos.calendarioEncabezado}>
        <BotonMes texto="‹" etiqueta="Mes anterior" onPress={c.mesAnterior} deshabilitado={!c.puedeRetroceder} />
        <Text style={estilos.calendarioMes} accessibilityLiveRegion="polite">
          {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}
        </Text>
        <BotonMes texto="›" etiqueta="Mes siguiente" onPress={c.mesSiguiente} />
      </View>

      <View style={estilos.semana}>
        {DIAS_SEMANA.map((d) => (
          <View key={d.largo} style={estilos.celda}>
            <Text style={estilos.diaSemana} accessibilityLabel={d.largo}>
              {d.corto}
            </Text>
          </View>
        ))}
      </View>
      {cuadricula}

      <Leyenda />
      {c.aviso ? (
        <Text style={[estilos.mensajeGeneral, estilos.mensajeFail]} accessibilityLiveRegion="assertive">
          {c.aviso}
        </Text>
      ) : null}
    </View>
  );
}
