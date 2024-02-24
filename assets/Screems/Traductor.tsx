import React, { useState } from "react";
import { View, Text, Button, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { palabras, prefijosSubfijos, tiposPalabras } from './../db/CargaInicial';

const Traductor = () => {
    const [idioma, setIdioma] = useState(1);
    const [textoInput, setTextoInput] = useState('');
    const [textoTraducido, setTextoTraducido] = useState<string[]>([]);
    const [sentences, setSentences] = useState<string[] | null>(null);

    const cambiarIdioma = (valor: number) => {
        setIdioma(valor);
    };

    const traducirTexto = () => {
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
            console.log("Oraciones:" + oracionesSeparadas);
            //se comienzan a procesoar oracion por oracion
            oracionesSeparadas.forEach(oraciones => {
                let oracionTransformada = '';
                const palabrasSeparadas = oraciones.toUpperCase().split(/(\s+|[,.?!])/).filter(palabra => palabra.trim() !== '');
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
                                if (palabraI.includes(prefSub.palabra)) {
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

                } else {
                    //kitchwa a español
                }
                //4) volvemos a separar la oracion con los subfijos y prefijos que se traduciran posteriormente
                //ejem  ESTOY CAMINANDO A CASA = LLEGA ESTOY CAMIN ANDO A CASA
                const palabrasSeparadasConSubPre = oracionTransformada.toUpperCase().split(/(\s+|[,.?!])/).filter(palabra => palabra.trim() !== '');
                let oracionTraducida = '';
                console.log(palabrasSeparadasConSubPre);
                palabrasSeparadasConSubPre.forEach(palabraSola => {
                    //5) si tengo la traduccion exacta lo coloca sino voy a deducir
                    let siginificado = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == palabraSola);
                    if (siginificado === undefined) {
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
                                if(tienePlural){
                                    oracionTraducida += "KUNA"
                                }
                            } else {
                                //sino buscamos por deduccion
                                console.log("***traduccion plurales " + traduccion);
                                for (let i = 1; i <= 3; i++) {
                                    const palabraRecortada: string = traduccion.substring(0, traduccion.length - i).trim();
                                    console.log("***traduccion plurales palabra " + palabraRecortada);

                                    siginificado = palabras.find(x => x.idioma == "ESPAÑOL" && x.palabra == palabraRecortada);
                                    if (siginificado != undefined) {
                                        console.log("***traduccion sginificado " + siginificado);
                                        existeTraduccion = true;
                                        break;
                                    }
                                }
                                console.log("***Existe Traduccion " + existeTraduccion);
                                if (existeTraduccion) {
                                    oracionTraducida += " " + siginificado?.significado;
                                    if (tienePlural) {
                                        console.log("***Plular traduccion " + siginificado);
                                        oracionTraducida += "KUNA"
                                    }
                                } else {
                                    oracionTraducida += " " + palabraSola;
                                }
                            }
                        } else {
                            //si no es mayor que 3 letras no es posible hallar el siginificado
                            oracionTraducida += " " + palabraSola;
                        }
                    } else {
                        oracionTraducida += " " + siginificado.significado;
                    }
                    console.log("***FINALMENTE" + oracionTraducida);
                    
                });

            });
        }
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
                value={textoTraducido.join('\n')}
                multiline={true}
                numberOfLines={4} // Establece el número de líneas
            />
            <View style={styles.row}>
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
});

export default Traductor;