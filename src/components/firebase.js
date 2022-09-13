import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC8AzQL4N4KJ1nTVS8CIL1n8NLl0xn8ErA",
    authDomain: "habit-rabbit-7f5c9.firebaseapp.com",
    projectId: "habit-rabbit-7f5c9",
    storageBucket: "habit-rabbit-7f5c9.appspot.com",
    messagingSenderId: "845569530160",
    appId: "1:845569530160:web:57a8bedd1ceb1ee85950f5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();