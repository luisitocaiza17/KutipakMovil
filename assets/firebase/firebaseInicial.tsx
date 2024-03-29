import { useEffect, useState } from 'react';
import { setDoc, doc } from "firebase/firestore";
import firebase from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { palabras } from '../db/CargaInicial';
//TODO: carga de datos a firebase por primera vez
const CargaInicialFirebase = () => {
    const [palabrasC, setPalabrasC] = useState<Palabras[]>([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setPalabrasC(palabras);
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
        if (palabrasC.length > 0) {
            enviarDatosAFirebase(palabrasC);
        }
    }, [palabrasC]);

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
export default CargaInicialFirebase;
