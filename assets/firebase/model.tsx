//TODO: Interfaces genericas reflejo de la base de datos, a ser usados para carga la inf de BD
interface Persona {
    nombre: string;
    apellido: string;
    edad: number
}

interface Palabras {
    codigo: string;
    id: string;
    idioma: string;
    nemotecnico: string;
    palabra: string;
    significado: string;
    tipo: string;
}

interface PrefijosSubfijos {
    idioma: string;
    id: string;
    palabra: string;
}

interface TiposPalabras {
    nombreTipo: string;
    id: string;
    nemotecnico: string;
    codigoktpak: string;
}

interface Estructura {
    Entrada: string;
    Salida: string;
}

