import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../theme';

/**
 * Entry point of the "New log" flow: lets the climber pick where they climbed
 * before routing into the hybrid FreeLog screen (non-partner gym or outdoor rock).
 */
export default function LogbookEntryScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Entry</Text>
            <Text style={styles.subtitle}>Where did you climb today?</Text>

            <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => navigation.navigate('FreeLog', { initialMode: 'GYM' })}
            >
                <Ionicons name="business" size={22} color={colors.primary} />
                <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>Gym (non-partner)</Text>
                    <Text style={styles.optionSub}>Log a session at any gym</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => navigation.navigate('FreeLog', { initialMode: 'ROCK' })}
            >
                <Ionicons name="trail-sign" size={22} color={colors.primary} />
                <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>Rock (outdoor)</Text>
                    <Text style={styles.optionSub}>Log an outdoor climb</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.page, padding: 20, justifyContent: 'center' },
    title: { fontSize: 26, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
    subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 28 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 18, marginBottom: 14 },
    optionTextWrap: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    optionSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
