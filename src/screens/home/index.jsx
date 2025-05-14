import { View, ScrollView, Button, Text, Center, Icon, TouchableOpacity, Alert } from "react-native";
import { styles } from "./style";
import { ContainerTopClean } from "../../components/containers";
import { Colors,Theme } from "../../constants/setting";
import { useContext } from "react";
import messaging from '@react-native-firebase/messaging';
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}
import { SizedBox } from 'sizedbox';
import { ColetorContext } from "../../contexts/coletor/context";
import { PieChart } from 'react-native-chart-kit';
import { ImageCircleIcon } from "../../components/images";
import {useState, useEffect} from 'react';
import { useNavigation } from '@react-navigation/native';
import { setDoc, getDoc, collection, onSnapshot, addDoc, getFirestore, firebaseApp, Firestore } from "firebase/firestore";
import { CardHome } from "../address/components/card";

import { getDatabase, push, ref, get } from "firebase/database";

export function Home({}) {
  const navigation = useNavigation();
  const firestore = getFirestore(firebaseApp);
  const {coletorState, coletorDispach} = useContext(ColetorContext)
  const basedImage                       = require("../../../assets/images/profile2.webp");
  const [image, setImage]                = useState(basedImage);
  const [statistics, setStatistics]      = useState(null);
  const database = getDatabase(firebaseApp);
  const [collectorData, setCollectorData] = useState([]);
  const yourCollectorId =  coletorState.id;

  useEffect(() => {
    const infoRef = ref(database, 'recyclable/');
  
    get(infoRef).then(snapshot => {
      const data = snapshot.val();
      if (data) {
        const collectorArray = [];
        for (const id in data) {
          const collectorInfo = data[id];
          if (collectorInfo && collectorInfo.collector && collectorInfo.collector.id === yourCollectorId) {
            const collector = collectorInfo.collector;
            const collectorData = {
              id: collector.id,
              name: collector.name,
              photoUrl: collector.photoUrl,
              address: collectorInfo.address,
              bags: collectorInfo.bags,
              boxes: collectorInfo.boxes,
              donor: {
                id: collectorInfo.donor.id,
                name: collectorInfo.donor.name,
                photoUrl: collectorInfo.donor.photoUrl
              },
              observation: collectorInfo.observation,
              status: collectorInfo.status,
              times: collectorInfo.times,
              types: collectorInfo.types,
              weekDays: collectorInfo.weekDays,
              weight: collectorInfo.weight
            };
            collectorArray.push(collectorData);
          }
        }
        setCollectorData(collectorArray);
      }
    })
    .catch(error => {
      console.error('Erro ao ler os dados:', error);
    });
  }, [yourCollectorId]);
  

  const tokenizeString=(string) => {
    const tokens = String(string).replace(/([a-z])([A-Z])/g, '$1,$2').split(',');
    return tokens;
  }

  async function getColectorStatistics() {
    const typesWeight = {};
    collectorData.forEach(item => {
      const typesArray = item.types.split(',').map(type => type.trim());
      const weight = parseInt(item.weight.match(/\d+/)[0], 10); // Extrai apenas o número da string "5 KG" e converte para inteiro

      typesArray.forEach(type => {
        if (typesWeight[type]) {
          typesWeight[type] += weight;
        } else {
          typesWeight[type] = weight;
        }
      });
    });

    const statistic = {
      collectionsCompleted: collectorData.length,
      eletronicKg: typesWeight["eletronico"] || 0,
      glassKg: typesWeight["vidro"] || 0,
      metalKg: typesWeight["metal"] || 0,
      oilKg: typesWeight["oil"] || 0,
      paperKg: typesWeight["papel"] || 0,
      plasticKg: typesWeight["plastico"] || 0
    };

    return statistic;
  }

  const quantidadeTypesA = collectorData.filter((tarefa) => tarefa.types.includes('Plástico')).length;
  const quantidadeTypesB = collectorData.filter((tarefa) => tarefa.types.includes('Metal')).length;
  const quantidadeTypesC = collectorData.filter((tarefa) => tarefa.types.includes('Eletrônico')).length;
  const quantidadeTypesD = collectorData.filter((tarefa) => tarefa.types.includes('Papel')).length;
  const quantidadeTypesE = collectorData.filter((tarefa) => tarefa.types.includes('Óleo')).length;
  const quantidadeTypesF = collectorData.filter((tarefa) => tarefa.types.includes('Vidro')).length;
  const allTypesAreZero = [quantidadeTypesA, quantidadeTypesB, quantidadeTypesC, quantidadeTypesD, quantidadeTypesE, quantidadeTypesF].every(
    (quantity) => quantity === 0
  );
  
  // Encontrando o maior valor para normalização
  const max = Math.max(
    quantidadeTypesA,
    quantidadeTypesB,
    quantidadeTypesC,
    quantidadeTypesD,
    quantidadeTypesE,
    quantidadeTypesF
  );

  // Normalizando os valores para calcular as alturas das barras
  const normalizedA = (quantidadeTypesA / max) * 100;
  const normalizedB = (quantidadeTypesB / max) * 100;
  const normalizedC = (quantidadeTypesC / max) * 100;
  const normalizedD = (quantidadeTypesD / max) * 100;
  const normalizedE = (quantidadeTypesE / max) * 100;
  const normalizedF = (quantidadeTypesF / max) * 100;

  const barData = [
    { height: normalizedA, value: quantidadeTypesA, color: Colors[Theme][2], label: 'Plástico' },
    { height: normalizedB, value: quantidadeTypesB, color: Colors[Theme][2], label: 'Metal' },
    { height: normalizedC, value: quantidadeTypesC, color: Colors[Theme][2], label: 'Eletrônico' },
    { height: normalizedD, value: quantidadeTypesD, color: Colors[Theme][2], label: 'Papel' },
    { height: normalizedE, value: quantidadeTypesE, color: Colors[Theme][2], label: 'Óleo' },
    { height: normalizedF, value: quantidadeTypesF, color: Colors[Theme][2], label: 'Vidro' },
  ];

  useEffect(()=>{
    setImage(coletorState.photoUrl 
      ? {uri: coletorState.photoUrl} 
      : basedImage);
  },[coletorState.photoUrl]);
  
  async function changeProfileImage(){
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 5],
      quality: 1,
    });  

    if (!result.canceled) {
      const source = {uri: result.assets[0].uri}
      setImage(source);
      setLoandding(true);
      coletorDispach({type: Types.LOADIMAGE, uri: source.uri, cb: changeImageCB})
    }
  }
  function changeImageCB (state, error) {
    if(state){
      setError(error);
    }else {
      coletorDispach({type:Types.SETIMAGE, payload: error})
      coletorDispach({type: Types.UPDATE, data: {...coletorState, photoUrl: error}, dispatch: coletorDispach, cb:updateCB});
    }
  }

  useEffect(() => {
    async function fetchStatistics() {
      const statistic = await getColectorStatistics();
      console.log(statistic);
      setStatistics(statistic);
    }
    fetchStatistics();
  }, [collectorData]);

  return (
    <ScrollView>
      <ImageCircleIcon
        size={130}
        sizeIcon={0}
        align={"flex-start"}
        img={image}
        color={Colors[Theme][5]}
        bgColor={Colors[Theme][0]}
      />
      <ContainerTopClean
        fun={()=>{}}
        text={"          Bem vind@,\n"+"          "+coletorState.name}
        icon="information"
      />
      <SizedBox vertical={5} />
      <View style={styles.main}>
          <Text style={{ color: Colors[Theme][2], textAlign: 'right', padding: 20, fontWeight: 'bold' }}>Avaliação</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#B0B0B0', fontSize: 12, textAlign: 'center' }}>
            Os valores exibidos no gráfico são proporcionais ao maior.
          </Text>
        </View>
        <TouchableOpacity style={styles.card}>
          <View style={{ alignItems: 'center', minHeight: 125, justifyContent: 'center' }}>
            {allTypesAreZero ? (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{ color: Colors[Theme][2], textAlign: 'center', padding: 20, fontWeight: 'bold' }}>Não há estatísticas...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 }}>
                <View style={styles.barContainer}>
                  {barData.map((bar, index) => (
                    <View key={index} style={styles.bar}>
                      <View style={[styles.barFill, { height: bar.height, backgroundColor: bar.color }]}>
                        <Text style={styles.barText}>{bar.value}</Text>
                      </View>
                      <Text style={styles.legend}>{bar.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <SizedBox vertical={2} />
      {statistics
  ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors[Theme][2], textAlign: 'right', padding: 20, fontWeight: 'bold' }}>
        {statistics.collectionsCompleted + " Coletas Concluídas"}
      </Text>
    </View>
  : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors[Theme][2], textAlign: 'right', padding: 20, fontWeight: 'bold' }}>
        {'Carregando...'}
      </Text>
    </View>
}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Mapa')}>
          <Text style={styles.text }>Procurar</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
            <Text style={{ color: Colors[Theme][2], textAlign: 'left', padding: 20, fontWeight: 'bold' }}>Histórico</Text>
      </View>
      <ScrollView horizontal>
        {collectorData.map((index, key) => (
          <View style={[styles.containerEdit, { marginRight: 50 }]} key={key} >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CardHome tipo={index.type} endereco={index.address.name} peso={index.weight} sacolas={index.bags} caixas={index.boxes} foto={index.donor.photoUrl} nome={index.donor.name} id={index.donor.id} key={index} />
            </View>
          </View>
        ))}
      </ScrollView>
      <SizedBox vertical={5} />
    </ScrollView>
  );
}