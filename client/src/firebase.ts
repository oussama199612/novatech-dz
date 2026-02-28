import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDkWlQsOe59zsxRe22wy2YeBFD6sc2mR9E",
    authDomain: "authenfication1.firebaseapp.com",
    projectId: "authenfication1",
    storageBucket: "authenfication1.firebasestorage.app",
    messagingSenderId: "368502324416",
    appId: "1:368502324416:web:acddcd5cd01669736c0125"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
