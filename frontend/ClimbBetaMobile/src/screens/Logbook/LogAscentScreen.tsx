import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logAscent } from '../../services/ascentService';

/**
 * Structured ascent ingestion logger.
 *
 * Connects directly to verified in-house gym boulders (`boulderId`) to record
 * performance parameters, track technical ascent style metrics, and increment total attempts counts.
 */
export default function LogAscentScreen({ route, navigation }: any) {
    const boulderId = route.params?.boulderId;
    const boulderColor = route.params?.boulderColor || 'This Boulder';

    const [attempts, setAttempts] = useState(1);
    const [style, setStyle] = useState('Top'); // Flash, Onsight, Top
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Submits technical climb data payloads to the API layer.
     * Gracefully falls back to UI messaging alerts upon intercepting unexpected service failures.
     */
    const handleSave = async () => {
        try {
            setIsLoading(true);
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD standard formatting

            await logAscent({
                boulderId: boulderId,
                date: today,
                attempts: attempts,
                style: style,
                notes: notes,
            });

            Alert.alert("Success!", "Ascent successfully logged in your Logbook! 🧗‍♂️", [
                { text: "Awesome!", onPress: () => navigation.goBack() } // Clean context pop to previous view
            ]);
        } catch (error: any) {
            Alert.alert("Error saving", error.message || "Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Log Ascent</Text>
                <Text style={styles.subtitle}>Boulder {boulderColor}</Text>

                {/* Attempts Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Attempts</Text>
                    <View style={styles.counterRow}>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => setAttempts(Math.max(1, attempts - 1))}>
                            <Ionicons name="remove" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.counterText}>{attempts}</Text>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => setAttempts(attempts + 1)}>
                            <Ionicons name="add" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Style Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Style</Text>
                    <View style={styles.styleRow}>
                        {['Flash', 'Onsight', 'Top'].map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.styleBtn, style === s && styles.styleBtnActive]}
                                onPress={() => setStyle(s)}
                            >
                                <Text style={[styles.styleBtnText, style === s && styles.styleBtnTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notes Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="e.g., Slipped at the topout, but the crux felt easy."
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save to Logbook</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    scroll: { padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
    section: { marginBottom: 25 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
    counterRow: { flexDirection: 'row', alignItems: 'center' },
    circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
    counterText: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 20, minWidth: 30, textAlign: 'center' },
    styleRow: { flexDirection: 'row', justifyContent: 'space-between' },
    styleBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
    styleBtnActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    styleBtnText: { color: '#666', fontWeight: '500' },
    styleBtnTextActive: { color: '#fff', fontWeight: 'bold' },
    textArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, height: 100, textAlignVertical: 'top' },
    saveBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});