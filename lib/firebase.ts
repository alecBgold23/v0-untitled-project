// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
let app
let analytics
let auth

// Check if we're in the browser and if Firebase hasn't been initialized
if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  // Only initialize analytics in production
  if (process.env.NODE_ENV === "production") {
    analytics = getAnalytics(app)
  }
} else {
  // If Firebase has already been initialized, use the existing instance
  app = getApps()[0]
  auth = getAuth(app)
}

export { app, analytics, auth, RecaptchaVerifier, signInWithPhoneNumber }
