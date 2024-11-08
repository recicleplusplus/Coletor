import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';

// import { styles, customMapStyle } from './style';
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

  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922, // Ajuste conforme a necessidade do zoom
      longitudeDelta: 0.0421, // Ajuste conforme a necessidade do zoom
    });
  }

  function callbackError(error) {
    setError(error);
  }

  function showRecyclable(current) {
    setCurrentRecyclable(current);
    setAddRecyclable(true);
  }

  useEffect(() => {
    userLocation();
    GetRecyclable(setRecyclable);
  }, []);

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
        style={styles.map}
        region={location} // Usando region para definir a posição e zoom
        // onRegionChangeComplete={(region) => setLocation(region)} // Atualizar a localização quando o mapa for movido
      >
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
          <SimpleIcon name="circle-slice-8" size={30} color="#141ab8" />
        </Marker>
        {Object.entries(recyclable).map(([index, item]) => {
          if (item['status'] === 'done') return null;

          return (
            <Marker
              key={index}
              coordinate={{
                latitude: item['address'].latitude,
                longitude: item['address'].longitude,
              }}
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
            >
              <SimpleIcon
                name={item['status'] === 'pending' ? 'map-marker-account' : 'map-marker-alert'}
                size={40}
                color={
                  item['status'] === 'pending'
                    ? '#0bbae3'
                    : item.collector.id === coletorState.id
                    ? '#179a02'
                    : '#faa05e'
                }
              />
            </Marker>
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
