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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { colors, radius } from '../../theme';

/**
 * Sign-in screen. Validates local input before dispatching the auth request,
 * and keeps a generic 401 message so it never reveals which field was wrong.
 */
export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Please fill in both email and password.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await login(email.trim(), password);
        } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
                setError('Incorrect email or password.');
            } else {
                setError('Could not connect to the server. Please try again.');
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
                <View style={styles.brand}>
                    <Text style={styles.logo}>🧗</Text>
                    <Text style={styles.wordmark}>ClimbBeta</Text>
                </View>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Log into your account</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="you@email.com"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrap}>
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Your password"
                        placeholderTextColor={colors.placeholder}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword((v) => !v)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>
                        Don't have an account yet? <Text style={styles.linkBold}>Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.page },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
    brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 },
    logo: { fontSize: 30 },
    wordmark: { fontSize: 26, fontWeight: 'bold', color: colors.primary, letterSpacing: -0.5 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 28 },
    error: { color: colors.danger, backgroundColor: colors.dangerBg, padding: 12, borderRadius: radius.sm, marginBottom: 16, textAlign: 'center', fontWeight: '500' },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
    input: { backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text, marginBottom: 16, borderWidth: 1, borderColor: colors.borderStrong },
    passwordWrap: { position: 'relative', justifyContent: 'center', marginBottom: 16 },
    passwordInput: { marginBottom: 0, paddingRight: 48 },
    eyeBtn: { position: 'absolute', right: 4, top: 0, bottom: 0, width: 44, alignItems: 'center', justifyContent: 'center' },
    button: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center', marginTop: 4, marginBottom: 22 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
    linkBold: { color: colors.primary, fontWeight: 'bold' },
});
