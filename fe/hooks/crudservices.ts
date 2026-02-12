import { apiUrl } from "@/lib/api";

export type WithId<T> = T & { id: string };

export async function getList<T extends object>(
    collectionName: string,
    sortBy?: keyof T,
    order: "asc" | "desc" = "asc"
): Promise<WithId<T>[]> {
    const params = new URLSearchParams();
    if (sortBy) params.set("sortBy", String(sortBy));
    if (order) params.set("order", order);

    const res = await fetch(
        apiUrl(`/api/db/${encodeURIComponent(collectionName)}?${params.toString()}`),
        {
            method: "GET",
            credentials: "include",
        },
    );
    if (!res.ok) {
        throw new Error(`Failed to load list (${collectionName})`);
    }
    const data = (await res.json()) as WithId<T>[];
    return data;
}

export async function getById<T extends object>(
    collectionName: string,
    id: string
): Promise<WithId<T> | null> {
    const res = await fetch(
        apiUrl(`/api/db/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`),
        {
            method: "GET",
            credentials: "include",
        },
    );
    if (res.status === 404) return null;
    if (!res.ok) {
        throw new Error(`Failed to load document (${collectionName}/${id})`);
    }
    const data = (await res.json()) as WithId<T>;
    return data;
}

export async function create<T extends object>(
    collectionName: string,
    payload: T
): Promise<{ id: string }> {
    const res = await fetch(
        apiUrl(`/api/db/${encodeURIComponent(collectionName)}`),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
        },
    );
    if (!res.ok) {
        throw new Error(`Failed to create document (${collectionName})`);
    }
    const data = (await res.json()) as { id: string };
    return data;
}

export async function update<T extends object>(
    collectionName: string,
    id: string,
    payload: Partial<T>
): Promise<void> {
    const res = await fetch(
        apiUrl(`/api/db/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`),
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
        },
    );
    if (!res.ok) {
        throw new Error(`Failed to update document (${collectionName}/${id})`);
    }
}

export async function remove(
    collectionName: string,
    id: string
): Promise<void> {
    const res = await fetch(
        apiUrl(`/api/db/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`),
        {
            method: "DELETE",
            credentials: "include",
        },
    );
    if (!res.ok) {
        throw new Error(`Failed to delete document (${collectionName}/${id})`);
    }
}