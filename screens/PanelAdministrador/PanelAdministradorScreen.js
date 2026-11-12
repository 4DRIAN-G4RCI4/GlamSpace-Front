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
 *   - TarjetaPendiente.js, CalendarioAdmin.js → piezas de la pantalla
 */

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { MEDIDA } from "../../theme/disenoPwa";
import { formatearPrecio } from "../../utils/formato";
import { fechaHoy, formatearFechaCorta } from "../../utils/fechas";
import usePanelAdministrador from "./usePanelAdministrador";
import TarjetaPendiente, { EtiquetaEstado } from "./TarjetaPendiente";
import CalendarioAdmin from "./CalendarioAdmin";
import LayoutAdmin from "./LayoutAdmin";
import BannerSinConexion from "./BannerSinConexion";
import {
  estadisticas,
  historialReciente,
  pendientesEnConflicto,
  solicitudesPendientes,
} from "./panelAdministrador.logica";
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

function Historial({ solicitudes, movil }) {
  const [verTodo, setVerTodo] = useState(false);
  const todas = historialReciente(solicitudes, 0);
  const visibles = verTodo ? todas : todas.slice(0, movil ? 3 : 5);
  if (todas.length === 0) return null;

  return (
    <View style={estilos.seccion}>
      <View style={estilos.filaTituloSeccion}>
        <Text style={movil ? estilos.tituloSeccionMovil : estilos.tituloSeccion} accessibilityRole="header">
          Historial reciente
        </Text>
        {todas.length > visibles.length || verTodo ? (
          <Pressable onPress={() => setVerTodo(!verTodo)} accessibilityRole="button">
            <Text style={movil ? estilos.enlaceMovil : estilos.enlace}>{verTodo ? "Ver menos" : "Ver todo"}</Text>
          </Pressable>
        ) : null}
      </View>
      {visibles.map((s) => (
        <View key={s.id} style={[estilos.historial, movil && estilos.historialMovil]}>
          <View style={estilos.tarjetaDatos}>
            <Text style={movil ? estilos.historialNombreMovil : estilos.historialNombre}>{s.nombreCliente}</Text>
            <Text style={movil ? estilos.historialDetalleMovil : estilos.historialDetalle}>
              {formatearFechaCorta(s.fechaEvento, { conAnio: false })} · {s.tipoEvento} · {s.numeroInvitados} inv.
            </Text>
          </View>
          <EtiquetaEstado estado={s.estado} movil={movil} />
        </View>
      ))}
    </View>
  );
}

function SeccionSolicitudes({ panel, movil }) {
  const pendientes = solicitudesPendientes(panel.solicitudes);

  return (
    <>
      {!movil ? <Cifras solicitudes={panel.solicitudes} /> : null}

      <View style={estilos.seccion}>
        <Text style={movil ? estilos.tituloSeccionMovil : estilos.tituloSeccion} accessibilityRole="header">
          Solicitudes pendientes ({pendientes.length})
        </Text>

        {pendientes.length === 0 ? (
          <View style={estilos.vacio}>
            <Text style={estilos.vacioTitulo}>No tienes solicitudes pendientes</Text>
            <Text style={estilos.vacioTexto}>Cuando un cliente pida una fecha de tu salón, aparecerá aquí.</Text>
          </View>
        ) : (
          <View style={movil ? estilos.listaMovil : estilos.lista}>
            {pendientes.map((s) => (
              <TarjetaPendiente
                key={s.id}
                solicitud={s}
                movil={movil}
                porConfirmar={panel.porConfirmar}
                conflictos={pendientesEnConflicto(panel.solicitudes, s)}
                procesando={panel.procesandoId === s.id}
                bloqueada={!!panel.procesandoId || !panel.puedeAtender}
                error={panel.erroresPorId[s.id]}
                onAceptar={() => panel.pedirConfirmacion(s.id, "aceptar")}
                onRechazar={() => panel.pedirConfirmacion(s.id, "rechazar")}
                onConfirmar={panel.confirmarAccion}
                onCancelar={panel.cancelarConfirmacion}
              />
            ))}
          </View>
        )}
      </View>

      <Historial solicitudes={panel.solicitudes} movil={movil} />
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
  const panel = usePanelAdministrador(route && route.params ? route.params.pestana : undefined);

  if (panel.cargandoSesion) return <View style={estilos.pantalla} />;
  if (!panel.esAdministrador) return <SinAcceso navigation={navigation} haySesion={!!panel.sesion} />;

  const nombreSalon = (panel.salon && panel.salon.nombre) || panel.sesion.nombre_salon || panel.sesion.nombre;
  const irACuenta = () => navigation && navigation.navigate("Perfil");
  const elegirSeccion = (clave) => {
    if (clave === "salon") {
      if (navigation) navigation.navigate("PublicarSalon");
      return;
    }
    panel.setPestana(clave);
  };

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
    cuerpo = <SeccionSolicitudes panel={panel} movil={movil} />;
  }

  const contenido = (
    <ScrollView contentContainerStyle={movil ? estilos.contenidoMovil : estilos.contenido}>
      {!movil ? (
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
    <LayoutAdmin seccion={panel.pestana} onElegir={elegirSeccion} nombreSalon={nombreSalon} onCuenta={irACuenta}>
      {contenido}
    </LayoutAdmin>
  );
}
