import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { logFreelog, uploadMedia } from '../../services/ascentService';

type Mode = 'GYM' | 'ROCK';

/**
 * Hybrid Free Log screen.
 *
 * A single screen with a two-mode toggle that feeds the unified `POST /ascents/freelog` endpoint:
 *  - "GYM"  -> a session at a non-partner gym (stored in the freelog_* columns).
 *  - "ROCK" -> an outdoor climb (reuses/creates an outdoor route).
 *
 * Reuses the project's existing patterns: the attempts counter / style chips from LogAscentScreen,
 * and the expo-image-picker + FormData upload flow from EditProfileScreen.
 */
export default function FreeLogScreen({ route, navigation }: any) {
    const [mode, setMode] = useState<Mode>(route.params?.initialMode === 'ROCK' ? 'ROCK' : 'GYM');

    // Common fields
    const [grade, setGrade] = useState('');
    const [attempts, setAttempts] = useState(1);
    const [style, setStyle] = useState('Flash');
    const [notes, setNotes] = useState('');

    // GYM-only
    const [gymName, setGymName] = useState('');

    // ROCK-only
    const [location, setLocation] = useState('');
    const [sector, setSector] = useState('');
    const [routeName, setRouteName] = useState('');

    // Photo
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Onsight/Flash are first-try sends -> attempts is locked at 1.
    const isFirstTry = style === 'Flash' || style === 'Onsight';

    /** Opens the gallery (permissions checked first), mirroring EditProfileScreen. */
    async function pickFromGallery() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Permission required', 'We need gallery access to attach a photo.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    }

    /** Opens the camera (permissions checked first). */
    async function takePhoto() {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Permission required', 'We need camera access to take a photo.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    }

    /** Builds multipart FormData and uploads the photo to MinIO, returning its public URL. */
    async function uploadPhotoIfAny(): Promise<string | null> {
        if (!photoUri) return null;
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('file', {
            uri: Platform.OS === 'android' ? photoUri : photoUri.replace('file://', ''),
            name: filename,
            type,
        } as any);

        const { url } = await uploadMedia(formData);
        return url;
    }

    /** Client-side validation aligned with the backend rules, then submits. */
    async function handleSubmit() {
        if (!grade.trim()) {
            Alert.alert('Missing grade', 'Please enter the grade.');
            return;
        }
        if (mode === 'GYM' && !gymName.trim()) {
            Alert.alert('Missing gym name', 'Please enter the gym name.');
            return;
        }
        if (mode === 'ROCK' && (!location.trim() || !sector.trim())) {
            Alert.alert('Missing fields', 'Outdoor logs need both Crag/Location and Sector.');
            return;
        }

        try {
            setIsLoading(true);
            const mediaUrl = await uploadPhotoIfAny();
            const today = new Date().toISOString().split('T')[0];

            await logFreelog({
                mode,
                grade: grade.trim(),
                freelogGymName: mode === 'GYM' ? gymName.trim() : null,
                location: mode === 'ROCK' ? location.trim() : null,
                sector: mode === 'ROCK' ? sector.trim() : null,
                routeName: mode === 'ROCK' && routeName.trim() ? routeName.trim() : null,
                date: today,
                attempts,
                style,
                notes: notes.trim() ? notes.trim() : null,
                mediaUrl,
            });

            Alert.alert('Logged!', 'Your ascent is in the logbook. 🧗', [
                { text: 'Nice!', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            Alert.alert('Could not save', err?.message ?? 'Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Free Log</Text>

                {/* Mode toggle (segmented control built from TouchableOpacity, no extra lib) */}
                <View style={styles.toggle}>
                    {([['GYM', '🏢 Non-partner Gym'], ['ROCK', '⛰️ Outdoor Rock']] as [Mode, string][]).map(([m, label]) => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
                            onPress={() => setMode(m)}
                        >
                            <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Mode-specific fields */}
                {mode === 'GYM' ? (
                    <View style={styles.section}>
                        <Text style={styles.label}>Gym name</Text>
                        <TextInput style={styles.input} placeholder="e.g., Vertigo, 9.8 Gravity..." value={gymName} onChangeText={setGymName} />
                    </View>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.label}>Crag / Location</Text>
                            <TextInput style={styles.input} placeholder="e.g., Sintra" value={location} onChangeText={setLocation} />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Sector</Text>
                            <TextInput style={styles.input} placeholder="e.g., Peninha" value={sector} onChangeText={setSector} />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Route name (optional)</Text>
                            <TextInput style={styles.input} placeholder="e.g., The Big Roof" value={routeName} onChangeText={setRouteName} />
                        </View>
                    </>
                )}

                {/* Grade (both modes) */}
                <View style={styles.section}>
                    <Text style={styles.label}>Grade</Text>
                    <TextInput style={styles.input} placeholder="e.g., 7a, V6, Blue..." value={grade} onChangeText={setGrade} />
                </View>

                {/* Attempts counter (from LogAscentScreen) */}
                <View style={styles.section}>
                    <Text style={styles.label}>Attempts</Text>
                    <View style={styles.counterRow}>
                        <TouchableOpacity style={[styles.circleBtn, isFirstTry && styles.circleBtnDisabled]} disabled={isFirstTry} onPress={() => setAttempts(Math.max(1, attempts - 1))}>
                            <Ionicons name="remove" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.counterText}>{attempts}</Text>
                        <TouchableOpacity style={[styles.circleBtn, isFirstTry && styles.circleBtnDisabled]} disabled={isFirstTry} onPress={() => setAttempts(attempts + 1)}>
                            <Ionicons name="add" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Style chips */}
                <View style={styles.section}>
                    <Text style={styles.label}>Style</Text>
                    <View style={styles.styleRow}>
                        {['Onsight', 'Flash', 'Top'].map((s) => (
                            <TouchableOpacity key={s} style={[styles.chip, style === s && styles.chipActive]} onPress={() => { setStyle(s); if (s === 'Flash' || s === 'Onsight') setAttempts(1); }}>
                                <Text style={[styles.chipText, style === s && styles.chipTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.label}>Notes (optional)</Text>
                    <TextInput style={styles.textArea} placeholder="Beta, conditions, how it felt..." multiline value={notes} onChangeText={setNotes} />
                </View>

                {/* Photo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Photo (optional)</Text>
                    {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />}
                    <View style={styles.photoRow}>
                        <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
                            <Ionicons name="image-outline" size={20} color="#2E7D32" />
                            <Text style={styles.photoBtnText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={20} color="#2E7D32" />
                            <Text style={styles.photoBtnText}>Camera</Text>
                        </TouchableOpacity>
                        {photoUri && (
                            <TouchableOpacity style={styles.photoBtn} onPress={() => setPhotoUri(null)}>
                                <Ionicons name="trash-outline" size={20} color="#c62828" />
                                <Text style={[styles.photoBtnText, { color: '#c62828' }]}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save to Logbook</Text>}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EEF3EC' },
    scroll: { padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
    toggle: { flexDirection: 'row', backgroundColor: '#e8e8e8', borderRadius: 10, padding: 4, marginBottom: 20 },
    toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    toggleBtnActive: { backgroundColor: '#2E7D32' },
    toggleText: { color: '#555', fontWeight: '600', fontSize: 13 },
    toggleTextActive: { color: '#fff' },
    section: { marginBottom: 18 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
    counterRow: { flexDirection: 'row', alignItems: 'center' },
    circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
    circleBtnDisabled: { opacity: 0.35 },
    counterText: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 20, minWidth: 30, textAlign: 'center' },
    styleRow: { flexDirection: 'row', justifyContent: 'space-between' },
    chip: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginHorizontal: 3, alignItems: 'center' },
    chipActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    chipText: { color: '#666', fontWeight: '500', fontSize: 13 },
    chipTextActive: { color: '#fff', fontWeight: 'bold' },
    textArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, height: 90, textAlignVertical: 'top' },
    preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10, backgroundColor: '#eee' },
    photoRow: { flexDirection: 'row', gap: 10 },
    photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
    photoBtnText: { color: '#2E7D32', fontWeight: '600' },
    saveBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
