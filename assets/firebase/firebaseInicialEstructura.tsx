import { useEffect, useState } from 'react';
import { setDoc, doc } from "firebase/firestore";
import firebase from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { estructura } from '../db/CargaInicial';
//TODO: para cargar estructura  a firebase por primera vez
const CargaInicialFirebaseEstructura = () => {
    const [Estructura, setEstructura] = useState<Estructura[]>([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setEstructura(estructura);
        } catch (error) {
            console.error('Error al cargar el archivo JSON:', error);
        }
    };

    const enviarDatosAFirebase = async (data: Estructura[]) => {
        try {
            console.log("Ingresa a Firebase");            
            await Promise.all(data.map(async (Estructura) => {
                await setDoc(doc(firebase.db, "Estructura", uuidv4()), Estructura);
            }));

            console.log("Datos agregados correctamente a Firebase");
        } catch (error) {
            console.error("Error al agregar datos a Firebase:", error);
        }
    };

    useEffect(() => {
        if (Estructura.length > 0) {
            enviarDatosAFirebase(Estructura);
        }
    }, [Estructura]);

    return null; // Puedes reemplazar esto con tu JSX
};

const enviarDatosAFirebase = async (data: Estructura[]) => {
    try {
        console.log("Ingresa a Firebase");
        console.log(data);

        await Promise.all(data.map(async (Estructura) => {
            await setDoc(doc(firebase.db, "Estructura", uuidv4()), Estructura);
        }));

        console.log("Datos agregados correctamente a Firebase");
    } catch (error) {
        console.error("Error al agregar datos a Firebase:", error);
    }
};

export default CargaInicialFirebaseEstructura;
