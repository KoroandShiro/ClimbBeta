import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';

const SAVED_PROJECTS = [
  { id: '1', name: 'Azul Overhang', grade: 'V6', gym: 'Vertical Wall', image: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Amarelo Slab', grade: 'V5', gym: 'Vertigo', image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=400&q=80' },
];

export default function MyProjectsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Tens {SAVED_PROJECTS.length} vias pendentes. Toca a treinar! 🔥</Text>
      
      <View style={styles.grid}>
        {SAVED_PROJECTS.map(proj => (
          <TouchableOpacity key={proj.id} style={styles.card}>
            <ImageBackground source={{ uri: proj.image }} style={styles.cardImage} imageStyle={{ borderRadius: 10 }}>
              <View style={styles.overlay}>
                <Text style={styles.gradeBadge}>{proj.grade}</Text>
                <Text style={styles.projName}>{proj.name}</Text>
                <Text style={styles.gymName}>{proj.gym}</Text>
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
  headerText: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', height: 200, marginBottom: 15 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  gradeBadge: { color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  projName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  gymName: { color: '#ccc', fontSize: 12 }
});