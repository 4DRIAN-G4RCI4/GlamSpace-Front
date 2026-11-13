/**
 * GlamSpaces · Estilos de la pantalla Perfil.
 * Mismo lenguaje del diseño Figma "PROYECTO--PWA" (pantallas móviles del cliente y panel del
 * administrador): tarjeta oscura de la cuenta, tarjetas blancas con borde Pearl Bush y acentos vino.
 * Escritorio: dos columnas (identidad · Mi cuenta y Accesos). Teléfono: una columna y la barra
 * inferior Buscar · Solicitudes · Perfil (Figma Cliente 06 móvil). La barra superior es la compartida.
 */

import { StyleSheet } from "react-native";
import { FUENTE, MEDIDA, PWA } from "../../theme/disenoPwa";

const texto = (tamano, peso = "400", color = PWA.texto) => ({ fontFamily: FUENTE.texto, fontSize: tamano, fontWeight: peso, color });
const titulo = (tamano, peso = "700", color = PWA.texto) => ({ fontFamily: FUENTE.titulo, fontSize: tamano, fontWeight: peso, color });


export const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: PWA.fondo },

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
  // Tablet y escritorio: aprovecha el ancho (hasta 1200 px).
  contenidoAncho: { maxWidth: 1200, paddingHorizontal: 32, paddingVertical: 32 },
  columnas: { flexDirection: "row", alignItems: "flex-start", gap: 24 },
  columnaIdentidad: { width: 340, gap: 16 },
  columnaSecciones: { flex: 1, minWidth: 0 },
  apilado: { gap: 22 },
  rejillaSecciones: { gap: 22 },
  rejillaDos: { flexDirection: "row", alignItems: "flex-start", gap: 20 },
  mitad: { flex: 1, minWidth: 0 },
  saludo: titulo(24),
  saludoTexto: texto(13.5, "400", PWA.textoSecundario),

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
    minHeight: 52,
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
  pestana: { alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 16, minHeight: 48, minWidth: 64 },
  pestanaTexto: texto(11, "400", PWA.textoSecundario),
  pestanaTextoActiva: texto(11, "600", PWA.vino),
});
