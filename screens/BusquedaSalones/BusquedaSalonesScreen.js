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
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import Marca from "../../components/Marca";
import BarraBusqueda from "./BarraBusqueda";
import FiltrosChips from "./FiltrosChips";
import ResultadosSalones from "./ResultadosSalones";
import useBusquedaSalones from "./useBusquedaSalones";
import { estilos } from "./BusquedaSalones.styles";

export default function BusquedaSalonesScreen({ navigation }) {
  const f = useBusquedaSalones();
  const angosta = useWindowDimensions().width < 520; // en móvil solo cabe "Mi cuenta"
  const ir =(pantalla, params) => navigation && navigation.navigate(pantalla, params);

  return (
    <ScrollView contentContainerStyle={estilos.pantalla} keyboardShouldPersistTaps="handled">
      {/* Barra superior (Figma Cliente 02): marca a la izquierda, cuenta y registro a la derecha */}
      <View style={estilos.navbar}>
        <View style={estilos.navbarContenido}>
          <Marca compacta />
          <View style={estilos.navbarAcciones}>
            <Pressable
              style={({ hovered, focused }) => [estilos.botonCuenta, (hovered || focused) && estilos.foco]}
              onPress={() => ir("Perfil")}
              accessibilityRole="button"
            >
              <Text style={estilos.botonCuentaTexto}>Mi cuenta</Text>
            </Pressable>
            {angosta ? null : (
              <Pressable
                style={({ hovered, focused }) => [estilos.botonRegistro, (hovered || focused) && { opacity: 0.85 }]}
                onPress={() => ir("RegistroAdministrador")}
                accessibilityRole="button"
              >
                <Text style={estilos.botonRegistroTexto}>Registra tu salón</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <View style={estilos.franjaContenido}>
        <Text style={estilos.tituloInicio} accessibilityRole="header">
          {f.filtros.zona ? `Salones en ${f.filtros.zona}` : "Encuentra el salón para tu evento"}
        </Text>
        <BarraBusqueda valor={f.textoBusqueda} onCambiar={f.setTextoBusqueda} onBuscar={f.confirmarBusqueda} />
        <FiltrosChips f={f} />
      </View>

      <View style={estilos.resultados}>
        {/* Criterio 4: al tocar una tarjeta se abre el detalle de ese salón */}
        <ResultadosSalones f={f} onAbrirSalon={(salonId) => ir("DetalleSalon", { salonId })} />
      </View>

    </ScrollView>
  );
}
