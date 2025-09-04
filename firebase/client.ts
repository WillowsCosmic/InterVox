// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyD8FfdcFX7Pihjn-CvwmX2O-HY9L0EGFYc",
  authDomain: "intervox-7d248.firebaseapp.com",
  projectId: "intervox-7d248",
  storageBucket: "intervox-7d248.firebasestorage.app",
  messagingSenderId: "810804012125",
  appId: "1:810804012125:web:0b1e9b5c1e5e8e298799b4",
  measurementId: "G-XQ5FVF67RE"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig):getApp();
export const auth = getAuth(app);
export const db = getFirestore(app)