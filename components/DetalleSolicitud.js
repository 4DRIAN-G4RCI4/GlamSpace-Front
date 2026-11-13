/**
 * GlamSpaces · Detalle de una solicitud de reservación (Figma PROYECTO--PWA, Admin 03), con el salón
 * de esa solicitud: galería (placeholder si una foto da 404 o no hay fotos), nombre, zona, capacidad,
 * descripción y "Ver salón". Lo usan el panel del administrador (con sus acciones en `acciones`) y
 * "Mis solicitudes" del cliente (sin acciones). Solo presentación.
 *
 *  - `solicitud`: lo que regresa la API (listarPorSalon o listar del cliente).
 *  - `salon`: { salon, cargando, error, reintentar } de useSalonDeSolicitud.
 *  - `esAdmin`: muestra "Datos del cliente" (nombre y teléfono).
 *  - `ancho`: el ancho disponible; desde 900 px van dos columnas.
 */

import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import EtiquetaEstado from "./EtiquetaEstado";
import GaleriaDetalle from "../screens/DetalleSalon/GaleriaDetalle";
import { formatearFechaLarga } from "../utils/fechas";
import { formatearPrecio } from "../utils/formato";
import { fechaDeCreacion } from "../screens/PanelAdministrador/panelAdministrador.logica";
import { estilos } from "./DetalleSolicitud.styles";

const DOS_COLUMNAS = 900;

const mayuscula = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

function Dato({ etiqueta, valor, movil }) {
  return (
    <View style={movil ? estilos.datoMovil : estilos.dato}>
      <Text style={estilos.datoEtiqueta}>{etiqueta}</Text>
      <Text style={movil ? estilos.datoValorMovil : estilos.datoValor}>{valor}</Text>
    </View>
  );
}

function TarjetaSalon({ salon: s, nombreSalon, onVerSalon }) {
  const [activa, setActiva] = useState(0);
  useEffect(() => setActiva(0), [s.salon && s.salon.id]);

  let cuerpo;
  if (s.cargando && !s.salon) {
    cuerpo = <Text style={estilos.cargando}>Cargando el salón…</Text>;
  } else if (s.error && !s.salon) {
    cuerpo = (
      <>
        <Text style={estilos.error} accessibilityRole="alert">{s.error}</Text>
        <Pressable onPress={s.reintentar} accessibilityRole="button" style={({ focused }) => [estilos.reintentar, focused && estilos.foco]}>
          <Text style={estilos.reintentarTexto}>Reintentar</Text>
        </Pressable>
      </>
    );
  } else if (s.salon) {
    cuerpo = (
      <>
        {/* La galería del detalle del salón; sin fotos o con una foto rota muestra el espacio con la inicial */}
        <GaleriaDetalle fotos={s.salon.fotos || []} activa={activa} onElegir={setActiva} nombre={s.salon.nombre} />
        <View style={{ gap: 4 }}>
          <Text style={estilos.salonNombre}>{s.salon.nombre}</Text>
          <Text style={estilos.salonZona}>{s.salon.zona}</Text>
        </View>
        <View style={estilos.chip}>
          <Text style={estilos.chipTexto}>Hasta {s.salon.capacidad} invitados</Text>
        </View>
        <Text style={s.salon.descripcion ? estilos.parrafo : estilos.parrafoTenue}>
          {s.salon.descripcion || "El salón todavía no agrega una descripción."}
        </Text>
      </>
    );
  }

  return (
    <View style={estilos.tarjeta} accessibilityLabel={`Salón de la solicitud: ${nombreSalon}`}>
      <Text style={estilos.tarjetaTitulo} accessibilityRole="header" aria-level={2}>Salón</Text>
      {cuerpo}
      <Pressable
        onPress={onVerSalon}
        accessibilityRole="link"
        accessibilityLabel={`Ver el salón ${nombreSalon}`}
        style={({ hovered, focused }) => [estilos.verSalon, hovered && estilos.hover, focused && estilos.foco]}
      >
        <Text style={estilos.verSalonTexto}>Ver salón</Text>
      </Pressable>
    </View>
  );
}

