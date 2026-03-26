import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      
      {/* 1. Cabeçalho do Perfil */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>Gonçalo Matos</Text>
        <Text style={styles.username}>@gmatos_climb</Text>
        <Text style={styles.bio}>Viciado em calcanhares e regletes. 🧗‍♂️</Text>
      </View>

      {/* 2. Estatísticas Rápidas (Tabela climber_profiles e ascents) */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>Ascensões</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>V6</Text>
          <Text style={styles.statLabel}>Grau Máx</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>+2cm</Text>
          <Text style={styles.statLabel}>Ape Index</Text>
        </View>
      </View>

      {/* 3. Botões de Ação (Tabelas saved_boulders e favorite_climbers) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('MyProjects')}
        >
          <Ionicons name="bookmark" size={28} color="#2E7D32" />
          <Text style={styles.actionTitle}>Projetos Guardados</Text>
          <Text style={styles.actionSub}>12 vias pendentes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => alert('Abriria a lista de amigos!')}
        >
          <Ionicons name="people" size={28} color="#1976D2" />
          <Text style={styles.actionTitle}>Os Meus Amigos</Text>
          <Text style={styles.actionSub}>24 a seguir</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Lista de Histórico (Dummy data) */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Últimas Ascensões</Text>
        
        <View style={styles.historyItem}>
          <View style={styles.historyIcon}><Ionicons name="checkmark-done" size={20} color="#fff" /></View>
          <View style={styles.historyText}>
            <Text style={styles.historyRoute}>Vermelho Inclinado (V4)</Text>
            <Text style={styles.historyGym}>Vertigo Rocódromo • Flash</Text>
          </View>
        </View>

        <View style={styles.historyItem}>
          <View style={styles.historyIcon}><Ionicons name="image" size={20} color="#fff" /></View>
          <View style={styles.historyText}>
            <Text style={styles.historyRoute}>O Grande Teto (7a)</Text>
            <Text style={styles.historyGym}>Sintra (Outdoor) • 3 Tentativas</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  
  // Header Styles
  header: { alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, backgroundColor: '#e0e0e0' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  username: { fontSize: 16, color: '#777', marginBottom: 5 },
  bio: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },

  // Stats Styles
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', marginTop: 2, paddingVertical: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 13, color: '#777', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#e0e0e0', height: '80%', alignSelf: 'center' },

  // Actions Styles
  actionsContainer: { flexDirection: 'row', padding: 15, gap: 15 },
  actionCard: { 
    flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, 
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 
  },
  actionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  actionSub: { fontSize: 12, color: '#777', marginTop: 4 },

  // History Styles
  historySection: { padding: 20 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  historyItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  historyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyText: { flex: 1 },
  historyRoute: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyGym: { fontSize: 13, color: '#777', marginTop: 2 },
});