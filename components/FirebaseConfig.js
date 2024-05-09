import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: `${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
  authDomain: "runningapp-eccf5.firebaseapp.com",
  databaseURL:
    "https://runningapp-eccf5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "runningapp-eccf5",
  storageBucket: "runningapp-eccf5.appspot.com",
  messagingSenderId: "141550808000",
  appId: "1:141550808000:web:3aeffe47a65ed28dbd7625",
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
