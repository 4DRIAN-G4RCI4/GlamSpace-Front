/**
 * GlamSpaces · Mejora de HU-07/HU-08 · "Editar salón" (y crear uno nuevo).
 *
 * Al abrirla con un salón, MUESTRA todo lo que ese salón ya tiene: nombre, ubicación, capacidad,
 * descripción, estado, fotos y paquetes, y todo se puede cambiar. Al crear uno nuevo, el
 * formulario nace vacío (el nombre ya NO se prellena con el correo).
 *
 * Diseño: Figma PROYECTO--PWA, Admin 05 (encabezado con "Guardar cambios", rejilla de datos y
 * columna de paquetes), dentro de LayoutAdmin.
 *
 * Todas las acciones que escriben pasan por DialogoConfirmacion. Al final, la zona de peligro
 * con Eliminar salón. Sin conexión (HU-22) todo lo que escribe queda deshabilitado con su motivo.
 */

import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Campo from "../../components/Campo";
import DialogoConfirmacion from "../../components/DialogoConfirmacion";
import LayoutAdmin from "../PanelAdministrador/LayoutAdmin";
import BannerSinConexion from "../PanelAdministrador/BannerSinConexion";
import SeccionFotos from "../PublicarSalon/SeccionFotos";
import { COLORES } from "../../theme/colores";
import { MEDIDA } from "../../theme/disenoPwa";
import { formatearPrecio } from "../../utils/formato";
import BotonRegresar from "../../components/BotonRegresar";
import CampoUbicacion from "./CampoUbicacion";
import useEditarSalon from "./useEditarSalon";
import { estilos } from "./MisSalones.styles";

function Boton({ texto, onPress, tipo = "secundario", deshabilitado, motivo, ocupado, etiqueta }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado || ocupado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta || texto}
      accessibilityHint={deshabilitado ? motivo : undefined}
      aria-disabled={deshabilitado || undefined}
      title={deshabilitado ? motivo : undefined}
      style={({ hovered, focused, pressed }) => [
        estilos.boton,
        tipo === "principal" ? estilos.botonPrincipal : estilos.botonSecundario,
        (hovered || pressed) && !deshabilitado && { opacity: 0.88 },
        focused && estilos.foco,
        (deshabilitado || ocupado) && estilos.botonInactivo,
      ]}
    >
      {ocupado ? (
        <ActivityIndicator color={tipo === "principal" ? "#fff" : COLORES.morado} size="small" />
      ) : (
        <Text style={tipo === "principal" ? estilos.botonPrincipalTexto : estilos.botonSecundarioTexto}>{texto}</Text>
      )}
    </Pressable>
  );
}

