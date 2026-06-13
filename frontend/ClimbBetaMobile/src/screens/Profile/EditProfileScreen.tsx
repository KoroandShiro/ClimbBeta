// frontend/ClimbBetaMobile/src/screens/Profile/EditProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMyProfile, updateMyProfile, ClimberProfileWithUserDTO } from '../../services/profileService';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileScreen() {
    const navigation = useNavigation<any>();

    const [profile, setProfile] = useState<ClimberProfileWithUserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [apeIndex, setApeIndex] = useState<string>('');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const p = await getMyProfile();
                if (!mounted) return;
                setProfile(p);
                setUsername(p.username ?? '');
                setBio(p.bio ?? '');
                setHeight(p.height != null ? String(p.height) : '');
                setApeIndex(p.apeIndex != null ? String(p.apeIndex) : '');
            } catch (err: any) {
                console.error('Erro a carregar perfil', err);
                Alert.alert('Erro', 'Não foi possível carregar o perfil.');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    async function onSave() {
        // --- VALIDAÇÃO DO USERNAME ---
        if (username.trim().length < 3) {
            Alert.alert('Username inválido', 'O username deve ter pelo menos 3 caracteres.');
            return;
        }
        const heightVal = height.trim() === '' ? null : Number(height);
        const normalizedApe = apeIndex.trim().replace(',', '.');
        const apeVal = normalizedApe === '' ? null : Number(normalizedApe);

        if (heightVal != null && (Number.isNaN(heightVal) || heightVal <= 0)) {
            Alert.alert('Altura inválida', 'Introduz uma altura válida em cm.');
            return;
        }
        if (apeVal != null && Number.isNaN(apeVal)) {
            Alert.alert('Ape Index inválido', 'Introduz um valor numérico para ape index.');
            return;
        }

        setSaving(true);
        try {
            await updateMyProfile({
                username: username.trim(),
                bio: bio.trim() === '' ? null : bio.trim(),
                height: heightVal,
                apeIndex: apeVal,
            });

            // Ao voltar, o ProfileScreen tem useFocusEffect que fará refetch automático,
            // por isso aqui fazemos apenas navigation.goBack()
            navigation.goBack();
        } catch (err: any) {
            console.error('Erro ao guardar perfil', err);

            // Procura a mensagem de erro específica enviada pelo Spring Boot (400 Bad Request)
            const serverMessage = err?.response?.data?.error;

            Alert.alert(
                'Erro ao guardar',
                serverMessage ?? err?.message ?? 'Falha ao guardar perfil.'
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.formSection}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="O teu nome de utilizador"
                        value={username}
                        onChangeText={setUsername}
                        editable={!saving}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{profile?.email ?? ''}</Text>

                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 80 }]}
                        multiline
                        placeholder="Escreve uma bio..."
                        value={bio}
                        onChangeText={setBio}
                        editable={!saving}
                    />

                    <Text style={styles.label}>Altura (cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 180"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                        editable={!saving}
                    />

                    <Text style={styles.label}>Ape Index</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 1.04"
                        keyboardType="decimal-pad"
                        value={apeIndex}
                        onChangeText={setApeIndex}
                        editable={!saving}
                    />

                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2E7D32' }]} onPress={onSave} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#9E9E9E' }]} onPress={() => navigation.goBack()} disabled={saving}>
                            <Text style={styles.btnText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    formSection: { padding: 20, backgroundColor: '#fff', margin: 12, borderRadius: 10 },
    label: { fontSize: 13, color: '#777', marginTop: 10 },
    value: { fontSize: 16, color: '#333', marginTop: 4 },

    input: {
        width: '100%',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
        backgroundColor: '#fff',
        color: '#333',
    },

    buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
    btnText: { color: '#fff', fontWeight: 'bold' },
});
