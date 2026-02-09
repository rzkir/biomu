import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type WithId<T> = T & { id: string };

export async function getList<T extends object>(
    collectionName: string,
    sortBy?: keyof T,
    order: "asc" | "desc" = "asc"
): Promise<WithId<T>[]> {
    const snapshot = await getDocs(collection(db, collectionName));
    const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
    })) as WithId<T>[];
    if (sortBy != null && list.length > 0 && sortBy in list[0]) {
        const key = String(sortBy);
        list.sort((a, b) => {
            const va = (a as Record<string, unknown>)[key];
            const vb = (b as Record<string, unknown>)[key];
            const isNum = typeof va === "number" && typeof vb === "number";
            if (isNum) {
                return order === "desc" ? (vb as number) - (va as number) : (va as number) - (vb as number);
            }
            const cmp = String(va).localeCompare(String(vb));
            return order === "desc" ? -cmp : cmp;
        });
    }
    return list;
}

export async function getById<T extends object>(
    collectionName: string,
    id: string
): Promise<WithId<T> | null> {
    const ref = doc(db, collectionName, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as WithId<T>;
}

export async function create<T extends object>(
    collectionName: string,
    payload: T
): Promise<{ id: string }> {
    const ref = await addDoc(collection(db, collectionName), payload);
    return { id: ref.id };
}

export async function update<T extends object>(
    collectionName: string,
    id: string,
    payload: Partial<T>
): Promise<void> {
    const ref = doc(db, collectionName, id);
    // @ts-expect-error - partial object compatible with UpdateData at runtime
    await updateDoc(ref, payload);
}

export async function remove(
    collectionName: string,
    id: string
): Promise<void> {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
}