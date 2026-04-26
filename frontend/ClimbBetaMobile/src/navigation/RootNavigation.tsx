import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Importar os Ecrãs Principais
import FeedScreen from '../screens/Home/FeedScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import LogbookEntryScreen from '../screens/Logbook/LogbookEntryScreen';
import LogAscentScreen from '../screens/Logbook/LogAscentScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// Ecrãs Secundários (Mockups genéricos para testes)
import GenericDetailsScreen from '../screens/GenericDetailsScreen'; 
import IndoorLogScreen from '../screens/Logbook/IndoorLogScreen';
import OutdoorLogScreen from '../screens/Logbook/OutdoorLogScreen';
import GymDetailsScreen from '../screens/Explore/GymDetailsScreen';
import AscentDetailsScreen from '../screens/Home/AscentDetailsScreen';
import UserSearchScreen from '../screens/Home/UserSearchScreen';
import BoulderDetailsScreen from '../screens/Explore/BoulderDetailsScreen';
import MyProjectsScreen from '../screens/Profile/MyProjectsScreen';

const Tab = createBottomTabNavigator();

// --- STACKS (Pilhas de Ecrãs) ---
const HomeStack = createNativeStackNavigator();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Feed" component={FeedScreen} options={{ title: 'Comunidade' }} />
      <HomeStack.Screen name="AscentDetails" component={AscentDetailsScreen} options={{ title: 'Detalhes da Subida' }} />
      <HomeStack.Screen name="UserSearch" component={UserSearchScreen} options={{ title: 'Procurar Utilizador' }} />
    </HomeStack.Navigator>
  );
}

const ExploreStack = createNativeStackNavigator();
function ExploreStackNavigator() {
  return (
    <ExploreStack.Navigator>
      <ExploreStack.Screen name="GymList" component={ExploreScreen} options={{ title: 'Ginásios' }} />
      <ExploreStack.Screen name="GymDetails" component={GymDetailsScreen} options={{ title: 'Detalhes do Ginásio' }} />
      <ExploreStack.Screen name="BoulderDetails" component={BoulderDetailsScreen} options={{ title: 'Estatísticas da Via' }} />
    </ExploreStack.Navigator>
  );
}

const LogbookStack = createNativeStackNavigator();
function LogbookStackNavigator() {
  return (
    <LogbookStack.Navigator>
      <LogbookStack.Screen name="LogEntry" component={LogbookEntryScreen} options={{ title: 'Registar Via' }} />
      <LogbookStack.Screen name="IndoorLog" component={IndoorLogScreen} options={{ title: 'Registo Indoor' }} />
      <LogbookStack.Screen name="OutdoorLog" component={OutdoorLogScreen} options={{ title: 'Registo Outdoor' }} />
      <LogbookStack.Screen name="LogAscent" component={LogAscentScreen} options={{ title: 'Registar Subida' }} />
    </LogbookStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="MyProfile" component={ProfileScreen} options={{ title: 'O Meu Perfil' }} />
      <ProfileStack.Screen name="MyProjects" component={MyProjectsScreen} options={{ title: 'Projetos Guardados' }} />
    </ProfileStack.Navigator>
  );
}

// --- TABS (O Menu de Baixo) ---
export default function RootNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Esconde o header da Tab porque o Stack já tem o seu
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Explore') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Logbook') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#9E9E9E',
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Feed' }} />
      <Tab.Screen name="Explore" component={ExploreStackNavigator} options={{ title: 'Explorar' }} />
      <Tab.Screen name="Logbook" component={LogbookStackNavigator} options={{ title: 'Registar' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}