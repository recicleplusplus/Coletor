import { RealTime, Firestore } from "../config/connection";
import {  ref, onValue, set, get  } from "firebase/database";
import { VerifyErroCode } from "../config/errors";
import { getMaterialsWithCache } from "./materials";
import { updateDonorPoints } from "./donor";


export function GetRecyclable(setData) {
    const recyclableRef = ref(RealTime, "recyclable");
    onValue(recyclableRef, (snapshot) => {
        setData(snapshot.val());
    });
}

export function GetCollectorRecyclable(idCollector, setData) {
    const recyclableRef = ref(RealTime, `collectors/${idCollector}`);
    onValue(recyclableRef, (snapshot) => {
        setData(snapshot.val());
    });
}

async function AssociateCollection (idCollector, idRecyclable, time) {
    const recyclableCollectorRef = ref(RealTime, `collectors/${idCollector}/${idRecyclable}`);
    await set(recyclableCollectorRef, time);
}

export async function AssociateCollector (idCollector, idRecyclable, colletorName, collectorPhotoURL, time, cb){
    try{
        await AssociateCollection(idCollector, idRecyclable, time);

        // Busca os dados da coleta para calcular pontos
        const recyclableRef = ref(RealTime, `recyclable/${idRecyclable}`);
        const snapshot = await get(recyclableRef);
        const recyclableData = snapshot.val();

        // Atualiza o status e coletor
        const recyclableCollectorRef2 = ref(RealTime, `recyclable/${idRecyclable}/status`);
        await set(recyclableCollectorRef2, "loading");

        const recyclableCollectorRef = ref(RealTime, `recyclable/${idRecyclable}/collector`);
        await set(recyclableCollectorRef, {
            'id' : idCollector,
            'name' : colletorName,
            'photoUrl' : collectorPhotoURL
        });

        // Calcula e atribui pontos ao doador
        if (recyclableData && recyclableData.donor && recyclableData.donor.id !== 'none') {
            const materials = await getMaterialsWithCache();
            const types = recyclableData.types.split(',');
            const weight = parseInt(recyclableData.weight) || 0;
            
            let totalPoints = 0;
            types.forEach(type => {
                const materialKey = type.trim();
                const material = materials[materialKey];
                
                if (material && material.points && material.points.donor) {
                    const points = material.points.donor * weight;
                    totalPoints += points;
                }
            });

            if (totalPoints > 0) {
                await updateDonorPoints(recyclableData.donor.id, totalPoints);
            }
        }

    } catch (err) {
        console.error('Erro ao associar coleta:', err);
        const error = {
            title: "Falha ao Associar Coleta",
            content: VerifyErroCode(err.code)
        }
        cb(error);
    }    
}

async function DisassociateCollection (idCollector, idRecyclable) {
    const recyclableCollectorRef = ref(RealTime, `collectors/${idCollector}/${idRecyclable}`);
    await set(recyclableCollectorRef, null);
}
export async function DisassociateCollector (idCollector, idRecyclable, cb){
    try{
        await DisassociateCollection(idCollector, idRecyclable);

        const recyclableCollectorRef = ref(RealTime, `recyclable/${idRecyclable}/collector`);
        await set(recyclableCollectorRef, {
            'id' : 'none',
            'name' : 'none',
            'photoUrl' : 'none'
        })

        const recyclableCollectorRef2 = ref(RealTime, `recyclable/${idRecyclable}/status`);
        await set(recyclableCollectorRef2, "pending");
    } catch (err) {
        const error = {
            title: "Falha ao Desassociar Coleta",
            content: VerifyErroCode(err.code)
        }
        cb(error);
    }    
}
