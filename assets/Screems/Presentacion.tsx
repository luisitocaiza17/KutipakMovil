import React from "react";
import { View, Text, Button, Image, Dimensions, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
//TODO: PANTALLA PRINCIPAL que contiene elementos de navegacion y presentacion
interface Props {
    navigation: NavigationProp<any>;
}

const Presentacion: React.FC<Props> = ({ navigation }) => {
    const llamarData = async () => {
        alert('Hola mundo');
    }
    const windowWidth = Dimensions.get('window').width;//tamaño de la pantalla adaptable para la imagen de fondo
    const windowHeight = Dimensions.get('window').height;//tamaño de la pantalla adaptable para la imagen de fondo 
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Image
                source={require('../images/5.jpg')}
                style={{ width: windowWidth, height: windowHeight }}
                resizeMode="cover"
            />
            <Text
                style={{
                    position: 'absolute',
                    padding: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    left: windowWidth / 18,
                    top: windowHeight / 3,
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold'
                }}>TRADUCTOR</Text>
            <Text
                style={{
                    position: 'absolute',
                    padding: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    left: windowWidth / 2.5,
                    top: windowHeight / 3,
                    fontSize: 20,
                    color: '#2596be',
                    fontWeight: 'bold'
                }}>ESPAÑOL - KITCHWA</Text>
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    backgroundColor: '#2596be',
                    borderRadius: 10,
                    padding: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    left: windowWidth / 3,
                    top: windowHeight / 2.4,
                }}
                onPress={() => navigation.navigate('Traductor')}
            >
                {/* al ahcer clic lleva a la pantalla de traduccion */}
                <Text style={{ color: 'white', fontSize: 18 }}>IR A TRADUCTOR</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Presentacion;
