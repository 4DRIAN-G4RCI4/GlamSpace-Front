/**
 * GlamSpaces · Lista de solicitudes del administrador (ajuste de usabilidad, HU-19).
 * Filtro por estado (con conteo), orden por fecha del evento o por las más recientes, tarjetas con
 * cliente, fecha, tipo, invitados, paquete y salón, y "Ver más" de 10 en 10. Cada tarjeta abre el
 * detalle de la solicitud. La lógica (filtrar, ordenar, contar, paginar) es pura:
 * panelAdministrador.logica.js.
 */

import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import EtiquetaEstado from "../../components/EtiquetaEstado";
import { formatearFechaLarga } from "../../utils/fechas";
import {
  FILTROS_ESTADO,
  ORDENES,
  contarPorEstado,
  listaDeSolicitudes,
  paginaVisible,
} from "./panelAdministrador.logica";
import { estilos } from "./ListaSolicitudes.styles";

const mayuscula = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

function Chip({ texto, activo, onPress, etiqueta }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta || texto}
      aria-pressed={activo}
      style={({ focused }) => [estilos.chip, activo && estilos.chipActivo, focused && estilos.foco]}
    >
      <Text style={activo ? estilos.chipTextoActivo : estilos.chipTexto}>{texto}</Text>
    </Pressable>
  );
}

function TarjetaSolicitud({ s, ancho, onAbrir }) {
  return (
    <Pressable
      onPress={() => onAbrir(s.id)}
      accessibilityRole="link"
      accessibilityLabel={`Ver detalle de la solicitud de ${s.nombreCliente}, ${s.estado}`}
      style={({ hovered, focused }) => [
        estilos.tarjeta,
        { width: ancho },
        s.estado === "pendiente" && estilos.tarjetaPendiente,
        hovered && estilos.hover,
        focused && estilos.foco,
      ]}
    >
      <View style={estilos.filaArriba}>
        <Text style={estilos.cliente}>{s.nombreCliente}</Text>
        <EtiquetaEstado estado={s.estado} />
      </View>
      <Text style={estilos.fecha}>{mayuscula(formatearFechaLarga(s.fechaEvento))}</Text>
      <Text style={estilos.detalle}>
        {s.tipoEvento} · {s.numeroInvitados} invitados · {s.nombrePaquete || "Sin paquete"}
      </Text>
      <Text style={estilos.salon}>{s.nombreSalon}</Text>
      <Text style={estilos.verDetalle}>Ver detalle →</Text>
    </Pressable>
  );
}

export default function ListaSolicitudes({ solicitudes, movil, anchoContenido, onAbrir }) {
  const conteo = contarPorEstado(solicitudes);
  // Empieza en las pendientes (lo que el admin tiene que atender); si no hay, en todas.
  const [estado, setEstado] = useState(conteo.pendiente > 0 ? "pendiente" : "todas");
  const [orden, setOrden] = useState("proximas");
  const [paginas, setPaginas] = useState(1);

  useEffect(() => setPaginas(1), [estado, orden]);

  const lista = listaDeSolicitudes(solicitudes, estado, orden);
  const { visibles, hayMas } = paginaVisible(lista, paginas);
  const dosColumnas = anchoContenido >= 900;
  const anchoTarjeta = dosColumnas ? (anchoContenido - 14) / 2 : "100%";
  const Grupo = movil ? ScrollView : View;
  const propsGrupo = movil
    ? { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: estilos.grupoMovil }
    : { style: estilos.grupo };

  return (
    <View style={estilos.seccion}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo} accessibilityRole="header" aria-level={2}>Solicitudes</Text>
        <Text style={estilos.contador}>{lista.length} de {conteo.todas}</Text>
      </View>

      <View style={estilos.controles}>
        <Grupo {...propsGrupo} accessibilityLabel="Filtrar por estado">
          {FILTROS_ESTADO.map((f) => (
            <Chip
              key={f.clave}
              texto={`${f.texto} (${conteo[f.clave]})`}
              etiqueta={`${f.texto}: ${conteo[f.clave]}`}
              activo={estado === f.clave}
              onPress={() => setEstado(f.clave)}
            />
          ))}
        </Grupo>
        <View style={estilos.grupo} accessibilityLabel="Ordenar">
          <Text style={estilos.grupoEtiqueta}>Ordenar por:</Text>
          {ORDENES.map((o) => (
            <Chip key={o.clave} texto={o.texto} activo={orden === o.clave} onPress={() => setOrden(o.clave)} />
          ))}
        </View>
      </View>

      {visibles.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={estilos.vacioTitulo}>
            {estado === "todas" ? "Todavía no hay solicitudes" : `No hay solicitudes ${FILTROS_ESTADO.find((f) => f.clave === estado).texto.toLowerCase()}`}
          </Text>
          <Text style={estilos.vacioTexto}>Cuando un cliente pida una fecha de tu salón, aparecerá aquí.</Text>
          {estado !== "todas" ? (
            <Pressable onPress={() => setEstado("todas")} accessibilityRole="button" style={({ focused }) => [estilos.boton, focused && estilos.foco]}>
              <Text style={estilos.botonTexto}>Ver todas</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={estilos.rejilla}>
          {visibles.map((s) => (
            <TarjetaSolicitud key={s.id} s={s} ancho={anchoTarjeta} onAbrir={onAbrir} />
          ))}
        </View>
      )}

      {hayMas ? (
        <Pressable onPress={() => setPaginas(paginas + 1)} accessibilityRole="button" style={({ focused }) => [estilos.boton, { alignSelf: "center" }, focused && estilos.foco]}>
          <Text style={estilos.botonTexto}>Ver más solicitudes</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
