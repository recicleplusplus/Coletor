import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
// import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SimpleIcon } from '../../components/icons';
import { Colors, Theme } from '../../constants/setting';
import { RecyclableCard } from './components/recyclable_card';
import { GetRecyclable } from '../../firebase/providers/recyclable';
import { Loading } from '../../components/loading';
import { Error } from '../../components/error';
import { ButtonIcon } from '../../components/buttons';
import { RecyclableList } from './components/recyclable_list';
import { ColetorContext } from '../../contexts/coletor/context';
import { WebView } from 'react-native-webview';
import { htmlMap } from './htmlMap';

// Componente otimizado para renderizar marcadores
const MarkerComponent = React.memo(({ coordinate, status, onPress }) => {
  return (
    <Marker coordinate={coordinate} onPress={onPress}>
      <SimpleIcon
        name={status === 'pending' ? 'map-marker-account' : 'map-marker-alert'}
        size={40}
        color={status === 'pending' ? '#0bbae3' : '#faa05e'}
      />
    </Marker>
  );
});

export default function Map() {
  const [location, setLocation] = useState({
    latitude: -22.004313,
    longitude: -47.896467,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { coletorState, coletorDispach } = useContext(ColetorContext);

  const [recyclable, setRecyclable] = useState({});
  const [error, setError] = useState(false);
  const [addRecyclable, setAddRecyclable] = useState(false);
  const [listRecyclable, setListRecyclable] = useState(false);
  const [currentRecyclable, setCurrentRecyclable] = useState({});
  const [loading, setLoading] = useState(false);

  const mapViewRef = useRef(null);  // Ref para o MapView

  // Função para obter a localização atual
  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    if (
      location.coords.latitude !== location.latitude ||
      location.coords.longitude !== location.longitude
    ) {
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,  // Ajuste conforme a necessidade do zoom
        longitudeDelta: 0.0421, // Ajuste conforme a necessidade do zoom
      });
    }
  };

  const webviewRef = useRef(null);

  // Chama a função de localização e recupera dados de recicláveis na inicialização
  useEffect(() => {
    userLocation();
    GetRecyclable(setRecyclable);
  }, []);

  useEffect(() => {
    if (webviewRef.current) {
      const jsCode = `
      if (window.renderMarkers) {
        window.renderMarkers({
          userLocation: ${JSON.stringify(location)},
          recyclables: ${JSON.stringify(recyclable)}
        });
      } else {
        console.log("⚠️ renderMarkers ainda não está disponível");
      }
    `;
      webviewRef.current.injectJavaScript(jsCode);
    }
  }, [location, recyclable]);

  function callbackError(error) {
    setError(error);
  }

  function showRecyclable(current) {
    setCurrentRecyclable(current);
    setAddRecyclable(true);
  }


  return (
    <View style={styles.container}>
      {loading && <Loading />}
      {error && <Error error={error} closeFunc={() => setError(false)} />}
      {addRecyclable && (
        <RecyclableCard
          data={currentRecyclable}
          collector={coletorState}
          callbackError={callbackError}
          closeCard={() => setAddRecyclable(false)}
          setloading={(val = true) => setLoading(val)}
        />
      )}
      {listRecyclable && (
        <RecyclableList
          datas={recyclable}
          collector={coletorState}
          showRecyclable={showRecyclable}
          currentLocation={location}
          setError={setError}
          setLoading={setLoading}
          closeList={() => setListRecyclable(false)}
        />
      )}
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlMap }}
        javaScriptEnabled={true}
        onMessage={(event) => {
          const message = JSON.parse(event.nativeEvent.data);
          if (message.type === "marker_click") {
            const item = message.item;
            if (item.status === 'pending' || item.collector.id === coletorState.id) {
              setCurrentRecyclable({ id: message.id, ...item });
              setAddRecyclable(true);
            } else {
              setError({
                title: "Indisponível",
                content: "Esta coleta já foi selecionada por outro coletor."
              });
            }
          }
        }}
      />
      <View style={styles.floatButton}>
        <ButtonIcon
          btn
          name="menu"
          size={35}
          color={Colors[Theme][4]}
          fun={() => setListRecyclable(true)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  floatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
});
