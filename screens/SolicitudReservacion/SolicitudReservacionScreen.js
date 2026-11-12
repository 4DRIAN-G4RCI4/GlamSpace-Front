/**
 * GlamSpaces · Formulario de solicitud de reservación (Sprint 5 · HU-16)
 *
 * Llega desde el detalle del salón (HU-13) con la fecha elegida ya precargada.
 * El cliente completa tipo de evento, invitados, paquete y teléfono, y lo envía a la
 * API (HU-15). Al enviarse muestra la confirmación con el estado de la solicitud.
 *
 *   - SolicitudReservacionScreen.js          → pantalla (JSX)   [este archivo]
 *   - SolicitudReservacion.styles.js         → estilos
 *   - useSolicitudReservacion.js             → lógica / estado
 *   - solicitudReservacion.validaciones.js   → reglas de validación
 */

import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import Campo from "../../components/Campo";
import TarjetaSolicitud from "../../components/TarjetaSolicitud";
import { formatearPrecio } from "../../utils/formato";
import { formatearFechaLarga } from "../../utils/fechas";
import { COLORES } from "../../theme/colores";
import useSolicitudReservacion, { TIPOS_EVENTO } from "./useSolicitudReservacion";
import { LIMITE_COMENTARIOS } from "./solicitudReservacion.validaciones";
import { estilos } from "./SolicitudReservacion.styles";

function Pagina({ children }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
        <View style={estilos.contenedor}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Boton({ texto, onPress, secundario, deshabilitado, cargando }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado || cargando}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(deshabilitado || cargando) }}
      style={[secundario ? estilos.botonSecundario : estilos.boton, (deshabilitado || cargando) && estilos.botonDeshabilitado]}
    >
      {cargando ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={secundario ? estilos.botonSecundarioTexto : estilos.botonTexto}>{texto}</Text>
      )}
    </Pressable>
  );
}

// Sin sesión de cliente no se puede enviar: se pide entrar y luego se regresa aquí.
function AvisoSesion({ esAdministrador, onEntrar, onVolver }) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo} accessibilityRole="header">
        {esAdministrador ? "Necesitas una cuenta de cliente" : "Inicia sesión para continuar"}
      </Text>
      <Text style={estilos.subtitulo}>
        {esAdministrador
          ? "Las solicitudes de reservación solo se envían con una cuenta de cliente."
          : "Para enviar tu solicitud necesitamos saber quién eres. Al entrar regresas a este formulario con tu fecha."}
      </Text>
      {esAdministrador ? null : <Boton texto="Iniciar sesión" onPress={onEntrar} />}
      <Boton texto="Volver al salón" onPress={onVolver} secundario />
    </View>
  );
}

// Criterio 1: la solicitud quedó registrada.
function Confirmacion({ solicitud, onMisSolicitudes, onBuscar }) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.confirmacionIcono} accessibilityElementsHidden importantForAccessibility="no">
        ✓
      </Text>
      <Text style={[estilos.titulo, estilos.centrado]} accessibilityRole="header" accessibilityLiveRegion="polite">
        ¡Solicitud enviada!
      </Text>
      <Text style={[estilos.subtitulo, estilos.centrado]}>
        El salón revisará tu solicitud. Puedes consultar su estado cuando quieras en "Mis solicitudes".
      </Text>
      <TarjetaSolicitud solicitud={solicitud} />
      <Boton texto="Ver mis solicitudes" onPress={onMisSolicitudes} />
      <Boton texto="Seguir buscando salones" onPress={onBuscar} secundario />
    </View>
  );
}

