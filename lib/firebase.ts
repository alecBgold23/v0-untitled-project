// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_gSO-HeeMRCfa-rKNfojSqhObfNPkQyU",
  authDomain: "bluberry-email-auth.firebaseapp.com",
  projectId: "bluberry-email-auth",
  storageBucket: "bluberry-email-auth.firebasestorage.app",
  messagingSenderId: "930264417138",
  appId: "1:930264417138:web:2b8824166b72e10a8493eb",
  measurementId: "G-GNMP5RECTC",
}

// Initialize Firebase
let app: FirebaseApp | undefined
let auth: Auth | undefined

// Only initialize Firebase on the client side
function initializeFirebase() {
  if (typeof window !== "undefined") {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
    } else {
      app = getApps()[0]
      auth = getAuth(app)
    }
  }

  return { app, auth }
}

// Initialize Firebase lazily
const { auth: lazyAuth } = initializeFirebase()

// Export the initialized auth instance and other Firebase functions
export { lazyAuth as auth, RecaptchaVerifier, signInWithPhoneNumber }
