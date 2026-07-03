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

/**
 * Interactive profile management and configuration screen.
 *
 * Orchestrates multi-field state mutations covering personal metrics (height, ape index),
 * biographical text metadata, and deep native image resolution pipelines via Expo APIs
 * paired with multi-part asynchronous asset streaming to object storage buckets.
 */
export default function EditProfileScreen() {
    const navigation = useNavigation<any>();

    const [profile, setProfile] = useState<ClimberProfileWithUserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [apeIndex, setApeIndex] = useState<string>('');

    // Profile photo states
    const [avatarUri, setAvatarUri] = useState<string>('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);

    const [saving, setSaving] = useState(false);

    /**
     * Component mount initializer. Synchronizes remote climber records
     * with the localized inputs, employing memory safety wrappers.
     */
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
                console.error('Error loading profile', err);
                Alert.alert('Error', 'Could not load profile.');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        void load();
        return () => { mounted = false; };
    }, []);

    /**
     * Resolves local OS media assets via the system photo library picker.
     * Evaluates permission grants prior to launching intent instances.
     */
    async function pickImageFromGallery() {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'We need access to your gallery to choose a photo.');
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

    /**
     * Invokes the system hardware camera to ingest raw image captures.
     * Enforces explicit strict square cropping bounding configurations.
     */
    async function takePhotoWithCamera() {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'We need camera access to take a photo.');
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

    /**
     * Processes profile persistence requests.
     * Runs localized technical sanitation steps, converts metrics strings to
     * clean numerical structures, updates entity schemas, and handles multipart
     * file transmissions to MinIO storage backends.
     */
    async function onSave() {
        if (saving) return;

        if (username.trim().length < 3) {
            Alert.alert('Invalid username', 'The username must be at least 3 characters long.');
            return;
        }
        const heightVal = height.trim() === '' ? null : Number(height);
        const normalizedApe = apeIndex.trim().replace(',', '.');
        const apeVal = normalizedApe === '' ? null : Number(normalizedApe);

        if (heightVal != null && (Number.isNaN(heightVal) || heightVal <= 0)) {
            Alert.alert('Invalid height', 'Please enter a valid height in cm.');
            return;
        }
        if (apeVal != null && Number.isNaN(apeVal)) {
            Alert.alert('Invalid Ape Index', 'Please enter a numerical value for ape index.');
            return;
        }

        setSaving(true);
        try {
            // STEP 1: Update text metadata data structures
            await updateMyProfile({
                username: username.trim(),
                bio: bio.trim() === '' ? null : bio.trim(),
                height: heightVal,
                apeIndex: apeVal,
            });

            // STEP 2: Multi-part payload generation for newly selected binaries
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
                    console.log('Photo uploaded successfully to MinIO:', response.avatarUrl);
                } catch (avatarErr) {
                    console.warn('Error uploading photo:', avatarErr);
                    Alert.alert(
                        'Profile Updated',
                        'Your data was saved successfully, but there was a problem processing your new image.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                    return;
                }
            }

            navigation.goBack();
        } catch (err: any) {
            console.error('Error saving profile', err);
            const serverMessage = err?.response?.data?.error;
            Alert.alert('Error saving', serverMessage ?? err?.message ?? 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={{ marginTop: 10, color: '#777' }}>Loading data...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

                {/* Interactive profile photo section */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setIsMenuVisible(true)}>
                        <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
                        <View style={styles.cameraIconBadge}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Tap photo to change</Text>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your username"
                        value={username}
                        onChangeText={setUsername}
                        editable={!saving}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <Text style={styles.value}>{profile?.email ?? ''}</Text>

                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 80 }]}
                        multiline
                        placeholder="Write a bio..."
                        value={bio}
                        onChangeText={setBio}
                        editable={!saving}
                    />

                    <Text style={styles.label}>Height (cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 180"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={(txt) => setHeight(txt.replace(/[^0-9]/g, ''))}
                        editable={!saving}
                    />

                    <Text style={styles.label}>Ape Index (Wingspan ratio)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 1.04"
                        keyboardType="decimal-pad"
                        value={apeIndex}
                        onChangeText={(txt) => setApeIndex(txt.replace(/[^0-9.,]/g, ''))}
                        editable={!saving}
                    />

                    <View style={styles.buttonsRow}>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#9E9E9E' }]}
                            onPress={() => navigation.goBack()}
                            disabled={saving}
                        >
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#2E7D32' }]}
                            onPress={onSave}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* --- Dropdown / Bottom Sheet Modal --- */}
            <Modal visible={isMenuVisible} transparent animationType="slide" onRequestClose={() => setIsMenuVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsMenuVisible(false)}>
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>Profile Photo</Text>

                        <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); setIsFullscreenVisible(true); }}>
                            <Ionicons name="eye-outline" size={22} color="#333" />
                            <Text style={styles.menuItemText}>View full screen photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={takePhotoWithCamera}>
                            <Ionicons name="camera-outline" size={22} color="#333" />
                            <Text style={styles.menuItemText}>Take new photo (Camera)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={pickImageFromGallery}>
                            <Ionicons name="image-outline" size={22} color="#333" />
                            <Text style={styles.menuItemText}>Choose from gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, styles.cancelItem]} onPress={() => setIsMenuVisible(false)}>
                            <Text style={styles.cancelItemText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- Fullscreen Visualization Modal --- */}
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
    container: { flex: 1, backgroundColor: '#EEF3EC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF3EC' },
    avatarContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
    avatarPreview: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', borderWidth: 3, borderColor: '#fff' },
    cameraIconBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#2E7D32', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    avatarHint: { fontSize: 12, color: '#777', marginTop: 8 },
    formSection: { padding: 20, backgroundColor: '#fff', margin: 12, borderRadius: 10 },
    label: { fontSize: 13, color: '#777', marginTop: 10 },
    value: { fontSize: 16, color: '#333', marginTop: 4 },
    input: { width: '100%', borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 8, backgroundColor: '#fff', color: '#333' },
    buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
    btnText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    menuContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 15, textAlign: 'center' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 12 },
    menuItemText: { fontSize: 16, color: '#333' },
    cancelItem: { justifyContent: 'center', borderBottomWidth: 0, marginTop: 10, backgroundColor: '#EEF3EC', borderRadius: 10 },
    cancelItemText: { fontSize: 16, fontWeight: 'bold', color: '#666' },
    fullscreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    fullscreenImage: { width: '100%', height: '80%' },
    closeFullscreenButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
});