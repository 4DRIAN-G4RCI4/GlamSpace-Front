/**
 * GlamSpaces · HU-10 · Chips de filtro (zona, capacidad, precio) y el panel del
 * chip abierto. Un chip activo se ve relleno y con su valor (regla de negocio:
 * la pantalla refleja los filtros activos). Solo presentación.
 */

import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { COLORES } from "../../theme/colores";
import { FILTROS } from "./filtros";
import { estilos } from "./BusquedaSalones.styles";

function Chip({ filtro, valor, abierto, onAbrir, onQuitar }) {
  const activo = !!valor;
  return (
    <View style={[estilos.chip, activo && estilos.chipActivo, abierto && estilos.chipAbierto]}>
      <Pressable
        style={estilos.chipBoton}
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityState={{ selected: activo, expanded: abierto }}
        accessibilityLabel={activo ? `Filtro ${filtro.inactivo}: ${filtro.activo(valor)}. Cambiar` : `Filtrar por ${filtro.inactivo}`}
      >
        <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
          {filtro.icono} {activo ? filtro.activo(valor) : filtro.inactivo}
        </Text>
        <Text style={[estilos.chipFlecha, activo && estilos.chipFlechaActiva]}>{abierto ? "▲" : "▼"}</Text>
      </Pressable>
      {activo ? (
        <Pressable
          style={estilos.chipQuitar}
          onPress={onQuitar}
          accessibilityRole="button"
          accessibilityLabel={`Quitar filtro ${filtro.inactivo}`}
          hitSlop={8}
        >
          <Text style={estilos.chipQuitarTexto}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function PanelFiltro({ filtro, borrador, onCambiar, error, onAplicar, onSugerencia, onCancelar }) {
  return (
    <View style={estilos.panel}>
      <Text style={estilos.panelPregunta}>{filtro.pregunta}</Text>

      <View style={estilos.filaSugerencias}>
        {filtro.sugerencias.map((s) => (
          <Pressable
            key={s.valor}
            onPress={() => onSugerencia(s.valor)}
            accessibilityRole="button"
            style={({ hovered, focused }) => [estilos.sugerencia, (hovered || focused) && estilos.sugerenciaResaltada]}
          >
            <Text style={estilos.sugerenciaTexto}>{s.texto}</Text>
          </Pressable>
        ))}
      </View>

      <View style={estilos.panelFila}>
        <TextInput
          style={[estilos.panelInput, error && estilos.panelInputInvalido]}
          value={borrador}
          onChangeText={onCambiar}
          onSubmitEditing={onAplicar}
          placeholder={filtro.placeholder}
          placeholderTextColor={COLORES.placeholder}
          keyboardType={filtro.teclado}
          accessibilityLabel={filtro.pregunta}
          autoFocus
        />
        <Pressable
          style={({ pressed }) => [estilos.panelAplicar, pressed && { opacity: 0.85 }]}
          onPress={onAplicar}
          accessibilityRole="button"
        >
          <Text style={estilos.panelAplicarTexto}>Aplicar</Text>
        </Pressable>
      </View>
      {error ? (
        <Text style={estilos.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Pressable style={estilos.panelCancelar} onPress={onCancelar} accessibilityRole="button">
        <Text style={estilos.panelCancelarTexto}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

export default function FiltrosChips({ f }) {
  const filtroAbierto = FILTROS.find((x) => x.nombre === f.chipAbierto);

  return (
    <>
      <View style={estilos.filaChips}>
        {FILTROS.map((filtro) => (
          <Chip
            key={filtro.nombre}
            filtro={filtro}
            valor={f.filtros[filtro.nombre]}
            abierto={f.chipAbierto === filtro.nombre}
            onAbrir={() => f.abrirChip(filtro.nombre)}
            onQuitar={() => f.quitarFiltro(filtro.nombre)}
          />
        ))}
      </View>

      {filtroAbierto ? (
        <PanelFiltro
          filtro={filtroAbierto}
          borrador={f.borradorChip}
          onCambiar={f.setBorradorChip}
          error={f.errorChip}
          onAplicar={f.aplicarChip}
          onSugerencia={f.aplicarSugerencia}
          onCancelar={f.cerrarChip}
        />
      ) : null}
    </>
  );
}
