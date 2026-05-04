import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getOutdoorRoutes, OutdoorRoute } from '../../services/outdoorService';
import OutdoorMap from '../../components/OutdoorMap'; // resolverá para .web / .native

export default function OutdoorScreen({ navigation }: any) {
    const [routes, setRoutes] = useState<OutdoorRoute[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOutdoorRoutes();
            setRoutes(data);
        } catch (e: any) {
            setError(e?.message ?? 'Erro ao carregar vias outdoor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return routes;
        return routes.filter(r =>
            (r.name || '').toLowerCase().includes(q) ||
            (r.sector || '').toLowerCase().includes(q) ||
            (r.location || '').toLowerCase().includes(q)
        );
    }, [routes, query]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.search}>
                    <Ionicons name="search" size={18} color="#777" />
                    <TextInput style={styles.input} placeholder="Pesquisar rochas, setor, local..." value={query} onChangeText={setQuery} />
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.mapToggle} onPress={() => setShowMap(v => !v)}>
                        <Ionicons name={showMap ? 'list' : 'map'} size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('OutdoorCreate', { existingRoutes: routes })}>
                        <Text style={{ color: 'white' }}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading && <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />}
            {error && <Text style={{ color: 'red', margin: 10 }}>{error}</Text>}

            {showMap ? (
                <View style={{ flex: 1 }}>
                    <OutdoorMap routes={filtered} onSelect={(id: number) => navigation.navigate('OutdoorDetails', { routeId: id })} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OutdoorDetails', { routeId: item.id })}>
                            <View>
                                <Text style={styles.title}>{item.name}</Text>
                                <Text style={styles.sub}>{item.sector ?? ''} • {item.location ?? ''} • {item.grade ?? ''}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ padding: 12 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between' },
    search: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f3f3', padding: 8, borderRadius: 8, marginRight: 8 },
    input: { marginLeft: 8, flex: 1 },
    addBtn: { backgroundColor: '#06b6d4', padding: 10, borderRadius: 8 },
    mapToggle: { backgroundColor: '#2E7D32', padding: 10, borderRadius: 8, marginRight: 8 },
    card: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 16, fontWeight: '600' },
    sub: { color: '#666', marginTop: 6 },
});
