/**
 * @file App.tsx
 * @description Entry point for the mobile app (Expo). Sets up providers and root navigation.
 *
 * Observações:
 *  - Mantém compatibilidade com Expo runtime.
 *  - Não coloque lógica pesada aqui; use contexts/services.
 *
 * Testes relacionados:
 *  - frontend/ClimbBetaMobile/src/__tests__/navigation/rootNavigation.test.tsx
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigation from './src/navigation/RootNavigation';

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <RootNavigation />
            </NavigationContainer>
        </AuthProvider>
    );
}
