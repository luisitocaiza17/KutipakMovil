import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCY4S9DTPmPZ3Iw71FPMiHSEZtCBqBph9Q",
    authDomain: "kutipak-movil.firebaseapp.com",
    projectId: "kutipak-movil",
    storageBucket: "kutipak-movil.appspot.com",
    messagingSenderId: "1024626639661",
    appId: "1:1024626639661:web:1ffa5c8820721a265149a4",
    measurementId: "G-30W9WB34J4"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default {
    app,
    db
}