/**
 * GlamSpaces · Estilos que se repiten en varias pantallas
 * (página, tarjeta, títulos, botones, mensajes, checkbox, enlaces, pie).
 * Cada pantalla los trae con `...comunes` y agrega solo lo suyo.
 */

import { StyleSheet } from "react-native";
import { COLORES } from "./colores";

export const comunes = StyleSheet.create({
  cargandoContenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORES.moradoClaro,
  },
  pagina: {
    flexGrow: 1,
    backgroundColor: COLORES.moradoClaro,
    paddingBottom: 32,
    alignItems: "center",
  },
  tarjeta: {
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 720,
    borderRadius: 20,
    padding: 24,
    shadowColor: COLORES.moradoOscuro,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  titulo: { fontSize: 22, fontWeight: "700", color: COLORES.moradoOscuro, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: COLORES.muted, marginBottom: 20, lineHeight: 18 },
  seccion: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.moradoOscuro,
    marginTop: 8,
    marginBottom: 10,
  },
  separador: { height: 1, backgroundColor: COLORES.borde, marginVertical: 16 },
  error: { fontSize: 12, color: COLORES.error, marginTop: 4 },

  boton: {
    backgroundColor: COLORES.morado,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "700" },
  botonSecundario: {
    borderWidth: 1.5,
    borderColor: COLORES.morado,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 14,
  },
  botonSecundarioTexto: { color: COLORES.morado, fontSize: 15, fontWeight: "700" },

  mensajeGeneral: { textAlign: "center", fontSize: 13.5, marginTop: 14, fontWeight: "600" },
  mensajeOk: { color: COLORES.ok },
  mensajeFail: { color: COLORES.error },

  filaCheckbox: { flexDirection: "row", alignItems: "flex-start", marginTop: 4, marginBottom: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORES.morado,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActivo: { backgroundColor: COLORES.morado },
  checkboxMarca: { color: "#fff", fontSize: 13, fontWeight: "700" },
  textoCheckbox: { flex: 1, fontSize: 12.5, color: COLORES.texto },

  enlaceCambio: { textAlign: "center", fontSize: 12.5, color: COLORES.muted, marginTop: 20 },
  enlaceResaltado: { color: COLORES.morado, fontWeight: "700" },
  pie: { fontSize: 11, color: COLORES.muted, opacity: 0.7, marginTop: 18 },
});
