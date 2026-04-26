import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logAscent } from '../../services/ascentService';

export default function LogAscentScreen({ route, navigation }: any) {
    const boulderId = route.params?.boulderId;
    const boulderColor = route.params?.boulderColor || 'Este Boulder';

    const [attempts, setAttempts] = useState(1);
    const [style, setStyle] = useState('Top'); // Flash, Onsight, Top
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

            await logAscent({
                boulderId: boulderId,
                date: today,
                attempts: attempts,
                style: style,
                notes: notes,
            });

            Alert.alert("Sucesso!", "Subida registada no teu Logbook com sucesso! 🧗‍♂️", [
                { text: "Boa!", onPress: () => navigation.goBack() } // Volta ao ginásio
            ]);
        } catch (error: any) {
            Alert.alert("Erro ao gravar", error.message || "Tenta novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Registar Subida</Text>
                <Text style={styles.subtitle}>Boulder {boulderColor}</Text>

                {/* Secção de Tentativas */}
                <View style={styles.section}>
                    <Text style={styles.label}>Tentativas</Text>
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

                {/* Secção de Estilo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Estilo</Text>
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

                {/* Secção de Notas */}
                <View style={styles.section}>
                    <Text style={styles.label}>Notas (Opcional)</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Ex: Escorreguei na saída, mas o crux foi fácil."
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Botão de Gravar */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Gravar no Logbook</Text>}
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