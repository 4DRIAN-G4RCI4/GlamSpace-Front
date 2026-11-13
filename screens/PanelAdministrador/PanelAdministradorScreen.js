/**
 * GlamSpaces · Panel de administrador de solicitudes (Sprint 6 · HU-19)
 *
 * El administrador ve las solicitudes pendientes de su salón, ordenadas por fecha del evento, y
 * las acepta o rechaza. El calendario del salón refleja cada acción. Diseño: Figma "PROYECTO--PWA",
 * Admin 02 · Panel de solicitudes (escritorio y móvil) y Admin 04 · Calendario de disponibilidad.
 *
 *   - PanelAdministradorScreen.js    → pantalla (JSX)   [este archivo]
 *   - PanelAdministrador.styles.js   → estilos
 *   - usePanelAdministrador.js       → lógica / estado
 *   - panelAdministrador.logica.js   → reglas puras (orden, cifras, historial)
 *   - ListaSolicitudes.js, AccionesSolicitud.js, CalendarioAdmin.js → piezas de la pantalla
 *   - components/DetalleSolicitud.js  → detalle de una solicitud con su salón (Figma Admin 03)
 *
 * Ajuste de usabilidad (HU-19 / navegación): lista con filtros por estado y orden, y detalle de cada
 * solicitud con el salón (fotos, descripción) y las acciones. El detalle se abre con la ruta
 * { pestana: "solicitudes", solicitudId }, así Atrás del navegador regresa a la lista.
 */

import React, { useEffect } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { MEDIDA } from "../../theme/disenoPwa";
import { formatearPrecio } from "../../utils/formato";
import { fechaHoy } from "../../utils/fechas";
import usePanelAdministrador from "./usePanelAdministrador";
import { nombreDeNegocio } from "../../services/sesion.logica";
import CalendarioAdmin from "./CalendarioAdmin";
import ListaSolicitudes from "./ListaSolicitudes";
import AccionesSolicitud from "./AccionesSolicitud";
import DetalleSolicitud from "../../components/DetalleSolicitud";
import useSalonDeSolicitud from "../../components/useSalonDeSolicitud";
import LayoutAdmin from "./LayoutAdmin";
import BannerSinConexion from "./BannerSinConexion";
import { estadisticas } from "./panelAdministrador.logica";
import { estilos } from "./PanelAdministrador.styles";

