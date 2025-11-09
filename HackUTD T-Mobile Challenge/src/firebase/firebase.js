// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnVAnsObBnci0E3xuv3lVoznUnoTqXANE",
  authDomain: "tmobilechallenge.firebaseapp.com",
  projectId: "tmobilechallenge",
  storageBucket: "tmobilechallenge.firebasestorage.app",
  messagingSenderId: "531685921823",
  appId: "1:531685921823:web:bb7e4d4c3021448fd1712a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };