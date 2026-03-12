import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dados falsos dos ginásios que o utilizador "segue"
const MY_GYMS = [
  {
    id: '1',
    name: 'Vertical Wall',
    location: 'Lisboa',
    routesCount: 120,
    imageUrl: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    name: 'Vertigo Rocódromo',
    location: 'Lisboa',
    routesCount: 85,
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80',
  }
];

export default function ExploreScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      
      {/* 1. Barra de Pesquisa no Topo */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Pesquisar novos ginásios..." 
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        
        {/* Título da Secção */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Os Meus Ginásios</Text>
          <Ionicons name="bookmark" size={20} color="#2E7D32" />
        </View>

        <Text style={styles.sectionSubtitle}>Ginásios que segues para ver o catálogo de vias.</Text>

        {/* 2. Lista de Ginásios em Caixas Clicáveis */}
        {MY_GYMS.map((gym) => (
          <TouchableOpacity 
            key={gym.id} 
            activeOpacity={0.8}
            style={styles.gymCard}
            onPress={() => navigation.navigate('GymDetails', { gymName: gym.name })}
          >
            <ImageBackground 
              source={{ uri: gym.imageUrl }} 
              style={styles.cardImage}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={styles.cardOverlay}>
                <View>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#fff" />
                    <Text style={styles.gymLocation}>{gym.location}</Text>
                  </View>
                </View>
                
                <View style={styles.routesBadge}>
                  <Text style={styles.routesText}>{gym.routesCount} vias</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}

        {/* Botão extra para simular exploração num Mapa */}
        <TouchableOpacity style={styles.mapButton} onPress={() => alert('Abriria o Google Maps com ginásios próximos!')}>
          <Ionicons name="map-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.mapButtonText}>Ver Ginásios no Mapa</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  
  // Header & Search
  header: { backgroundColor: '#fff', padding: 15, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 10, height: 45 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  // Content
  content: { padding: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sectionSubtitle: { fontSize: 14, color: '#666', marginTop: 5, marginBottom: 20 },

  // Gym Cards
  gymCard: { height: 160, marginBottom: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  cardOverlay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  
  gymName: { fontSize: 20, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  gymLocation: { color: '#ddd', fontSize: 14, marginLeft: 4 },
  
  routesBadge: { backgroundColor: '#2E7D32', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  routesText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // Map Button
  mapButton: { flexDirection: 'row', backgroundColor: '#333', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 40 },
  mapButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});