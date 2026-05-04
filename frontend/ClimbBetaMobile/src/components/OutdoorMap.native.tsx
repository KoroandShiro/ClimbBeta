// src/components/OutdoorMap.native.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OutdoorMapNative({ routes, onSelect }: any) {
    if (!routes || routes.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Nenhuma rota outdoor disponível</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={routes}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => onSelect(item.id)}
                    >
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <View style={styles.row}>
                                <Ionicons name="location" size={14} color="#666" />
                                <Text style={styles.detail}>{item.location}</Text>
                            </View>
                            <Text style={styles.detail}>{item.sector} · {item.grade}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    card: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    detail: { marginLeft: 4, color: '#666', fontSize: 13 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    listContent: { padding: 12 },
});
