// src/screens/Outdoor/OutdoorCreateScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createOutdoorRoute, OutdoorRoute } from '../../services/outdoorService';

export default function OutdoorCreateScreen({ navigation, route }: any) {
    const existing: OutdoorRoute[] = route.params?.existingRoutes ?? [];

    const [name, setName] = useState('');
    const [sector, setSector] = useState('');
    const [location, setLocation] = useState('');
    const [grade, setGrade] = useState('');
    const [loading, setLoading] = useState(false);

    function checkDuplicates() {
        const qName = name.trim().toLowerCase();
        const qLocation = location.trim().toLowerCase();
        return existing.some(r => {
            if (r.name && r.name.toLowerCase() === qName && qName.length > 0) return true;
            if (r.location && qLocation && r.location.toLowerCase().includes(qLocation)) return true;
            return false;
        });
    }

    async function submit() {
        if (!name.trim()) {
            Alert.alert('Validação', 'Preenche o nome da rocha');
            return;
        }
        if (!sector.trim()) {
            Alert.alert('Validação', 'Preenche o setor da rocha');
            return;
        }
        if (!location.trim()) {
            Alert.alert('Validação', 'Preenche a localização');
            return;
        }
        if (checkDuplicates()) {
            Alert.alert('Possível duplicado', 'Já existe uma rocha com nome/local semelhante. Verifica antes de criar.');
            return;
        }
        try {
            setLoading(true);
            await createOutdoorRoute({ name, sector, location, grade });
            Alert.alert('Sucesso', 'Rocha criada', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (e: any) {
            Alert.alert('Erro', e?.message ?? 'Erro ao criar rocha (verifica os campos e credenciais).');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome da rocha" />

            <Text style={styles.label}>Sector</Text>
            <TextInput style={styles.input} value={sector} onChangeText={setSector} placeholder="Sector (obrigatório)" />

            <Text style={styles.label}>Localização</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Ex: Peninha, Sintra" />

            <Text style={styles.label}>Grade</Text>
            <TextInput style={styles.input} value={grade} onChangeText={setGrade} placeholder="V4, V5..." />

            <TouchableOpacity style={[styles.btn, { opacity: loading ? 0.6 : 1 }]} onPress={submit} disabled={loading}>
                <Text style={{ color: 'white' }}>{loading ? 'A criar...' : 'Criar Rocha'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 12, backgroundColor: '#fff', flex: 1 },
    label: { marginTop: 10, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 6, marginTop: 6 },
    btn: { marginTop: 18, backgroundColor: '#2E7D32', padding: 12, borderRadius: 8, alignItems: 'center' },
});
