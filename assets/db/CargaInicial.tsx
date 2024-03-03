import dataPalabrasJson from "./Palabras";
import dataPrefijosSubfijoJson from "./PrefijosSubfijos";
import dataTiposPalabrasJson from "./TipoPalabra";
import dataEstructura from "./Estructura";

const palabras: Palabras[] = JSON.parse(dataPalabrasJson);
const prefijosSubfijos: PrefijosSubfijos[] = JSON.parse(dataPrefijosSubfijoJson);
const tiposPalabras: TiposPalabras[] = JSON.parse(dataTiposPalabrasJson);
const estructura: Estructura[] = JSON.parse(dataEstructura);

export { palabras, prefijosSubfijos, tiposPalabras,estructura };