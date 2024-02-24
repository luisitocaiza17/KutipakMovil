import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Presentacion from './assets/Screems/Presentacion';
import Traductor from './assets/Screems/Traductor';
import { Image,View,Text } from 'react-native'; // Importa Image desde react-native

const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Presentación"
        component={Presentacion}
        options={{
          headerStyle: {
            backgroundColor: '#6256aa',
          },
          headerTintColor: '#fff',
          headerTitleAlign: 'center', // Alinea el título y el logo al centro
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('./assets/images/logo1.png')}
                style={{ width: 250, height: 80, marginRight: 10 }}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="Traductor"
        component={Traductor}
        options={{ title: 'Traductor' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}