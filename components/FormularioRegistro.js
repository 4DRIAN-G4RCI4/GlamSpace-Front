/**
 * GlamSpaces · Formulario de registro compartido por HU-02 (cliente) y HU-03 (administrador).
 *
 * Las dos pantallas piden lo mismo: nombre, correo, contraseña, confirmación y términos.
 * Cada una le pasa sus textos, su hook (`f`) y, en `children`, los campos que solo ella
 * pide (el nombre del salón en el registro de administrador), que van después del correo.
 */

import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Campo from "./Campo";
import LayoutAcceso from "./LayoutAcceso";
import { comunes as estilos } from "../theme/estilosComunes";
import { COLORES } from "../theme/colores";

export default function FormularioRegistro({ navigation, f, textos, children }) {
  return (
    <LayoutAcceso navigation={navigation} respaldoRegresar="Login" textoMarca={textos.marca}>
      <View>
        <Text style={estilos.titulo} accessibilityRole="header">{textos.titulo}</Text>
        <Text style={estilos.subtitulo}>{textos.subtitulo}</Text>

        <Campo
          etiqueta="Nombre completo"
          autoComplete="name"
          textContentType="name"
          valor={f.nombre}
          onCambiar={f.setNombre}
          placeholder={textos.ejemploNombre}
          error={f.errores.nombre}
          autoCapitalize="words"
        />

        <Campo
          etiqueta="Correo electrónico"
          autoComplete="email"
          textContentType="emailAddress"
          valor={f.correo}
          onCambiar={f.setCorreo}
          placeholder="tucorreo@ejemplo.com"
          error={f.errores.correo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {children}

        <Campo
          etiqueta="Contraseña"
          autoComplete="new-password"
          textContentType="newPassword"
          valor={f.password}
          onCambiar={f.setPassword}
          placeholder="Mínimo 8 caracteres"
          error={f.errores.password}
          secureTextEntry={!f.mostrarPassword}
          pistaExtra="Usa al menos 8 caracteres."
          conToggle
          mostrarPassword={f.mostrarPassword}
          onToggle={f.alternarPassword}
        />

        <Campo
          etiqueta="Confirmar contraseña"
          autoComplete="new-password"
          textContentType="newPassword"
          valor={f.password2}
          onCambiar={f.setPassword2}
          placeholder="Repite tu contraseña"
          error={f.errores.password2}
          secureTextEntry={!f.mostrarPassword}
        />

        <TouchableOpacity style={estilos.filaCheckbox} onPress={f.alternarTerminos} activeOpacity={0.7}>
          <View style={[estilos.checkbox, f.aceptaTerminos && estilos.checkboxActivo]}>
            {f.aceptaTerminos ? <Text style={estilos.checkboxMarca}>✓</Text> : null}
          </View>
          <Text style={estilos.textoCheckbox}>Acepto los términos y el aviso de privacidad de GlamSpaces</Text>
        </TouchableOpacity>
        {f.errores.terminos ? <Text style={estilos.error}>{f.errores.terminos}</Text> : null}

        <TouchableOpacity
          style={[estilos.boton, f.enviando && estilos.botonDeshabilitado]}
          onPress={f.manejarRegistro}
          disabled={f.enviando}
          activeOpacity={0.85}
        >
          {f.enviando ? <ActivityIndicator color={COLORES.sobreMorado} /> : <Text style={estilos.botonTexto}>{textos.boton}</Text>}
        </TouchableOpacity>

        {f.mensaje ? (
          <Text style={[estilos.mensajeGeneral, f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail]}>
            {f.mensaje.texto}
          </Text>
        ) : null}

        <TouchableOpacity onPress={() => navigation && navigation.navigate(textos.enlace.destino)}>
          <Text style={estilos.enlaceCambio}>
            {textos.enlace.pregunta}{" "}
            <Text style={estilos.enlaceResaltado}>{textos.enlace.accion}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LayoutAcceso>
  );
}
