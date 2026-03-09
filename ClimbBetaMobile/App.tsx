import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importar os teus ecrãs
import HomeScreen from './src/screens/HomeScreen';
import LogbookScreen from './src/screens/LogbookScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Feed' }} />
        <Tab.Screen name="Logbook" component={LogbookScreen} options={{ title: 'Registar Via' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil2' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}