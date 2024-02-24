import { useEffect, useState } from 'react';
import { setDoc, doc } from "firebase/firestore";
import firebase from './firebase';
import { v4 as uuidv4 } from 'uuid';
import dataString from "./dataInicial";

const CargaInicialFirebase = () => {
    const [palabras, setPalabras] = useState<Palabras[]>([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            console.log('Inicia lectura');
            const response = await fetch(require('./data.json'));
            const data = await response.json();
            setPalabras(data);
        } catch (error) {
            console.error('Error al cargar el archivo JSON:', error);
        }
    };

    const enviarDatosAFirebase = async (data: Palabras[]) => {
        try {
            console.log("Ingresa a Firebase");            
            await Promise.all(data.map(async (palabras) => {
                await setDoc(doc(firebase.db, "Palabras", uuidv4()), palabras);
            }));

            console.log("Datos agregados correctamente a Firebase");
        } catch (error) {
            console.error("Error al agregar datos a Firebase:", error);
        }
    };

    useEffect(() => {
        if (palabras.length > 0) {
            enviarDatosAFirebase(palabras);
        }
    }, [palabras]);

    return null; // Puedes reemplazar esto con tu JSX
};

const enviarDatosAFirebase = async (data: Palabras[]) => {
    try {
        console.log("Ingresa a Firebase");
        console.log(data);

        await Promise.all(data.map(async (palabras) => {
            await setDoc(doc(firebase.db, "Palabras", uuidv4()), palabras);
        }));

        console.log("Datos agregados correctamente a Firebase");
    } catch (error) {
        console.error("Error al agregar datos a Firebase:", error);
    }
};

export const cargarYEnviarDatos = async () => {
    try {
        const data  = JSON.parse(dataString);
        console.log('Data:', data);
        enviarDatosAFirebase(data);
    } catch (error) {
        console.error('Error al cargar y enviar datos:', error);
    }
};
export default CargaInicialFirebase;
