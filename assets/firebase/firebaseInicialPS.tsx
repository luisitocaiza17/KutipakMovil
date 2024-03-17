import { useEffect, useState } from 'react';
import { setDoc, doc } from "firebase/firestore";
import firebase from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { prefijosSubfijos } from './../db/CargaInicial';
//TODO: para cargar estructura  a firebase por primera vez
const CargaInicialFirebasePS = () => {
    const [PrefijosSubfijos, setPrefijosSubfijos] = useState<PrefijosSubfijos[]>([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setPrefijosSubfijos(prefijosSubfijos);
        } catch (error) {
            console.error('Error al cargar el archivo JSON:', error);
        }
    };

    const enviarDatosAFirebase = async (data: PrefijosSubfijos[]) => {
        try {
            console.log("Ingresa a Firebase");            
            await Promise.all(data.map(async (PrefijosSubfijos) => {
                await setDoc(doc(firebase.db, "PrefijosSubfijos", uuidv4()), PrefijosSubfijos);
            }));

            console.log("Datos agregados correctamente a Firebase");
        } catch (error) {
            console.error("Error al agregar datos a Firebase:", error);
        }
    };

    useEffect(() => {
        if (PrefijosSubfijos.length > 0) {
            enviarDatosAFirebase(PrefijosSubfijos);
        }
    }, [PrefijosSubfijos]);

    return null; // Puedes reemplazar esto con tu JSX
};

const enviarDatosAFirebase = async (data: PrefijosSubfijos[]) => {
    try {
        console.log("Ingresa a Firebase");
        console.log(data);

        await Promise.all(data.map(async (PrefijosSubfijos) => {
            await setDoc(doc(firebase.db, "PrefijosSubfijos", uuidv4()), PrefijosSubfijos);
        }));

        console.log("Datos agregados correctamente a Firebase");
    } catch (error) {
        console.error("Error al agregar datos a Firebase:", error);
    }
};

export default CargaInicialFirebasePS;