export default function DetalleSolicitud({ solicitud: s, salon, esAdmin, ancho, onVolver, onVerSalon, acciones }) {
  const dosColumnas = ancho >= DOS_COLUMNAS;
  const movil = ancho < 520;
  const paquete = s.nombrePaquete
    ? `${s.nombrePaquete}${s.precioPaquete != null ? ` — ${formatearPrecio(s.precioPaquete)}` : ""}`
    : "Sin paquete";
  const recibida = fechaDeCreacion(s.fechaCreacion);

  const evento = (
    <View style={estilos.tarjeta}>
      <Text style={estilos.tarjetaTitulo} accessibilityRole="header" aria-level={2}>Detalle del evento</Text>
      <View style={estilos.rejilla}>
        <Dato movil={movil} etiqueta="Fecha" valor={mayuscula(formatearFechaLarga(s.fechaEvento))} />
        <Dato movil={movil} etiqueta="Paquete" valor={paquete} />
        <Dato movil={movil} etiqueta="Invitados" valor={String(s.numeroInvitados)} />
        <Dato movil={movil} etiqueta="Tipo de evento" valor={s.tipoEvento} />
        {!esAdmin ? <Dato movil={movil} etiqueta="Teléfono de contacto" valor={s.telefonoContacto || "No lo registraste"} /> : null}
        <Dato movil={movil} etiqueta="Solicitada" valor={recibida || "—"} />
      </View>
    </View>
  );

  const comentarios = (
    <View style={estilos.tarjeta}>
      <Text style={estilos.tarjetaTitulo} accessibilityRole="header" aria-level={2}>Comentarios</Text>
      <Text style={s.comentarios ? estilos.parrafo : estilos.parrafoTenue}>{s.comentarios || "Sin comentarios."}</Text>
    </View>
  );

  // Figma Admin 03: solo nombre y teléfono; la API no regresa el correo del cliente.
  const cliente = esAdmin ? (
    <View style={estilos.tarjeta}>
      <Text style={estilos.tarjetaTitulo} accessibilityRole="header" aria-level={2}>Datos del cliente</Text>
      <View style={estilos.filaCliente}>
        <Text style={estilos.icono} aria-hidden>●</Text>
        <Text style={estilos.parrafo}>{s.nombreCliente}</Text>
      </View>
      <View style={estilos.filaCliente}>
        <Text style={estilos.icono} aria-hidden>☎</Text>
        <Text style={s.telefonoContacto ? estilos.parrafo : estilos.parrafoTenue}>{s.telefonoContacto || "Sin teléfono registrado"}</Text>
      </View>
    </View>
  ) : null;

  const tarjetaSalon = <TarjetaSalon salon={salon} nombreSalon={s.nombreSalon} onVerSalon={onVerSalon} />;

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Pressable
          onPress={onVolver}
          accessibilityRole="button"
          accessibilityLabel="Volver a la lista de solicitudes"
          style={({ hovered, focused }) => [estilos.volver, hovered && estilos.hover, focused && estilos.foco]}
        >
          <Text style={estilos.volverTexto}>‹</Text>
        </Pressable>
        <Text style={estilos.titulo} accessibilityRole="header" aria-level={1}>
          Solicitud <Text style={estilos.tituloNumero}>#{s.id}</Text>
        </Text>
        <View style={estilos.estado}>
          <EtiquetaEstado estado={s.estado} texto={s.estado === "pendiente" ? "Pendiente de respuesta" : undefined} />
          {recibida ? <Text style={estilos.recibida}>Recibida el {recibida}</Text> : null}
        </View>
      </View>

      {dosColumnas ? (
        <View style={estilos.columnas}>
          <View style={estilos.columnaPrincipal}>
            {evento}
            {comentarios}
            {acciones}
          </View>
          <View style={estilos.columnaLateral}>
            {cliente}
            {tarjetaSalon}
          </View>
        </View>
      ) : (
        <View style={estilos.apilado}>
          {cliente}
          {evento}
          {comentarios}
          {acciones}
          {tarjetaSalon}
        </View>
      )}
    </View>
  );
}
