/**
 * GlamSpaces · Sesión activa guardada en el dispositivo (AsyncStorage).
 * Es solo la sesión local; los usuarios viven en la base de datos de la API.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const LLAVE_SESION = "glamspaces_sesion";

export async function guardarSesion(sesion) {
  await AsyncStorage.setItem(LLAVE_SESION, JSON.stringify(sesion));
}

export async function obtenerSesionActiva() {
  try {
    const data = await AsyncStorage.getItem(LLAVE_SESION);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(LLAVE_SESION);
}
