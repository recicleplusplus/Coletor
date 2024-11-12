import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
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

  function callbackError(error) {
    setError(error);
  }

  function showRecyclable(current) {
    setCurrentRecyclable(current);
    setAddRecyclable(true);
  }

  // Chama a função de localização e recupera dados de recicláveis na inicialização
  useEffect(() => {
    userLocation();
    GetRecyclable(setRecyclable);
  }, []);

  // Atualiza a localização no mapa com animação
  useEffect(() => {
    if (location.latitude && location.longitude) {
      mapViewRef.current.animateToRegion(location, 1000); // 1000 ms de animação
    }
  }, [location]);

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
      <MapView
        ref={mapViewRef} // Atribui a ref ao MapView
        style={styles.map}
        region={location} // Define a região inicial
      >
        {/* Localizacao do usuario */}
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
          <SimpleIcon name="circle-slice-8" size={30} color="#141ab8" />
        </Marker>
        
        {Object.entries(recyclable).map(([index, item]) => {
          if (item['status'] === 'done') return null;

          return (
            <MarkerComponent
              key={index}
              coordinate={{
                latitude: item['address'].latitude,
                longitude: item['address'].longitude,
              }}
              status={item['status']}
              onPress={() => {
                if (item['status'] === 'pending' || item.collector.id === coletorState.id) {
                  setCurrentRecyclable({
                    id: index,
                    ...item,
                  });
                  setAddRecyclable(true);
                } else {
                  setError({
                    title: 'Indisponível',
                    content: 'Esta coleta já foi selecionada por outro coletor.',
                  });
                }
              }}
            />
          );
        })}
      </MapView>
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
