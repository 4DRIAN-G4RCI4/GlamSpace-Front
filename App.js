/**
 * GlamSpaces · App de prueba con las pantallas del Sprint 1 y Sprint 2
 *
 * Es un "router" manual (sin librería de navegación): cada pantalla recibe un
 * objeto `navigation` con un método `navigate(nombre)` que cambia cuál
 * pantalla se muestra. Cuando se integre React Navigation, este archivo se
 * reemplaza por el stack real y las pantallas no cambian.
 *
 * Pantallas:
 *   Login                  HU-04 (Sprint 1)
 *   RegistroCliente        HU-02 (Sprint 1)
 *   RegistroAdministrador  HU-03 (Sprint 1)
 *   PublicarSalon          HU-07 (Sprint 2)
 */

import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginScreen from "./screens/Login/LoginScreen";
import RegistroClienteScreen from "./screens/RegistroCliente/RegistroClienteScreen";
import RegistroAdministradorScreen from "./screens/RegistroAdministrador/RegistroAdministradorScreen";
import PublicarSalonScreen from "./screens/PublicarSalon/PublicarSalonScreen";

const PANTALLAS = {
  Login: LoginScreen,
  RegistroCliente: RegistroClienteScreen,
  RegistroAdministrador: RegistroAdministradorScreen,
  PublicarSalon: PublicarSalonScreen,
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
