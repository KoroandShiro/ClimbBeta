import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import FeedScreen from '../screens/Home/FeedScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import LogbookEntryScreen from '../screens/Logbook/LogbookEntryScreen';
import LogAscentScreen from '../screens/Logbook/LogAscentScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import FreeLogScreen from '../screens/Logbook/FreeLogScreen';
import GymDetailsScreen from '../screens/Explore/GymDetailsScreen';
import AscentDetailsScreen from '../screens/Home/AscentDetailsScreen';
import UserSearchScreen from '../screens/Home/UserSearchScreen';
import BoulderDetailsScreen from '../screens/Explore/BoulderDetailsScreen';
import MyProjectsScreen from '../screens/Profile/MyProjectsScreen';
import FollowListScreen from '../screens/Profile/FollowListScreen';

const AuthStack = createNativeStackNavigator();

/**
 * Isolated authentication navigation stack processing unverified sessions.
 */
function AuthStackNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

const HomeStack = createNativeStackNavigator();

/**
 * Navigation wrapper for the primary community landing tab maps.
 */
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

/**
 * Navigation wrapper handling global facility search mappings and indoor statistics subviews.
 */
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

/**
 * Entry portal stacks splitting paths between manual indoor logs and raw outdoor crag updates.
 */
function LogbookStackNavigator() {
    return (
        <LogbookStack.Navigator>
            <LogbookStack.Screen name="LogEntry" component={LogbookEntryScreen} options={{ title: 'Log Route' }} />
            <LogbookStack.Screen name="FreeLog" component={FreeLogScreen} options={{ title: 'Free Log' }} />
        </LogbookStack.Navigator>
    );
}

const ProfileStack = createNativeStackNavigator();

/**
 * User metrics deck dashboard stack handling personal settings overrides and saved target metrics lists.
 */
function ProfileStackNavigator() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="MyProfile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
            <ProfileStack.Screen name="MyProjects" component={MyProjectsScreen} options={{ title: 'Saved Projects' }} />
            <ProfileStack.Screen name="FollowList" component={FollowListScreen} options={{ title: 'Connections' }} />
            <ProfileStack.Screen name="BoulderDetails" component={BoulderDetailsScreen} options={{ title: 'Route Statistics' }} />
            <ProfileStack.Screen name="LogAscent" component={LogAscentScreen} options={{ title: 'Log Ascent' }} />
        </ProfileStack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

/**
 * Core UI layout wrapper mapping container frames for primary dashboard activities.
 */
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

/**
 * Critical Gateway Router for the mobile architecture hierarchy.
 * Evaluates context tokens dynamically to branch between public [AuthStackNavigator] maps
 * and authenticated [AppTabs] dashboards.
 */
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