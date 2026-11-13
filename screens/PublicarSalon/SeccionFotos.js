/**
 * GlamSpaces · HU-07 (fotos): subida real de imágenes · sección "Fotos del salón" de Mi salón
 * (Figma PROYECTO--PWA, Admin 05). Solo presentación: el estado vive en useFotosSalon.
 */

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import FotoSalon from "../../components/FotoSalon";
import BannerSinConexion from "../PanelAdministrador/BannerSinConexion";
import { MAX_FOTOS, tamanoMosaico } from "../../services/fotos.logica";
import { NUEVO, PUEDE_ELEGIR_ARCHIVOS } from "./useFotosSalon";
import { estilos } from "./SeccionFotos.styles";

function Boton({ etiqueta, accesible, onPress, deshabilitado, estilo, estiloTexto }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={accesible || etiqueta}
      accessibilityState={{ disabled: !!deshabilitado }}
      style={({ focused }) => [estilos.boton, estilo, deshabilitado && estilos.deshabilitado, focused && estilos.foco]}
    >
      <Text style={estiloTexto || estilos.botonTexto}>{etiqueta}</Text>
    </Pressable>
  );
}

function Franja({ foto }) {
  if (foto.estado === "pendiente") return <View style={estilos.franja}><Text style={estilos.franjaTexto}>Se sube al publicar</Text></View>;
  if (foto.estado === "eliminando") return <View style={estilos.franja}><Text style={estilos.franjaTexto}>Eliminando…</Text></View>;
  if (foto.estado === "subiendo") {
    const porcentaje = Math.round((foto.progreso || 0) * 100);
    return (
      <View style={estilos.franja} accessibilityLabel={`Subiendo foto, ${porcentaje} por ciento`}>
        <Text style={estilos.franjaTexto}>Subiendo {porcentaje} %</Text>
        <View style={estilos.barra}><View style={[estilos.barraLlena, { width: `${porcentaje}%` }]} /></View>
      </View>
    );
  }
  if (foto.estado === "error") return <View style={estilos.franja}><Text style={estilos.franjaTexto}>No se subió</Text></View>;
  return null;
}

function Mosaico({ foto, numero, nombreSalon, movil, tamano, enLinea, puedeReintentar, onReintentar, onQuitar, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);
  const ocupado = foto.estado === "subiendo" || foto.estado === "eliminando";

  let acciones = null;
  if (foto.estado === "guardada" && foto.fotoId) {
    acciones = confirmando ? (
      <View style={{ gap: 6 }}>
        <Text style={estilos.confirmarTexto}>¿Eliminar esta foto?</Text>
        <View style={estilos.acciones}>
          <Boton etiqueta="No" accesible="No eliminar la foto" onPress={() => setConfirmando(false)} />
          <Boton
            etiqueta="Sí, eliminar"
            accesible={`Sí, eliminar la foto ${numero}`}
            deshabilitado={!enLinea}
            onPress={() => { setConfirmando(false); onEliminar(foto.clave); }}
            estilo={estilos.botonPeligroLleno}
            estiloTexto={estilos.botonPeligroLlenoTexto}
          />
        </View>
      </View>
    ) : (
      <View style={estilos.acciones}>
        <Boton
          etiqueta="Eliminar"
          accesible={`Eliminar la foto ${numero}`}
          deshabilitado={!enLinea}
          onPress={() => setConfirmando(true)}
          estilo={estilos.botonPeligro}
          estiloTexto={estilos.botonPeligroTexto}
        />
      </View>
    );
  } else if (foto.estado === "error" || foto.estado === "pendiente") {
    acciones = (
      <View style={estilos.acciones}>
        {foto.estado === "error" && puedeReintentar ? (
          <Boton
            etiqueta="Reintentar"
            accesible={`Reintentar subir la foto ${numero}`}
            deshabilitado={!enLinea}
            onPress={() => onReintentar(foto.clave)}
            estilo={estilos.botonPrincipal}
            estiloTexto={estilos.botonPrincipalTexto}
          />
        ) : null}
        <Boton etiqueta="Quitar" accesible={`Quitar la foto ${numero}`} onPress={() => onQuitar(foto.clave)} />
      </View>
    );
  }

  return (
    <View style={movil ? estilos.mosaicoMovil : [estilos.mosaico, { width: tamano }]} accessibilityLabel={`Foto ${numero} de ${nombreSalon || "tu salón"}`}>
      <View style={[estilos.marco, movil && estilos.marcoMovil]}>
        {/* Si la URL vieja da 404, FotoSalon muestra el espacio de la maqueta con la inicial. */}
        <FotoSalon uri={foto.url} nombre={nombreSalon} style={estilos.imagen} tamanoInicial={movil ? 36 : 44} />
        <Franja foto={foto} />
      </View>
      {foto.error ? <Text style={estilos.errorFoto} accessibilityRole="alert">{foto.error}</Text> : null}
      {ocupado ? null : acciones}
    </View>
  );
}

