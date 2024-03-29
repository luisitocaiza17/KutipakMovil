import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableHighlight } from 'react-native';
import { palabras, prefijosSubfijos, estructura, actualizarPrefijosSubfijos, actualizarEstructura } from './../db/CargaInicial';
import { PalabrasEstructuraTraduccion } from './../db/Entidades';
import Voice from '@react-native-voice/voice';//para reconocimiento por voz
import * as Permissions from 'expo-permissions';
import firebase from '../firebase/firebase'; //clase de coneccion firebase
import { collection, getDocs } from "firebase/firestore";
//import CargaInicialFirebasePS from "../firebase/firebaseInicialPS";
//import CargaInicialFirebaseEstructura from "../firebase/firebaseInicialEstructura";

const Traductor = () => {
    const [idioma, setIdioma] = useState(1);
    const [textoInput, setTextoInput] = useState('');
    const [textoTraducido, setTextoTraducido] = useState<string>();
    const [sentences, setSentences] = useState<string[] | null>(null);
    //para reconocimiento de voz
    const [isListening, setIsListening] = useState(false);
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    //TODO: validador de permisos sobre el audio en el dispositivo
    useEffect(() => {
        async function requestAudioRecordingPermission() {
            const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
            console.log(status);
            if (status === 'granted') {
                setPermissionsGranted(true);
            } else {
                setPermissionsGranted(false);
                // Aquí puedes manejar el caso en el que el usuario no otorga permisos
            }
        }
        requestAudioRecordingPermission();
    }, []);
    //funcion que cambio el idioma a traducir
    const cambiarIdioma = (valor: number) => {
        setIdioma(valor);
    };
    //TODO:Consulta a firebase.... si no lo encuentra deja la data local, para que siempre pueda traducir
    //Carga inicial de firebase si no es posible la coneccion se toma desde local
    const consultarPrefijosSubfijos = async () => {
        try {
            const querySnapshot = await getDocs(collection(firebase.db, "PrefijosSubfijos"));
            const listaPrefijosSubfijosFirebase: PrefijosSubfijos[] = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                const data = doc.data() as PrefijosSubfijos;
                listaPrefijosSubfijosFirebase.push(data);

            });
            if (listaPrefijosSubfijosFirebase.length != 0) {
                actualizarPrefijosSubfijos(listaPrefijosSubfijosFirebase);
            }
            console.log("Fin");
        } catch (error) {
            //en caso de error se queda con local
        }
    };
    const consultarEstructura = async () => {
        try {
            const querySnapshot = await getDocs(collection(firebase.db, "Estructura"));
            const listaEstructura: Estructura[] = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                const data = doc.data() as Estructura;
                listaEstructura.push(data);
            });
            if (listaEstructura.length != 0) {
                actualizarEstructura(listaEstructura);
            }
            console.log("Fin");
        } catch (error) {
            //en caso de error se queda con local
        }
    };
    consultarEstructura();
    consultarPrefijosSubfijos();

    //solo para carga inicial en firebase con data para el procesos, no se lo vuelve hacer, es una subida masiva de informacion
    /* 
    const otraClase = async () => {
        try {
            await CargaInicialFirebasePS();
            console.log('Datos cargados y enviados correctamente a Firebase');
        } catch (error) {
            console.error('Error al cargar y enviar datos:', error);
        }
    };
    otraClase();
    const otraClase2 = async () => {
        try {
            await CargaInicialFirebaseEstructura();
            console.log('Datos cargados y enviados correctamente a Firebase');
        } catch (error) {
            console.error('Error al cargar y enviar datos:', error);
        }
    };
    otraClase2(); */

    //TODO: Proceso de traduccion.
    const traducirTexto = async () => {
        // Define una expresión regular para dividir el texto en oraciones sin perder los caracteres especiales
        const sentenceRegex = /[^.:,;?¿!¡]+[.:,;?¿!¡]*/g;

        // Divide el texto en oraciones utilizando la expresión regular
        const sentences = textoInput.toUpperCase().match(sentenceRegex);

        // Verifica si 'sentences' no es nulo antes de continuar
        if (sentences !== null) {
            // Elimina los espacios en blanco alrededor de cada oración
            const oracionesSeparadas = sentences.map(sentence => sentence.trim());
            // Actualiza el estado con las oraciones resultantes
            setSentences(oracionesSeparadas);
            let traduccionFinal = '';
            //se comienzan a procesoar oracion por oracion
            oracionesSeparadas.forEach(oraciones => {
                let oracionTransformada = '';
                let oracionTraducida = '';
                const palabrasSeparadas = oraciones.toUpperCase().split(/(\s+|[,.?!])/).filter(palabra => palabra.trim() !== '');
                let oracionEstructura: PalabrasEstructuraTraduccion[] = [];
                {/**ESPAÑOL A KITCHWA**/ }
                if (idioma == 1) {

                    //1) tomamos el texto y los separamos en palabras
                    //español a kitckwa
                    //voy a buscar el signicado de la palabra en el idioma a buscar
                    palabrasSeparadas.forEach(palabraI => {
                        //2)buscamos la traduccion exacta de la palabra si si tiene lo dejamos tal como esta porque posteriormente se traduce las palabras
                        //buscamos en la base el signifado
                        console.log(palabraI)
                        let siginificado = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == palabraI);
                        console.log(siginificado)
                        if (siginificado == undefined) {
                            //3)Si no tiene traduccion exacto busca los prefijos y subfijos
                            //en caso de que la palabra no tenga significado se la va a ir descomponiendo hasta ver si existe alguna que coincida con esta palabra
                            //ejemplo: gatos no existe en plural en el diccionario, por lo tanto se quita la s y se queda coo gato, y gato si existe por lo tanto el texto se transforma
                            //BUSQUEDA DE PREFIJOS Y SUBFIJOS EN LA PALABRA EJEMPLO CAMINANDO SUBFIJO ANDO LO QUE TRANSFORMA A PALABRA EN CAMINAR
                            let palabraSubPreEncontrada = false;
                            prefijosSubfijos.filter(x => x.idioma == "ESPAÑOL").forEach(prefSub => {
                                const regex = new RegExp(`^${prefSub.palabra}|${prefSub.palabra}$`, "i");
                                if (regex.test(palabraI)) {
                                    console.log(`La palabra "${palabraI}" contiene "${prefSub.palabra}".`);
                                    //SI ENCUENTRA PREFIJOS Y SUBFIJOS ENTONCES LOS SEPARA
                                    oracionTransformada += " " + palabraI.replace(prefSub.palabra, " " + prefSub.palabra);
                                    console.log("palaba con subfijo y prefijos" + oracionTransformada);
                                    palabraSubPreEncontrada = true;
                                }
                            });
                            if (palabraSubPreEncontrada == false) {
                                //si despues de toda la busqueda no encontro ni prefijos ni subfijos entonces la parabra se queda tal como esta
                                oracionTransformada += " " + palabraI;
                                console.log("no encontro subfijo ni prefijos al final" + oracionTransformada);
                            }
                        } else {
                            console.log(`La palabra "${palabraI}" TRADUCCION "${siginificado.significado}".`);
                            //si si tiene significado exacto se le deja a la palabra como esta
                            oracionTransformada += " " + palabraI;
                        }
                        //4) ahora volvemos a separar la oracion en palabras separadas
                    });
                    //4) volvemos a separar la oracion con los subfijos y prefijos que se traduciran posteriormente
                    //ejem  ESTOY CAMINANDO A CASA = LLEGA ESTOY CAMIN ANDO A CASA
                    const palabrasSeparadasConSubPre = oracionTransformada.toUpperCase().split(/(\s+|[,.?!])/).filter(palabra => palabra.trim() !== '');
                    let oracionTraducida = '';
                    console.log(palabrasSeparadasConSubPre);
                    palabrasSeparadasConSubPre.forEach(palabraSola => {
                        //5) si tengo la traduccion exacta lo coloca sino voy a deducir
                        let siginificado = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == palabraSola);
                        if (siginificado === undefined) {
                            //validamos la existencia si la palabra vien con caracteres especiales
                            const palabraSinCaracteres = normalizeText(siginificado ?? '');
                            const palabraEncontrada = palabras.find(
                                x =>
                                    x.idioma === "ESPAÑOL" &&
                                    normalizeText(x.palabra) === palabraSinCaracteres
                            );
                            console.log("encontro sin caracteres?" + palabraEncontrada);
                            if (palabraEncontrada === undefined) {
                                //6) si no tiene una traduccion exacta entonces deducimos si esta en plular
                                //tomando en cuenta que en base si existen las palabras con 3 letras: las, los, el, la....
                                if (palabraSola.length > 3) {
                                    //buscamos coincidencia
                                    let tienePlural: boolean = false;
                                    let traduccion: string = palabraSola;
                                    let existeTraduccion: boolean = false;

                                    if (palabraSola.endsWith("CES")) {
                                        traduccion = palabraSola.substring(0, palabraSola.length - 3) + "Z";
                                        tienePlural = true;
                                    } else if (palabraSola.endsWith("ES")) {
                                        traduccion = palabraSola.substring(0, palabraSola.length - 2);
                                        tienePlural = true;
                                    } else if (palabraSola.endsWith("S")) {
                                        traduccion = palabraSola.substring(0, palabraSola.length - 1);
                                        tienePlural = true;
                                    }
                                    let palabraTraducidaSinPlural = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == traduccion);
                                    //si existe la traduccion directa ahi muere
                                    if (palabraTraducidaSinPlural !== undefined) {
                                        oracionTraducida += " " + palabraTraducidaSinPlural.significado;
                                        if (tienePlural) {
                                            oracionTraducida += "KUNA"
                                        }
                                    } else {

                                        //antes de buscar por deduccion busca tambien sin caracteres especials
                                        const palabraSinCaracteres = normalizeText(traduccion ?? '');
                                        const palabraEncontrada = palabras.find(
                                            x =>
                                                x.idioma === "ESPAÑOL" &&
                                                normalizeText(x.palabra) === palabraSinCaracteres
                                        );
                                        console.log("encontro sin caracteres2?" + palabraEncontrada);

                                        if (palabraEncontrada === undefined) {
                                            //sino buscamos por deduccion
                                            console.log("***traduccion deduccion " + traduccion);
                                            for (let i = 1; i <= 3; i++) {
                                                const palabraRecortada: string = traduccion.substring(0, traduccion.length - i).trim();
                                                console.log("***traduccion deduccion palabra " + palabraRecortada);

                                                siginificado = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == palabraRecortada);
                                                if (siginificado != undefined) {
                                                    console.log("***deduccion significado " + siginificado);
                                                    existeTraduccion = true;
                                                    break;
                                                }
                                            }
                                            console.log("***Existe significado " + existeTraduccion);
                                            if (existeTraduccion) {
                                                oracionTraducida += " " + siginificado?.significado;
                                                if (tienePlural) {
                                                    console.log("***traduccion " + siginificado);
                                                    oracionTraducida += "KUNA"
                                                }
                                            } else {
                                                oracionTraducida += " " + palabraSola;
                                            }
                                        } else {
                                            oracionTraducida += " " + palabraEncontrada.significado;
                                        }
                                    }
                                } else {
                                    //si no es mayor que 3 letras no es posible hallar el siginificado
                                    oracionTraducida += " " + palabraSola;
                                }
                            } else {
                                oracionTraducida += " " + palabraEncontrada.significado;
                            }
                        } else {
                            oracionTraducida += " " + siginificado.significado;
                        }
                        console.log("***FINALMENTE" + oracionTraducida);

                    });
                    traduccionFinal += oracionTraducida;
                }
                else {
                    {/**KITCHWA A ESPAÑOL**/ }
                    //1) tomamos el texto y los separamos en palabras
                    //voy a buscar el signicado de la palabra en el idioma a buscar
                    palabrasSeparadas.forEach(palabraI => {
                        //2)buscamos la traduccion exacta de la palabra si si tiene lo dejamos tal como esta porque posteriormente se traduce las palabras
                        //buscamos en la base el signifado
                        let siginificado = palabras.find(x => x.idioma == "KITCHWA" && x.palabra == palabraI);
                        if (siginificado == undefined) {
                            //3)Si no tiene traduccion exacto busca los prefijos y subfijos
                            //en caso de que la palabra no tenga significado se la va a ir descomponiendo hasta ver si existe alguna que coincida con esta palabra
                            //ejemplo: gatos no existe en plural en el diccionario, por lo tanto se quita la s y se queda coo gato, y gato si existe por lo tanto el texto se transforma
                            //BUSQUEDA DE PREFIJOS Y SUBFIJOS EN LA PALABRA EJEMPLO CAMINANDO SUBFIJO ANDO LO QUE TRANSFORMA A PALABRA EN CAMINAR
                            let palabraSubPreEncontrada = false;
                            prefijosSubfijos.filter(x => x.idioma == "KITCHWA").forEach(prefSub => {
                                const regex = new RegExp(`^${prefSub.palabra}|${prefSub.palabra}$`, "i");
                                if (regex.test(palabraI)) {
                                    console.log(`La palabra "${palabraI}" contiene "${prefSub.palabra}".`);
                                    //SI ENCUENTRA PREFIJOS Y SUBFIJOS ENTONCES LOS SEPARA
                                    oracionTransformada += " " + palabraI.replace(prefSub.palabra, " " + prefSub.palabra);
                                    console.log("palaba con subfijo y prefijos" + oracionTransformada);
                                    palabraSubPreEncontrada = true;
                                }
                            });
                            if (palabraSubPreEncontrada == false) {
                                //si despues de toda la busqueda no encontro ni prefijos ni subfijos entonces la parabra se queda tal como esta
                                oracionTransformada += " " + palabraI;
                                console.log("no encontro subfijo ni prefijos al final" + oracionTransformada);
                            }
                        } else {
                            console.log(`La palabra "${palabraI}" TRADUCCION "${siginificado.significado}".`);
                            //si si tiene significado exacto se le deja a la palabra como esta
                            oracionTransformada += " " + palabraI;
                        }
                    });
                    //TODO ORACION COMPUESTA
                    console.log("ORACION COMPUESTA: " + oracionTransformada);
                    //4) volvemos a separar la oracion con los subfijos y prefijos que se traduciran posteriormente
                    const palabrasSeparadasConSubPre = oracionTransformada.toUpperCase().split(/(\s+|[,.?!])/).filter(palabra => palabra.trim() !== '');
                    palabrasSeparadasConSubPre.forEach(palabraSola => {
                        //5) si tengo la traduccion exacta lo coloca sino voy a deducir
                        let siginificado = palabras.find(x => x.idioma == "KITCHWA" && x.palabra == palabraSola);
                        if (siginificado === undefined) {
                            //validamos la existencia si la palabra vien con caracteres especiales
                            const palabraSinCaracteres = normalizeText(siginificado ?? '');
                            const palabraEncontrada = palabras.find(
                                x =>
                                    x.idioma === "KITCHWA" &&
                                    normalizeText(x.palabra) === palabraSinCaracteres
                            );
                            if (palabraEncontrada === undefined) {

                                //6) si no tiene una traduccion exacta entonces deducimos si esta en plular
                                var traduccionPlural = '';
                                const regexFinal = /KUNA$/i; // El signo $ representa el final de la cadena
                                if (!regexFinal.test(palabraSola)) {
                                    //si no es plural se hace la deduccion
                                    //tomando en cuenta que en base si existen las palabras con 3 letras: las, los, el, la....
                                    if (palabraSola.length > 3) {
                                        //buscamos coincidencia
                                        let tienePlural: boolean = false;
                                        let traduccion: string = palabraSola;
                                        let existeTraduccion: boolean = false;

                                        if (palabraSola.endsWith("CES")) {
                                            traduccion = palabraSola.substring(0, palabraSola.length - 3) + "Z";
                                            tienePlural = true;
                                        } else if (palabraSola.endsWith("ES")) {
                                            traduccion = palabraSola.substring(0, palabraSola.length - 2);
                                            tienePlural = true;
                                        } else if (palabraSola.endsWith("S")) {
                                            traduccion = palabraSola.substring(0, palabraSola.length - 1);
                                            tienePlural = true;
                                        }
                                        let palabraTraducidaSinPlural = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == traduccion);
                                        //si existe la traduccion directa ahi muere
                                        if (palabraTraducidaSinPlural !== undefined) {
                                            oracionTraducida += " " + palabraTraducidaSinPlural.significado;
                                            if (tienePlural) {
                                                oracionTraducida += "KUNA"
                                            }
                                        } else {

                                            //antes de buscar por deduccion busca tambien sin caracteres especials
                                            const palabraSinCaracteres = normalizeText(traduccion ?? '');
                                            const palabraEncontrada = palabras.find(
                                                x =>
                                                    x.idioma === "KITCHWA" &&
                                                    normalizeText(x.palabra) === palabraSinCaracteres
                                            );
                                            console.log("encontro sin caracteres2?" + palabraEncontrada);

                                            if (palabraEncontrada === undefined) {
                                                //sino buscamos por deduccion
                                                console.log("***deduccion " + traduccion);
                                                for (let i = 1; i <= 3; i++) {
                                                    const palabraRecortada: string = traduccion.substring(0, traduccion.length - i).trim();
                                                    console.log("***deduccion palabra " + palabraRecortada);

                                                    siginificado = palabras.find(x => x.idioma == "KITCHWA" && x.palabra == palabraRecortada);
                                                    if (siginificado != undefined) {
                                                        console.log("***deduccion sginificado " + siginificado);
                                                        existeTraduccion = true;
                                                        break;
                                                    }
                                                }
                                                console.log("***Existe deduccion " + existeTraduccion);
                                                if (existeTraduccion) {
                                                    oracionTraducida += " " + siginificado?.significado;
                                                    if (tienePlural) {
                                                        console.log("***deduccion " + siginificado);
                                                        oracionTraducida += "S"
                                                    }
                                                } else {
                                                    oracionTraducida += " " + palabraSola;
                                                }
                                            } else {
                                                oracionTraducida += " " + palabraEncontrada.significado;
                                            }
                                        }
                                    } else {
                                        //si no es mayor que 3 letras no es posible hallar el siginificado
                                        oracionTraducida += " " + palabraSola;
                                    }
                                } else {
                                    //en caso de encontrar KUNA se le hace un split para separar el plular de la oracion a traducir
                                    const cadenasPlural = palabraSola.split("KUNA");
                                    let existeTraduccion = false;
                                    //buscamos el significado sin kuna
                                    siginificado = palabras.find(x => x.idioma == "KITCHWA" && x.palabra == cadenasPlural[0]);
                                    if (siginificado === undefined) {
                                        //si aun asi no hay significado se hace el proces de deduccion
                                        console.log("***traduccion deduccion " + siginificado);
                                        for (let i = 1; i <= 3; i++) {
                                            const palabraRecortada: string = cadenasPlural[0].substring(0, cadenasPlural[0].length - i).trim();
                                            console.log("***traduccion deduccion palabra " + palabraRecortada);

                                            siginificado = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == palabraRecortada);
                                            if (siginificado != undefined) {
                                                console.log("***deduccion significado " + siginificado);
                                                existeTraduccion = true;
                                                break;
                                            }
                                        }
                                        console.log("***Existe significado " + existeTraduccion);
                                        if (existeTraduccion) {
                                            oracionTraducida += " " + siginificado?.significado;

                                            oracionTraducida += "S"
                                        } else {
                                            oracionTraducida += " " + palabraSola;
                                        }
                                    } else {
                                        // si tiene significado se agrega el plural
                                        oracionTraducida += " " + pluralizarPalabra(palabraSola);
                                        oracionEstructura.push({ Palabra: siginificado.palabra, Traduccion: oracionTraducida, Tipo: siginificado.codigo });
                                    }
                                }
                            } else {
                                oracionTraducida += " " + palabraEncontrada.significado;
                                oracionEstructura.push({ Palabra: palabraEncontrada.palabra, Traduccion: palabraEncontrada.significado, Tipo: palabraEncontrada.codigo });

                            }
                        } else {
                            oracionTraducida += " " + siginificado.significado;
                            oracionEstructura.push({ Palabra: siginificado.palabra, Traduccion: siginificado.significado, Tipo: siginificado.codigo });
                        }
                    });
                    console.log("ORACION FINAL: " + oracionTraducida);
                    console.log("ORACION ESTRUCTURA");
                    console.log(oracionEstructura);
                    traduccionFinal += oracionTraducida;
                    //caso de cambio de posiciones
                    //cambiarPosiciones(oracionEstructura);                    
                }
            });
            setTextoTraducido(traduccionFinal);
        }
    };

    //funcion que toma la palabra y le quita las tildes y caracteres especiales
    function normalizeText(text: string) {
        return text
            .normalize("NFD") // Normaliza las letras con tilde
            .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos
            .toLowerCase(); // Convierte todo a minúsculas
    }
    //funcion para pluralizar la palabra
    function pluralizarPalabra(palabra: string) {
        // Plural según las reglas específicas
        if (palabra.endsWith("a") || palabra.endsWith("e") || palabra.endsWith("o")) {
            return palabra + "s";
        } else if (palabra.endsWith("z")) {
            return palabra.slice(0, -1) + "ces";
        } else {
            return palabra + "es";
        }
    }    
    //Para reconocimiento de voz
    useEffect(() => {
        // Configuración de eventos de reconocimiento de voz
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        return () => {
            // Limpia los eventos al desmontar el componente
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const startSpeechToText = async () => {
        try {
            setIsListening(true);
            await Voice.start('es-ES'); 
        } catch (error) {
            console.error(error);
        }
    };
    const stopSpeechToText = async () => {
        try {
            setIsListening(false);
            await Voice.stop();
        } catch (error) {
            console.error(error);
        }
    };
    const onSpeechResults = (event: any) => {
        setTextoInput(event.value[0]);
    };
    const onSpeechError = (event: any) => {
        console.error("Error de voz:", event.error);
    };
    return (
        <View style={styles.container}>
            {/* Título */}
            <Text style={styles.titulo}>Kutipak traductor online</Text>

            {/* Espacio */}
            <View style={styles.espacio}></View>
            <View style={styles.espacio}></View>

            {/* Botones para seleccionar el idioma */}
            <View style={styles.botonesIdiomaContainer}>
                <TouchableOpacity style={[styles.botonIdioma, idioma === 1 && styles.botonIdiomaSeleccionado]} onPress={() => cambiarIdioma(1)}>
                    <Text style={styles.textoBotonIdioma}>Español-Kitchwa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.botonIdioma, idioma === 0 && styles.botonIdiomaSeleccionado]} onPress={() => cambiarIdioma(0)}>
                    <Text style={styles.textoBotonIdioma}>Kitchwa-Español</Text>
                </TouchableOpacity>
            </View>

            {/* Espacio */}
            <View style={styles.espacio}></View>

            {/* TextInput para ingresar el texto */}
            <TextInput
                style={[styles.textInput, { borderColor: textoInput ? 'blue' : '#ccc' }]}
                placeholder="Ingrese el texto..."
                value={textoInput}
                onChangeText={(text) => setTextoInput(text)}
                multiline={true}
                numberOfLines={4} // Establece el número de líneas
            />

            {/* Botón para traducir el texto */}
            <TouchableOpacity style={styles.botonTraducir} onPress={traducirTexto}>
                <Text style={styles.textoBotonTraducir}>Traducir</Text>
            </TouchableOpacity>

            {/* Texto traducido */}
            <TextInput
                style={[styles.textInput, { borderColor: textoTraducido ? 'green' : 'red', backgroundColor: '#f9f9f9' }]}
                placeholder="Texto traducido"
                editable={false}
                value={textoTraducido}
                multiline={true}
                numberOfLines={4} // Establece el número de líneas
            />
            {/* <View style={styles.row}>
                <Text style={styles.subtitle}>Oraciones:</Text>
                <View>
                    {sentences ? (
                        sentences.map((sentence, index) => (
                            <Text key={index} style={styles.sentence}>{sentence}</Text>
                        ))
                    ) : (
                        <Text style={styles.sentence}>No se encontraron oraciones</Text>
                    )}
                </View>
            </View> */}
            <View style={styles.containerButton}>
                {/* Resto de tu código */}
                <View style={styles.buttonContainer}>
                    <TouchableHighlight
                        onPressIn={startSpeechToText}
                        onPressOut={stopSpeechToText}
                        underlayColor="transparent"
                        style={[styles.hablarButton, isListening && styles.hablarButtonPressed]} // Aplica estilos específicos al botón "Presiona y habla"
                    >
                        <Text style={styles.buttonText}>
                            {isListening ? "Escuchando..." : "Presiona y habla"}
                        </Text>
                    </TouchableHighlight>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,

    },
    titulo: {
        textAlign: 'center',
        fontSize: 20,
        color: '#2596be', // Color del botón traducir
    },
    espacio: {
        marginBottom: 10, // Espacio entre los elementos
    },
    botonesIdiomaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    botonIdioma: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    botonIdiomaSeleccionado: {
        backgroundColor: '#2596be',
    },
    textoBotonIdioma: {
        textAlign: 'center',
        color: 'black',
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    botonTraducir: {
        backgroundColor: '#2596be',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    textoBotonTraducir: {
        color: 'white',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    sentence: {
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    inputContainer: {
        width: '80%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
    },
    input: {
        fontSize: 16,
        minHeight: 100,
    },
    button: {
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    // Estilos para el botón "Presiona y habla"
    hablarButton: {
        backgroundColor: '#007bff',
        borderRadius: 50, // Hace que el botón sea completamente redondo
        paddingVertical: 15, // Reduce el espacio vertical dentro del botón
        paddingHorizontal: 30, // Reduce el espacio horizontal dentro del botón
    },
    buttonContainer: {
        width: 200, // Ancho del contenedor del botón
        alignItems: 'center', // Centra el botón dentro del contenedor horizontalmente
    },
    containerButton: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        alignItems: 'center', // Centra los elementos horizontalmente
    },
    hablarButtonPressed: {
        backgroundColor: '#00FF00', // Cambia el color del botón a verde cuando está presionado
    },
});

export default Traductor;
