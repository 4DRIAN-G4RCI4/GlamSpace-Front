/**
 * GlamSpaces · Mis solicitudes (Sprint 5 · HU-16, criterio 4)
 *
 * El cliente ve sus solicitudes de reservación, de la más reciente a la más vieja,
 * con su estado: pendiente, confirmada o rechazada.
 *
 *   - MisSolicitudesScreen.js   → pantalla (JSX)   [este archivo]
 *   - MisSolicitudes.styles.js  → estilos
 *   - useMisSolicitudes.js      → lógica / estado
 *
 * Ajuste de usabilidad: barra superior fija (components/BarraNavegacion) y el detalle de cada
 * solicitud con su salón (components/DetalleSolicitud, el mismo del panel, sin acciones de admin).
 * El detalle se abre con la ruta { solicitudId }, así Atrás del navegador regresa a la lista.
 */

import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import TarjetaSolicitud from "../../components/TarjetaSolicitud";
import BarraNavegacion from "../../components/BarraNavegacion";
import DetalleSolicitud from "../../components/DetalleSolicitud";
import useSalonDeSolicitud from "../../components/useSalonDeSolicitud";
import { Bloque } from "../../components/Esqueleto";
import { COLORES } from "../../theme/colores";
import { ESPACIO } from "../../theme/espaciado";
import BotonRegresar from "../../components/BotonRegresar";
import Paginacion from "../../components/Paginacion";
import FotoSalon from "../../components/FotoSalon";
import { FILTROS_ESTADO, ORDENES_CLIENTE } from "./misSolicitudes.logica";
import useMisSolicitudes from "./useMisSolicitudes";
import { estilos } from "./MisSolicitudes.styles";

function ListaEsqueleto() {
  return (
    <View accessibilityLabel="Cargando solicitudes">
      {[0, 1, 2].map((i) => (
        <Bloque key={i} style={{ height: 150, marginBottom: ESPACIO.md }} />
      ))}
    </View>
  );
}

