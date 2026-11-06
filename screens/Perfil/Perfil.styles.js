// Perfil.styles – estilos responsivos y elegantes para la pantalla de perfil
import { StyleSheet, Dimensions } from "react-native";
import { COLORES } from "../../theme/colores";

const { width } = Dimensions.get("window");
const AVATAR_TAM = Math.min(120, width * 0.3); // máximo 120 px o 30% del ancho

export const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  // Menú hamburguesa deslizante
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#FFF",
    paddingTop: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuTexto: {
    fontSize: 16,
    color: "#333",
  },
  // Contenido principal
  cuerpo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    marginBottom: 18,
    borderRadius: AVATAR_TAM / 2,
    overflow: "hidden",
  },
  avatar: {
    width: AVATAR_TAM,
    height: AVATAR_TAM,
    borderRadius: AVATAR_TAM / 2,
    borderWidth: 3,
    borderColor: COLORES.moradoClaro,
  },
  // Sin foto: iniciales sobre el mismo círculo del avatar
  avatarIniciales: {
    backgroundColor: COLORES.morado,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInicialesTexto: {
    fontSize: AVATAR_TAM * 0.36,
    fontWeight: "700",
    color: "#FFF",
  },
  // Opciones sin pantalla todavía
  deshabilitada: {
    opacity: 0.5,
  },
  proximamente: {
    fontSize: 12,
    color: "#8E8E93",
  },
  nombre: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: "#8E8E93",
    marginBottom: 24,
  },
  opciones: {
    width: "100%",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
  opcion: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  opcionTexto: {
    fontSize: 16,
    color: "#007AFF",
  },
});
