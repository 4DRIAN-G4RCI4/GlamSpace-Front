import { StyleSheet } from "react-native";
import { conFuentes, PWA } from "../theme/disenoPwa";
import { COLORES } from "../theme/colores";

const PROPORCION_FOTO = 282 / 133;

// Medidas de la tarjeta de Figma (Cliente 02 · Búsqueda): 282 × 188, foto de 133 px de alto.
export const estilos = StyleSheet.create(conFuentes({
  envoltura: { flex: 1 },
  tarjeta: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  tarjetaResaltada: { borderColor: COLORES.morado },
  tarjetaFoco: { borderWidth: 2, borderColor: COLORES.morado },
  tarjetaPresionada: { opacity: 0.9 },

  foto: { width: "100%", aspectRatio: PROPORCION_FOTO, backgroundColor: COLORES.esqueleto, overflow: "hidden" },
  cuerpo: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 6 },
  filaSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  nombre: { flex: 1, fontSize: 16.5, fontWeight: "700", color: COLORES.texto },
  precio: { fontSize: 12.5, fontWeight: "700", color: COLORES.doradoTexto, marginTop: 2 },
  detalle: { fontSize: 12, color: COLORES.muted },

  // ---------- Carrusel (HU-07 fotos) ----------
  tira: { flexDirection: "row", height: "100%" },
  fotoCarrusel: { width: "100%", height: "100%" },
  fotoPendiente: { backgroundColor: COLORES.esqueleto },
  puntos: { position: "absolute", bottom: 8, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  punto: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.6)", borderWidth: 0.5, borderColor: PWA.sombra },
  puntoActivo: { backgroundColor: PWA.superficie, width: 9, height: 9, borderRadius: 5, marginTop: -1 },
  // Capa sobre la foto (misma proporción) con las flechas; no tapa la tarjeta (box-none).
  controles: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    aspectRatio: PROPORCION_FOTO,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  flecha: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: PWA.borde,
  },
  flechaFoco: { borderColor: PWA.vino, borderWidth: 2 },
  flechaTexto: { fontSize: 20, lineHeight: 22, fontWeight: "700", color: PWA.vino },
}, ["nombre"]));
