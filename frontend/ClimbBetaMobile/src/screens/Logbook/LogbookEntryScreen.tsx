import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

/**
 * Navigation routing router dashboard gateway.
 *
 * Offers clear structural branch alternatives partitioning the session logging activity
 * funnel between commercial indoor facility modules and raw outdoor rock locations.
 */
export default function LogbookEntryScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Entry</Text>
            <Text style={{ marginBottom: 20 }}>Where did you climb today?</Text>

            <Button title="🧗‍♂️ Gym (Indoor)" onPress={() => navigation.navigate('IndoorLog')} />
            <View style={{ height: 20 }} />
            <Button title="⛰️ Rock (Outdoor)" onPress={() => navigation.navigate('OutdoorLog')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold' }
});