/**
 * GlamSpaces · App con las pantallas de los Sprints 1 a 4
 *
 * Es un "router" manual (sin librería de navegación): cada pantalla recibe un
 * objeto `navigation` con `navigate(nombre, params)` y un `route` con
 * `route.params`, igual que React Navigation. Cuando se integre la librería,
 * este archivo se reemplaza por el stack real y las pantallas no cambian.
 *
 * Pantallas:
 *   BusquedaSalones        HU-10 (Sprint 3) · pantalla de inicio
 *   DetalleSalon           HU-13 (Sprint 4) · detalle y calendario de disponibilidad
 *   SolicitudReservacion   Sprint 4 · destino de HU-13 con la fecha precargada
 *   Login                  HU-04 (Sprint 1)
 *   RegistroCliente        HU-02 (Sprint 1)
 *   RegistroAdministrador  HU-03 (Sprint 1)
 *   PublicarSalon          HU-07 (Sprint 2)
 *
 * En web, cada cambio de pantalla se registra en el historial del navegador
 * (history.pushState), así los botones Atrás / Adelante del navegador se mueven
 * entre pantallas de la app en lugar de salir del sitio, y al recargar se
 * conserva la pantalla actual.
 */

import React, { useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import BusquedaSalonesScreen from "./screens/BusquedaSalones/BusquedaSalonesScreen";
import DetalleSalonScreen from "./screens/DetalleSalon/DetalleSalonScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import RegistroClienteScreen from "./screens/RegistroCliente/RegistroClienteScreen";
import RegistroAdministradorScreen from "./screens/RegistroAdministrador/RegistroAdministradorScreen";
import PublicarSalonScreen from "./screens/PublicarSalon/PublicarSalonScreen";
import SolicitudReservacionScreen from "./screens/SolicitudReservacion/SolicitudReservacionScreen";

const PANTALLAS = {
  BusquedaSalones: BusquedaSalonesScreen,
  DetalleSalon: DetalleSalonScreen,
  SolicitudReservacion: SolicitudReservacionScreen,
  Login: LoginScreen,
  RegistroCliente: RegistroClienteScreen,
  RegistroAdministrador: RegistroAdministradorScreen,
  PublicarSalon: PublicarSalonScreen,
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
  const [actual, setActual] = useState(pantallaInicial);

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
      }
    },
  };

  const PantallaActiva = PANTALLAS[actual.nombre];

  return (
    <SafeAreaView style={styles.container}>
      <PantallaActiva navigation={navigation} route={{ params: actual.params }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