export default function EditarSalonScreen({ navigation, route }) {
  const salonId = route && route.params ? route.params.salonId : null;
  const f = useEditarSalon(salonId);
  const { width } = useWindowDimensions();
  const escritorio = width >= MEDIDA.corteEscritorio;

  const volver = () => {
    if (navigation) navigation.navigate("MisSalones");
  };

  if (f.cargandoSesion || f.cargando) {
    return (
      <View style={estilos.cargandoCaja}>
        <ActivityIndicator color={COLORES.morado} size="large" />
      </View>
    );
  }

  if (!f.esAdministrador) {
    return (
      <ScrollView contentContainerStyle={estilos.contenidoMovil}>
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Editar salón</Text>
          <Text style={estilos.subtitulo}>Necesitas iniciar sesión con una cuenta de administrador.</Text>
          <Boton texto="Ir a iniciar sesión" tipo="principal" onPress={() => navigation && navigation.navigate("Login")} />
        </View>
      </ScrollView>
    );
  }

  if (f.errorCarga) {
    return (
      <ScrollView contentContainerStyle={estilos.contenidoMovil}>
        <View style={estilos.tarjeta}>
          <Text style={[estilos.mensaje, estilos.mensajeFail]}>{f.errorCarga}</Text>
          <View style={estilos.barraAcciones}>
            <Boton texto="Reintentar" tipo="principal" onPress={f.recargar} />
            <Boton texto="Volver a Mis salones" onPress={volver} />
          </View>
        </View>
      </ScrollView>
    );
  }

  const irASeccion = (clave) => {
    if (!navigation) return;
    // Desde "Editar salón", tocar "Mi salón" en el menú regresa a la lista (avisando si hay
    // cambios sin guardar); las otras secciones van al panel.
    if (clave === "salon") f.pedirSalir(volver);
    else f.pedirSalir(() => navigation.navigate("PanelAdministrador", { pestana: clave }));
  };

  // Al confirmar el borrado hay que regresar a la lista.
  const confirmarDialogo = async () => {
    if (!f.confirmacion) return;
    if (f.confirmacion.esEliminarSalon) {
      const r = await f.confirmarEliminarSalon();
      if (r && r.eliminado) volver();
      return;
    }
    const r = f.confirmacion.alConfirmar ? await f.confirmacion.alConfirmar() : null;
    if (r && r.creado) navigation.navigate("EditarSalon", { salonId: r.creado });
  };

  return (
    <LayoutAdmin
      seccion="salon"
      onElegir={irASeccion}
      nombreSalon={f.formulario.nombre}
      nombreAdmin={f.sesion ? f.sesion.nombre : ""}
      onCuenta={() => navigation && navigation.navigate("Perfil")}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={escritorio ? estilos.contenido : estilos.contenidoMovil}
          keyboardShouldPersistTaps="handled"
        >
          <BotonRegresar navigation={navigation} respaldo="MisSalones" />

          <View style={estilos.encabezado}>
            <Text style={estilos.titulo} accessibilityRole="header">
              {f.esNuevo ? "Nuevo salón" : "Editar salón"}
            </Text>
            <View style={estilos.barraAcciones}>
              <Boton
                texto={f.publicado ? "Pasar a borrador" : "Publicar"}
                onPress={f.pedirCambiarEstado}
                deshabilitado={!f.accionGuardar.habilitada}
                motivo={f.accionGuardar.motivo}
              />
              <Boton texto="Cancelar" onPress={() => f.pedirSalir(volver)} />
              <Boton
                texto="Guardar cambios"
                tipo="principal"
                onPress={f.pedirGuardar}
                ocupado={f.guardando}
                deshabilitado={!f.accionGuardar.habilitada}
                motivo={f.accionGuardar.motivo}
              />
            </View>
          </View>
          <Text style={estilos.subtitulo}>
            {f.publicado
              ? "Este salón está publicado: los clientes pueden encontrarlo y solicitar reservaciones."
              : "Este salón está en borrador: todavía no aparece en las búsquedas."}
          </Text>

          <BannerSinConexion
            enLinea={f.enLinea}
            guardadoEn={null}
            accion="Para guardar cambios, subir fotos o eliminar necesitas conexión."
          />

          {f.mensaje ? (
            <Text
              style={[estilos.mensaje, f.mensaje.tipo === "ok" ? estilos.mensajeOk : estilos.mensajeFail]}
              role="status"
              aria-live="polite"
            >
              {f.mensaje.texto}
            </Text>
          ) : null}

          <View style={escritorio ? estilos.columnas : null}>
            {/* ---------- Datos y fotos ---------- */}
            <View style={[estilos.tarjeta, escritorio && estilos.columnaDatos]}>
              <SeccionFotos fotos={f.fotos} nombreNuevo={f.formulario.nombre} movil={!escritorio} conSelectorDeSalon={false} />

              <Text style={estilos.seccion}>Datos del salón</Text>

              <Campo
                etiqueta="Nombre del salón"
                valor={f.formulario.nombre}
                onCambiar={(v) => f.cambiar("nombre", v)}
                placeholder="Ej. Salón Jardín Las Rosas"
                error={f.errores.nombre}
                autoCapitalize="words"
              />

              <CampoUbicacion
                valor={f.formulario.zona}
                onCambiar={f.cambiarZona}
                error={f.errores.zona}
              />

              <Campo
                etiqueta="Capacidad (personas)"
                valor={f.formulario.capacidad}
                onCambiar={(v) => f.cambiar("capacidad", v)}
                placeholder="Ej. 150"
                error={f.errores.capacidad}
                keyboardType="numeric"
              />

              <Campo
                etiqueta="Descripción del salón (opcional)"
                valor={f.formulario.descripcion}
                onCambiar={(v) => f.cambiar("descripcion", v)}
                placeholder="Ej. Salón con jardín exterior, ideal para bodas y XV años."
                error={f.errores.descripcion}
                multilinea
              />
            </View>

            {/* ---------- Paquetes ---------- */}
            <View style={[estilos.tarjeta, escritorio && estilos.columnaPaquetes]}>
              <Text style={estilos.seccion}>Paquetes y precios</Text>

              {f.errores.paquetes ? <Text style={estilos.errorSeccion}>{f.errores.paquetes}</Text> : null}

              {f.formulario.paquetes.length === 0 ? (
                <Text style={estilos.paqueteDetalle}>
                  Todavía no hay paquetes. Agrega al menos uno para poder publicar el salón.
                </Text>
              ) : null}

              {f.formulario.paquetes.map((p, i) => (
                <View key={p.id ?? `nuevo-${i}`} style={estilos.paquete}>
                  <View style={estilos.paqueteCabecera}>
                    <Text style={estilos.paqueteNombre} numberOfLines={1}>{p.nombre || "Paquete sin nombre"}</Text>
                    <Text style={estilos.paquetePrecio}>{formatearPrecio(p.precio)}</Text>
                  </View>

                  <Campo
                    etiqueta="Nombre del paquete"
                    valor={String(p.nombre ?? "")}
                    onCambiar={(v) => f.editarPaquete(i, "nombre", v)}
                    placeholder="Ej. Paquete Básico"
                  />
                  <Campo
                    etiqueta="Descripción"
                    valor={String(p.descripcion ?? "")}
                    onCambiar={(v) => f.editarPaquete(i, "descripcion", v)}
                    placeholder="Qué incluye: horas, mesas, sillas…"
                    multilinea
                  />
                  <Campo
                    etiqueta="Precio (MXN)"
                    valor={String(p.precio ?? "")}
                    onCambiar={(v) => f.editarPaquete(i, "precio", v)}
                    placeholder="Ej. 8500"
                    keyboardType="decimal-pad"
                  />

                  <Boton
                    texto="Quitar paquete"
                    onPress={() => f.pedirQuitarPaquete(i)}
                    deshabilitado={!f.accionGuardar.habilitada}
                    motivo={f.accionGuardar.motivo}
                    etiqueta={`Quitar el paquete ${p.nombre || "sin nombre"}`}
                  />
                </View>
              ))}

              {/* Paquete nuevo */}
              <View style={estilos.bloqueNuevoPaquete}>
                <Text style={estilos.seccion}>Agregar un paquete</Text>
                <Campo
                  etiqueta="Nombre del paquete"
                  valor={f.borrador.nombre}
                  onCambiar={(v) => f.cambiarBorrador("nombre", v)}
                  placeholder="Ej. Paquete Completo"
                  error={f.erroresPaquete.nombre}
                />
                <Campo
                  etiqueta="Descripción"
                  valor={f.borrador.descripcion}
                  onCambiar={(v) => f.cambiarBorrador("descripcion", v)}
                  placeholder="Qué incluye"
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
                <Boton texto="+ Agregar paquete" onPress={f.agregarPaquete} />
              </View>

              {/* ---------- Zona de peligro ---------- */}
              {!f.esNuevo ? (
                <View style={estilos.zonaPeligro}>
                  <Text style={estilos.zonaPeligroTitulo}>Zona de peligro</Text>
                  <Text style={estilos.zonaPeligroTexto}>
                    Al eliminar el salón se borran también sus paquetes y sus fotos. Esta acción no se puede deshacer.
                  </Text>
                  <Pressable
                    onPress={f.pedirEliminarSalon}
                    disabled={!f.accionEliminar.habilitada}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar el salón ${f.formulario.nombre}`}
                    accessibilityHint={!f.accionEliminar.habilitada ? f.accionEliminar.motivo : undefined}
                    aria-disabled={!f.accionEliminar.habilitada || undefined}
                    title={!f.accionEliminar.habilitada ? f.accionEliminar.motivo : undefined}
                    style={({ hovered, focused }) => [
                      estilos.botonEliminar,
                      (hovered || focused) && { opacity: 0.88 },
                      focused && estilos.foco,
                      !f.accionEliminar.habilitada && estilos.botonInactivo,
                    ]}
                  >
                    <Text style={estilos.botonPeligroTexto}>Eliminar salón</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DialogoConfirmacion
        visible={!!f.confirmacion}
        titulo={f.confirmacion ? f.confirmacion.titulo : ""}
        mensaje={f.confirmacion ? f.confirmacion.mensaje : ""}
        textoConfirmar={f.confirmacion ? f.confirmacion.textoConfirmar : ""}
        textoCancelar={f.confirmacion ? f.confirmacion.textoCancelar : ""}
        destructiva={f.confirmacion ? f.confirmacion.destructiva : false}
        ocupado={f.guardando}
        onConfirmar={confirmarDialogo}
        onCancelar={f.cancelarConfirmacion}
      />
    </LayoutAdmin>
  );
}