// `conSelectorDeSalon`: en "Mi salón" se elige de qué salón son las fotos. En "Editar salón"
// no hace falta (ya se sabe cuál se está editando), así que se oculta.
export default function SeccionFotos({ fotos: s, nombreNuevo, movil, conSelectorDeSalon = true }) {
  const [anchoRejilla, setAnchoRejilla] = useState(0);
  const tamano = tamanoMosaico(anchoRejilla);
  const salonActual = s.salones.find((x) => x.id === s.salonId);
  const nombreSalon = salonActual ? salonActual.nombre : nombreNuevo;
  const activas = s.fotos.filter((f) => f.estado !== "eliminando").length;

  const agregar = movil ? (
    <Pressable
      onPress={s.agregar}
      disabled={!s.puedeAgregar}
      accessibilityRole="button"
      accessibilityLabel="Agregar foto"
      accessibilityState={{ disabled: !s.puedeAgregar }}
      style={({ focused }) => [estilos.agregarBoton, !s.puedeAgregar && estilos.deshabilitado, focused && estilos.foco]}
    >
      <Text style={estilos.agregarMas}>+</Text>
      <Text style={estilos.agregarTexto}>Agregar foto</Text>
    </Pressable>
  ) : (
    <Pressable
      onPress={s.agregar}
      disabled={!s.puedeAgregar}
      accessibilityRole="button"
      accessibilityLabel="Agregar foto"
      accessibilityState={{ disabled: !s.puedeAgregar }}
      style={({ focused }) => [estilos.agregarMosaico, { width: tamano }, !s.puedeAgregar && estilos.deshabilitado, focused && estilos.foco]}
    >
      <Text style={estilos.agregarMas}>+</Text>
      <Text style={estilos.agregarTexto}>Agregar foto</Text>
    </Pressable>
  );

  return (
    <View style={estilos.seccion}>
      <Text style={estilos.titulo} accessibilityRole="header">Fotos del salón</Text>

      <BannerSinConexion enLinea={s.enLinea} accion="Para subir o eliminar fotos necesitas conexión." />

      {conSelectorDeSalon && s.salones.length > 0 ? (
        <ScrollView
          horizontal={movil}
          scrollEnabled={movil}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={movil ? estilos.chipsMovil : estilos.chips}
          accessibilityLabel="Elige de qué salón son las fotos"
        >
          {[{ id: NUEVO, nombre: "Salón nuevo" }, ...s.salones].map((x) => {
            const activo = x.id === s.salonId;
            return (
              <Pressable
                key={x.id}
                onPress={() => s.elegirSalon(x.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                style={({ focused }) => [estilos.chip, activo && estilos.chipActivo, focused && estilos.foco]}
              >
                <Text style={activo ? estilos.chipTextoActivo : estilos.chipTexto}>{x.nombre}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <Text style={estilos.ayuda}>
        {s.esNuevo
          ? "JPG, PNG o WEBP de hasta 5 MB. Las fotos se suben cuando publicas el salón."
          : "JPG, PNG o WEBP de hasta 5 MB. Los cambios se guardan al momento."}{" "}
        <Text style={estilos.contador}>{activas} de {MAX_FOTOS} fotos.</Text>
      </Text>

      {!PUEDE_ELEGIR_ARCHIVOS ? <Text style={estilos.ayuda}>Las fotos se suben desde la versión web de GlamSpaces.</Text> : null}
      {s.aviso ? <Text style={estilos.aviso} accessibilityRole="alert">{s.aviso}</Text> : null}
      {s.cargando ? <Text style={estilos.cargando}>Cargando fotos…</Text> : null}
      {s.errorCarga ? (
        <View style={{ gap: 6 }}>
          <Text style={estilos.aviso} accessibilityRole="alert">{s.errorCarga}</Text>
          <View style={{ flexDirection: "row" }}>
            <Boton etiqueta="Reintentar" accesible="Volver a cargar las fotos" onPress={s.reintentarCarga} />
          </View>
        </View>
      ) : null}

      <View style={movil ? estilos.rejillaMovil : estilos.rejilla} onLayout={(e) => setAnchoRejilla(e.nativeEvent.layout.width)}>
        {s.fotos.map((foto, i) => (
          <Mosaico
            key={foto.clave}
            foto={foto}
            numero={i + 1}
            nombreSalon={nombreSalon}
            movil={movil}
            tamano={tamano}
            enLinea={s.enLinea}
            puedeReintentar={!s.esNuevo}
            onReintentar={s.reintentar}
            onQuitar={s.quitar}
            onEliminar={s.eliminar}
          />
        ))}
        {!movil && !s.lleno && PUEDE_ELEGIR_ARCHIVOS ? agregar : null}
      </View>
      {movil && !s.lleno && PUEDE_ELEGIR_ARCHIVOS ? agregar : null}
    </View>
  );
}
