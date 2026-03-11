import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import AddBoulderScreen from './src/screens/AddBoulderScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home:       { active: 'home',        inactive: 'home-outline' },
  Search:     { active: 'search',      inactive: 'search-outline' },
  Add:        { active: 'add-circle',  inactive: 'add-circle-outline' },
  Favorites:  { active: 'heart',       inactive: 'heart-outline' },
  Profile:    { active: 'person',      inactive: 'person-outline' },
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.active : icons.inactive;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            height: 75,
            paddingBottom: 12,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            includeFontPadding: false,
          },
          tabBarItemStyle: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: 'Home' }} />
        <Tab.Screen name="Search"    component={SearchScreen}    options={{ title: 'Search' }} />
        <Tab.Screen name="Add"       component={AddBoulderScreen} options={{ title: 'Add Boulder' }} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorites' }} />
        <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