function Aviso({ titulo, texto, boton, onPress }) {
  return (
    <View style={estilos.aviso}>
      <Text style={estilos.avisoTitulo}>{titulo}</Text>
      <Text style={estilos.avisoTexto}>{texto}</Text>
      {boton ? (
        <Pressable style={estilos.boton} onPress={onPress} accessibilityRole="button">
          <Text style={estilos.botonTexto}>{boton}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Chip({ texto, etiqueta, activo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta || texto}
      accessibilityState={{ selected: activo }}
      style={({ hovered, focused, pressed }) => [
        estilos.chip,
        activo && estilos.chipActivo,
        (hovered || pressed) && !activo && estilos.chipHover,
        focused && estilos.foco,
      ]}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

// Tarjeta con la foto del salon. `fotoPrincipal` llega del back cuando exista; si no hay
// (o la URL da 404) se pinta el marcador, sin pedir el salon de cada solicitud.
function TarjetaConFoto({ s, ancho, onVerDetalle, accion, aviso }) {
  return (
    <View style={[estilos.tarjetaFoto, { width: ancho }]}>
      <View style={estilos.tarjetaFotoImagen}>
        <FotoSalon uri={s.fotoPrincipal} nombre={s.nombreSalon} style={estilos.foto} tamanoInicial={40} />
      </View>
      <TarjetaSolicitud solicitud={s} onVerDetalle={onVerDetalle} accion={accion} />
      {aviso ? <Text style={estilos.avisoEstado} accessibilityLiveRegion="polite">{aviso}</Text> : null}
    </View>
  );
}

export default function MisSolicitudesScreen({ navigation, route }) {
  const f = useMisSolicitudes();
  const ir = (nombre, p) => navigation && navigation.navigate(nombre, p);
  const { width } = useWindowDimensions();
  const solicitudId = (route && route.params && route.params.solicitudId) || null;
  const abierta = solicitudId ? f.solicitudes.find((x) => x.id === solicitudId) || null : null;
  const salonDeSolicitud = useSalonDeSolicitud(f.sesion && f.sesion.id, abierta && abierta.salonId);
  const inicioLista = React.useRef(null);

  // Al cambiar de pagina se sube al inicio de la lista.
  function irAPaginaArriba(n) {
    f.irAPagina(n);
    if (inicioLista.current && inicioLista.current.scrollIntoView) {
      inicioLista.current.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }

  let contenido;
  if (f.cargandoSesion) {
    contenido = <ActivityIndicator color={COLORES.morado} size="large" />;
  } else if (!f.esCliente) {
    contenido = (
      <Aviso
        titulo="Inicia sesión como cliente"
        texto="Aquí verás tus solicitudes de reservación y si el salón las confirmó."
        boton="Iniciar sesión"
        onPress={() => ir("Login", { volverA: { nombre: "MisSolicitudes", params: {} } })}
      />
    );
  } else if (f.error && f.solicitudes.length === 0) {
    contenido = <Aviso titulo="No se pudieron cargar tus solicitudes" texto={f.error} boton="Reintentar" onPress={f.recargar} />;
  } else if (f.cargando && f.solicitudes.length === 0) {
    contenido = <ListaEsqueleto />;
  } else if (f.sinResultados && f.conteo.todas === 0) {
    contenido = (
      <Aviso
        titulo="Todavía no tienes solicitudes"
        texto="Elige un salón, una fecha disponible y envía tu solicitud."
        boton="Buscar salones"
        onPress={() => ir("BusquedaSalones")}
      />
    );
  } else {
    // Dos columnas desde tableta; una en telefono.
    const dosColumnas = width >= 700;
    const anchoTarjeta = dosColumnas ? "48.5%" : "100%";

    contenido = (
      <>
        {/* Filtros con los contadores del TOTAL, no de la pagina que se ve */}
        <View style={estilos.controles}>
          <ScrollView
            horizontal={!dosColumnas}
            scrollEnabled={!dosColumnas}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.chips}
            accessibilityLabel="Filtrar por estado"
          >
            {FILTROS_ESTADO.map((x) => (
              <Chip
                key={x.clave}
                texto={`${x.texto} (${f.conteo[x.clave]})`}
                etiqueta={`${x.texto}: ${f.conteo[x.clave]}`}
                activo={f.estado === x.clave}
                onPress={() => f.cambiarEstado(x.clave)}
              />
            ))}
          </ScrollView>
          <View style={estilos.chips} accessibilityLabel="Ordenar">
            <Text style={estilos.chipsEtiqueta}>Ordenar por:</Text>
            {ORDENES_CLIENTE.map((o) => (
              <Chip key={o.clave} texto={o.texto} activo={f.orden === o.clave} onPress={() => f.cambiarOrden(o.clave)} />
            ))}
          </View>
        </View>

        {f.sinResultados ? (
          <Aviso
            titulo={f.textoVacio}
            texto="Cambia el filtro para ver otras solicitudes."
            boton="Ver todas"
            onPress={() => f.cambiarEstado("todas")}
          />
        ) : (
          <View style={estilos.rejilla}>
            {f.solicitudes.map((s) => (
              <TarjetaConFoto
                key={s.id}
                s={s}
                ancho={anchoTarjeta}
                onVerDetalle={() => ir("MisSolicitudes", { solicitudId: s.id })}
                accion={{
                  texto: "Actualizar estado",
                  etiqueta: `Actualizar el estado de la solicitud en ${s.nombreSalon}`,
                  onPress: () => f.actualizarEstado(s.id),
                  cargando: f.actualizandoId === s.id,
                }}
                aviso={f.avisos[s.id]}
              />
            ))}
          </View>
        )}

        {f.error ? <Text style={[estilos.mensajeGeneral, estilos.mensajeFail]}>{f.error}</Text> : null}

        <Paginacion
          pagina={f.paginacion.pagina}
          totalPaginas={f.paginacion.totalPaginas}
          totalRegistros={f.paginacion.totalRegistros}
          desde={f.paginacion.desde}
          hasta={f.paginacion.hasta}
          hayAnterior={f.paginacion.hayAnterior}
          haySiguiente={f.paginacion.haySiguiente}
          onPagina={irAPaginaArriba}
          singular="solicitud"
          plural="solicitudes"
          etiqueta="Paginación de mis solicitudes"
        />
      </>
    );
  }

  // Detalle de una solicitud (con su salón), en lugar de la lista.
  if (solicitudId && f.esCliente) {
    let detalle;
    if (abierta) {
      detalle = (
        <DetalleSolicitud
          solicitud={abierta}
          salon={salonDeSolicitud}
          esAdmin={false}
          ancho={Math.min(width, 1080) - 32}
          onVolver={() => ir("MisSolicitudes")}
          onVerSalon={() => ir("DetalleSalon", { salonId: abierta.salonId })}
        />
      );
    } else if (f.cargando || f.cargandoSesion) {
      detalle = <ListaEsqueleto />;
    } else {
      detalle = <Aviso titulo="No encontramos esa solicitud" texto="Regresa a tu lista de solicitudes." boton="Ver mis solicitudes" onPress={() => ir("MisSolicitudes")} />;
    }
    return (
      <View style={estilos.raiz}>
        <BarraNavegacion navigation={navigation} pantalla="MisSolicitudes" />
        <ScrollView style={estilos.raiz} contentContainerStyle={estilos.pantalla}>
          <View style={estilos.contenidoDetalle}>{detalle}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={estilos.raiz}>
      <BarraNavegacion navigation={navigation} pantalla="MisSolicitudes" volverA={{ nombre: "MisSolicitudes", params: {} }} />
      <ScrollView style={estilos.raiz} contentContainerStyle={estilos.pantalla}>
        <View style={estilos.contenido}>
          <View style={estilos.encabezadoLista}>
            <Text style={estilos.titulo} accessibilityRole="header">
              Mis solicitudes
            </Text>
            {f.esCliente ? (
              <Pressable
                onPress={f.recargar}
                accessibilityRole="button"
                accessibilityLabel="Actualizar la lista"
                style={({ hovered, focused }) => [estilos.botonBarra, (hovered || focused) && estilos.botonBarraFoco]}
              >
                <Text style={estilos.botonBarraTexto}>↻ Actualizar</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={estilos.subtitulo}>Consulta si cada salón confirmó o rechazó tu solicitud.</Text>
          {contenido}
        </View>
      </ScrollView>
    </View>
  );
}
