/**
 * GlamSpaces · Carga en web las fuentes del diseño PWA (Playfair Display e Inter).
 *
 * Agrega una sola vez el <link> de Google Fonts al <head>. En Android/iOS no hace nada:
 * ahí se usa la fuente del sistema hasta que se integre expo-font.
 */

import { useEffect } from "react";
import { Platform } from "react-native";

const ID_ENLACE = "glamspaces-fuentes-pwa";
const URL_FUENTES =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap";

export default function useFuentesWeb() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    if (document.getElementById(ID_ENLACE)) return;

    const enlace = document.createElement("link");
    enlace.id = ID_ENLACE;
    enlace.rel = "stylesheet";
    enlace.href = URL_FUENTES;
    document.head.appendChild(enlace);
  }, []);
}
