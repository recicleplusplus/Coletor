import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Firestore } from "../config/connection";

/**
 * Busca os pontos atuais do doador
 */
export async function getDonorCurrentPoints(donorId: string): Promise<number> {
  try {
    const docSnap = await getDoc(doc(Firestore, "donor", donorId));
    if (docSnap.exists()) {
      return docSnap.data().points || 0;
    }
    return 0;
  } catch (error) {
    console.error("Erro ao buscar pontos do doador:", error);
    return 0;
  }
}

/**
 * Atualiza os pontos do doador
 */
export async function updateDonorPoints(
  donorId: string,
  pointsToAdd: number = 0
): Promise<number | null> {
  try {
    const docRef = doc(Firestore, "donor", donorId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentPoints = await getDonorCurrentPoints(donorId);
      const newPoints = currentPoints + pointsToAdd;

      await updateDoc(docRef, { points: newPoints });
      return newPoints;
    } else {
      console.log("Doador não encontrado!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao atualizar pontos do doador:", error);
    return null;
  }
}