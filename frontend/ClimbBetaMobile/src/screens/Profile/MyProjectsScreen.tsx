import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMySavedProjects, type SavedBoulderDTO } from '../../services/profileService';

/**
 * Saved target climbing routes panel ("Projects").
 *
 * Fetches bookmarked route data parameters dynamically. Utilizes
 * native focus side-effects to guarantee immediate synchronization with mutated lists
 * whenever the user steps backward into the view stack context.
 */
export default function MyProjectsScreen() {
    const [projects, setProjects] = useState<SavedBoulderDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    /**
     * Viewport focus observer wrapper. Clears memory-allocated flags
     * on component transitions to block stale asynchronous set state updates.
     */
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchProjects = async () => {
                setLoading(true);
                try {
                    const data = await getMySavedProjects();
                    if (isActive) {
                        setProjects(data);
                    }
                } catch (error) {
                    console.error('Error loading saved projects:', error);
                } finally {
                    if (isActive) {
                        setLoading(false);
                    }
                }
            };

            fetchProjects();

            return () => {
                isActive = false;
            };
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>
                You have {projects.length} pending routes. Time to train! 🔥
            </Text>
            <View style={styles.grid}>
                {projects.map(proj => (
                    <TouchableOpacity
                        key={proj.id}
                        style={styles.card}
                        onPress={() => navigation.navigate('Explore', { screen: 'BoulderDetails', params: { boulderId: proj.id, gymId: proj.gymId }})}
                    >
                        <ImageBackground
                            source={{ uri: proj.imageUrl || 'https://via.placeholder.com/400x400/cccccc/ffffff?text=No+Photo' }}
                            style={styles.cardImage}
                            imageStyle={{ borderRadius: 10 }}
                        >
                            <View style={styles.overlay}>
                                <Text style={styles.gradeBadge}>{proj.grade}</Text>
                                <Text style={styles.projName}>Route {proj.color}</Text>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EEF3EC', padding: 15 },
    center: { justifyContent: 'center', alignItems: 'center' },
    headerText: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', height: 200, marginBottom: 15 },
    cardImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
    overlay: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
    gradeBadge: { color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    projName: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});