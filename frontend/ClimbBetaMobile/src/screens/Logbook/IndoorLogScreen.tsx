import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function IndoorLogScreen({ navigation }: any) {
    const [gymName, setGymName] = useState('');
    const [grade, setGrade] = useState('');
    const [style, setStyle] = useState('Flash');

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Indoor Register (Free Log)</Text>

            <Text style={styles.label}>Gym name (optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Vertigo, 9.8 Gravity..."
                value={gymName}
                onChangeText={setGymName}
            />

            <Text style={styles.label}>Grade / Difficulty</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., V4, 6a, Blue..."
                value={grade}
                onChangeText={setGrade}
            />

            <Text style={styles.label}>Style of Ascent</Text>
            <View style={styles.row}>
                {['Flash', 'Redpoint', 'Top'].map((s) => (
                    <TouchableOpacity
                        key={s}
                        style={[styles.chip, style === s && styles.chipActive]}
                        onPress={() => setStyle(s)}
                    >
                        <Text style={[styles.chipText, style === s && styles.chipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Notes / Beta</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Left heel on the giant hold and pray..."
                multiline
            />

            <View style={styles.buttonContainer}>
                <Button title="📸 Attach Beta Photo" color="#757575" onPress={() => alert('Would open the camera!')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Log Ascent" color="#2E7D32" onPress={() => {
                    alert('Ascent logged successfully!');
                    navigation.navigate('Feed'); // Redirects to Feed screen
                }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5, color: '#555' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
    row: { flexDirection: 'row', gap: 10, marginTop: 5 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0' },
    chipActive: { backgroundColor: '#2E7D32' },
    chipText: { color: '#333', fontWeight: 'bold' },
    chipTextActive: { color: '#fff' },
    buttonContainer: { marginTop: 20 }
});