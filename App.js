/**
 * GlamSpaces · App con las pantallas de los Sprints 1 a 6
 *
 * Es un "router" manual (sin librería de navegación): cada pantalla recibe un
 * objeto `navigation` con `navigate(nombre, params)` y un `route` con
 * `route.params`, igual que React Navigation. Cuando se integre la librería,
 * este archivo se reemplaza por el stack real y las pantallas no cambian.
 *
 * Pantallas:
 *   BusquedaSalones        HU-10 (Sprint 3) · pantalla de inicio
 *   DetalleSalon           HU-13 (Sprint 4) · detalle y calendario de disponibilidad
 *   SolicitudReservacion   HU-16 (Sprint 5) · formulario de solicitud con la fecha precargada
 *   MisSolicitudes         HU-16 (Sprint 5) · estado de las solicitudes del cliente
 *   PanelAdministrador     HU-19 (Sprint 6) · solicitudes del salón: aceptar / rechazar y calendario
 *   Perfil                 Sprint 6 · datos de la cuenta, menú lateral y cerrar sesión
 *   Login                  HU-04 (Sprint 1)
 *   RegistroCliente        HU-02 (Sprint 1)
 *   RegistroAdministrador  HU-03 (Sprint 1)
 *   MisSalones             Mejora de HU-07/HU-08 · gestión de los salones del admin
 *   EditarSalon            Mejora de HU-07/HU-08 · editar o crear un salón
 *
 * En web, cada cambio de pantalla se registra en el historial del navegador
 * (history.pushState), así los botones Atrás / Adelante del navegador se mueven
 * entre pantallas de la app en lugar de salir del sitio, y al recargar se
 * conserva la pantalla actual.
 */

import React, { useEffect, useRef, useState } from "react";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import BusquedaSalonesScreen from "./screens/BusquedaSalones/BusquedaSalonesScreen";
import DetalleSalonScreen from "./screens/DetalleSalon/DetalleSalonScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import RegistroClienteScreen from "./screens/RegistroCliente/RegistroClienteScreen";
import RegistroAdministradorScreen from "./screens/RegistroAdministrador/RegistroAdministradorScreen";
import MisSalonesScreen from "./screens/MisSalones/MisSalonesScreen";
import EditarSalonScreen from "./screens/MisSalones/EditarSalonScreen";
import SolicitudReservacionScreen from "./screens/SolicitudReservacion/SolicitudReservacionScreen";
import MisSolicitudesScreen from "./screens/MisSolicitudes/MisSolicitudesScreen";
import PanelAdministradorScreen from "./screens/PanelAdministrador/PanelAdministradorScreen";
import PerfilScreen from "./screens/Perfil/PerfilScreen";
import { regresoDe } from "./components/navegacion.logica";
import useFuentesWeb from "./theme/fuentesWeb";
import AvisoNuevaVersion from "./components/AvisoNuevaVersion"; // HU-21 · service worker

const PANTALLAS = {
  BusquedaSalones: BusquedaSalonesScreen,
  DetalleSalon: DetalleSalonScreen,
  SolicitudReservacion: SolicitudReservacionScreen,
  MisSolicitudes: MisSolicitudesScreen,
  PanelAdministrador: PanelAdministradorScreen,
  Login: LoginScreen,
  RegistroCliente: RegistroClienteScreen,
  RegistroAdministrador: RegistroAdministradorScreen,
  MisSalones: MisSalonesScreen,
  EditarSalon: EditarSalonScreen,
  Perfil: PerfilScreen,
};

const INICIO = { nombre: "BusquedaSalones", params: {} };
const ES_WEB = Platform.OS === "web";

// Solo acepta estados del historial que correspondan a una pantalla conocida.
function esEstadoValido(estado) {
  return !!estado && !!PANTALLAS[estado.nombre];
}

// Al recargar en web, el navegador conserva el estado de la pantalla en la que estabas.
function pantallaInicial() {
  return ES_WEB && esEstadoValido(window.history.state) ? window.history.state : INICIO;
}

export default function App() {
  useFuentesWeb(); // Playfair Display + Inter del diseño PWA, para todas las pantallas
  const [actual, setActual] = useState(pantallaInicial);
  // La pantalla actual, para que `regresar` la lea sin volver a crearse en cada render.
  const actualRef = useRef(actual);
  actualRef.current = actual;
  // ¿Esta sesión ya navegó dentro de la app? Si no, `window.history.back()` saldría del sitio.
  const hayHistorialPropio = useRef(false);

  useEffect(() => {
    if (!ES_WEB) return undefined;

    // La primera pantalla también queda en el historial para poder regresar a ella.
    if (!esEstadoValido(window.history.state)) {
      window.history.replaceState(INICIO, "");
    }

    // Atrás / Adelante del navegador: muestra la pantalla guardada en esa entrada del historial.
    const alMoverseEnHistorial = (evento) => {
      setActual(esEstadoValido(evento.state) ? evento.state : INICIO);
    };
    window.addEventListener("popstate", alMoverseEnHistorial);
    return () => window.removeEventListener("popstate", alMoverseEnHistorial);
  }, []);

  const navigation = {
    navigate: (nombre, params = {}) => {
      if (!PANTALLAS[nombre]) return;
      const destino = { nombre, params };
      setActual(destino);
      if (ES_WEB) {
        window.history.pushState(destino, "");
        hayHistorialPropio.current = true;
      }
    },
    // Botón "← Regresar": usa el historial del navegador (así Atrás del navegador y el botón
    // hacen lo mismo). Si no hay a dónde volver dentro de la app —se entró directo por la URL—,
    // va a la pantalla que indique navegacion.logica, nunca a una pantalla en blanco ni al login.
    regresar: (respaldo) => {
      const destino = respaldo || regresoDe(actualRef.current.nombre);
      if (ES_WEB && window.history.length > 1 && hayHistorialPropio.current) {
        window.history.back();
        return;
      }
      if (!PANTALLAS[destino]) return;
      const pantalla = { nombre: destino, params: {} };
      setActual(pantalla);
      if (ES_WEB) window.history.pushState(pantalla, "");
    },
    // Igual que navigate, pero sin dejar la pantalla actual en el historial (para redirecciones).
    reemplazar: (nombre, params = {}) => {
      if (!PANTALLAS[nombre]) return;
      const destino = { nombre, params };
      setActual(destino);
      if (ES_WEB) {
        window.history.replaceState(destino, "");
      }
    },
  };

  const PantallaActiva = PANTALLAS[actual.nombre];

  return (
    <SafeAreaView style={styles.container}>
      <PantallaActiva navigation={navigation} route={{ params: actual.params }} />
      <AvisoNuevaVersion />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
