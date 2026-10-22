/**
 * GlamSpaces · HU-10 Pantalla de inicio / búsqueda de salones (Sprint 3)
 * Responsable: Erick Trejo Reséndiz — capa FRONTEND (React Native / Expo)
 *
 * Esta pantalla solo ARMA las piezas. La separación es:
 *   - BusquedaSalonesScreen.js          → pantalla (JSX)              [este archivo]
 *   - BarraBusqueda.js                  → barra de búsqueda por zona
 *   - FiltrosChips.js · filtros.js      → chips de filtro, panel y sugerencias
 *   - ResultadosSalones.js              → cuadrícula, esqueletos, vacío y error
 *   - BusquedaSalones.styles.js         → estilos
 *   - useBusquedaSalones.js             → lógica / estado / acciones
 *   - busquedaSalones.validaciones.js   → reglas de los filtros
 *   - ../../services/salonesApi.js      → llamada a la API (HU-09)
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Marca from "../../components/Marca";
import BarraBusqueda from "./BarraBusqueda";
import FiltrosChips from "./FiltrosChips";
import ResultadosSalones from "./ResultadosSalones";
import useBusquedaSalones from "./useBusquedaSalones";
import { estilos } from "./BusquedaSalones.styles";

export default function BusquedaSalonesScreen({ navigation }) {
  const f = useBusquedaSalones();
  const ir = (pantalla, params) => navigation && navigation.navigate(pantalla, params);

  return (
    <ScrollView contentContainerStyle={estilos.pantalla} keyboardShouldPersistTaps="handled">
      <View style={estilos.franja}>
        <View style={estilos.franjaContenido}>
          <View style={estilos.encabezado}>
            <Marca claro />
            <Pressable
              style={({ hovered, focused }) => [estilos.botonCuenta, (hovered || focused) && estilos.chipFoco]}
              onPress={() => ir("Login")}
              accessibilityRole="button"
            >
              <Text style={estilos.botonCuentaTexto}>Mi cuenta</Text>
            </Pressable>
          </View>

          <Text style={estilos.tituloInicio} accessibilityRole="header">
            Encuentra el salón <Text style={estilos.tituloAcento}>para tu evento</Text>
          </Text>
          <Text style={estilos.subtituloInicio}>
            Compara salones por zona, capacidad y precio sin tener que llamar a cada uno.
          </Text>

          <BarraBusqueda valor={f.textoBusqueda} onCambiar={f.setTextoBusqueda} onBuscar={f.confirmarBusqueda} />
          <FiltrosChips f={f} />
        </View>
      </View>

      <View style={estilos.resultados}>
        {/* Criterio 4: al tocar una tarjeta se abre el detalle de ese salón */}
        <ResultadosSalones f={f} onAbrirSalon={(salonId) => ir("DetalleSalon", { salonId })} />
      </View>

      <Text style={estilos.pie}>Búsqueda de salones · GlamSpaces</Text>
    </ScrollView>
  );
}
