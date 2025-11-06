import { getDocs, collection } from 'firebase/firestore';
import { Material } from '../instances/material';
import { Firestore } from '../config/connection';

let materialsCache: {} | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos


async function getAllMaterials(): Promise<Record<string, Material>> {
  try {
    const materialsRef = collection(Firestore, "materials");
    const snapshot = await getDocs(materialsRef);

    if (snapshot.empty) {
      return {};
    }

    const materials: Record<string, Material> = {};
    snapshot.forEach((doc) => {
      materials[doc.id] = doc.data() as Material;
    });

    return materials;
  } catch (error: any) {
    throw new Error("Erro ao buscar materiais: " + error.message);
  }
}

async function getActiveMaterials(): Promise<Record<string, Material>> {
  try {
    const allMaterials = await getAllMaterials();
    const activeMaterials: Record<string, Material> = {};

    Object.keys(allMaterials).forEach(key => {
      if (allMaterials[key].active) {
        activeMaterials[key] = allMaterials[key];
      }
    });

    return activeMaterials;
  } catch (error) {
    console.error("Erro ao buscar materiais ativos:", error);
    return {};
  }
}

async function getMaterialsWithCache(): Promise<Record<string, Material>> {
  const now = Date.now();

  if (!materialsCache || !cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION) {
    materialsCache = await getActiveMaterials();
    cacheTimestamp = now;
  }

  return materialsCache;
}

export {
  getMaterialsWithCache,
};
