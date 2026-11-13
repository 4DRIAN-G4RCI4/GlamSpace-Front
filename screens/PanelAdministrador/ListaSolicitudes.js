/**
 * GlamSpaces · Lista de solicitudes del administrador (ajuste de usabilidad, HU-19).
 * Filtro por estado (con conteo), orden por fecha del evento o por las más recientes, tarjetas con
 * cliente, fecha, tipo, invitados, paquete y salón, y "Ver más" de 10 en 10. Cada tarjeta abre el
 * detalle de la solicitud. La lógica (filtrar, ordenar, contar, paginar) es pura:
 * panelAdministrador.logica.js.
 */

import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import EtiquetaEstado from "../../components/EtiquetaEstado";
import { formatearFechaLarga } from "../../utils/fechas";
import {
  FILTROS_ESTADO,
  ORDENES,
  contarPorEstado,
  listaDeSolicitudes,
} from "./panelAdministrador.logica";
import { estilos } from "./ListaSolicitudes.styles";
import Paginacion from "../../components/Paginacion";
import { POR_PAGINA_SOLICITUDES, paginar } from "../../services/paginacion.logica";

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
  // Página actual: vuelve a 1 cuando cambian los filtros o el orden.
  const [pagina, setPagina] = useState(1);
  const inicioLista = useRef(null);

  useEffect(() => setPagina(1), [estado, orden]);

  const lista = listaDeSolicitudes(solicitudes, estado, orden);
  // 2 columnas × 5 filas = 10 por página.
  const p = paginar(lista, pagina, POR_PAGINA_SOLICITUDES);

  // Al cambiar de página se sube al inicio de la lista, no al final de la anterior.
  function irAPagina(n) {
    setPagina(n);
    if (inicioLista.current && inicioLista.current.scrollIntoView) {
      inicioLista.current.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }
  // Dos columnas desde tableta; en teléfono queda una sola (petición del Sprint 7).
  const dosColumnas = anchoContenido >= 700;
  const anchoTarjeta = dosColumnas ? (anchoContenido - 14) / 2 : "100%";
  const Grupo = movil ? ScrollView : View;
  const propsGrupo = movil
    ? { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: estilos.grupoMovil }
    : { style: estilos.grupo };

  return (
    <View style={estilos.seccion} ref={inicioLista}>
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

      {p.visibles.length === 0 ? (
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
          {p.visibles.map((s) => (
            <TarjetaSolicitud key={s.id} s={s} ancho={anchoTarjeta} onAbrir={onAbrir} />
          ))}
        </View>
      )}

      <Paginacion
        pagina={p.pagina}
        totalPaginas={p.totalPaginas}
        totalRegistros={p.totalRegistros}
        desde={p.desde}
        hasta={p.hasta}
        hayAnterior={p.hayAnterior}
        haySiguiente={p.haySiguiente}
        onPagina={irAPagina}
        singular="solicitud"
        plural="solicitudes"
        etiqueta="Paginación de solicitudes"
      />
    </View>
  );
}