// Solo aparece si el administrador tiene más de un salón. En móvil es una fila con scroll horizontal.
function SelectorSalones({ salones, salonId, onElegir, movil }) {
  if (salones.length < 2) return null;
  const Contenedor = movil ? ScrollView : View;
  const props = movil
    ? { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: estilos.selectorSalonesMovil }
    : { style: estilos.selectorSalones };
  return (
    <Contenedor {...props} accessibilityLabel="Elige el salón">
      {salones.map((s) => {
        const activo = s.id === salonId;
        return (
          <Pressable
            key={s.id}
            onPress={() => onElegir(s.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            style={[estilos.chipSalon, activo && estilos.chipSalonActivo]}
          >
            <Text style={activo ? estilos.chipSalonTextoActivo : estilos.chipSalonTexto}>{s.nombre}</Text>
          </Pressable>
        );
      })}
    </Contenedor>
  );
}

function Cifras({ solicitudes }) {
  const c = estadisticas(solicitudes, fechaHoy().clave);
  const tarjetas = [
    [String(c.pendientes), "Solicitudes pendientes"],
    [String(c.aceptadasMes), "Aceptadas este mes"],
    [formatearPrecio(c.ingresosMes), "Ingresos este mes"],
  ];
  return (
    <View style={estilos.cifras}>
      {tarjetas.map(([valor, etiqueta]) => (
        <View key={etiqueta} style={estilos.cifra}>
          <Text style={estilos.cifraValor}>{valor}</Text>
          <Text style={estilos.cifraEtiqueta}>{etiqueta}</Text>
        </View>
      ))}
    </View>
  );
}

function SeccionSolicitudes({ panel, movil, anchoContenido, onAbrir }) {
  return (
    <>
      {!movil ? <Cifras solicitudes={panel.solicitudes} /> : null}
      <ListaSolicitudes solicitudes={panel.solicitudes} movil={movil} anchoContenido={anchoContenido} onAbrir={onAbrir} />
    </>
  );
}

function Aviso({ texto, onCerrar }) {
  if (!texto) return null;
  return (
    <View style={estilos.aviso} accessibilityRole="alert">
      <Text style={estilos.avisoTexto}>{texto}</Text>
      <Pressable onPress={onCerrar} accessibilityRole="button" accessibilityLabel="Cerrar aviso">
        <Text style={estilos.avisoCerrar}>✕</Text>
      </Pressable>
    </View>
  );
}

function Cargando() {
  return (
    <View style={estilos.lista} accessibilityLabel="Cargando solicitudes">
      {[0, 1, 2].map((i) => (
        <View key={i} style={estilos.esqueleto} />
      ))}
    </View>
  );
}

function SinAcceso({ navigation, haySesion }) {
  return (
    <View style={estilos.sinAcceso}>
      <Text style={estilos.sinAccesoTitulo}>Panel de administrador</Text>
      <Text style={estilos.sinAccesoTexto}>
        {haySesion
          ? "Esta sección es solo para administradores de salón."
          : "Inicia sesión con tu cuenta de administrador para ver las solicitudes de tu salón."}
      </Text>
      <Pressable
        onPress={() => navigation && navigation.navigate("Login", { volverA: { nombre: "PanelAdministrador", params: {} } })}
        accessibilityRole="button"
        style={({ hovered, focused }) => [estilos.botonAceptar, (hovered || focused) && estilos.botonFoco]}
      >
        <Text style={estilos.botonAceptarTexto}>{haySesion ? "Ir a mi cuenta" : "Iniciar sesión"}</Text>
      </Pressable>
    </View>
  );
}

export default function PanelAdministradorScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const movil = width < MEDIDA.corteEscritorio;
  const params = (route && route.params) || {};
  const panel = usePanelAdministrador(params.pestana);
  const solicitudId = params.solicitudId || null;
  const abierta = solicitudId ? panel.solicitudes.find((x) => x.id === solicitudId) || null : null;
  const salonDeSolicitud = useSalonDeSolicitud(panel.sesion && panel.sesion.id, abierta && abierta.salonId);
  // Ancho real del contenido: sin la barra lateral (escritorio) y sin los márgenes.
  const anchoContenido = movil ? width - 40 : width - MEDIDA.barraLateral - 96;

  // La pestaña sigue a la ruta (Atrás / Adelante del navegador y los enlaces de la barra).
  useEffect(() => {
    if (params.pestana) panel.setPestana(params.pestana);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.pestana]);

  // Un enlace directo (o recargar) al detalle trae el salón de la solicitud: el panel se cambia a ese salón.
  useEffect(() => {
    if (params.salonId && panel.salon && panel.salon.id !== params.salonId && panel.salones.some((x) => x.id === params.salonId)) {
      panel.elegirSalon(params.salonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.salonId, panel.salon && panel.salon.id, panel.salones.length]);

  if (panel.cargandoSesion) return <View style={estilos.pantalla} />;
  if (!panel.esAdministrador) return <SinAcceso navigation={navigation} haySesion={!!panel.sesion} />;

  // El nombre del salón: el del salón que se ve, o el de la cuenta si es un nombre de verdad.
  // Nunca el nombre del usuario: en varias cuentas ese "nombre" es el propio correo.
  const nombreSalon = (panel.salon && panel.salon.nombre) || nombreDeNegocio(panel.sesion);
  const irACuenta = () => navigation && navigation.navigate("Perfil");
  const elegirSeccion = (clave) => {
    if (clave === "salon") {
      if (navigation) navigation.navigate("MisSalones");
      return;
    }
    if (navigation) navigation.navigate("PanelAdministrador", { pestana: clave });
  };
  const abrirSolicitud = (id) =>
    navigation && navigation.navigate("PanelAdministrador", { pestana: "solicitudes", solicitudId: id, salonId: panel.salon && panel.salon.id });
  const volverALista = () => navigation && navigation.navigate("PanelAdministrador", { pestana: "solicitudes" });

  let cuerpo;
  if (panel.error && panel.solicitudes.length === 0) {
    cuerpo = (
      <View style={estilos.errorCaja}>
        <Text style={estilos.errorTexto} accessibilityRole="alert">{panel.error}</Text>
        <Pressable onPress={panel.reintentarTodo} accessibilityRole="button" style={estilos.botonCancelar}>
          <Text style={estilos.botonCancelarTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  } else if (!panel.cargando && panel.salones.length === 0) {
    cuerpo = (
      <View style={estilos.vacio}>
        <Text style={estilos.vacioTitulo}>Aún no tienes un salón</Text>
        <Text style={estilos.vacioTexto}>Publica tu salón para empezar a recibir solicitudes.</Text>
        <Pressable onPress={() => elegirSeccion("salon")} accessibilityRole="button" style={estilos.botonAceptar}>
          <Text style={estilos.botonAceptarTexto}>Publicar mi salón</Text>
        </Pressable>
      </View>
    );
  } else if (panel.cargando && panel.solicitudes.length === 0) {
    cuerpo = <Cargando />;
  } else if (solicitudId && panel.pestana !== "calendario") {
    cuerpo = abierta ? (
      <DetalleSolicitud
        solicitud={abierta}
        salon={salonDeSolicitud}
        esAdmin
        ancho={anchoContenido}
        onVolver={volverALista}
        onVerSalon={() => navigation && navigation.navigate("DetalleSalon", { salonId: abierta.salonId })}
        acciones={<AccionesSolicitud solicitud={abierta} panel={panel} />}
      />
    ) : panel.cargando ? (
      <Cargando />
    ) : (
      <View style={estilos.vacio}>
        <Text style={estilos.vacioTitulo}>No encontramos esa solicitud</Text>
        <Text style={estilos.vacioTexto}>Puede ser de otro de tus salones. Elige el salón arriba o regresa a la lista.</Text>
        <Pressable onPress={volverALista} accessibilityRole="button" style={estilos.botonCancelar}>
          <Text style={estilos.botonCancelarTexto}>Volver a las solicitudes</Text>
        </Pressable>
      </View>
    );
  } else if (panel.pestana === "calendario") {
    cuerpo = (
      <CalendarioAdmin
        adminId={panel.sesion.id}
        salonId={panel.salon && panel.salon.id}
        solicitudes={panel.solicitudes}
        version={panel.versionCalendario}
        movil={movil}
      />
    );
  } else {
    cuerpo = <SeccionSolicitudes panel={panel} movil={movil} anchoContenido={anchoContenido} onAbrir={abrirSolicitud} />;
  }

  const contenido = (
    <ScrollView contentContainerStyle={movil ? estilos.contenidoMovil : estilos.contenido}>
      {!movil && !solicitudId ? (
        <Text style={estilos.tituloPagina} accessibilityRole="header">
          {panel.pestana === "calendario" ? "Calendario de disponibilidad" : "Panel de solicitudes"}
        </Text>
      ) : null}
      <BannerSinConexion enLinea={panel.enLinea} guardadoEn={panel.guardadoEn} onReintentar={panel.reintentarTodo} />
      <SelectorSalones salones={panel.salones} salonId={panel.salon && panel.salon.id} onElegir={panel.elegirSalon} movil={movil} />
      <Aviso texto={panel.aviso} onCerrar={panel.cerrarAviso} />
      {cuerpo}
    </ScrollView>
  );

  return (
    <LayoutAdmin seccion={panel.pestana} onElegir={elegirSeccion} nombreSalon={nombreSalon} nombreAdmin={panel.sesion ? panel.sesion.nombre : ""} onCuenta={irACuenta}>
      {contenido}
    </LayoutAdmin>
  );
}
