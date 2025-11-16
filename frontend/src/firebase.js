// Import Firebase core + Firestore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCLT6IOUtuqvXlo-pTj3NGSFB4QVUUKpwk",
  authDomain: "study-assistant-919ca.firebaseapp.com",
  projectId: "study-assistant-919ca",
  storageBucket: "study-assistant-919ca.firebasestorage.app",
  messagingSenderId: "242226433912",
  appId: "1:242226433912:web:7b5838dd5bf06a2d82428d",
  measurementId: "G-1TWWYCJEHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (THIS is what your app needs)
const db = getFirestore(app);

export { db };
