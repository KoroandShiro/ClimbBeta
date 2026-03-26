import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dados falsos dos Boulders deste ginásio
const MOCK_BOULDERS = [
  { id: '1', color: 'Vermelho', hex: '#E53935', grade: 'V4', setter: 'João P.', status: 'Novo' },
  { id: '2', color: 'Azul', hex: '#1E88E5', grade: 'V6', setter: 'Ana S.', status: 'Ativo' },
  { id: '3', color: 'Verde', hex: '#43A047', grade: 'V2', setter: 'Rúben', status: 'Ativo' },
  { id: '4', color: 'Amarelo', hex: '#FDD835', grade: 'V5', setter: 'João P.', status: 'A sair' },
];

export default function GymDetailsScreen({ route, navigation }: any) {
  // Recebe o nome do ginásio que foi clicado no ecrã anterior
  const gymName = route.params?.gymName || 'Ginásio Desconhecido';

  return (
    <View style={styles.container}>
      {/* Cabeçalho do Ginásio */}
      <View style={styles.header}>
        <Text style={styles.title}>{gymName}</Text>
        <Text style={styles.subtitle}>Catálogo de Vias • 120 Boulders Ativos</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Boulders Recentes</Text>

        {MOCK_BOULDERS.map((boulder) => (
          <TouchableOpacity 
            key={boulder.id} 
            style={styles.boulderCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BoulderDetails')}
          >
            
            {/* Cor do Boulder */}
            <View style={[styles.colorIndicator, { backgroundColor: boulder.hex }]} />
            
            {/* Informação */}
            <View style={styles.boulderInfo}>
              <Text style={styles.gradeText}>{boulder.grade}</Text>
              <Text style={styles.detailsText}>{boulder.color} • Setter: {boulder.setter}</Text>
              {boulder.status === 'Novo' && (
                <View style={styles.badge}><Text style={styles.badgeText}>NOVO</Text></View>
              )}
            </View>

            {/* Botão de Registar (O atalho rápido) */}
            <TouchableOpacity 
              style={styles.logButton}
              onPress={() => {
                navigation.navigate('Logbook', { 
                  screen: 'IndoorLog',
                  params: { prefilledGym: gymName, prefilledGrade: boulder.grade }
                });
              }}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.logButtonText}>Registar</Text>
            </TouchableOpacity>
            
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  
  content: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  
  boulderCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  colorIndicator: { width: 20, height: 50, borderRadius: 10, marginRight: 15 },
  
  boulderInfo: { flex: 1 },
  gradeText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  detailsText: { fontSize: 13, color: '#777', marginTop: 2 },
  
  badge: { backgroundColor: '#FF9800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  
  logButton: { flexDirection: 'row', backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', zIndex: 10 },
  logButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 13 }
});