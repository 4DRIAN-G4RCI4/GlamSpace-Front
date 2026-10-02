/**
 * GlamSpaces · App de prueba para las 3 pantallas del Sprint 1
 *
 * Este archivo es solo para poder correr y ver las 3 pantallas (HU-02,
 * HU-03, HU-04) en un solo lugar, sin instalar una librería de navegación.
 * Es un "router" manual: cada pantalla recibe un objeto `navigation` con
 * un método `navigate(nombre)` que cambia cuál pantalla se muestra.
 *
 * Cuando se integre con la navegación real del proyecto (React Navigation,
 * por ejemplo), este App.js se reemplaza por el stack de Auth del equipo.
 */

import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import RegistroClienteScreen from "./screens/RegistroClienteScreen";
import RegistroAdministradorScreen from "./screens/RegistroAdministradorScreen";
import LoginScreen from "./screens/LoginScreen";

const PANTALLAS = {
  RegistroCliente: RegistroClienteScreen,
  RegistroAdministrador: RegistroAdministradorScreen,
  Login: LoginScreen,
};

export default function App() {
  const [pantallaActual, setPantallaActual] = useState("Login");

  const navigation = {
    navigate: (nombre) => {
      if (PANTALLAS[nombre]) {
        setPantallaActual(nombre);
      }
    },
  };

  const PantallaActiva = PANTALLAS[pantallaActual];

  return (
    <SafeAreaView style={styles.container}>
      <PantallaActiva navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
