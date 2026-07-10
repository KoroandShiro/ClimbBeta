/**
 * @file RegisterScreen.tsx
 * @description Ecrã de registo de utilizador na app mobile.
 *
 * Testes:
 *  - src/__tests__/screens/Auth/registerScreen.test.tsx
 */
import React, { useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { register } from '../../services/authService';
import { ApiError } from '../../services/api';
import { colors, radius } from '../../theme';

// Mirrors the server-side password policy in UserService.validatePasswordStrength.
const PASSWORD_RULES = [
    { label: '8 to 64 characters', test: (p: string) => p.length >= 8 && p.length <= 64 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One symbol', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
];

/**
 * Registration screen. Shows a live password checklist that mirrors the backend
 * policy and only enables the button once the password is valid and confirmed.
 */
export default function RegisterScreen({ navigation }: any) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ruleResults = useMemo(
        () => PASSWORD_RULES.map((r) => ({ label: r.label, ok: r.test(password) })),
        [password]
    );
    const passwordValid = ruleResults.every((r) => r.ok);
    const passwordsMatch = confirm.length > 0 && password === confirm;
    const canSubmit =
        username.trim() !== '' && email.trim() !== '' && passwordValid && passwordsMatch && !loading;

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
            if (e instanceof ApiError) {
                // Show the real backend message instead of a generic guess.
                setError(e.message);
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
                <View style={styles.brand}>
                    <Text style={styles.logo}>🧗</Text>
                    <Text style={styles.wordmark}>ClimbBeta</Text>
                </View>
                <Text style={styles.title}>Create your account</Text>
                <Text style={styles.subtitle}>Join the ClimbBeta community</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                />

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
                        placeholder="Create a strong password"
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

                <View style={styles.checklist}>
                    {ruleResults.map((r) => (
                        <View key={r.label} style={styles.checkRow}>
                            <Ionicons
                                name={r.ok ? 'checkmark-circle' : 'ellipse-outline'}
                                size={16}
                                color={r.ok ? colors.success : colors.placeholder}
                            />
                            <Text style={[styles.checkText, r.ok && styles.checkTextOk]}>{r.label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.label}>Confirm password</Text>
                <View style={styles.passwordWrap}>
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Repeat your password"
                        placeholderTextColor={colors.placeholder}
                        secureTextEntry={!showConfirm}
                        value={confirm}
                        onChangeText={setConfirm}
                    />
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowConfirm((v) => !v)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
                {confirm.length > 0 && !passwordsMatch && (
                    <Text style={styles.mismatch}>Passwords do not match.</Text>
                )}

                <TouchableOpacity
                    style={[styles.button, !canSubmit && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={!canSubmit}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>
                        Already have an account? <Text style={styles.linkBold}>Log in here</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.page },
    inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
    brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 },
    logo: { fontSize: 28 },
    wordmark: { fontSize: 24, fontWeight: 'bold', color: colors.primary, letterSpacing: -0.5 },
    title: { fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
    error: { color: colors.danger, backgroundColor: colors.dangerBg, padding: 12, borderRadius: radius.sm, marginBottom: 16, textAlign: 'center', fontWeight: '500' },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
    input: { backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text, marginBottom: 16, borderWidth: 1, borderColor: colors.borderStrong },
    passwordWrap: { position: 'relative', justifyContent: 'center', marginBottom: 16 },
    passwordInput: { marginBottom: 0, paddingRight: 48 },
    eyeBtn: { position: 'absolute', right: 4, top: 0, bottom: 0, width: 44, alignItems: 'center', justifyContent: 'center' },
    checklist: { marginBottom: 14, gap: 6 },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkText: { fontSize: 13, color: colors.textMuted },
    checkTextOk: { color: colors.success },
    mismatch: { color: colors.danger, fontSize: 13, marginTop: 4, marginBottom: 10 },
    button: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center', marginTop: 6, marginBottom: 20 },
    buttonDisabled: { opacity: 0.55 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
    linkBold: { color: colors.primary, fontWeight: 'bold' },
});
