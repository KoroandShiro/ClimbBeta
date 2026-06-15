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
    Image,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getMyProfile, updateMyProfile, uploadMyAvatar, ClimberProfileWithUserDTO } from '../../services/profileService';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileScreen() {
    const navigation = useNavigation<any>();

    const [profile, setProfile] = useState<ClimberProfileWithUserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [apeIndex, setApeIndex] = useState<string>('');

    // Estados para a foto de perfil
    const [avatarUri, setAvatarUri] = useState<string>('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);

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
                if (p.avatarUrl) {
                    setAvatarUri(p.avatarUrl);
                }
            } catch (err: any) {
                console.error('Erro a carregar perfil', err);
                Alert.alert('Erro', 'Não foi possível carregar o perfil.');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        void load();
        return () => { mounted = false; };
    }, []);

    // --- FUNÇÕES PARA FOTO (CÂMARA E GALERIA) ---
    async function pickImageFromGallery() {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à tua galeria para escolher uma foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            setIsMenuVisible(false);
        }
    }

    async function takePhotoWithCamera() {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à câmara para tirar uma foto.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            setIsMenuVisible(false);
        }
    }

    async function onSave() {
        if (saving) return; // Otimização 1: Curto-circuito contra cliques em duplicado

        if (username.trim().length < 3) {
            Alert.alert('Nome de utilizador inválido', 'O nome de utilizador deve ter pelo menos 3 caracteres.');
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
            // PASSO 1: Atualizar dados de texto
            await updateMyProfile({
                username: username.trim(),
                bio: bio.trim() === '' ? null : bio.trim(),
                height: heightVal,
                apeIndex: apeVal,
            });

            // PASSO 2: Se o utilizador escolheu uma foto nova
            if (avatarUri.startsWith('file:') || avatarUri.startsWith('content:')) {
                const filename = avatarUri.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                const formData = new FormData();
                formData.append('file', {
                    uri: Platform.OS === 'android' ? avatarUri : avatarUri.replace('file://', ''),
                    name: filename,
                    type,
                } as any);

                try {
                    const response = await uploadMyAvatar(formData);
                    console.log('Foto enviada com sucesso para o MinIO:', response.avatarUrl);
                } catch (avatarErr) {
                    console.warn('Erro no upload da foto:', avatarErr);
                    // Otimização 2: Alerta contextual caso apenas a imagem falhe
                    Alert.alert(
                        'Perfil Atualizado',
                        'Os teus dados foram guardados com sucesso, mas ocorreu um problema ao processar a tua nova imagem.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                    return;
                }
            }

            navigation.goBack();
        } catch (err: any) {
            console.error('Erro ao guardar perfil', err);
            const serverMessage = err?.response?.data?.error;
            Alert.alert('Erro ao guardar', serverMessage ?? err?.message ?? 'Falha ao guardar perfil.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={{ marginTop: 10, color: '#777' }}>A carregar dados...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

                {/* Secção da foto de perfil interativa */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setIsMenuVisible(true)}>
                        <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
                        <View style={styles.cameraIconBadge}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Toca na foto para alterar</Text>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Nome de utilizador</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="O teu nome de utilizador"
                        value={username}
                        onChangeText={setUsername}
                        editable={!saving}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Correio eletrónico</Text>
                    <Text style={styles.value}>{profile?.email ?? ''}</Text>

                    <Text style={styles.label}>Biografia</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 80 }]}
                        multiline
                        placeholder="Escreve uma biografia..."
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
                        // Otimização 3: Bloqueia caracteres não numéricos em tempo real
                        onChangeText={(txt) => setHeight(txt.replace(/[^0-9]/g, ''))}
                        editable={!saving}
                    />

                    <Text style={styles.label}>Relação de envergadura (*Ape Index*)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 1.04"
                        keyboardType="decimal-pad"
                        value={apeIndex}
                        // Otimização 3: Permite apenas dígitos, pontos e vírgulas
                        onChangeText={(txt) => setApeIndex(txt.replace(/[^0-9.,]/g, ''))}
                        editable={!saving}
                    />

                    <View style={styles.buttonsRow}>
                        {/* Cancelar agora fica à ESQUERDA */}
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#9E9E9E' }]}
                            onPress={() => navigation.goBack()}
                            disabled={saving}
                        >
                            <Text style={styles.btnText}>Cancelar</Text>
                        </TouchableOpacity>

                        {/* Guardar agora fica à DIREITA */}
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#2E7D32' }]}
                            onPress={onSave}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* --- Janela flutuante (*Dropdown* / *Bottom Sheet*) --- */}
            <Modal visible={isMenuVisible} transparent animationType="slide" onRequestClose={() => setIsMenuVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsMenuVisible(false)}>
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>Foto de perfil</Text>

                        <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); setIsFullscreenVisible(true); }}>
                            <Ionicons name="eye-outline" size={22} color="#333" />
                            <Text style={styles.menuItemText}>Ver foto em ponto grande</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={takePhotoWithCamera}>
                            <Ionicons name="camera-outline" size={22} color="#333" />
                            <Text style={styles.menuItemText}>Tirar foto nova (Câmara)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={pickImageFromGallery}>
                            <Ionicons name="image-outline" size={22} color="#333" />
                            <Text style={styles.menuItemText}>Escolher da galeria</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, styles.cancelItem]} onPress={() => setIsMenuVisible(false)}>
                            <Text style={styles.cancelItemText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- Visualização em ecrã inteiro (*Fullscreen*) --- */}
            <Modal visible={isFullscreenVisible} transparent animationType="fade" onRequestClose={() => setIsFullscreenVisible(false)}>
                <View style={styles.fullscreenContainer}>
                    <TouchableOpacity style={styles.closeFullscreenButton} onPress={() => setIsFullscreenVisible(false)}>
                        <Ionicons name="close-circle" size={36} color="#fff" />
                    </TouchableOpacity>
                    <Image source={{ uri: avatarUri }} style={styles.fullscreenImage} resizeMode="contain" />
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },

    // Estilos do avatar
    avatarContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
    avatarPreview: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', borderWidth: 3, borderColor: '#fff' },
    cameraIconBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#2E7D32', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    avatarHint: { fontSize: 12, color: '#777', marginTop: 8 },

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

    // Estilos da janela flutuante
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    menuContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 15, textAlign: 'center' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 12 },
    menuItemText: { fontSize: 16, color: '#333' },
    cancelItem: { justifyContent: 'center', borderBottomWidth: 0, marginTop: 10, backgroundColor: '#f5f5f5', borderRadius: 10 },
    cancelItemText: { fontSize: 16, fontWeight: 'bold', color: '#666' },

    // Estilos de ecrã inteiro
    fullscreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    fullscreenImage: { width: '100%', height: '80%' },
    closeFullscreenButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
});