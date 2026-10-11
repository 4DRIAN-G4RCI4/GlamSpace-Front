/**
 * GlamSpaces · HU-10 · Resultados de la búsqueda: cargando (esqueletos), error,
 * vacío (criterio 3) o la cuadrícula de tarjetas (criterio 4). Solo presentación.
 * La cuadrícula pasa de 1 a 2 o 3 columnas según el ancho de la pantalla.
 */

import React from "react";
import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import TarjetaSalon from "../../components/TarjetaSalon";
import { TarjetaSalonEsqueleto } from "../../components/Esqueleto";
import { COLORES } from "../../theme/colores";
import { CORTES } from "../../theme/espaciado";
import { estilos } from "./BusquedaSalones.styles";

function useColumnas() {
  const { width } = useWindowDimensions();
  if (width >= CORTES.escritorio) return 3;
  if (width >= CORTES.tablet) return 2;
  return 1;
}

function Cuadricula({ columnas, children }) {
  const ancho = `${100 / columnas}%`;
  return (
    <View style={estilos.cuadricula}>
      {React.Children.map(children, (hijo) => (
        <View style={[estilos.celda, { width: ancho }]}>{hijo}</View>
      ))}
    </View>
  );
}

function Estado({ icono, titulo, texto, boton, onBoton }) {
  return (
    <View style={estilos.estado} accessibilityRole="summary" accessibilityLiveRegion="polite">
      <Text style={estilos.estadoIcono}>{icono}</Text>
      <Text style={estilos.estadoTitulo}>{titulo}</Text>
      <Text style={estilos.estadoTexto}>{texto}</Text>
      {boton ? (
        <Pressable
          onPress={onBoton}
          accessibilityRole="button"
          style={({ focused }) => [estilos.estadoBoton, focused && estilos.foco]}
        >
          <Text style={estilos.estadoBotonTexto}>{boton}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ResultadosSalones({ f, onAbrirSalon }) {
  const columnas = useColumnas();

  if (f.cargando) {
    return (
      <View accessibilityLabel="Cargando salones" aria-busy>
        <Cuadricula columnas={columnas}>
          {Array.from({ length: columnas * 2 }, (_, i) => (
            <TarjetaSalonEsqueleto key={i} />
          ))}
        </Cuadricula>
      </View>
    );
  }

  if (f.error) {
    return (
      <Estado icono="⚠️" titulo="No se pudieron cargar los salones" texto={f.error} boton="Reintentar" onBoton={f.reintentar} />
    );
  }

  if (f.salones.length === 0) {
    return (
      <Estado
        icono="🔎"
        titulo="No hay salones disponibles con esos filtros"
        texto="Prueba con otra zona, menos invitados o un presupuesto mayor."
        boton={f.hayFiltros ? "Quitar filtros" : null}
        onBoton={f.quitarTodos}
      />
    );
  }

  return (
    <>
      <View style={estilos.filaResumen}>
        <Text style={estilos.resumen} accessibilityLiveRegion="polite">
          {f.totalRegistros} {f.totalRegistros === 1 ? "salón encontrado" : "salones encontrados"}
        </Text>
        {f.hayFiltros ? (
          <Pressable onPress={f.quitarTodos} accessibilityRole="button">
            <Text style={estilos.enlaceLimpiar}>Quitar filtros</Text>
          </Pressable>
        ) : null}
      </View>

      <Cuadricula columnas={columnas}>
        {f.salones.map((salon) => (
          <TarjetaSalon key={salon.id} salon={salon} onPress={() => onAbrirSalon(salon.id)} />
        ))}
      </Cuadricula>

      {f.hayMas ? (
        <Pressable
          onPress={f.cargarMas}
          disabled={f.cargandoMas}
          accessibilityRole="button"
          style={({ focused }) => [estilos.botonMas, focused && estilos.foco, f.cargandoMas && estilos.botonDeshabilitado]}
        >
          {f.cargandoMas ? (
            <ActivityIndicator color={COLORES.morado} />
          ) : (
            <Text style={estilos.botonMasTexto}>Cargar más salones</Text>
          )}
        </Pressable>
      ) : null}
    </>
  );
}
