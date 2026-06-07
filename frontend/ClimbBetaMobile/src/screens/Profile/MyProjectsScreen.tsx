import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMySavedProjects, type SavedBoulderDTO } from '../../services/profileService';

export default function MyProjectsScreen() {
  const [projects, setProjects] = useState<SavedBoulderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  // O useFocusEffect garante que atualizamos a lista sempre que o utilizador abre este separador
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
          console.error('Erro ao carregar projetos guardados:', error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchProjects();

      return () => {
        isActive = false; // Limpeza se o utilizador sair do ecrã antes de o fetch terminar
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
        Tens {projects.length} vias pendentes. Toca a treinar! 🔥
      </Text>
      <View style={styles.grid}>
        {projects.map(proj => (
          <TouchableOpacity 
            key={proj.id} 
            style={styles.card}
            onPress={() => navigation.navigate('Explore', { screen: 'BoulderDetails', params: { boulderId: proj.id, gymId: proj.gymId }})} // <-- ADICIONAR ISTO
          >
            <ImageBackground 
              source={{ uri: proj.imageUrl || 'https://via.placeholder.com/400x400/cccccc/ffffff?text=Sem+Foto' }} 
              style={styles.cardImage} 
              imageStyle={{ borderRadius: 10 }}
            >
              <View style={styles.overlay}>
                <Text style={styles.gradeBadge}>{proj.grade}</Text>
                <Text style={styles.projName}>Via {proj.color}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', height: 200, marginBottom: 15 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  gradeBadge: { color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  projName: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});