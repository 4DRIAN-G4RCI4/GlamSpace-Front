/**
 * GlamSpaces · Mejora de HU-07/HU-08 · "Mis salones": todos los salones del administrador.
 *
 * Una ficha por salón (foto principal, nombre, zona, capacidad, estado, paquetes y fotos) con
 * Editar, Ver salón y Eliminar, más "+ Nuevo salón". Si no hay ninguno, invita a crear el primero.
 *
 * Diseño: Figma PROYECTO--PWA, frames ADMIN, dentro de LayoutAdmin. La rejilla de varios salones
 * no está en la maqueta (ahí el administrador tenía un solo salón): se arma con los mismos tokens.
 *
 * Sin conexión (HU-22): la lista se ve desde la caché con su aviso y lo que escribe se deshabilita.
 */

import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import LayoutAdmin from "../PanelAdministrador/LayoutAdmin";
import BannerSinConexion from "../PanelAdministrador/BannerSinConexion";
import DialogoConfirmacion from "../../components/DialogoConfirmacion";
import Marca from "../../components/Marca";
import { COLORES } from "../../theme/colores";
import { MEDIDA } from "../../theme/disenoPwa";
import { nombreDeNegocio } from "../../services/sesion.logica";
import BotonRegresar from "../../components/BotonRegresar";
import Paginacion from "../../components/Paginacion";
import useMisSalones from "./useMisSalones";
import { estilos } from "./MisSalones.styles";

// Ancho de cada ficha según el espacio: 3 columnas en escritorio, 2 en tableta, 1 en teléfono.
function anchoDeFicha(ancho) {
  if (ancho >= 1180) return "31.5%";
  if (ancho >= 760) return "48%";
  return "100%";
}

function Etiqueta({ publicado }) {
  return (
    <View style={[estilos.etiqueta, publicado ? estilos.etiquetaPublicado : estilos.etiquetaBorrador]}>
      <Text style={[estilos.etiquetaTexto, publicado ? estilos.etiquetaTextoPublicado : estilos.etiquetaTextoBorrador]}>
        {publicado ? "Publicado" : "Borrador"}
      </Text>
    </View>
  );
}

// `enFicha`: dentro de una tarjeta los tres botones se reparten el ancho; fuera, se ajustan al texto.
function Boton({ texto, onPress, tipo = "secundario", deshabilitado, motivo, etiqueta, enFicha = false }) {
  const esPeligro = tipo === "peligro";
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta || texto}
      accessibilityHint={deshabilitado ? motivo : undefined}
      aria-disabled={deshabilitado || undefined}
      title={deshabilitado ? motivo : undefined}
      style={({ hovered, focused, pressed }) => [
        estilos.boton,
        enFicha && estilos.botonChico,
        tipo === "principal" ? estilos.botonPrincipal : estilos.botonSecundario,
        (hovered || pressed) && !deshabilitado && { opacity: 0.88 },
        focused && estilos.foco,
        deshabilitado && estilos.botonInactivo,
      ]}
    >
      <Text
        style={
          tipo === "principal"
            ? estilos.botonPrincipalTexto
            : esPeligro
              ? estilos.botonPeligroTexto
              : estilos.botonSecundarioTexto
        }
      >
        {texto}
      </Text>
    </Pressable>
  );
}

function FichaSalon({ ficha, ancho, onEditar, onVer, onEliminar, puedeEliminar, motivoEliminar }) {
  return (
    <View style={[estilos.ficha, { width: ancho }]}>
      {ficha.fotoPrincipal ? (
        <Image
          source={{ uri: ficha.fotoPrincipal }}
          style={estilos.fichaFoto}
          resizeMode="cover"
          accessibilityLabel={`Foto principal de ${ficha.nombre}`}
        />
      ) : (
        // Sin fotos (o la URL dio 404): marcador de posición con la paleta del diseño.
        <View style={estilos.fichaSinFoto} accessibilityLabel={`${ficha.nombre} todavía no tiene fotos`}>
          <Text style={estilos.fichaSinFotoTexto}>Sin fotos todavía</Text>
        </View>
      )}

      <View style={estilos.fichaCuerpo}>
        <View style={estilos.fichaTituloFila}>
          <Text style={estilos.fichaNombre} numberOfLines={2}>{ficha.nombre}</Text>
          <Etiqueta publicado={ficha.publicado} />
        </View>
        <Text style={estilos.fichaZona} numberOfLines={1}>{ficha.zona}</Text>
        <Text style={estilos.fichaResumen}>{ficha.resumen}</Text>

        <View style={estilos.fichaBotones}>
          <Boton texto="Editar" tipo="principal" onPress={onEditar} etiqueta={`Editar ${ficha.nombre}`} enFicha />
          <Boton texto="Ver salón" onPress={onVer} etiqueta={`Ver el salón ${ficha.nombre}`} enFicha />
          <Boton
            texto="Eliminar"
            tipo="peligro"
            onPress={onEliminar}
            deshabilitado={!puedeEliminar}
            motivo={motivoEliminar}
            etiqueta={`Eliminar ${ficha.nombre}`}
            enFicha
          />
        </View>
      </View>
    </View>
  );
}

