/**
 * GlamSpaces · Mis solicitudes (Sprint 5 · HU-16, criterio 4)
 *
 * El cliente ve sus solicitudes de reservación, de la más reciente a la más vieja,
 * con su estado: pendiente, confirmada o rechazada.
 *
 *   - MisSolicitudesScreen.js   → pantalla (JSX)   [este archivo]
 *   - MisSolicitudes.styles.js  → estilos
 *   - useMisSolicitudes.js      → lógica / estado
 */

import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import TarjetaSolicitud from "../../components/TarjetaSolicitud";
import { Bloque } from "../../components/Esqueleto";
import { COLORES } from "../../theme/colores";
import { ESPACIO } from "../../theme/espaciado";
import useMisSolicitudes from "./useMisSolicitudes";
import { estilos } from "./MisSolicitudes.styles";

function BarraSuperior({ onVolver, onRecargar, puedeRecargar }) {
  return (
    <View style={estilos.barraSuperior}>
      <View style={estilos.barraContenido}>
        <Pressable
          onPress={onVolver}
          accessibilityRole="button"
          accessibilityLabel="Volver a la búsqueda"
          style={({ hovered, focused }) => [estilos.botonBarra, (hovered || focused) && estilos.botonBarraFoco]}
        >
          <Text style={estilos.botonBarraTexto}>← Buscar salones</Text>
        </Pressable>
        {puedeRecargar ? (
          <Pressable
            onPress={onRecargar}
            accessibilityRole="button"
            accessibilityLabel="Actualizar la lista"
            style={({ hovered, focused }) => [estilos.botonBarra, (hovered || focused) && estilos.botonBarraFoco]}
          >
            <Text style={estilos.botonBarraTexto}>↻ Actualizar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

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

export default function MisSolicitudesScreen({ navigation }) {
  const f = useMisSolicitudes();
  const ir = (nombre, p) => navigation && navigation.navigate(nombre, p);

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
  } else if (f.solicitudes.length === 0) {
    contenido = (
      <Aviso
        titulo="Todavía no tienes solicitudes"
        texto="Elige un salón, una fecha disponible y envía tu solicitud."
        boton="Buscar salones"
        onPress={() => ir("BusquedaSalones")}
      />
    );
  } else {
    contenido = (
      <>
        {f.solicitudes.map((s) => (
          <View key={s.id}>
            <TarjetaSolicitud
              solicitud={s}
              accion={{
                texto: "Actualizar estado",
                etiqueta: `Actualizar el estado de la solicitud en ${s.nombreSalon}`,
                onPress: () => f.actualizarEstado(s.id),
                cargando: f.actualizandoId === s.id,
              }}
            />
            {f.avisos[s.id] ? (
              <Text style={estilos.avisoEstado} accessibilityLiveRegion="polite">
                {f.avisos[s.id]}
              </Text>
            ) : null}
          </View>
        ))}
        {f.error ? <Text style={[estilos.mensajeGeneral, estilos.mensajeFail]}>{f.error}</Text> : null}
        {f.hayMas ? (
          <Pressable
            style={[estilos.botonSecundario, f.cargando && estilos.botonDeshabilitado]}
            onPress={f.verMas}
            disabled={f.cargando}
            accessibilityRole="button"
          >
            {f.cargando ? (
              <ActivityIndicator color={COLORES.morado} />
            ) : (
              <Text style={estilos.botonSecundarioTexto}>Ver más solicitudes</Text>
            )}
          </Pressable>
        ) : null}
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <BarraSuperior onVolver={() => ir("BusquedaSalones")} onRecargar={f.recargar} puedeRecargar={f.esCliente} />
      <View style={estilos.contenido}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Mis solicitudes
        </Text>
        <Text style={estilos.subtitulo}>Consulta si cada salón confirmó o rechazó tu solicitud.</Text>
        {contenido}
      </View>
      <Text style={estilos.pie}>Mis solicitudes · GlamSpaces</Text>
    </ScrollView>
  );
}
