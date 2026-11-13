/**
 * GlamSpaces · Sprint 7 · Paginación con Anterior / Siguiente y números de página.
 *
 * La usan el panel del administrador, "Mis solicitudes" del cliente y las listas de salones.
 * Los cálculos (qué números se pintan, los textos) viven en services/paginacion.logica.js y
 * están probados; aquí solo está la parte visual.
 *
 * Accesibilidad: es un <nav>, la página actual lleva aria-current, los botones miden 44 px
 * y el foco se ve. Los "…" no son botones.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORES } from "../theme/colores";
import { conFuentes } from "../theme/disenoPwa";
import { ESPACIO, RADIO } from "../theme/espaciado";
import { numerosDePagina, textoDeRango } from "../services/paginacion.logica";

export default function Paginacion({
  pagina,
  totalPaginas,
  totalRegistros,
  desde,
  hasta,
  hayAnterior,
  haySiguiente,
  onPagina,
  singular = "resultado",
  plural = "resultados",
  etiqueta = "Paginación",
}) {
  if (!totalPaginas || totalPaginas <= 1) {
    // Con una sola página no hay botones, pero el total sí se dice.
    return totalRegistros > 0 ? (
      <Text style={estilos.rango}>{textoDeRango({ desde, hasta, totalRegistros }, singular, plural)}</Text>
    ) : null;
  }

  const numeros = numerosDePagina(pagina, totalPaginas);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.rango} role="status" aria-live="polite">
        {textoDeRango({ desde, hasta, totalRegistros }, singular, plural)}
      </Text>

      <View style={estilos.botones} role="navigation" aria-label={etiqueta}>
        <Pressable
          onPress={() => hayAnterior && onPagina(pagina - 1)}
          disabled={!hayAnterior}
          accessibilityRole="button"
          accessibilityLabel="Página anterior"
          aria-disabled={!hayAnterior || undefined}
          style={({ hovered, focused, pressed }) => [
            estilos.boton,
            estilos.botonTexto2,
            (hovered || pressed) && hayAnterior && estilos.botonActivo,
            focused && estilos.foco,
            !hayAnterior && estilos.inactivo,
          ]}
        >
          <Text style={estilos.textoBoton}>← Anterior</Text>
        </Pressable>

        {numeros.map((n, i) =>
          n === "…" ? (
            <Text key={`puntos-${i}`} style={estilos.puntos} accessibilityElementsHidden>…</Text>
          ) : (
            <Pressable
              key={n}
              onPress={() => n !== pagina && onPagina(n)}
              accessibilityRole="button"
              accessibilityLabel={`Página ${n}`}
              aria-current={n === pagina ? "page" : undefined}
              style={({ hovered, focused, pressed }) => [
                estilos.boton,
                estilos.numero,
                n === pagina && estilos.numeroActual,
                (hovered || pressed) && n !== pagina && estilos.botonActivo,
                focused && estilos.foco,
              ]}
            >
              <Text style={[estilos.textoBoton, n === pagina && estilos.textoActual]}>{n}</Text>
            </Pressable>
          ),
        )}

        <Pressable
          onPress={() => haySiguiente && onPagina(pagina + 1)}
          disabled={!haySiguiente}
          accessibilityRole="button"
          accessibilityLabel="Página siguiente"
          aria-disabled={!haySiguiente || undefined}
          style={({ hovered, focused, pressed }) => [
            estilos.boton,
            estilos.botonTexto2,
            (hovered || pressed) && haySiguiente && estilos.botonActivo,
            focused && estilos.foco,
            !haySiguiente && estilos.inactivo,
          ]}
        >
          <Text style={estilos.textoBoton}>Siguiente →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create(conFuentes({
  contenedor: { marginTop: ESPACIO.xl, gap: ESPACIO.md, alignItems: "center" },
  rango: { fontSize: 13, color: COLORES.muted, textAlign: "center" },
  botones: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: ESPACIO.sm,
  },
  boton: {
    minHeight: 44, // objetivo táctil
    minWidth: 44,
    paddingHorizontal: ESPACIO.md,
    borderRadius: RADIO.sm,
    borderWidth: 1,
    borderColor: COLORES.borde,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto2: { paddingHorizontal: ESPACIO.lg },
  numero: { paddingHorizontal: ESPACIO.md },
  numeroActual: { backgroundColor: COLORES.morado, borderColor: COLORES.morado },
  botonActivo: { backgroundColor: COLORES.moradoClaro },
  inactivo: { opacity: 0.45 },
  textoBoton: { fontSize: 13.5, fontWeight: "600", color: COLORES.texto },
  textoActual: { color: "#fff" },
  puntos: { fontSize: 13.5, color: COLORES.muted, paddingHorizontal: ESPACIO.xs },
  foco: {
    outlineWidth: 2,
    outlineColor: COLORES.dorado,
    outlineStyle: "solid",
    outlineOffset: 2,
  },
}));
