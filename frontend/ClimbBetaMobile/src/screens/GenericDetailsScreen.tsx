import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GenericDetailsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Screen Under Construction 🚧</Text>
            <Text>Database data will appear here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});