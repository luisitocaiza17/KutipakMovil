import dataPalabrasJson from "./Palabras";
import dataPrefijosSubfijoJson from "./PrefijosSubfijos";
import dataTiposPalabrasJson from "./TipoPalabra";
import dataEstructura from "./Estructura";
//TODO: Clase que carga los datos localmente, a ser usados en caso de que no se pueda tener coneccion con el servidor firebase
let palabras: Palabras[] = JSON.parse(dataPalabrasJson);
let prefijosSubfijos: PrefijosSubfijos[] = JSON.parse(dataPrefijosSubfijoJson);
let tiposPalabras: TiposPalabras[] = JSON.parse(dataTiposPalabrasJson);
let estructura: Estructura[] = JSON.parse(dataEstructura);
//Metodos para actualizar datos en caso que si responda firebase
const actualizarPrefijosSubfijos = (nuevosDatos: PrefijosSubfijos[]) => {
    prefijosSubfijos = nuevosDatos;
};
const actualizarEstructura = (nuevosDatos: Estructura[]) => {
    estructura = nuevosDatos;
};
const actualizarPalabras = (nuevosDatos: Palabras[]) => {
    palabras = nuevosDatos;
};

export { palabras, prefijosSubfijos, tiposPalabras, estructura, actualizarPrefijosSubfijos, actualizarEstructura, actualizarPalabras };