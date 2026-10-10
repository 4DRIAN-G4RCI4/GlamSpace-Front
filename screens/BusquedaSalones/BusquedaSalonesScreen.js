/**
 * GlamSpaces · HU-10 Pantalla de inicio / búsqueda de salones (Sprint 3)
 * Responsable: Erick Trejo Reséndiz — capa FRONTEND (React Native / Expo)
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - BusquedaSalonesScreen.js          → pantalla (JSX)          [este archivo]
 *   - BusquedaSalones.styles.js         → estilos
 *   - useBusquedaSalones.js             → lógica / estado / acciones
 *   - busquedaSalones.validaciones.js   → reglas de los filtros
 *   - ../../services/salonesApi.js      → llamada a la API (HU-09)
 *   - ../../components/TarjetaSalon.js  → tarjeta de cada resultado
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Marca from "../../components/Marca";
import TarjetaSalon from "../../components/TarjetaSalon";
import { COLORES } from "../../theme/colores";
import { formatearPrecio } from "../../utils/formato";
import useBusquedaSalones from "./useBusquedaSalones";
import { estilos } from "./BusquedaSalones.styles";

// Texto del chip según si el filtro está activo o no.
const CHIPS = [
  {
    nombre: "zona",
    inactivo: "📍 Zona",
    activo: (v) => `📍 ${v}`,
    etiqueta: "¿En qué zona es tu evento?",
    placeholder: "Ej. Tula de Allende",
    teclado: "default",
  },
  {
    nombre: "capacidadMinima",
    inactivo: "👥 Capacidad",
    activo: (v) => `👥 ${v}+ personas`,
    etiqueta: "¿Cuántos invitados tendrás como mínimo?",
    placeholder: "Ej. 150",
    teclado: "numeric",
  },
  {
    nombre: "precioMaximo",
    inactivo: "💲 Precio",
    activo: (v) => `💲 Hasta ${formatearPrecio(v)}`,
    etiqueta: "¿Cuál es tu presupuesto máximo (MXN)?",
    placeholder: "Ej. 10000",
    teclado: "decimal-pad",
  },
];

export default function BusquedaSalonesScreen({ navigation }) {
  const f = useBusquedaSalones();
  const chipEditando = CHIPS.find((c) => c.nombre === f.chipAbierto);

  return (
    <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
      <View style={estilos.encabezado}>
        <Marca />
        <TouchableOpacity
          style={estilos.botonCuenta}
          onPress={() => navigation && navigation.navigate("Login")}
          activeOpacity={0.85}
        >
          <Text style={estilos.botonCuentaTexto}>Mi cuenta</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.contenido}>
        <Text style={estilos.tituloInicio}>Encuentra el salón para tu evento</Text>
        <Text style={estilos.subtituloInicio}>
          Compara salones por zona, capacidad y precio sin tener que llamar a cada uno.
        </Text>

        {/* ---------- Barra de búsqueda (zona) ---------- */}
        <View style={estilos.barra}>
          <Text style={estilos.barraIcono}>🔍</Text>
          <TextInput
            style={estilos.barraInput}
            value={f.textoBusqueda}
            onChangeText={f.setTextoBusqueda}
            onSubmitEditing={f.confirmarBusqueda}
            placeholder="¿Dónde es tu evento? Ej. Tula"
            placeholderTextColor={COLORES.placeholder}
            returnKeyType="search"
          />
          <TouchableOpacity style={estilos.barraBoton} onPress={f.confirmarBusqueda} activeOpacity={0.85}>
            <Text style={estilos.barraBotonTexto}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* ---------- Chips de filtro: los activos se ven rellenos ---------- */}
        <View style={estilos.filaChips}>
          {CHIPS.map((chip) => {
            const valor = f.filtros[chip.nombre];
            const activo = !!valor;
            return (
              <View
                key={chip.nombre}
                style={[
                  estilos.chip,
                  activo && estilos.chipActivo,
                  f.chipAbierto === chip.nombre && estilos.chipAbierto,
                ]}
              >
                <TouchableOpacity
                  onPress={() => f.abrirChip(chip.nombre)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                >
                  <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                    {activo ? chip.activo(valor) : chip.inactivo}
                  </Text>
                </TouchableOpacity>
                {activo ? (
                  <TouchableOpacity
                    onPress={() => f.quitarFiltro(chip.nombre)}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar filtro ${chip.inactivo}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={estilos.chipQuitar}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* ---------- Editor del chip abierto ---------- */}
        {chipEditando ? (
          <View style={estilos.editorChip}>
            <Text style={estilos.editorEtiqueta}>{chipEditando.etiqueta}</Text>
            <TextInput
              style={[estilos.editorInput, f.errorChip && estilos.editorInputInvalido]}
              value={f.borradorChip}
              onChangeText={f.setBorradorChip}
              onSubmitEditing={f.aplicarChip}
              placeholder={chipEditando.placeholder}
              placeholderTextColor={COLORES.placeholder}
              keyboardType={chipEditando.teclado}
              autoFocus
            />
            {f.errorChip ? <Text style={estilos.error}>{f.errorChip}</Text> : null}
            <View style={estilos.editorBotones}>
              <TouchableOpacity style={estilos.editorCancelar} onPress={f.cerrarChip}>
                <Text style={estilos.editorCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.editorAplicar} onPress={f.aplicarChip} activeOpacity={0.85}>
                <Text style={estilos.editorAplicarTexto}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* ---------- Resultados ---------- */}
        {f.cargando ? (
          <ActivityIndicator style={estilos.cargandoLista} color={COLORES.morado} size="large" />
        ) : f.error ? (
          <View style={estilos.estadoVacio}>
            <Text style={estilos.estadoVacioIcono}>⚠️</Text>
            <Text style={estilos.estadoVacioTitulo}>No se pudieron cargar los salones</Text>
            <Text style={estilos.estadoVacioTexto}>{f.error}</Text>
            <TouchableOpacity style={estilos.botonSecundario} onPress={f.reintentar} activeOpacity={0.85}>
              <Text style={estilos.botonSecundarioTexto}>  Reintentar  </Text>
            </TouchableOpacity>
          </View>
        ) : f.salones.length === 0 ? (
          // Criterio 3: lista vacía
          <View style={estilos.estadoVacio}>
            <Text style={estilos.estadoVacioIcono}>🔎</Text>
            <Text style={estilos.estadoVacioTitulo}>
              No hay salones disponibles con esos filtros
            </Text>
            <Text style={estilos.estadoVacioTexto}>
              Prueba con otra zona, menos invitados o un presupuesto mayor.
            </Text>
            {f.hayFiltros ? (
              <TouchableOpacity style={estilos.botonSecundario} onPress={f.quitarTodos} activeOpacity={0.85}>
                <Text style={estilos.botonSecundarioTexto}>  Quitar filtros  </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <>
            <View style={estilos.filaResumen}>
              <Text style={estilos.resumen}>
                {f.totalRegistros} {f.totalRegistros === 1 ? "salón encontrado" : "salones encontrados"}
              </Text>
              {f.hayFiltros ? (
                <Text style={estilos.enlaceLimpiar} onPress={f.quitarTodos}>
                  Quitar filtros
                </Text>
              ) : null}
            </View>

            {f.salones.map((salon) => (
              <TarjetaSalon
                key={salon.id}
                salon={salon}
                // Criterio 4: al tocar la tarjeta se abre el detalle de ese salón
                onPress={() => navigation && navigation.navigate("DetalleSalon", { salonId: salon.id })}
              />
            ))}

            {f.hayMas ? (
              <TouchableOpacity
                style={[estilos.botonSecundario, f.cargandoMas && estilos.botonDeshabilitado]}
                onPress={f.cargarMas}
                disabled={f.cargandoMas}
                activeOpacity={0.85}
              >
                {f.cargandoMas ? (
                  <ActivityIndicator color={COLORES.morado} />
                ) : (
                  <Text style={estilos.botonSecundarioTexto}>Cargar más salones</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>

      <Text style={estilos.pie}>HU-10 · Búsqueda de salones · Sprint 3 · GlamSpaces</Text>
    </ScrollView>
  );
}
