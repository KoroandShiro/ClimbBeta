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
    ScrollView,
} from 'react-native';
import { register } from '../../services/authService';
import { ApiError } from '../../services/api';

export default function RegisterScreen({ navigation }: any) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        if (!username.trim() || !email.trim() || !password || !confirm) {
            setError('Preenche todos os campos.');
            return;
        }
        if (password !== confirm) {
            setError('As palavras-passe não coincidem.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await register(username.trim(), email.trim(), password);
            navigation.navigate('Login', { registered: true });
        } catch (e) {
            if (e instanceof ApiError && e.status === 400) {
                setError('Email ou nome de utilizador já em uso.');
            } else {
                setError('Não foi possível criar a conta. Tenta novamente.');
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
            <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Junta-te à comunidade ClimbBeta</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="Nome de utilizador"
                    placeholderTextColor="#9E9E9E"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                />
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
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar palavra-passe"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={confirm}
                    onChangeText={setConfirm}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Criar Conta</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Já tens conta? <Text style={styles.linkBold}>Entra aqui</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 15, color: '#777', textAlign: 'center', marginBottom: 32 },
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
