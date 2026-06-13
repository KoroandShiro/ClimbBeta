import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';

export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Preenche o email e a palavra-passe.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await login(email.trim(), password);
        } catch (e) {

            console.error("ERRO REAL APANHADO NO LOGIN:", e);

            if (e instanceof ApiError && e.status === 401) {
                setError('Email ou palavra-passe incorretos.');
            } else {
                setError('Não foi possível ligar ao servidor. Tenta novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.inner}>
                <Text style={styles.title}>ClimbBeta</Text>
                <Text style={styles.subtitle}>Entra na tua conta</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9E9E9E"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Palavra-passe"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Entrar</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>Ainda não tens conta? <Text style={styles.linkBold}>Regista-te</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
    title: { fontSize: 36, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 16, color: '#777', textAlign: 'center', marginBottom: 32 },
    error: { color: '#c62828', backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    button: {
        backgroundColor: '#2E7D32',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 20,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link: { textAlign: 'center', color: '#777', fontSize: 14 },
    linkBold: { color: '#2E7D32', fontWeight: 'bold' },
});
