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
 */

import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
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

export default function App() {
  const [actual, setActual] = useState({ nombre: "BusquedaSalones", params: {} });

  const navigation = {
    navigate: (nombre, params = {}) => {
      if (PANTALLAS[nombre]) {
        setActual({ nombre, params });
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
