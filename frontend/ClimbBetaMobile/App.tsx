// Substitui o App.tsx do teu colega por este:
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, Text, View, Button } from 'react-native';
import RootNavigation from './src/navigation/RootNavigation';
import { loginAndSetToken } from './src/services/authService';

export default function App() {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const init = async () => {
        try {
            setReady(false);
            setError(null);
            const email = process.env.EXPO_PUBLIC_DEV_EMAIL;
            const password = process.env.EXPO_PUBLIC_DEV_PASSWORD;

            if (!email || !password) throw new Error('Faltam credenciais no .env');
            
            await loginAndSetToken(email, password);
            setReady(true);
        } catch (e: any) {
            console.error(e);
            setError(`Erro de Ligação: ${e.message}\nVerifica se o Backend está ligado em ${process.env.EXPO_PUBLIC_API_URL}`);
        }
    };

    useEffect(() => { init(); }, []);

    if (error) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error}</Text>
                <Button title="Tentar Novamente" onPress={init} />
            </View>
        );
    }

    if (!ready) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={{ marginTop: 10 }}>A ligar ao ClimbBeta...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootNavigation />
        </NavigationContainer>
    );
}