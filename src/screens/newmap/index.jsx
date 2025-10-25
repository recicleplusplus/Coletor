import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors, Theme } from '../../constants/setting';

export function MapScreen() {
  const initialRegion = {
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mapa</Text>
      </View>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        // --- FERRAMENTAS DE DEBUG ---
        onMapReady={() => {
          console.log("--- DEBUG MAPA --- O mapa está pronto e foi renderizado!");
        }}
        onError={(error) => {
          console.error("--- DEBUG MAPA --- Ocorreu um erro ao carregar o mapa:", error);
        }}
        // Mostra um indicador de loading enquanto o mapa carrega
        loadingEnabled={true}
        loadingIndicatorColor={Colors[Theme][2]}
        loadingBackgroundColor={Colors[Theme][0]}
      >
        <Marker
          coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}
          title="São Paulo"
          description="Centro da cidade"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[Theme][1],
  },
  header: {
    paddingVertical: 15,
    paddingTop: 40,
    backgroundColor: Colors[Theme][0],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors[Theme][2],
  },
  headerText: {
    fontSize: 20,
    color: Colors[Theme][5],
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
});