export default function MisSalonesScreen({ navigation }) {
  const f = useMisSalones();
  const { width } = useWindowDimensions();
  const escritorio = width >= MEDIDA.corteEscritorio;
  const ancho = anchoDeFicha(width);
  const inicioRejilla = React.useRef(null);

  // Al cambiar de página se sube al inicio de la rejilla.
  function irAPaginaArriba(n) {
    f.irAPagina(n);
    if (inicioRejilla.current && inicioRejilla.current.scrollIntoView) {
      inicioRejilla.current.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }

  if (f.cargandoSesion) {
    return (
      <View style={estilos.cargandoCaja}>
        <ActivityIndicator color={COLORES.morado} size="large" />
      </View>
    );
  }

  if (!f.esAdministrador) {
    return (
      <ScrollView contentContainerStyle={estilos.contenidoMovil}>
        <Marca />
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Mis salones</Text>
          <Text style={estilos.subtitulo}>
            Para administrar tus salones necesitas iniciar sesión con una cuenta de administrador.
          </Text>
          <Boton texto="Ir a iniciar sesión" tipo="principal" onPress={() => navigation && navigation.navigate("Login")} />
        </View>
      </ScrollView>
    );
  }

  const irASeccion = (clave) => {
    if (clave !== "salon" && navigation) navigation.navigate("PanelAdministrador", { pestana: clave });
  };

  return (
    <LayoutAdmin
      seccion="salon"
      onElegir={irASeccion}
      // Si la cuenta no guardó un nombre de salón de verdad, la barra dice "Mis salones"
      // en vez de quedarse vacía (y nunca el correo del usuario).
      nombreSalon={nombreDeNegocio(f.sesion) || "Mis salones"}
      nombreAdmin={f.sesion ? f.sesion.nombre : ""}
      onCuenta={() => navigation && navigation.navigate("Perfil")}
    >
      <ScrollView contentContainerStyle={escritorio ? estilos.contenido : estilos.contenidoMovil}>
        <BotonRegresar navigation={navigation} respaldo="PanelAdministrador" />

        <View style={estilos.encabezado}>
          <Text style={estilos.titulo} accessibilityRole="header">Mis salones</Text>
          <Boton
            texto="+ Nuevo salón"
            tipo="principal"
            onPress={() => navigation && navigation.navigate("EditarSalon", {})}
            deshabilitado={!f.accionCrear.habilitada}
            motivo={f.accionCrear.motivo}
          />
        </View>
        <Text style={estilos.subtitulo}>
          {f.totalSalones === 1 ? "Tienes 1 salón." : `Tienes ${f.totalSalones} salones.`} Aquí los editas, los publicas o los eliminas.
        </Text>

        <BannerSinConexion
          enLinea={f.enLinea}
          guardadoEn={f.enLinea ? null : f.guardadoEn}
          onReintentar={f.refrescar}
          accion="Para crear, editar o eliminar salones necesitas conexión."
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

        {f.error ? <Text style={[estilos.mensaje, estilos.mensajeFail]}>{f.error}</Text> : null}

        {f.cargando ? (
          <View style={estilos.cargandoCaja}>
            <ActivityIndicator color={COLORES.morado} size="large" />
          </View>
        ) : f.vacia ? (
          // Estado vacío: invita a crear el primero.
          <View style={estilos.vacio}>
            <Text style={estilos.vacioTitulo}>Todavía no tienes salones</Text>
            <Text style={estilos.vacioTexto}>
              Publica tu primer salón con sus fotos y sus paquetes para que los clientes puedan encontrarlo y solicitar reservaciones.
            </Text>
            <Boton
              texto="+ Crear mi primer salón"
              tipo="principal"
              onPress={() => navigation && navigation.navigate("EditarSalon", {})}
              deshabilitado={!f.accionCrear.habilitada}
              motivo={f.accionCrear.motivo}
            />
          </View>
        ) : (
          <>
            <View style={estilos.rejilla} ref={inicioRejilla}>
              {f.salones.map((ficha) => (
                <FichaSalon
                  key={ficha.id}
                  ficha={ficha}
                  ancho={ancho}
                  onEditar={() => navigation && navigation.navigate("EditarSalon", { salonId: ficha.id })}
                  onVer={() => navigation && navigation.navigate("DetalleSalon", { salonId: ficha.id })}
                  onEliminar={() => f.pedirEliminar(ficha)}
                  puedeEliminar={f.accionEliminar.habilitada}
                  motivoEliminar={f.accionEliminar.motivo}
                />
              ))}
            </View>

            {f.hayMas ? (
              <View style={{ alignItems: "center", marginTop: 24 }}>
                <Boton texto="Cargar más salones" onPress={f.verMas} />
              </View>
            ) : null}

            <Paginacion
              pagina={f.paginacion.pagina}
              totalPaginas={f.paginacion.totalPaginas}
              totalRegistros={f.paginacion.totalRegistros}
              desde={f.paginacion.desde}
              hasta={f.paginacion.hasta}
              hayAnterior={f.paginacion.hayAnterior}
              haySiguiente={f.paginacion.haySiguiente}
              onPagina={irAPaginaArriba}
              singular="salón"
              plural="salones"
              etiqueta="Paginación de mis salones"
            />
          </>
        )}
      </ScrollView>

      <DialogoConfirmacion
        visible={!!f.confirmacion}
        titulo={f.confirmacion ? f.confirmacion.titulo : ""}
        mensaje={f.confirmacion ? f.confirmacion.mensaje : ""}
        textoConfirmar={f.confirmacion ? f.confirmacion.textoConfirmar : ""}
        textoCancelar={f.confirmacion ? f.confirmacion.textoCancelar : ""}
        destructiva={f.confirmacion ? f.confirmacion.destructiva : false}
        ocupado={f.eliminando}
        onConfirmar={f.confirmarEliminar}
        onCancelar={f.cancelarConfirmacion}
      />
    </LayoutAdmin>
  );
}
