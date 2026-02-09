import { initializeApp, getApps, cert } from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

import { getAuth } from "firebase-admin/auth";

const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

if (!getApps().length) {
    try {
        initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log("Firebase Admin initialized successfully");
    } catch (error) {
        console.error("Error initializing Firebase Admin:", error);
        throw error;
    }
}

export const auth = getAuth();
export const db = getFirestore();