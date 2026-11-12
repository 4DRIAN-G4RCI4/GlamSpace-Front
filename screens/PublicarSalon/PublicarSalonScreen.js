/**
 * GlamSpaces · HU-07 Formulario de publicación de salón (Sprint 2) — "Mi salón" del administrador.
 * Diseño (Sprint 6): Figma PROYECTO--PWA, Admin 05 · Publicar / editar salón, dentro de LayoutAdmin.
 * Responsable: Erick Trejo Reséndiz — capa FRONTEND (React Native / Expo)
 *
 * Esta pantalla es solo el MÓDULO VISUAL. La separación es:
 *   - PublicarSalonScreen.js          → pantalla (JSX)          [este archivo]
 *   - PublicarSalon.styles.js         → estilos
 *   - usePublicarSalon.js             → lógica / estado / acciones
 *   - publicarSalon.validaciones.js   → reglas de validación
 *   - ../../services/salonesApi.js    → llamadas a la API (HU-06)
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Campo from "../../components/Campo";
import Marca from "../../components/Marca";
import LayoutAdmin from "../PanelAdministrador/LayoutAdmin";
import { MEDIDA } from "../../theme/disenoPwa";
import { COLORES } from "../../theme/colores";
import usePublicarSalon from "./usePublicarSalon";
import { estilos } from "./PublicarSalon.styles";

function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PublicarSalonScreen({ navigation }) {
  const f = usePublicarSalon();
  const { width } = useWindowDimensions();
  const escritorio = width >= MEDIDA.corteEscritorio;

  if (f.cargandoSesion) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color={COLORES.morado} size="large" />
      </View>
    );
  }

  if (!f.esAdministrador) {
    return (
      <ScrollView contentContainerStyle={estilos.pagina}>
        <Marca />
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Publica tu salón</Text>
          <Text style={estilos.subtitulo}>
            Para publicar un salón necesitas iniciar sesión con una cuenta de administrador.
          </Text>
          <TouchableOpacity
            style={estilos.boton}
            onPress={() => navigation && navigation.navigate("Login")}
            activeOpacity={0.85}
          >
            <Text style={estilos.botonTexto}>Ir a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // La navegación del panel: Solicitudes y Calendario regresan al panel en esa pestaña.
  const irASeccion = (clave) => {
    if (clave !== "salon" && navigation) navigation.navigate("PanelAdministrador", { pestana: clave });
  };

  return (
    <LayoutAdmin
      seccion="salon"
      onElegir={irASeccion}
      nombreSalon={(f.sesion && (f.sesion.nombre_salon || f.sesion.nombre)) || ""}
      onCuenta={() => navigation && navigation.navigate("Perfil")}
    >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={escritorio ? estilos.contenidoAdmin : estilos.contenidoAdminMovil} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo} accessibilityRole="header">Mi salón</Text>
        <Text style={estilos.subtitulo}>
          Llena los datos de tu salón y agrega al menos un paquete con su precio para que los clientes puedan encontrarlo.
        </Text>

        <View style={escritorio ? estilos.columnas : null}>
        <View style={[estilos.tarjeta, estilos.tarjetaAdmin, escritorio && estilos.columnaDatos]}>
          {/* ---------- Datos del salón ---------- */}
          <Text style={estilos.seccion}>Datos del salón</Text>

          <Campo
            etiqueta="Nombre del salón"
            valor={f.nombre}
            onCambiar={f.setNombre}
            placeholder="Ej. Salón Jardín Las Rosas"
            error={f.errores.nombre}
            autoCapitalize="words"
          />

          <Campo
            etiqueta="Zona o dirección"
            valor={f.zona}
            onCambiar={f.setZona}
            placeholder="Ej. Col. Centro, Tula de Allende, Hgo."
            error={f.errores.zona}
          />

          <Campo
            etiqueta="Capacidad (personas)"
            valor={f.capacidad}
            onCambiar={f.setCapacidad}
            placeholder="Ej. 150"
            error={f.errores.capacidad}
            keyboardType="numeric"
          />

          <Campo
            etiqueta="Descripción del salón (opcional)"
            valor={f.descripcionSalon}
            onCambiar={f.setDescripcionSalon}
            placeholder="Ej. Salón con jardín exterior, ideal para bodas y XV años."
            multilinea
          />

        </View>

        <View style={[estilos.tarjeta, estilos.tarjetaAdmin, escritorio && estilos.columnaPaquetes]}>
          {/* ---------- Paquetes ---------- */}
          <Text style={estilos.seccion}>Paquetes y precios</Text>

          {f.errores.paquetes ? (
            <Text style={estilos.errorSeccion}>{f.errores.paquetes}</Text>
          ) : null}

          {f.paquetes.map((p, i) => (
            <View key={`${p.nombre}-${i}`} style={estilos.itemLista}>
              <View style={estilos.itemTextoContenedor}>
                <Text style={estilos.itemTitulo}>
                  {p.nombre} · {formatearPrecio(p.precio)}
                </Text>
                {p.descripcion ? <Text style={estilos.itemDetalle}>{p.descripcion}</Text> : null}
              </View>
              {i < f.paquetesEnviados ? (
                <Text style={estilos.itemEnviado}>Enviado ✓</Text>
              ) : (
                <TouchableOpacity style={estilos.botonQuitar} onPress={() => f.quitarPaquete(i)}>
                  <Text style={estilos.botonQuitarTexto}>Quitar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View
            style={[
              estilos.bloquePaquete,
              f.errores.paquetes ? estilos.bloquePaqueteInvalido : null,
            ]}
          >
            <Campo
              etiqueta="Nombre del paquete"
              valor={f.borrador.nombre}
              onCambiar={(v) => f.cambiarBorrador("nombre", v)}
              placeholder="Ej. Paquete Básico"
              error={f.erroresPaquete.nombre}
              autoCapitalize="sentences"
            />

            <Campo
              etiqueta="Descripción"
              valor={f.borrador.descripcion}
              onCambiar={(v) => f.cambiarBorrador("descripcion", v)}
              placeholder="Qué incluye: horas, mesas, sillas, mantelería..."
              multilinea
            />

            <Campo
              etiqueta="Precio (MXN)"
              valor={f.borrador.precio}
              onCambiar={(v) => f.cambiarBorrador("precio", v)}
              placeholder="Ej. 8500"
              error={f.erroresPaquete.precio}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity
              style={estilos.botonAgregarPaquete}
              onPress={f.agregarPaquete}
              activeOpacity={0.85}
            >
              <Text style={estilos.botonAgregarPaqueteTexto}>+ Agregar paquete</Text>
            </TouchableOpacity>
          </View>

          {/* ---------- Publicar ---------- */}
          <View style={estilos.separador} />

          <TouchableOpacity
            style={[estilos.boton, estilos.botonPublicar, f.enviando && estilos.botonDeshabilitado]}
            onPress={f.publicar}
            disabled={f.enviando}
            activeOpacity={0.85}
          >
            {f.enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.botonTexto}>Publicar</Text>
            )}
          </TouchableOpacity>

          {f.mensaje ? (
            <Text
              style={[
                estilos.mensajeGeneral,
                f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail,
              ]}
            >
              {f.mensaje.texto}
            </Text>
          ) : null}

        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </LayoutAdmin>
  );
}
