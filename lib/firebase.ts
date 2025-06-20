import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Connect to emulators in development (only once)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Use a global variable to ensure emulators are only connected once per session
  if (!(window as any).__FIREBASE_EMULATORS_CONNECTED__) {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    } catch (error) {
      console.log("Auth emulator already connected or not available")
    }

    try {
      connectFirestoreEmulator(db, "localhost", 8080)
    } catch (error) {
      console.log("Firestore emulator already connected or not available")
    }

    ;(window as any).__FIREBASE_EMULATORS_CONNECTED__ = true
  }
}

export default app
