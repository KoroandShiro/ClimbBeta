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

/**
 * Onboarding registration portal setup tracking account allocations.
 * Dispatches raw details to initialize base DB profile maps upstream.
 */
export default function RegisterScreen({ navigation }: any) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Asserts internal password equivalence matrices and requests account provision procedures.
     * Automatically pipes users backward into the [LoginScreen] track upon successful creations.
     */
    const handleRegister = async () => {
        if (!username.trim() || !email.trim() || !password || !confirm) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await register(username.trim(), email.trim(), password);
            navigation.navigate('Login', { registered: true });
        } catch (e) {
            if (e instanceof ApiError && e.status === 400) {
                setError('Email or username already in use.');
            } else {
                setError('Could not create account. Please try again.');
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the ClimbBeta community</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="Username"
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
                    placeholder="Password"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={confirm}
                    onChangeText={setConfirm}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Create Account</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Log in here</Text></Text>
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