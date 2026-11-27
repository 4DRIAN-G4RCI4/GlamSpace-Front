/**
 * GlamSpaces · Tamaño de letra elegido en el Perfil.
 * Se importa PRIMERO en App.js: envuelve StyleSheet.create antes de que se creen los estilos de las
 * pantallas, así todos los fontSize y lineHeight salen escalados sin tocar cada archivo de estilos.
 */
import { StyleSheet } from "react-native";
import { ESCALA_TEXTO, escalarTexto } from "./tema";

if (ESCALA_TEXTO !== 1) {
  const crear = StyleSheet.create;
  StyleSheet.create = (estilos) => crear(escalarTexto(estilos, ESCALA_TEXTO));
}
