import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, Text, View } from 'react-native';
import RootNavigation from './src/navigation/RootNavigation';
import { loginAndSetToken } from './src/services/authService';

export default function App() {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const email = process.env.EXPO_PUBLIC_DEV_EMAIL;
                const password = process.env.EXPO_PUBLIC_DEV_PASSWORD;

                if (!email || !password) throw new Error('Faltam variáveis de ambiente de login dev.');
                await loginAndSetToken(email, password);
            } catch (e: any) {
                setError(e?.message ?? 'Falha no login de desenvolvimento.');
            } finally {
                setReady(true);
            }
        };

        init();
    }, []);

    if (!ready) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={{ marginTop: 8 }}>A iniciar sessão...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text style={{ color: '#B00020', textAlign: 'center' }}>{error}</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootNavigation />
        </NavigationContainer>
    );
}
