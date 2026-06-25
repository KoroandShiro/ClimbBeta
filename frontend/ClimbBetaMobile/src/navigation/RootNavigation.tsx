import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Import Main Screens
import FeedScreen from '../screens/Home/FeedScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import LogbookEntryScreen from '../screens/Logbook/LogbookEntryScreen';
import LogAscentScreen from '../screens/Logbook/LogAscentScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen'

// Secondary Screens
import IndoorLogScreen from '../screens/Logbook/IndoorLogScreen';
import OutdoorLogScreen from '../screens/Logbook/OutdoorLogScreen';
import GymDetailsScreen from '../screens/Explore/GymDetailsScreen';
import AscentDetailsScreen from '../screens/Home/AscentDetailsScreen';
import UserSearchScreen from '../screens/Home/UserSearchScreen';
import BoulderDetailsScreen from '../screens/Explore/BoulderDetailsScreen';
import MyProjectsScreen from '../screens/Profile/MyProjectsScreen';

// --- AUTH STACK ---
const AuthStack = createNativeStackNavigator();
function AuthStackNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

// --- APP STACKS ---
const Tab = createBottomTabNavigator();

const HomeStack = createNativeStackNavigator();
function HomeStackNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="Feed" component={FeedScreen} options={{ title: 'Community' }} />
            <HomeStack.Screen name="AscentDetails" component={AscentDetailsScreen} options={{ title: 'Ascent Details' }} />
            <HomeStack.Screen name="UserSearch" component={UserSearchScreen} options={{ title: 'Search User' }} />
        </HomeStack.Navigator>
    );
}

const ExploreStack = createNativeStackNavigator();
function ExploreStackNavigator() {
    return (
        <ExploreStack.Navigator>
            <ExploreStack.Screen name="GymList" component={ExploreScreen} options={{ title: 'Gyms' }} />
            <ExploreStack.Screen name="GymDetails" component={GymDetailsScreen} options={{ title: 'Gym Details' }} />
            <ExploreStack.Screen name="BoulderDetails" component={BoulderDetailsScreen} options={{ title: 'Route Statistics' }} />
            <ExploreStack.Screen name="LogAscent" component={LogAscentScreen} options={{ title: 'Log Ascent' }} />
        </ExploreStack.Navigator>
    );
}

const LogbookStack = createNativeStackNavigator();
function LogbookStackNavigator() {
    return (
        <LogbookStack.Navigator>
            <LogbookStack.Screen name="LogEntry" component={LogbookEntryScreen} options={{ title: 'Log Route' }} />
            <LogbookStack.Screen name="IndoorLog" component={IndoorLogScreen} options={{ title: 'Indoor Log' }} />
            <LogbookStack.Screen name="OutdoorLog" component={OutdoorLogScreen} options={{ title: 'Outdoor Log' }} />
        </LogbookStack.Navigator>
    );
}

const ProfileStack = createNativeStackNavigator();
function ProfileStackNavigator() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="MyProfile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
            <ProfileStack.Screen name="MyProjects" component={MyProjectsScreen} options={{ title: 'Saved Projects' }} />

            {/* Shared screens inserted directly into this stack to avoid blocking the Explore tab */}
            <ProfileStack.Screen name="BoulderDetails" component={BoulderDetailsScreen} options={{ title: 'Route Statistics' }} />
            <ProfileStack.Screen name="LogAscent" component={LogAscentScreen} options={{ title: 'Log Ascent' }} />
        </ProfileStack.Navigator>
    );
}

function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
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
            <Tab.Screen name="Explore" component={ExploreStackNavigator} options={{ title: 'Explore' }} />
            <Tab.Screen name="Logbook" component={LogbookStackNavigator} options={{ title: 'Log' }} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

export default function RootNavigation() {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return token ? <AppTabs /> : <AuthStackNavigator />;
}