/**
 * GlamSpaces · HU-07 Formulario de publicación de salón (Sprint 2)
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
} from "react-native";
import Campo from "../../components/Campo";
import Marca from "../../components/Marca";
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

  if (f.cargandoSesion) {
    return (
      <View style={estilos.cargandoContenedor}>
        <ActivityIndicator color="#6b2a7a" size="large" />
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
        <Marca />

        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Publica tu salón</Text>
          <Text style={estilos.subtitulo}>
            Llena los datos de tu salón y agrega al menos un paquete con su precio para que
            los clientes puedan encontrarlo.
          </Text>

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

          <View style={estilos.separador} />
          {/* ---------- Paquetes ---------- */}
          <Text style={estilos.seccion}>Paquetes</Text>

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

          <TouchableOpacity onPress={() => navigation && navigation.navigate("Login")}>
            <Text style={estilos.enlaceVolver}>
              <Text style={estilos.enlaceResaltado}>← Volver a mi panel</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={estilos.pie}>HU-07 · Publicación de salón · Sprint 2 · GlamSpaces</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
