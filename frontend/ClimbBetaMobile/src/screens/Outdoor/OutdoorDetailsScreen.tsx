// src/screens/Outdoor/OutdoorDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getOutdoorRouteById } from '../../services/outdoorService';

export default function OutdoorDetailsScreen({ route }: any) {
    const id = route.params?.routeId;
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await getOutdoorRouteById(id);
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

    if (!data) return <Text style={{ margin: 12 }}>Rota não encontrada</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{data.name}</Text>
            <Text style={styles.row}>Sector: {data.sector}</Text>
            <Text style={styles.row}>Localização: {data.location}</Text>
            <Text style={styles.row}>Grade: {data.grade}</Text>
            {/* se tiveres coords, mostra mapa pequeno */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 12, backgroundColor: '#fff', flex: 1 },
    title: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
    row: { marginTop: 6, color: '#444' },
});
