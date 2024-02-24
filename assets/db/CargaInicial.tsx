import dataPalabrasJson from "./Palabras";
import dataPrefijosSubfijoJson from "./PrefijosSubfijos";
import dataTiposPalabrasJson from "./TipoPalabra";

const palabras: Palabras[] = JSON.parse(dataPalabrasJson);
const prefijosSubfijos: PrefijosSubfijos[] = JSON.parse(dataPrefijosSubfijoJson);
const tiposPalabras: TiposPalabras[] = JSON.parse(dataTiposPalabrasJson);

export { palabras, prefijosSubfijos, tiposPalabras };