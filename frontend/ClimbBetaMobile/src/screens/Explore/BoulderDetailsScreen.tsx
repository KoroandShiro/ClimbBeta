import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BoulderDetailsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=800&q=80' }} 
        style={styles.croquiImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.boulderTitle}>Azul Overhang</Text>
          <Text style={styles.boulderGrade}>V6</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="bookmark-outline" size={24} color="#2E7D32" />
            <Text style={styles.actionText}>Guardar Projeto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Registar Beta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>🏆 Leaderboard Global</Text>
        
        <View style={styles.leaderboardCard}>
          <View style={styles.rankRow}>
            <Text style={styles.rank}>1º</Text>
            <Text style={styles.climberName}>Rúben Duarte</Text>
            <Text style={styles.climberScore}>Flash ✨</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rankRow}>
            <Text style={styles.rank}>2º</Text>
            <Text style={styles.climberName}>Gonçalo Matos</Text>
            <Text style={styles.climberScore}>2 Tentativas</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rankRow}>
            <Text style={styles.rank}>3º</Text>
            <Text style={styles.climberName}>Ana Silva</Text>
            <Text style={styles.climberScore}>5 Tentativas</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  croquiImage: { width: '100%', height: 300, justifyContent: 'flex-end' },
  overlay: { padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  boulderTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  boulderGrade: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, marginHorizontal: 5 },
  actionText: { fontWeight: 'bold', marginLeft: 8, color: '#2E7D32' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  leaderboardCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rank: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', width: 40 },
  climberName: { flex: 1, fontSize: 16, color: '#333' },
  climberScore: { fontSize: 14, fontWeight: 'bold', color: '#777' },
  divider: { height: 1, backgroundColor: '#eee' }
});