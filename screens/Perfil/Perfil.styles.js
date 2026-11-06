/**
 * GlamSpaces · Estilos de la pantalla Perfil.
 * Mismo lenguaje del diseño Figma "PROYECTO--PWA" (pantallas móviles del cliente y panel del
 * administrador): encabezado blanco con título en Playfair, tarjetas blancas con borde Pearl Bush,
 * acentos vino, menú lateral oscuro y barra de navegación inferior (Buscar · Solicitudes · Perfil).
 */

import { StyleSheet } from "react-native";
import { FUENTE, MEDIDA, PWA } from "../../theme/disenoPwa";

const texto = (tamano, peso = "400", color = PWA.texto) => ({ fontFamily: FUENTE.texto, fontSize: tamano, fontWeight: peso, color });
const titulo = (tamano, peso = "700", color = PWA.texto) => ({ fontFamily: FUENTE.titulo, fontSize: tamano, fontWeight: peso, color });

export const ANCHO_MENU = 280;

export const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: PWA.fondo },

  // ---------- Encabezado ----------
  encabezado: {
    backgroundColor: PWA.superficie,
    borderBottomWidth: 0.8,
    borderBottomColor: PWA.borde,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  botonMenu: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  botonMenuFoco: { backgroundColor: PWA.fondo },
  rayaMenu: { width: 18, height: 2, borderRadius: 1, backgroundColor: PWA.oscuro },
  tituloPantalla: titulo(19),

  // ---------- Contenido ----------
  cuerpo: { flex: 1 },
  contenido: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 22,
  },

  // Tarjeta de la cuenta (oscura, como la barra lateral del panel)
  tarjetaCuenta: {
    backgroundColor: PWA.oscuro,
    borderRadius: MEDIDA.radioTarjeta,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: PWA.vino,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "rgba(243,228,200,0.35)", // crema translúcido
  },
  avatarImagen: { width: 76, height: 76, borderRadius: 38, marginBottom: 8 },
  avatarTexto: texto(24, "700", PWA.crema),
  nombre: { ...titulo(21, "700", PWA.fondo), textAlign: "center" },
  correo: { ...texto(12.5, "400", PWA.navInactivo), textAlign: "center" },
  rol: {
    marginTop: 10,
    backgroundColor: "rgba(243,228,200,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  rolTexto: { ...texto(11.5, "700", PWA.crema), letterSpacing: 0.5 },

  // Secciones con filas
  seccion: { gap: 10 },
  tituloSeccion: titulo(15.5),
  lista: {
    backgroundColor: PWA.superficie,
    borderWidth: 1,
    borderColor: PWA.borde,
    borderRadius: 14,
    overflow: "hidden",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
  },
  filaSeparador: { borderTopWidth: 0.8, borderTopColor: PWA.borde },
  filaFoco: { backgroundColor: PWA.fondo },
  filaDato: { flexShrink: 1, gap: 2 },
  filaEtiqueta: texto(11.5, "400", PWA.textoSecundario),
  filaValor: texto(14, "600", PWA.texto),
  filaTexto: texto(14, "600", PWA.texto),
  filaFlecha: texto(16, "600", PWA.vino),
  filaDeshabilitada: { opacity: 0.55 },
  proximamente: {
    backgroundColor: PWA.fondo,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  proximamenteTexto: texto(10.5, "700", PWA.textoTenue),

  botonSalir: {
    height: MEDIDA.altoBotonMovil,
    borderRadius: MEDIDA.radioBotonMovil,
    borderWidth: 1,
    borderColor: PWA.peligro,
    alignItems: "center",
    justifyContent: "center",
  },
  botonSalirTexto: texto(13.5, "600", PWA.peligro),
  botonPrincipal: {
    height: MEDIDA.altoBotonMovil,
    borderRadius: MEDIDA.radioBotonMovil,
    backgroundColor: PWA.vino,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  botonPrincipalTexto: texto(13.5, "600", PWA.fondo),
  botonFoco: { opacity: 0.85 },

  // Sin sesión
  sinSesion: {
    backgroundColor: PWA.superficie,
    borderWidth: 1,
    borderColor: PWA.borde,
    borderRadius: MEDIDA.radioTarjeta,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  sinSesionTitulo: titulo(17),
  sinSesionTexto: { ...texto(13, "400", PWA.textoSecundario), textAlign: "center", marginBottom: 6 },

  // ---------- Menú lateral deslizante ----------
  fondoMenu: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(43,31,36,0.45)",
    zIndex: 9,
  },
  menu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: ANCHO_MENU,
    backgroundColor: PWA.oscuro,
    paddingHorizontal: 20,
    paddingVertical: 28,
    zIndex: 10,
  },
  marca: { flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 32 },
  marcaIcono: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PWA.vino,
    alignItems: "center",
    justifyContent: "center",
  },
  marcaTexto: { ...titulo(14, "400", PWA.crema), letterSpacing: 2 },
  menuLista: { flex: 1, gap: 4 },
  menuItem: { paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10 },
  menuItemActivo: { backgroundColor: PWA.vino },
  menuItemFoco: { backgroundColor: "rgba(255,255,255,0.06)" },
  menuTexto: texto(14, "400", PWA.navInactivo),
  menuTextoActivo: texto(14, "600", PWA.fondo),
  menuPie: { borderTopWidth: 0.8, borderTopColor: PWA.bordeOscuro, paddingTop: 16 },
  menuSalir: texto(14, "600", "#e6a3ae"), // Stiletto aclarado para leerse sobre el fondo oscuro

  // ---------- Barra de navegación inferior ----------
  barraInferior: {
    height: 66,
    backgroundColor: PWA.superficie,
    borderTopWidth: 0.8,
    borderTopColor: PWA.borde,
    justifyContent: "center",
  },
  barraInferiorContenido: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  pestana: { alignItems: "center", gap: 3, paddingHorizontal: 16, paddingVertical: 6 },
  pestanaTexto: texto(9.8, "400", PWA.textoTenue),
  pestanaTextoActiva: texto(9.8, "600", PWA.vino),
});
