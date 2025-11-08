// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIomSaVptMHCOeJl5cJnYKNFhd3XzsEyg",
  authDomain: "twiller-ab869.firebaseapp.com",
  projectId: "twiller-ab869",
  storageBucket: "twiller-ab869.firebasestorage.app",
  messagingSenderId: "275589966467",
  appId: "1:275589966467:web:37220712a9413dbf6249b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Add error handling and logging
console.log('Firebase initialized successfully');
console.log('Auth domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);

export default app;