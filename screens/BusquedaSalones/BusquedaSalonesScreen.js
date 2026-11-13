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
import { View, Text, ScrollView } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import BarraBusqueda from "./BarraBusqueda";
import FiltrosChips from "./FiltrosChips";
import ResultadosSalones from "./ResultadosSalones";
import InvitacionAdmin from "../../components/InvitacionAdmin";
import useSesion from "../../components/useSesion";
import useBusquedaSalones from "./useBusquedaSalones";
import { estilos } from "./BusquedaSalones.styles";

export default function BusquedaSalonesScreen({ navigation }) {
  const f = useBusquedaSalones();
  const { sesion } = useSesion();
  const ir =(pantalla, params) => navigation && navigation.navigate(pantalla, params);
  const inicioResultados = React.useRef(null);

  // Al cambiar de página de 18 se sube al inicio de la lista.
  function irAPagina(n) {
    // `void`: la consulta al back es asíncrona y aquí no hay nada que esperar; sus errores
    // los maneja el propio hook y los muestra la lista.
    void f.irAPagina(n);
    if (inicioResultados.current && inicioResultados.current.scrollIntoView) {
      inicioResultados.current.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }

  return (
    <View style={estilos.raiz}>
    {/* Barra superior fija (Figma Cliente 02/06): fuera del ScrollView para que no se pierda */}
    <BarraNavegacion navigation={navigation} pantalla="BusquedaSalones" />
    <ScrollView style={estilos.raiz} contentContainerStyle={estilos.pantalla} keyboardShouldPersistTaps="handled">

      <View style={estilos.franjaContenido}>
        <Text style={estilos.tituloInicio} accessibilityRole="header">
          {f.filtros.zona ? `Salones en ${f.filtros.zona}` : "Encuentra el salón para tu evento"}
        </Text>
        <BarraBusqueda valor={f.textoBusqueda} onCambiar={f.setTextoBusqueda} onBuscar={f.confirmarBusqueda} />
        <FiltrosChips f={f} />
      </View>

      <View style={estilos.franjaContenido}>
        {/* Solo la ve un cliente que todavía no tiene cuenta de administrador */}
        <InvitacionAdmin sesion={sesion} navigation={navigation} />
      </View>

      <View style={estilos.resultados} ref={inicioResultados}>
        {/* Criterio 4: al tocar una tarjeta se abre el detalle de ese salón */}
        <ResultadosSalones
          f={f}
          onAbrirSalon={(salonId) => ir("DetalleSalon", { salonId })}
          onPagina={irAPagina}
        />
      </View>

    </ScrollView>
    </View>
  );
}