function SelectorTipoEvento({ valor, onCambiar, error }) {
  return (
    <View>
      <Campo
        etiqueta="Tipo de evento"
        valor={valor}
        onCambiar={onCambiar}
        placeholder="Ej. Boda, XV años, Cumpleaños"
        error={error}
        maxLength={100}
      />
      <View style={estilos.sugerencias}>
        {TIPOS_EVENTO.map((tipo) => {
          const activo = valor.trim() === tipo;
          return (
            <Pressable
              key={tipo}
              onPress={() => onCambiar(tipo)}
              accessibilityRole="button"
              accessibilityLabel={`Tipo de evento: ${tipo}`}
              accessibilityState={{ selected: activo }}
              style={({ hovered, focused }) => [
                estilos.sugerencia,
                activo && estilos.sugerenciaActiva,
                (hovered || focused) && !activo && estilos.sugerenciaFoco,
              ]}
            >
              <Text style={[estilos.sugerenciaTexto, activo && estilos.sugerenciaTextoActiva]}>{tipo}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SolicitudReservacionScreen({ navigation, route }) {
  const params = (route && route.params) || {};
  const f = useSolicitudReservacion(params);
  const ir = (nombre, p) => navigation && navigation.navigate(nombre, p);
  const volverAlCalendario = () => ir("DetalleSalon", { salonId: f.salonId });

  if (f.cargandoSesion) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color={COLORES.morado} size="large" />
      </View>
    );
  }

  if (f.enviada) {
    return (
      <Pagina>
        <Confirmacion solicitud={f.enviada} onMisSolicitudes={() => ir("MisSolicitudes")} onBuscar={() => ir("BusquedaSalones")} />
      </Pagina>
    );
  }

  if (!f.esCliente) {
    return (
      <Pagina>
        <AvisoSesion
          esAdministrador={!!f.sesion && f.sesion.tipo_cuenta === "administrador"}
          onEntrar={() => ir("Login", { volverA: { nombre: "SolicitudReservacion", params } })}
          onVolver={volverAlCalendario}
        />
      </Pagina>
    );
  }

  return (
    <Pagina>
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Solicitud de reservación
        </Text>
        <Text style={estilos.subtitulo}>{f.nombreSalon}</Text>

        <Text style={estilos.seccion}>Tu evento</Text>
        <Text style={estilos.etiqueta}>Fecha del evento</Text>
        <View style={[estilos.fecha, f.errores.fecha && estilos.fechaInvalida]}>
          <Text style={estilos.fechaTexto}>{f.fecha ? formatearFechaLarga(f.fecha) : "Sin fecha"}</Text>
          <Pressable onPress={volverAlCalendario} accessibilityRole="button" accessibilityLabel="Cambiar fecha">
            <Text style={estilos.enlaceResaltado}>Cambiar</Text>
          </Pressable>
        </View>
        {f.errores.fecha ? <Text style={[estilos.error, estilos.errorFecha]}>{f.errores.fecha}</Text> : null}

        <SelectorTipoEvento valor={f.tipoEvento} onCambiar={f.setTipoEvento} error={f.errores.tipoEvento} />

        <Campo
          etiqueta="Número de invitados"
          valor={f.invitados}
          onCambiar={f.setInvitados}
          placeholder="Ej. 120"
          error={f.errores.invitados}
          pistaExtra={f.capacidad ? `Este salón recibe hasta ${f.capacidad} personas.` : null}
          keyboardType="number-pad"
          maxLength={6}
        />

        {f.paquetes.length > 0 ? (
          <>
            <Text style={estilos.etiqueta}>Paquete (opcional)</Text>
            {f.paquetes.map((p) => {
              const activo = p.id === f.paqueteId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => f.elegirPaquete(activo ? null : p.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: activo }}
                  style={[estilos.opcion, activo && estilos.opcionActiva]}
                >
                  <View style={[estilos.checkbox, activo && estilos.checkboxActivo]}>
                    {activo ? <Text style={estilos.checkboxMarca}>✓</Text> : null}
                  </View>
                  <Text style={estilos.opcionTexto}>{p.nombrePaquete}</Text>
                  <Text style={estilos.opcionPrecio}>{formatearPrecio(p.precio)}</Text>
                </Pressable>
              );
            })}
          </>
        ) : null}

        <View style={estilos.separador} />
        <Text style={estilos.seccion}>Datos de contacto</Text>
        <Campo
          etiqueta="Nombre"
          valor={f.sesion.nombre}
          error={f.errores.nombre}
          pistaExtra="Se toma de tu cuenta."
          editable={false}
          accessibilityState={{ disabled: true }}
        />
        <Campo
          etiqueta="Teléfono"
          valor={f.telefono}
          onCambiar={f.setTelefono}
          placeholder="Ej. 771 123 4567"
          error={f.errores.telefono}
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={20}
        />
        <Campo
          etiqueta="Comentarios (opcional)"
          valor={f.comentarios}
          onCambiar={f.setComentarios}
          placeholder="Horario, decoración, algo que el salón deba saber..."
          error={f.errores.comentarios}
          pistaExtra={`${f.comentarios.length}/${LIMITE_COMENTARIOS}`}
          multilinea
          maxLength={LIMITE_COMENTARIOS}
        />

        <Boton texto="Enviar solicitud" onPress={f.enviar} cargando={f.enviando} />

        {f.mensaje ? (
          <View accessibilityLiveRegion="assertive">
            <Text style={[estilos.mensajeGeneral, estilos.mensajeFail]}>{f.mensaje.texto}</Text>
            {/* Criterio 3: la fecha dejó de estar disponible → elegir otra en el calendario. */}
            {f.mensaje.fechaNoDisponible ? (
              <Boton texto="Elegir otra fecha" onPress={volverAlCalendario} secundario />
            ) : null}
            {f.mensaje.duplicada ? <Boton texto="Ver mis solicitudes" onPress={() => ir("MisSolicitudes")} secundario /> : null}
          </View>
        ) : null}
      </View>
    </Pagina>
  );
}
